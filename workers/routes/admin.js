/**
 * Admin Routes for Cloudflare Workers
 * Administrative functions
 */

import { Router } from 'itty-router';
import { successResponse } from '../utils/responses.js';
import { unauthorized } from '../utils/errors.js';
import { requireAdmin } from '../middleware/auth.js';
import { getSupabaseClient } from '../services/supabase.js';

const router = Router({ base: '/api/admin' });

/**
 * GET /api/admin/stats - Get platform stats
 */
router.get('/stats', requireAdmin(async (request, env, ctx) => {
  const supabase = getSupabaseClient(env);

  // Get counts
  const [usersResult, agentsResult, projectsResult, subsResult] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('agents').select('id', { count: 'exact', head: true }),
    supabase.from('projects').select('id', { count: 'exact', head: true }),
    supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
  ]);

  return successResponse({
    users: usersResult.count || 0,
    agents: agentsResult.count || 0,
    projects: projectsResult.count || 0,
    activeSubscriptions: subsResult.count || 0,
  });
}));

/**
 * GET /api/admin/users - List users
 */
router.get('/users', requireAdmin(async (request, env, ctx) => {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '20');
  const offset = (page - 1) * limit;

  const supabase = getSupabaseClient(env);

  const { data, count } = await supabase
    .from('users')
    .select('id, email, name, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  return successResponse({
    users: data,
    pagination: {
      page,
      limit,
      total: count,
      pages: Math.ceil(count / limit),
    },
  });
}));

/**
 * GET /api/admin/usage - Get usage stats
 */
router.get('/usage', requireAdmin(async (request, env, ctx) => {
  const url = new URL(request.url);
  const days = parseInt(url.searchParams.get('days') || '30');

  const supabase = getSupabaseClient(env);
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data } = await supabase
    .from('usage_logs')
    .select('total_tokens, created_at')
    .gte('created_at', startDate.toISOString());

  // Aggregate by day
  const byDay = {};
  data?.forEach(log => {
    const day = log.created_at.split('T')[0];
    byDay[day] = (byDay[day] || 0) + (log.total_tokens || 0);
  });

  const totalTokens = data?.reduce((sum, log) => sum + (log.total_tokens || 0), 0) || 0;
  const totalMessages = data?.length || 0;

  return successResponse({
    summary: {
      totalTokens,
      totalMessages,
      period: `${days} days`,
    },
    daily: byDay,
  });
}));

/**
 * POST /api/admin/broadcast - Send broadcast message
 */
router.post('/broadcast', requireAdmin(async (request, env, ctx) => {
  const body = await request.json();
  const { title, message, userIds } = body;

  // For now, just log it. In production, you'd send emails/notifications
  console.log('[Admin] Broadcast:', { title, message, userIds });

  return successResponse({ sent: true });
}));

/**
 * GET /api/admin/health - Health check
 */
router.get('/health', async (request, env) => {
  const checks = {
    api: true,
    timestamp: new Date().toISOString(),
  };

  // Check Supabase
  try {
    const supabase = getSupabaseClient(env);
    await supabase.from('users').select('id').limit(1);
    checks.database = true;
  } catch (error) {
    checks.database = false;
    checks.databaseError = error.message;
  }

  // Check environment vars
  checks.env = {
    supabase: !!env.SUPABASE_URL,
    stripe: !!env.STRIPE_SECRET_KEY,
    openai: !!env.OPENAI_API_KEY,
    groq: !!env.GROQ_API_KEY,
  };

  return successResponse(checks);
});

export { router as adminRouter };
