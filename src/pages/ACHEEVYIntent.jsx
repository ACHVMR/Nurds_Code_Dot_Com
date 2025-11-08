import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useVoiceRecording } from '../hooks/useVoiceRecording';
import './ACHEEVYIntent.css';

const ACHEEVYIntent = () => {
  const { ideaId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { idea } = location.state || {};
  
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [prd, setPRD] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  
  const { isRecording, startRecording, stopRecording, transcript } = useVoiceRecording();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (transcript) {
      handleSendMessage(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    initSession();
  }, []);

  const initSession = async () => {
    try {
      const token = await window.Clerk?.session?.getToken();
      const response = await fetch('/api/acheevy/start-session', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          appIdeaId: ideaId,
          ideaTitle: idea?.title,
          ideaDescription: idea?.description
        })
      });

      const data = await response.json();
      setSessionId(data.sessionId);
      
      // Add initial messages
      setMessages([
        { 
          role: 'acheevy', 
          content: data.firstMessage || `Hi! I'm ACHEEVY. Let's build "${idea?.title || 'your app'}" together!`
        },
        { 
          role: 'acheevy', 
          content: data.firstQuestion || "What's the primary use case or problem this app solves?"
        }
      ]);
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  };

  const handleSendMessage = async (text = userInput) => {
    if (!text.trim() || !sessionId) return;

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setUserInput('');
    setIsTyping(true);

    try {
      const token = await window.Clerk?.session?.getToken();
      const response = await fetch('/api/acheevy/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sessionId,
          userMessage: text
        })
      });

      const data = await response.json();
      
      // Add ACHEEVY's response
      setMessages(prev => [...prev, { 
        role: 'acheevy', 
        content: data.acheevy_response 
      }]);
      
      // Check if PRD is generated
      if (data.prdGenerated) {
        setPRD(data.prd);
      }
      
      setCurrentQuestion(prev => prev + 1);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleApprovePRD = async () => {
    try {
      const token = await window.Clerk?.session?.getToken();
      const response = await fetch('/api/acheevy/approve-prd', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ sessionId })
      });

      const data = await response.json();
      
      if (data.success) {
        navigate(`/editor/${data.projectId}`, { 
          state: { prd, sessionId } 
        });
      }
    } catch (error) {
      console.error('Failed to approve PRD:', error);
    }
  };

  const handleVoiceToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="acheevy-intent-container">
      <header className="acheevy-header">
        <h1>🎤 ACHEEVY Intent Discovery</h1>
        <div className="progress-indicator">
          Question {currentQuestion + 1} of 7
        </div>
      </header>

      <div className="chat-container">
        <div className="messages-area">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.role}`}>
              {msg.role === 'acheevy' && (
                <div className="avatar">🤖</div>
              )}
              <div className="message-content">
                {msg.content}
              </div>
              {msg.role === 'user' && (
                <div className="avatar">👤</div>
              )}
            </div>
          ))}
          
          {isTyping && (
            <div className="message acheevy">
              <div className="avatar">🤖</div>
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {prd && (
          <div className="prd-preview">
            <h3>✨ PRD Generated!</h3>
            <div className="prd-content">
              <h4>{prd.title}</h4>
              <p>{prd.overview}</p>
              <div className="prd-features">
                <h5>Core Features:</h5>
                <ul>
                  {prd.coreFeatures?.slice(0, 3).map((feat, idx) => (
                    <li key={idx}>
                      {feat.name} <span className="priority">{feat.priority}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="prd-actions">
              <button 
                className="approve-btn"
                onClick={handleApprovePRD}
              >
                ✅ Approve & Build
              </button>
              <button 
                className="revise-btn"
                onClick={() => setPRD(null)}
              >
                🔄 Ask More Questions
              </button>
            </div>
          </div>
        )}

        {!prd && (
          <div className="input-area">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your answer..."
              className="text-input"
              disabled={isTyping}
            />
            
            <button
              className={`voice-btn ${isRecording ? 'recording' : ''}`}
              onClick={handleVoiceToggle}
              disabled={isTyping}
            >
              {isRecording ? '🔴' : '🎤'}
            </button>
            
            <button 
              className="send-btn"
              onClick={() => handleSendMessage()}
              disabled={!userInput.trim() || isTyping}
            >
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ACHEEVYIntent;
