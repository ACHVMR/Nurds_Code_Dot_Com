/**
 * Groq-compatible TTS Service
 * Text-to-Speech using OpenAI-compatible API
 * NOT using PlayAI per user requirements
 */

const TTS_API_ENDPOINT = '/api/voice/speak';

export class GroqTTSService {
  constructor() {
    this.defaultVoice = 'alloy';
    this.availableVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
  }

  /**
   * Convert text to speech
   * @param {string} text - Text to convert
   * @param {string} voiceId - Voice ID (default: 'alloy')
   * @param {string} personality - Voice personality (optional)
   * @returns {Promise<{audioUrl: string, cost: number, duration: number}>}
   */
  async speak(text, voiceId = null, personality = 'default') {
    try {
      const response = await fetch(TTS_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text,
          voiceId: voiceId || this.defaultVoice,
          personality
        })
      });

      if (!response.ok) {
        throw new Error('TTS generation failed');
      }

      const data = await response.json();
      
      return {
        audioUrl: data.audioUrl,
        cost: data.cost, // in cents
        duration: data.duration
      };
    } catch (error) {
      console.error('TTS error:', error);
      throw error;
    }
  }

  /**
   * Play audio from URL
   * @param {string} audioUrl
   * @returns {Promise<void>}
   */
  async playAudio(audioUrl) {
    return new Promise((resolve, reject) => {
      const audio = new Audio(audioUrl);
      
      audio.onended = () => resolve();
      audio.onerror = (error) => reject(error);
      
      audio.play().catch(reject);
    });
  }

  /**
   * Estimate TTS cost
   * @param {string} text
   * @returns {number} Cost in cents
   */
  estimateCost(text) {
    // OpenAI TTS pricing: $15/1M characters
    const chars = text.length;
    const costPerChar = 15 / 1000000; // cents per character
    return Math.ceil(chars * costPerChar * 100); // convert to cents
  }

  /**
   * Get available voices
   * @returns {Array<string>}
   */
  getVoices() {
    return this.availableVoices;
  }
}

export const groqTTS = new GroqTTSService();
