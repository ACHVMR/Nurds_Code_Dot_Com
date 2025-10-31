/**
 * Circuit Box Orchestration Service
 * ACHEEVY-driven automatic service provisioning based on use cases
 */

/**
 * Available API integrations in Circuit Box
 */
export const AVAILABLE_APIS = {
  'manus-ai': { name: 'Manus AI', category: 'robotics', description: 'Humanoid robotics control API' },
  'openai': { name: 'OpenAI', category: 'llm', description: 'GPT models and embeddings' },
  'anthropic': { name: 'Anthropic', category: 'llm', description: 'Claude AI models' },
  'groq': { name: 'GROQ', category: 'llm', description: 'Ultra-fast LLM inference' },
  'deepgram': { name: 'Deepgram', category: 'voice', description: 'Speech-to-text API' },
  'elevenlabs': { name: 'ElevenLabs', category: 'voice', description: 'Text-to-speech API' },
  'stripe': { name: 'Stripe', category: 'payments', description: 'Payment processing' },
  'supabase': { name: 'Supabase', category: 'database', description: 'PostgreSQL + real-time' },
  'cloudflare-ai': { name: 'Cloudflare AI', category: 'llm', description: 'Workers AI models' },
  'github': { name: 'GitHub', category: 'vcs', description: 'Version control and CI/CD' },
  'vercel': { name: 'Vercel', category: 'deployment', description: 'Serverless deployment' },
  'modal': { name: 'Modal', category: 'compute', description: 'Cloud compute for ML' },
  'replicate': { name: 'Replicate', category: 'ml', description: 'ML model hosting' },
  'huggingface': { name: 'Hugging Face', category: 'ml', description: 'Model hub and inference' }
};

/**
 * Use case definitions with required breakers and APIs
 */
export const USE_CASES = {
  'voice-assistant': {
    name: 'Voice Assistant',
    description: 'Voice-controlled AI with STT/TTS (Whisper, Deepgram, ElevenLabs)',
    breakers: ['breaker-1', 'breaker-2', 'breaker-3', 'breaker-5', 'breaker-10'],
    apis: ['openai', 'deepgram', 'elevenlabs', 'supabase'],
    minTier: 'coffee',
    services: ['Workers API', 'Clerk Auth', 'Supabase', 'LLM Gateway', 'Voice Integration']
  },
  'robotics-control': {
    name: 'Robotics Control (Manus AI)',
    description: 'Humanoid robot control and automation with Manus AI integration',
    breakers: ['breaker-1', 'breaker-2', 'breaker-3', 'breaker-5', 'breaker-15'],
    apis: ['manus-ai', 'openai', 'cloudflare-ai', 'supabase'],
    minTier: 'heavy',
    services: ['Workers API', 'Clerk Auth', 'Supabase', 'LLM Gateway', 'Manus AI', 'Agent Builder']
  },
  'ai-agent-builder': {
    name: 'AI Agent Builder',
    description: 'Multi-framework agent builder with Boomer_Angs naming',
    breakers: ['breaker-1', 'breaker-2', 'breaker-3', 'breaker-5', 'breaker-15'],
    apis: ['openai', 'anthropic', 'groq', 'supabase', 'github'],
    minTier: 'lite',
    services: ['Workers API', 'Clerk Auth', 'Supabase', 'LLM Gateway', 'Multi-Agent Builder']
  },
  'code-editor': {
    name: 'Code Editor',
    description: 'Multi-language code editor with AI assistance',
    breakers: ['breaker-1', 'breaker-2', 'breaker-3', 'breaker-35'],
    apis: ['openai', 'supabase', 'github'],
    minTier: 'free',
    services: ['Workers API', 'Clerk Auth', 'Supabase', 'Code Editor']
  },
  'ml-deployment': {
    name: 'ML Model Deployment',
    description: 'Deploy and serve ML models with Replicate/HuggingFace',
    breakers: ['breaker-1', 'breaker-2', 'breaker-3', 'breaker-5'],
    apis: ['replicate', 'huggingface', 'modal', 'supabase'],
    minTier: 'medium',
    services: ['Workers API', 'Clerk Auth', 'Supabase', 'ML Hosting']
  },
  'full-platform': {
    name: 'Full Platform (All APIs)',
    description: 'All services enabled (Voice, Agents, Editor, Billing, Security, Robotics, ML)',
    breakers: ['breaker-1', 'breaker-2', 'breaker-3', 'breaker-4', 'breaker-5', 'breaker-6', 'breaker-10', 'breaker-15', 'breaker-20', 'breaker-30', 'breaker-32', 'breaker-35'],
    apis: Object.keys(AVAILABLE_APIS),
    minTier: 'superior',
    services: ['All Services + All APIs']
  },
  'security-scan': {
    name: 'Security Scanner',
    description: 'Vulnerability detection with The_Farmer agent',
    breakers: ['breaker-1', 'breaker-2', 'breaker-3', 'breaker-30', 'breaker-32'],
    minTier: 'heavy',
    services: ['Workers API', 'Clerk Auth', 'Supabase', 'RBAC', 'Security Scanner']
  },
  'billing-only': {
    name: 'Billing Only',
    description: 'Core platform with Stripe integration',
    breakers: ['breaker-1', 'breaker-2', 'breaker-3', 'breaker-20'],
    minTier: 'free',
    services: ['Workers API', 'Clerk Auth', 'Supabase', 'Stripe Integration']
  }
};

/**
 * Tier-based service limits
 */
export const TIER_LIMITS = {
  free: {
    maxBreakers: 4,
    allowedUseCases: ['code-editor', 'billing-only']
  },
  coffee: {
    maxBreakers: 5,
    allowedUseCases: ['code-editor', 'voice-assistant', 'billing-only']
  },
  lite: {
    maxBreakers: 8,
    allowedUseCases: ['code-editor', 'voice-assistant', 'ai-agent-builder', 'billing-only']
  },
  medium: {
    maxBreakers: 12,
    allowedUseCases: ['code-editor', 'voice-assistant', 'ai-agent-builder', 'billing-only', 'security-scan']
  },
  heavy: {
    maxBreakers: 16,
    allowedUseCases: ['code-editor', 'voice-assistant', 'ai-agent-builder', 'billing-only', 'security-scan']
  },
  superior: {
    maxBreakers: 999,
    allowedUseCases: Object.keys(USE_CASES)
  }
};

/**
 * Orchestrate circuit breakers for a use case
 * @param {string} useCase - Use case identifier
 * @param {string} tier - User tier
 * @param {string} token - Auth token
 * @returns {Promise<Object>} Orchestration result
 */
export async function orchestrateCircuitBox(useCase, tier, token) {
  const useCaseConfig = USE_CASES[useCase];
  
  if (!useCaseConfig) {
    throw new Error(`Unknown use case: ${useCase}`);
  }

  // Check tier eligibility
  const tierLimits = TIER_LIMITS[tier] || TIER_LIMITS.free;
  if (!tierLimits.allowedUseCases.includes(useCase)) {
    throw new Error(`Use case '${useCaseConfig.name}' requires tier '${useCaseConfig.minTier}' or higher`);
  }

  // Call orchestration endpoint
  const response = await fetch('/api/admin/circuit-box/orchestrate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      useCase,
      tier,
      services: useCaseConfig.breakers
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Orchestration failed');
  }

  return await response.json();
}

/**
 * Get available use cases for a tier
 * @param {string} tier - User tier
 * @returns {Array} Available use cases
 */
export function getAvailableUseCases(tier) {
  const tierLimits = TIER_LIMITS[tier] || TIER_LIMITS.free;
  return tierLimits.allowedUseCases.map(key => ({
    id: key,
    ...USE_CASES[key]
  }));
}

/**
 * Check if user can enable a specific breaker
 * @param {string} tier - User tier
 * @param {number} currentCount - Current enabled breakers
 * @returns {boolean} Can enable more breakers
 */
export function canEnableBreaker(tier, currentCount) {
  const tierLimits = TIER_LIMITS[tier] || TIER_LIMITS.free;
  return currentCount < tierLimits.maxBreakers;
}

/**
 * ACHEEVY webhook handler: Auto-configure based on external signals
 * @param {Object} payload - ACHEEVY webhook payload
 * @param {string} token - Auth token
 * @returns {Promise<Object>} Configuration result
 */
export async function handleACHEEVYWebhook(payload, token) {
  const { action, useCase, tier, userId, metadata } = payload;

  if (action === 'provision') {
    // Auto-provision based on detected user intent
    return await orchestrateCircuitBox(useCase || 'code-editor', tier || 'free', token);
  }

  if (action === 'upgrade') {
    // Re-orchestrate for upgraded tier
    return await orchestrateCircuitBox(useCase || 'full-platform', tier, token);
  }

  if (action === 'feature-request') {
    // Enable specific features dynamically
    const response = await fetch('/api/admin/circuit-box/orchestrate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        useCase: 'custom',
        tier,
        services: metadata?.requiredBreakers || []
      })
    });

    return await response.json();
  }

  throw new Error(`Unknown ACHEEVY action: ${action}`);
}
