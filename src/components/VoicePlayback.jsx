import React, { useState, useRef, useEffect } from 'react';
import { groqTTS } from '../services/groqTTS';

/**
 * VoicePlayback Component
 * Audio player with pause/resume/speed controls
 * Toggle between voice and text responses
 */
export default function VoicePlayback({ text, autoPlay = true, onPlayComplete }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [error, setError] = useState(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [speed, setSpeed] = useState(1.0);
  const audioRef = useRef(null);

  useEffect(() => {
    if (autoPlay && voiceEnabled && text) {
      generateAndPlay();
    }
  }, [text]);

  const generateAndPlay = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await groqTTS.speak(text);
      setAudioUrl(result.audioUrl);

      if (audioRef.current) {
        audioRef.current.playbackRate = speed;
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error('TTS error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSpeedChange = (newSpeed) => {
    setSpeed(newSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = newSpeed;
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    if (onPlayComplete) {
      onPlayComplete();
    }
  };

  return (
    <div className="voice-playback">
      {/* Voice/Text Toggle */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setVoiceEnabled(!voiceEnabled)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
            voiceEnabled
              ? 'bg-[#E68961] text-black'
              : 'bg-gray-800 text-gray-400'
          }`}
        >
          {voiceEnabled ? (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
              </svg>
              Hear Response
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm8 8v2h1a1 1 0 110 2H4a1 1 0 110-2h1v-2a1 1 0 112 0v2h2v-2a1 1 0 112 0v2h2v-2a1 1 0 112 0z" clipRule="evenodd" />
              </svg>
              Read Response
            </>
          )}
        </button>

        {voiceEnabled && !isLoading && audioUrl && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Speed:</span>
            {[0.75, 1.0, 1.25, 1.5, 2.0].map((s) => (
              <button
                key={s}
                onClick={() => handleSpeedChange(s)}
                className={`px-2 py-1 text-xs rounded ${
                  speed === s
                    ? 'bg-[#E68961] text-black'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Audio Player */}
      {voiceEnabled && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 text-[#E68961]">
              <div className="w-2 h-2 bg-[#E68961] rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-[#E68961] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-[#E68961] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="ml-2 text-sm">Generating voice...</span>
            </div>
          ) : error ? (
            <div className="text-red-400 text-sm">{error}</div>
          ) : audioUrl ? (
            <div className="flex items-center gap-4">
              <button
                onClick={togglePlayPause}
                className="w-10 h-10 rounded-full bg-[#E68961] hover:bg-[#D4A05F] flex items-center justify-center transition-colors"
              >
                {isPlaying ? (
                  <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
              
              <audio
                ref={audioRef}
                src={audioUrl}
                onEnded={handleEnded}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              
              <div className="flex-1">
                <div className="text-sm text-gray-400">
                  {isPlaying ? 'Playing...' : 'Click to play'}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-sm text-center">
              No audio available
            </div>
          )}
        </div>
      )}

      {/* Text Display (shown when voice disabled or as fallback) */}
      {(!voiceEnabled || error) && text && (
        <div className="mt-3 bg-gray-900 border border-gray-800 rounded-lg p-4">
          <p className="text-white text-sm leading-relaxed">{text}</p>
        </div>
      )}
    </div>
  );
}
