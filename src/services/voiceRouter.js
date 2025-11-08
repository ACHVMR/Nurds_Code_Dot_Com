/**
 * Voice NLP Router Service
 * Uses GPT-4o-mini for intent detection from voice commands
 * Maps natural language to agent actions
 */

const ROUTER_API_ENDPOINT = '/api/voice/route';

export class VoiceRouterService {
  constructor() {
    this.confidenceThreshold = 0.7;
  }

  /**
   * Route voice command to agent action
   * @param {string} transcript - Voice command transcript
   * @returns {Promise<{intent: string, confidence: number, params: object}>}
   */
  async routeCommand(transcript) {
    try {
      const response = await fetch(ROUTER_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ transcript })
      });

      if (!response.ok) {
        throw new Error('Routing failed');
      }

      const data = await response.json();
      
      return {
        intent: data.intent,
        confidence: data.confidence,
        params: data.params || {},
        needsConfirmation: data.confidence < this.confidenceThreshold
      };
    } catch (error) {
      console.error('Voice routing error:', error);
      throw error;
    }
  }

  /**
   * Get suggested actions based on intent
   * @param {string} intent
   * @returns {Array}
   */
  getSuggestedActions(intent) {
    const actionMap = {
      create_agent: [
        { label: 'Create Code Agent', type: 'code' },
        { label: 'Create Data Agent', type: 'data' },
        { label: 'Create Workflow Agent', type: 'workflow' }
      ],
      execute_task: [
        { label: 'Run Task', action: 'execute' },
        { label: 'Schedule Task', action: 'schedule' }
      ],
      modify_agent: [
        { label: 'Update Config', action: 'update' },
        { label: 'Edit Name', action: 'rename' }
      ],
      get_info: [
        { label: 'Show Status', action: 'status' },
        { label: 'View History', action: 'history' }
      ]
    };

    return actionMap[intent] || [];
  }
}

export const voiceRouter = new VoiceRouterService();

// Convenience function export
export const routeCommand = (transcript) => voiceRouter.routeCommand(transcript);
