/**
 * Groq Whisper v3 ASR Service
 * Primary voice transcription with fallback chain
 * Pricing: $0.04-$0.111/hour with 10-second minimum billing
 */

const GROQ_API_ENDPOINT = '/api/voice/transcribe';

// Fallback chain: Groq → Deepgram → ElevenLabs → OpenAI
const FALLBACK_PROVIDERS = ['groq', 'deepgram', 'elevenlabs', 'openai'];

export class GroqWhisperService {
  constructor() {
    this.minBillingSeconds = 10;
    this.currentProvider = 'groq';
  }

  /**
   * Transcribe audio using Groq Whisper v3 with fallback chain
   * @param {Blob} audioBlob - Audio file blob (WAV, MP3, OGG, WebM)
   * @param {string} language - Language code (default: 'en')
   * @returns {Promise<{transcript: string, duration: number, cost: number, provider: string}>}
   */
  async transcribe(audioBlob, language = 'en') {
    // Calculate duration from blob
    const duration = await this.getAudioDuration(audioBlob);
    const billableDuration = Math.max(duration, this.minBillingSeconds);

    // Try each provider in fallback chain
    for (const provider of FALLBACK_PROVIDERS) {
      try {
        const result = await this.transcribeWithProvider(
          audioBlob,
          language,
          provider,
          billableDuration
        );
        
        return {
          ...result,
          provider,
          actualDuration: duration,
          billableDuration
        };
      } catch (error) {
        console.error(`[${provider}] Transcription failed:`, error);
        
        // If not last provider, try next one
        if (provider !== FALLBACK_PROVIDERS[FALLBACK_PROVIDERS.length - 1]) {
          console.log(`Falling back to next provider...`);
          continue;
        }
        
        // All providers failed
        throw new Error('All transcription providers failed');
      }
    }
  }

  /**
   * Transcribe with specific provider
   * @private
   */
  async transcribeWithProvider(audioBlob, language, provider, billableDuration) {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    formData.append('language', language);
    formData.append('provider', provider);
    formData.append('duration', billableDuration);

    const response = await fetch(GROQ_API_ENDPOINT, {
      method: 'POST',
      body: formData,
      headers: {
        // Auth header added by fetchAuthed wrapper
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `${provider} API error`);
    }

    const data = await response.json();
    
    return {
      transcript: data.transcript,
      duration: data.duration,
      cost: data.cost, // In cents
      confidence: data.confidence || null
    };
  }

  /**
   * Get audio duration from blob
   * @private
   */
  async getAudioDuration(audioBlob) {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.preload = 'metadata';
      
      audio.onloadedmetadata = () => {
        URL.revokeObjectURL(audio.src);
        resolve(Math.ceil(audio.duration));
      };
      
      audio.onerror = () => {
        URL.revokeObjectURL(audio.src);
        reject(new Error('Failed to load audio metadata'));
      };
      
      audio.src = URL.createObjectURL(audioBlob);
    });
  }

  /**
   * Check if audio format is supported
   * @param {string} mimeType - Audio MIME type
   * @returns {boolean}
   */
  isFormatSupported(mimeType) {
    const supportedFormats = [
      'audio/wav',
      'audio/mpeg',
      'audio/mp3',
      'audio/ogg',
      'audio/webm',
      'audio/webm;codecs=opus'
    ];
    
    return supportedFormats.some(format => mimeType.includes(format));
  }

  /**
   * Get estimated cost for audio duration
   * @param {number} durationSeconds - Audio duration in seconds
   * @param {string} provider - Provider name (default: 'groq')
   * @returns {number} Cost in cents
   */
  estimateCost(durationSeconds, provider = 'groq') {
    const billableSeconds = Math.max(durationSeconds, this.minBillingSeconds);
    const hours = billableSeconds / 3600;
    
    // Pricing per hour (in cents)
    const pricing = {
      groq: 4,        // $0.04/hour
      deepgram: 8,    // $0.08/hour
      elevenlabs: 10, // $0.10/hour
      openai: 11      // $0.11/hour (fallback pricing)
    };
    
    const costPerHour = pricing[provider] || pricing.groq;
    return Math.ceil(hours * costPerHour);
  }
}

// Singleton instance
export const groqWhisper = new GroqWhisperService();
