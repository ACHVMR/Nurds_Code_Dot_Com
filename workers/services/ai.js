/**
 * AI Service for Cloudflare Workers
 * LLM integrations (OpenAI, Claude, Groq)
 */

/**
 * Get AI client configuration
 * @param {string} provider - AI provider (openai/claude/groq)
 * @param {object} env - Environment bindings
 * @returns {object} Client config
 */
function getAIConfig(provider, env) {
  const configs = {
    openai: {
      baseUrl: 'https://api.openai.com/v1',
      apiKey: env.OPENAI_API_KEY,
      defaultModel: 'gpt-4-turbo-preview',
    },
    claude: {
      baseUrl: 'https://api.anthropic.com/v1',
      apiKey: env.ANTHROPIC_API_KEY,
      defaultModel: 'claude-3-sonnet-20240229',
    },
    groq: {
      baseUrl: 'https://api.groq.com/openai/v1',
      apiKey: env.GROQ_API_KEY,
      defaultModel: 'llama-3.1-70b-versatile',
    },
  };

  return configs[provider] || configs.openai;
}

/**
 * Generate chat completion
 * @param {object} options - Completion options
 * @param {object} env - Environment bindings
 * @returns {Promise<object>} Completion response
 */
export async function generateCompletion(options, env) {
  const {
    messages,
    provider = 'openai',
    model,
    systemPrompt,
    temperature = 0.7,
    maxTokens = 2048,
    stream = false,
  } = options;

  const config = getAIConfig(provider, env);
  const finalModel = model || config.defaultModel;

  // Prepare messages with system prompt
  const finalMessages = systemPrompt
    ? [{ role: 'system', content: systemPrompt }, ...messages]
    : messages;

  // Claude uses different API format
  if (provider === 'claude') {
    return generateClaudeCompletion({
      messages: finalMessages,
      model: finalModel,
      temperature,
      maxTokens,
      stream,
    }, config);
  }

  // OpenAI-compatible API (OpenAI, Groq)
  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: finalModel,
      messages: finalMessages,
      temperature,
      max_tokens: maxTokens,
      stream,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`AI completion failed: ${error}`);
  }

  if (stream) {
    return response;
  }

  return response.json();
}

/**
 * Generate Claude completion
 * @param {object} options - Completion options
 * @param {object} config - API config
 * @returns {Promise<object>} Completion response
 */
async function generateClaudeCompletion(options, config) {
  const { messages, model, temperature, maxTokens, stream } = options;

  // Extract system message
  const systemMessage = messages.find(m => m.role === 'system');
  const userMessages = messages.filter(m => m.role !== 'system');

  const response = await fetch(`${config.baseUrl}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      system: systemMessage?.content,
      messages: userMessages,
      temperature,
      max_tokens: maxTokens,
      stream,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude completion failed: ${error}`);
  }

  if (stream) {
    return response;
  }

  const result = await response.json();

  // Normalize to OpenAI format
  return {
    choices: [
      {
        message: {
          role: 'assistant',
          content: result.content[0]?.text || '',
        },
      },
    ],
    usage: {
      prompt_tokens: result.usage?.input_tokens || 0,
      completion_tokens: result.usage?.output_tokens || 0,
    },
  };
}

/**
 * Generate streaming completion
 * @param {object} options - Completion options
 * @param {object} env - Environment bindings
 * @returns {ReadableStream} SSE stream
 */
export async function generateStreamingCompletion(options, env) {
  const response = await generateCompletion({ ...options, stream: true }, env);

  return new ReadableStream({
    async start(controller) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          controller.enqueue(new TextEncoder().encode(chunk));
        }
      } catch (error) {
        console.error('[AI] Streaming error:', error);
      } finally {
        controller.close();
      }
    },
  });
}

/**
 * Generate embeddings
 * @param {string|string[]} input - Text to embed
 * @param {object} env - Environment bindings
 * @returns {Promise<number[][]>} Embeddings
 */
export async function generateEmbeddings(input, env) {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: Array.isArray(input) ? input : [input],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Embeddings failed: ${error}`);
  }

  const result = await response.json();
  return result.data.map(d => d.embedding);
}

/**
 * Default system prompts for different contexts
 */
export const SYSTEM_PROMPTS = {
  default: `You are a helpful AI assistant for NurdsCode, a platform for building and deploying AI agents. Be concise, accurate, and helpful.`,
  
  codeAssistant: `You are an expert programming assistant. Help users write, debug, and improve their code. Provide clear explanations and follow best practices.`,
  
  agentBuilder: `You are an AI agent configuration assistant. Help users design and configure their custom AI agents. Ask clarifying questions when needed and suggest best practices for agent design.`,
  
  vibe: `You are VIBE, the NurdsCode AI assistant. You help users build, deploy, and manage AI-powered applications. Be friendly, helpful, and technically accurate.`,
};
