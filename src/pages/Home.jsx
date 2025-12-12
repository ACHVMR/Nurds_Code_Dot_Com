import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

/**
 * Home Page - Clean, Matte Black Design
 * Primary focus: Get users to the prompt-to-code experience
 */
export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Think It.<br />
            <span className="highlight">Prompt It.</span><br />
            Build It.
          </h1>
          <p className="hero-subtitle">
            Describe what you want to build. Watch it come to life.
          </p>
          <div className="hero-actions">
            <button 
              className="btn-primary"
              onClick={() => navigate('/code')}
            >
              Start Building →
            </button>
            <button 
              className="btn-secondary"
              onClick={() => navigate('/agents')}
            >
              Create Agent
            </button>
          </div>
        </div>
        
        <div className="hero-visual">
          <div className="code-preview">
            <div className="code-header">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
            </div>
            <pre className="code-content">
{`// Your prompt becomes code
prompt("Build a landing page")

// → Generated instantly
export default function Landing() {
  return (
    <div className="hero">
      <h1>Welcome</h1>
      <button>Get Started</button>
    </div>
  );
}`}
            </pre>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features">
        <div className="features-grid">
          <div className="feature-card" onClick={() => navigate('/code')}>
            <div className="feature-icon">⌨️</div>
            <h3>V.I.B.E.</h3>
            <p>Prompt-to-code editor. Describe it, build it.</p>
          </div>
          
          <div className="feature-card" onClick={() => navigate('/agents')}>
            <div className="feature-icon">🤖</div>
            <h3>Agent Builder</h3>
            <p>Create autonomous AI agents with tools.</p>
          </div>
          
          <div className="feature-card" onClick={() => navigate('/testing-lab')}>
            <div className="feature-icon">🧪</div>
            <h3>Testing Lab</h3>
            <p>Test code, packages, and plugins.</p>
          </div>
          
          <div className="feature-card" onClick={() => navigate('/deploy')}>
            <div className="feature-icon">🚀</div>
            <h3>Deploy</h3>
            <p>One-click deploy to the edge.</p>
          </div>
        </div>
      </section>

      {/* Quick Prompt Bar */}
      <section className="quick-prompt">
        <h2>What do you want to build?</h2>
        <div className="prompt-bar">
          <input 
            type="text" 
            placeholder="Describe your idea..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                navigate('/code');
              }
            }}
          />
          <button onClick={() => navigate('/code')}>Build →</button>
        </div>
      </section>
    </div>
  );
}
