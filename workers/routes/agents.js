/**
 * Agents Routes for Cloudflare Workers
 * Agent CRUD operations
 */

import { Router } from 'itty-router';
import { jsonResponse, successResponse, createdResponse, noContentResponse } from '../utils/responses.js';
import { badRequest, notFound, forbidden } from '../utils/errors.js';
import { requireAuth } from '../middleware/auth.js';
import { 
  getSupabaseClient, 
  getAgents, 
  getAgent, 
  createAgent, 
  updateAgent, 
  deleteAgent,
  hasActiveSubscription,
} from '../services/supabase.js';

const router = Router({ base: '/api/agents' });

/**
 * GET /api/agents - List all agents
 */
router.get('/', requireAuth(async (request, env, ctx) => {
  const supabase = getSupabaseClient(env);
  const agents = await getAgents(ctx.user.userId, supabase);
  
  return successResponse(agents);
}));

/**
 * GET /api/agents/:id - Get single agent
 */
router.get('/:id', requireAuth(async (request, env, ctx) => {
  const { id } = request.params;
  const supabase = getSupabaseClient(env);
  
  const agent = await getAgent(id, ctx.user.userId, supabase);
  
  if (!agent) {
    return notFound('Agent not found');
  }
  
  return successResponse(agent);
}));

/**
 * POST /api/agents - Create new agent
 */
router.post('/', requireAuth(async (request, env, ctx) => {
  const body = await request.json();
  const { name, description, systemPrompt, model, provider, config } = body;

  if (!name) {
    return badRequest('Agent name is required');
  }

  const supabase = getSupabaseClient(env);

  // Check agent limit based on subscription
  const agents = await getAgents(ctx.user.userId, supabase);
  const hasSubscription = await hasActiveSubscription(ctx.user.userId, supabase);
  
  const agentLimit = hasSubscription ? 10 : 1;
  if (agents.length >= agentLimit) {
    return forbidden(`Agent limit reached (${agentLimit}). Upgrade your plan for more agents.`);
  }

  const agent = await createAgent({
    user_id: ctx.user.userId,
    name,
    description,
    system_prompt: systemPrompt,
    model: model || 'gpt-4-turbo-preview',
    provider: provider || 'openai',
    config: config || {},
  }, supabase);

  return createdResponse(agent);
}));

/**
 * PUT /api/agents/:id - Update agent
 */
router.put('/:id', requireAuth(async (request, env, ctx) => {
  const { id } = request.params;
  const body = await request.json();
  const { name, description, systemPrompt, model, provider, config, isActive } = body;

  const supabase = getSupabaseClient(env);
  
  // Verify ownership
  const existing = await getAgent(id, ctx.user.userId, supabase);
  if (!existing) {
    return notFound('Agent not found');
  }

  const updates = {};
  if (name !== undefined) updates.name = name;
  if (description !== undefined) updates.description = description;
  if (systemPrompt !== undefined) updates.system_prompt = systemPrompt;
  if (model !== undefined) updates.model = model;
  if (provider !== undefined) updates.provider = provider;
  if (config !== undefined) updates.config = config;
  if (isActive !== undefined) updates.is_active = isActive;

  const agent = await updateAgent(id, ctx.user.userId, updates, supabase);

  return successResponse(agent);
}));

/**
 * PATCH /api/agents/:id - Partial update agent
 */
router.patch('/:id', requireAuth(async (request, env, ctx) => {
  // Same as PUT for partial updates
  const { id } = request.params;
  const body = await request.json();

  const supabase = getSupabaseClient(env);
  
  const existing = await getAgent(id, ctx.user.userId, supabase);
  if (!existing) {
    return notFound('Agent not found');
  }

  const agent = await updateAgent(id, ctx.user.userId, body, supabase);

  return successResponse(agent);
}));

/**
 * DELETE /api/agents/:id - Delete agent
 */
router.delete('/:id', requireAuth(async (request, env, ctx) => {
  const { id } = request.params;
  const supabase = getSupabaseClient(env);
  
  const existing = await getAgent(id, ctx.user.userId, supabase);
  if (!existing) {
    return notFound('Agent not found');
  }

  await deleteAgent(id, ctx.user.userId, supabase);

  return noContentResponse();
}));

/**
 * POST /api/agents/:id/duplicate - Duplicate agent
 */
router.post('/:id/duplicate', requireAuth(async (request, env, ctx) => {
  const { id } = request.params;
  const supabase = getSupabaseClient(env);
  
  const existing = await getAgent(id, ctx.user.userId, supabase);
  if (!existing) {
    return notFound('Agent not found');
  }

  // Check agent limit
  const agents = await getAgents(ctx.user.userId, supabase);
  const hasSubscription = await hasActiveSubscription(ctx.user.userId, supabase);
  const agentLimit = hasSubscription ? 10 : 1;
  
  if (agents.length >= agentLimit) {
    return forbidden(`Agent limit reached (${agentLimit})`);
  }

  const duplicate = await createAgent({
    user_id: ctx.user.userId,
    name: `${existing.name} (Copy)`,
    description: existing.description,
    system_prompt: existing.system_prompt,
    model: existing.model,
    provider: existing.provider,
    config: existing.config,
  }, supabase);

  return createdResponse(duplicate);
}));

/**
 * POST /api/agents/:id/test - Test agent with a message
 */
router.post('/:id/test', requireAuth(async (request, env, ctx) => {
  const { id } = request.params;
  const body = await request.json();
  const { message } = body;

  if (!message) {
    return badRequest('Message is required');
  }

  const supabase = getSupabaseClient(env);
  
  const agent = await getAgent(id, ctx.user.userId, supabase);
  if (!agent) {
    return notFound('Agent not found');
  }

  // Use the AI service to generate a response
  const { generateCompletion } = await import('../services/ai.js');
  
  const completion = await generateCompletion({
    messages: [{ role: 'user', content: message }],
    systemPrompt: agent.system_prompt,
    provider: agent.provider || 'openai',
    model: agent.model,
  }, env);

  return successResponse({
    response: completion.choices[0]?.message?.content || '',
    usage: completion.usage,
  });
}));

export { router as agentsRouter };
