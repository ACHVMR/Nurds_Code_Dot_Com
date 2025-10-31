/**
 * ============================================
 * Voice AI Integration Module
 * OpenAI Whisper (Default STT/TTS) + Optional: Deepgram & ElevenLabs
 * ============================================
 * 
 * This module provides voice input/output capabilities for the
 * Nurds Code platform, enabling voice-controlled coding assistance.
 * 
 * Default: OpenAI Whisper for both STT and TTS
 * Optional: Deepgram for STT, ElevenLabs for TTS
 */

/**
 * OpenAI Whisper Speech-to-Text and TTS Integration (DEFAULT)
 */
export class OpenAIVoice {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.sttBaseUrl = 'https://api.openai.com/v1/audio/transcriptions';
    this.ttsBaseUrl = 'https://api.openai.com/v1/audio/speech';
  }

  /**
   * Transcribe audio to text using Whisper
   * @param {Blob|File} audioFile - Audio file data
   * @param {Object} options - Transcription options
   * @returns {Promise<Object>} Transcription result
   */
  async transcribe(audioFile, options = {}) {
    const {
      model = 'whisper-1',
      language = 'en',
      prompt = '',
      temperature = 0
    } = options;

    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('model', model);
    if (language) formData.append('language', language);
    if (prompt) formData.append('prompt', prompt);
    if (temperature) formData.append('temperature', temperature.toString());

    try {
      const response = await fetch(this.sttBaseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Transcription failed');
      }

      const result = await response.json();
      return {
        text: result.text,
        language: language,
        duration: result.duration
      };
    } catch (error) {
      console.error('OpenAI Whisper transcription error:', error);
      throw error;
    }
  }

  /**
   * Convert text to speech using OpenAI TTS
   * @param {string} text - Text to convert to speech
   * @param {Object} options - TTS options
   * @returns {Promise<ArrayBuffer>} Audio data
   */
  async textToSpeech(text, options = {}) {
    const {
      model = 'tts-1',
      voice = 'alloy',
      speed = 1.0
    } = options;

    try {
      const response = await fetch(this.ttsBaseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          input: text,
          voice,
          speed
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'TTS failed');
      }

      return await response.arrayBuffer();
    } catch (error) {
      console.error('OpenAI TTS error:', error);
      throw error;
    }
  }

  /**
   * List available voices
   * @returns {Array} Available voices
   */
  listVoices() {
    return [
      { id: 'alloy', name: 'Alloy', description: 'Neutral and balanced' },
      { id: 'echo', name: 'Echo', description: 'Male voice' },
      { id: 'fable', name: 'Fable', description: 'British accent' },
      { id: 'onyx', name: 'Onyx', description: 'Deep male voice' },
      { id: 'nova', name: 'Nova', description: 'Energetic female voice' },
      { id: 'shimmer', name: 'Shimmer', description: 'Soft female voice' }
    ];
  }
}

/**
 * Deepgram Speech-to-Text Integration (OPTIONAL)
 */
export class DeepgramSTT {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.deepgram.com/v1/listen';
  }

  async transcribe(audioData, options = {}) {
    const {
      model = 'nova-2',
      language = 'en-US',
      punctuate = true,
      diarize = false,
      smart_format = true
    } = options;

    const params = new URLSearchParams({
      model,
      language,
      punctuate: punctuate.toString(),
      diarize: diarize.toString(),
      smart_format: smart_format.toString()
    });

    try {
      const response = await fetch(`${this.baseUrl}?${params}`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.apiKey}`,
          'Content-Type': 'application/octet-stream'
        },
        body: audioData
      });

      if (!response.ok) {
        throw new Error(`Deepgram API error: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        text: result.results?.channels?.[0]?.alternatives?.[0]?.transcript || '',
        confidence: result.results?.channels?.[0]?.alternatives?.[0]?.confidence || 0,
        words: result.results?.channels?.[0]?.alternatives?.[0]?.words || []
      };
    } catch (error) {
      console.error('Deepgram transcription error:', error);
      throw error;
    }
  }
}

/**
 * ElevenLabs Text-to-Speech Integration (OPTIONAL)
 */
export class ElevenLabsTTS {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.elevenlabs.io/v1';
  }

  async textToSpeech(text, options = {}) {
    const {
      voiceId = 'EXAVITQu4vr4xnSDxMaL',
      modelId = 'eleven_turbo_v2',
      stability = 0.5,
      similarity_boost = 0.75
    } = options;

    try {
      const response = await fetch(`${this.baseUrl}/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text,
          model_id: modelId,
          voice_settings: {
            stability,
            similarity_boost
          }
        })
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.statusText}`);
      }

      return await response.arrayBuffer();
    } catch (error) {
      console.error('ElevenLabs TTS error:', error);
      throw error;
    }
  }

  async listVoices() {
    try {
      const response = await fetch(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.voices || [];
    } catch (error) {
      console.error('ElevenLabs list voices error:', error);
      throw error;
    }
  }
}

/**
 * Unified Voice Integration Manager
 * Uses OpenAI Whisper by default, with fallback to Deepgram/ElevenLabs
 */
export class VoiceIntegration {
  constructor(apiKeys, options = {}) {
    const { openai, deepgram, elevenlabs } = apiKeys;
    
    // Default to OpenAI Whisper
    this.provider = options.provider || 'openai';
    
    // Initialize all providers
    if (openai) {
      this.openai = new OpenAIVoice(openai);
    }
    if (deepgram) {
      this.deepgram = new DeepgramSTT(deepgram);
    }
    if (elevenlabs) {
      this.elevenlabs = new ElevenLabsTTS(elevenlabs);
    }
    
    // Set active providers based on preference
    this.stt = this.openai || this.deepgram;
    this.tts = this.openai || this.elevenlabs;
    
    this.isListening = false;
    this.isSpeaking = false;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.defaultVoiceId = options.voiceId || 'alloy'; // Default OpenAI voice
    this.onTranscript = options.onTranscript || (() => {});
    this.onSpeechEnd = options.onSpeechEnd || (() => {});
    this.onError = options.onError || ((error) => console.error('Voice error:', error));
  }

  /**
   * Switch voice provider
   * @param {string} provider - 'openai', 'deepgram', or 'elevenlabs'
   */
  switchProvider(provider) {
    if (provider === 'openai' && this.openai) {
      this.provider = 'openai';
      this.stt = this.openai;
      this.tts = this.openai;
    } else if (provider === 'deepgram' && this.deepgram) {
      this.provider = 'deepgram';
      this.stt = this.deepgram;
      // Keep TTS as is (could be OpenAI or ElevenLabs)
    } else if (provider === 'elevenlabs' && this.elevenlabs) {
      this.provider = 'elevenlabs';
      this.tts = this.elevenlabs;
      // Keep STT as is (could be OpenAI or Deepgram)
    } else {
      throw new Error(`Provider ${provider} not available or not initialized`);
    }
  }

  /**
   * Start listening to microphone input
   * @returns {Promise<void>}
   */
  async startListening() {
    if (this.isListening) {
      console.warn('Already listening');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        await this.processAudio(audioBlob);
        this.audioChunks = [];
        stream.getTracks().forEach(track => track.stop());
      };

      this.mediaRecorder.start();
      this.isListening = true;
    } catch (error) {
      console.error('Error starting microphone:', error);
      this.onError(error);
      throw error;
    }
  }

  /**
   * Stop listening
   */
  stopListening() {
    if (this.mediaRecorder && this.isListening) {
      this.mediaRecorder.stop();
      this.isListening = false;
    }
  }

  /**
   * Process recorded audio
   * @param {Blob} audioBlob - Recorded audio data
   */
  async processAudio(audioBlob) {
    try {
      const result = await this.stt.transcribe(audioBlob);
      const transcript = result.text || '';
      
      if (transcript) {
        this.onTranscript(transcript);
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      this.onError(error);
    }
  }

  /**
   * Convert text to speech and play
   * @param {string} text - Text to speak
   * @param {Object} options - TTS options
   */
  async speak(text, options = {}) {
    if (this.isSpeaking) {
      console.warn('Already speaking');
      return;
    }

    try {
      this.isSpeaking = true;
      
      const audioData = await this.tts.textToSpeech(text, {
        voiceId: options.voiceId || this.defaultVoiceId,
        ...options
      });

      const audioBlob = new Blob([audioData], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.onended = () => {
        this.isSpeaking = false;
        URL.revokeObjectURL(audioUrl);
        this.onSpeechEnd();
      };

      audio.onerror = (error) => {
        this.isSpeaking = false;
        URL.revokeObjectURL(audioUrl);
        console.error('Audio playback error:', error);
        this.onError(error);
      };

      await audio.play();
    } catch (error) {
      this.isSpeaking = false;
      console.error('Error speaking:', error);
      this.onError(error);
      throw error;
    }
  }

  /**
   * Start a voice conversation loop
   * @param {Function} onMessage - Callback for processing transcribed messages
   */
  async startVoiceConversation(onMessage) {
    this.onTranscript = async (transcript) => {
      console.log('User said:', transcript);
      
      // Stop listening while processing
      this.stopListening();
      
      // Process the message and get response
      const response = await onMessage(transcript);
      
      if (response) {
        // Speak the response
        await this.speak(response);
      }
      
      // Resume listening after speaking
      if (!this.isListening) {
        setTimeout(() => {
          this.startListening();
        }, 500);
      }
    };

    // Start initial listening
    await this.startListening();
  }

  /**
   * Stop voice conversation
   */
  stopVoiceConversation() {
    this.stopListening();
    this.isSpeaking = false;
  }

  /**
   * Get available voices based on current provider
   * @returns {Promise<Array>|Array}
   */
  async getVoices() {
    // Always reflect the active TTS provider's available voices
    if (this.tts === this.openai && this.openai) {
      return this.openai.listVoices();
    }
    if (this.tts === this.elevenlabs && this.elevenlabs) {
      return await this.elevenlabs.listVoices();
    }
    return [];
  }
}

/**
 * Helper: Convert audio to base64
 */
export function audioToBase64(audioBlob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(audioBlob);
  });
}

/**
 * Helper: Convert base64 to audio blob
 */
export function base64ToAudioBlob(base64, mimeType = 'audio/mpeg') {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

/**
 * Check browser support for voice features
 */
export function checkVoiceSupport() {
  return {
    mediaDevices: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
    audioContext: !!(window.AudioContext || window.webkitAudioContext),
    mediaRecorder: !!window.MediaRecorder,
    webAudio: !!window.Audio
  };
}
