/**
 * Codex LoRA Support
 * 
 * Purpose: Fine-tuned code generation using Cloudflare Workers AI
 * - LoRA adapters for domain-specific code patterns
 * - Fallback to base models when LoRA unavailable
 * - Integration with II-Codegen agent
 * 
 * Models: LLaMA 70B/8B with custom LoRA adapters
 */

// ============================================================
// LORA REGISTRY
// ============================================================

export const LORA_REGISTRY = {
  // Code generation LoRAs
  'nurds-react': {
    name: 'NURDS React Patterns',
    description: 'React + Tailwind + Framer Motion patterns used in NURDS Code',
    baseModel: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
    loraId: 'nurds-react-lora', // Deployed LoRA ID
    category: 'frontend',
    languages: ['javascript', 'typescript', 'jsx', 'tsx']
  },
  
  'nurds-workers': {
    name: 'NURDS Cloudflare Workers',
    description: 'Cloudflare Workers + D1 + itty-router patterns',
    baseModel: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
    loraId: 'nurds-workers-lora',
    category: 'backend',
    languages: ['javascript']
  },
  
  'nurds-sdk': {
    name: 'NURDS SDK Patterns',
    description: 'KingMode, VIBE SDK, ACHEEVY patterns',
    baseModel: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
    loraId: 'nurds-sdk-lora',
    category: 'sdk',
    languages: ['javascript', 'typescript']
  },
  
  'nurds-sql': {
    name: 'NURDS D1 SQL',
    description: 'D1 SQLite migrations and queries',
    baseModel: '@cf/meta/llama-3.1-8b-instruct',
    loraId: 'nurds-sql-lora',
    category: 'database',
    languages: ['sql']
  }
};

// ============================================================
// CODEX LORA CLASS
// ============================================================

export class CodexLoRA {
  constructor(env) {
    this.ai = env.AI; // Cloudflare Workers AI binding
    this.env = env;
    this.defaultModel = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';
    this.fastModel = '@cf/meta/llama-3.1-8b-instruct';
  }

  /**
   * Generate code with LoRA adapter
   */
  async generateCode(prompt, options = {}) {
    const {
      loraId = null,
      language = 'javascript',
      maxTokens = 2048,
      temperature = 0.3,
      stream = false
    } = options;

    // Find appropriate LoRA
    const lora = loraId 
      ? LORA_REGISTRY[loraId]
      : this.findLoraForLanguage(language);

    // Build system prompt
    const systemPrompt = this.buildSystemPrompt(language, lora);

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ];

    // Call Workers AI
    try {
      const response = await this.ai.run(lora?.baseModel || this.defaultModel, {
        messages,
        max_tokens: maxTokens,
        temperature,
        stream,
        // LoRA adapter (if available)
        ...(lora?.loraId && { lora: lora.loraId })
      });

      return {
        code: response.response,
        model: lora?.baseModel || this.defaultModel,
        loraUsed: lora?.name || null,
        tokens: {
          input: this.estimateTokens(prompt + systemPrompt),
          output: this.estimateTokens(response.response)
        }
      };
    } catch (error) {
      // Fallback to base model without LoRA
      if (error.message?.includes('lora')) {
        console.warn(`LoRA ${lora?.loraId} not available, falling back to base model`);
        return this.generateWithBaseModel(messages, { maxTokens, temperature, stream });
      }
      throw error;
    }
  }

  /**
   * Generate with base model (no LoRA)
   */
  async generateWithBaseModel(messages, options = {}) {
    const response = await this.ai.run(this.defaultModel, {
      messages,
      max_tokens: options.maxTokens || 2048,
      temperature: options.temperature || 0.3,
      stream: options.stream || false
    });

    return {
      code: response.response,
      model: this.defaultModel,
      loraUsed: null,
      tokens: {
        input: this.estimateTokens(messages.map(m => m.content).join('')),
        output: this.estimateTokens(response.response)
      }
    };
  }

  /**
   * Find best LoRA for given language
   */
  findLoraForLanguage(language) {
    for (const [id, lora] of Object.entries(LORA_REGISTRY)) {
      if (lora.languages.includes(language.toLowerCase())) {
        return { ...lora, id };
      }
    }
    return null;
  }

  /**
   * Build system prompt for code generation
   */
  buildSystemPrompt(language, lora) {
    let prompt = `You are an expert ${language} developer. Generate clean, production-ready code.`;

    if (lora) {
      prompt += `\n\nSpecialization: ${lora.description}`;
      prompt += '\n\nFollow these patterns:';
      
      if (lora.category === 'frontend') {
        prompt += `
- Use React functional components with hooks
- Apply Tailwind CSS for styling
- Use Framer Motion for animations
- Follow NURDS Code naming conventions`;
      } else if (lora.category === 'backend') {
        prompt += `
- Use itty-router for Cloudflare Workers
- Implement proper error handling with jsonResponse()
- Use D1 prepared statements for database queries
- Follow the pattern in workers/routes/*.js`;
      } else if (lora.category === 'sdk') {
        prompt += `
- Follow KingMode three-phase workflow
- Use ACHEEVY agent patterns
- Implement proper VIBE SDK integration
- Export clear interfaces`;
      } else if (lora.category === 'database') {
        prompt += `
- Write SQLite-compatible SQL
- Use CREATE TABLE IF NOT EXISTS
- Add appropriate indexes
- Include migration versioning`;
      }
    }

    prompt += `

Output ONLY the code, no explanations. Use proper formatting and indentation.`;

    return prompt;
  }

  /**
   * Estimate token count
   */
  estimateTokens(text) {
    // Rough estimate: ~4 chars per token
    return Math.ceil(text.length / 4);
  }

  // ============================================================
  // SPECIALIZED GENERATION METHODS
  // ============================================================

  /**
   * Generate React component
   */
  async generateReactComponent(description, options = {}) {
    const prompt = `Create a React component: ${description}

Requirements:
- Use functional component with hooks
- Apply Tailwind CSS classes
- Add Framer Motion animations if appropriate
- Include PropTypes or TypeScript types
- Export as default

Component should be production-ready.`;

    return this.generateCode(prompt, {
      ...options,
      loraId: 'nurds-react',
      language: 'jsx'
    });
  }

  /**
   * Generate Worker route
   */
  async generateWorkerRoute(description, options = {}) {
    const prompt = `Create a Cloudflare Worker route: ${description}

Requirements:
- Use itty-router pattern
- Include proper error handling
- Return JSON responses using jsonResponse()
- Add authentication if needed (withAuth middleware)
- Export the router

Follow the pattern from workers/routes/*.js`;

    return this.generateCode(prompt, {
      ...options,
      loraId: 'nurds-workers',
      language: 'javascript'
    });
  }

  /**
   * Generate D1 migration
   */
  async generateMigration(description, options = {}) {
    const prompt = `Create a D1 SQLite migration: ${description}

Requirements:
- Use CREATE TABLE IF NOT EXISTS
- Add appropriate indexes
- Include foreign keys if referencing other tables
- Add timestamps (created_at, updated_at)
- Include migration header comment with version`;

    return this.generateCode(prompt, {
      ...options,
      loraId: 'nurds-sql',
      language: 'sql'
    });
  }

  /**
   * Generate SDK function
   */
  async generateSDKFunction(description, options = {}) {
    const prompt = `Create an SDK function: ${description}

Requirements:
- Follow NURDS SDK patterns
- Include JSDoc documentation
- Export the function
- Add proper error handling
- Make it composable with other SDK functions`;

    return this.generateCode(prompt, {
      ...options,
      loraId: 'nurds-sdk',
      language: 'javascript'
    });
  }

  // ============================================================
  // LORA FINE-TUNING (PREPARATION)
  // ============================================================

  /**
   * Prepare training data for LoRA fine-tuning
   * (Generates JSONL format for CF fine-tuning API)
   */
  async prepareTrainingData(examples) {
    const trainingData = examples.map(ex => ({
      prompt: ex.prompt,
      completion: ex.completion
    }));

    return trainingData.map(d => JSON.stringify(d)).join('\n');
  }

  /**
   * Submit LoRA fine-tuning job
   * (Placeholder - actual implementation requires CF API access)
   */
  async submitFineTuningJob(loraName, trainingDataPath, baseModel) {
    // This would use the Cloudflare fine-tuning API
    // Currently placeholder for future implementation
    console.log(`[CodexLoRA] Fine-tuning job submitted: ${loraName}`);
    console.log(`  Base model: ${baseModel}`);
    console.log(`  Training data: ${trainingDataPath}`);

    return {
      jobId: crypto.randomUUID(),
      status: 'submitted',
      loraName,
      baseModel,
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Get available LoRAs
   */
  getAvailableLoRAs() {
    return Object.entries(LORA_REGISTRY).map(([id, lora]) => ({
      id,
      name: lora.name,
      description: lora.description,
      category: lora.category,
      languages: lora.languages
    }));
  }
}

// ============================================================
// WORKER INTEGRATION
// ============================================================

/**
 * Create Codex LoRA instance
 */
export function createCodexLoRA(env) {
  return new CodexLoRA(env);
}

/**
 * MCP Tool handler for Codex LoRA
 */
export const CODEX_TOOLS = {
  generate_code_with_lora: {
    name: 'generate_code_with_lora',
    description: 'Generate code using fine-tuned LoRA model',
    inputSchema: {
      type: 'object',
      properties: {
        prompt: { type: 'string', description: 'Code generation prompt' },
        language: { type: 'string', description: 'Programming language' },
        loraId: { type: 'string', description: 'Optional LoRA adapter ID' },
        temperature: { type: 'number', description: 'Generation temperature (0-1)' }
      },
      required: ['prompt']
    }
  },
  
  generate_react_component: {
    name: 'generate_react_component',
    description: 'Generate a React component with NURDS patterns',
    inputSchema: {
      type: 'object',
      properties: {
        description: { type: 'string', description: 'Component description' },
        withAnimation: { type: 'boolean', description: 'Include Framer Motion animations' }
      },
      required: ['description']
    }
  },
  
  generate_worker_route: {
    name: 'generate_worker_route',
    description: 'Generate a Cloudflare Worker route',
    inputSchema: {
      type: 'object',
      properties: {
        description: { type: 'string', description: 'Route description' },
        withAuth: { type: 'boolean', description: 'Include authentication' }
      },
      required: ['description']
    }
  },
  
  list_available_loras: {
    name: 'list_available_loras',
    description: 'List all available LoRA adapters',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  }
};

/**
 * Handle MCP tool call
 */
export async function handleCodexTool(toolName, args, env) {
  const codex = createCodexLoRA(env);

  switch (toolName) {
    case 'generate_code_with_lora':
      return await codex.generateCode(args.prompt, {
        language: args.language,
        loraId: args.loraId,
        temperature: args.temperature
      });

    case 'generate_react_component':
      return await codex.generateReactComponent(args.description, {
        withAnimation: args.withAnimation
      });

    case 'generate_worker_route':
      return await codex.generateWorkerRoute(args.description, {
        withAuth: args.withAuth
      });

    case 'list_available_loras':
      return codex.getAvailableLoRAs();

    default:
      throw new Error(`Unknown Codex tool: ${toolName}`);
  }
}
