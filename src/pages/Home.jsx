import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';

/**
 * Home Page - Clean Matte Black with Dots Theme
 */
export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home dots-bg">
      {/* Navigation */}
      <nav className="home-nav">
        <div className="nav-logo">
          <span>Nurds</span>
          <span className="accent">Code</span>
        </div>
        <div className="nav-links">
          <Link to="/" className="active">Hub</Link>
          <Link to="/code">Prompt to Code</Link>
          <Link to="/vibe/editor">V.I.B.E.</Link>
          <Link to="/testing-lab">Testing Lab</Link>
          <Link to="/agents">Boomer_Angs</Link>
        </div>
        <button className="nav-cta" onClick={() => navigate('/code')}>
          Start Building →
        </button>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-content animate-fade-in">
          <div className="dot-grid large">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
          
          <h1>
            Think It.<br />
            <span className="highlight">Prompt It.</span><br />
            Build It.
          </h1>
          
          <p className="tagline">
            Describe what you want. Watch it come to life.
          </p>
          
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => navigate('/code')}>
              Start Building →
            </button>
            <button className="btn-secondary" onClick={() => navigate('/agents')}>
              Create Agent
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features carbon-fiber">
        <div className="features-grid">
          <div className="feature-card animate-fade-in" onClick={() => navigate('/code')}>
            <div className="card-dot"></div>
            <h3>Prompt to Code</h3>
            <p>Describe it. Build it. Deploy it.</p>
          </div>
          
          <div className="feature-card animate-fade-in" onClick={() => navigate('/vibe/editor')} style={{animationDelay: '0.1s'}}>
            <div className="card-dot"></div>
            <h3>V.I.B.E.</h3>
            <p>Vibrant Imagination Build Environment</p>
          </div>
          
          <div className="feature-card animate-fade-in" onClick={() => navigate('/testing-lab')} style={{animationDelay: '0.2s'}}>
            <div className="card-dot"></div>
            <h3>Testing Lab</h3>
            <p>Test code with AI assistance</p>
          </div>
          
          <div className="feature-card animate-fade-in" onClick={() => navigate('/agents')} style={{animationDelay: '0.3s'}}>
            <div className="card-dot"></div>
            <h3>Boomer_Angs</h3>
            <p>Build autonomous AI agents</p>
          </div>
        </div>
      </section>

      {/* Quick Prompt */}
      <section className="quick-prompt">
        <h2>What do you want to build?</h2>
        <div className="prompt-bar">
          <input 
            type="text" 
            placeholder="Describe your idea..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') navigate('/code');
            }}
          />
          <button onClick={() => navigate('/code')}>→</button>
        </div>
      </section>
    </div>
  );
}
