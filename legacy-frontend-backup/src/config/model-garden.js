/**
 * NurdsCode Model Garden Configuration
 * Unified access to Open Source and Closed Source AI Models
 * Similar to Genspark's model selection approach
 */

export const MODEL_GARDEN = {
  // === CLOSED SOURCE (API-based) ===
  closedSource: {
    // OpenAI Models
    'gpt-4o': {
      provider: 'openai',
      name: 'GPT-4o',
      description: 'Most capable OpenAI model for complex tasks',
      inputCost: 0.005,  // per 1K tokens
      outputCost: 0.015,
      maxTokens: 128000,
      capabilities: ['text', 'vision', 'code', 'reasoning'],
      speed: 'medium',
      tier: 'premium'
    },
    'gpt-4o-mini': {
      provider: 'openai',
      name: 'GPT-4o Mini',
      description: 'Fast and affordable for most tasks',
      inputCost: 0.00015,
      outputCost: 0.0006,
      maxTokens: 128000,
      capabilities: ['text', 'vision', 'code'],
      speed: 'fast',
      tier: 'standard'
    },
    'o1-preview': {
      provider: 'openai',
      name: 'O1 Preview',
      description: 'Advanced reasoning model',
      inputCost: 0.015,
      outputCost: 0.06,
      maxTokens: 128000,
      capabilities: ['reasoning', 'math', 'code'],
      speed: 'slow',
      tier: 'enterprise'
    },

    // Anthropic Models
    'claude-3-5-sonnet': {
      provider: 'anthropic',
      name: 'Claude 3.5 Sonnet',
      description: 'Best balance of intelligence and speed',
      inputCost: 0.003,
      outputCost: 0.015,
      maxTokens: 200000,
      capabilities: ['text', 'vision', 'code', 'reasoning'],
      speed: 'medium',
      tier: 'premium'
    },
    'claude-3-5-haiku': {
      provider: 'anthropic',
      name: 'Claude 3.5 Haiku',
      description: 'Fast responses for simple tasks',
      inputCost: 0.0008,
      outputCost: 0.004,
      maxTokens: 200000,
      capabilities: ['text', 'code'],
      speed: 'fast',
      tier: 'standard'
    },
    'claude-3-opus': {
      provider: 'anthropic',
      name: 'Claude 3 Opus',
      description: 'Most powerful Claude for complex analysis',
      inputCost: 0.015,
      outputCost: 0.075,
      maxTokens: 200000,
      capabilities: ['text', 'vision', 'code', 'reasoning'],
      speed: 'slow',
      tier: 'enterprise'
    },

    // Google Models
    'gemini-2.0-flash': {
      provider: 'google',
      name: 'Gemini 2.0 Flash',
      description: 'Latest Gemini for fast multimodal tasks',
      inputCost: 0.0001,
      outputCost: 0.0004,
      maxTokens: 1000000,
      capabilities: ['text', 'vision', 'audio', 'code'],
      speed: 'fast',
      tier: 'standard'
    },
    'gemini-2.0-flash-thinking': {
      provider: 'google',
      name: 'Gemini 2.0 Flash Thinking',
      description: 'Reasoning-enhanced Gemini',
      inputCost: 0.0001,
      outputCost: 0.0004,
      maxTokens: 1000000,
      capabilities: ['text', 'reasoning', 'code'],
      speed: 'medium',
      tier: 'premium'
    },

    // Groq (Ultra-fast inference)
    'llama-3.3-70b-versatile': {
      provider: 'groq',
      name: 'Llama 3.3 70B (Groq)',
      description: 'Ultra-fast inference via Groq',
      inputCost: 0.00059,
      outputCost: 0.00079,
      maxTokens: 32768,
      capabilities: ['text', 'code'],
      speed: 'ultra-fast',
      tier: 'standard'
    },

    // Perplexity (Search-enhanced)
    'sonar-pro': {
      provider: 'perplexity',
      name: 'Sonar Pro',
      description: 'Search-grounded responses',
      inputCost: 0.003,
      outputCost: 0.015,
      maxTokens: 200000,
      capabilities: ['text', 'search', 'citations'],
      speed: 'medium',
      tier: 'premium'
    }
  },

  // === OPEN SOURCE (Self-hosted or via providers) ===
  openSource: {
    // Meta Llama
    'llama-3.3-70b': {
      provider: 'together|fireworks|modal',
      name: 'Llama 3.3 70B',
      description: 'Meta\'s latest open-weight model',
      inputCost: 0.0009,
      outputCost: 0.0009,
      maxTokens: 128000,
      capabilities: ['text', 'code'],
      speed: 'medium',
      tier: 'standard',
      license: 'Llama 3.3 Community'
    },
    'llama-3.2-90b-vision': {
      provider: 'together|fireworks',
      name: 'Llama 3.2 90B Vision',
      description: 'Open multimodal model',
      inputCost: 0.0012,
      outputCost: 0.0012,
      maxTokens: 128000,
      capabilities: ['text', 'vision', 'code'],
      speed: 'medium',
      tier: 'premium',
      license: 'Llama 3.2 Community'
    },

    // Mistral
    'mistral-large-2': {
      provider: 'mistral|together',
      name: 'Mistral Large 2',
      description: 'Frontier-class open model',
      inputCost: 0.002,
      outputCost: 0.006,
      maxTokens: 128000,
      capabilities: ['text', 'code', 'reasoning'],
      speed: 'medium',
      tier: 'premium',
      license: 'Apache 2.0'
    },
    'codestral': {
      provider: 'mistral',
      name: 'Codestral',
      description: 'Specialized for code generation',
      inputCost: 0.001,
      outputCost: 0.003,
      maxTokens: 32000,
      capabilities: ['code'],
      speed: 'fast',
      tier: 'standard',
      license: 'Mistral AI'
    },

    // DeepSeek
    'deepseek-v3': {
      provider: 'deepseek|together',
      name: 'DeepSeek V3',
      description: 'Cost-effective reasoning model',
      inputCost: 0.00014,
      outputCost: 0.00028,
      maxTokens: 64000,
      capabilities: ['text', 'code', 'reasoning'],
      speed: 'fast',
      tier: 'budget',
      license: 'DeepSeek'
    },
    'deepseek-r1': {
      provider: 'deepseek',
      name: 'DeepSeek R1',
      description: 'Open reasoning model',
      inputCost: 0.00055,
      outputCost: 0.00219,
      maxTokens: 64000,
      capabilities: ['reasoning', 'math', 'code'],
      speed: 'slow',
      tier: 'premium',
      license: 'MIT'
    },

    // Qwen
    'qwen-2.5-72b': {
      provider: 'together|fireworks',
      name: 'Qwen 2.5 72B',
      description: 'Alibaba\'s flagship open model',
      inputCost: 0.0009,
      outputCost: 0.0009,
      maxTokens: 128000,
      capabilities: ['text', 'code', 'math'],
      speed: 'medium',
      tier: 'standard',
      license: 'Apache 2.0'
    },

    // Nous/Community
    'hermes-3-llama-3.1-405b': {
      provider: 'together',
      name: 'Hermes 3 405B',
      description: 'Community fine-tuned Llama',
      inputCost: 0.005,
      outputCost: 0.005,
      maxTokens: 128000,
      capabilities: ['text', 'code', 'reasoning'],
      speed: 'slow',
      tier: 'enterprise',
      license: 'Llama 3.1 Community'
    }
  },

  // === VIDEO GENERATION MODELS ===
  videoGeneration: {
    'runway-gen3': {
      provider: 'runway',
      name: 'Runway Gen-3 Alpha',
      description: 'High-quality video generation',
      costPerSecond: 0.05,
      maxDuration: 10,
      resolution: '1080p',
      tier: 'premium'
    },
    'kling-1.6': {
      provider: 'kling',
      name: 'Kling 1.6',
      description: 'Fast video generation with motion',
      costPerSecond: 0.02,
      maxDuration: 10,
      resolution: '1080p',
      tier: 'standard'
    },
    'pika-2.0': {
      provider: 'pika',
      name: 'Pika 2.0',
      description: 'Creative video effects',
      costPerSecond: 0.03,
      maxDuration: 4,
      resolution: '1080p',
      tier: 'standard'
    },
    'luma-dream-machine': {
      provider: 'luma',
      name: 'Luma Dream Machine',
      description: 'Realistic motion and physics',
      costPerSecond: 0.04,
      maxDuration: 5,
      resolution: '1080p',
      tier: 'premium'
    },
    'minimax-video-01': {
      provider: 'minimax',
      name: 'MiniMax Video-01',
      description: 'Long-form video generation',
      costPerSecond: 0.01,
      maxDuration: 60,
      resolution: '720p',
      tier: 'budget'
    },
    'stable-video-diffusion': {
      provider: 'stability|modal',
      name: 'Stable Video Diffusion',
      description: 'Open-source video model',
      costPerSecond: 0.005,
      maxDuration: 4,
      resolution: '1024x576',
      tier: 'budget',
      license: 'Stability AI'
    }
  },

  // === IMAGE GENERATION MODELS ===
  imageGeneration: {
    'flux-1.1-pro': {
      provider: 'bfl|together',
      name: 'FLUX 1.1 Pro',
      description: 'State-of-the-art image quality',
      costPerImage: 0.04,
      maxResolution: '2048x2048',
      tier: 'premium'
    },
    'ideogram-2.0': {
      provider: 'ideogram',
      name: 'Ideogram 2.0',
      description: 'Best text rendering in images',
      costPerImage: 0.08,
      maxResolution: '2048x2048',
      tier: 'premium'
    },
    'dall-e-3': {
      provider: 'openai',
      name: 'DALL-E 3',
      description: 'OpenAI image generation',
      costPerImage: 0.04,
      maxResolution: '1024x1024',
      tier: 'standard'
    },
    'stable-diffusion-3': {
      provider: 'stability|modal',
      name: 'Stable Diffusion 3',
      description: 'Open-source image model',
      costPerImage: 0.003,
      maxResolution: '1024x1024',
      tier: 'budget',
      license: 'Stability AI'
    }
  },

  // === AUDIO/VOICE MODELS ===
  audio: {
    'elevenlabs-turbo-v2.5': {
      provider: 'elevenlabs',
      name: 'ElevenLabs Turbo v2.5',
      description: 'Ultra-low latency TTS',
      costPer1000Chars: 0.18,
      tier: 'premium'
    },
    'openai-tts-1-hd': {
      provider: 'openai',
      name: 'OpenAI TTS HD',
      description: 'High-quality text-to-speech',
      costPer1000Chars: 0.03,
      tier: 'standard'
    },
    'whisper-large-v3': {
      provider: 'openai|groq',
      name: 'Whisper Large v3',
      description: 'Speech-to-text transcription',
      costPerMinute: 0.006,
      tier: 'standard',
      license: 'MIT'
    }
  }
};

// Helper functions
export function getModelsByCapability(capability) {
  const results = [];
  for (const [id, model] of Object.entries({...MODEL_GARDEN.closedSource, ...MODEL_GARDEN.openSource})) {
    if (model.capabilities?.includes(capability)) {
      results.push({ id, ...model });
    }
  }
  return results;
}

export function getModelsByTier(tier) {
  const results = [];
  for (const category of Object.values(MODEL_GARDEN)) {
    for (const [id, model] of Object.entries(category)) {
      if (model.tier === tier) {
        results.push({ id, ...model });
      }
    }
  }
  return results;
}

export function estimateCost(modelId, inputTokens, outputTokens) {
  const allModels = {...MODEL_GARDEN.closedSource, ...MODEL_GARDEN.openSource};
  const model = allModels[modelId];
  if (!model) return null;
  
  const inputCost = (inputTokens / 1000) * model.inputCost;
  const outputCost = (outputTokens / 1000) * model.outputCost;
  return { inputCost, outputCost, totalCost: inputCost + outputCost };
}

export default MODEL_GARDEN;
