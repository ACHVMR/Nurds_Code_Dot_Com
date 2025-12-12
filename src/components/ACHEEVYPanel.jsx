import React, { useState, useContext } from 'react';
import { sendChat } from '../utils/deepmind-api';
import { DepartmentContext } from '../context/DepartmentContext';

/**
 * ACHEEVY Chat Panel
 * Floating chat interface that uses Gemini 3.0 with energy-aware responses.
 */
export default function ACHEEVYPanel() {
  const { currentDepartment, energyLevel } = useContext(DepartmentContext);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const result = await sendChat(input, currentDepartment, energyLevel, history);
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: result.response,
        model: result.model,
        energy: result.energy
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Error: ${error.message}`,
        isError: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-linear-to-br from-emerald-500 to-cyan-500 text-white shadow-lg hover:scale-105 transition-transform z-50 flex items-center justify-center"
        aria-label={isOpen ? "Close ACHEEVY Chat" : "Open ACHEEVY Chat"}
        aria-expanded={isOpen}
      >
        <span role="img" aria-hidden="true" className="text-2xl">💬</span>
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div 
          className="fixed bottom-24 right-6 w-96 h-[500px] bg-[#0d1117] border border-gray-700 rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden"
          role="dialog"
          aria-label="ACHEEVY Virtual Assistant"
        >
          {/* Header */}
          <div className="p-4 bg-linear-to-r from-emerald-600 to-cyan-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span role="img" aria-label="Brain Icon" className="text-xl">🧠</span>
                <div>
                  <h3 className="font-bold">ACHEEVY</h3>
                  <p className="text-xs opacity-80">
                    {currentDepartment.toUpperCase()} • {energyLevel}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-white/70 hover:text-white p-1"
                aria-label="Close Chat"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages */}
          <div 
            className="flex-1 overflow-y-auto p-4 space-y-3"
            role="log"
            aria-live="polite"
            aria-atomic="false"
          >
            {messages.length === 0 && (
              <p className="text-gray-500 text-sm text-center mt-10">
                Ask me anything about {currentDepartment}...
              </p>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg text-sm ${
                  msg.role === 'user'
                    ? 'bg-emerald-600/20 text-emerald-100 ml-8'
                    : msg.isError
                    ? 'bg-red-600/20 text-red-300 mr-8'
                    : 'bg-gray-800 text-gray-200 mr-8'
                }`}
              >
                {msg.content}
                {msg.model && (
                  <p className="text-xs text-gray-500 mt-1">via {msg.model}</p>
                )}
              </div>
            ))}
            {loading && (
              <div className="bg-gray-800 text-gray-400 p-3 rounded-lg mr-8 text-sm animate-pulse" role="status">
                Thinking...
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-700">
            <div className="flex gap-2">
              <label htmlFor="acheevy-input" className="sr-only">Type your message</label>
              <input
                id="acheevy-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask ACHEEVY..."
                className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send Message"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
