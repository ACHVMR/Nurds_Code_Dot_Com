/**
 * ============================================
 * ACHEEVY Hub - Cloud Run Service
 * ============================================
 * 
 * Central orchestrator for the 19 II-Agent workers
 * Integrates with ORACLE router for intelligent model selection
 * Manages KingMode phases (BRAINSTORM → FORMING → AGENT)
 * 
 * @version 2.0.0
 * @license MIT
 */

import { createServer } from 'http';

// Configuration
const PORT = process.env.PORT || 8080;
const ENVIRONMENT = process.env.ENVIRONMENT || 'development';

// II-Agent URLs (populated at runtime or from env)
const II_AGENT_URLS = {
  nlu: process.env.II_NLU_URL || 'http://ii-nlu-worker:8080',
  codegen: process.env.II_CODEGEN_URL || 'http://ii-codegen-worker:8080',
  research: process.env.II_RESEARCH_URL || 'http://ii-research-worker:8080',
  validation: process.env.II_VALIDATION_URL || 'http://ii-validation-worker:8080',
  security: process.env.II_SECURITY_URL || 'http://ii-security-worker:8080',
  reasoning: process.env.II_REASONING_URL || 'http://ii-reasoning-worker:8080',
  multimodal: process.env.II_MULTIMODAL_URL || 'http://ii-multimodal-worker:8080',
  streaming: process.env.II_STREAMING_URL || 'http://ii-streaming-worker:8080',
  kg: process.env.II_KG_URL || 'http://ii-kg-worker:8080',
  deploy: process.env.II_DEPLOY_URL || 'http://ii-deploy-worker:8080',
  observability: process.env.II_OBSERVABILITY_URL || 'http://ii-observability-worker:8080',
  costopt: process.env.II_COSTOPT_URL || 'http://ii-costopt-worker:8080',
  legal: process.env.II_LEGAL_URL || 'http://ii-legal-worker:8080',
  synthesis: process.env.II_SYNTHESIS_URL || 'http://ii-synthesis-worker:8080',
  hitl: process.env.II_HITL_URL || 'http://ii-hitl-worker:8080',
  prompt: process.env.II_PROMPT_URL || 'http://ii-prompt-worker:8080',
  tools: process.env.II_TOOLS_URL || 'http://ii-tools-worker:8080',
  learning: process.env.II_LEARNING_URL || 'http://ii-learning-worker:8080',
  data: process.env.II_DATA_URL || 'http://ii-data-worker:8080',
};

// KingMode Phase Definitions
const KINGMODE_PHASES = {
  BRAINSTORM: {
    name: 'BRAINSTORM',
    agents: ['nlu', 'research', 'reasoning'],
    maxDuration: 30000, // 30s
    description: 'Idea generation and context gathering',
  },
  FORMING: {
    name: 'FORMING',
    agents: ['codegen', 'validation', 'security'],
    maxDuration: 60000, // 60s
    description: 'Solution development and validation',
  },
  AGENT: {
    name: 'AGENT',
    agents: ['synthesis', 'deploy', 'learning'],
    maxDuration: 120000, // 120s
    description: 'Execution and delivery',
  },
};

// Task execution engine
class TaskEngine {
  constructor() {
    this.activeTasks = new Map();
    this.taskHistory = [];
  }

  /**
   * Route task to appropriate II-Agent
   */
  async routeToAgent(agentType, task) {
    const url = II_AGENT_URLS[agentType];
    if (!url) {
      throw new Error(`Unknown agent type: ${agentType}`);
    }

    console.log(`[ACHEEVY] Routing to ${agentType}: ${task.taskId}`);

    const response = await fetch(`${url}/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });

    if (!response.ok) {
      throw new Error(`Agent ${agentType} failed: ${await response.text()}`);
    }

    return response.json();
  }

  /**
   * Execute task through KingMode phases
   */
  async executeKingMode(input, options = {}) {
    const sessionId = `km_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const results = { sessionId, phases: {} };

    try {
      // Phase 1: BRAINSTORM
      console.log(`[ACHEEVY] Starting BRAINSTORM phase for ${sessionId}`);
      results.phases.brainstorm = await this.executePhase('BRAINSTORM', input, sessionId);

      // Phase 2: FORMING
      console.log(`[ACHEEVY] Starting FORMING phase for ${sessionId}`);
      const formingInput = {
        ...input,
        context: results.phases.brainstorm,
      };
      results.phases.forming = await this.executePhase('FORMING', formingInput, sessionId);

      // Phase 3: AGENT
      console.log(`[ACHEEVY] Starting AGENT phase for ${sessionId}`);
      const agentInput = {
        ...input,
        context: {
          brainstorm: results.phases.brainstorm,
          forming: results.phases.forming,
        },
      };
      results.phases.agent = await this.executePhase('AGENT', agentInput, sessionId);

      results.status = 'completed';
      return results;
    } catch (error) {
      console.error(`[ACHEEVY] KingMode failed:`, error);
      results.status = 'failed';
      results.error = error.message;
      return results;
    }
  }

  /**
   * Execute a single phase with its agents
   */
  async executePhase(phaseName, input, sessionId) {
    const phase = KINGMODE_PHASES[phaseName];
    const phaseStart = Date.now();

    // Run all phase agents in parallel
    const agentPromises = phase.agents.map(agentType =>
      this.routeToAgent(agentType, {
        taskId: `${sessionId}_${phaseName}_${agentType}`,
        phase: phaseName,
        input: input.prompt || input,
        context: input.context,
      })
    );

    const results = await Promise.allSettled(agentPromises);

    return {
      phase: phaseName,
      duration: Date.now() - phaseStart,
      agents: phase.agents.map((agent, idx) => ({
        agent,
        status: results[idx].status,
        result: results[idx].status === 'fulfilled' ? results[idx].value : null,
        error: results[idx].status === 'rejected' ? results[idx].reason?.message : null,
      })),
    };
  }

  /**
   * Direct task execution (single agent)
   */
  async executeDirect(agentType, task) {
    const taskId = task.taskId || `task_${Date.now()}`;
    
    this.activeTasks.set(taskId, {
      id: taskId,
      agent: agentType,
      startTime: Date.now(),
      status: 'running',
    });

    try {
      const result = await this.routeToAgent(agentType, { ...task, taskId });
      
      this.activeTasks.delete(taskId);
      this.taskHistory.push({
        ...result,
        completedAt: Date.now(),
      });

      return result;
    } catch (error) {
      this.activeTasks.delete(taskId);
      throw error;
    }
  }
}

// Initialize engine
const engine = new TaskEngine();

// HTTP Server
const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const sendJSON = (data, status = 200) => {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  };

  try {
    // Health check
    if (url.pathname === '/health' || url.pathname === '/') {
      return sendJSON({
        service: 'acheevy-hub',
        status: 'healthy',
        version: '2.0.0',
        environment: ENVIRONMENT,
        agents: Object.keys(II_AGENT_URLS).length,
        activeTasks: engine.activeTasks.size,
      });
    }

    // List available agents
    if (url.pathname === '/api/v1/agents' && req.method === 'GET') {
      return sendJSON({
        agents: Object.keys(II_AGENT_URLS),
        count: Object.keys(II_AGENT_URLS).length,
      });
    }

    // KingMode execution
    if (url.pathname === '/api/v1/kingmode' && req.method === 'POST') {
      let body = '';
      for await (const chunk of req) body += chunk;
      
      const input = JSON.parse(body);
      const result = await engine.executeKingMode(input);
      return sendJSON(result);
    }

    // Direct agent execution
    if (url.pathname.startsWith('/api/v1/agent/') && req.method === 'POST') {
      const agentType = url.pathname.split('/').pop();
      
      let body = '';
      for await (const chunk of req) body += chunk;
      
      const task = JSON.parse(body);
      const result = await engine.executeDirect(agentType, task);
      return sendJSON(result);
    }

    // Orchestrated execution (auto-route)
    if (url.pathname === '/api/v1/orchestrate' && req.method === 'POST') {
      let body = '';
      for await (const chunk of req) body += chunk;
      
      const task = JSON.parse(body);
      
      // First, classify intent with NLU
      const nluResult = await engine.routeToAgent('nlu', {
        taskId: `nlu_${Date.now()}`,
        input: task.prompt || task.message,
      });

      // Route based on intent
      const intent = nluResult.result?.intent || 'general';
      const intentToAgent = {
        code: 'codegen',
        research: 'research',
        security: 'security',
        deploy: 'deploy',
        validate: 'validation',
        data: 'data',
        reason: 'reasoning',
        general: 'reasoning',
      };

      const targetAgent = intentToAgent[intent] || 'reasoning';
      const result = await engine.executeDirect(targetAgent, {
        ...task,
        context: nluResult.result,
      });

      return sendJSON({
        intent,
        nluResult: nluResult.result,
        result,
      });
    }

    // 404
    sendJSON({ error: 'Not found' }, 404);
  } catch (error) {
    console.error('[ACHEEVY] Error:', error);
    sendJSON({ error: error.message }, 500);
  }
});

server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                      ACHEEVY Hub v2.0                        ║
║              Orchestrating 19 II-Agent Workers               ║
╠══════════════════════════════════════════════════════════════╣
║  Port:        ${PORT.toString().padEnd(48)}║
║  Environment: ${ENVIRONMENT.padEnd(48)}║
║  Agents:      ${Object.keys(II_AGENT_URLS).length.toString().padEnd(48)}║
╠══════════════════════════════════════════════════════════════╣
║  Endpoints:                                                  ║
║    GET  /health           - Health check                     ║
║    GET  /api/v1/agents    - List agents                      ║
║    POST /api/v1/kingmode  - KingMode execution               ║
║    POST /api/v1/agent/:id - Direct agent call                ║
║    POST /api/v1/orchestrate - Auto-routed execution          ║
╚══════════════════════════════════════════════════════════════╝
  `);
});

export default engine;
