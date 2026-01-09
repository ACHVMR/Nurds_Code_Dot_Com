/**
 * ============================================
 * VibeSDK Bridge Component
 * ============================================
 * 
 * This component bridges the Nurds Code infrastructure
 * (AcheevyBezel, VoiceInput, KingMode) with the Cloudflare VibeSDK.
 * 
 * Mount this as a wrapper around the VibeSDK app to enable:
 * - Voice input → VibeSDK chat
 * - Bezel mode switching → VibeSDK context
 * - KingMode orchestration → VibeSDK agent
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import AcheevyBezel from './acheevyBezel';
import VIBESDK_CONFIG, { applyVibeSDKTheme } from '../config/vibesdk.config';
import { buildSystemPrompt } from '../../workers/prompts/boomer-ang';

// Event names for VibeSDK integration
const VIBE_EVENTS = {
  SUBMIT_PROMPT: 'vibesdk:submit',
  SET_MODE: 'vibesdk:mode',
  SET_CONTEXT: 'vibesdk:context',
  RESPONSE_READY: 'vibesdk:response',
};

/**
 * Bridge context for VibeSDK integration
 */
export const VibeSDKContext = React.createContext({
  submitPrompt: () => {},
  setMode: () => {},
  currentMode: 'lab',
  isProcessing: false,
});

/**
 * VibeSDK Bridge Provider
 */
export function VibeSDKBridge({ children }) {
  const [currentMode, setCurrentMode] = useState('lab');
  const [isProcessing, setIsProcessing] = useState(false);
  const [circuitBox, setCircuitBox] = useState(VIBESDK_CONFIG.integrations.circuitBoxDefaults);
  const [lucQuote, setLucQuote] = useState('Tokens: —');
  const containerRef = useRef(null);

  // Apply theme on mount
  useEffect(() => {
    if (containerRef.current) {
      applyVibeSDKTheme(containerRef.current);
    }
  }, []);

  // Listen for VibeSDK response events
  useEffect(() => {
    const handleResponse = (event) => {
      setIsProcessing(false);
      
      // Update token display
      if (event.detail?.tokenUsage) {
        setLucQuote(`Tokens: ${event.detail.tokenUsage.total}`);
      }
    };

    window.addEventListener(VIBE_EVENTS.RESPONSE_READY, handleResponse);
    return () => window.removeEventListener(VIBE_EVENTS.RESPONSE_READY, handleResponse);
  }, []);

  /**
   * Submit a prompt to VibeSDK
   * Called when voice transcript is received or text is entered
   */
  const submitPrompt = useCallback(async (prompt, options = {}) => {
    setIsProcessing(true);

    // Build system prompt with current context
    const systemPrompt = buildSystemPrompt({
      mode: currentMode,
      plan: options.plan || 'free',
      circuitFlags: circuitBox,
      customInstructions: options.customInstructions,
    });

    // Dispatch event for VibeSDK to pick up
    window.dispatchEvent(new CustomEvent(VIBE_EVENTS.SUBMIT_PROMPT, {
      detail: {
        prompt,
        systemPrompt,
        mode: currentMode,
        circuitFlags: circuitBox,
        source: options.source || 'text', // 'text' | 'voice'
      },
    }));

    // Also call orchestrator for logging/routing
    if (VIBESDK_CONFIG.integrations.orchestratorUrl) {
      try {
        const token = localStorage.getItem('authToken');
        await fetch(VIBESDK_CONFIG.integrations.orchestratorUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...(options.source === 'voice' && { 'X-Voice-Transcript': prompt }),
          },
          body: JSON.stringify({
            prompt,
            circuit_flags: {
              ...circuitBox,
              enableVoice: options.source === 'voice',
            },
          }),
        });
      } catch (err) {
        console.error('Orchestrator sync failed:', err);
      }
    }
  }, [currentMode, circuitBox]);

  /**
   * Handle voice transcript from VoiceInput
   */
  const handleVoiceTranscript = useCallback((transcript) => {
    submitPrompt(transcript, { source: 'voice' });
  }, [submitPrompt]);

  /**
   * Handle voice errors
   */
  const handleVoiceError = useCallback((error) => {
    console.error('Voice input error:', error);
  }, []);

  /**
   * Handle voice input for orchestrator
   */
  const handleVoiceInput = useCallback((transcript) => {
    // This is called after KingMode commands are processed
    // Send to VibeSDK for code generation
    submitPrompt(transcript, { source: 'voice' });
  }, [submitPrompt]);

  /**
   * Handle mode change
   */
  const handleModeChange = useCallback((newMode) => {
    setCurrentMode(newMode);
    
    // Dispatch mode change event for VibeSDK
    window.dispatchEvent(new CustomEvent(VIBE_EVENTS.SET_MODE, {
      detail: { mode: newMode },
    }));
  }, []);

  /**
   * Handle FIND button (Firecrawl integration)
   */
  const handleFindScout = useCallback(async () => {
    const url = prompt('Enter URL to research:');
    if (url) {
      submitPrompt(`Research and summarize: ${url}`, { source: 'find' });
    }
  }, [submitPrompt]);

  const contextValue = {
    submitPrompt,
    setMode: handleModeChange,
    currentMode,
    isProcessing,
    circuitBox,
    setCircuitBox,
  };

  return (
    <VibeSDKContext.Provider value={contextValue}>
      <div ref={containerRef} className="vibesdk-bridge">
        {/* ACHEEVY Bezel - Sticky control strip */}
        {VIBESDK_CONFIG.integrations.enableBezel && (
          <AcheevyBezel
            enabled={!isProcessing}
            mode={currentMode}
            onModeChange={handleModeChange}
            lucQuoteText={lucQuote}
            onFindScout={handleFindScout}
            onVoiceTranscript={handleVoiceTranscript}
            onVoiceError={handleVoiceError}
            onVoiceInput={handleVoiceInput}
            enableTTS={circuitBox.labs11}
            circuitBox={circuitBox}
            onCircuitBoxChange={setCircuitBox}
          />
        )}

        {/* VibeSDK App Content */}
        <div className="vibesdk-content">
          {children}
        </div>
      </div>
    </VibeSDKContext.Provider>
  );
}

/**
 * Hook to access VibeSDK bridge context
 */
export function useVibeSDK() {
  const context = React.useContext(VibeSDKContext);
  if (!context) {
    throw new Error('useVibeSDK must be used within a VibeSDKBridge provider');
  }
  return context;
}

/**
 * Component to inject into VibeSDK's chat input
 * Listens for bridge events and updates the input
 */
export function VibeSDKInputConnector({ inputRef }) {
  useEffect(() => {
    const handleSubmit = (event) => {
      const { prompt } = event.detail;
      
      if (inputRef.current) {
        // Set the input value
        inputRef.current.value = prompt;
        
        // Trigger input event for React
        const inputEvent = new Event('input', { bubbles: true });
        inputRef.current.dispatchEvent(inputEvent);
        
        // Submit the form
        const form = inputRef.current.closest('form');
        if (form) {
          form.dispatchEvent(new Event('submit', { bubbles: true }));
        }
      }
    };

    window.addEventListener(VIBE_EVENTS.SUBMIT_PROMPT, handleSubmit);
    return () => window.removeEventListener(VIBE_EVENTS.SUBMIT_PROMPT, handleSubmit);
  }, [inputRef]);

  return null;
}

export default VibeSDKBridge;
