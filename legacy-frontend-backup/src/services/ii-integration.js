/**
 * Intelligent Internet Integration Layer
 * Connects NurdsCode to all 19 II repos for agent capabilities
 */

// Service URLs when running via Docker stack
const II_SERVICES = {
  backend: process.env.II_BACKEND_URL || 'http://localhost:8000',
  sandbox: process.env.II_SANDBOX_URL || 'http://localhost:8100',
  tools: process.env.II_TOOLS_URL || 'http://localhost:1236',
  mcp: process.env.II_MCP_URL || 'http://localhost:6060'
};

/**
 * Available capabilities from II repositories
 */
export const II_CAPABILITIES = {
  // Core Agent Runtime
  'ii-agent': {
    name: 'II-Agent',
    description: 'Core autonomous agent framework with LLM reasoning',
    capabilities: ['code_execution', 'research', 'planning', 'tool_use'],
    endpoint: '/api/agent/execute'
  },
  
  // Research Agent
  'ii-researcher': {
    name: 'II-Researcher', 
    description: 'Deep research agent with web search and analysis',
    capabilities: ['web_search', 'content_extraction', 'report_generation'],
    endpoint: '/api/research'
  },
  
  // Multi-Agent Collaboration
  'CommonGround': {
    name: 'CommonGround',
    description: 'Build and observe teams of AI agents',
    capabilities: ['multi_agent', 'collaboration', 'orchestration'],
    endpoint: '/api/teams'
  },
  
  // LLM Debugging
  'litellm-debugger': {
    name: 'LiteLLM Debugger',
    description: 'Debug and trace LLM calls across providers',
    capabilities: ['debugging', 'tracing', 'cost_tracking'],
    endpoint: '/api/debug'
  },
  
  // Gemini CLI
  'gemini-cli': {
    name: 'Gemini CLI',
    description: 'Command-line interface for Gemini models',
    capabilities: ['gemini_access', 'cli_tools'],
    endpoint: '/api/gemini'
  },
  
  // MCP Bridge
  'gemini-cli-mcp-openai-bridge': {
    name: 'MCP OpenAI Bridge',
    description: 'Bridge between MCP and OpenAI-compatible APIs',
    capabilities: ['mcp_integration', 'api_bridging'],
    endpoint: '/api/mcp'
  },
  
  // Common utilities
  'II-Commons': {
    name: 'II-Commons',
    description: 'Shared utilities and components',
    capabilities: ['utilities', 'shared_components'],
    endpoint: null
  },
  
  // Community extensions
  'ii-agent-community': {
    name: 'II-Agent Community',
    description: 'Community-contributed agent extensions',
    capabilities: ['extensions', 'community_tools'],
    endpoint: '/api/community'
  },
  
  // Thought processing
  'ii-thought': {
    name: 'II-Thought',
    description: 'Chain-of-thought reasoning engine',
    capabilities: ['reasoning', 'cot', 'reflection'],
    endpoint: '/api/thought'
  },
  
  // Codex integration
  'codex': {
    name: 'Codex',
    description: 'OpenAI Codex for code generation',
    capabilities: ['code_generation', 'code_completion'],
    endpoint: '/api/codex'
  },
  
  // Codex as MCP
  'codex-as-mcp': {
    name: 'Codex MCP',
    description: 'Codex exposed as MCP server',
    capabilities: ['mcp_codex', 'code_tools'],
    endpoint: '/api/codex-mcp'
  },
  
  // Presentation generation
  'PPTist': {
    name: 'PPTist',
    description: 'AI-powered presentation generation',
    capabilities: ['presentations', 'slides', 'design'],
    endpoint: '/api/slides'
  },
  
  // Chronicle/logging
  'Common_Chronicle': {
    name: 'Common Chronicle',
    description: 'Event logging and chronicle system',
    capabilities: ['logging', 'events', 'audit_trail'],
    endpoint: '/api/chronicle'
  },
  
  // Documentation site
  'Symbioism-Nextra': {
    name: 'Symbioism Nextra',
    description: 'Documentation and knowledge base',
    capabilities: ['documentation', 'knowledge_base'],
    endpoint: null
  },
  
  // TLE system
  'Symbioism-TLE': {
    name: 'Symbioism TLE',
    description: 'Temporal logic and event processing',
    capabilities: ['temporal_logic', 'event_processing'],
    endpoint: '/api/tle'
  },
  
  // Reveal.js presentations
  'reveal.js': {
    name: 'Reveal.js',
    description: 'Interactive presentation framework',
    capabilities: ['presentations', 'interactive_slides'],
    endpoint: null
  },
  
  // GCP Storage adapter
  'ghost-gcp-storage-adapter': {
    name: 'GCP Storage Adapter',
    description: 'Ghost CMS to GCP storage bridge',
    capabilities: ['storage', 'gcp_integration'],
    endpoint: null
  },
  
  // VERL system
  'ii_verl': {
    name: 'II-VERL',
    description: 'Verification and reinforcement learning',
    capabilities: ['verification', 'rl', 'training'],
    endpoint: '/api/verl'
  },
  
  // CoT Demo
  'CoT-Lab-Demo': {
    name: 'CoT Lab Demo',
    description: 'Chain-of-thought laboratory demonstrations',
    capabilities: ['cot_demo', 'reasoning_examples'],
    endpoint: null
  }
};

/**
 * Execute an agent task via II-Agent
 */
export async function executeAgentTask(task, options = {}) {
  const { model = 'claude-3-5-sonnet', tools = [], timeout = 60000 } = options;
  
  try {
    const response = await fetch(`${II_SERVICES.backend}/api/agent/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.II_API_KEY || ''}`
      },
      body: JSON.stringify({
        task,
        model,
        tools,
        timeout
      }),
      signal: AbortSignal.timeout(timeout)
    });
    
    if (!response.ok) {
      throw new Error(`Agent execution failed: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('II-Agent execution error:', error);
    throw error;
  }
}

/**
 * Execute a research task via II-Researcher
 */
export async function executeResearch(query, options = {}) {
  const { depth = 'standard', sources = ['web', 'arxiv'] } = options;
  
  try {
    const response = await fetch(`${II_SERVICES.backend}/api/research`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.II_API_KEY || ''}`
      },
      body: JSON.stringify({
        query,
        depth,
        sources
      })
    });
    
    if (!response.ok) {
      throw new Error(`Research failed: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('II-Researcher error:', error);
    throw error;
  }
}

/**
 * Get available tools from the tool server
 */
export async function getAvailableTools() {
  try {
    const response = await fetch(`${II_SERVICES.tools}/api/tools`);
    if (!response.ok) return [];
    return await response.json();
  } catch {
    return [];
  }
}

/**
 * Check II-Agent stack health
 */
export async function checkStackHealth() {
  const services = ['backend', 'sandbox', 'tools'];
  const results = {};
  
  for (const service of services) {
    try {
      const response = await fetch(`${II_SERVICES[service]}/health`, {
        signal: AbortSignal.timeout(5000)
      });
      results[service] = response.ok ? 'healthy' : 'unhealthy';
    } catch {
      results[service] = 'offline';
    }
  }
  
  return results;
}

export default {
  II_CAPABILITIES,
  II_SERVICES,
  executeAgentTask,
  executeResearch,
  getAvailableTools,
  checkStackHealth
};
