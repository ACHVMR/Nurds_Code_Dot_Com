import React, { useState, useEffect } from 'react';
import { contextMessages } from '../data/contextMessages';

/**
 * TerminologyTicker Component
 * Bottom ticker with resume-relevant terminology
 * Personalized based on user profile (when available)
 */
export default function TerminologyTicker({ userProfile = null }) {
  const [terms, setTerms] = useState([]);

  useEffect(() => {
    // Use user's tech stack if available, otherwise use default
    if (userProfile?.tech_stack && userProfile.tech_stack.length > 0) {
      setTerms([...userProfile.tech_stack, ...contextMessages.terminology]);
    } else {
      setTerms(contextMessages.terminology);
    }
  }, [userProfile]);

  return (
    <div className="terminology-ticker overflow-hidden bg-black/50 border-t border-[#E68961]/30 py-2">
      <div className="relative flex items-center">
        <div className="flex animate-scroll-left whitespace-nowrap">
          {terms.concat(terms).map((term, index) => (
            <React.Fragment key={index}>
              <span className="inline-block text-gray-400 text-xs font-medium px-4">
                {term}
              </span>
              <span className="inline-block text-[#E68961] text-xs px-2">•</span>
            </React.Fragment>
          ))}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll-left {
          animation: scroll-left 60s linear infinite;
        }
      `}</style>
    </div>
  );
}
