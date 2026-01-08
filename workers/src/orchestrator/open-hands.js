/**
 * Open Hands Orchestrator
 * 
 * Purpose: Multi-agent co-execution coordinator
 * - Coordinates Brainstorming → Nurd Out → Agent Mode → Edit Mode
 * - Manages agent handoffs and context passing
 * - Implements KingMode three-phase workflow at scale
 * 
 * Flow:
 * 1. BRAINSTORM: Gemini CLI (reasoning) + II-Researcher
 * 2. NURD OUT (FORMING): II-Architect + II-Planner + Google File Manager
 * 3. AGENT MODE: II-Codegen + Codex LoRA + II-Deploy
 * 4. EDIT MODE: GLM 4.7 fast edits + II-Validation
 */

import { ModelRouter, TASK_MODEL_MAP } from '../../sdk/model-router.js';
import { GeminiCLIAdapter, GEMINI_TOOLS } from '../agents/gemini-cli-adapter.js';
import { CodexLoRA } from '../agents/codex-lora.js';
import { GoogleFileManager } from '../integrations/google-file-manager.js';

// ============================================================
// ORCHESTRATION MODES
// ============================================================

export const EXECUTION_MODES = {
  BRAINSTORMING: {
    name: 'Brainstorming',
    description: 'Information gathering, research, and analysis',
    agents: ['gemini-cli', 'ii-researcher', 'ii-nlu'],
    primaryModel: 'gemini-3-flash',
    phase: 'BRAINSTORM',
    color: '#8B5CF6' // Purple
  },
  
  NURD_OUT: {
    name: 'Nurd Out',
    description: 'Planning, architecture, OKRs, and specifications',
    agents: ['ii-architect', 'ii-planner', 'ii-reasoning', 'google-file-manager'],
    primaryModel: 'gemini-3-flash',
    phase: 'FORMING',
    color: '#3B82F6' // Blue
  },
  
  AGENT_MODE: {
    name: 'Agent Mode',
    description: 'Code generation, implementation, deployment',
    agents: ['ii-codegen', 'codex-lora', 'ii-deploy', 'ii-test'],
    primaryModel: 'glm-4.7',
    phase: 'AGENT',
    color: '#10B981' // Green
  },
  
  EDIT_MODE: {
    name: 'Edit Mode',
    description: 'Quick edits, refinements, and fixes',
    agents: ['glm-fast', 'ii-validation', 'ii-security'],
    primaryModel: 'glm-4.7',
    phase: 'AGENT',
    color: '#F59E0B' // Amber
  }
};

// ============================================================
// AGENT REGISTRY
// ============================================================

export const AGENT_REGISTRY = {
  // Local Agents (Cloudflare Workers)
  'gemini-cli': {
    type: 'local',
    handler: GeminiCLIAdapter,
    capabilities: ['reasoning', 'code_analysis', 'documentation', 'architecture']
  },
  'codex-lora': {
    type: 'local',
    handler: CodexLoRA,
    capabilities: ['code_generation', 'react_components', 'worker_routes', 'sql']
  },
  'google-file-manager': {
    type: 'local',
    handler: GoogleFileManager,
    capabilities: ['storage', 'sessions', 'decisions', 'artifacts']
  },
  
  // Remote Agents (GCP Cloud Run)
  'ii-nlu': {
    type: 'remote',
    url: 'II_NLU_URL',
    capabilities: ['intent_classification', 'entity_extraction', 'sentiment']
  },
  'ii-researcher': {
    type: 'remote',
    url: 'II_RESEARCHER_URL',
    capabilities: ['web_search', 'document_analysis', 'fact_checking']
  },
  'ii-architect': {
    type: 'remote',
    url: 'II_ARCHITECT_URL',
    capabilities: ['system_design', 'database_schema', 'api_design']
  },
  'ii-planner': {
    type: 'remote',
    url: 'II_PLANNER_URL',
    capabilities: ['task_breakdown', 'okr_generation', 'timeline']
  },
  'ii-codegen': {
    type: 'remote',
    url: 'II_CODEGEN_URL',
    capabilities: ['code_generation', 'refactoring', 'bug_fixing']
  },
  'ii-test': {
    type: 'remote',
    url: 'II_TEST_URL',
    capabilities: ['test_generation', 'coverage_analysis', 'test_execution']
  },
  'ii-deploy': {
    type: 'remote',
    url: 'II_DEPLOY_URL',
    capabilities: ['deployment', 'rollback', 'infrastructure']
  },
  'ii-validation': {
    type: 'remote',
    url: 'II_VALIDATION_URL',
    capabilities: ['code_review', 'linting', 'type_checking']
  },
  'ii-security': {
    type: 'remote',
    url: 'II_SECURITY_URL',
    capabilities: ['vulnerability_scan', 'auth_audit', 'compliance']
  },
  'ii-reasoning': {
    type: 'remote',
    url: 'II_REASONING_URL',
    capabilities: ['logic', 'problem_solving', 'decision_making']
  },
  
  // GLM Fast Mode (for quick edits)
  'glm-fast': {
    type: 'model',
    model: 'glm-4.7',
    capabilities: ['quick_edit', 'refactor', 'fix']
  }
};

// ============================================================
// OPEN HANDS ORCHESTRATOR CLASS
// ============================================================

export class OpenHandsOrchestrator {
  constructor(env) {
    this.env = env;
    this.modelRouter = new ModelRouter(env);
    this.fileManager = new GoogleFileManager();
    this.sessionId = null;
    this.currentMode = null;
    this.executionLog = [];
    this.agentInstances = new Map();
  }

  /**
   * Initialize orchestrator for a session
   */
  async initialize(sessionId, mode = 'BRAINSTORMING') {
    this.sessionId = sessionId;
    this.currentMode = mode;
    this.executionLog = [];

    // Initialize file manager
    await this.fileManager.initialize({
      folderId: this.env.GOOGLE_DRIVE_FOLDER_ID,
      credentials: this.env.GOOGLE_CREDENTIALS 
        ? JSON.parse(this.env.GOOGLE_CREDENTIALS) 
        : null
    });

    // Load previous session context if exists
    const previousContext = await this.fileManager.getSessionContext(sessionId);
    if (previousContext) {
      this.executionLog = previousContext.log || [];
    }

    return {
      sessionId,
      mode: EXECUTION_MODES[mode],
      hasPreviousContext: !!previousContext
    };
  }

  /**
   * Switch execution mode
   */
  async switchMode(newMode) {
    if (!EXECUTION_MODES[newMode]) {
      throw new Error(`Invalid mode: ${newMode}`);
    }

    const previousMode = this.currentMode;
    this.currentMode = newMode;

    // Log mode transition
    await this.logExecution({
      type: 'mode_transition',
      from: previousMode,
      to: newMode,
      agents: EXECUTION_MODES[newMode].agents
    });

    return {
      previousMode,
      currentMode: newMode,
      modeConfig: EXECUTION_MODES[newMode]
    };
  }

  /**
   * Execute a task in current mode
   */
  async execute(task, options = {}) {
    const mode = EXECUTION_MODES[this.currentMode];
    const startTime = Date.now();

    // Log task start
    await this.logExecution({
      type: 'task_start',
      task,
      mode: this.currentMode,
      timestamp: new Date().toISOString()
    });

    try {
      // Determine execution strategy
      const strategy = this.determineStrategy(task, mode);
      
      // Execute with selected agents
      const results = await this.executeStrategy(strategy, task, options);

      // Log task completion
      await this.logExecution({
        type: 'task_complete',
        task,
        duration: Date.now() - startTime,
        strategy: strategy.name,
        agentsUsed: strategy.agents
      });

      // Save context
      await this.saveContext();

      return {
        success: true,
        results,
        strategy: strategy.name,
        agentsUsed: strategy.agents,
        duration: Date.now() - startTime
      };

    } catch (error) {
      await this.logExecution({
        type: 'task_error',
        task,
        error: error.message,
        duration: Date.now() - startTime
      });

      throw error;
    }
  }

  /**
   * Determine execution strategy based on task and mode
   */
  determineStrategy(task, mode) {
    const taskType = this.classifyTask(task);

    // Map task types to agent combinations
    const strategies = {
      // Brainstorming strategies
      research: {
        name: 'research-chain',
        agents: ['ii-researcher', 'gemini-cli'],
        flow: 'sequential'
      },
      analysis: {
        name: 'analysis-parallel',
        agents: ['gemini-cli', 'ii-nlu'],
        flow: 'parallel'
      },
      
      // Nurd Out strategies
      architecture: {
        name: 'architecture-chain',
        agents: ['ii-architect', 'gemini-cli', 'google-file-manager'],
        flow: 'sequential'
      },
      planning: {
        name: 'planning-chain',
        agents: ['ii-planner', 'ii-reasoning'],
        flow: 'sequential'
      },
      
      // Agent Mode strategies
      code_generation: {
        name: 'code-gen-chain',
        agents: ['ii-codegen', 'codex-lora', 'ii-test'],
        flow: 'sequential'
      },
      deployment: {
        name: 'deploy-chain',
        agents: ['ii-deploy', 'ii-validation', 'ii-security'],
        flow: 'sequential'
      },
      
      // Edit Mode strategies
      quick_edit: {
        name: 'quick-edit',
        agents: ['glm-fast'],
        flow: 'single'
      },
      refactor: {
        name: 'refactor-chain',
        agents: ['glm-fast', 'ii-validation'],
        flow: 'sequential'
      }
    };

    // Find best matching strategy
    const strategyKey = Object.keys(strategies).find(key => 
      taskType.includes(key) || task.toLowerCase().includes(key)
    );

    return strategies[strategyKey] || {
      name: 'default',
      agents: mode.agents.slice(0, 2),
      flow: 'sequential'
    };
  }

  /**
   * Classify task type
   */
  classifyTask(task) {
    const taskLower = task.toLowerCase();
    
    const keywords = {
      research: ['research', 'find', 'search', 'look up', 'investigate'],
      analysis: ['analyze', 'review', 'evaluate', 'assess'],
      architecture: ['design', 'architect', 'structure', 'schema'],
      planning: ['plan', 'roadmap', 'timeline', 'okr', 'milestone'],
      code_generation: ['generate', 'create', 'implement', 'build', 'code'],
      deployment: ['deploy', 'release', 'publish', 'ship'],
      quick_edit: ['edit', 'fix', 'update', 'change', 'modify'],
      refactor: ['refactor', 'cleanup', 'optimize', 'improve']
    };

    for (const [type, words] of Object.entries(keywords)) {
      if (words.some(word => taskLower.includes(word))) {
        return type;
      }
    }

    return 'general';
  }

  /**
   * Execute strategy with agents
   */
  async executeStrategy(strategy, task, options) {
    const results = [];
    let context = { task, ...options.context };

    if (strategy.flow === 'parallel') {
      // Execute all agents in parallel
      const promises = strategy.agents.map(agentId => 
        this.callAgent(agentId, task, context)
      );
      const responses = await Promise.all(promises);
      results.push(...responses);
      
    } else if (strategy.flow === 'sequential') {
      // Execute agents in sequence, passing context
      for (const agentId of strategy.agents) {
        const response = await this.callAgent(agentId, task, context);
        results.push(response);
        
        // Update context with agent output
        context = {
          ...context,
          previousAgent: agentId,
          previousOutput: response
        };
      }
      
    } else {
      // Single agent
      const response = await this.callAgent(strategy.agents[0], task, context);
      results.push(response);
    }

    return results;
  }

  /**
   * Call a specific agent
   */
  async callAgent(agentId, task, context) {
    const agentConfig = AGENT_REGISTRY[agentId];
    if (!agentConfig) {
      throw new Error(`Unknown agent: ${agentId}`);
    }

    const startTime = Date.now();

    try {
      let result;

      if (agentConfig.type === 'local') {
        result = await this.callLocalAgent(agentId, agentConfig, task, context);
      } else if (agentConfig.type === 'remote') {
        result = await this.callRemoteAgent(agentId, agentConfig, task, context);
      } else if (agentConfig.type === 'model') {
        result = await this.callModel(agentConfig.model, task, context);
      }

      return {
        agentId,
        success: true,
        result,
        duration: Date.now() - startTime
      };

    } catch (error) {
      return {
        agentId,
        success: false,
        error: error.message,
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Call local agent (Cloudflare Worker)
   */
  async callLocalAgent(agentId, agentConfig, task, context) {
    let agent = this.agentInstances.get(agentId);

    if (!agent) {
      agent = new agentConfig.handler(this.env);
      if (agent.initialize) {
        await agent.initialize();
      }
      this.agentInstances.set(agentId, agent);
    }

    // Route to appropriate method based on task
    if (agentId === 'gemini-cli') {
      return await agent.analyze(task, {
        framework: context.framework || 'four-question-lens'
      });
    } else if (agentId === 'codex-lora') {
      return await agent.generateCode(task, {
        language: context.language || 'javascript'
      });
    } else if (agentId === 'google-file-manager') {
      return await agent.saveArtifact(this.sessionId, {
        name: 'output',
        type: 'json',
        content: context
      });
    }

    return { message: `Agent ${agentId} called with task: ${task}` };
  }

  /**
   * Call remote agent (GCP Cloud Run)
   */
  async callRemoteAgent(agentId, agentConfig, task, context) {
    const url = this.env[agentConfig.url];
    if (!url) {
      throw new Error(`URL not configured for agent: ${agentId}`);
    }

    const response = await fetch(`${url}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.env.II_AGENT_TOKEN}`
      },
      body: JSON.stringify({
        task,
        context,
        sessionId: this.sessionId
      })
    });

    if (!response.ok) {
      throw new Error(`Agent ${agentId} returned ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Call model directly (for quick edits)
   */
  async callModel(modelName, task, context) {
    return await this.modelRouter.route({
      mode: 'edit',
      task,
      context
    });
  }

  /**
   * Log execution event
   */
  async logExecution(event) {
    this.executionLog.push({
      ...event,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Save session context
   */
  async saveContext() {
    await this.fileManager.saveSessionContext(this.sessionId, {
      mode: this.currentMode,
      log: this.executionLog,
      lastUpdated: new Date().toISOString()
    });
  }

  /**
   * Get execution summary
   */
  getExecutionSummary() {
    return {
      sessionId: this.sessionId,
      currentMode: this.currentMode,
      totalExecutions: this.executionLog.filter(e => e.type === 'task_complete').length,
      errors: this.executionLog.filter(e => e.type === 'task_error').length,
      modeTransitions: this.executionLog.filter(e => e.type === 'mode_transition').length,
      log: this.executionLog.slice(-10) // Last 10 events
    };
  }
}

// ============================================================
// FACTORY & EXPORTS
// ============================================================

export function createOrchestrator(env) {
  return new OpenHandsOrchestrator(env);
}

/**
 * MCP handler for orchestrator
 */
export const ORCHESTRATOR_TOOLS = {
  orchestrator_initialize: {
    name: 'orchestrator_initialize',
    description: 'Initialize orchestrator session',
    inputSchema: {
      type: 'object',
      properties: {
        sessionId: { type: 'string' },
        mode: { type: 'string', enum: ['BRAINSTORMING', 'NURD_OUT', 'AGENT_MODE', 'EDIT_MODE'] }
      },
      required: ['sessionId']
    }
  },
  
  orchestrator_execute: {
    name: 'orchestrator_execute',
    description: 'Execute a task with multi-agent coordination',
    inputSchema: {
      type: 'object',
      properties: {
        task: { type: 'string' },
        context: { type: 'object' }
      },
      required: ['task']
    }
  },
  
  orchestrator_switch_mode: {
    name: 'orchestrator_switch_mode',
    description: 'Switch execution mode',
    inputSchema: {
      type: 'object',
      properties: {
        mode: { type: 'string', enum: ['BRAINSTORMING', 'NURD_OUT', 'AGENT_MODE', 'EDIT_MODE'] }
      },
      required: ['mode']
    }
  },
  
  orchestrator_summary: {
    name: 'orchestrator_summary',
    description: 'Get execution summary',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  }
};
