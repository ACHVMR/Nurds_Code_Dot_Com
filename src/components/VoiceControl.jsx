import React, { useState, useEffect, useRef } from 'react';
import { VoiceIntegration, checkVoiceSupport } from '../server/voice.js';

/**
 * Voice Control Component for Nurds Code Editor
 * Provides voice input/output using OpenAI Whisper (default) or optional providers
 */
function VoiceControl({ onTranscript, onError }) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [provider, setProvider] = useState('openai');
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('alloy');
  const voiceIntegrationRef = useRef(null);

  useEffect(() => {
    // Check browser support
    const support = checkVoiceSupport();
    setIsSupported(support.mediaDevices && support.mediaRecorder && support.webAudio);

    if (support.mediaDevices && support.mediaRecorder) {
      // Initialize voice integration
      const openaiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
      const deepgramKey = import.meta.env.VITE_DEEPGRAM_API_KEY || '';
      const elevenlabsKey = import.meta.env.VITE_ELEVENLABS_API_KEY || '';

      if (openaiKey) {
        voiceIntegrationRef.current = new VoiceIntegration(
          {
            openai: openaiKey,
            deepgram: deepgramKey,
            elevenlabs: elevenlabsKey
          },
          {
            provider: 'openai',
            voiceId: 'alloy',
            onTranscript: (text) => {
              if (onTranscript) onTranscript(text);
            },
            onSpeechEnd: () => {
              setIsSpeaking(false);
            },
            onError: (error) => {
              console.error('Voice error:', error);
              if (onError) onError(error);
            }
          }
        );

        // Load available voices
        loadVoices();
      }
    }
  }, [onTranscript, onError]);

  const loadVoices = async () => {
    if (voiceIntegrationRef.current) {
      try {
        const availableVoices = await voiceIntegrationRef.current.getVoices();
        setVoices(availableVoices);
      } catch (error) {
        console.error('Error loading voices:', error);
      }
    }
  };

  const handleToggleListen = async () => {
    if (!voiceIntegrationRef.current) return;

    try {
      if (isListening) {
        voiceIntegrationRef.current.stopListening();
        setIsListening(false);
      } else {
        await voiceIntegrationRef.current.startListening();
        setIsListening(true);
      }
    } catch (error) {
      console.error('Error toggling listen:', error);
      if (onError) onError(error);
      setIsListening(false);
    }
  };

  const handleSpeak = async (text) => {
    if (!voiceIntegrationRef.current || !text) return;

    try {
      setIsSpeaking(true);
      await voiceIntegrationRef.current.speak(text, {
        voiceId: selectedVoice
      });
    } catch (error) {
      console.error('Error speaking:', error);
      if (onError) onError(error);
      setIsSpeaking(false);
    }
  };

  const handleProviderChange = (newProvider) => {
    if (voiceIntegrationRef.current) {
      try {
        voiceIntegrationRef.current.switchProvider(newProvider);
        setProvider(newProvider);
        loadVoices();
      } catch (error) {
        console.error('Error switching provider:', error);
        if (onError) onError(error);
      }
    }
  };

  if (!isSupported) {
    return (
      <div className="bg-[#2a2a2a] border border-[#3a3a3a] p-4 rounded">
        <p className="text-text/60 text-sm">
          ⚠️ Voice features not supported in this browser. Please use Chrome, Edge, or Firefox.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text flex items-center gap-2">
          🎙️ Voice Assistant
          <span className="text-xs text-text/60">
            (Powered by OpenAI Whisper)
          </span>
        </h3>
        
        {/* Provider Selector */}
        <select
          value={provider}
          onChange={(e) => handleProviderChange(e.target.value)}
          className="input-field text-sm"
        >
          <option value="openai">OpenAI Whisper</option>
          <option value="deepgram">Deepgram</option>
          <option value="elevenlabs">ElevenLabs</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Voice Selector */}
        <div>
          <label className="block text-sm font-medium mb-2 text-text">
            Voice
          </label>
          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            className="input-field w-full"
          >
            {voices.map((voice) => (
              <option key={voice.id} value={voice.id}>
                {voice.name} {voice.description && `- ${voice.description}`}
              </option>
            ))}
          </select>
        </div>

        {/* Status Indicator */}
        <div>
          <label className="block text-sm font-medium mb-2 text-text">
            Status
          </label>
          <div className="flex items-center gap-2 h-[42px]">
            {isListening && (
              <span className="flex items-center gap-2 text-neon">
                <span className="w-2 h-2 bg-neon rounded-full animate-pulse"></span>
                Listening...
              </span>
            )}
            {isSpeaking && (
              <span className="flex items-center gap-2 text-accent">
                <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
                Speaking...
              </span>
            )}
            {!isListening && !isSpeaking && (
              <span className="text-text/60">Ready</span>
            )}
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleToggleListen}
          disabled={isSpeaking}
          className={`btn-primary flex-1 ${
            isListening ? 'bg-neon text-background' : ''
          } ${isSpeaking ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isListening ? '⏹️ Stop Listening' : '🎤 Start Listening'}
        </button>
      </div>

      {/* Helper Text */}
      <div className="mt-3 text-xs text-text/60">
        <p>
          💡 Click "Start Listening" to speak your coding question or command.
          The assistant will transcribe and respond.
        </p>
      </div>
    </div>
  );
}

export default VoiceControl;
