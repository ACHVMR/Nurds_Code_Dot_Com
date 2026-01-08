/**
 * Auth Routes for Cloudflare Workers
 * OAuth, login, logout, and session management
 */

import { Router } from 'itty-router';
import { jsonResponse, successResponse, redirectResponse } from '../utils/responses.js';
import { badRequest, unauthorized } from '../utils/errors.js';
import { 
  getAuthorizationUrl, 
  exchangeCodeForTokens, 
  getUserInfo, 
  createSession 
} from '../services/oauth.js';
import { getSupabaseClient } from '../services/supabase.js';

const router = Router({ base: '/api/auth' });

/**
 * GET /api/auth/me - Get current user
 */
router.get('/me', async (request, env, ctx) => {
  if (!ctx.user) {
    return unauthorized('Not authenticated');
  }

  const supabase = getSupabaseClient(env);
  const { data: user } = await supabase
    .from('users')
    .select('id, email, name, avatar_url, created_at')
    .eq('id', ctx.user.userId)
    .single();

  return successResponse(user);
});

/**
 * GET /api/auth/google - Start Google OAuth
 */
router.get('/google', async (request, env) => {
  const url = new URL(request.url);
  const redirectUri = `${url.origin}/api/auth/google/callback`;
  const authUrl = getAuthorizationUrl('google', env, redirectUri);
  
  return redirectResponse(authUrl);
});

/**
 * GET /api/auth/google/callback - Google OAuth callback
 */
router.get('/google/callback', async (request, env) => {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error) {
    return redirectResponse(`${url.origin}/auth?error=${error}`);
  }

  if (!code) {
    return redirectResponse(`${url.origin}/auth?error=no_code`);
  }

  try {
    const redirectUri = `${url.origin}/api/auth/google/callback`;
    const tokens = await exchangeCodeForTokens('google', code, env, redirectUri);
    const userInfo = await getUserInfo('google', tokens.access_token);
    
    const supabase = getSupabaseClient(env);
    const session = await createSession(userInfo, supabase, env);

    // Redirect with token in URL (client will store it)
    return redirectResponse(
      `${url.origin}/auth/callback?token=${session.token}&user=${encodeURIComponent(JSON.stringify(session.user))}`
    );
  } catch (err) {
    console.error('[Auth] Google OAuth error:', err);
    return redirectResponse(`${url.origin}/auth?error=oauth_failed`);
  }
});

/**
 * GET /api/auth/github - Start GitHub OAuth
 */
router.get('/github', async (request, env) => {
  const url = new URL(request.url);
  const redirectUri = `${url.origin}/api/auth/github/callback`;
  const authUrl = getAuthorizationUrl('github', env, redirectUri);
  
  return redirectResponse(authUrl);
});

/**
 * GET /api/auth/github/callback - GitHub OAuth callback
 */
router.get('/github/callback', async (request, env) => {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error) {
    return redirectResponse(`${url.origin}/auth?error=${error}`);
  }

  if (!code) {
    return redirectResponse(`${url.origin}/auth?error=no_code`);
  }

  try {
    const redirectUri = `${url.origin}/api/auth/github/callback`;
    const tokens = await exchangeCodeForTokens('github', code, env, redirectUri);
    const userInfo = await getUserInfo('github', tokens.access_token);
    
    const supabase = getSupabaseClient(env);
    const session = await createSession(userInfo, supabase, env);

    return redirectResponse(
      `${url.origin}/auth/callback?token=${session.token}&user=${encodeURIComponent(JSON.stringify(session.user))}`
    );
  } catch (err) {
    console.error('[Auth] GitHub OAuth error:', err);
    return redirectResponse(`${url.origin}/auth?error=oauth_failed`);
  }
});

/**
 * POST /api/auth/logout - Logout user
 */
router.post('/logout', async (request, env, ctx) => {
  // For JWT-based auth, client just needs to delete the token
  // If we had refresh tokens in DB, we'd invalidate them here
  return successResponse({ loggedOut: true });
});

/**
 * POST /api/auth/refresh - Refresh token
 */
router.post('/refresh', async (request, env, ctx) => {
  if (!ctx.user) {
    return unauthorized('Not authenticated');
  }

  // Generate new token with same user
  const { generateToken } = await import('../utils/jwt.js');
  const token = generateToken(ctx.user.userId, env.JWT_SECRET);

  return successResponse({
    token,
    expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000),
  });
});

export { router as authRouter };
