// OpenRouter API Client for LLM routing
export interface ClassifyRequest {
  model: string;
  prompt: string;
  type: string[];
}

export interface ClassifyResult {
  type: 'creation' | 'analysis' | 'refactor' | 'debug';
  confidence: number;
  metadata?: any;
}

export class OpenRouter {
  private apiKey: string | undefined;
  private baseUrl = 'https://openrouter.ai/api/v1';

  constructor(apiKey: string | undefined) {
    this.apiKey = apiKey;
  }

  async classify(request: ClassifyRequest): Promise<ClassifyResult> {
    if (!this.apiKey) {
      // Return default classification when API key is not available
      return {
        type: 'creation',
        confidence: 0.5
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://nurdscode.com',
          'X-Title': 'Nurds Code Agent'
        },
        body: JSON.stringify({
          model: request.model,
          messages: [
            {
              role: 'system',
              content: `You are an intent classifier. Classify the user request into one of these categories: ${request.type.join(', ')}. Respond with JSON: {"type": "category", "confidence": 0.0-1.0}`
            },
            {
              role: 'user',
              content: request.prompt
            }
          ],
          temperature: 0.1,
          max_tokens: 100
        })
      });

      const data = await response.json() as any;
      const content = data.choices?.[0]?.message?.content || '{}';
      
      try {
        const parsed = JSON.parse(content);
        return {
          type: parsed.type || 'creation',
          confidence: parsed.confidence || 0.5
        };
      } catch {
        return { type: 'creation', confidence: 0.5 };
      }
    } catch (error) {
      console.error('OpenRouter classify error:', error);
      return { type: 'creation', confidence: 0.5 };
    }
  }

  async complete(model: string, prompt: string): Promise<string> {
    if (!this.apiKey) {
      return 'OpenRouter API key not configured';
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://nurdscode.com',
          'X-Title': 'Nurds Code Agent'
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7
        })
      });

      const data = await response.json() as any;
      return data.choices?.[0]?.message?.content || '';
    } catch (error) {
      console.error('OpenRouter complete error:', error);
      throw error;
    }
  }
}
