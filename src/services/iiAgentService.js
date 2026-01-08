/**
 * ============================================
 * II-Agent API Service
 * ============================================
 * 
 * Frontend service for II-Agent customization
 * Handles agent configuration, execution, and monitoring
 */

import { fetchAuthed } from '../utils/fetchAuthed';

const API_BASE = '/api/v1';

// ============================================
// II-Agent Full Registry (19 Agents)
// ============================================

export const II_AGENT_REGISTRY = {
  // Core Processing Agents
  nlu: {
    id: 'nlu',
    name: 'NLU Agent',
    description: 'Natural Language Understanding & Intent Classification',
    color: '#8B5CF6',
    tier: 'core',
    defaultModel: 'groq-llama-3.3-70b',
    category: 'processing',
  },
  codegen: {
    id: 'codegen',
    name: 'Codegen Agent',
    description: 'Code Generation & Refactoring',
    color: '#10B981',
    tier: 'premium',
    defaultModel: 'claude-3.5-sonnet',
    category: 'processing',
  },
  research: {
    id: 'research',
    name: 'Research Agent',
    description: 'Web Research & Information Synthesis',
    color: '#3B82F6',
    tier: 'premium',
    defaultModel: 'gemini-2.0-pro',
    category: 'processing',
  },
  validation: {
    id: 'validation',
    name: 'Validation Agent',
    description: 'Code Validation & Quality Checks',
    color: '#F59E0B',
    tier: 'standard',
    defaultModel: 'gpt-4o-mini',
    category: 'processing',
  },
  security: {
    id: 'security',
    name: 'Security Agent',
    description: 'Security Scanning & Compliance',
    color: '#EF4444',
    tier: 'premium',
    defaultModel: 'claude-3.5-sonnet',
    category: 'processing',
  },
  
  // Reasoning & Analysis Agents
  reasoning: {
    id: 'reasoning',
    name: 'Reasoning Agent',
    description: 'Complex Reasoning & Problem Solving',
    color: '#EC4899',
    tier: 'premium',
    defaultModel: 'gpt-4o',
    category: 'reasoning',
  },
  multimodal: {
    id: 'multimodal',
    name: 'Multimodal Agent',
    description: 'Vision, Audio, and Multi-modal Processing',
    color: '#06B6D4',
    tier: 'premium',
    defaultModel: 'gemini-2.0-pro',
    category: 'reasoning',
  },
  synthesis: {
    id: 'synthesis',
    name: 'Synthesis Agent',
    description: 'Combines outputs from multiple agents',
    color: '#8B5CF6',
    tier: 'premium',
    defaultModel: 'claude-3.5-sonnet',
    category: 'reasoning',
  },
  
  // Infrastructure Agents
  deploy: {
    id: 'deploy',
    name: 'Deploy Agent',
    description: 'Deployment & Infrastructure',
    color: '#6366F1',
    tier: 'standard',
    defaultModel: 'gpt-4o-mini',
    category: 'infrastructure',
  },
  data: {
    id: 'data',
    name: 'Data Agent',
    description: 'Data Processing & SQL Generation',
    color: '#84CC16',
    tier: 'standard',
    defaultModel: 'gpt-4o-mini',
    category: 'infrastructure',
  },
  streaming: {
    id: 'streaming',
    name: 'Streaming Agent',
    description: 'Real-time streaming & WebSocket handling',
    color: '#14B8A6',
    tier: 'standard',
    defaultModel: 'groq-llama-3.3-70b',
    category: 'infrastructure',
  },
  kg: {
    id: 'kg',
    name: 'Knowledge Graph Agent',
    description: 'Knowledge graph queries & reasoning',
    color: '#A855F7',
    tier: 'premium',
    defaultModel: 'gpt-4o',
    category: 'infrastructure',
  },
  
  // Operations Agents
  observability: {
    id: 'observability',
    name: 'Observability Agent',
    description: 'Logging, tracing, and monitoring',
    color: '#F97316',
    tier: 'standard',
    defaultModel: 'gpt-4o-mini',
    category: 'operations',
  },
  costopt: {
    id: 'costopt',
    name: 'Cost Optimization Agent',
    description: 'Token & cost optimization',
    color: '#22C55E',
    tier: 'standard',
    defaultModel: 'groq-llama-3.3-70b',
    category: 'operations',
  },
  legal: {
    id: 'legal',
    name: 'Legal Agent',
    description: 'Compliance & legal review',
    color: '#64748B',
    tier: 'premium',
    defaultModel: 'claude-3.5-sonnet',
    category: 'operations',
  },
  
  // Human & Learning Agents
  hitl: {
    id: 'hitl',
    name: 'Human-in-the-Loop Agent',
    description: 'Human approval workflows',
    color: '#F472B6',
    tier: 'standard',
    defaultModel: 'gpt-4o-mini',
    category: 'learning',
  },
  prompt: {
    id: 'prompt',
    name: 'Prompt Agent',
    description: 'Prompt engineering & optimization',
    color: '#FACC15',
    tier: 'standard',
    defaultModel: 'claude-3.5-sonnet',
    category: 'learning',
  },
  tools: {
    id: 'tools',
    name: 'Tools Agent',
    description: 'External tool integration & execution',
    color: '#0EA5E9',
    tier: 'standard',
    defaultModel: 'gpt-4o-mini',
    category: 'learning',
  },
  learning: {
    id: 'learning',
    name: 'Learning Agent',
    description: 'Continuous learning & improvement',
    color: '#D946EF',
    tier: 'premium',
    defaultModel: 'gpt-4o',
    category: 'learning',
  },
};

// ============================================
// Model Options
// ============================================

export const MODEL_OPTIONS = [
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', tier: 'premium', tokensPerDollar: 2500 },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', tier: 'standard', tokensPerDollar: 16000 },
  { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', tier: 'premium', tokensPerDollar: 3300 },
  { id: 'claude-3-haiku', name: 'Claude 3 Haiku', provider: 'Anthropic', tier: 'economy', tokensPerDollar: 80000 },
  { id: 'gemini-2.0-pro', name: 'Gemini 2.0 Pro', provider: 'Google', tier: 'premium', tokensPerDollar: 4000 },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'Google', tier: 'standard', tokensPerDollar: 25000 },
  { id: 'groq-llama-3.3-70b', name: 'Llama 3.3 70B', provider: 'Groq', tier: 'economy', tokensPerDollar: 125000 },
  { id: 'deepseek-v3', name: 'DeepSeek V3', provider: 'DeepSeek', tier: 'economy', tokensPerDollar: 100000 },
  { id: 'o1-preview', name: 'o1 Preview', provider: 'OpenAI', tier: 'premium', tokensPerDollar: 500 },
  { id: 'o1-mini', name: 'o1 Mini', provider: 'OpenAI', tier: 'premium', tokensPerDollar: 1250 },
];

// ============================================
// Agent Categories
// ============================================

export const AGENT_CATEGORIES = {
  processing: { name: 'Processing', icon: 'Cpu', description: 'Core task processing agents' },
  reasoning: { name: 'Reasoning', icon: 'Brain', description: 'Complex reasoning and synthesis' },
  infrastructure: { name: 'Infrastructure', icon: 'Server', description: 'Data and deployment' },
  operations: { name: 'Operations', icon: 'Settings', description: 'Monitoring and optimization' },
  learning: { name: 'Learning', icon: 'GraduationCap', description: 'Human interaction and learning' },
};

// ============================================
// API Functions
// ============================================

/**
 * Get all agent configurations from D1
 */
export async function getAgentConfigs() {
  try {
    const response = await fetchAuthed(`${API_BASE}/acheevy/agents`);
    if (!response.ok) return { configs: {}, defaults: II_AGENT_REGISTRY };
    return response.json();
  } catch (error) {
    console.error('Failed to fetch agent configs:', error);
    return { configs: {}, defaults: II_AGENT_REGISTRY };
  }
}

/**
 * Update agent configuration
 */
export async function updateAgentConfig(agentId, config) {
  const response = await fetchAuthed(`${API_BASE}/acheevy/agents/${agentId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  if (!response.ok) throw new Error('Failed to update agent config');
  return response.json();
}

/**
 * Execute a single agent task
 */
export async function executeAgent(agentId, task, options = {}) {
  const response = await fetchAuthed(`${API_BASE}/oracle/route/${agentId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: task, options }),
  });
  if (!response.ok) throw new Error('Agent execution failed');
  return response.json();
}

/**
 * Execute a KingMode workflow
 */
export async function executeKingMode(task, strategy = 'STANDARD', options = {}) {
  const response = await fetchAuthed(`${API_BASE}/acheevy/kingmode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task, strategy, options }),
  });
  if (!response.ok) throw new Error('KingMode execution failed');
  return response.json();
}

/**
 * Execute a custom workflow pipeline
 */
export async function executeWorkflow(agents, task, options = {}) {
  const response = await fetchAuthed(`${API_BASE}/acheevy/workflow`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agents, task, options }),
  });
  if (!response.ok) throw new Error('Workflow execution failed');
  return response.json();
}

/**
 * Get agent metrics
 */
export async function getAgentMetrics(agentId = null) {
  const url = agentId 
    ? `${API_BASE}/acheevy/metrics/${agentId}`
    : `${API_BASE}/acheevy/metrics`;
  try {
    const response = await fetchAuthed(url);
    if (!response.ok) return { metrics: [] };
    return response.json();
  } catch (error) {
    return { metrics: [] };
  }
}

/**
 * Save workflow template
 */
export async function saveWorkflowTemplate(name, agents, description = '') {
  const response = await fetchAuthed(`${API_BASE}/acheevy/workflows`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, agents, description }),
  });
  if (!response.ok) throw new Error('Failed to save workflow');
  return response.json();
}

/**
 * Get saved workflow templates
 */
export async function getWorkflowTemplates() {
  try {
    const response = await fetchAuthed(`${API_BASE}/acheevy/workflows`);
    if (!response.ok) return { templates: [] };
    return response.json();
  } catch (error) {
    return { templates: [] };
  }
}

/**
 * Test agent health
 */
export async function testAgentHealth(agentId) {
  try {
    const response = await fetchAuthed(`${API_BASE}/acheevy/health/${agentId}`);
    if (!response.ok) return { healthy: false, error: 'Health check failed' };
    return response.json();
  } catch (error) {
    return { healthy: false, error: error.message };
  }
}

// ============================================
// Utility Functions
// ============================================

/**
 * Get agents by category
 */
export function getAgentsByCategory(category) {
  return Object.values(II_AGENT_REGISTRY).filter(a => a.category === category);
}

/**
 * Get all agents as array
 */
export function getAllAgents() {
  return Object.values(II_AGENT_REGISTRY);
}

/**
 * Get agent by ID
 */
export function getAgent(agentId) {
  return II_AGENT_REGISTRY[agentId] || null;
}

/**
 * Get model by ID
 */
export function getModel(modelId) {
  return MODEL_OPTIONS.find(m => m.id === modelId) || null;
}

/**
 * Estimate cost for tokens
 */
export function estimateCost(modelId, tokens) {
  const model = getModel(modelId);
  if (!model) return 0;
  return tokens / model.tokensPerDollar;
}

/**
 * Get models by tier
 */
export function getModelsByTier(tier) {
  return MODEL_OPTIONS.filter(m => m.tier === tier);
}

export default {
  II_AGENT_REGISTRY,
  MODEL_OPTIONS,
  AGENT_CATEGORIES,
  getAgentConfigs,
  updateAgentConfig,
  executeAgent,
  executeKingMode,
  executeWorkflow,
  getAgentMetrics,
  saveWorkflowTemplate,
  getWorkflowTemplates,
  testAgentHealth,
  getAgentsByCategory,
  getAllAgents,
  getAgent,
  getModel,
  estimateCost,
  getModelsByTier,
};
