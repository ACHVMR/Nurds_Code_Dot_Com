import React, { useState, useEffect } from 'react';
import { contextMessages } from '../data/contextMessages';

/**
 * ContextTicker Component
 * Scrolling ticker around context window with context engineering messages
 */
export default function ContextTicker({ className = '' }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const messages = contextMessages.contextWindow;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, 10000); // Rotate every 10 seconds

    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className={`context-ticker overflow-hidden bg-black/50 border-y border-[#E68961]/30 ${className}`}>
      <div className="relative h-8 flex items-center">
        <div className="animate-scroll whitespace-nowrap">
          <span className="inline-block text-[#E68961] text-sm font-mono px-4">
            {messages[currentIndex]}
          </span>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 20s linear infinite;
        }
      `}</style>
    </div>
  );
}
