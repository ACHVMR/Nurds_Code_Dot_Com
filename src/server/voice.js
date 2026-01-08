/**
 * Voice Server Module (Client-side stub)
 * Real implementation is in Cloudflare Workers
 */

/**
 * Check browser voice support capabilities
 * @returns {object} Support status for various voice features
 */
export function checkVoiceSupport() {
  return {
    mediaDevices: !!(typeof navigator !== 'undefined' && navigator?.mediaDevices?.getUserMedia),
    mediaRecorder: typeof MediaRecorder !== 'undefined',
    webAudio: typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined',
    speechSynthesis: typeof speechSynthesis !== 'undefined',
    speechRecognition: typeof SpeechRecognition !== 'undefined' || typeof webkitSpeechRecognition !== 'undefined'
  };
}

/**
 * Voice Integration Class
 * Manages voice recording, transcription, and synthesis
 */
export class VoiceIntegration {
  constructor(apiKeys = {}, options = {}) {
    this.apiKeys = apiKeys;
    this.options = {
      provider: options.provider || 'openai',
      voiceId: options.voiceId || 'alloy',
      onTranscript: options.onTranscript || (() => {}),
      onError: options.onError || console.error
    };
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.audioContext = null;
  }

  async initialize() {
    const AudioContextClass = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
    if (AudioContextClass) {
      this.audioContext = new AudioContextClass();
    }
  }

  async startRecording() {
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
        try {
          const result = await speechToText(audioBlob);
          this.options.onTranscript(result.text || result);
        } catch (error) {
          this.options.onError(error);
        }
      };

      this.mediaRecorder.start();
      return true;
    } catch (error) {
      this.options.onError(error);
      return false;
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
  }

  async speak(text) {
    try {
      const audioBlob = await textToSpeech(text, {
        voice: this.options.voiceId,
        provider: this.options.provider
      });
      
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      await audio.play();
      
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };
    } catch (error) {
      this.options.onError(error);
    }
  }

  async getVoices() {
    return voiceConfig.voices.map(v => ({ id: v, name: v }));
  }

  setVoice(voiceId) {
    this.options.voiceId = voiceId;
  }

  setProvider(provider) {
    this.options.provider = provider;
  }

  destroy() {
    this.stopRecording();
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

export async function textToSpeech(text, options = {}) {
  const response = await fetch('/api/voice/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, ...options }),
  });
  
  if (!response.ok) {
    throw new Error('TTS request failed');
  }
  
  return response.blob();
}

export async function speechToText(audioBlob, options = {}) {
  const formData = new FormData();
  formData.append('audio', audioBlob);
  
  const response = await fetch('/api/voice/stt', {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error('STT request failed');
  }
  
  return response.json();
}

export const voiceConfig = {
  ttsModel: 'tts-1',
  sttModel: 'whisper-1',
  defaultVoice: 'alloy',
  voices: ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'],
};

export default {
  VoiceIntegration,
  checkVoiceSupport,
  textToSpeech,
  speechToText,
  voiceConfig,
};
