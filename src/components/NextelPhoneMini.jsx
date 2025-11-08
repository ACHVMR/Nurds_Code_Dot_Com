import React from 'react';
import { useNextelPhone } from '../hooks/useNextelPhone';

/**
 * NextelPhoneMini Component (Mobile Version)
 * Small animated phone for screens < 768px
 */
export default function NextelPhoneMini({ onClick, hasNewMessage = false }) {
  const { soundsEnabled, toggleSounds, playMessageChirp } = useNextelPhone();

  React.useEffect(() => {
    if (hasNewMessage) {
      playMessageChirp('receive');
    }
  }, [hasNewMessage, playMessageChirp]);

  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 group"
      aria-label="Open ACHEEVY phone"
    >
      {/* Phone Body */}
      <div className={`relative w-16 h-32 bg-black border-2 border-[#E68961] rounded-2xl shadow-lg shadow-[#E68961]/20 transition-transform hover:scale-110 ${
        hasNewMessage ? 'animate-bounce' : ''
      }`}>
        {/* Screen */}
        <div className="absolute inset-2 bg-gray-900 rounded-xl flex flex-col items-center justify-center">
          {/* Icon */}
          <svg className="w-8 h-8 text-[#E68961] mb-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
          </svg>
          
          {/* Label */}
          <div className="text-[#E68961] text-[8px] font-bold">ACHEEVY</div>
          
          {/* Status Indicator */}
          <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#E68961] animate-pulse" />
        </div>

        {/* New Message Badge */}
        {hasNewMessage && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-black flex items-center justify-center">
            <span className="text-white text-[8px] font-bold">!</span>
          </div>
        )}

        {/* Sound Toggle (on hover) */}
        <div className="absolute -top-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSounds();
            }}
            className="p-1 bg-gray-900 border border-[#E68961] rounded hover:bg-gray-800 transition-colors"
          >
            {soundsEnabled ? (
              <svg className="w-3 h-3 text-[#E68961]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-3 h-3 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Pulse Animation on New Message */}
      {hasNewMessage && (
        <div className="absolute inset-0 rounded-2xl border-2 border-[#E68961] animate-ping opacity-75" />
      )}
    </button>
  );
}
