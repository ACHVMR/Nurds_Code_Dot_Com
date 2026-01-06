import { VertexAI } from '@google-cloud/vertexai';
import { OpenRouter } from './openrouter-client';

export interface Intent {
  type: 'creation' | 'analysis' | 'refactor' | 'debug';
  useRLM?: boolean;
  confidence: number;
  metadata?: any;
}

export class IntentClassifier {
  private vertexAI: VertexAI;
  private openRouter: OpenRouter;

  constructor() {
    this.vertexAI = new VertexAI({ 
      project: process.env.GOOGLE_CLOUD_PROJECT || 'cosmic-tenure-480918-a9',
      location: process.env.VERTEX_LOCATION || 'us-central1'
    });
    this.openRouter = new OpenRouter(process.env.OPENROUTER_API_KEY);
  }

  async classify(userRequest: string): Promise<Intent> {
    // Use OpenRouter for default classification
    const intent = await this.openRouter.classify({
      model: 'anthropic/claude-3-haiku', // Fast + cheap
      prompt: `Classify intent: ${userRequest}`,
      type: ['creation', 'analysis', 'refactor', 'debug']
    });

    // If context > 128k tokens, flag for RLM deep-dive
    if (this.estimateTokens(userRequest) > 128000) {
      return { ...intent, useRLM: true };
    }

    return intent;
  }

  private estimateTokens(text: string): number {
    // Simple estimation: ~4 chars per token
    return Math.ceil(text.length / 4);
  }
}
