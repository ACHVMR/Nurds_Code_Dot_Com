/**
 * Gemini CLI MCP Server Adapter
 * 
 * Purpose: Expose Gemini CLI capabilities as callable micro-service
 * via Model Context Protocol (MCP)
 * 
 * Tools exposed:
 * - gemini_reasoning: Deep reasoning and analysis
 * - gemini_code_analysis: Code review and improvements
 * - gemini_documentation: Generate docs from code
 */

import { ModelRouter, EXTERNAL_MODELS } from '../../sdk/model-router.js';

// ============================================================
// TYPE DEFINITIONS
// ============================================================

/**
 * @typedef {Object} GeminiCLIRequest
 * @property {string} prompt - The question or task
 * @property {string} [context] - Background context
 * @property {'reasoning'|'fast'|'comprehensive'} [mode] - Execution mode
 * @property {number} [maxTokens] - Maximum output tokens
 */

/**
 * @typedef {Object} GeminiCLIResponse
 * @property {string} reasoning - The response text
 * @property {number} confidence - Confidence score 0-1
 * @property {number} tokensUsed - Tokens consumed
 * @property {number} executionTime - Time in ms
 * @property {string} model - Model used
 */

// ============================================================
// MCP TOOL DEFINITIONS
// ============================================================

export const GEMINI_TOOLS = {
  /**
   * Tool 1: Deep Reasoning
   * For Brainstorming, Nurd Out planning, strategic analysis
   */
  gemini_reasoning: {
    name: "gemini_reasoning",
    description: "Deep reasoning and analysis via Gemini. Use for strategic planning, SWOT analysis, architecture decisions, and complex problem solving.",
    parameters: {
      type: "object",
      properties: {
        prompt: { 
          type: "string", 
          description: "The question or task to reason about" 
        },
        context: { 
          type: "string", 
          description: "Background context, previous decisions, or constraints" 
        },
        mode: { 
          type: "string", 
          enum: ["reasoning", "fast", "comprehensive"],
          description: "Execution mode: reasoning (balanced), fast (quick), comprehensive (thorough)"
        },
        framework: {
          type: "string",
          enum: ["4-question-lens", "swot", "okr", "six-sigma", "custom"],
          description: "Analysis framework to apply"
        }
      },
      required: ["prompt"]
    }
  },

  /**
   * Tool 2: Code Analysis
   * For code review, security audit, best practices
   */
  gemini_code_analysis: {
    name: "gemini_code_analysis",
    description: "Analyze code for issues, improvements, security vulnerabilities, and best practices.",
    parameters: {
      type: "object",
      properties: {
        code: { 
          type: "string", 
          description: "Code to analyze" 
        },
        language: { 
          type: "string", 
          description: "Programming language (javascript, typescript, python, rust, etc.)" 
        },
        focus: {
          type: "array",
          items: { type: "string" },
          description: "Focus areas: security, performance, readability, testing, accessibility"
        },
        context: {
          type: "string",
          description: "Project context or requirements"
        }
      },
      required: ["code", "language"]
    }
  },

  /**
   * Tool 3: Documentation Generation
   * For generating JSDoc, API docs, README, etc.
   */
  gemini_documentation: {
    name: "gemini_documentation",
    description: "Generate comprehensive documentation from code.",
    parameters: {
      type: "object",
      properties: {
        code: { 
          type: "string", 
          description: "Code to document" 
        },
        style: { 
          type: "string", 
          enum: ["jsdoc", "tsdoc", "markdown", "api", "readme"],
          description: "Documentation style" 
        },
        includeExamples: {
          type: "boolean",
          description: "Include usage examples"
        }
      },
      required: ["code", "style"]
    }
  },

  /**
   * Tool 4: Architecture Planning
   * For system design and technical planning
   */
  gemini_architecture: {
    name: "gemini_architecture",
    description: "Plan system architecture, data models, and technical design.",
    parameters: {
      type: "object",
      properties: {
        requirements: {
          type: "string",
          description: "Functional and non-functional requirements"
        },
        constraints: {
          type: "array",
          items: { type: "string" },
          description: "Technical constraints (budget, timeline, stack, scale)"
        },
        existingSystem: {
          type: "string",
          description: "Description of existing system to integrate with"
        },
        outputFormat: {
          type: "string",
          enum: ["diagram", "document", "code-scaffold", "all"],
          description: "Desired output format"
        }
      },
      required: ["requirements"]
    }
  }
};

// ============================================================
// GEMINI CLI ADAPTER CLASS
// ============================================================

export class GeminiCLIAdapter {
  constructor(env) {
    this.env = env;
    this.modelRouter = new ModelRouter(env);
    this.initialized = false;
  }

  /**
   * Initialize the Gemini CLI MCP server
   */
  async initialize() {
    // Verify Gemini API key is available
    if (!this.env.GOOGLE_AI_API_KEY) {
      console.warn('GOOGLE_AI_API_KEY not set - Gemini tools will use fallback models');
    }
    
    this.initialized = true;
    
    return {
      name: "gemini-cli-mcp",
      version: "1.0.0",
      tools: Object.values(GEMINI_TOOLS),
      status: "ready"
    };
  }

  /**
   * Execute a Gemini tool
   */
  async executeTool(toolName, parameters) {
    if (!this.initialized) {
      await this.initialize();
    }

    switch (toolName) {
      case 'gemini_reasoning':
        return await this.executeReasoning(parameters);
      case 'gemini_code_analysis':
        return await this.executeCodeAnalysis(parameters);
      case 'gemini_documentation':
        return await this.executeDocumentation(parameters);
      case 'gemini_architecture':
        return await this.executeArchitecture(parameters);
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }

  /**
   * Execute reasoning task
   */
  async executeReasoning(params) {
    const { prompt, context, mode = 'reasoning', framework } = params;
    
    // Build system prompt based on framework
    let systemPrompt = `You are a senior strategic advisor with expertise in software architecture, product development, and business analysis.

Mode: ${mode.toUpperCase()}
${mode === 'reasoning' ? 'Provide balanced, thorough analysis with clear recommendations.' : ''}
${mode === 'fast' ? 'Be concise and actionable. Focus on key points only.' : ''}
${mode === 'comprehensive' ? 'Provide exhaustive analysis covering all angles, risks, and alternatives.' : ''}`;

    if (framework === '4-question-lens') {
      systemPrompt += `

Apply the 4-Question Lens framework:
1. "What does 'done' look like?" - Define measurable success criteria
2. "What are the constraints?" - Time, cost, tech stack, team
3. "What's the riskiest part?" - Identify and mitigate risks
4. "Who's the user and what's their constraint?" - User empathy`;
    } else if (framework === 'swot') {
      systemPrompt += `

Apply SWOT Analysis:
- Strengths: Internal advantages
- Weaknesses: Internal challenges
- Opportunities: External possibilities
- Threats: External risks`;
    } else if (framework === 'okr') {
      systemPrompt += `

Generate OKRs (Objectives and Key Results):
- Objectives: What we want to achieve (qualitative)
- Key Results: How we measure success (quantitative)
- Each objective should have 2-4 key results`;
    }

    const fullPrompt = context 
      ? `Context:\n${context}\n\nTask:\n${prompt}`
      : prompt;

    const result = await this.modelRouter.execute(fullPrompt, {
      task: 'complex_reasoning',
      mode: 'brainstorming',
      systemPrompt,
      maxTokens: mode === 'comprehensive' ? 8192 : 4096,
      temperature: 0.7
    });

    return {
      reasoning: result.response,
      confidence: this.estimateConfidence(result.response),
      tokensUsed: result.tokensUsed,
      executionTime: result.executionTime,
      model: result.model,
      framework: framework || 'general',
      estimatedCost: result.estimatedCost
    };
  }

  /**
   * Execute code analysis
   */
  async executeCodeAnalysis(params) {
    const { code, language, focus = ['security', 'performance', 'readability'], context } = params;

    const systemPrompt = `You are a senior code reviewer with expertise in ${language}.

Analyze the provided code focusing on:
${focus.map(f => `- ${f.charAt(0).toUpperCase() + f.slice(1)}`).join('\n')}

For each issue found, provide:
1. Location (line number or code snippet)
2. Severity (critical, high, medium, low, info)
3. Description of the issue
4. Recommended fix with code example

End with an overall code quality score (0-100) and summary.`;

    const fullPrompt = `${context ? `Project Context: ${context}\n\n` : ''}Language: ${language}

Code to analyze:
\`\`\`${language}
${code}
\`\`\``;

    const result = await this.modelRouter.execute(fullPrompt, {
      task: 'code_review',
      mode: 'brainstorming',
      systemPrompt,
      maxTokens: 4096
    });

    return {
      analysis: result.response,
      language,
      focusAreas: focus,
      tokensUsed: result.tokensUsed,
      executionTime: result.executionTime,
      model: result.model,
      estimatedCost: result.estimatedCost
    };
  }

  /**
   * Execute documentation generation
   */
  async executeDocumentation(params) {
    const { code, style, includeExamples = true } = params;

    const styleGuides = {
      jsdoc: 'Use JSDoc format with @param, @returns, @throws, @example tags',
      tsdoc: 'Use TSDoc format compatible with TypeScript',
      markdown: 'Use Markdown with code blocks and clear headers',
      api: 'Generate OpenAPI/Swagger-style API documentation',
      readme: 'Generate a comprehensive README.md with installation, usage, and examples'
    };

    const systemPrompt = `You are a technical writer generating documentation.

Style: ${style.toUpperCase()}
${styleGuides[style]}

${includeExamples ? 'Include practical usage examples for each function/component.' : ''}

Generate complete, accurate documentation that helps developers understand and use this code effectively.`;

    const fullPrompt = `Generate ${style} documentation for this code:

\`\`\`
${code}
\`\`\``;

    const result = await this.modelRouter.execute(fullPrompt, {
      task: 'documentation',
      mode: 'agent_mode',
      systemPrompt,
      maxTokens: 4096
    });

    return {
      documentation: result.response,
      style,
      tokensUsed: result.tokensUsed,
      executionTime: result.executionTime,
      model: result.model,
      estimatedCost: result.estimatedCost
    };
  }

  /**
   * Execute architecture planning
   */
  async executeArchitecture(params) {
    const { requirements, constraints = [], existingSystem, outputFormat = 'document' } = params;

    const systemPrompt = `You are a senior solutions architect.

Design a robust, scalable system architecture that:
1. Meets all functional requirements
2. Respects stated constraints
3. Follows industry best practices
4. Is maintainable and extensible

${constraints.length ? `Constraints to consider:\n${constraints.map(c => `- ${c}`).join('\n')}` : ''}

${outputFormat === 'diagram' ? 'Include ASCII diagrams for system components and data flow.' : ''}
${outputFormat === 'code-scaffold' ? 'Include folder structure and key file templates.' : ''}
${outputFormat === 'all' ? 'Include diagrams, documents, and code scaffolding.' : ''}`;

    const fullPrompt = `${existingSystem ? `Existing System:\n${existingSystem}\n\n` : ''}Requirements:
${requirements}`;

    const result = await this.modelRouter.execute(fullPrompt, {
      task: 'architecture_design',
      mode: 'nurd_out',
      systemPrompt,
      maxTokens: 8192
    });

    return {
      architecture: result.response,
      outputFormat,
      constraints,
      tokensUsed: result.tokensUsed,
      executionTime: result.executionTime,
      model: result.model,
      estimatedCost: result.estimatedCost
    };
  }

  /**
   * Estimate confidence based on response quality
   */
  estimateConfidence(response) {
    if (!response) return 0;
    
    // Simple heuristics for confidence estimation
    const hasStructure = /^(#{1,3}|\d+\.|[-*])/.test(response);
    const hasEvidence = /because|therefore|however|specifically/i.test(response);
    const hasConclusion = /in conclusion|summary|recommendation/i.test(response);
    const length = response.length;
    
    let confidence = 0.5;
    if (hasStructure) confidence += 0.15;
    if (hasEvidence) confidence += 0.15;
    if (hasConclusion) confidence += 0.1;
    if (length > 500) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }
}

// ============================================================
// MCP SERVER HANDLER
// ============================================================

export function createGeminiMCPHandler(env) {
  const adapter = new GeminiCLIAdapter(env);

  return {
    /**
     * Handle MCP tool list request
     */
    async listTools() {
      const info = await adapter.initialize();
      return info.tools;
    },

    /**
     * Handle MCP tool execution request
     */
    async executeTool(toolName, parameters) {
      return await adapter.executeTool(toolName, parameters);
    },

    /**
     * Get adapter instance
     */
    getAdapter() {
      return adapter;
    }
  };
}

// ============================================================
// WORKER ROUTE HANDLERS
// ============================================================

/**
 * POST /api/v1/mcp/gemini/tools
 * List available Gemini tools
 */
export async function handleListTools(request, env) {
  const handler = createGeminiMCPHandler(env);
  const tools = await handler.listTools();
  
  return new Response(JSON.stringify({ tools }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * POST /api/v1/mcp/gemini/execute
 * Execute a Gemini tool
 */
export async function handleExecuteTool(request, env) {
  const { tool, parameters } = await request.json();
  
  const handler = createGeminiMCPHandler(env);
  const result = await handler.executeTool(tool, parameters);
  
  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' }
  });
}
