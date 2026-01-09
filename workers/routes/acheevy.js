/**
 * ============================================
 * ACHEEVY Worker Routes
 * ============================================
 * 
 * Chat w/ACHEEVY API endpoints for II-Agent configuration and execution
 * Routes: /api/v1/acheevy/*
 * 
 * SDK: workers/sdk/acheevy-agent.js
 */

import { Router } from 'itty-router';
import { jsonResponse, errorResponse } from '../utils/responses.js';
import { 
  AGENT_CONFIG, 
  INTERACTION_MODES, 
  KINGMODE_PROTOCOL,
  CROWN_GATES,
  CIRCUIT_BOX,
  estimateTokens,
  estimateCost
} from '../sdk/acheevy-agent.js';
import { handleFindRequest } from '../services/find.js';
import { handleScoutRequest } from '../services/scout.js';
import { logChronicleEvent } from '../services/chronicle.js';

const acheevyRouter = Router({ base: '/api/v1/acheevy' });

function getTimeoutMs(env, fallback = 30000) {
  const raw = env?.RESPONSE_TIMEOUT_MS;
  const parsed = typeof raw === 'string' ? Number.parseInt(raw, 10) : Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

async function fetchWithTimeout(url, init, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort('timeout'), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function promiseWithTimeout(promise, timeoutMs, label) {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${label || 'Operation'} timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutId);
  }
}

// ============================================
// FIND - Hybrid Web + Local Knowledge
// ============================================

/**
 * POST /api/v1/acheevy/find
 * FIND endpoint (Firecrawl + optional D1 knowledge search)
 */
acheevyRouter.post('/find', async (request, env) => {
  try {
    const result = await handleFindRequest(request, env);
    return jsonResponse({ success: true, ...result });
  } catch (error) {
    console.error('FIND error:', error);
    return errorResponse('FIND failed: ' + error.message, 500);
  }
});

// Contract guard:
// - `/find` is reserved for hybrid search (web + optional knowledge)
// - `/scout` is the Firecrawl capture pipeline (product label: FIND)
// If a product-friendly alias is desired later, add a non-conflicting path like `/crawl`.
// acheevyRouter.post('/crawl', ...same handler as `/scout`...)

// ============================================
// SCOUT - Web Crawl/Scrape
// ============================================

/**
 * POST /api/v1/acheevy/scout
 * SCOUT endpoint (Firecrawl search + scrape main-content)
 */
acheevyRouter.post('/scout', async (request, env) => {
  try {
    const result = await handleScoutRequest(request, env);
    return jsonResponse({ success: true, ...result });
  } catch (error) {
    console.error('FIND error:', error);
    return errorResponse('FIND failed: ' + error.message, 500);
  }
});

// ============================================
// Chat w/ACHEEVY - Main Conversation Endpoint
// ============================================

/**
 * POST /api/v1/acheevy/chat
 * Main conversation endpoint for Chat w/ACHEEVY
 * Handles Brainstorm → Forming → Agent mode transitions
 */
acheevyRouter.post('/chat', async (request, env) => {
  try {
    const { 
      message, 
      mode = 'brainstorm', 
      agent_level = 'standard',
      circuit_box = [],
      session_id,
      scout_briefing,
      scoutBriefing,
      scout_sources_count,
      scout_bytes
    } = await request.json();
    
    const userId = request.userId;
    
    if (!message) {
      return errorResponse('Message is required', 400);
    }
    
    // Validate mode
    if (!['brainstorm', 'forming', 'agent'].includes(mode)) {
      return errorResponse('Invalid mode. Use: brainstorm, forming, or agent', 400);
    }
    
    // Get mode configuration
    const modeConfig = INTERACTION_MODES[mode];
    
    // Estimate tokens
    const estimatedTokens = estimateTokens(message, agent_level);
    const estimatedCost = estimateCost(estimatedTokens, agent_level);
    
    // Build system prompt based on mode
    let systemPrompt = '';
    if (mode === 'brainstorm') {
      systemPrompt = modeConfig.system_prompt;
    } else if (mode === 'forming') {
      systemPrompt = modeConfig.system_prompt;
    } else if (mode === 'agent') {
      const levelConfig = modeConfig.levels[agent_level];
      systemPrompt = levelConfig?.system_prompt || modeConfig.levels.standard.system_prompt;
    }

    const briefingTextRaw = typeof scout_briefing === 'string'
      ? scout_briefing
      : typeof scoutBriefing === 'string'
        ? scoutBriefing
        : '';

    const briefingText = briefingTextRaw.trim();
    const systemContext = briefingText
      ? `## FIND (Firecrawl) Context\n\n${briefingText}\n\n---\n\nUse the above captured sources to ground your responses.\n\n`
      : '';
    
    // Select model based on mode
    const modelId = AGENT_CONFIG.models[mode === 'agent' ? 'execute' : mode === 'forming' ? 'forming' : 'clarify'];
    
    // Call Cloudflare AI (bounded so local dev doesn't hang indefinitely)
    const timeoutMs = getTimeoutMs(env);
    const aiResponse = await promiseWithTimeout(
      env.AI.run(modelId, {
        messages: [
          { role: 'system', content: systemContext + systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: modeConfig.token_budget?.max || 2000
      }),
      timeoutMs,
      'AI response'
    );
    
    // Log conversation to D1
    await env.DB.prepare(`
      INSERT INTO chat_sessions (
        session_id, user_id, mode, agent_level, message, response, 
        tokens_used, cost, circuit_box, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      session_id || crypto.randomUUID(),
      userId,
      mode,
      agent_level,
      message,
      aiResponse.response,
      estimatedTokens,
      estimatedCost,
      JSON.stringify(circuit_box)
    ).run();

    // Common_Chronicle: Proof-of-Benefit logging for SCOUT-assisted chat
    if (briefingText) {
      try {
        await logChronicleEvent(env, {
          userId,
          eventType: 'scout_assisted_chat',
          goal: message,
          scoutSourcesCount: scout_sources_count,
          scoutBytes: scout_bytes || briefingText.length,
          chatMessagesCount: 1,
          stage: 'execute',
          modelUsed: modelId,
          metadata: {
            mode,
            agent_level,
            circuit_box,
            estimated_tokens: estimatedTokens,
          },
        });
      } catch (chronicleError) {
        console.warn('Chronicle logging failed:', chronicleError);
      }
    }
    
    // Report usage to Stripe meter
    if (env.STRIPE_SECRET_KEY) {
      await reportUsage(env, userId, estimatedTokens);
    }
    
    return jsonResponse({
      success: true,
      response: aiResponse.response,
      metadata: {
        mode,
        agent_level,
        model: modelId,
        estimated_tokens: estimatedTokens,
        estimated_cost: `$${estimatedCost.toFixed(4)}`,
        session_id: session_id || crypto.randomUUID()
      },
      next_actions: getNextActions(mode, agent_level)
    });
  } catch (error) {
    console.error('Chat w/ACHEEVY error:', error);
    const isTimeout = /timed out/i.test(error?.message || '');
    return errorResponse('Chat failed: ' + error.message, isTimeout ? 504 : 500);
  }
});

/**
 * GET /api/v1/acheevy/config
 * Get ACHEEVY SDK configuration for frontend
 */
acheevyRouter.get('/config', async (request, env) => {
  return jsonResponse({
    identity: AGENT_CONFIG.identity,
    ui_bezel: AGENT_CONFIG.ui_bezel,
    version: AGENT_CONFIG.version,
    modes: {
      brainstorm: {
        label: INTERACTION_MODES.brainstorm.label,
        description: 'Clarify intent and constraints'
      },
      forming: {
        label: INTERACTION_MODES.forming.label,
        description: 'Generate specs and OKRs'
      },
      agent: {
        label: INTERACTION_MODES.agent.label,
        description: 'Execute with agents',
        levels: ['standard', 'swarm', 'king']
      }
    },
    circuit_box: CIRCUIT_BOX,
    protocol: {
      steps: KINGMODE_PROTOCOL.steps.length,
      crown_gates: CROWN_GATES.length
    }
  });
});

/**
 * POST /api/v1/acheevy/execute
 * Execute an approved manifest
 */
acheevyRouter.post('/execute', async (request, env) => {
  try {
    const { 
      manifest, 
      agent_level = 'standard',
      circuit_box = [],
      session_id 
    } = await request.json();
    
    const userId = request.userId;
    
    if (!manifest) {
      return errorResponse('Manifest is required', 400);
    }
    
    // Create execution record
    const executionId = crypto.randomUUID();
    const isKingMode = agent_level === 'king';
    
    await env.DB.prepare(`
      INSERT INTO task_executions (
        id, user_id, manifest, agent_level, is_king_mode, 
        circuit_box, status, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, 'pending', datetime('now'))
    `).bind(
      executionId,
      userId,
      JSON.stringify(manifest),
      agent_level,
      isKingMode ? 1 : 0,
      JSON.stringify(circuit_box)
    ).run();
    
    // Route based on agent level
    let hubEndpoint = '/execute';
    if (agent_level === 'swarm') {
      hubEndpoint = '/swarm';
    } else if (agent_level === 'king') {
      hubEndpoint = '/kingmode';
    }
    
    const hubUrl = env.ACHEEVY_HUB_URL || 'https://acheevy-hub-nurds-code-prod.a.run.app';
    
    const hubResponse = await fetchWithTimeout(`${hubUrl}${hubEndpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.GCP_SERVICE_TOKEN}`,
        'X-Execution-Id': executionId,
        'X-User-Id': userId,
      },
      body: JSON.stringify({ 
        manifest, 
        agent_level, 
        circuit_box,
        governance: isKingMode ? {
          protocol_steps: KINGMODE_PROTOCOL.steps,
          crown_gates: CROWN_GATES
        } : null
      }),
    }, getTimeoutMs(env));
    
    const result = await hubResponse.json();
    
    // Update execution record
    await env.DB.prepare(`
      UPDATE task_executions 
      SET status = ?, result = ?, completed_at = datetime('now')
      WHERE id = ?
    `).bind(
      hubResponse.ok ? 'completed' : 'failed',
      JSON.stringify(result),
      executionId
    ).run();
    
    return jsonResponse({
      success: hubResponse.ok,
      execution_id: executionId,
      result,
      governance: isKingMode ? {
        protocol: 'KingMode 12-Step',
        gates_passed: result.gates_passed || [],
        proof_bundle: result.proof_bundle || null
      } : null
    });
  } catch (error) {
    console.error('Execute error:', error);
    const isAbort = error?.name === 'AbortError' || /aborted|timeout/i.test(error?.message || '');
    return errorResponse('Execution failed: ' + error.message, isAbort ? 504 : 500);
  }
});

/**
 * Helper: Get next available actions based on current mode
 */
function getNextActions(mode, agentLevel) {
  if (mode === 'brainstorm') {
    return {
      can_proceed_to: 'forming',
      actions: ['clarify_more', 'proceed_to_forming']
    };
  } else if (mode === 'forming') {
    return {
      can_proceed_to: 'agent',
      actions: ['refine_spec', 'proceed_to_agent'],
      agent_levels: ['standard', 'swarm', 'king']
    };
  } else {
    return {
      current_level: agentLevel,
      actions: ['view_progress', 'view_artifacts', 'cancel']
    };
  }
}

// ============================================
// Agent Configuration Endpoints
// ============================================

/**
 * GET /api/v1/acheevy/agents
 * Get all agent configurations
 */
acheevyRouter.get('/agents', async (request, env) => {
  try {
    const userId = request.userId;
    
    // Get user's custom configurations from D1
    const configs = await env.DB.prepare(`
      SELECT agent_id, model, enabled, custom_prompt, timeout, memory_limit
      FROM agent_configs
      WHERE user_id = ?
    `).bind(userId).all();
    
    const configMap = {};
    for (const row of configs.results || []) {
      configMap[row.agent_id] = {
        model: row.model,
        enabled: row.enabled === 1,
        customPrompt: row.custom_prompt,
        timeout: row.timeout,
        memoryLimit: row.memory_limit,
      };
    }
    
    return jsonResponse({ configs: configMap });
  } catch (error) {
    console.error('Failed to fetch agent configs:', error);
    return jsonResponse({ configs: {} });
  }
});

/**
 * PUT /api/v1/acheevy/agents/:agentId
 * Update agent configuration
 */
acheevyRouter.put('/agents/:agentId', async (request, env) => {
  try {
    const { agentId } = request.params;
    const userId = request.userId;
    const config = await request.json();
    
    // Upsert configuration
    await env.DB.prepare(`
      INSERT INTO agent_configs (user_id, agent_id, model, enabled, custom_prompt, timeout, memory_limit, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(user_id, agent_id) DO UPDATE SET
        model = excluded.model,
        enabled = excluded.enabled,
        custom_prompt = excluded.custom_prompt,
        timeout = excluded.timeout,
        memory_limit = excluded.memory_limit,
        updated_at = datetime('now')
    `).bind(
      userId,
      agentId,
      config.model || null,
      config.enabled ? 1 : 0,
      config.customPrompt || null,
      config.timeout || 30000,
      config.memoryLimit || 512
    ).run();
    
    return jsonResponse({ success: true, agentId, config });
  } catch (error) {
    console.error('Failed to update agent config:', error);
    return errorResponse('Failed to update configuration', 500);
  }
});

// ============================================
// KingMode Execution
// ============================================

/**
 * POST /api/v1/acheevy/kingmode
 * Execute a KingMode workflow (BRAINSTORM → FORMING → AGENT)
 */
acheevyRouter.post('/kingmode', async (request, env) => {
  try {
    const { task, strategy = 'STANDARD', options = {} } = await request.json();
    const userId = request.userId;
    
    if (!task) {
      return errorResponse('Task is required', 400);
    }
    
    // Create execution record
    const executionId = crypto.randomUUID();
    
    await env.DB.prepare(`
      INSERT INTO kingmode_executions (id, user_id, task, strategy, status, created_at)
      VALUES (?, ?, ?, ?, 'pending', datetime('now'))
    `).bind(executionId, userId, task, strategy).run();
    
    // Route to ACHEEVY Hub on Cloud Run
    const hubUrl = env.ACHEEVY_HUB_URL || 'https://acheevy-hub-nurds-code-prod.a.run.app';
    
    const hubResponse = await fetchWithTimeout(`${hubUrl}/kingmode`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.GCP_SERVICE_TOKEN}`,
        'X-Execution-Id': executionId,
        'X-User-Id': userId,
      },
      body: JSON.stringify({ task, strategy, options }),
    }, getTimeoutMs(env));
    
    if (!hubResponse.ok) {
      await env.DB.prepare(`
        UPDATE kingmode_executions SET status = 'failed', error = ? WHERE id = ?
      `).bind('Hub execution failed', executionId).run();
      
      return errorResponse('KingMode execution failed', 500);
    }
    
    const result = await hubResponse.json();
    
    // Update execution record
    await env.DB.prepare(`
      UPDATE kingmode_executions 
      SET status = 'completed', result = ?, completed_at = datetime('now')
      WHERE id = ?
    `).bind(JSON.stringify(result), executionId).run();
    
    // Report usage to Stripe
    if (result.totalTokens && env.STRIPE_SECRET_KEY) {
      await reportUsage(env, userId, result.totalTokens);
    }
    
    return jsonResponse({ 
      success: true, 
      executionId,
      result,
    });
  } catch (error) {
    console.error('KingMode execution error:', error);
    const isAbort = error?.name === 'AbortError' || /aborted|timeout/i.test(error?.message || '');
    return errorResponse('Execution failed: ' + error.message, isAbort ? 504 : 500);
  }
});

// ============================================
// Workflow Execution
// ============================================

/**
 * POST /api/v1/acheevy/workflow
 * Execute a custom agent workflow pipeline
 */
acheevyRouter.post('/workflow', async (request, env) => {
  try {
    const { agents, task, options = {} } = await request.json();
    const userId = request.userId;
    
    if (!agents?.length || !task) {
      return errorResponse('Agents array and task are required', 400);
    }
    
    const workflowId = crypto.randomUUID();
    
    await env.DB.prepare(`
      INSERT INTO workflow_executions (id, user_id, agents, task, status, created_at)
      VALUES (?, ?, ?, ?, 'running', datetime('now'))
    `).bind(workflowId, userId, JSON.stringify(agents), task).run();
    
    const hubUrl = env.ACHEEVY_HUB_URL || 'https://acheevy-hub-nurds-code-prod.a.run.app';
    
    const hubResponse = await fetchWithTimeout(`${hubUrl}/workflow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.GCP_SERVICE_TOKEN}`,
        'X-Workflow-Id': workflowId,
        'X-User-Id': userId,
      },
      body: JSON.stringify({ agents, task, options }),
    }, getTimeoutMs(env));
    
    if (!hubResponse.ok) {
      await env.DB.prepare(`
        UPDATE workflow_executions SET status = 'failed' WHERE id = ?
      `).bind(workflowId).run();
      
      return errorResponse('Workflow execution failed', 500);
    }
    
    const result = await hubResponse.json();
    
    await env.DB.prepare(`
      UPDATE workflow_executions 
      SET status = 'completed', result = ?, completed_at = datetime('now')
      WHERE id = ?
    `).bind(JSON.stringify(result), workflowId).run();
    
    return jsonResponse({ success: true, workflowId, result });
  } catch (error) {
    console.error('Workflow execution error:', error);
    const isAbort = error?.name === 'AbortError' || /aborted|timeout/i.test(error?.message || '');
    return errorResponse('Execution failed: ' + error.message, isAbort ? 504 : 500);
  }
});

// ============================================
// Workflow Templates
// ============================================

/**
 * GET /api/v1/acheevy/workflows
 * Get saved workflow templates
 */
acheevyRouter.get('/workflows', async (request, env) => {
  try {
    const userId = request.userId;
    
    const templates = await env.DB.prepare(`
      SELECT id, name, description, agents, created_at
      FROM workflow_templates
      WHERE user_id = ? OR is_public = 1
      ORDER BY created_at DESC
    `).bind(userId).all();
    
    return jsonResponse({ templates: templates.results || [] });
  } catch (error) {
    console.error('Failed to fetch templates:', error);
    return jsonResponse({ templates: [] });
  }
});

/**
 * POST /api/v1/acheevy/workflows
 * Save a workflow template
 */
acheevyRouter.post('/workflows', async (request, env) => {
  try {
    const { name, agents, description = '' } = await request.json();
    const userId = request.userId;
    
    if (!name || !agents?.length) {
      return errorResponse('Name and agents are required', 400);
    }
    
    const templateId = crypto.randomUUID();
    
    await env.DB.prepare(`
      INSERT INTO workflow_templates (id, user_id, name, description, agents, created_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `).bind(templateId, userId, name, description, JSON.stringify(agents)).run();
    
    return jsonResponse({ success: true, templateId, name });
  } catch (error) {
    console.error('Failed to save template:', error);
    return errorResponse('Failed to save template', 500);
  }
});

// ============================================
// Metrics & Monitoring
// ============================================

/**
 * GET /api/v1/acheevy/metrics
 * Get aggregated agent metrics
 */
acheevyRouter.get('/metrics', async (request, env) => {
  try {
    const userId = request.userId;
    
    const metrics = await env.DB.prepare(`
      SELECT 
        agent_id,
        COUNT(*) as total_calls,
        SUM(tokens_used) as total_tokens,
        AVG(latency_ms) as avg_latency,
        SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful,
        SUM(CASE WHEN success = 0 THEN 1 ELSE 0 END) as failed
      FROM agent_metrics
      WHERE user_id = ? AND created_at > datetime('now', '-7 days')
      GROUP BY agent_id
    `).bind(userId).all();
    
    return jsonResponse({ metrics: metrics.results || [] });
  } catch (error) {
    console.error('Failed to fetch metrics:', error);
    return jsonResponse({ metrics: [] });
  }
});

/**
 * GET /api/v1/acheevy/metrics/:agentId
 * Get metrics for a specific agent
 */
acheevyRouter.get('/metrics/:agentId', async (request, env) => {
  try {
    const { agentId } = request.params;
    const userId = request.userId;
    
    const metrics = await env.DB.prepare(`
      SELECT 
        agent_id,
        tokens_used,
        latency_ms,
        success,
        created_at
      FROM agent_metrics
      WHERE user_id = ? AND agent_id = ?
      ORDER BY created_at DESC
      LIMIT 100
    `).bind(userId, agentId).all();
    
    return jsonResponse({ metrics: metrics.results || [] });
  } catch (error) {
    console.error('Failed to fetch agent metrics:', error);
    return jsonResponse({ metrics: [] });
  }
});

// ============================================
// Health Check
// ============================================

/**
 * GET /api/v1/acheevy/health/:agentId
 * Check agent health
 */
acheevyRouter.get('/health/:agentId', async (request, env) => {
  try {
    const { agentId } = request.params;
    
    // Map agent IDs to their Cloud Run URLs
    const agentUrls = {
      nlu: env.II_NLU_URL,
      codegen: env.II_CODEGEN_URL,
      research: env.II_RESEARCH_URL,
      validation: env.II_VALIDATION_URL,
      security: env.II_SECURITY_URL,
      reasoning: env.II_REASONING_URL,
      multimodal: env.II_MULTIMODAL_URL,
      streaming: env.II_STREAMING_URL,
      kg: env.II_KG_URL,
      deploy: env.II_DEPLOY_URL,
      observability: env.II_OBSERVABILITY_URL,
      costopt: env.II_COSTOPT_URL,
      legal: env.II_LEGAL_URL,
      synthesis: env.II_SYNTHESIS_URL,
      hitl: env.II_HITL_URL,
      prompt: env.II_PROMPT_URL,
      tools: env.II_TOOLS_URL,
      learning: env.II_LEARNING_URL,
      data: env.II_DATA_URL,
    };
    
    const url = agentUrls[agentId];
    if (!url) {
      return jsonResponse({ healthy: false, error: 'Unknown agent' });
    }
    
    const start = Date.now();
    const response = await fetch(`${url}/health`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${env.GCP_SERVICE_TOKEN}` },
    });
    const latency = Date.now() - start;
    
    return jsonResponse({ 
      healthy: response.ok,
      latency,
      status: response.status,
    });
  } catch (error) {
    return jsonResponse({ healthy: false, error: error.message });
  }
});

// ============================================
// Utility Functions
// ============================================

async function reportUsage(env, userId, tokens) {
  try {
    // Get Stripe customer ID
    const user = await env.DB.prepare(`
      SELECT stripe_customer_id FROM users WHERE id = ?
    `).bind(userId).first();
    
    if (!user?.stripe_customer_id) return;
    
    const stripe = await import('stripe').then(m => new m.default(env.STRIPE_SECRET_KEY));
    
    await stripe.billing.meterEvents.create({
      event_name: 'api_requests',
      payload: {
        stripe_customer_id: user.stripe_customer_id,
        value: String(tokens),
      },
    });
  } catch (error) {
    console.error('Failed to report usage:', error);
  }
}

// ============================================
// Export Router
// ============================================

export { acheevyRouter };
