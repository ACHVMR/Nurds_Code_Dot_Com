import React, { useEffect, useMemo, useState, Component } from "react";
import "./acheevyBezel.css";
import VoiceInput from "./VoiceInput";

/**
 * Voice Error Boundary - Catches crashes in VoiceInput without breaking the bezel
 */
class VoiceErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('VoiceInput error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <button 
          className="acheevy-bezel__btn acheevy-bezel__btn--error" 
          disabled
          title="Voice input unavailable"
        >
          🎤 Error
        </button>
      );
    }
    return this.props.children;
  }
}

/**
 * ACHEEVY UNIFIED BEZEL — STAGE 2 EXECUTION CONTROL STRIP
 *
 * Contains:
 * - 4 Modes: THE LAB, NURD OUT, THE FORGE, POLISH
 * - Voice Input button (STT via Groq Whisper)
 * - TTS Audio Feedback (ElevenLabs)
 * - FIND button (Firecrawl web crawl with first-time disclaimer)
 * - LUC token quote display
 * - Circuit Box toggles (11 Labs, 12 Labs, SAM, Higgsfield)
 */

const VOICE_API_BASE = '/api/v1/voice';

// Voice command matchers for KingMode shortcuts
const VOICE_COMMANDS = {
  'switch to lab': { action: 'mode', value: 'lab' },
  'switch to the lab': { action: 'mode', value: 'lab' },
  'switch to nurd out': { action: 'mode', value: 'nerdout' },
  'switch to nerd out': { action: 'mode', value: 'nerdout' },
  'switch to forge': { action: 'mode', value: 'forge' },
  'switch to the forge': { action: 'mode', value: 'forge' },
  'switch to polish': { action: 'mode', value: 'polish' },
  'switch to code': { action: 'mode', value: 'forge' },
  'switch to chat': { action: 'mode', value: 'lab' },
  'find': { action: 'find' },
  'search': { action: 'find' },
  'toggle circuit': { action: 'circuit' },
  'enable voice': { action: 'circuit_toggle', key: 'labs11', value: true },
  'disable voice': { action: 'circuit_toggle', key: 'labs11', value: false },
};

export default function AcheevyBezel({
  enabled = true,
  mode,
  onModeChange,
  lucQuoteText = "Tokens: —",
  onFindScout,
  onVoiceTranscript,
  onVoiceError,
  onVoiceInput,
  enableTTS = true,
  circuitBox = { labs11: false, labs12: false, sam: false, higgsfield: false },
  onCircuitBoxChange,
}) {
  const modes = useMemo(
    () => [
      { id: "lab", label: "THE LAB" },
      { id: "nerdout", label: "NURD OUT" },
      { id: "forge", label: "THE FORGE" },
      { id: "polish", label: "POLISH" },
    ],
    []
  );

  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [ttsPlaying, setTtsPlaying] = useState(false);
  const audioRef = React.useRef(null);

  // TTS playback function
  const playTTS = async (text) => {
    if (!enableTTS || !text || ttsPlaying) return;
    
    try {
      setTtsPlaying(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${VOICE_API_BASE}/synthesize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({ text, voice: 'alloy' }),
      });
      
      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.play();
        }
      }
    } catch (err) {
      console.error('TTS playback error:', err);
    } finally {
      setTtsPlaying(false);
    }
  };

  // Handle voice transcript with KingMode command matching
  const handleVoiceTranscript = async (transcript) => {
    const lowerTranscript = transcript.toLowerCase().trim();
    
    // Check for voice commands first
    for (const [phrase, command] of Object.entries(VOICE_COMMANDS)) {
      if (lowerTranscript.includes(phrase)) {
        switch (command.action) {
          case 'mode':
            onModeChange?.(command.value);
            playTTS(`Switched to ${command.value} mode`);
            return;
          case 'find':
            handleFindScout();
            playTTS('Opening search');
            return;
          case 'circuit':
            // Toggle all circuit boxes
            const allOn = Object.values(circuitBox).every(Boolean);
            onCircuitBoxChange?.(Object.fromEntries(
              Object.keys(circuitBox).map(k => [k, !allOn])
            ));
            playTTS(allOn ? 'Circuit box disabled' : 'Circuit box enabled');
            return;
          case 'circuit_toggle':
            onCircuitBoxChange?.({ ...circuitBox, [command.key]: command.value });
            playTTS(`${command.key} ${command.value ? 'enabled' : 'disabled'}`);
            return;
        }
      }
    }
    
    // No command matched - send to orchestrator
    if (typeof onVoiceInput === 'function') {
      onVoiceInput(transcript);
    }
    
    // Also call original transcript handler
    onVoiceTranscript?.(transcript);
  };

  useEffect(() => {
    // Check if user has seen the FIND (Firecrawl) disclaimer before
    const seen = localStorage.getItem("acheevy_find_seen");
    if (!seen) {
      setShowDisclaimer(false);
    }
  }, []);

  const handleFindScout = async () => {
    const seen = localStorage.getItem("acheevy_find_seen");

    if (!seen) {
      setShowDisclaimer(true);
      return;
    }

    if (typeof onFindScout === "function") {
      return onFindScout();
    }
  };

  const handleDisclaimerAccept = () => {
    localStorage.setItem("acheevy_find_seen", "1");
    setShowDisclaimer(false);

    if (typeof onFindScout === "function") {
      onFindScout();
    }
  };

  return (
    <div className="acheevy-bezel" role="region" aria-label="ACHEEVY Bezel">
      <div className="acheevy-bezel__left">
        <div className="acheevy-bezel__group" aria-label="Modes">
          <span className="acheevy-bezel__label">Mode</span>
          {modes.map((m) => (
            <button
              key={m.id}
              type="button"
              className={
                "acheevy-bezel__btn " +
                (mode === m.id ? "acheevy-bezel__btn--active" : "")
              }
              disabled={!enabled}
              onClick={() => onModeChange?.(m.id)}
              aria-pressed={mode === m.id}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="acheevy-bezel__group" aria-label="Web crawl">
          <button
            type="button"
            className="acheevy-bezel__btn"
            disabled={!enabled}
            onClick={handleFindScout}
            title="FIND (Firecrawl) — scrape and attach results to your next prompt"
          >
            FIND
          </button>
        </div>

        <div className="acheevy-bezel__group" aria-label="Voice Input">
          <VoiceErrorBoundary>
            <VoiceInput
              disabled={!enabled || ttsPlaying}
              onTranscript={handleVoiceTranscript}
              onError={onVoiceError}
            />
          </VoiceErrorBoundary>
          {ttsPlaying && (
            <span className="acheevy-bezel__tts-indicator" title="Speaking...">
              🔊
            </span>
          )}
        </div>
      </div>

      {/* Hidden audio element for TTS playback */}
      <audio 
        ref={audioRef} 
        style={{ display: 'none' }}
        onEnded={() => setTtsPlaying(false)}
        onError={() => setTtsPlaying(false)}
      />

      <div className="acheevy-bezel__right">
        <span className="acheevy-bezel__pill" aria-label="LUC token quote">
          {lucQuoteText}
        </span>

        <div className="acheevy-bezel__group" aria-label="Circuit Box">
          <span className="acheevy-bezel__label">Circuit Box</span>
          <label className="acheevy-bezel__toggle">
            <input
              type="checkbox"
              checked={!!circuitBox.labs11}
              disabled={!enabled}
              onChange={(e) =>
                onCircuitBoxChange?.({ ...circuitBox, labs11: e.target.checked })
              }
            />
            11 Labs
          </label>
          <label className="acheevy-bezel__toggle">
            <input
              type="checkbox"
              checked={!!circuitBox.labs12}
              disabled={!enabled}
              onChange={(e) =>
                onCircuitBoxChange?.({ ...circuitBox, labs12: e.target.checked })
              }
            />
            12 Labs
          </label>
          <label className="acheevy-bezel__toggle">
            <input
              type="checkbox"
              checked={!!circuitBox.sam}
              disabled={!enabled}
              onChange={(e) =>
                onCircuitBoxChange?.({ ...circuitBox, sam: e.target.checked })
              }
            />
            SAM
          </label>
          <label className="acheevy-bezel__toggle">
            <input
              type="checkbox"
              checked={!!circuitBox.higgsfield}
              disabled={!enabled}
              onChange={(e) =>
                onCircuitBoxChange?.({
                  ...circuitBox,
                  higgsfield: e.target.checked,
                })
              }
            />
            Higgsfield
          </label>
        </div>
      </div>

      {showDisclaimer && (
        <div className="acheevy-bezel__disclaimer">
          <p>
            <strong>FIND</strong> uses Firecrawl to scrape the URL(s) you provide and
            attach the results to your next prompt—without leaving this screen.
          </p>
          <button
            type="button"
            className="acheevy-bezel__disclaimer-close"
            onClick={handleDisclaimerAccept}
          >
            Got it — Enable FIND
          </button>
        </div>
      )}
    </div>
  );
}
