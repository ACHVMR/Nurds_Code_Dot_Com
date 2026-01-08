/**
 * Module Access Control Middleware
 * Cloudflare D1 Edge Entitlement Checking
 * 
 * Validates user has access to requested module before routing
 * to Cloud Run II-Agent workers.
 */

import { jsonResponse } from '../utils/responses.js';

// Module ID to route path mapping
const MODULE_ROUTE_MAP = {
  'boomer': 'boomer_ang',
  'vibe': 'vibe_ide',
  'circuit': 'circuit_box',
  'grounding': 'grounding',
  'voice': 'voice_studio',
  'agents': null, // Sub-routes handled separately
  'plus1': 'plus1',
  'kie': 'kie_vision',
  'orchestrate': null, // Core route, no module check
};

// Public routes that skip module access check
const PUBLIC_ROUTES = ['auth', 'user', 'public', 'health', 'orchestrate'];

/**
 * Extract module ID from request path
 * Path format: /api/v1/{module_id}/...
 */
function getModuleFromPath(path) {
  const pathParts = path.split('/').filter(Boolean);
  
  // /api/v1/{module}/... → module is index 2
  if (pathParts.length >= 3 && pathParts[0] === 'api' && pathParts[1] === 'v1') {
    return pathParts[2];
  }
  
  // /api/{module}/... → module is index 1
  if (pathParts.length >= 2 && pathParts[0] === 'api') {
    return pathParts[1];
  }
  
  return null;
}

/**
 * Check if user has access to a module
 */
async function checkUserModuleAccess(env, userId, moduleId) {
  if (!env.DB) {
    console.warn('[ModuleAccess] D1 not configured, allowing access');
    return { hasAccess: true, reason: 'D1_NOT_CONFIGURED' };
  }

  try {
    const { results } = await env.DB.prepare(
      `SELECT status, expires_at FROM user_module_access 
       WHERE user_id = ? AND module_id = ?`
    ).bind(userId, moduleId).all();

    if (!results || results.length === 0) {
      return { hasAccess: false, reason: 'NOT_UNLOCKED' };
    }

    const access = results[0];
    
    // Check if expired
    if (access.expires_at && access.expires_at < Math.floor(Date.now() / 1000)) {
      return { hasAccess: false, reason: 'EXPIRED' };
    }

    // Check if suspended
    if (access.status !== 'active') {
      return { hasAccess: false, reason: 'SUSPENDED' };
    }

    return { hasAccess: true, reason: 'ACTIVE' };
  } catch (error) {
    console.error('[ModuleAccess] D1 query error:', error);
    // Fail open for now (allow access on error)
    return { hasAccess: true, reason: 'ERROR_FAIL_OPEN' };
  }
}

/**
 * Get module details from D1
 */
async function getModuleDetails(env, moduleId) {
  if (!env.DB) return null;

  try {
    const { results } = await env.DB.prepare(
      `SELECT * FROM modules WHERE id = ? AND is_active = 1`
    ).bind(moduleId).all();

    return results?.[0] || null;
  } catch (error) {
    console.error('[ModuleAccess] getModuleDetails error:', error);
    return null;
  }
}

/**
 * Get user progression from D1
 */
async function getUserProgression(env, userId) {
  if (!env.DB) {
    return { current_level: 1, credits_balance: 0, tier: 'free' };
  }

  try {
    const { results } = await env.DB.prepare(
      `SELECT * FROM user_progression WHERE user_id = ?`
    ).bind(userId).all();

    if (!results || results.length === 0) {
      // Create new progression record
      await env.DB.prepare(
        `INSERT INTO user_progression (user_id) VALUES (?)`
      ).bind(userId).run();
      
      return { current_level: 1, credits_balance: 100, tier: 'free' };
    }

    return results[0];
  } catch (error) {
    console.error('[ModuleAccess] getUserProgression error:', error);
    return { current_level: 1, credits_balance: 0, tier: 'free' };
  }
}

/**
 * Log module usage to D1
 */
async function logModuleUsage(env, userId, moduleId, action, metadata = {}) {
  if (!env.DB) return;

  try {
    await env.DB.prepare(
      `INSERT INTO module_usage (user_id, module_id, action, tokens_used, cost_credits, latency_ms, model_used)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      userId,
      moduleId,
      action,
      metadata.tokens || 0,
      metadata.cost || 0,
      metadata.latency || 0,
      metadata.model || null
    ).run();
  } catch (error) {
    console.error('[ModuleAccess] logModuleUsage error:', error);
  }
}

/**
 * Module Access Middleware
 * Wraps a route handler with entitlement checking
 */
export function withModuleAccess(handler) {
  return async (request, env, ctx) => {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // Extract module from path
    const routeModule = getModuleFromPath(path);
    
    // Skip check for public routes
    if (!routeModule || PUBLIC_ROUTES.includes(routeModule)) {
      return handler(request, env, ctx);
    }
    
    // Map route to module ID
    const moduleId = MODULE_ROUTE_MAP[routeModule] || routeModule;
    
    // Get user ID from auth context (set by auth middleware)
    const userId = ctx?.userId || request.headers.get('x-user-id') || 'anonymous';
    
    // Skip check for anonymous users on free modules
    if (userId === 'anonymous') {
      // Only allow boomer_ang for anonymous
      if (moduleId !== 'boomer_ang') {
        return jsonResponse({
          error: 'Authentication Required',
          message: 'Please sign in to access this module.',
          action: 'LOGIN_REQUIRED',
          login_url: '/auth/login'
        }, 401);
      }
      return handler(request, env, ctx);
    }
    
    // Check module access
    const accessCheck = await checkUserModuleAccess(env, userId, moduleId);
    
    if (!accessCheck.hasAccess) {
      const module = await getModuleDetails(env, moduleId);
      const progression = await getUserProgression(env, userId);
      
      // Check if user meets level requirement
      const meetsLevel = !module || progression.current_level >= module.min_level_required;
      const canAfford = !module || progression.credits_balance >= module.unlock_cost_credits;
      
      return jsonResponse({
        error: 'Module Locked',
        message: `You have not unlocked ${module?.name || moduleId} yet.`,
        action: 'UNLOCK_REQUIRED',
        module_id: moduleId,
        module_name: module?.name,
        unlock_cost: module?.unlock_cost_credits || 0,
        min_level: module?.min_level_required || 1,
        user_level: progression.current_level,
        user_credits: progression.credits_balance,
        meets_level: meetsLevel,
        can_afford: canAfford,
        upgrade_url: `/dashboard/modules/${moduleId}`,
        reason: accessCheck.reason
      }, 403);
    }
    
    // Log usage (async, don't await)
    logModuleUsage(env, userId, moduleId, 'access').catch(() => {});
    
    // Add module context to request
    ctx.moduleId = moduleId;
    ctx.userId = userId;
    
    // Continue to handler
    return handler(request, env, ctx);
  };
}

/**
 * Create module access context headers for Cloud Run
 */
export function createModuleHeaders(ctx, tier = 'free') {
  return {
    'X-User-Id': ctx.userId || 'anonymous',
    'X-Module-Id': ctx.moduleId || 'unknown',
    'X-Plan-Tier': tier,
    'X-Request-Id': crypto.randomUUID(),
  };
}

export {
  checkUserModuleAccess,
  getModuleDetails,
  getUserProgression,
  logModuleUsage,
  getModuleFromPath
};
