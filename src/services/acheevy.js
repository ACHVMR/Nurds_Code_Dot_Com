/**
 * ACHEEVY Chatbot Integration
 * Real-time AI assistant for autonomous tool provisioning and user guidance
 */

import { orchestrateCircuitBox, USE_CASES, AVAILABLE_APIS } from './circuitOrchestration.js';

/**
 * ACHEEVY AI Assistant Class
 * Provides real-time guidance and autonomous tool provisioning
 */
export class ACHEEVYAssistant {
  constructor(userId, tier, token) {
    this.userId = userId;
    this.tier = tier;
    this.token = token;
    this.conversationHistory = [];
    this.detectedIntent = null;
    this.suggestedTools = [];
  }

  /**
   * Analyze user input and detect intent
   * @param {string} userMessage - User's message or query
   * @returns {Object} Detected intent and recommendations
   */
  async analyzeIntent(userMessage) {
    const message = userMessage.toLowerCase();
    
    // Intent patterns
    const intents = {
      'voice-control': ['voice', 'speak', 'talk', 'audio', 'stt', 'tts', 'whisper'],
      'robotics': ['robot', 'manus', 'humanoid', 'control', 'automation', 'physical'],
      'agent-building': ['agent', 'crew', 'multi-agent', 'autonomous', 'workflow'],
      'code-editing': ['code', 'edit', 'editor', 'ide', 'programming', 'syntax'],
      'ml-deployment': ['ml', 'machine learning', 'model', 'deploy', 'inference', 'replicate', 'huggingface'],
      'data-storage': ['database', 'store', 'save', 'persist', 'supabase', 'postgres'],
      'payment': ['payment', 'billing', 'stripe', 'checkout', 'subscription']
    };

    const detectedIntents = [];
    const suggestedAPIs = new Set();
    const suggestedUseCases = [];

    // Detect intents
    for (const [intent, keywords] of Object.entries(intents)) {
      if (keywords.some(keyword => message.includes(keyword))) {
        detectedIntents.push(intent);
      }
    }

    // Map intents to use cases and APIs
    if (detectedIntents.includes('voice-control')) {
      suggestedUseCases.push('voice-assistant');
      suggestedAPIs.add('openai').add('deepgram').add('elevenlabs');
    }
    if (detectedIntents.includes('robotics')) {
      suggestedUseCases.push('robotics-control');
      suggestedAPIs.add('manus-ai').add('openai');
    }
    if (detectedIntents.includes('agent-building')) {
      suggestedUseCases.push('ai-agent-builder');
      suggestedAPIs.add('openai').add('anthropic').add('groq');
    }
    if (detectedIntents.includes('code-editing')) {
      suggestedUseCases.push('code-editor');
      suggestedAPIs.add('openai').add('github');
    }
    if (detectedIntents.includes('ml-deployment')) {
      suggestedUseCases.push('ml-deployment');
      suggestedAPIs.add('replicate').add('huggingface').add('modal');
    }

    // Default: suggest full platform for complex needs
    if (detectedIntents.length > 2) {
      suggestedUseCases.push('full-platform');
    }

    this.detectedIntent = {
      intents: detectedIntents,
      useCases: suggestedUseCases,
      apis: Array.from(suggestedAPIs),
      confidence: detectedIntents.length > 0 ? 0.8 : 0.3
    };

    return this.detectedIntent;
  }

  /**
   * Auto-provision tools based on detected intent
   * @param {boolean} autoApply - Automatically apply configuration
   * @returns {Promise<Object>} Provisioning result
   */
  async autoProvision(autoApply = false) {
    if (!this.detectedIntent || this.detectedIntent.useCases.length === 0) {
      return {
        success: false,
        message: 'No clear intent detected. Please describe what you want to build.'
      };
    }

    const primaryUseCase = this.detectedIntent.useCases[0];

    if (autoApply) {
      try {
        const result = await orchestrateCircuitBox(primaryUseCase, this.tier, this.token);
        return {
          success: true,
          useCase: primaryUseCase,
          message: `✓ Auto-configured for ${USE_CASES[primaryUseCase].name}`,
          ...result
        };
      } catch (error) {
        return {
          success: false,
          error: error.message,
          message: 'Failed to auto-provision. You may need to upgrade your tier.'
        };
      }
    }

    return {
      success: true,
      recommendation: {
        useCase: primaryUseCase,
        description: USE_CASES[primaryUseCase].description,
        apis: this.detectedIntent.apis,
        message: `I recommend configuring for: ${USE_CASES[primaryUseCase].name}`
      }
    };
  }

  /**
   * Generate contextual guidance message
   * @returns {string} Guidance message
   */
  generateGuidance() {
    if (!this.detectedIntent || this.detectedIntent.confidence < 0.5) {
      return `👋 Hi! I'm ACHEEVY, your AI assistant. Tell me what you want to build, and I'll auto-configure the right tools for you!\n\nTry saying things like:\n• "I want to build a voice assistant"\n• "Help me deploy an ML model"\n• "I need robotics control with Manus AI"\n• "Set up a multi-agent system"`;
    }

    const useCase = this.detectedIntent.useCases[0];
    const apis = this.detectedIntent.apis.map(id => AVAILABLE_APIS[id]?.name || id).join(', ');

    return `🎯 Got it! Based on your request, I recommend:\n\n**Use Case:** ${USE_CASES[useCase].name}\n**APIs:** ${apis}\n\n${USE_CASES[useCase].description}\n\nShall I auto-configure these tools for you?`;
  }

  /**
   * Add message to conversation history
   * @param {string} role - 'user' or 'assistant'
   * @param {string} content - Message content
   */
  addToHistory(role, content) {
    this.conversationHistory.push({
      role,
      content,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get conversation summary
   * @returns {Object} Conversation summary
   */
  getSummary() {
    return {
      userId: this.userId,
      tier: this.tier,
      messageCount: this.conversationHistory.length,
      detectedIntent: this.detectedIntent,
      suggestedTools: this.suggestedTools
    };
  }
}

/**
 * ACHEEVY API endpoint integration
 * Routes messages to ACHEEVY core if configured
 */
export async function sendToACHEEVY(message, userId, context = {}) {
  const agentCoreUrl = import.meta.env.VITE_AGENT_CORE_URL || '';
  
  if (!agentCoreUrl) {
    // Fallback to local intent analysis
    return {
      source: 'local',
      message: 'ACHEEVY core not configured. Using local intent analysis.',
      guidance: 'Configure VITE_AGENT_CORE_URL for full ACHEEVY orchestration.'
    };
  }

  try {
    const response = await fetch(`${agentCoreUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message,
        userId,
        context: {
          ...context,
          platform: 'nurdscode',
          feature: 'circuit-box-orchestration'
        }
      })
    });

    if (!response.ok) {
      throw new Error(`ACHEEVY API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('ACHEEVY API error:', error);
    return {
      source: 'error',
      message: error.message,
      fallback: true
    };
  }
}

/**
 * Real-time guidance hook for React components
 */
export function useACHEEVYGuidance(userId, tier, token) {
  const assistant = new ACHEEVYAssistant(userId, tier, token);

  const analyzeAndGuide = async (userMessage) => {
    assistant.addToHistory('user', userMessage);
    await assistant.analyzeIntent(userMessage);
    const guidance = assistant.generateGuidance();
    assistant.addToHistory('assistant', guidance);
    return {
      guidance,
      intent: assistant.detectedIntent,
      canAutoProvision: assistant.detectedIntent?.confidence > 0.7
    };
  };

  const applyRecommendation = async () => {
    return await assistant.autoProvision(true);
  };

  return {
    analyzeAndGuide,
    applyRecommendation,
    getHistory: () => assistant.conversationHistory,
    getSummary: () => assistant.getSummary()
  };
}
