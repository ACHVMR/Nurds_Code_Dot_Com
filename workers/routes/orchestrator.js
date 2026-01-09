/**
 * ACHEEVY Orchestration Routes (v2)
 * 
 * Enhanced routes using the new infrastructure:
 * - Model Router (Gemini 3 Flash + GLM 4.7)
 * - MCP Registry (19 II-Agents + Local Services)
 * - Open Hands Orchestrator (Multi-agent coordination)
 * - Google File Manager (Persistent memory)
 * - Codex LoRA (Fine-tuned code generation)
 */

import { Router } from 'itty-router';
import { jsonResponse, errorResponse } from '../utils/responses.js';
import { ModelRouter } from '../sdk/model-router.js';
import { getRegistry, handleMCPDiscovery, handleMCPHealth } from '../src/mcp/registry.js';
import { OpenHandsOrchestrator, EXECUTION_MODES } from '../src/orchestrator/open-hands.js';
import { initializeFileManager } from '../src/integrations/google-file-manager.js';
import { createCodexLoRA, handleCodexTool } from '../src/agents/codex-lora.js';
import { createGeminiMCPHandler, GEMINI_TOOLS } from '../src/agents/gemini-cli-adapter.js';
import { logChronicleEvent } from '../services/chronicle.js';

const orchestratorRouter = Router({ base: '/api/v1/orchestrator' });

// ============================================
// Orchestrator Session Management
// ============================================

// Active orchestrator instances (keyed by session ID)
const orchestratorSessions = new Map();

/**
 * Get or create orchestrator for session
 */
function getOrchestrator(sessionId, env) {
  if (!orchestratorSessions.has(sessionId)) {
    const orchestrator = new OpenHandsOrchestrator(env);
    orchestratorSessions.set(sessionId, orchestrator);
  }
  return orchestratorSessions.get(sessionId);
}

function normalizeMode(rawMode) {
  if (!rawMode) return null;
  const value = String(rawMode).trim();
  if (!value) return null;

  // Accept both internal keys and product-facing aliases.
  // Canonical values are the OpenHands keys used in EXECUTION_MODES and enforced by D1.
  const upper = value.toUpperCase();
  if (EXECUTION_MODES[upper]) return upper;

  const alias = upper.replace(/\s+/g, '_');
  if (alias === 'BRAINSTORM') return 'BRAINSTORMING';
  if (alias === 'BRAINSTORMING') return 'BRAINSTORMING';
  if (alias === 'NURDOUT') return 'NURD_OUT';
  if (alias === 'NURD_OUT') return 'NURD_OUT';
  if (alias === 'AGENT') return 'AGENT_MODE';
  if (alias === 'AGENT_MODE') return 'AGENT_MODE';
  if (alias === 'EDIT') return 'EDIT_MODE';
  if (alias === 'EDIT_MODE') return 'EDIT_MODE';

  return null;
}

async function readSessionRow(env, sessionId) {
  const { results } = await env.DB.prepare(
    `SELECT session_id, user_id, mode, context, status, created_at, updated_at
     FROM orchestrator_sessions
     WHERE session_id = ?
     LIMIT 1`
  ).bind(sessionId).all();

  return results?.[0] || null;
}

// ============================================
// Session Endpoints
// ============================================

/**
 * POST /api/v1/orchestrator/session/start
 * Start a new orchestrated session
 */
orchestratorRouter.post('/session/start', async (request, env) => {
  try {
    const { mode = 'BRAINSTORMING', context = {} } = await request.json();
    const userId = request.userId;
    const sessionId = crypto.randomUUID();

    const orchestrator = getOrchestrator(sessionId, env);
    const session = await orchestrator.initialize(sessionId, mode);

    // Log to D1
    await env.DB.prepare(`
      INSERT INTO orchestrator_sessions (
        session_id, user_id, mode, context, status, created_at
      )
      VALUES (?, ?, ?, ?, 'active', datetime('now'))
    `).bind(sessionId, userId, mode, JSON.stringify(context)).run();

    return jsonResponse({
      success: true,
      sessionId,
      mode: EXECUTION_MODES[mode],
      availableModes: Object.keys(EXECUTION_MODES),
      message: `Session started in ${mode} mode`
    });
  } catch (error) {
    console.error('Session start error:', error);
    return errorResponse('Failed to start session: ' + error.message, 500);
  }
});

/**
 * GET /api/v1/orchestrator/session/:sessionId
 * Read session state from D1 (source of truth for Stage 2 UI)
 */
orchestratorRouter.get('/session/:sessionId', async (request, env) => {
  try {
    const { sessionId } = request.params;
    if (!sessionId) return errorResponse('sessionId is required', 400);

    const row = await readSessionRow(env, sessionId);
    if (!row) return errorResponse('Session not found', 404);

    return jsonResponse({
      success: true,
      session: {
        sessionId: row.session_id,
        userId: row.user_id,
        mode: row.mode,
        status: row.status,
        context: row.context,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
      modeDetails: EXECUTION_MODES[row.mode] || null,
      availableModes: Object.keys(EXECUTION_MODES),
    });
  } catch (error) {
    console.error('Session read error:', error);
    return errorResponse('Failed to read session: ' + error.message, 500);
  }
});

/**
 * POST /api/v1/orchestrator/session/switch
 * Switch execution mode
 */
orchestratorRouter.post('/session/switch', async (request, env) => {
  try {
    const { sessionId, mode } = await request.json();

    if (!sessionId || !mode) {
      return errorResponse('sessionId and mode are required', 400);
    }

    const userId = request.userId;
    const normalizedMode = normalizeMode(mode);
    if (!normalizedMode) {
      return errorResponse(
        `Invalid mode. Use one of: ${Object.keys(EXECUTION_MODES).join(', ')} (or aliases: brainstorm, nurdout, agent, edit)`,
        400
      );
    }

    const orchestrator = getOrchestrator(sessionId, env);

    // Ensure in-memory orchestrator is initialized for this session.
    if (!orchestrator.sessionId) {
      await orchestrator.initialize(sessionId, normalizedMode);
    }

    const previousRow = await readSessionRow(env, sessionId);
    const previousMode = previousRow?.mode || null;

    const result = await orchestrator.switchMode(normalizedMode);

    // Upsert D1 (canonical source of truth)
    await env.DB.prepare(`
      INSERT INTO orchestrator_sessions (
        session_id,
        user_id,
        mode,
        context,
        status,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, 'active', datetime('now'), datetime('now'))
      ON CONFLICT(session_id) DO UPDATE SET
        mode = excluded.mode,
        updated_at = datetime('now')
    `)
      .bind(sessionId, userId, normalizedMode, JSON.stringify({}))
      .run();

    // Audit log (Common_Chronicle)
    try {
      await logChronicleEvent(env, {
        userId,
        eventType: 'orchestrator_mode_switch',
        stage: 'orchestrator',
        modelUsed: null,
        metadata: {
          sessionId,
          previousMode,
          newMode: normalizedMode,
        },
      });
    } catch (chronicleError) {
      console.warn('Chronicle logging failed:', chronicleError);
    }

    return jsonResponse({
      success: true,
      ...result,
      message: `Switched from ${result.previousMode} to ${normalizedMode}`
    });
  } catch (error) {
    console.error('Mode switch error:', error);
    return errorResponse('Failed to switch mode: ' + error.message, 500);
  }
});

// ============================================
// Task Execution
// ============================================

/**
 * POST /api/v1/orchestrator/execute
 * Execute a task using the orchestrator
 */
orchestratorRouter.post('/execute', async (request, env) => {
  try {
    const { sessionId, task, options = {} } = await request.json();

    if (!sessionId || !task) {
      return errorResponse('sessionId and task are required', 400);
    }

    const orchestrator = getOrchestrator(sessionId, env);
    
    // Check if initialized
    if (!orchestrator.sessionId) {
      await orchestrator.initialize(sessionId);
    }

    const result = await orchestrator.execute(task, options);

    // Log execution to D1
    await env.DB.prepare(`
      INSERT INTO orchestrator_executions (
        id, session_id, task, strategy, agents_used, duration_ms, status, result, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      crypto.randomUUID(),
      sessionId,
      task,
      result.strategy,
      JSON.stringify(result.agentsUsed),
      result.duration,
      result.success ? 'success' : 'failed',
      JSON.stringify(result.results)
    ).run();

    return jsonResponse({
      success: result.success,
      task,
      strategy: result.strategy,
      agentsUsed: result.agentsUsed,
      results: result.results,
      duration: result.duration
    });
  } catch (error) {
    console.error('Execution error:', error);
    return errorResponse('Execution failed: ' + error.message, 500);
  }
});

/**
 * GET /api/v1/orchestrator/session/:sessionId/summary
 * Get session execution summary
 */
orchestratorRouter.get('/session/:sessionId/summary', async (request, env) => {
  try {
    const { sessionId } = request.params;

    const orchestrator = orchestratorSessions.get(sessionId);
    if (!orchestrator) {
      return errorResponse('Session not found', 404);
    }

    return jsonResponse(orchestrator.getExecutionSummary());
  } catch (error) {
    console.error('Summary error:', error);
    return errorResponse('Failed to get summary: ' + error.message, 500);
  }
});

// ============================================
// Model Routing
// ============================================

/**
 * POST /api/v1/orchestrator/route
 * Route a request to the optimal model
 */
orchestratorRouter.post('/route', async (request, env) => {
  try {
    const { task, mode, context = {} } = await request.json();

    if (!task) {
      return errorResponse('task is required', 400);
    }

    const router = new ModelRouter(env);
    const result = await router.route({ task, mode, context });

    return jsonResponse({
      success: true,
      model: result.model,
      response: result.response,
      tokens: result.tokens,
      cost: result.cost
    });
  } catch (error) {
    console.error('Routing error:', error);
    return errorResponse('Routing failed: ' + error.message, 500);
  }
});

/**
 * GET /api/v1/orchestrator/models
 * Get available models and cost comparison
 */
orchestratorRouter.get('/models', async (request, env) => {
  const router = new ModelRouter(env);
  
  return jsonResponse({
    routing: router.routing,
    external: router.externalModels,
    costComparison: {
      gpt4o: { input: '$2.50', output: '$10.00', unit: 'per 1M tokens' },
      gemini3Flash: { input: '$0.15', output: '$0.60', unit: 'per 1M tokens', savings: '70%' },
      glm47: { input: '$0.14', output: '$0.56', unit: 'per 1M tokens', savings: '80%' },
      workersAI: { input: '$0.10', output: '$0.10', unit: 'per 1M tokens', savings: '95%' }
    }
  });
});

// ============================================
// MCP Registry
// ============================================

/**
 * GET /api/v1/orchestrator/mcp/discover
 * MCP discovery endpoint
 */
orchestratorRouter.get('/mcp/discover', handleMCPDiscovery);

/**
 * GET /api/v1/orchestrator/mcp/health
 * MCP health check
 */
orchestratorRouter.get('/mcp/health', handleMCPHealth);

/**
 * GET /api/v1/orchestrator/agents
 * List all registered agents
 */
orchestratorRouter.get('/agents', async (request, env) => {
  const registry = getRegistry(env);
  const all = registry.getAll();

  return jsonResponse({
    total: all.total,
    iiAgents: all.agents.length,
    localServices: all.services.length,
    agents: all.agents,
    services: all.services
  });
});

/**
 * POST /api/v1/orchestrator/agents/route
 * Route task to appropriate agents
 */
orchestratorRouter.post('/agents/route', async (request, env) => {
  try {
    const { task, intent, phase, mode, language, maxAgents = 3 } = await request.json();

    const registry = getRegistry(env);
    const agents = registry.routeTask(task, { intent, phase, mode, language, maxAgents });

    return jsonResponse({
      task,
      routing: { intent, phase, mode, language },
      recommendedAgents: agents.map(a => ({
        id: a.id,
        name: a.name,
        category: a.category,
        capabilities: a.capabilities
      }))
    });
  } catch (error) {
    console.error('Agent routing error:', error);
    return errorResponse('Agent routing failed: ' + error.message, 500);
  }
});

// ============================================
// Code Generation (Codex LoRA)
// ============================================

/**
 * POST /api/v1/orchestrator/codex/generate
 * Generate code with LoRA
 */
orchestratorRouter.post('/codex/generate', async (request, env) => {
  try {
    const { prompt, language = 'javascript', loraId, temperature = 0.3 } = await request.json();

    if (!prompt) {
      return errorResponse('prompt is required', 400);
    }

    const result = await handleCodexTool('generate_code_with_lora', {
      prompt,
      language,
      loraId,
      temperature
    }, env);

    return jsonResponse({
      success: true,
      code: result.code,
      model: result.model,
      loraUsed: result.loraUsed,
      tokens: result.tokens
    });
  } catch (error) {
    console.error('Codex generation error:', error);
    return errorResponse('Code generation failed: ' + error.message, 500);
  }
});

/**
 * GET /api/v1/orchestrator/codex/loras
 * List available LoRA adapters
 */
orchestratorRouter.get('/codex/loras', async (request, env) => {
  try {
    const loras = await handleCodexTool('list_available_loras', {}, env);
    return jsonResponse({ loras });
  } catch (error) {
    console.error('LoRA list error:', error);
    return errorResponse('Failed to list LoRAs: ' + error.message, 500);
  }
});

// ============================================
// Gemini CLI (Reasoning)
// ============================================

/**
 * POST /api/v1/orchestrator/gemini/analyze
 * Analyze using Gemini CLI
 */
orchestratorRouter.post('/gemini/analyze', async (request, env) => {
  try {
    const { input, framework = 'four-question-lens' } = await request.json();

    if (!input) {
      return errorResponse('input is required', 400);
    }

    const handler = createGeminiMCPHandler(env);
    const result = await handler('gemini_reasoning', { input, framework });

    return jsonResponse({
      success: true,
      framework,
      analysis: result.analysis
    });
  } catch (error) {
    console.error('Gemini analysis error:', error);
    return errorResponse('Analysis failed: ' + error.message, 500);
  }
});

/**
 * GET /api/v1/orchestrator/gemini/tools
 * List Gemini CLI tools
 */
orchestratorRouter.get('/gemini/tools', async (request, env) => {
  return jsonResponse({
    tools: Object.entries(GEMINI_TOOLS).map(([name, tool]) => ({
      name,
      description: tool.description,
      inputSchema: tool.inputSchema
    }))
  });
});

// ============================================
// File Manager (Persistent Memory)
// ============================================

/**
 * POST /api/v1/orchestrator/memory/save
 * Save artifact to persistent memory
 */
orchestratorRouter.post('/memory/save', async (request, env) => {
  try {
    const { sessionId, name, content, type = 'json' } = await request.json();

    if (!sessionId || !name || !content) {
      return errorResponse('sessionId, name, and content are required', 400);
    }

    const fileManager = await initializeFileManager(env);
    const fileId = await fileManager.saveArtifact(sessionId, { name, content, type });

    return jsonResponse({
      success: true,
      fileId,
      sessionId,
      name,
      type
    });
  } catch (error) {
    console.error('Memory save error:', error);
    return errorResponse('Save failed: ' + error.message, 500);
  }
});

/**
 * GET /api/v1/orchestrator/memory/:sessionId
 * Get session context
 */
orchestratorRouter.get('/memory/:sessionId', async (request, env) => {
  try {
    const { sessionId } = request.params;

    const fileManager = await initializeFileManager(env);
    const context = await fileManager.getSessionContext(sessionId);

    return jsonResponse({
      sessionId,
      hasContext: !!context,
      context
    });
  } catch (error) {
    console.error('Memory get error:', error);
    return errorResponse('Get failed: ' + error.message, 500);
  }
});

// ============================================
// Execution Modes Summary
// ============================================

/**
 * GET /api/v1/orchestrator/modes
 * Get all execution modes
 */
orchestratorRouter.get('/modes', async (request, env) => {
  return jsonResponse({
    modes: Object.entries(EXECUTION_MODES).map(([key, mode]) => ({
      id: key,
      name: mode.name,
      description: mode.description,
      phase: mode.phase,
      primaryModel: mode.primaryModel,
      agents: mode.agents,
      color: mode.color
    }))
  });
});

// ============================================
// Error Handler
// ============================================

orchestratorRouter.all('*', () => errorResponse('Route not found', 404));

export { orchestratorRouter };
