import React, { useState } from 'react';
import { useVoiceRecording } from '../../hooks/useVoiceRecording';

const TchScrn = ({ onMessageSend, onVoiceRecord }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');

  const { isRecording, startRecording, stopRecording } = useVoiceRecording({
    onTranscript: (text) => {
      if (text) {
        setMessages(prev => [...prev, { type: 'user', text, timestamp: Date.now() }]);
        if (onVoiceRecord) onVoiceRecord(text);
      }
    }
  });

  const handleSend = () => {
    if (inputText.trim()) {
      setMessages(prev => [...prev, { type: 'user', text: inputText, timestamp: Date.now() }]);
      if (onMessageSend) onMessageSend(inputText);
      setInputText('');
    }
  };

  return (
    <div className="TchScrn">
      <div className="touch-header">
        <div className="time">{new Date().toLocaleTimeString()}</div>
        <div className="status-icons">
          <span>📶</span>
          <span>📡</span>
          <span>🔋</span>
        </div>
      </div>

      <div className="touch-screen">
        <div className="app-bar">
          <div className="app-title">NURDS CODE</div>
          <div className="subtitle">Voice-First Development</div>
        </div>

        <div className="messages-area">
          {messages.length === 0 ? (
            <div className="empty-state">
              <div className="icon">💬</div>
              <div>Start a conversation</div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className={`bubble ${msg.type}`}>
                <div className="bubble-text">{msg.text}</div>
                <div className="bubble-time">
                  {new Date(msg.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="touch-input-bar">
        <button 
          className={`mic-btn ${isRecording ? 'recording' : ''}`}
          onClick={isRecording ? stopRecording : startRecording}
        >
          {isRecording ? '⏹' : '🎤'}
        </button>
        
        <input
          type="text"
          className="touch-input"
          placeholder="Message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        
        <button className="send-btn" onClick={handleSend}>
          ➤
        </button>
      </div>

      <div className="home-indicator"></div>
    </div>
  );
};

export default TchScrn;
