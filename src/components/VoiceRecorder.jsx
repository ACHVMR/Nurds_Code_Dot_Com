import React from 'react';
import { useVoiceRecording } from '../hooks/useVoiceRecording';
import { audioManager } from '../utils/audioLibrary';

/**
 * VoiceRecorder Component
 * Handles voice input with visual feedback and transcription display
 * Features Nextel-style UI with Nothing Brand design
 */
export default function VoiceRecorder({ onTranscript, onError, autoStart = false }) {
  const {
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
  } = useVoiceRecording();

  // Auto-start recording when component mounts
  React.useEffect(() => {
    if (autoStart) {
      startRecording();
      audioManager.play('pttStart'); // Play PTT start chirp
    }
  }, [autoStart]);

  // Notify parent on successful transcription
  React.useEffect(() => {
    if (transcript && onTranscript) {
      onTranscript({
        text: transcript,
        duration,
        cost
      });
    }
  }, [transcript, duration, cost, onTranscript]);

  // Notify parent on error
  React.useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  const handleStartStop = () => {
    if (isRecording) {
      stopRecording();
      audioManager.play('pttEnd'); // Play PTT end chirp when stopping
    } else {
      startRecording();
      audioManager.play('pttStart'); // Play PTT start chirp when starting
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCost = (cents) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  return (
    <div className="voice-recorder bg-black border border-[#E68961]/30 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-[#E68961] animate-pulse' : 'bg-gray-600'}`} />
          <h3 className="text-lg font-bold text-white">
            {isRecording ? 'Recording...' : isTranscribing ? 'Transcribing...' : 'Voice Input'}
          </h3>
        </div>
        
        {duration > 0 && (
          <div className="text-[#E68961] font-mono text-sm">
            {formatDuration(duration)}
          </div>
        )}
      </div>

      {/* Recording Button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={handleStartStop}
          disabled={isTranscribing}
          className={`
            w-20 h-20 rounded-full flex items-center justify-center
            transition-all duration-200 transform hover:scale-105
            ${isRecording 
              ? 'bg-[#E68961] hover:bg-[#D4A05F] shadow-lg shadow-[#E68961]/50' 
              : 'bg-[#E68961] hover:bg-[#D4A05F] shadow-lg shadow-[#E68961]/50'
            }
            ${isTranscribing ? 'opacity-50 cursor-not-allowed' : ''}
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {isRecording ? (
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : isTranscribing ? (
            <svg className="w-8 h-8 text-black animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          )}
        </button>
      </div>

      {/* Cancel Button (only shown while recording) */}
      {isRecording && (
        <div className="flex justify-center mb-4">
          <button
            onClick={cancelRecording}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Transcript Display */}
      {transcript && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Transcript:</span>
            <div className="flex items-center gap-3">
              {cost > 0 && (
                <span className="text-xs text-[#E68961] font-mono">
                  {formatCost(cost)}
                </span>
              )}
              <button
                onClick={reset}
                className="text-xs text-gray-500 hover:text-white transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <p className="text-white text-sm leading-relaxed">{transcript}</p>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm text-red-400">{error}</p>
              <button
                onClick={reset}
                className="text-xs text-red-500 hover:text-red-400 mt-1 underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help Text */}
      {!isRecording && !isTranscribing && !transcript && !error && (
        <div className="text-center text-gray-500 text-sm mt-4">
          Click the microphone to start voice input
        </div>
      )}

      {/* Processing Indicator */}
      {isTranscribing && (
        <div className="mt-4 flex items-center justify-center gap-2 text-[#E68961]">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-[#E68961] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-[#E68961] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-[#E68961] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-sm">Transcribing your voice...</span>
        </div>
      )}
    </div>
  );
}
