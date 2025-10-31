/**
 * Voice AI API Handlers for Cloudflare Workers
 * Default: OpenAI Whisper STT/TTS
 * Optional: Deepgram STT, ElevenLabs TTS
 */

import { OpenAIVoice, DeepgramSTT, ElevenLabsTTS } from './voice.js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Voice-Provider',
};

/**
 * Handle audio transcription request
 * POST /api/voice/transcribe
 */
export async function handleTranscribe(request, env) {
  try {
    const contentType = request.headers.get('content-type') || '';
    const provider = request.headers.get('x-voice-provider') || 'openai';
    
    // Initialize voice provider
    let stt;
    if (provider === 'deepgram' && env.DEEPGRAM_API_KEY) {
      stt = new DeepgramSTT(env.DEEPGRAM_API_KEY);
    } else {
      // Default to OpenAI Whisper
      stt = new OpenAIVoice(env.OPENAI_API_KEY);
    }
    
    let audioData;
    let options = {};
    
    // Handle different content types
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const audioFile = formData.get('audio');
      const language = formData.get('language') || 'en';
      const model = formData.get('model');
      
      if (!audioFile) {
        return new Response(
          JSON.stringify({ error: 'No audio file provided' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      audioData = audioFile;
      options = { language };
      if (model) options.model = model;
      
    } else if (contentType.includes('application/json')) {
      const body = await request.json();
      
      if (body.audioUrl) {
        const audioResponse = await fetch(body.audioUrl);
        audioData = await audioResponse.arrayBuffer();
      } else if (body.audioBase64) {
        const binaryString = atob(body.audioBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        audioData = bytes.buffer;
      } else {
        return new Response(
          JSON.stringify({ error: 'No audio data provided' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      options = {
        language: body.language || 'en',
        model: body.model
      };
      
    } else {
      audioData = await request.arrayBuffer();
      options = { language: 'en' };
    }
    
    // Transcribe the audio
    const result = await stt.transcribe(audioData, options);
    
    return new Response(
      JSON.stringify({
        success: true,
        ...result,
        provider: provider
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
    
  } catch (error) {
    console.error('Transcription error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * Handle text-to-speech request
 * POST /api/voice/synthesize
 */
export async function handleSynthesize(request, env) {
  try {
    const body = await request.json();
    const { text, voice, speed, model } = body;
    const provider = request.headers.get('x-voice-provider') || 'openai';
    
    if (!text) {
      return new Response(
        JSON.stringify({ error: 'No text provided' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Initialize voice provider
    let tts;
    if (provider === 'elevenlabs' && env.ELEVENLABS_API_KEY) {
      tts = new ElevenLabsTTS(env.ELEVENLABS_API_KEY);
    } else {
      // Default to OpenAI TTS
      tts = new OpenAIVoice(env.OPENAI_API_KEY);
    }
    
    // Generate speech
    const audioData = await tts.textToSpeech(text, {
      voice: voice || 'alloy',
      speed: speed || 1.0,
      model: model || 'tts-1'
    });
    
    return new Response(audioData, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'inline; filename="speech.mp3"'
      }
    });
    
  } catch (error) {
    console.error('TTS error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * Handle list voices request
 * GET /api/voice/voices
 */
export async function handleListVoices(request, env) {
  try {
    const provider = request.headers.get('x-voice-provider') || 'openai';
    
    let voices = [];
    
    if (provider === 'openai') {
      const openai = new OpenAIVoice(env.OPENAI_API_KEY);
      voices = openai.listVoices();
    } else if (provider === 'elevenlabs' && env.ELEVENLABS_API_KEY) {
      const elevenlabs = new ElevenLabsTTS(env.ELEVENLABS_API_KEY);
      voices = await elevenlabs.listVoices();
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        provider,
        voices
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
    
  } catch (error) {
    console.error('List voices error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * Handle full voice conversation request
 * POST /api/voice/conversation
 * Transcribe audio → Send to AI → Synthesize response
 */
export async function handleVoiceConversation(request, env) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio');
    const userId = formData.get('userId') || 'anonymous';
    const voice = formData.get('voice') || 'alloy';
    const provider = request.headers.get('x-voice-provider') || 'openai';
    
    if (!audioFile) {
      return new Response(
        JSON.stringify({ error: 'No audio file provided' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Step 1: Transcribe audio (using OpenAI Whisper by default)
    const stt = provider === 'deepgram' && env.DEEPGRAM_API_KEY 
      ? new DeepgramSTT(env.DEEPGRAM_API_KEY)
      : new OpenAIVoice(env.OPENAI_API_KEY);
      
    const transcription = await stt.transcribe(audioFile);
    const userMessage = transcription.text;
    
    if (!userMessage) {
      return new Response(
        JSON.stringify({ error: 'No speech detected in audio' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Step 2: Send to AI (chat endpoint)
    const chatResponse = await fetch(`${new URL(request.url).origin}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: userMessage,
        userId,
        plan: 'free'
      })
    });
    
    if (!chatResponse.ok) {
      throw new Error('AI response failed');
    }
    
    const chatData = await chatResponse.json();
    const aiMessage = chatData.response || 'I apologize, but I could not generate a response.';
    
    // Step 3: Synthesize response (using OpenAI TTS by default)
    const tts = provider === 'elevenlabs' && env.ELEVENLABS_API_KEY
      ? new ElevenLabsTTS(env.ELEVENLABS_API_KEY)
      : new OpenAIVoice(env.OPENAI_API_KEY);
      
    const audioData = await tts.textToSpeech(aiMessage, { voice });
    
    // Return audio with metadata
    return new Response(
      JSON.stringify({
        success: true,
        transcript: userMessage,
        aiResponse: aiMessage,
        audioBase64: Buffer.from(audioData).toString('base64'),
        provider
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
    
  } catch (error) {
    console.error('Voice conversation error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}
