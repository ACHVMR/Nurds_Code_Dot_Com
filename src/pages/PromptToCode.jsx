import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import './PromptToCode.css';

/**
 * Prompt To Code - The Core Experience
 * "Think It. Prompt It. Build It."
 * 
 * Users type what they want to build, AI generates the code.
 */
export default function PromptToCode() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [chatHistory, setChatHistory] = useState([]);
  const promptRef = useRef(null);
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom of chat
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
      // In production, this calls your AI backend
      // For now, simulate AI response
      await new Promise(r => setTimeout(r, 1500));
      
      // Generate example code based on prompt
      const code = generateExampleCode(prompt);
      setGeneratedCode(code);
      
      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: `I've generated the code for you. You can edit it in the editor on the right, then deploy or save it.`,
        code
      }]);
    } catch (error) {
      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${error.message}. Please try again.`,
        isError: true
      }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateExampleCode = (userPrompt) => {
    const lowerPrompt = userPrompt.toLowerCase();
    
    if (lowerPrompt.includes('landing page') || lowerPrompt.includes('website')) {
      return `// Generated Landing Page Component
import React from 'react';

export default function LandingPage() {
  return (
    <div className="landing">
      <header className="hero">
        <h1>Welcome to Your New Site</h1>
        <p>Build something amazing today</p>
        <button className="cta">Get Started</button>
      </header>
      
      <section className="features">
        <div className="feature">
          <h3>Fast</h3>
          <p>Lightning quick performance</p>
        </div>
        <div className="feature">
          <h3>Modern</h3>
          <p>Built with the latest tech</p>
        </div>
        <div className="feature">
          <h3>Scalable</h3>
          <p>Grows with your needs</p>
        </div>
      </section>
    </div>
  );
}`;
    }
    
    if (lowerPrompt.includes('api') || lowerPrompt.includes('backend')) {
      return `// Generated API Endpoint
export async function handler(request) {
  const { method, url } = request;
  
  if (method === 'GET') {
    return new Response(JSON.stringify({
      status: 'success',
      message: 'API is running',
      timestamp: new Date().toISOString()
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  if (method === 'POST') {
    const body = await request.json();
    // Process your data here
    return new Response(JSON.stringify({
      status: 'created',
      data: body
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response('Method not allowed', { status: 405 });
}`;
    }
    
    if (lowerPrompt.includes('form') || lowerPrompt.includes('contact')) {
      return `// Generated Contact Form
import React, { useState } from 'react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Submit to your API
    console.log('Form submitted:', formData);
    setSubmitted(true);
  };

  if (submitted) {
    return <div className="success">Thanks! We'll be in touch.</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="contact-form">
      <input
        type="text"
        placeholder="Your name"
        value={formData.name}
        onChange={e => setFormData({...formData, name: e.target.value})}
        required
      />
      <input
        type="email"
        placeholder="Your email"
        value={formData.email}
        onChange={e => setFormData({...formData, email: e.target.value})}
        required
      />
      <textarea
        placeholder="Your message"
        value={formData.message}
        onChange={e => setFormData({...formData, message: e.target.value})}
        required
      />
      <button type="submit">Send Message</button>
    </form>
  );
}`;
    }
    
    // Default response
    return `// Generated Code for: "${userPrompt}"
// 
// This is where your AI-generated code will appear.
// In production, this connects to Claude, GPT, or other models.

export default function GeneratedComponent() {
  return (
    <div>
      <h1>Your Component</h1>
      <p>Based on your prompt: "${userPrompt}"</p>
    </div>
  );
}`;
  };

  const handleDeploy = () => {
    alert('Deploy functionality - connects to Cloudflare Workers / Cloud Run');
  };

  const handleSave = () => {
    alert('Save functionality - saves to your projects');
  };

  return (
    <div className="prompt-to-code">
      {/* Left Panel - Chat Interface */}
      <div className="chat-panel">
        <div className="chat-header">
          <h2>Think It. Prompt It.</h2>
          <p>Describe what you want to build</p>
        </div>

        <div className="chat-messages">
          {chatHistory.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💭</div>
              <h3>What do you want to build?</h3>
              <p>Describe your idea and I'll generate the code</p>
              <div className="suggestions">
                <button onClick={() => setPrompt('Create a landing page with hero section and features')}>
                  Landing Page
                </button>
                <button onClick={() => setPrompt('Build a REST API endpoint with GET and POST')}>
                  API Endpoint
                </button>
                <button onClick={() => setPrompt('Create a contact form with validation')}>
                  Contact Form
                </button>
              </div>
            </div>
          ) : (
            chatHistory.map((msg, i) => (
              <div key={i} className={`message ${msg.role}`}>
                <div className="message-content">
                  {msg.content}
                </div>
              </div>
            ))
          )}
          
          {isGenerating && (
            <div className="message assistant">
              <div className="message-content generating">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <form className="prompt-form" onSubmit={handleSubmit}>
          <textarea
            ref={promptRef}
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
            {isGenerating ? '...' : '→'}
          </button>
        </form>
      </div>

      {/* Right Panel - Code Editor */}
      <div className="editor-panel">
        <div className="editor-header">
          <div className="editor-title">
            <h3>Build It.</h3>
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              className="language-select"
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
            </select>
          </div>
          <div className="editor-actions">
            <button className="btn-save" onClick={handleSave}>
              💾 Save
            </button>
            <button className="btn-deploy" onClick={handleDeploy}>
              🚀 Deploy
            </button>
          </div>
        </div>

        <div className="editor-container">
          {generatedCode ? (
            <Editor
              height="100%"
              language={language}
              value={generatedCode}
              onChange={(value) => setGeneratedCode(value || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'JetBrains Mono', monospace",
                padding: { top: 16 },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                wordWrap: 'on'
              }}
            />
          ) : (
            <div className="editor-empty">
              <div className="editor-empty-icon">⌨️</div>
              <p>Your generated code will appear here</p>
              <p className="muted">Type a prompt on the left to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
