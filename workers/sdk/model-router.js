/**
 * NURDS Code - Model Router
 * 
 * Cost-Optimized Multi-Model Strategy
 * Gemini 3 Flash (reasoning) + GLM 4.7 (code generation)
 * 
 * Cost Comparison vs GPT-4o:
 * - GPT-4o: ~$3-5 per execution
 * - Gemini 3 Flash: ~$0.02-0.05 per execution
 * - GLM 4.7: ~$0.01-0.03 per execution
 */

// ============================================================
// MODEL ROUTING CONFIGURATION
// ============================================================

export const MODEL_ROUTING = {
  // Mode-based routing
  brainstorming: {
    primary: "google/gemini-3-flash-preview",
    fallback: "@cf/meta/llama-3-70b-instruct",
    cost_per_million: 1.13,
    reason: "Superior reasoning (71.3 index)",
    tasks: ["4-Question Lens", "SWOT Analysis", "Strategy"]
  },
  
  nurd_out: {
    planning: "google/gemini-3-flash-preview",
    coding: "z-ai/glm-4.7",
    cost_per_million: 1.06,
    reason: "Hybrid - Plan with Gemini, code with GLM",
    tasks: ["Architecture", "Deep Planning", "OKRs"]
  },
  
  agent_mode: {
    primary: "z-ai/glm-4.7",
    fallback: "google/gemini-3-flash-preview",
    cost_per_million: 0.87,
    reason: "GLM 4.7 excels at code generation, 70% cheaper output",
    tasks: ["Code execution", "Heavy lifting", "Co-execution"],
    open_source: true
  },
  
  edit_mode: {
    primary: "z-ai/glm-4.7",
    fallback: "@cf/meta/llama-3-8b-instruct",
    cost_per_million: 0.87,
    reason: "Minimal token usage for refinement",
    tasks: ["Small edits", "Styling", "Bug fixes"]
  }
};

// ============================================================
// CLOUDFLARE WORKERS AI MODELS
// ============================================================

export const CF_WORKERS_AI_MODELS = {
  // Meta LLaMA models (built-in)
  llama_70b: "@cf/meta/llama-3-70b-instruct",
  llama_8b: "@cf/meta/llama-3-8b-instruct",
  
  // Code-focused models
  codellama: "@cf/meta/codellama-34b-instruct",
  deepseek_coder: "@cf/deepseek/deepseek-coder-33b-instruct",
  
  // Reasoning models
  mistral: "@cf/mistral/mistral-7b-instruct-v0.2",
  
  // Custom LoRA (user-defined)
  custom_lora: (loraId) => `@cf/lora/${loraId}`
};

// ============================================================
// EXTERNAL MODEL PROVIDERS
// ============================================================

export const EXTERNAL_MODELS = {
  // Google Gemini (via API)
  gemini_flash: {
    id: "google/gemini-3-flash-preview",
    endpoint: "https://generativelanguage.googleapis.com/v1beta",
    pricing: {
      input: 0.075,   // $/1M tokens
      output: 0.30    // $/1M tokens
    }
  },
  
  gemini_pro: {
    id: "google/gemini-2.0-pro",
    endpoint: "https://generativelanguage.googleapis.com/v1beta",
    pricing: {
      input: 1.25,
      output: 5.00
    }
  },
  
  // Z-AI GLM (via OpenRouter or direct)
  glm_4_7: {
    id: "z-ai/glm-4.7",
    endpoint: "https://open.bigmodel.cn/api/paas/v4",
    pricing: {
      input: 0.60,
      output: 0.60
    }
  },
  
  // OpenAI (fallback)
  gpt_4o: {
    id: "openai/gpt-4o",
    endpoint: "https://api.openai.com/v1",
    pricing: {
      input: 2.50,
      output: 10.00
    }
  }
};

// ============================================================
// TASK-TO-MODEL MAPPING
// ============================================================

export const TASK_MODEL_MAP = {
  // Reasoning tasks → Gemini Flash
  "complex_reasoning": MODEL_ROUTING.brainstorming.primary,
  "strategic_planning": MODEL_ROUTING.brainstorming.primary,
  "swot_analysis": MODEL_ROUTING.brainstorming.primary,
  "okr_generation": MODEL_ROUTING.nurd_out.planning,
  "architecture_design": MODEL_ROUTING.nurd_out.planning,
  
  // Code generation → GLM 4.7
  "code_generation": MODEL_ROUTING.agent_mode.primary,
  "code_completion": MODEL_ROUTING.agent_mode.primary,
  "code_refactoring": MODEL_ROUTING.agent_mode.primary,
  "bug_fix": MODEL_ROUTING.edit_mode.primary,
  "styling": MODEL_ROUTING.edit_mode.primary,
  
  // Hybrid tasks
  "full_stack_feature": {
    planning: MODEL_ROUTING.nurd_out.planning,
    implementation: MODEL_ROUTING.agent_mode.primary
  },
  
  // Verification
  "code_review": MODEL_ROUTING.brainstorming.primary,
  "security_audit": MODEL_ROUTING.brainstorming.primary
};

// ============================================================
// MODEL ROUTER CLASS
// ============================================================

export class ModelRouter {
  constructor(env) {
    this.env = env;
    this.defaultModel = CF_WORKERS_AI_MODELS.llama_70b;
  }
  
  /**
   * Select the optimal model based on task and mode
   */
  selectModel(task, mode = 'agent_mode', options = {}) {
    // Check if task has explicit mapping
    if (TASK_MODEL_MAP[task]) {
      const mapping = TASK_MODEL_MAP[task];
      if (typeof mapping === 'string') {
        return mapping;
      }
      // Hybrid task - return planning model first
      return options.phase === 'implementation' 
        ? mapping.implementation 
        : mapping.planning;
    }
    
    // Use mode-based routing
    const modeConfig = MODEL_ROUTING[mode];
    if (!modeConfig) {
      return this.defaultModel;
    }
    
    // Check if Gemini API key is available
    const hasGeminiKey = !!this.env.GOOGLE_AI_API_KEY;
    const hasGLMKey = !!this.env.GLM_API_KEY;
    
    // Route based on availability
    if (modeConfig.primary.includes('gemini') && !hasGeminiKey) {
      return modeConfig.fallback || this.defaultModel;
    }
    if (modeConfig.primary.includes('glm') && !hasGLMKey) {
      return modeConfig.fallback || this.defaultModel;
    }
    
    return modeConfig.primary;
  }
  
  /**
   * Execute with the selected model
   */
  async execute(prompt, options = {}) {
    const model = this.selectModel(options.task, options.mode, options);
    const startTime = Date.now();
    
    let response;
    let tokensUsed = 0;
    
    // Route to appropriate provider
    if (model.includes('gemini')) {
      response = await this.callGemini(model, prompt, options);
      tokensUsed = response.usageMetadata?.totalTokenCount || 0;
    } else if (model.includes('glm')) {
      response = await this.callGLM(model, prompt, options);
      tokensUsed = response.usage?.total_tokens || 0;
    } else if (model.startsWith('@cf/')) {
      response = await this.callCloudflareAI(model, prompt, options);
      tokensUsed = estimateTokens(prompt + (response.response || ''));
    } else {
      response = await this.callOpenAI(model, prompt, options);
      tokensUsed = response.usage?.total_tokens || 0;
    }
    
    const executionTime = Date.now() - startTime;
    
    return {
      response: response.response || response.text || response.choices?.[0]?.message?.content,
      model,
      tokensUsed,
      executionTime,
      estimatedCost: this.estimateCost(tokensUsed, model)
    };
  }
  
  /**
   * Call Gemini API
   */
  async callGemini(model, prompt, options = {}) {
    const apiKey = this.env.GOOGLE_AI_API_KEY;
    const endpoint = `${EXTERNAL_MODELS.gemini_flash.endpoint}/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: options.systemPrompt ? `${options.systemPrompt}\n\n${prompt}` : prompt }]
        }],
        generationConfig: {
          maxOutputTokens: options.maxTokens || 4096,
          temperature: options.temperature || 0.7
        }
      })
    });
    
    const data = await response.json();
    return {
      text: data.candidates?.[0]?.content?.parts?.[0]?.text,
      usageMetadata: data.usageMetadata
    };
  }
  
  /**
   * Call GLM API (Z-AI)
   */
  async callGLM(model, prompt, options = {}) {
    const apiKey = this.env.GLM_API_KEY;
    const endpoint = EXTERNAL_MODELS.glm_4_7.endpoint + '/chat/completions';
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'glm-4',
        messages: [
          ...(options.systemPrompt ? [{ role: 'system', content: options.systemPrompt }] : []),
          { role: 'user', content: prompt }
        ],
        max_tokens: options.maxTokens || 4096,
        temperature: options.temperature || 0.7
      })
    });
    
    const data = await response.json();
    return {
      response: data.choices?.[0]?.message?.content,
      usage: data.usage
    };
  }
  
  /**
   * Call Cloudflare Workers AI
   */
  async callCloudflareAI(model, prompt, options = {}) {
    const messages = [
      ...(options.systemPrompt ? [{ role: 'system', content: options.systemPrompt }] : []),
      { role: 'user', content: prompt }
    ];
    
    const response = await this.env.AI.run(model, {
      messages,
      max_tokens: options.maxTokens || 2048
    });
    
    return response;
  }
  
  /**
   * Call OpenAI API (fallback)
   */
  async callOpenAI(model, prompt, options = {}) {
    const apiKey = this.env.OPENAI_API_KEY;
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          ...(options.systemPrompt ? [{ role: 'system', content: options.systemPrompt }] : []),
          { role: 'user', content: prompt }
        ],
        max_tokens: options.maxTokens || 4096
      })
    });
    
    return await response.json();
  }
  
  /**
   * Estimate cost based on tokens and model
   */
  estimateCost(tokens, model) {
    let costPerMillion = 1.0; // default
    
    if (model.includes('gemini')) {
      costPerMillion = 1.13;
    } else if (model.includes('glm')) {
      costPerMillion = 0.87;
    } else if (model.includes('gpt-4o')) {
      costPerMillion = 5.0;
    } else if (model.startsWith('@cf/')) {
      costPerMillion = 0.10; // Workers AI is very cheap
    }
    
    return (tokens / 1000000) * costPerMillion;
  }
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function estimateTokens(text) {
  // Rough estimate: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
}

/**
 * Get cost comparison for a task
 */
export function getCostComparison(estimatedTokens) {
  return {
    gpt4o: {
      cost: (estimatedTokens / 1000000) * 5.0,
      label: 'GPT-4o'
    },
    gemini_flash: {
      cost: (estimatedTokens / 1000000) * 1.13,
      label: 'Gemini 3 Flash',
      savings: `${Math.round((1 - 1.13/5.0) * 100)}% cheaper`
    },
    glm_4_7: {
      cost: (estimatedTokens / 1000000) * 0.87,
      label: 'GLM 4.7',
      savings: `${Math.round((1 - 0.87/5.0) * 100)}% cheaper`
    },
    workers_ai: {
      cost: (estimatedTokens / 1000000) * 0.10,
      label: 'Workers AI',
      savings: `${Math.round((1 - 0.10/5.0) * 100)}% cheaper`
    }
  };
}
