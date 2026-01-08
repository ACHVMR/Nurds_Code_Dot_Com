/**
 * Voice Service for Cloudflare Workers
 * Speech-to-text and text-to-speech
 */

/**
 * Transcribe audio using Groq Whisper
 * @param {ArrayBuffer} audioBuffer - Audio data
 * @param {object} options - Transcription options
 * @param {object} env - Environment bindings
 * @returns {Promise<object>} Transcription result
 */
export async function transcribeAudio(audioBuffer, options, env) {
  const {
    language = 'en',
    model = 'whisper-large-v3',
  } = options;

  const formData = new FormData();
  formData.append('file', new Blob([audioBuffer], { type: 'audio/webm' }), 'audio.webm');
  formData.append('model', model);
  formData.append('language', language);
  formData.append('response_format', 'json');

  const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.GROQ_API_KEY}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Transcription failed: ${error}`);
  }

  return response.json();
}

/**
 * Generate speech from text using OpenAI TTS
 * @param {string} text - Text to synthesize
 * @param {object} options - TTS options
 * @param {object} env - Environment bindings
 * @returns {Promise<ArrayBuffer>} Audio data
 */
export async function generateSpeech(text, options, env) {
  const {
    voice = 'alloy',
    model = 'tts-1',
    speed = 1.0,
    format = 'mp3',
  } = options;

  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      voice,
      input: text,
      speed,
      response_format: format,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Speech generation failed: ${error}`);
  }

  return response.arrayBuffer();
}

/**
 * Create streaming TTS response
 * @param {string} text - Text to synthesize
 * @param {object} options - TTS options
 * @param {object} env - Environment bindings
 * @returns {Response} Streaming audio response
 */
export async function streamSpeech(text, options, env) {
  const audioBuffer = await generateSpeech(text, options, env);

  return new Response(audioBuffer, {
    headers: {
      'Content-Type': `audio/${options.format || 'mp3'}`,
      'Content-Length': String(audioBuffer.byteLength),
    },
  });
}

/**
 * Voice configuration options
 */
export const VOICE_OPTIONS = {
  voices: [
    { id: 'alloy', name: 'Alloy', description: 'Neutral and balanced' },
    { id: 'echo', name: 'Echo', description: 'Warm and conversational' },
    { id: 'fable', name: 'Fable', description: 'Expressive and dynamic' },
    { id: 'onyx', name: 'Onyx', description: 'Deep and authoritative' },
    { id: 'nova', name: 'Nova', description: 'Friendly and upbeat' },
    { id: 'shimmer', name: 'Shimmer', description: 'Soft and pleasant' },
  ],
  languages: [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'ja', name: 'Japanese' },
    { code: 'zh', name: 'Chinese' },
  ],
  models: {
    transcription: ['whisper-large-v3', 'whisper-large-v3-turbo'],
    tts: ['tts-1', 'tts-1-hd'],
  },
};

/**
 * Validate voice request
 * @param {object} request - Voice request
 * @returns {object} Validation result
 */
export function validateVoiceRequest(request) {
  const errors = [];

  if (!request.text && !request.audio) {
    errors.push('Either text or audio is required');
  }

  if (request.voice && !VOICE_OPTIONS.voices.find(v => v.id === request.voice)) {
    errors.push(`Invalid voice: ${request.voice}`);
  }

  if (request.language && !VOICE_OPTIONS.languages.find(l => l.code === request.language)) {
    errors.push(`Invalid language: ${request.language}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
