/**
 * ============================================
 * II-Agent Worker Template
 * ============================================
 * 
 * Universal template for all 19 II-Agent Cloud Run services
 * Specialized behavior loaded from agent-configs.js
 * 
 * @version 2.0.0
 * @license MIT
 */

import { getAgentConfig } from './agent-configs.js';

// Agent type from environment (set during deployment)
const AGENT_TYPE = process.env.AGENT_TYPE || 'nlu';
const MODEL = process.env.MODEL || 'gpt-4o-mini';
const PORT = process.env.PORT || 8080;

// Load agent-specific configuration
const agentConfig = getAgentConfig(AGENT_TYPE);

// Model API endpoints
const MODEL_ENDPOINTS = {
  'gpt-4o': 'https://api.openai.com/v1/chat/completions',
  'gpt-4o-mini': 'https://api.openai.com/v1/chat/completions',
  'claude-3.5-sonnet': 'https://api.anthropic.com/v1/messages',
  'claude-3-haiku': 'https://api.anthropic.com/v1/messages',
  'gemini-2.0-pro': 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-pro:generateContent',
  'gemini-2.0-flash': 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
  'groq-llama-3.3-70b': 'https://api.groq.com/openai/v1/chat/completions',
  'groq-llama-3.1-70b': 'https://api.groq.com/openai/v1/chat/completions',
  'deepseek-v3': 'https://api.deepseek.com/v1/chat/completions',
};

/**
 * II-Agent Worker Class
 * Handles incoming requests and orchestrates agent behavior
 */
class IIAgentWorker {
  constructor(config) {
    this.config = config;
    this.model = MODEL;
    this.tools = config.tools || [];
    this.systemPrompt = config.systemPrompt;
    this.startTime = Date.now();
    this.requestCount = 0;
  }

  /**
   * Process incoming task request
   */
  async processTask(task) {
    this.requestCount++;
    const taskId = task.taskId || `task_${Date.now()}`;
    
    console.log(`[${AGENT_TYPE}] Processing task ${taskId}`);
    
    const startTime = Date.now();
    
    try {
      // Build messages array
      const messages = [
        { role: 'system', content: this.systemPrompt },
        { role: 'user', content: this.formatInput(task) },
      ];
      
      // Add context if provided
      if (task.context) {
        messages.splice(1, 0, {
          role: 'assistant',
          content: `Previous context: ${JSON.stringify(task.context)}`,
        });
      }

      // Call the appropriate LLM
      const response = await this.callModel(messages, task.stream);
      
      const duration = Date.now() - startTime;
      
      return {
        taskId,
        agentType: AGENT_TYPE,
        status: 'completed',
        result: response,
        metadata: {
          model: this.model,
          duration,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error(`[${AGENT_TYPE}] Error processing task:`, error);
      
      return {
        taskId,
        agentType: AGENT_TYPE,
        status: 'error',
        error: error.message,
        metadata: {
          model: this.model,
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  /**
   * Format task input based on agent type
   */
  formatInput(task) {
    const baseInput = task.input || task.prompt || task.message || '';
    
    // Add agent-specific formatting
    switch (AGENT_TYPE) {
      case 'nlu':
        return `Analyze the following input and classify intent:\n\n${baseInput}`;
      
      case 'codegen':
        return `Generate code for the following request:\n\n${baseInput}\n\nLanguage: ${task.language || 'detect'}`;
      
      case 'research':
        return `Research the following topic and provide comprehensive findings:\n\n${baseInput}`;
      
      case 'validation':
        return `Validate the following code:\n\n\`\`\`\n${baseInput}\n\`\`\``;
      
      case 'security':
        return `Perform security analysis on:\n\n\`\`\`\n${baseInput}\n\`\`\``;
      
      case 'reasoning':
        return `Solve this problem step by step:\n\n${baseInput}`;
      
      case 'synthesis':
        return `Synthesize the following results:\n\n${JSON.stringify(task.results || baseInput, null, 2)}`;
      
      default:
        return baseInput;
    }
  }

  /**
   * Call the configured LLM
   */
  async callModel(messages, stream = false) {
    const endpoint = MODEL_ENDPOINTS[this.model];
    
    if (!endpoint) {
      throw new Error(`Unknown model: ${this.model}`);
    }

    // Route to appropriate API handler
    if (this.model.startsWith('gpt-') || this.model.startsWith('groq-') || this.model.startsWith('deepseek')) {
      return this.callOpenAICompatible(endpoint, messages, stream);
    } else if (this.model.startsWith('claude-')) {
      return this.callClaude(endpoint, messages, stream);
    } else if (this.model.startsWith('gemini-')) {
      return this.callGemini(endpoint, messages, stream);
    }
    
    throw new Error(`No handler for model: ${this.model}`);
  }

  /**
   * Call OpenAI-compatible API (OpenAI, Groq, DeepSeek)
   */
  async callOpenAICompatible(endpoint, messages, stream) {
    const apiKey = this.getAPIKey();
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: this.model.replace('groq-', '').replace('deepseek-', 'deepseek-chat'),
        messages,
        temperature: 0.7,
        stream,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error: ${error}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  /**
   * Call Anthropic Claude API
   */
  async callClaude(endpoint, messages, stream) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    // Convert to Claude format
    const systemMessage = messages.find(m => m.role === 'system')?.content || '';
    const claudeMessages = messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      }));

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        system: systemMessage,
        messages: claudeMessages,
        stream,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Claude API error: ${error}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  /**
   * Call Google Gemini API
   */
  async callGemini(endpoint, messages, stream) {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    
    // Convert to Gemini format
    const contents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await fetch(`${endpoint}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${error}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  /**
   * Get the appropriate API key
   */
  getAPIKey() {
    if (this.model.startsWith('gpt-')) {
      return process.env.OPENAI_API_KEY;
    } else if (this.model.startsWith('groq-')) {
      return process.env.GROQ_API_KEY;
    } else if (this.model.startsWith('deepseek')) {
      return process.env.DEEPSEEK_API_KEY;
    }
    return process.env.OPENAI_API_KEY;
  }

  /**
   * Health check
   */
  getHealth() {
    return {
      agent: AGENT_TYPE,
      name: this.config.name,
      status: 'healthy',
      model: this.model,
      uptime: Date.now() - this.startTime,
      requestCount: this.requestCount,
      version: '2.0.0',
    };
  }
}

// Initialize worker
const worker = new IIAgentWorker(agentConfig);

// HTTP Server (using native Node.js)
import { createServer } from 'http';

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Health check
  if (url.pathname === '/health' || url.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(worker.getHealth()));
    return;
  }

  // Agent info
  if (url.pathname === '/info') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      agent: AGENT_TYPE,
      config: agentConfig,
      model: MODEL,
    }));
    return;
  }

  // Process task
  if (url.pathname === '/process' && req.method === 'POST') {
    let body = '';
    
    for await (const chunk of req) {
      body += chunk;
    }

    try {
      const task = JSON.parse(body);
      const result = await worker.processTask(task);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    } catch (error) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
    return;
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║                  II-Agent Worker Started                 ║
╠══════════════════════════════════════════════════════════╣
║  Agent: ${AGENT_TYPE.padEnd(48)}║
║  Name:  ${agentConfig.name.padEnd(48)}║
║  Model: ${MODEL.padEnd(48)}║
║  Port:  ${PORT.toString().padEnd(48)}║
╚══════════════════════════════════════════════════════════╝
  `);
});

export default worker;
