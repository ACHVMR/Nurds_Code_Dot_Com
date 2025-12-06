import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import scribe2 from '../utils/scribe2';
import { useRole } from '../context/RoleContext';

/**
 * ACHEEVY Floating Chat Bar
 * 
 * A minimal, non-intrusive floating interface that:
 * - Lives at the bottom center of the screen
 * - Expands into a chat panel when clicked
 * - Powered by ii-agent (but never reveals internal details)
 * - Uses Neon Green (#39FF14) for titles/names only
 * - For complex queries, guides users to speak with a human
 */
const SmartSidePanel = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hey! I\'m ACHEEVY, your guide to the platform. Ask me anything quick, or I can help you get started!' }
  ]);
  
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { isOwner } = useRole();

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleSend = () => {
    if (!prompt.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: prompt }]);
    
    // Simulate ACHEEVY response (in production, this calls ii-agent)
    setTimeout(() => {
      // Check if the query is complex (needs human help)
      const isComplex = prompt.toLowerCase().includes('pricing') || 
                        prompt.toLowerCase().includes('enterprise') ||
                        prompt.toLowerCase().includes('custom') ||
                        prompt.length > 150;
      
      if (isComplex) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'Great question! This sounds like something our team can help with better. Would you like me to connect you with a human specialist? In the meantime, you can reach us at support@nurds.code.' 
        }]);
      } else if (prompt.toLowerCase().includes('editor') || prompt.toLowerCase().includes('code')) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'The V.I.B.E. Editor is where the magic happens! Want me to take you there?' 
        }]);
        // Could add a "Go to Editor" action button here
      } else {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'Got it! Let me think about that... For detailed help, check out our documentation or reach out to the team. Is there something specific about the platform I can clarify?' 
        }]);
      }
    }, 800);
    
    setPrompt('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === 'Escape') {
      setIsExpanded(false);
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      setIsRecording(false);
      setIsProcessing(true);
      const audioBlob = await scribe2.stopRecording();
      const text = await scribe2.transcribe(audioBlob);
      if (text) {
        setPrompt(prev => prev + ' ' + text);
      }
      setIsProcessing(false);
    } else {
      const started = await scribe2.startRecording();
      if (started) {
        setIsRecording(true);
      }
    }
  };

  return (
    <>
      {/* Floating Chat Bar - Fixed at bottom center */}
      <div 
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
        style={{ maxWidth: '600px', width: '90%' }}
      >
        {/* Expanded Chat Panel */}
        {isExpanded && (
          <div 
            className="mb-3 rounded-2xl overflow-hidden"
            style={{
              background: '#0E0E0E',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
            }}
          >
            {/* Chat Header */}
            <div 
              className="px-4 py-3 flex items-center justify-between"
              style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                  style={{ background: 'rgba(57, 255, 20, 0.15)' }}
                >
                  🧠
                </div>
                <div>
                  <div className="font-bold text-sm" style={{ color: '#39FF14' }}>ACHEEVY</div>
                  <div className="text-xs" style={{ color: '#A8B2C0' }}>Quick questions & guidance</div>
                </div>
              </div>
              <button 
                onClick={() => setIsExpanded(false)}
                className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                style={{ color: '#A8B2C0' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages Area */}
            <div 
              className="p-4 space-y-3 overflow-y-auto"
              style={{ maxHeight: '300px' }}
            >
              {messages.map((msg, i) => (
                <div 
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className="max-w-[80%] px-3 py-2 rounded-xl text-sm"
                    style={{
                      background: msg.role === 'user' ? 'rgba(57, 255, 20, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                      color: '#F2F7FF',
                      border: msg.role === 'user' ? '1px solid rgba(57, 255, 20, 0.2)' : '1px solid rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div 
              className="p-3 flex items-center gap-2"
              style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}
            >
              <button
                onClick={toggleRecording}
                className="p-2 rounded-lg transition-all"
                style={{ 
                  background: isRecording ? 'rgba(255, 94, 0, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  color: isRecording ? '#FF5E00' : '#A8B2C0',
                  border: isRecording ? '1px solid rgba(255, 94, 0, 0.3)' : '1px solid transparent'
                }}
              >
                {isRecording ? '⏹' : isProcessing ? '...' : '🎤'}
              </button>
              <input
                ref={inputRef}
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask ACHEEVY anything..."
                className="flex-1 bg-transparent border-none outline-none text-sm"
                style={{ color: '#F2F7FF' }}
              />
              <button
                onClick={handleSend}
                disabled={!prompt.trim()}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-40"
                style={{ 
                  background: '#39FF14',
                  color: '#000'
                }}
              >
                Send
              </button>
            </div>
          </div>
        )}

        {/* Collapsed Bar - Always visible */}
        <div 
          onClick={() => !isExpanded && setIsExpanded(true)}
          className={`flex items-center gap-3 px-4 py-3 rounded-full cursor-pointer transition-all ${!isExpanded ? 'hover:scale-[1.02]' : ''}`}
          style={{
            background: '#151515',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
          }}
        >
          {/* ACHEEVY Icon */}
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0"
            style={{ 
              background: 'linear-gradient(135deg, rgba(57, 255, 20, 0.2), rgba(57, 255, 20, 0.05))',
              border: '1px solid rgba(57, 255, 20, 0.2)'
            }}
          >
            🧠
          </div>

          {/* Search/Input Area */}
          <div className="flex-1 min-w-0">
            {isExpanded ? (
              <span className="text-sm" style={{ color: '#A8B2C0' }}>Chat with ACHEEVY</span>
            ) : (
              <span className="text-sm" style={{ color: '#A8B2C0' }}>Ask ACHEEVY anything...</span>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {!isExpanded && (
              <>
                <kbd 
                  className="hidden sm:inline-block px-2 py-0.5 rounded text-xs"
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#A8B2C0',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  ⌘K
                </kbd>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Left Margin Tab Switcher (for Owners only) */}
      {isOwner && (
        <div 
          className="fixed left-4 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2"
        >
          {[
            { icon: '🏠', label: 'Home', path: '/' },
            { icon: '</>', label: 'Editor', path: '/editor' },
            { icon: '⚡', label: 'Circuit', path: '/circuit-box' },
            { icon: '🧪', label: 'Lab', path: '/testing-lab' }
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => navigate(item.path)}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-sm transition-all hover:scale-110"
              style={{
                background: 'rgba(21, 21, 21, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)'
              }}
              title={item.label}
            >
              {item.icon}
            </button>
          ))}
        </div>
      )}

      {/* Bottom Left Page Indicator (context-aware) */}
      <div 
        className="fixed bottom-6 left-6 z-40 hidden md:block"
      >
        <div 
          className="px-3 py-2 rounded-xl text-xs font-mono"
          style={{
            background: 'rgba(21, 21, 21, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#A8B2C0',
            backdropFilter: 'blur(10px)'
          }}
        >
          <span style={{ color: '#39FF14' }}>●</span> NurdsCode v1.0
        </div>
      </div>
    </>
  );
};

export default SmartSidePanel;
