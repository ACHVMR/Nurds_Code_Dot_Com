import React, { useState } from 'react';
import { useVoiceRecording } from '../../hooks/useVoiceRecording';
import { playClick } from '../../utils/phoneSounds';

const BlkBrry = ({ onMessageSend, onVoiceRecord }) => {
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

  const handleKeyPress = (key) => {
    playClick();
    if (key === 'SEND') {
      if (inputText.trim()) {
        setMessages(prev => [...prev, { type: 'user', text: inputText, timestamp: Date.now() }]);
        if (onMessageSend) onMessageSend(inputText);
        setInputText('');
      }
    } else if (key === 'DEL') {
      setInputText(prev => prev.slice(0, -1));
    } else if (key === 'SPACE') {
      setInputText(prev => prev + ' ');
    } else {
      setInputText(prev => prev + key);
    }
  };

  const keyboard = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DEL'],
    ['SPACE', 'SEND']
  ];

  return (
    <div className="BlkBrry">
      <div className="berry-header">
        <div className="berry-logo">🔒 BlkBrry</div>
        <div className="berry-status">
          <span className="signal">📶</span>
          <span className="battery">🔋</span>
        </div>
      </div>

      <div className="berry-screen">
        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="empty-state">
              <div>🔐 Secure Chat</div>
              <div>Type or speak below</div>
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
        </div>

        <div className="input-display">
          <div className="input-text">{inputText || 'Type message...'}</div>
          <div className="cursor">|</div>
        </div>
      </div>

      <div className="berry-keyboard">
        {keyboard.map((row, rowIdx) => (
          <div key={rowIdx} className="keyboard-row">
            {row.map((key) => (
              <button
                key={key}
                className={`key ${key.length > 1 ? 'special-key' : ''}`}
                onClick={() => handleKeyPress(key)}
              >
                {key === 'SPACE' ? '___' : key}
              </button>
            ))}
          </div>
        ))}
      </div>

      <div className="berry-controls">
        <button 
          className={`voice-btn ${isRecording ? 'recording' : ''}`}
          onMouseDown={isRecording ? stopRecording : startRecording}
        >
          {isRecording ? '🔴 Stop' : '🎤 Voice'}
        </button>
        <div className="trackball">
          <div className="trackball-inner"></div>
        </div>
      </div>
    </div>
  );
};

export default BlkBrry;
