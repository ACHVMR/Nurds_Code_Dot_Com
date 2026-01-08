/**
 * MCP Server Registry
 * 
 * Purpose: Unified registry for all 19 II-Agents + Local Services
 * - Maps agent IDs to endpoints and capabilities
 * - Provides task-to-agent routing rules
 * - Enables discovery and health checking
 * 
 * Based on Model Context Protocol (MCP) specification
 */

// ============================================================
// II-AGENT DEFINITIONS (19 Cloud Run Workers)
// ============================================================

export const II_AGENTS = {
  // Natural Language Processing
  'ii-nlu': {
    id: 'ii-nlu',
    name: 'NLU Agent',
    description: 'Natural Language Understanding - intent classification, entity extraction',
    envVar: 'II_NLU_URL',
    model: 'claude-3-5-sonnet',
    category: 'nlp',
    capabilities: ['intent_classification', 'entity_extraction', 'sentiment_analysis', 'language_detection'],
    inputSchema: {
      text: { type: 'string', required: true },
      language: { type: 'string', default: 'en' }
    },
    priority: 1
  },

  // Research & Information Gathering
  'ii-researcher': {
    id: 'ii-researcher',
    name: 'Research Agent',
    description: 'Web research, document analysis, fact verification',
    envVar: 'II_RESEARCHER_URL',
    model: 'gemini-2.0-flash',
    category: 'research',
    capabilities: ['web_search', 'document_analysis', 'fact_checking', 'citation_generation'],
    inputSchema: {
      query: { type: 'string', required: true },
      depth: { type: 'string', enum: ['quick', 'standard', 'deep'], default: 'standard' }
    },
    priority: 2
  },

  // Code Generation
  'ii-codegen': {
    id: 'ii-codegen',
    name: 'Code Generation Agent',
    description: 'Generate, refactor, and optimize code',
    envVar: 'II_CODEGEN_URL',
    model: 'gpt-4o',
    category: 'development',
    capabilities: ['code_generation', 'refactoring', 'bug_fixing', 'optimization'],
    inputSchema: {
      prompt: { type: 'string', required: true },
      language: { type: 'string', required: true },
      context: { type: 'object' }
    },
    priority: 1
  },

  // Architecture & Design
  'ii-architect': {
    id: 'ii-architect',
    name: 'Architecture Agent',
    description: 'System design, database schemas, API contracts',
    envVar: 'II_ARCHITECT_URL',
    model: 'claude-3-5-sonnet',
    category: 'design',
    capabilities: ['system_design', 'database_schema', 'api_design', 'infrastructure'],
    inputSchema: {
      requirements: { type: 'string', required: true },
      constraints: { type: 'object' },
      existingArchitecture: { type: 'object' }
    },
    priority: 2
  },

  // Planning & Project Management
  'ii-planner': {
    id: 'ii-planner',
    name: 'Planning Agent',
    description: 'Task breakdown, OKRs, timelines, milestones',
    envVar: 'II_PLANNER_URL',
    model: 'claude-3-5-sonnet',
    category: 'planning',
    capabilities: ['task_breakdown', 'okr_generation', 'timeline_creation', 'dependency_analysis'],
    inputSchema: {
      goal: { type: 'string', required: true },
      constraints: { type: 'object' },
      timeline: { type: 'string' }
    },
    priority: 2
  },

  // Testing & Quality Assurance
  'ii-test': {
    id: 'ii-test',
    name: 'Testing Agent',
    description: 'Test generation, coverage analysis, test execution',
    envVar: 'II_TEST_URL',
    model: 'gpt-4o',
    category: 'quality',
    capabilities: ['test_generation', 'coverage_analysis', 'test_execution', 'mocking'],
    inputSchema: {
      code: { type: 'string', required: true },
      testType: { type: 'string', enum: ['unit', 'integration', 'e2e'], default: 'unit' }
    },
    priority: 3
  },

  // Deployment & DevOps
  'ii-deploy': {
    id: 'ii-deploy',
    name: 'Deployment Agent',
    description: 'Deploy, rollback, infrastructure management',
    envVar: 'II_DEPLOY_URL',
    model: 'claude-3-5-sonnet',
    category: 'devops',
    capabilities: ['deployment', 'rollback', 'infrastructure', 'monitoring_setup'],
    inputSchema: {
      artifact: { type: 'string', required: true },
      environment: { type: 'string', enum: ['dev', 'staging', 'prod'], required: true }
    },
    priority: 2
  },

  // Code Review & Validation
  'ii-validation': {
    id: 'ii-validation',
    name: 'Validation Agent',
    description: 'Code review, linting, type checking, best practices',
    envVar: 'II_VALIDATION_URL',
    model: 'gpt-4o',
    category: 'quality',
    capabilities: ['code_review', 'linting', 'type_checking', 'best_practices'],
    inputSchema: {
      code: { type: 'string', required: true },
      language: { type: 'string', required: true }
    },
    priority: 3
  },

  // Security Analysis
  'ii-security': {
    id: 'ii-security',
    name: 'Security Agent',
    description: 'Vulnerability scanning, auth audit, compliance checking',
    envVar: 'II_SECURITY_URL',
    model: 'claude-3-5-sonnet',
    category: 'security',
    capabilities: ['vulnerability_scan', 'auth_audit', 'compliance_check', 'secret_detection'],
    inputSchema: {
      code: { type: 'string', required: true },
      framework: { type: 'string' }
    },
    priority: 1
  },

  // Reasoning & Logic
  'ii-reasoning': {
    id: 'ii-reasoning',
    name: 'Reasoning Agent',
    description: 'Complex logic, problem solving, decision making',
    envVar: 'II_REASONING_URL',
    model: 'claude-3-5-sonnet',
    category: 'reasoning',
    capabilities: ['logic', 'problem_solving', 'decision_making', 'analysis'],
    inputSchema: {
      problem: { type: 'string', required: true },
      constraints: { type: 'object' }
    },
    priority: 2
  },

  // Documentation
  'ii-docs': {
    id: 'ii-docs',
    name: 'Documentation Agent',
    description: 'Generate docs, README, API reference, tutorials',
    envVar: 'II_DOCS_URL',
    model: 'gemini-2.0-flash',
    category: 'documentation',
    capabilities: ['readme_generation', 'api_docs', 'tutorials', 'changelog'],
    inputSchema: {
      code: { type: 'string', required: true },
      docType: { type: 'string', enum: ['readme', 'api', 'tutorial', 'changelog'] }
    },
    priority: 3
  },

  // UI/UX Design
  'ii-design': {
    id: 'ii-design',
    name: 'Design Agent',
    description: 'UI component design, UX patterns, accessibility',
    envVar: 'II_DESIGN_URL',
    model: 'claude-3-5-sonnet',
    category: 'design',
    capabilities: ['ui_components', 'ux_patterns', 'accessibility', 'responsive_design'],
    inputSchema: {
      requirements: { type: 'string', required: true },
      framework: { type: 'string', default: 'react' }
    },
    priority: 2
  },

  // Data Processing
  'ii-data': {
    id: 'ii-data',
    name: 'Data Agent',
    description: 'Data transformation, ETL, analysis',
    envVar: 'II_DATA_URL',
    model: 'gpt-4o',
    category: 'data',
    capabilities: ['data_transformation', 'etl', 'analysis', 'visualization'],
    inputSchema: {
      data: { type: 'object', required: true },
      operation: { type: 'string', required: true }
    },
    priority: 3
  },

  // API Integration
  'ii-integration': {
    id: 'ii-integration',
    name: 'Integration Agent',
    description: 'Third-party API integration, webhook setup',
    envVar: 'II_INTEGRATION_URL',
    model: 'claude-3-5-sonnet',
    category: 'integration',
    capabilities: ['api_integration', 'webhook_setup', 'oauth_config', 'data_mapping'],
    inputSchema: {
      service: { type: 'string', required: true },
      action: { type: 'string', required: true }
    },
    priority: 2
  },

  // Performance Optimization
  'ii-perf': {
    id: 'ii-perf',
    name: 'Performance Agent',
    description: 'Performance analysis, optimization suggestions',
    envVar: 'II_PERF_URL',
    model: 'gpt-4o',
    category: 'optimization',
    capabilities: ['performance_analysis', 'optimization', 'profiling', 'caching'],
    inputSchema: {
      code: { type: 'string', required: true },
      metrics: { type: 'object' }
    },
    priority: 3
  },

  // Database Management
  'ii-database': {
    id: 'ii-database',
    name: 'Database Agent',
    description: 'Query optimization, migrations, schema design',
    envVar: 'II_DATABASE_URL',
    model: 'claude-3-5-sonnet',
    category: 'data',
    capabilities: ['query_optimization', 'migrations', 'schema_design', 'indexing'],
    inputSchema: {
      schema: { type: 'object' },
      operation: { type: 'string', required: true }
    },
    priority: 2
  },

  // Error Handling & Debugging
  'ii-debug': {
    id: 'ii-debug',
    name: 'Debug Agent',
    description: 'Error analysis, stack trace interpretation, fix suggestions',
    envVar: 'II_DEBUG_URL',
    model: 'gpt-4o',
    category: 'debugging',
    capabilities: ['error_analysis', 'stack_trace', 'fix_suggestions', 'logging'],
    inputSchema: {
      error: { type: 'string', required: true },
      context: { type: 'object' }
    },
    priority: 1
  },

  // AI/ML Operations
  'ii-ml': {
    id: 'ii-ml',
    name: 'ML Agent',
    description: 'Model selection, training, inference optimization',
    envVar: 'II_ML_URL',
    model: 'gemini-2.0-flash',
    category: 'ml',
    capabilities: ['model_selection', 'training_config', 'inference', 'evaluation'],
    inputSchema: {
      task: { type: 'string', required: true },
      data: { type: 'object' }
    },
    priority: 2
  },

  // Orchestration Control
  'ii-orchestrator': {
    id: 'ii-orchestrator',
    name: 'Orchestrator Agent',
    description: 'Coordinate multi-agent workflows',
    envVar: 'II_ORCHESTRATOR_URL',
    model: 'claude-3-5-sonnet',
    category: 'control',
    capabilities: ['workflow_coordination', 'agent_selection', 'result_aggregation'],
    inputSchema: {
      workflow: { type: 'object', required: true },
      agents: { type: 'array' }
    },
    priority: 1
  }
};

// ============================================================
// LOCAL SERVICES (Cloudflare Workers)
// ============================================================

export const LOCAL_SERVICES = {
  'gemini-cli': {
    id: 'gemini-cli',
    name: 'Gemini CLI Adapter',
    description: 'Wrapped Gemini CLI for reasoning and analysis',
    type: 'local',
    module: 'workers/src/agents/gemini-cli-adapter.js',
    category: 'reasoning',
    capabilities: ['reasoning', 'code_analysis', 'documentation', 'architecture']
  },
  
  'codex-lora': {
    id: 'codex-lora',
    name: 'Codex LoRA',
    description: 'Fine-tuned code generation with LoRA adapters',
    type: 'local',
    module: 'workers/src/agents/codex-lora.js',
    category: 'development',
    capabilities: ['code_generation', 'react_components', 'worker_routes', 'sql_migrations']
  },
  
  'google-file-manager': {
    id: 'google-file-manager',
    name: 'Google File Manager',
    description: 'Persistent storage via Google Drive',
    type: 'local',
    module: 'workers/src/integrations/google-file-manager.js',
    category: 'storage',
    capabilities: ['document_storage', 'session_context', 'artifact_storage', 'search']
  },
  
  'model-router': {
    id: 'model-router',
    name: 'Model Router',
    description: 'Multi-model routing and cost optimization',
    type: 'local',
    module: 'workers/sdk/model-router.js',
    category: 'routing',
    capabilities: ['model_selection', 'cost_optimization', 'fallback_handling']
  }
};

// ============================================================
// TASK-TO-AGENT ROUTING RULES
// ============================================================

export const ROUTING_RULES = {
  // Intent-based routing
  intents: {
    'research': ['ii-researcher', 'gemini-cli'],
    'analyze': ['gemini-cli', 'ii-nlu', 'ii-reasoning'],
    'design': ['ii-architect', 'ii-design'],
    'plan': ['ii-planner', 'ii-reasoning'],
    'code': ['ii-codegen', 'codex-lora'],
    'test': ['ii-test', 'ii-validation'],
    'deploy': ['ii-deploy', 'ii-security'],
    'debug': ['ii-debug', 'ii-validation'],
    'document': ['ii-docs', 'gemini-cli'],
    'optimize': ['ii-perf', 'ii-database'],
    'integrate': ['ii-integration', 'ii-codegen'],
    'secure': ['ii-security', 'ii-validation']
  },
  
  // Phase-based routing (KingMode)
  phases: {
    'BRAINSTORM': {
      primary: ['gemini-cli', 'ii-researcher', 'ii-nlu'],
      support: ['ii-reasoning']
    },
    'FORMING': {
      primary: ['ii-architect', 'ii-planner'],
      support: ['ii-design', 'google-file-manager']
    },
    'AGENT': {
      primary: ['ii-codegen', 'codex-lora', 'ii-test'],
      support: ['ii-deploy', 'ii-validation', 'ii-security']
    }
  },
  
  // Mode-based routing (Execution Modes)
  modes: {
    'brainstorming': ['gemini-cli', 'ii-researcher', 'ii-nlu'],
    'nurd_out': ['ii-architect', 'ii-planner', 'ii-reasoning', 'google-file-manager'],
    'agent_mode': ['ii-codegen', 'codex-lora', 'ii-deploy', 'ii-test'],
    'edit_mode': ['model-router', 'ii-validation', 'ii-security']
  },
  
  // Language-based routing (for code tasks)
  languages: {
    'javascript': ['ii-codegen', 'codex-lora'],
    'typescript': ['ii-codegen', 'codex-lora'],
    'python': ['ii-codegen'],
    'sql': ['ii-database', 'codex-lora'],
    'html': ['ii-design', 'ii-codegen'],
    'css': ['ii-design'],
    'yaml': ['ii-deploy', 'ii-architect']
  }
};

// ============================================================
// MCP SERVER REGISTRY CLASS
// ============================================================

export class MCPRegistry {
  constructor(env) {
    this.env = env;
    this.agents = { ...II_AGENTS };
    this.services = { ...LOCAL_SERVICES };
    this.healthCache = new Map();
    this.healthCacheTTL = 60000; // 1 minute
  }

  /**
   * Get all registered agents and services
   */
  getAll() {
    return {
      agents: Object.values(this.agents),
      services: Object.values(this.services),
      total: Object.keys(this.agents).length + Object.keys(this.services).length
    };
  }

  /**
   * Get agent or service by ID
   */
  get(id) {
    return this.agents[id] || this.services[id] || null;
  }

  /**
   * Find agents by capability
   */
  findByCapability(capability) {
    const results = [];

    for (const agent of Object.values(this.agents)) {
      if (agent.capabilities.includes(capability)) {
        results.push(agent);
      }
    }

    for (const service of Object.values(this.services)) {
      if (service.capabilities.includes(capability)) {
        results.push(service);
      }
    }

    return results.sort((a, b) => (a.priority || 99) - (b.priority || 99));
  }

  /**
   * Find agents by category
   */
  findByCategory(category) {
    const results = [];

    for (const agent of Object.values(this.agents)) {
      if (agent.category === category) {
        results.push(agent);
      }
    }

    for (const service of Object.values(this.services)) {
      if (service.category === category) {
        results.push(service);
      }
    }

    return results;
  }

  /**
   * Route task to appropriate agents
   */
  routeTask(task, options = {}) {
    const {
      intent = null,
      phase = null,
      mode = null,
      language = null,
      maxAgents = 3
    } = options;

    let candidates = [];

    // Intent-based routing
    if (intent && ROUTING_RULES.intents[intent]) {
      candidates.push(...ROUTING_RULES.intents[intent]);
    }

    // Phase-based routing
    if (phase && ROUTING_RULES.phases[phase]) {
      candidates.push(...ROUTING_RULES.phases[phase].primary);
    }

    // Mode-based routing
    if (mode && ROUTING_RULES.modes[mode]) {
      candidates.push(...ROUTING_RULES.modes[mode]);
    }

    // Language-based routing
    if (language && ROUTING_RULES.languages[language]) {
      candidates.push(...ROUTING_RULES.languages[language]);
    }

    // Deduplicate and limit
    const unique = [...new Set(candidates)];
    
    // Sort by priority and limit
    return unique
      .map(id => this.get(id))
      .filter(Boolean)
      .sort((a, b) => (a.priority || 99) - (b.priority || 99))
      .slice(0, maxAgents);
  }

  /**
   * Get agent URL
   */
  getAgentUrl(agentId) {
    const agent = this.agents[agentId];
    if (!agent) return null;

    const url = this.env[agent.envVar];
    return url || null;
  }

  /**
   * Check agent health
   */
  async checkHealth(agentId) {
    // Check cache
    const cached = this.healthCache.get(agentId);
    if (cached && Date.now() - cached.timestamp < this.healthCacheTTL) {
      return cached.status;
    }

    const agent = this.get(agentId);
    if (!agent) {
      return { healthy: false, error: 'Agent not found' };
    }

    if (agent.type === 'local' || this.services[agentId]) {
      // Local services are always healthy
      const status = { healthy: true, type: 'local' };
      this.healthCache.set(agentId, { status, timestamp: Date.now() });
      return status;
    }

    // Remote agent health check
    try {
      const url = this.getAgentUrl(agentId);
      if (!url) {
        return { healthy: false, error: 'URL not configured' };
      }

      const response = await fetch(`${url}/health`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${this.env.II_AGENT_TOKEN}` }
      });

      const status = { 
        healthy: response.ok, 
        statusCode: response.status,
        type: 'remote'
      };
      
      this.healthCache.set(agentId, { status, timestamp: Date.now() });
      return status;

    } catch (error) {
      const status = { healthy: false, error: error.message };
      this.healthCache.set(agentId, { status, timestamp: Date.now() });
      return status;
    }
  }

  /**
   * Check health of all agents
   */
  async checkAllHealth() {
    const allIds = [
      ...Object.keys(this.agents),
      ...Object.keys(this.services)
    ];

    const results = await Promise.all(
      allIds.map(async id => ({
        id,
        ...await this.checkHealth(id)
      }))
    );

    return {
      total: results.length,
      healthy: results.filter(r => r.healthy).length,
      unhealthy: results.filter(r => !r.healthy).length,
      agents: results
    };
  }

  /**
   * Get MCP tools list (for discovery)
   */
  getMCPTools() {
    const tools = [];

    for (const agent of Object.values(this.agents)) {
      for (const capability of agent.capabilities) {
        tools.push({
          name: `${agent.id}_${capability}`,
          description: `${agent.name}: ${capability}`,
          inputSchema: agent.inputSchema || {}
        });
      }
    }

    for (const service of Object.values(this.services)) {
      for (const capability of service.capabilities) {
        tools.push({
          name: `${service.id}_${capability}`,
          description: `${service.name}: ${capability}`,
          inputSchema: {}
        });
      }
    }

    return tools;
  }
}

// ============================================================
// FACTORY & WORKER INTEGRATION
// ============================================================

let registryInstance = null;

export function getRegistry(env) {
  if (!registryInstance) {
    registryInstance = new MCPRegistry(env);
  }
  return registryInstance;
}

/**
 * MCP discovery endpoint handler
 */
export async function handleMCPDiscovery(request, env) {
  const registry = getRegistry(env);
  
  return new Response(JSON.stringify({
    name: 'nurds-code-mcp',
    version: '1.0.0',
    description: 'NURDS Code MCP Server with 19 II-Agents + Local Services',
    tools: registry.getMCPTools(),
    agents: registry.getAll()
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * MCP health endpoint handler
 */
export async function handleMCPHealth(request, env) {
  const registry = getRegistry(env);
  const health = await registry.checkAllHealth();
  
  return new Response(JSON.stringify(health), {
    headers: { 'Content-Type': 'application/json' },
    status: health.unhealthy > 0 ? 207 : 200
  });
}
