/**
 * ============================================
 * Nurds Code VibeSDK Integration Module
 * Multi-Use-Case AI Assistant SDK
 * ============================================
 * 
 * This module provides a reusable AI assistant SDK that can be
 * integrated into VS Code extensions, Discord bots, Slack apps,
 * Electron applications, and more.
 * 
 * @version 1.0.0
 * @license MIT
 */

import { chatHandler } from '../server/chat.js';
import { generateForUser } from '../server/llm.js';
import { getSupabaseClient, saveChatMessage, getChatHistory } from '../server/supabase.js';

/**
 * VibeSDK Configuration Options
 * @typedef {Object} VibeSDKConfig
 * @property {string} apiUrl - Base URL for API endpoints
 * @property {Object} env - Environment variables (API keys, secrets)
 * @property {string} [defaultPlan='free'] - Default subscription tier
 * @property {number} [maxHistoryMessages=20] - Max chat history to retain
 * @property {boolean} [persistHistory=true] - Whether to persist chat to database
 * @property {Function} [onError] - Error callback handler
 * @property {Function} [onTokenUsage] - Token usage callback
 */

/**
 * Message object structure
 * @typedef {Object} Message
 * @property {string} role - Message role (user/assistant/system)
 * @property {string} content - Message content
 * @property {Object} [metadata] - Optional metadata
 */

/**
 * ============================================
 * VibeSDK Main Class
 * ============================================
 */
export class VibeSDK {
  constructor(config) {
    this.config = {
      defaultPlan: 'free',
      maxHistoryMessages: 20,
      persistHistory: true,
      ...config
    };

    // Validate required config
    if (!config.env) {
      throw new Error('VibeSDK requires env configuration object');
    }

    // Initialize Supabase if persistence enabled
    if (this.config.persistHistory && config.env.SUPABASE_URL) {
      this.supabase = getSupabaseClient(config.env);
    }

    this.sessionId = this._generateSessionId();
    this.history = [];
  }

  /**
   * Send a message to the AI assistant
   * @param {string} message - User message
   * @param {Object} options - Optional parameters
   * @param {string} [options.plan] - Subscription tier override
   * @param {string} [options.userId] - User ID for persistence
   * @param {string} [options.tenantId] - Tenant ID for multi-tenancy
   * @returns {Promise<Object>} Assistant response
   */
  async sendMessage(message, options = {}) {
    const startTime = Date.now();
    
    try {
      // Prepare request
      const plan = options.plan || this.config.defaultPlan;
      const requestPayload = {
        message,
        plan,
        history: this.history.slice(-this.config.maxHistoryMessages),
        env: this.config.env
      };

      // Add user message to history
      this.history.push({ role: 'user', content: message });

      // Call chat handler
      const response = await chatHandler(requestPayload);

      // Add assistant response to history
      this.history.push({ role: 'assistant', content: response.message });

      // Persist to database if enabled
      if (this.config.persistHistory && this.supabase && options.tenantId && options.userId) {
        await this._persistMessages(options.tenantId, options.userId, plan, response);
      }

      // Callback for token usage tracking
      if (this.config.onTokenUsage && response.usage) {
        this.config.onTokenUsage(response.usage);
      }

      // Return response with metadata
      return {
        ...response,
        responseTime: Date.now() - startTime,
        sessionId: this.sessionId,
        historyLength: this.history.length
      };
    } catch (error) {
      // Error callback
      if (this.config.onError) {
        this.config.onError(error);
      }

      throw new Error(`VibeSDK Error: ${error.message}`);
    }
  }

  /**
   * Get chat history for current session
   * @returns {Array<Message>} Chat history
   */
  getHistory() {
    return [...this.history];
  }

  /**
   * Clear chat history
   */
  clearHistory() {
    this.history = [];
  }

  /**
   * Reset session (new session ID + clear history)
   */
  resetSession() {
    this.sessionId = this._generateSessionId();
    this.clearHistory();
  }

  /**
   * Load history from database (if persistence enabled)
   * @param {string} sessionId - Session ID to load
   * @returns {Promise<Array<Message>>} Loaded history
   */
  async loadHistory(sessionId) {
    if (!this.supabase) {
      throw new Error('Supabase not configured for persistence');
    }

    const history = await getChatHistory(this.supabase, sessionId, this.config.maxHistoryMessages);
    this.history = history;
    this.sessionId = sessionId;
    
    return history;
  }

  /**
   * Get current session ID
   * @returns {string} Session UUID
   */
  getSessionId() {
    return this.sessionId;
  }

  /**
   * Generate unique session ID
   * @private
   */
  _generateSessionId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Persist messages to Supabase
   * @private
   */
  async _persistMessages(tenantId, userId, plan, response) {
    try {
      // Save user message
      await saveChatMessage(
        this.supabase,
        tenantId,
        userId,
        this.sessionId,
        'user',
        this.history[this.history.length - 2].content,
        { plan }
      );

      // Save assistant response
      await saveChatMessage(
        this.supabase,
        tenantId,
        userId,
        this.sessionId,
        'assistant',
        response.message,
        {
          plan,
          model: response.model,
          tokens_used: response.usage?.total_tokens
        }
      );
    } catch (error) {
      console.error('Failed to persist chat messages:', error);
      // Non-blocking error
    }
  }
}

/**
 * ============================================
 * Standalone Helper Functions
 * ============================================
 */

/**
 * Quick assistant query (stateless, no history)
 * @param {string} message - User message
 * @param {string} plan - Subscription tier
 * @param {Object} env - Environment configuration
 * @returns {Promise<Object>} Assistant response
 */
export async function quickQuery(message, plan, env) {
  const response = await chatHandler({
    message,
    plan,
    history: [],
    env
  });

  return response;
}

/**
 * Generate response directly from LLM (bypass chat handler)
 * @param {string} plan - Subscription tier
 * @param {Array<Message>} messages - Message history
 * @param {Object} env - Environment configuration
 * @returns {Promise<Object>} LLM response
 */
export async function generateDirectly(plan, messages, env) {
  return await generateForUser(plan, messages, env);
}

/**
 * ============================================
 * Integration Examples
 * ============================================
 */

/**
 * Example: VS Code Extension Integration
 * 
 * ```javascript
 * import { VibeSDK } from './src/sdk/vibesdk.js';
 * 
 * const sdk = new VibeSDK({
 *   env: {
 *     GROQ_API_KEY: process.env.GROQ_API_KEY,
 *     OPENAI_API_KEY: process.env.OPENAI_API_KEY,
 *     AI_GATEWAY_URL: process.env.AI_GATEWAY_URL
 *   },
 *   defaultPlan: 'pro',
 *   onTokenUsage: (usage) => console.log('Tokens used:', usage)
 * });
 * 
 * // Send message
 * const response = await sdk.sendMessage('How do I deploy a Worker?', {
 *   plan: 'pro'
 * });
 * 
 * console.log(response.message);
 * ```
 */

/**
 * Example: Discord Bot Integration
 * 
 * ```javascript
 * import { VibeSDK } from './src/sdk/vibesdk.js';
 * 
 * const botSDK = new VibeSDK({
 *   env: process.env,
 *   defaultPlan: 'free',
 *   persistHistory: false
 * });
 * 
 * client.on('messageCreate', async (message) => {
 *   if (message.content.startsWith('!ask')) {
 *     const query = message.content.replace('!ask', '').trim();
 *     const response = await botSDK.sendMessage(query);
 *     await message.reply(response.message);
 *   }
 * });
 * ```
 */

/**
 * Example: Slack App Integration
 * 
 * ```javascript
 * import { VibeSDK } from './src/sdk/vibesdk.js';
 * 
 * const slackSDK = new VibeSDK({
 *   env: process.env,
 *   defaultPlan: 'enterprise',
 *   maxHistoryMessages: 50
 * });
 * 
 * app.message(async ({ message, say }) => {
 *   const response = await slackSDK.sendMessage(message.text, {
 *     plan: getWorkspaceTier(message.team)
 *   });
 *   
 *   await say(response.message);
 * });
 * ```
 */

/**
 * Example: Electron App Integration
 * 
 * ```javascript
 * import { VibeSDK } from './src/sdk/vibesdk.js';
 * 
 * const electronSDK = new VibeSDK({
 *   env: {
 *     GROQ_API_KEY: 'your-key',
 *     SUPABASE_URL: 'your-supabase-url',
 *     SUPABASE_SERVICE_ROLE_KEY: 'your-key'
 *   },
 *   persistHistory: true,
 *   onError: (error) => {
 *     dialog.showErrorBox('AI Error', error.message);
 *   }
 * });
 * 
 * ipcMain.handle('ai-query', async (event, message, plan) => {
 *   return await electronSDK.sendMessage(message, { plan });
 * });
 * ```
 */

export default VibeSDK;
