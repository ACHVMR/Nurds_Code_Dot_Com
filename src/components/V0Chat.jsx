import React, { useState, useEffect } from 'react';
import { useVoiceRecording } from '../hooks/useVoiceRecording';

const V0Chat = ({ onMessageSend }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  const { isRecording, transcript, startRecording, stopRecording } = useVoiceRecording();

  // Handle transcript updates
  useEffect(() => {
    if (transcript && transcript.trim()) {
      setMessages(prev => [...prev, { type: 'user', text: transcript, timestamp: Date.now() }]);
      if (onMessageSend) onMessageSend(transcript);
    }
  }, [transcript, onMessageSend]);

  const handleSend = () => {
    if (inputText.trim()) {
      setMessages(prev => [...prev, { type: 'user', text: inputText, timestamp: Date.now() }]);
      if (onMessageSend) onMessageSend(inputText);
      setInputText('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleVoice = () => {
    if (voiceEnabled && isRecording) {
      stopRecording();
    } else if (voiceEnabled && !isRecording) {
      startRecording();
    }
    setVoiceEnabled(!voiceEnabled);
  };

  return (
    <div className="v0-chat">
      <div className="v0-header">
        <h2>🔊 Nurd Chat - CHIRP</h2>
        <p>Voice-first AI interface</p>
      </div>

      <div className="v0-messages">
        {messages.length === 0 ? (
          <div className="v0-empty">
            <div className="v0-icon">🔊</div>
            <p>Start a conversation with Nurd Chat</p>
            <p className="v0-hint">Use voice or text to interact with CHIRP</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`v0-message ${msg.type}`}>
              <div className="v0-message-content">
                {msg.text}
              </div>
              <div className="v0-timestamp">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="v0-input-bar">
        <button
          className={`v0-voice-btn ${isRecording ? 'recording' : ''} ${voiceEnabled ? 'enabled' : ''}`}
          onClick={toggleVoice}
          title={voiceEnabled ? (isRecording ? 'Stop Recording' : 'Start Recording') : 'Enable Voice'}
        >
          {isRecording ? '🔴' : '🎤'}
        </button>

        <input
          type="text"
          className="v0-input"
          placeholder="Type a message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
        />

        <button
          className="v0-send-btn"
          onClick={handleSend}
          disabled={!inputText.trim()}
        >
          ➤
        </button>
      </div>
    </div>
  );
};

export default V0Chat;
