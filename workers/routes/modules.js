/**
 * Module Registry API Routes
 * Handles module listing, unlocking, and progression
 */

import { Router } from 'itty-router';
import { jsonResponse } from '../utils/responses.js';
import { getUserProgression, checkUserModuleAccess } from '../middleware/moduleAccess.js';

export const modulesRouter = Router({ base: '/api/modules' });

/**
 * GET /api/modules - List all available modules with user access status
 */
modulesRouter.get('/', async (request, env, ctx) => {
  const userId = ctx?.userId || request.headers.get('x-user-id') || 'anonymous';

  try {
    // Get all active modules
    const { results: modules } = await env.DB.prepare(
      `SELECT * FROM modules WHERE is_active = 1 ORDER BY min_level_required ASC`
    ).all();

    // Get user's unlocked modules
    const { results: userAccess } = await env.DB.prepare(
      `SELECT module_id, status, unlocked_at FROM user_module_access WHERE user_id = ?`
    ).bind(userId).all();

    // Get user progression
    const progression = await getUserProgression(env, userId);

    // Map access status to modules
    const accessMap = {};
    userAccess?.forEach(a => {
      accessMap[a.module_id] = a;
    });

    // Enhance modules with access status
    const enhancedModules = modules.map(module => ({
      ...module,
      access_status: accessMap[module.id]?.status || 'locked',
      unlocked_at: accessMap[module.id]?.unlocked_at || null,
      can_unlock: progression.current_level >= module.min_level_required,
      can_afford: progression.credits_balance >= module.unlock_cost_credits,
    }));

    return jsonResponse({
      modules: enhancedModules,
      user: {
        id: userId,
        level: progression.current_level,
        xp: progression.current_xp,
        credits: progression.credits_balance,
        tier: progression.tier,
      },
      total: modules.length,
      unlocked: userAccess?.filter(a => a.status === 'active').length || 0,
    });
  } catch (error) {
    console.error('[Modules] List error:', error);
    return jsonResponse({ error: 'Failed to fetch modules' }, 500);
  }
});

/**
 * GET /api/modules/:id - Get single module details
 */
modulesRouter.get('/:id', async (request, env, ctx) => {
  const { id } = request.params;
  const userId = ctx?.userId || 'anonymous';

  try {
    // Get module
    const { results } = await env.DB.prepare(
      `SELECT * FROM modules WHERE id = ?`
    ).bind(id).all();

    if (!results || results.length === 0) {
      return jsonResponse({ error: 'Module not found' }, 404);
    }

    const module = results[0];

    // Get prerequisites
    const { results: prereqs } = await env.DB.prepare(
      `SELECT m.* FROM module_prerequisites mp 
       JOIN modules m ON mp.required_module_id = m.id 
       WHERE mp.module_id = ?`
    ).bind(id).all();

    // Get user access
    const accessCheck = await checkUserModuleAccess(env, userId, id);
    const progression = await getUserProgression(env, userId);

    // Check if prerequisites are met
    let prereqsMet = true;
    for (const prereq of prereqs || []) {
      const prereqAccess = await checkUserModuleAccess(env, userId, prereq.id);
      if (!prereqAccess.hasAccess) {
        prereqsMet = false;
        break;
      }
    }

    return jsonResponse({
      module: {
        ...module,
        access_status: accessCheck.hasAccess ? 'active' : 'locked',
        can_unlock: progression.current_level >= module.min_level_required && prereqsMet,
        can_afford: progression.credits_balance >= module.unlock_cost_credits,
        prerequisites_met: prereqsMet,
      },
      prerequisites: prereqs || [],
      user: {
        level: progression.current_level,
        credits: progression.credits_balance,
      },
    });
  } catch (error) {
    console.error('[Modules] Get error:', error);
    return jsonResponse({ error: 'Failed to fetch module' }, 500);
  }
});

/**
 * POST /api/modules/:id/unlock - Unlock a module
 */
modulesRouter.post('/:id/unlock', async (request, env, ctx) => {
  const { id } = request.params;
  const userId = ctx?.userId || request.headers.get('x-user-id');

  if (!userId || userId === 'anonymous') {
    return jsonResponse({ error: 'Authentication required' }, 401);
  }

  try {
    // Get module
    const { results } = await env.DB.prepare(
      `SELECT * FROM modules WHERE id = ? AND is_active = 1`
    ).bind(id).all();

    if (!results || results.length === 0) {
      return jsonResponse({ error: 'Module not found' }, 404);
    }

    const module = results[0];

    // Check if already unlocked
    const accessCheck = await checkUserModuleAccess(env, userId, id);
    if (accessCheck.hasAccess) {
      return jsonResponse({ error: 'Module already unlocked' }, 400);
    }

    // Get user progression
    const progression = await getUserProgression(env, userId);

    // Check level requirement
    if (progression.current_level < module.min_level_required) {
      return jsonResponse({
        error: 'Level requirement not met',
        required_level: module.min_level_required,
        current_level: progression.current_level,
      }, 403);
    }

    // Check credits
    if (progression.credits_balance < module.unlock_cost_credits) {
      return jsonResponse({
        error: 'Insufficient credits',
        required_credits: module.unlock_cost_credits,
        current_credits: progression.credits_balance,
      }, 403);
    }

    // Check prerequisites
    const { results: prereqs } = await env.DB.prepare(
      `SELECT required_module_id FROM module_prerequisites WHERE module_id = ?`
    ).bind(id).all();

    for (const prereq of prereqs || []) {
      const prereqAccess = await checkUserModuleAccess(env, userId, prereq.required_module_id);
      if (!prereqAccess.hasAccess) {
        return jsonResponse({
          error: 'Prerequisites not met',
          missing_prerequisite: prereq.required_module_id,
        }, 403);
      }
    }

    // Deduct credits
    await env.DB.prepare(
      `UPDATE user_progression 
       SET credits_balance = credits_balance - ?, last_updated = strftime('%s', 'now')
       WHERE user_id = ?`
    ).bind(module.unlock_cost_credits, userId).run();

    // Grant access
    await env.DB.prepare(
      `INSERT INTO user_module_access (user_id, module_id, status, unlock_method)
       VALUES (?, ?, 'active', 'purchase')`
    ).bind(userId, id).run();

    // Log usage
    await env.DB.prepare(
      `INSERT INTO module_usage (user_id, module_id, action, cost_credits)
       VALUES (?, ?, 'unlock', ?)`
    ).bind(userId, id, module.unlock_cost_credits).run();

    return jsonResponse({
      success: true,
      message: `${module.name} unlocked successfully!`,
      module_id: id,
      credits_spent: module.unlock_cost_credits,
      credits_remaining: progression.credits_balance - module.unlock_cost_credits,
    });
  } catch (error) {
    console.error('[Modules] Unlock error:', error);
    return jsonResponse({ error: 'Failed to unlock module' }, 500);
  }
});

/**
 * GET /api/modules/user/progression - Get user progression details
 */
modulesRouter.get('/user/progression', async (request, env, ctx) => {
  const userId = ctx?.userId || request.headers.get('x-user-id');

  if (!userId || userId === 'anonymous') {
    return jsonResponse({ error: 'Authentication required' }, 401);
  }

  try {
    const progression = await getUserProgression(env, userId);

    // Calculate XP needed for next level
    const xpPerLevel = 1000;
    const xpToNextLevel = (progression.current_level * xpPerLevel) - progression.current_xp;

    // Get unlocked modules count
    const { results } = await env.DB.prepare(
      `SELECT COUNT(*) as count FROM user_module_access WHERE user_id = ? AND status = 'active'`
    ).bind(userId).all();

    // Parse badges
    let badges = [];
    try {
      badges = progression.badges ? JSON.parse(progression.badges) : [];
    } catch (e) {
      badges = [];
    }

    return jsonResponse({
      user_id: userId,
      level: progression.current_level,
      xp: progression.current_xp,
      xp_to_next_level: xpToNextLevel,
      total_hours: progression.total_hours,
      credits_balance: progression.credits_balance,
      tier: progression.tier,
      badges,
      modules_unlocked: results?.[0]?.count || 0,
    });
  } catch (error) {
    console.error('[Modules] Progression error:', error);
    return jsonResponse({ error: 'Failed to fetch progression' }, 500);
  }
});

/**
 * POST /api/modules/user/xp - Add XP to user (internal use)
 */
modulesRouter.post('/user/xp', async (request, env, ctx) => {
  const userId = ctx?.userId || request.headers.get('x-user-id');
  
  if (!userId || userId === 'anonymous') {
    return jsonResponse({ error: 'Authentication required' }, 401);
  }

  try {
    const body = await request.json();
    const { xp = 0, hours = 0, source = 'unknown' } = body;

    if (xp <= 0 && hours <= 0) {
      return jsonResponse({ error: 'XP or hours required' }, 400);
    }

    // Update progression
    await env.DB.prepare(
      `UPDATE user_progression 
       SET current_xp = current_xp + ?, 
           total_hours = total_hours + ?,
           last_updated = strftime('%s', 'now')
       WHERE user_id = ?`
    ).bind(xp, hours, userId).run();

    // Check for level up
    const progression = await getUserProgression(env, userId);
    const xpPerLevel = 1000;
    const newLevel = Math.floor(progression.current_xp / xpPerLevel) + 1;

    if (newLevel > progression.current_level) {
      // Level up!
      await env.DB.prepare(
        `UPDATE user_progression SET current_level = ? WHERE user_id = ?`
      ).bind(newLevel, userId).run();

      // Grant level-up credits (bonus)
      const levelUpBonus = newLevel * 25;
      await env.DB.prepare(
        `UPDATE user_progression 
         SET credits_balance = credits_balance + ? 
         WHERE user_id = ?`
      ).bind(levelUpBonus, userId).run();

      return jsonResponse({
        success: true,
        level_up: true,
        new_level: newLevel,
        credits_bonus: levelUpBonus,
        xp_added: xp,
        hours_added: hours,
      });
    }

    return jsonResponse({
      success: true,
      level_up: false,
      current_level: progression.current_level,
      xp_added: xp,
      hours_added: hours,
      total_xp: progression.current_xp + xp,
    });
  } catch (error) {
    console.error('[Modules] XP error:', error);
    return jsonResponse({ error: 'Failed to add XP' }, 500);
  }
});
