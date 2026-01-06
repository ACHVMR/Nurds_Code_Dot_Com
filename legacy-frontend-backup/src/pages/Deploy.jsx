import React from 'react';
import { Link } from 'react-router-dom';
import './Deploy.css';

/**
 * Deploy - Placeholder Page
 * This feature is being built on a separate platform
 */
export default function Deploy() {
  return (
    <div className="deploy-page dots-bg">
      {/* Navigation */}
      <nav className="deploy-nav">
        <Link to="/" className="nav-logo">
          <span>Nurds</span>
          <span className="accent">Code</span>
        </Link>
        <div className="nav-links">
          <Link to="/">Hub</Link>
          <Link to="/code">Prompt to Code</Link>
          <Link to="/vibe/editor">V.I.B.E.</Link>
          <Link to="/testing-lab">Testing Lab</Link>
          <Link to="/agents">Boomer_Angs</Link>
          <Link to="/deploy" className="active">Deploy</Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="deploy-content">
        <div className="deploy-coming-soon animate-fade-in">
          <div className="dot-grid">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
          
          <h1>Deploy</h1>
          <p className="subtitle">Coming Soon</p>
          
          <div className="description">
            <p>This feature is being developed on a separate platform.</p>
            <p>Stay tuned for one-click deployments to:</p>
          </div>
          
          <div className="deploy-targets">
            <div className="target">
              <span className="icon">☁️</span>
              <span>Cloudflare Workers</span>
            </div>
            <div className="target">
              <span className="icon">📦</span>
              <span>Cloudflare Pages</span>
            </div>
            <div className="target">
              <span className="icon">🚀</span>
              <span>Google Cloud Run</span>
            </div>
          </div>
          
          <Link to="/code" className="btn-primary">
            ← Back to Coding
          </Link>
        </div>
      </div>
    </div>
  );
}
