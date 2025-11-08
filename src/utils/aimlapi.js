/**
 * AI/ML API Client
 * Unified access to 200+ AI models (NO OpenAI)
 * Docs: https://docs.aimlapi.com
 */

const AIML_API_KEY = import.meta.env.VITE_AIML_API_KEY || import.meta.env.AIML_API_KEY;
const AIML_API_BASE_URL = import.meta.env.AIML_API_BASE_URL || 'https://api.aimlapi.com/v1';

/**
 * Available AI providers (excluding OpenAI per user request)
 */
export const AI_PROVIDERS = {
  // Text/Chat Models
  DEEPSEEK: 'deepseek',
  ANTHROPIC: 'anthropic',
  GOOGLE: 'google',
  META: 'meta',
  MISTRAL: 'mistral-ai',
  MINIMAX: 'minimax',
  COHERE: 'cohere',
  
  // Image Models
  FLUX: 'flux',
  STABILITY_AI: 'stability-ai',
  GOOGLE_IMAGEN: 'google',
  
  // Video Models
  KLING_AI: 'kling-ai',
  RUNWAY: 'runway',
  MINIMAX_VIDEO: 'minimax',
  
  // Speech Models
  ELEVENLABS: 'elevenlabs',
  DEEPGRAM: 'deepgram',
  GROQ: 'groq',
  
  // Music Models
  ELEVENLABS_MUSIC: 'elevenlabs',
  STABILITY_MUSIC: 'stability-ai',
  MINIMAX_MUSIC: 'minimax'
};

/**
 * Recommended models for common tasks
 * Default LLM: DeepSeek (fast, affordable, high-quality)
 */
export const RECOMMENDED_MODELS = {
  // Chat/Text Generation (DeepSeek as DEFAULT - NO OpenAI)
  CHAT_DEFAULT: 'deepseek-chat',           // ⭐ PRIMARY: Fast, smart, cost-effective
  CHAT_FAST: 'deepseek-chat',              // DeepSeek v3 - fastest responses
  CHAT_REASONING: 'deepseek-reasoner',     // DeepSeek R1 - advanced reasoning
  CHAT_CODING: 'deepseek-coder',           // DeepSeek Coder - specialized for code
  CHAT_SMART: 'claude-3-5-sonnet-20241022', // Claude Sonnet - when need extra quality
  
  // GLM Models (Latest versions - Zhipu AI)
  GLM_CHAT: 'glm-4-plus',                  // GLM-4 Plus - latest chat model
  GLM_VISION: 'glm-4v-plus',               // GLM-4V Plus - vision + chat
  GLM_LONG: 'glm-4-long',                  // GLM-4 Long - 1M context window
  GLM_FLASH: 'glm-4-flash',                // GLM-4 Flash - ultra fast
  GLM_AIR: 'glm-4-air',                    // GLM-4 Air - balanced speed/quality
  
  // Image Generation
  IMAGE_FAST: 'flux/schnell',
  IMAGE_QUALITY: 'flux/pro',
  IMAGE_REALISTIC: 'stable-diffusion-3-large',
  IMAGE_GLM: 'cogview-3-plus',             // GLM CogView-3 Plus for images
  
  // Voice/Speech
  VOICE_TTS: 'eleven_multilingual_v2',
  VOICE_STT: 'whisper-large-v3',
  
  // Video Generation
  VIDEO_FAST: 'kling-v1',
  VIDEO_QUALITY: 'runway-gen3',
  VIDEO_GLM: 'cogvideox-5b',               // GLM CogVideoX for videos
  
  // Music Generation
  MUSIC: 'stable-audio-open-1.0'
};

/**
 * Chat completion with AI/ML API
 * @param {Object} options - Chat options
 * @param {string} options.model - Model ID (default: 'deepseek-chat')
 * @param {Array} options.messages - Chat messages array
 * @param {boolean} options.stream - Enable streaming
 * @param {number} options.temperature - Temperature (0-2)
 * @param {number} options.max_tokens - Max tokens to generate
 * @returns {Promise<Object>} - API response
 */
export async function chatCompletion({
  model = RECOMMENDED_MODELS.CHAT_DEFAULT, // ⭐ DeepSeek as default
  messages,
  stream = false,
  temperature = 0.7,
  max_tokens = 2000,
  ...otherOptions
}) {
  try {
    const response = await fetch(`${AIML_API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AIML_API_KEY}`
      },
      body: JSON.stringify({
        model,
        messages,
        stream,
        temperature,
        max_tokens,
        ...otherOptions
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`AI/ML API Error: ${error.error?.message || response.statusText}`);
    }

    if (stream) {
      return response; // Return raw response for streaming
    }

    return await response.json();
  } catch (error) {
    console.error('AI/ML API Error:', error);
    throw error;
  }
}

/**
 * Generate image with AI/ML API
 * @param {Object} options - Image generation options
 * @param {string} options.model - Model ID (e.g., 'flux/schnell', 'stable-diffusion-3')
 * @param {string} options.prompt - Image description
 * @param {number} options.width - Image width
 * @param {number} options.height - Image height
 * @param {number} options.steps - Generation steps
 * @returns {Promise<Object>} - API response with image URL
 */
export async function generateImage({
  model = RECOMMENDED_MODELS.IMAGE_FAST,
  prompt,
  width = 1024,
  height = 1024,
  steps = 4,
  ...otherOptions
}) {
  try {
    const response = await fetch(`${AIML_API_BASE_URL}/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AIML_API_KEY}`
      },
      body: JSON.stringify({
        model,
        prompt,
        width,
        height,
        steps,
        ...otherOptions
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`AI/ML API Error: ${error.error?.message || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('AI/ML API Error:', error);
    throw error;
  }
}

/**
 * Text-to-Speech with AI/ML API (ElevenLabs)
 * @param {Object} options - TTS options
 * @param {string} options.text - Text to convert to speech
 * @param {string} options.voice_id - Voice ID (default: Rachel)
 * @param {string} options.model_id - Model ID
 * @returns {Promise<Blob>} - Audio blob
 */
export async function textToSpeech({
  text,
  voice_id = 'rachel',
  model_id = RECOMMENDED_MODELS.VOICE_TTS,
  ...otherOptions
}) {
  try {
    const response = await fetch(`${AIML_API_BASE_URL}/audio/speech`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AIML_API_KEY}`
      },
      body: JSON.stringify({
        text,
        voice_id,
        model_id,
        ...otherOptions
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`AI/ML API Error: ${error.error?.message || response.statusText}`);
    }

    return await response.blob();
  } catch (error) {
    console.error('AI/ML API Error:', error);
    throw error;
  }
}

/**
 * Speech-to-Text with AI/ML API (Groq Whisper)
 * @param {File|Blob} audioFile - Audio file to transcribe
 * @param {string} model - Model ID (default: whisper-large-v3)
 * @returns {Promise<Object>} - Transcription result
 */
export async function speechToText(audioFile, model = RECOMMENDED_MODELS.VOICE_STT) {
  try {
    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('model', model);

    const response = await fetch(`${AIML_API_BASE_URL}/audio/transcriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIML_API_KEY}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`AI/ML API Error: ${error.error?.message || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('AI/ML API Error:', error);
    throw error;
  }
}

/**
 * Generate video with AI/ML API
 * @param {Object} options - Video generation options
 * @param {string} options.prompt - Video description
 * @param {string} options.model - Model ID (default: kling-v1)
 * @returns {Promise<Object>} - API response with video URL
 */
export async function generateVideo({
  prompt,
  model = RECOMMENDED_MODELS.VIDEO_FAST,
  ...otherOptions
}) {
  try {
    const response = await fetch(`${AIML_API_BASE_URL}/video/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AIML_API_KEY}`
      },
      body: JSON.stringify({
        model,
        prompt,
        ...otherOptions
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`AI/ML API Error: ${error.error?.message || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('AI/ML API Error:', error);
    throw error;
  }
}

/**
 * Generate music with AI/ML API
 * @param {Object} options - Music generation options
 * @param {string} options.prompt - Music description
 * @param {string} options.model - Model ID
 * @param {number} options.duration - Duration in seconds
 * @returns {Promise<Object>} - API response with music URL
 */
export async function generateMusic({
  prompt,
  model = RECOMMENDED_MODELS.MUSIC,
  duration = 30,
  ...otherOptions
}) {
  try {
    const response = await fetch(`${AIML_API_BASE_URL}/audio/music`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AIML_API_KEY}`
      },
      body: JSON.stringify({
        model,
        prompt,
        duration,
        ...otherOptions
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`AI/ML API Error: ${error.error?.message || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('AI/ML API Error:', error);
    throw error;
  }
}

export default {
  chatCompletion,
  generateImage,
  textToSpeech,
  speechToText,
  generateVideo,
  generateMusic,
  AI_PROVIDERS,
  RECOMMENDED_MODELS
};
