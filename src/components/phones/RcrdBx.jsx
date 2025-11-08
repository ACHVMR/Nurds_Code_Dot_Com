import React, { useState, useRef } from 'react';
import { useVoiceRecording } from '../../hooks/useVoiceRecording';

const RcrdBx = ({ onMessageSend, onVoiceRecord }) => {
  const [messages, setMessages] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayback, setCurrentPlayback] = useState(0);
  const tapeRef = useRef(null);

  const { isRecording, startRecording, stopRecording } = useVoiceRecording({
    onTranscript: (text) => {
      if (text) {
        setMessages(prev => [...prev, { type: 'user', text, timestamp: Date.now() }]);
        if (onVoiceRecord) onVoiceRecord(text);
      }
    }
  });

  const handlePlay = () => {
    if (messages.length === 0) return;
    setIsPlaying(true);
    setCurrentPlayback(0);
    // Simulate playback
    setTimeout(() => {
      setIsPlaying(false);
      setCurrentPlayback(messages.length);
    }, 2000);
  };

  const handleStop = () => {
    setIsPlaying(false);
  };

  return (
    <div className="RcrdBx">
      <div className="tape-deck">
        <div className="tape-window">
          <div className={`tape-reel left ${isRecording || isPlaying ? 'spinning' : ''}`}>
            <div className="reel-center"></div>
            <div className="reel-spokes"></div>
          </div>
          <div className="tape-strip">
            {messages.length > 0 && (
              <div className="tape-indicator" style={{ width: `${(messages.length / 10) * 100}%` }}></div>
            )}
          </div>
          <div className={`tape-reel right ${isRecording || isPlaying ? 'spinning' : ''}`}>
            <div className="reel-center"></div>
            <div className="reel-spokes"></div>
          </div>
        </div>

        <div className="tape-label">
          <div className="label-text">NURDS CODE</div>
          <div className="label-subtitle">Voice Session</div>
          <div className="label-count">{messages.length} messages</div>
        </div>
      </div>

      <div className="display-screen">
        <div className="led-display">
          {isRecording ? (
            <div className="recording-text">● REC</div>
          ) : isPlaying ? (
            <div className="playing-text">▶ PLAY</div>
          ) : (
            <div className="ready-text">■ READY</div>
          )}
        </div>
      </div>

      <div className="control-panel">
        <div className="button-group">
          <button 
            className={`control-btn play ${isPlaying ? 'active' : ''}`}
            onClick={handlePlay}
            disabled={messages.length === 0 || isRecording}
          >
            <span className="btn-icon">▶</span>
            <span className="btn-label">PLAY</span>
          </button>

          <button 
            className="control-btn stop"
            onClick={handleStop}
            disabled={!isPlaying && !isRecording}
          >
            <span className="btn-icon">■</span>
            <span className="btn-label">STOP</span>
          </button>

          <button 
            className={`control-btn record ${isRecording ? 'active' : ''}`}
            onClick={isRecording ? stopRecording : startRecording}
          >
            <span className="btn-icon">●</span>
            <span className="btn-label">REC</span>
          </button>
        </div>

        <div className="volume-control">
          <span>VOL</span>
          <input type="range" min="0" max="100" defaultValue="70" />
        </div>
      </div>

      <div className="message-log">
        {messages.slice(-3).map((msg, idx) => (
          <div key={idx} className="log-entry">
            <span className="log-time">{new Date(msg.timestamp).toLocaleTimeString()}</span>
            <span className="log-text">{msg.text.substring(0, 30)}...</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RcrdBx;
