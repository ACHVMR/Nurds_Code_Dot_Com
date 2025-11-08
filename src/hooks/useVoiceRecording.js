import { useState, useRef, useCallback } from 'react';
import { groqWhisper } from '../services/groqWhisper';

/**
 * Custom hook for voice recording with Groq Whisper transcription
 * Handles audio capture, recording state, and transcription
 */
export const useVoiceRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [duration, setDuration] = useState(0);
  const [cost, setCost] = useState(0);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const startTimeRef = useRef(null);
  const durationIntervalRef = useRef(null);

  /**
   * Start recording audio
   */
  const startRecording = useCallback(async () => {
    try {
      console.log('🎤 Step 1: Starting voice recording...');
      setError(null);
      setTranscript('');
      setDuration(0);
      setCost(0);
      
      console.log('📍 Step 2: Requesting microphone permission...');
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      console.log('✅ Step 3: Microphone permission granted');
      
      // Determine best supported MIME type
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/ogg;codecs=opus';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = '';
      }
      
      // Create MediaRecorder
      console.log('📹 Step 4: Creating MediaRecorder with MIME type:', mimeType || 'default');
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType || undefined
      });
      
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log('📦 Step 5: Audio chunk received:', { size: event.data.size, type: event.data.type });
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        console.log('⏹️ Step 6: Recording stopped');
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        
        // Create audio blob
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: mediaRecorder.mimeType 
        });
        console.log('📼 Step 7: Audio blob created:', { size: audioBlob.size, type: audioBlob.type });
        
        // Transcribe
        await transcribeAudio(audioBlob);
      };
      
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      startTimeRef.current = Date.now();
      setIsRecording(true);
      
      // Update duration counter every second
      durationIntervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setDuration(elapsed);
      }, 1000);
      
    } catch (err) {
      console.error('❌ Step 8a: Recording error:', { message: err.message, name: err.name, stack: err.stack });
      setError(err.message || 'Failed to access microphone');
    }
  }, []);

  /**
   * Stop recording audio
   */
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Clear duration interval
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    }
  }, [isRecording]);

  /**
   * Transcribe audio blob
   */
  const transcribeAudio = useCallback(async (audioBlob) => {
    try {
      setIsTranscribing(true);
      setError(null);
      
      console.log('📝 Step 8: Sending to Groq Whisper transcription service...');
      // Transcribe with Groq Whisper (includes fallback chain)
      const result = await groqWhisper.transcribe(audioBlob);
      
      console.log('✅ Step 9: Transcription successful:', { 
        transcriptLength: result.transcript.length,
        duration: result.actualDuration,
        cost: result.cost 
      });
      
      setTranscript(result.transcript);
      setDuration(result.actualDuration);
      setCost(result.cost);
      
    } catch (err) {
      console.error('❌ Step 8b: Transcription error:', { message: err.message, name: err.name, stack: err.stack });
      setError(err.message || 'Transcription failed');
    } finally {
      setIsTranscribing(false);
    }
  }, []);

  /**
   * Cancel recording without transcribing
   */
  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      // Stop media recorder without triggering onstop
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
      
      // Stop all tracks
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      
      setIsRecording(false);
      audioChunksRef.current = [];
      
      // Clear duration interval
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
      
      setDuration(0);
    }
  }, [isRecording]);

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    setTranscript('');
    setError(null);
    setDuration(0);
    setCost(0);
  }, []);

  return {
    isRecording,
    isTranscribing,
    transcript,
    error,
    duration,
    cost,
    startRecording,
    stopRecording,
    cancelRecording,
    reset
  };
};
