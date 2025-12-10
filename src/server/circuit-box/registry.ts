// Model Registry - Available AI models and their configurations
export interface ModelConfig {
  id: string;
  name: string;
  provider: 'openrouter' | 'groq' | 'cloudflare' | 'huggingface';
  endpoint?: string;
  maxTokens: number;
  contextWindow: number;
  costPer1kTokens: number;
  capabilities: string[];
  tier: 'free' | 'coffee' | 'pro' | 'enterprise';
}

export const MODEL_REGISTRY: Record<string, ModelConfig> = {
  // DeepSeek V3 - Great for code generation
  'deepseek-v3': {
    id: 'deepseek/deepseek-chat',
    name: 'DeepSeek V3',
    provider: 'openrouter',
    maxTokens: 8192,
    contextWindow: 64000,
    costPer1kTokens: 0.0014,
    capabilities: ['code', 'reasoning', 'math', 'analysis'],
    tier: 'free',
  },

  // Qwen 2.5 - Excellent multilingual and code
  'qwen-2.5-72b': {
    id: 'qwen/qwen-2.5-72b-instruct',
    name: 'Qwen 2.5 72B',
    provider: 'openrouter',
    maxTokens: 8192,
    contextWindow: 131072,
    capabilities: ['code', 'multilingual', 'reasoning', 'creative'],
    costPer1kTokens: 0.0035,
    tier: 'coffee',
  },

  // GLM-4 - Chinese AI powerhouse
  'glm-4': {
    id: 'thudm/glm-4-9b-chat',
    name: 'GLM-4 9B',
    provider: 'openrouter',
    maxTokens: 4096,
    contextWindow: 128000,
    costPer1kTokens: 0.001,
    capabilities: ['code', 'chat', 'reasoning'],
    tier: 'free',
  },

  // Claude Haiku - Fast and efficient
  'claude-haiku': {
    id: 'anthropic/claude-3.5-haiku:beta',
    name: 'Claude 3.5 Haiku',
    provider: 'openrouter',
    maxTokens: 8192,
    contextWindow: 200000,
    costPer1kTokens: 0.001,
    capabilities: ['code', 'analysis', 'creative', 'fast'],
    tier: 'free',
  },

  // Claude Sonnet - Balanced performance
  'claude-sonnet': {
    id: 'anthropic/claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'openrouter',
    maxTokens: 8192,
    contextWindow: 200000,
    costPer1kTokens: 0.003,
    capabilities: ['code', 'analysis', 'creative', 'reasoning'],
    tier: 'pro',
  },

  // Groq Llama - Ultra fast inference
  'llama-3.1-70b': {
    id: 'llama-3.1-70b-versatile',
    name: 'Llama 3.1 70B (Groq)',
    provider: 'groq',
    maxTokens: 8192,
    contextWindow: 131072,
    costPer1kTokens: 0.0,
    capabilities: ['code', 'chat', 'fast'],
    tier: 'free',
  },

  // Cloudflare Workers AI
  'cf-llama-3': {
    id: '@cf/meta/llama-3-8b-instruct',
    name: 'Llama 3 8B (Cloudflare)',
    provider: 'cloudflare',
    maxTokens: 2048,
    contextWindow: 8192,
    costPer1kTokens: 0.0,
    capabilities: ['code', 'chat', 'edge'],
    tier: 'free',
  },
};

export function getModelForTier(tier: string): ModelConfig {
  const tierModels: Record<string, string> = {
    free: 'claude-haiku',
    coffee: 'qwen-2.5-72b',
    pro: 'claude-sonnet',
    enterprise: 'claude-sonnet',
  };

  const modelKey = tierModels[tier] || tierModels.free;
  return MODEL_REGISTRY[modelKey];
}

export function getModelById(id: string): ModelConfig | undefined {
  return Object.values(MODEL_REGISTRY).find(m => m.id === id);
}

export function listModels(tier?: string): ModelConfig[] {
  const models = Object.values(MODEL_REGISTRY);
  if (!tier) return models;

  const tierOrder = ['free', 'coffee', 'pro', 'enterprise'];
  const tierIndex = tierOrder.indexOf(tier);

  return models.filter(m => tierOrder.indexOf(m.tier) <= tierIndex);
}

export function getCodeModels(): ModelConfig[] {
  return Object.values(MODEL_REGISTRY).filter(m => 
    m.capabilities.includes('code')
  );
}
