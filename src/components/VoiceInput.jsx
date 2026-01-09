/**
 * VoiceInput Component - Comet-style Voice Button with Waveform Visualization
 * Production-ready with permission checks, error handling, and keyboard shortcuts
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import './VoiceInput.css';

const VOICE_API_BASE = '/api/v1/voice';

export default function VoiceInput({ 
  onTranscript, 
  onError,
  disabled = false,
  className = '',
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const streamRef = useRef(null);

  // Check microphone permission on mount
  useEffect(() => {
    checkMicrophonePermission();
    
    // Keyboard shortcut: Alt+Shift+V to toggle recording
    const handleKeyDown = (e) => {
      if (e.altKey && e.shiftKey && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        if (!disabled && hasPermission) {
          toggleRecording();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      cleanup();
    };
  }, [disabled, hasPermission]);

  const checkMicrophonePermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'microphone' });
      setHasPermission(result.state === 'granted');
      
      result.addEventListener('change', () => {
        setHasPermission(result.state === 'granted');
      });
    } catch (err) {
      // Permission API not supported, will prompt on first use
      setHasPermission(null);
    }
  };

  const cleanup = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const updateAudioLevel = () => {
    if (!analyserRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    // Calculate average amplitude
    const average = dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length;
    setAudioLevel(average / 255); // Normalize to 0-1
    
    if (isRecording) {
      animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
    }
  };

  const startRecording = async () => {
    try {
      setError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        } 
      });
      
      streamRef.current = stream;
      setHasPermission(true);

      // Set up audio analysis for visualization
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      // Set up media recorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus' 
        : 'audio/webm';
      
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        await sendAudioForTranscription(audioBlob);
        cleanup();
      };

      mediaRecorderRef.current.start(100); // Collect data every 100ms
      setIsRecording(true);
      
      // Start audio level visualization
      updateAudioLevel();
      
    } catch (err) {
      console.error('Microphone access error:', err);
      setHasPermission(false);
      setError(err.name === 'NotAllowedError' 
        ? 'Microphone access denied. Please enable in browser settings.' 
        : 'Failed to access microphone.');
      onError?.(err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAudioLevel(0);
    }
  };

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording]);

  const sendAudioForTranscription = async (audioBlob) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Validate file size (max 25MB)
      if (audioBlob.size > 25 * 1024 * 1024) {
        throw new Error('Audio file too large. Maximum size is 25MB.');
      }

      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('language', 'en');

      const token = localStorage.getItem('authToken');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const response = await fetch(`${VOICE_API_BASE}/transcribe`, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Transcription failed: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.data?.text) {
        onTranscript?.(result.data.text);
      } else if (result.text) {
        onTranscript?.(result.text);
      }
      
    } catch (err) {
      console.error('Transcription error:', err);
      
      if (err.name === 'AbortError') {
        setError('Transcription timed out. Please try again.');
      } else {
        setError(err.message || 'Transcription failed');
      }
      onError?.(err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Compute button state classes
  const buttonState = isProcessing ? 'processing' : isRecording ? 'recording' : 'idle';
  
  return (
    <div className={`voice-input ${className}`}>
      <button
        type="button"
        className={`voice-input__button voice-input__button--${buttonState}`}
        onClick={toggleRecording}
        disabled={disabled || isProcessing || hasPermission === false}
        aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
        aria-pressed={isRecording}
        title="Voice input (Alt+Shift+V)"
        style={{
          '--audio-level': audioLevel,
        }}
      >
        <span className="voice-input__icon">
          {isProcessing ? (
            <svg viewBox="0 0 24 24" className="voice-input__spinner">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="31.4 31.4" />
            </svg>
          ) : isRecording ? (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1 1.93c-3.94-.49-7-3.85-7-7.93h2c0 3.31 2.69 6 6 6s6-2.69 6-6h2c0 4.08-3.06 7.44-7 7.93V19h4v2H8v-2h4v-3.07z"/>
            </svg>
          )}
        </span>
        
        {/* Audio level ring */}
        <span 
          className="voice-input__ring"
          style={{ transform: `scale(${1 + audioLevel * 0.5})` }}
        />
      </button>
      
      {error && (
        <div className="voice-input__error" role="alert">
          {error}
        </div>
      )}
      
      {hasPermission === false && (
        <div className="voice-input__permission-hint">
          Enable microphone access in your browser settings
        </div>
      )}
    </div>
  );
}
