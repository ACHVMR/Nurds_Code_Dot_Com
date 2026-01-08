/**
 * LUC Routes (Token Billing & Refund System)
 *
 * Base path: /api/v1/luc
 */

import { Router } from 'itty-router';
import { requireAuth } from '../middleware/auth.js';
import { jsonResponse } from '../utils/responses.js';
import {
  createLucSession,
  transitionLucSession,
  trackLucUsage,
  finalizeLucSession,
  extractTokenUsage,
  lucErrorResponse,
} from '../services/luc.js';

const lucRouter = Router({ base: '/api/v1/luc' });

// POST /api/v1/luc/session/init
lucRouter.post('/session/init', requireAuth(async (request, env, ctx) => {
  const sessionId = await createLucSession(env, ctx.user.userId);
  return jsonResponse({
    sessionId,
    phase: 'chat',
  });
}));

// POST /api/v1/luc/session/:sessionId/transition
lucRouter.post('/session/:sessionId/transition', requireAuth(async (request, env, ctx) => {
  const { sessionId } = request.params;
  const body = await request.json().catch(() => ({}));
  const toPhase = body?.toPhase || 'iteration';

  const result = await transitionLucSession(env, sessionId, ctx.user.userId, toPhase);
  if (!result.ok) return lucErrorResponse(result);

  return jsonResponse({
    sessionId,
    phase: result.session.current_phase,
    phaseTransitionAt: result.session.phase_transition_at || null,
  });
}));

// POST /api/v1/luc/session/:sessionId/track
// NOTE: Intended for server-side callers; client tracking is disabled by default.
lucRouter.post('/session/:sessionId/track', requireAuth(async (request, env, ctx) => {
  const { sessionId } = request.params;

  const allowClient = env.ALLOW_LUC_CLIENT_TRACKING === 'true';
  const internalToken = env.LUC_INTERNAL_TOKEN;
  const providedInternal = request.headers.get('X-LUC-Internal');

  if (!allowClient) {
    if (!internalToken || providedInternal !== internalToken) {
      return jsonResponse({ error: 'Token tracking is server-only' }, 403);
    }
  }

  const body = await request.json();
  const {
    provider,
    model,
    inputTokens,
    outputTokens,
    phase,
  } = body || {};

  const result = await trackLucUsage(env, {
    sessionId,
    userId: ctx.user.userId,
    provider: provider || 'unknown',
    model: model || 'unknown',
    inputTokens: inputTokens || 0,
    outputTokens: outputTokens || 0,
    phase,
  });

  if (!result.ok) return lucErrorResponse(result);

  return jsonResponse({
    sessionId,
    phase: result.session.current_phase,
    costCents: result.costCents,
    chatTokens: (result.session.chat_input_tokens || 0) + (result.session.chat_output_tokens || 0),
    iterationTokens: (result.session.iteration_input_tokens || 0) + (result.session.iteration_output_tokens || 0),
  });
}));

// POST /api/v1/luc/session/:sessionId/finalize
lucRouter.post('/session/:sessionId/finalize', requireAuth(async (request, env, ctx) => {
  const { sessionId } = request.params;

  const result = await finalizeLucSession(env, sessionId, ctx.user.userId);
  if (!result.ok) return lucErrorResponse(result);

  return jsonResponse(result.receipt);
}));

// Helper endpoint (optional): extract token usage from a completion payload.
// Useful for validating provider response shapes during integration.
lucRouter.post('/debug/extract', requireAuth(async (request, env, ctx) => {
  const body = await request.json();
  const { provider, completion } = body || {};
  const usage = extractTokenUsage(provider || 'openai', completion);
  return jsonResponse({ usage });
}));

export { lucRouter };