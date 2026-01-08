/**
 * Chat Routes for Cloudflare Workers
 * AI chat completions and conversations
 */

import { Router } from 'itty-router';
import { jsonResponse, successResponse, streamResponse } from '../utils/responses.js';
import { badRequest } from '../utils/errors.js';
import { requireAuth } from '../middleware/auth.js';
import { generateCompletion, generateStreamingCompletion, SYSTEM_PROMPTS } from '../services/ai.js';
import { getSupabaseClient } from '../services/supabase.js';

const router = Router({ base: '/api/chat' });

/**
 * POST /api/chat - Send chat message
 */
router.post('/', requireAuth(async (request, env, ctx) => {
  const body = await request.json();
  const { 
    messages, 
    agentId, 
    provider = 'openai',
    model,
    stream = false,
    systemPrompt,
    lucSessionId,
  } = body;

  if (!messages || !Array.isArray(messages)) {
    return badRequest('Messages array is required');
  }

  // Get agent config if agentId provided
  let finalSystemPrompt = systemPrompt || SYSTEM_PROMPTS.default;
  
  if (agentId) {
    const supabase = getSupabaseClient(env);
    const { data: agent } = await supabase
      .from('agents')
      .select('system_prompt, model, provider')
      .eq('id', agentId)
      .eq('user_id', ctx.user.userId)
      .single();

    if (agent) {
      finalSystemPrompt = agent.system_prompt || finalSystemPrompt;
    }
  }

  const options = {
    messages,
    provider,
    model,
    systemPrompt: finalSystemPrompt,
    stream,
  };

  if (stream) {
    const streamBody = await generateStreamingCompletion(options, env);
    return streamResponse(streamBody);
  }

  const completion = await generateCompletion(options, env);
  
  // Log usage for billing
  await logUsage(ctx.user.userId, completion.usage, env);

  // LUC tracking (server-side source of truth)
  if (lucSessionId && completion?.usage) {
    try {
      const res = await fetch(new URL(`/api/v1/luc/session/${lucSessionId}/track`, request.url).toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': request.headers.get('Authorization') || '',
          'X-LUC-Internal': env.LUC_INTERNAL_TOKEN || '',
        },
        body: JSON.stringify({
          provider,
          model: completion.model || model || 'unknown',
          inputTokens: completion.usage.prompt_tokens || 0,
          outputTokens: completion.usage.completion_tokens || 0,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.warn('[LUC] track failed:', err);
      }
    } catch (e) {
      console.warn('[LUC] track error:', e?.message || String(e));
    }
  }

  return successResponse({
    message: completion.choices[0]?.message?.content || '',
    usage: completion.usage,
  });
}));

/**
 * POST /api/chat/stream - Streaming chat
 */
router.post('/stream', requireAuth(async (request, env, ctx) => {
  const body = await request.json();
  const { messages, agentId, provider = 'openai', model, systemPrompt } = body;

  if (!messages || !Array.isArray(messages)) {
    return badRequest('Messages array is required');
  }

  let finalSystemPrompt = systemPrompt || SYSTEM_PROMPTS.default;

  if (agentId) {
    const supabase = getSupabaseClient(env);
    const { data: agent } = await supabase
      .from('agents')
      .select('system_prompt')
      .eq('id', agentId)
      .eq('user_id', ctx.user.userId)
      .single();

    if (agent?.system_prompt) {
      finalSystemPrompt = agent.system_prompt;
    }
  }

  const streamBody = await generateStreamingCompletion({
    messages,
    provider,
    model,
    systemPrompt: finalSystemPrompt,
    stream: true,
  }, env);

  return streamResponse(streamBody);
}));

/**
 * GET /api/chat/history - Get chat history
 */
router.get('/history', requireAuth(async (request, env, ctx) => {
  const url = new URL(request.url);
  const agentId = url.searchParams.get('agentId');
  const limit = parseInt(url.searchParams.get('limit') || '50');

  const supabase = getSupabaseClient(env);
  
  let query = supabase
    .from('chat_history')
    .select('*')
    .eq('user_id', ctx.user.userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (agentId) {
    query = query.eq('agent_id', agentId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[Chat] History error:', error);
    return successResponse([]);
  }

  return successResponse(data);
}));

/**
 * POST /api/chat/history - Save chat message
 */
router.post('/history', requireAuth(async (request, env, ctx) => {
  const body = await request.json();
  const { agentId, role, content } = body;

  if (!role || !content) {
    return badRequest('Role and content are required');
  }

  const supabase = getSupabaseClient(env);
  
  const { data, error } = await supabase
    .from('chat_history')
    .insert({
      user_id: ctx.user.userId,
      agent_id: agentId,
      role,
      content,
    })
    .select()
    .single();

  if (error) {
    console.error('[Chat] Save history error:', error);
    return badRequest('Failed to save message');
  }

  return successResponse(data);
}));

/**
 * DELETE /api/chat/history - Clear chat history
 */
router.delete('/history', requireAuth(async (request, env, ctx) => {
  const url = new URL(request.url);
  const agentId = url.searchParams.get('agentId');

  const supabase = getSupabaseClient(env);
  
  let query = supabase
    .from('chat_history')
    .delete()
    .eq('user_id', ctx.user.userId);

  if (agentId) {
    query = query.eq('agent_id', agentId);
  }

  await query;

  return successResponse({ cleared: true });
}));

/**
 * Log usage for billing
 */
async function logUsage(userId, usage, env) {
  if (!usage) return;

  const supabase = getSupabaseClient(env);
  
  await supabase
    .from('usage_logs')
    .insert({
      user_id: userId,
      prompt_tokens: usage.prompt_tokens || 0,
      completion_tokens: usage.completion_tokens || 0,
      total_tokens: (usage.prompt_tokens || 0) + (usage.completion_tokens || 0),
    });
}

export { router as chatRouter };
