import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import './PromptToCode.css';

/**
 * Prompt To Code - Primary Interface
 * "Think It. Prompt It. Build It."
 */
export default function PromptToCode() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    const userMessage = { role: 'user', content: prompt };
    setChatHistory(prev => [...prev, userMessage]);
    setIsGenerating(true);
    setPrompt('');

    try {
      await new Promise(r => setTimeout(r, 1500));
      const code = generateCode(prompt);
      setGeneratedCode(code);
      
      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: `Code generated! Edit it in the panel, then deploy.`
      }]);
    } catch (error) {
      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${error.message}`
      }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateCode = (userPrompt) => {
    // This will connect to real AI in production
    return `// Generated for: "${userPrompt}"

export default function App() {
  return (
    <div className="app">
      <h1>Your Generated App</h1>
      <p>Based on: ${userPrompt}</p>
    </div>
  );
}`;
  };

  return (
    <div className="prompt-to-code dots-bg">
      {/* NAVIGATION - Always visible */}
      <nav className="ptc-nav">
        <Link to="/" className="nav-logo">
          <span>Nurds</span>
          <span className="accent">Code</span>
        </Link>
        <div className="nav-links">
          <Link to="/">Hub</Link>
          <Link to="/vibe/editor">V.I.B.E.</Link>
          <Link to="/testing-lab">Testing Lab</Link>
          <Link to="/agents">Boomer_Angs</Link>
          <Link to="/admin">Circuit Box</Link>
        </div>
        <button className="nav-deploy" onClick={() => alert('Deploy coming soon')}>
          🚀 Deploy
        </button>
      </nav>

      {/* Main Content */}
      <div className="ptc-content">
        {/* Left: Prompt Interface */}
        <div className="ptc-prompt-panel">
          <div className="panel-header">
            <h2>Think It. Prompt It.</h2>
            <p>Describe what you want to build</p>
          </div>

          <div className="chat-area">
            {chatHistory.length === 0 ? (
              <div className="empty-state animate-fade-in">
                <div className="dot-grid">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
                <h3>What do you want to build?</h3>
                <p>Describe your idea and watch it come to life</p>
              </div>
            ) : (
              chatHistory.map((msg, i) => (
                <div key={i} className={`message ${msg.role} animate-fade-in`}>
                  {msg.content}
                </div>
              ))
            )}
            {isGenerating && (
              <div className="message assistant generating">
                <span className="dot animate-pulse"></span>
                <span className="dot animate-pulse" style={{animationDelay: '0.2s'}}></span>
                <span className="dot animate-pulse" style={{animationDelay: '0.4s'}}></span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form className="prompt-form" onSubmit={handleSubmit}>
            <div className="prompt-box">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what you want to build..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <button type="submit" disabled={isGenerating || !prompt.trim()}>
                →
              </button>
            </div>
          </form>
        </div>

        {/* Right: Code Output */}
        <div className="ptc-code-panel carbon-fiber">
          <div className="panel-header">
            <h3>Build It.</h3>
            <div className="code-actions">
              <button className="btn-save">💾 Save</button>
              <button className="btn-deploy">🚀 Deploy</button>
            </div>
          </div>

          <div className="code-area">
            {generatedCode ? (
              <Editor
                height="100%"
                defaultLanguage="javascript"
                value={generatedCode}
                onChange={(value) => setGeneratedCode(value || '')}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  fontFamily: "'JetBrains Mono', monospace",
                  padding: { top: 16 },
                  scrollBeyondLastLine: false,
                  wordWrap: 'on'
                }}
              />
            ) : (
              <div className="empty-code animate-fade-in">
                <div className="dot-grid">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
                <p>Your code will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
