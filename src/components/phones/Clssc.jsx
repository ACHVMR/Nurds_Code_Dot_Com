import React, { useState } from 'react';
import { useVoiceRecording } from '../../hooks/useVoiceRecording';

const Clssc = ({ onMessageSend, onVoiceRecord }) => {
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
    <div className="classic-chat">
      <div className="classic-header">
        <div className="header-left">
          <div className="logo">💬</div>
          <div className="title">NURDS CODE</div>
        </div>
        <div className="header-right">
          <button className={`voice-toggle ${isRecording ? 'recording' : ''}`}>
            {isRecording ? '🔴' : '🎤'}
          </button>
        </div>
      </div>

      <div className="classic-messages">
        {messages.length === 0 ? (
          <div className="welcome-message">
            <h2>Welcome to NURDS CODE</h2>
            <p>Start typing or use voice input below</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`classic-message ${msg.type}`}>
              <div className="message-avatar">
                {msg.type === 'user' ? '👤' : '🤖'}
              </div>
              <div className="message-content">
                <div className="message-header">
                  <span className="sender">
                    {msg.type === 'user' ? 'You' : 'Assistant'}
                  </span>
                  <span className="timestamp">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="message-body">{msg.text}</div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="classic-input">
        <div className="input-wrapper">
          <button 
            className={`mic-button ${isRecording ? 'recording' : ''}`}
            onClick={isRecording ? stopRecording : startRecording}
          >
            {isRecording ? '⏹' : '🎤'}
          </button>
          
          <input
            type="text"
            className="text-input"
            placeholder="Type your message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          
          <button className="send-button" onClick={handleSend}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Clssc;
