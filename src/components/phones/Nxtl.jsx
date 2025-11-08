import React, { useState } from 'react';
import { useVoiceRecording } from '../../hooks/useVoiceRecording';
import { playChirp } from '../../utils/phoneSounds';

const Nxtl = ({ onMessageSend, onVoiceRecord }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');

  const { isRecording, startRecording, stopRecording, transcript } = useVoiceRecording({
    onTranscript: (text) => {
      if (text) {
        setMessages(prev => [...prev, { type: 'user', text, timestamp: Date.now() }]);
        if (onVoiceRecord) onVoiceRecord(text);
      }
    }
  });

  const handleToggle = () => {
    if (!isOpen) {
      playChirp();
    }
    setIsOpen(!isOpen);
  };

  const handleSendMessage = () => {
    if (inputText.trim()) {
      setMessages(prev => [...prev, { type: 'user', text: inputText, timestamp: Date.now() }]);
      if (onMessageSend) onMessageSend(inputText);
      setInputText('');
      playChirp();
    }
  };

  const handlePushToTalk = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      playChirp();
      await startRecording();
    }
  };

  return (
    <div className={`nxtl ${isOpen ? 'open' : 'closed'}`}>
      {/* Top Half - Flip Cover */}
      <div className="nxtl-top" onClick={!isOpen ? handleToggle : undefined}>
        <div className="nxtl-top-screen">
          {!isOpen ? (
            <div className="closed-indicator">
              <span>📱</span>
              <div className="neon-text">ACHEEVY</div>
              <div className="click-hint">Click to Open</div>
            </div>
          ) : (
            <div className="top-display">
              <div className="neon-text">NURDS CODE</div>
              <div className="time">{new Date().toLocaleTimeString()}</div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Half - Main Interface */}
      <div className="nxtl-bottom">
        {isOpen && (
          <>
            <div className="nxtl-screen">
              <div className="messages-scroll">
                {messages.length === 0 ? (
                  <div className="empty-state">
                    <div>🎤 Push to Talk</div>
                    <div>or type below</div>
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <div key={idx} className={`message ${msg.type}`}>
                      <div className="message-text">{msg.text}</div>
                      <div className="message-time">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))
                )}
                {isRecording && (
                  <div className="recording-indicator">
                    <div className="pulse"></div>
                    Recording...
                  </div>
                )}
              </div>
            </div>

            <div className="nxtl-controls">
              <div className="input-row">
                <input
                  type="text"
                  className="nxtl-input"
                  placeholder="Type message..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button className="send-btn" onClick={handleSendMessage}>
                  ➤
                </button>
              </div>

              <div className="button-row">
                <button 
                  className={`chirp-button ${isRecording ? 'recording' : ''}`}
                  onClick={handlePushToTalk}
                >
                  {isRecording ? '🔴 Recording...' : '🎤 Push to Talk'}
                </button>
                <button className="close-btn" onClick={handleToggle}>
                  Close ✕
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Nxtl;
