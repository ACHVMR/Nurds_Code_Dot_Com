/**
 * Voice Routes for Cloudflare Workers
 * Speech-to-text and text-to-speech
 */

import { Router } from 'itty-router';
import { jsonResponse, successResponse } from '../utils/responses.js';
import { badRequest } from '../utils/errors.js';
import { requireAuth } from '../middleware/auth.js';
import { 
  transcribeAudio, 
  generateSpeech, 
  streamSpeech,
  VOICE_OPTIONS, 
  validateVoiceRequest,
} from '../services/voice.js';

const router = Router({ base: '/api/v1/voice' });

/**
 * GET /api/voice/options - Get available voice options
 */
router.get('/options', async (request, env) => {
  return successResponse(VOICE_OPTIONS);
});

/**
 * POST /api/voice/transcribe - Transcribe audio to text
 */
router.post('/transcribe', requireAuth(async (request, env, ctx) => {
  const contentType = request.headers.get('content-type') || '';

  let audioBuffer;
  let language = 'en';

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    const file = formData.get('audio');
    language = formData.get('language') || 'en';

    if (!file) {
      return badRequest('Audio file is required');
    }

    audioBuffer = await file.arrayBuffer();
  } else {
    // Assume raw audio body
    audioBuffer = await request.arrayBuffer();
    const url = new URL(request.url);
    language = url.searchParams.get('language') || 'en';
  }

  if (!audioBuffer || audioBuffer.byteLength === 0) {
    return badRequest('Empty audio data');
  }

  const result = await transcribeAudio(audioBuffer, { language }, env);

  return successResponse({
    text: result.text,
    language: result.language,
    duration: result.duration,
  });
}));

/**
 * POST /api/voice/synthesize - Convert text to speech
 */
router.post('/synthesize', requireAuth(async (request, env, ctx) => {
  const body = await request.json();
  const { text, voice, speed, format } = body;

  if (!text) {
    return badRequest('Text is required');
  }

  const validation = validateVoiceRequest({ text, voice });
  if (!validation.valid) {
    return badRequest(validation.errors.join(', '));
  }

  const audioBuffer = await generateSpeech(text, {
    voice: voice || 'alloy',
    speed: speed || 1.0,
    format: format || 'mp3',
  }, env);

  return new Response(audioBuffer, {
    headers: {
      'Content-Type': `audio/${format || 'mp3'}`,
      'Content-Length': String(audioBuffer.byteLength),
    },
  });
}));

/**
 * POST /api/voice/stream - Stream TTS audio
 */
router.post('/stream', requireAuth(async (request, env, ctx) => {
  const body = await request.json();
  const { text, voice, format } = body;

  if (!text) {
    return badRequest('Text is required');
  }

  return streamSpeech(text, {
    voice: voice || 'alloy',
    format: format || 'mp3',
  }, env);
}));

/**
 * POST /api/voice/chat - Voice-to-voice chat
 * Combines transcription, AI completion, and TTS
 */
router.post('/chat', requireAuth(async (request, env, ctx) => {
  const contentType = request.headers.get('content-type') || '';
  
  let audioBuffer;
  let agentId;
  let voice = 'alloy';

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    const file = formData.get('audio');
    agentId = formData.get('agentId');
    voice = formData.get('voice') || 'alloy';

    if (!file) {
      return badRequest('Audio file is required');
    }

    audioBuffer = await file.arrayBuffer();
  } else {
    return badRequest('Multipart form data required');
  }

  // Step 1: Transcribe audio
  const transcription = await transcribeAudio(audioBuffer, {}, env);
  const userMessage = transcription.text;

  // Step 2: Get AI response
  const { generateCompletion, SYSTEM_PROMPTS } = await import('../services/ai.js');
  const { getSupabaseClient, getAgent } = await import('../services/supabase.js');

  let systemPrompt = SYSTEM_PROMPTS.vibe;

  if (agentId) {
    const supabase = getSupabaseClient(env);
    const agent = await getAgent(agentId, ctx.user.userId, supabase);
    if (agent?.system_prompt) {
      systemPrompt = agent.system_prompt;
    }
  }

  const completion = await generateCompletion({
    messages: [{ role: 'user', content: userMessage }],
    systemPrompt,
  }, env);

  const responseText = completion.choices[0]?.message?.content || '';

  // Step 3: Generate speech
  const speechBuffer = await generateSpeech(responseText, { voice }, env);

  // Return both text and audio
  return new Response(speechBuffer, {
    headers: {
      'Content-Type': 'audio/mp3',
      'X-Transcription': encodeURIComponent(userMessage),
      'X-Response-Text': encodeURIComponent(responseText),
    },
  });
}));

export { router as voiceRouter };
