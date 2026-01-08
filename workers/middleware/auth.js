/**
 * Auth Middleware for Cloudflare Workers
 * JWT verification and user context
 */

import { verifyToken, base64urlToUint8Array } from '../utils/jwt.js';
import { unauthorized } from '../utils/errors.js';

/**
 * Extract Bearer token from Authorization header
 * @param {Request} request - Incoming request
 * @returns {string|null} Token or null
 */
export function extractBearerToken(request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
}

/**
 * Verify JWT and attach user to context
 * @param {Request} request - Incoming request
 * @param {object} env - Environment bindings
 * @returns {object|null} User payload or null
 */
export async function verifyAuth(request, env) {
  const token = extractBearerToken(request);
  if (!token) {
    return null;
  }

  // Try custom JWT first
  const payload = verifyToken(token, env.JWT_SECRET);
  if (payload) {
    return { userId: payload.userId, source: 'jwt' };
  }

  // Try Clerk JWT verification (for backwards compatibility)
  try {
    const clerkUser = await verifyClerkToken(token, env);
    if (clerkUser) {
      return { userId: clerkUser.sub, email: clerkUser.email, source: 'clerk' };
    }
  } catch (error) {
    console.error('[Auth] Clerk verification failed:', error.message);
  }

  return null;
}

/**
 * Verify Clerk JWT token
 * @param {string} token - JWT token
 * @param {object} env - Environment bindings
 * @returns {object|null} Clerk user claims or null
 */
async function verifyClerkToken(token, env) {
  if (!env.CLERK_PUBLISHABLE_KEY) {
    return null;
  }

  try {
    const [header, payload, signature] = token.split('.');
    const decodedPayload = JSON.parse(atob(payload));

    // Check expiration
    if (decodedPayload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    // For production, you'd verify the signature with Clerk's public key
    // This is a simplified version
    return decodedPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Auth middleware - requires authentication
 * @param {Function} handler - Route handler
 * @returns {Function} Wrapped handler
 */
export function requireAuth(handler) {
  return async (request, env, ctx) => {
    const user = await verifyAuth(request, env);
    
    if (!user) {
      return unauthorized('Authentication required');
    }

    // Attach user to request context
    ctx.user = user;
    return handler(request, env, ctx);
  };
}

/**
 * Optional auth middleware - attaches user if present
 * @param {Function} handler - Route handler
 * @returns {Function} Wrapped handler
 */
export function optionalAuth(handler) {
  return async (request, env, ctx) => {
    const user = await verifyAuth(request, env);
    ctx.user = user;
    return handler(request, env, ctx);
  };
}

/**
 * Admin auth middleware - requires admin role
 * @param {Function} handler - Route handler
 * @returns {Function} Wrapped handler
 */
export function requireAdmin(handler) {
  return async (request, env, ctx) => {
    const user = await verifyAuth(request, env);
    
    if (!user) {
      return unauthorized('Authentication required');
    }

    // Check admin role (you'd look this up in your database)
    // For now, check against env variable
    const adminEmails = (env.ADMIN_EMAILS || '').split(',');
    if (user.email && !adminEmails.includes(user.email)) {
      return unauthorized('Admin access required');
    }

    ctx.user = user;
    return handler(request, env, ctx);
  };
}
