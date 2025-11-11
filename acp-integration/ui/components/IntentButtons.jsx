import React from 'react';
import './IntentButtons.css';

/**
 * IntentButtons Component
 * 4-button bezel interface for Deploy + Nurds Code platform
 * Implements ACP Integration Directive UI layer
 */
export const IntentButtons = ({ onIntent }) => {
  const handleClick = (intent) => {
    console.log(`[ACP Intent] User clicked: ${intent}`);
    onIntent?.(intent);
  };

  return (
    <div className="intent-bezel">
      <button 
        className="intent-btn re-imagine" 
        onClick={() => handleClick('re-imagine')}
        title="Clone/Recreate idea with ACHEEVY analysis"
      >
        <span className="intent-icon">🔮</span>
        <span className="intent-label">RE-IMAGINE</span>
      </button>
      
      <button 
        className="intent-btn import" 
        onClick={() => handleClick('import')}
        title="Import existing repository"
      >
        <span className="intent-icon">📥</span>
        <span className="intent-label">IMPORT</span>
      </button>
      
      <button 
        className="intent-btn lab" 
        onClick={() => handleClick('lab')}
        title="Test API/OSS Tool with Playwright"
      >
        <span className="intent-icon">🧪</span>
        <span className="intent-label">LAB</span>
      </button>
      
      <button 
        className="intent-btn agents" 
        onClick={() => handleClick('agents')}
        title="Build and deploy Boomer_Ang agent"
      >
        <span className="intent-icon">🤖</span>
        <span className="intent-label">AGENTS</span>
      </button>
    </div>
  );
};

export default IntentButtons;
