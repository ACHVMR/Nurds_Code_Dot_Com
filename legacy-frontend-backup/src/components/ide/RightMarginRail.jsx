
import React from 'react';
import './RightMarginRail.css';

export default function RightMarginRail() {
  return (
    <div className="right-margin-rail">
      {/* Live Preview / AI Chat */}
      <div className="rail-section flex-1">
        <div className="rail-header">
          <span>AI CHAT / PREVIEW</span>
        </div>
        <div className="rail-content chat-container">
          <div className="message assistant">
            <div className="msg-avatar">🤖</div>
            <div className="msg-bubble">
              Ready to code. Select a platform context to begin.
            </div>
          </div>
        </div>
        <div className="chat-input-area">
          <input type="text" placeholder="Ask ACHEEVY..." className="chat-input" />
        </div>
      </div>

      {/* Collaboration / Video */}
      <div className="rail-section collab-panel">
        <div className="rail-header">
          <span>COLLABORATION (3)</span>
          <span className="live-badge">LIVE</span>
        </div>
        <div className="video-grid">
           {/* Mock Video Feeds */}
           <div className="video-feed user-me">Me</div>
           <div className="video-feed user-peer" style={{background: '#2c3e50'}}>Dev 1</div>
           <div className="video-feed user-peer" style={{background: '#8e44ad'}}>Dev 2</div>
        </div>
        <div className="collab-actions">
           <button>🎤</button>
           <button>📷</button>
           <button>🛑</button>
        </div>
      </div>

      {/* Context Info */}
      <div className="rail-footer">
        <div className="info-row">
          <span>Model:</span>
          <span className="highlight">gemini_2_5_flash</span>
        </div>
        <div className="info-row">
          <span>Tokens:</span>
          <span>450 / 8192</span>
        </div>
        <div className="info-row">
          <span>Latency:</span>
          <span className="good">12ms</span>
        </div>
      </div>
    </div>
  );
}
