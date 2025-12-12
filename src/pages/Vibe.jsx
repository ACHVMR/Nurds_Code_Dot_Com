import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import './Vibe.css';

/**
 * V.I.B.E. - Vibrant Imagination Build Environment
 * Prompt-based vibe coding with live preview
 */
export default function Vibe() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [code, setCode] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setChatHistory(prev => [...prev, { role: 'user', content: prompt }]);
    setIsGenerating(true);
    setPrompt('');

    await new Promise(r => setTimeout(r, 1500));

    const newCode = `// Generated from: "${prompt}"
import React from 'react';

export default function Component() {
  return (
    <div className="component">
      <h1>Generated Component</h1>
      <p>Built with V.I.B.E.</p>
    </div>
  );
}`;

    setCode(newCode);
    setChatHistory(prev => [...prev, {
      role: 'assistant',
      content: 'Code generated! You can edit it in the editor.'
    }]);
    setIsGenerating(false);
  };

  return (
    <div className="vibe-page dots-bg">
      {/* Navigation */}
      <nav className="vibe-nav">
        <Link to="/" className="nav-logo">
          <span>Nurds</span>
          <span className="accent">Code</span>
        </Link>
        <div className="nav-links">
          <Link to="/">Hub</Link>
          <Link to="/code">Prompt to Code</Link>
          <Link to="/vibe/editor" className="active">V.I.B.E.</Link>
          <Link to="/testing-lab">Testing Lab</Link>
          <Link to="/agents">Boomer_Angs</Link>
        </div>
        <div className="nav-actions">
          <button className="btn-run">▶ Run</button>
          <button className="btn-deploy">🚀 Deploy</button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="vibe-content">
        {/* Left: Prompt Interface */}
        <div className="vibe-prompt-panel">
          <div className="panel-header">
            <div className="dot-grid">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
            <h2>V.I.B.E.</h2>
            <p>Vibrant Imagination Build Environment</p>
          </div>

          <div className="chat-area">
            {chatHistory.length === 0 ? (
              <div className="empty-chat animate-fade-in">
                <h3>Start Building</h3>
                <p>Describe what you want to create</p>
                <div className="suggestions">
                  <button onClick={() => setPrompt('Create a hero section with gradient background')}>
                    Hero Section
                  </button>
                  <button onClick={() => setPrompt('Build a responsive navbar with dropdown')}>
                    Navbar
                  </button>
                  <button onClick={() => setPrompt('Create a pricing card component')}>
                    Pricing Card
                  </button>
                </div>
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
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            )}
          </div>

          <form className="prompt-form" onSubmit={handleGenerate}>
            <div className="prompt-box">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what you want to build..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleGenerate(e);
                  }
                }}
              />
              <button type="submit" disabled={isGenerating || !prompt.trim()}>
                →
              </button>
            </div>
          </form>
        </div>

        {/* Right: Code Editor */}
        <div className="vibe-editor-panel carbon-fiber">
          <div className="editor-header">
            <h3>Code Editor</h3>
          </div>
          <div className="editor-area">
            {code ? (
              <Editor
                height="100%"
                defaultLanguage="javascript"
                value={code}
                onChange={(value) => setCode(value || '')}
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
              <div className="empty-editor animate-fade-in">
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
