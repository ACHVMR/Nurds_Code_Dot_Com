// Circuit Box Orchestrator - The brain that routes requests to the right models
import { BRAND_DNA, getSystemPrompt } from './brand-dna';
import { MODEL_REGISTRY, getModelForTier, ModelConfig } from './registry';
import { BOOMER_ANGS, getAngForTask, BoomerAng } from './boomer-angs';

export interface CircuitState {
  isOpen: boolean;
  failures: number;
  lastFailure: number | null;
  successCount: number;
}

export interface OrchestratorConfig {
  maxFailures: number;
  resetTimeout: number; // ms
  halfOpenRequests: number;
}

export interface ChatRequest {
  message: string;
  history?: Array<{ role: string; content: string }>;
  plan?: string;
  context?: Record<string, unknown>;
  angId?: string;
}

export interface ChatResponse {
  response: string;
  model: string;
  provider: string;
  ang?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export class CircuitBoxOrchestrator {
  private circuits: Map<string, CircuitState> = new Map();
  private config: OrchestratorConfig;

  constructor(config?: Partial<OrchestratorConfig>) {
    this.config = {
      maxFailures: 3,
      resetTimeout: 30000, // 30 seconds
      halfOpenRequests: 1,
      ...config,
    };
  }

  private getCircuit(modelId: string): CircuitState {
    if (!this.circuits.has(modelId)) {
      this.circuits.set(modelId, {
        isOpen: false,
        failures: 0,
        lastFailure: null,
        successCount: 0,
      });
    }
    return this.circuits.get(modelId)!;
  }

  private shouldAllowRequest(modelId: string): boolean {
    const circuit = this.getCircuit(modelId);

    if (!circuit.isOpen) {
      return true;
    }

    // Check if we should try half-open
    if (circuit.lastFailure) {
      const timeSinceFailure = Date.now() - circuit.lastFailure;
      if (timeSinceFailure >= this.config.resetTimeout) {
        return true; // Allow half-open attempt
      }
    }

    return false;
  }

  private recordSuccess(modelId: string): void {
    const circuit = this.getCircuit(modelId);
    circuit.failures = 0;
    circuit.isOpen = false;
    circuit.successCount++;
  }

  private recordFailure(modelId: string): void {
    const circuit = this.getCircuit(modelId);
    circuit.failures++;
    circuit.lastFailure = Date.now();

    if (circuit.failures >= this.config.maxFailures) {
      circuit.isOpen = true;
      console.log(`Circuit OPEN for model: ${modelId}`);
    }
  }

  async chat(
    request: ChatRequest,
    env: Record<string, string>
  ): Promise<ChatResponse> {
    const { message, history = [], plan = 'free', context = {}, angId } = request;

    // Select the appropriate Ang (agent)
    const ang: BoomerAng = angId 
      ? BOOMER_ANGS[angId] || getAngForTask(message)
      : getAngForTask(message);

    // Get model based on tier and Ang preference
    const tierModel = getModelForTier(plan);
    const preferredModelKey = ang.preferredModel;
    const model = MODEL_REGISTRY[preferredModelKey] || tierModel;

    // Build the system prompt
    const systemPrompt = `${getSystemPrompt({ task: message })}\n\n${ang.systemPrompt}`;

    // Try primary model with circuit breaker
    const providers = this.getProviderChain(model, env);

    for (const provider of providers) {
      if (!this.shouldAllowRequest(provider.model.id)) {
        console.log(`Circuit open for ${provider.model.id}, skipping...`);
        continue;
      }

      try {
        const response = await this.callProvider(
          provider,
          systemPrompt,
          message,
          history,
          ang,
          env
        );

        this.recordSuccess(provider.model.id);
        return {
          ...response,
          ang: ang.name,
        };
      } catch (error) {
        console.error(`Provider ${provider.model.provider} failed:`, error);
        this.recordFailure(provider.model.id);
      }
    }

    // All providers failed - return fallback response
    return {
      response: `⚡ All AI providers are currently experiencing issues. Please try again in a moment.\n\nYour message: "${message}"`,
      model: 'fallback',
      provider: 'none',
      ang: ang.name,
    };
  }

  private getProviderChain(
    primaryModel: ModelConfig,
    env: Record<string, string>
  ): Array<{ model: ModelConfig; apiKey?: string }> {
    const chain: Array<{ model: ModelConfig; apiKey?: string }> = [];

    // Add primary model
    chain.push({ model: primaryModel, apiKey: this.getApiKey(primaryModel, env) });

    // Add fallbacks based on provider
    const fallbackOrder = ['claude-haiku', 'llama-3.1-70b', 'deepseek-v3', 'cf-llama-3'];

    for (const modelKey of fallbackOrder) {
      const fallback = MODEL_REGISTRY[modelKey];
      if (fallback && fallback.id !== primaryModel.id) {
        const apiKey = this.getApiKey(fallback, env);
        if (apiKey || fallback.provider === 'cloudflare') {
          chain.push({ model: fallback, apiKey });
        }
      }
    }

    return chain;
  }

  private getApiKey(model: ModelConfig, env: Record<string, string>): string | undefined {
    switch (model.provider) {
      case 'openrouter':
        return env.OPENROUTER_API_KEY;
      case 'groq':
        return env.GROQ_API_KEY;
      case 'cloudflare':
        return undefined; // Uses binding
      case 'huggingface':
        return env.HF_API_KEY;
      default:
        return undefined;
    }
  }

  private async callProvider(
    provider: { model: ModelConfig; apiKey?: string },
    systemPrompt: string,
    message: string,
    history: Array<{ role: string; content: string }>,
    ang: BoomerAng,
    env: Record<string, string>
  ): Promise<ChatResponse> {
    const { model, apiKey } = provider;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-20),
      { role: 'user', content: message },
    ];

    switch (model.provider) {
      case 'openrouter':
        return this.callOpenRouter(model, messages, apiKey!, ang, env);
      case 'groq':
        return this.callGroq(model, messages, apiKey!, ang);
      case 'cloudflare':
        return this.callCloudflare(model, messages, ang, env);
      default:
        throw new Error(`Unknown provider: ${model.provider}`);
    }
  }

  private async callOpenRouter(
    model: ModelConfig,
    messages: Array<{ role: string; content: string }>,
    apiKey: string,
    ang: BoomerAng,
    env: Record<string, string>
  ): Promise<ChatResponse> {
    const gatewayUrl = env.CLOUDFLARE_ACCOUNT_ID
      ? `https://gateway.ai.cloudflare.com/v1/${env.CLOUDFLARE_ACCOUNT_ID}/${env.AI_GATEWAY_SLUG || 'nurdscode-gateway'}/openrouter/api/v1/chat/completions`
      : 'https://openrouter.ai/api/v1/chat/completions';

    const response = await fetch(gatewayUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': env.APP_URL || 'https://nurdscode.com',
        'X-Title': 'Nurds Code Platform',
      },
      body: JSON.stringify({
        model: model.id,
        messages,
        temperature: ang.temperature,
        max_tokens: ang.maxTokens,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter error: ${error}`);
    }

    const data = await response.json() as {
      choices: Array<{ message: { content: string } }>;
      usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
    };

    return {
      response: data.choices[0].message.content,
      model: model.name,
      provider: 'openrouter',
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      } : undefined,
    };
  }

  private async callGroq(
    model: ModelConfig,
    messages: Array<{ role: string; content: string }>,
    apiKey: string,
    ang: BoomerAng
  ): Promise<ChatResponse> {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model.id,
        messages,
        temperature: ang.temperature,
        max_tokens: ang.maxTokens,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Groq error: ${error}`);
    }

    const data = await response.json() as {
      choices: Array<{ message: { content: string } }>;
      usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
    };

    return {
      response: data.choices[0].message.content,
      model: model.name,
      provider: 'groq',
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      } : undefined,
    };
  }

  private async callCloudflare(
    model: ModelConfig,
    messages: Array<{ role: string; content: string }>,
    ang: BoomerAng,
    env: Record<string, string>
  ): Promise<ChatResponse> {
    // This would use the AI binding in Cloudflare Workers
    // For now, we'll throw to trigger fallback
    if (!env.AI) {
      throw new Error('Cloudflare AI binding not available');
    }

    // In actual Workers environment:
    // const ai = env.AI;
    // const response = await ai.run(model.id, { messages });

    throw new Error('Cloudflare AI not implemented in this context');
  }

  getCircuitStatus(): Record<string, CircuitState> {
    const status: Record<string, CircuitState> = {};
    this.circuits.forEach((state, modelId) => {
      status[modelId] = { ...state };
    });
    return status;
  }

  resetCircuit(modelId: string): void {
    this.circuits.delete(modelId);
  }

  resetAllCircuits(): void {
    this.circuits.clear();
  }
}

// Singleton instance
let orchestratorInstance: CircuitBoxOrchestrator | null = null;

export function getOrchestrator(config?: Partial<OrchestratorConfig>): CircuitBoxOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new CircuitBoxOrchestrator(config);
  }
  return orchestratorInstance;
}
