import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';

/**
 * Home Page - NURDSCODE Landing Page
 * Design: Dark theme with neon cyan/orange accents
 */
export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      {/* Navigation Header */}
      <nav className="home-nav">
        <div className="nav-container">
          {/* Logo */}
          <div className="nav-logo">
            <span className="logo-text">NurdsCode</span>
          </div>

          {/* Navigation Links */}
          <div className="nav-links">
            <Link to="/" className="nav-link active">Home</Link>
            <Link to="/about" className="nav-link">Pbouts</Link>
            <Link to="/resources" className="nav-link">Resources</Link>
            <Link to="/blog" className="nav-link">Blog</Link>
            <Link to="/contact" className="nav-link">Contact</Link>
          </div>

          {/* Auth Buttons */}
          <div className="nav-auth">
            <button className="btn-link" onClick={() => navigate('/login')}>
              Log in
            </button>
            <button className="btn-get-started" onClick={() => navigate('/code')}>
              Get started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          {/* Left Content */}
          <div className="hero-content">
            <h1 className="hero-title">
              <span className="hero-brand">NURDSCODE:</span>{' '}
              <span className="hero-subtitle-text">CODE YOUR FUTURE. EMPOWER YOUR VIBE.</span>
            </h1>

            <p className="hero-description">
              A community-driven platform for the next generation of tech leaders,
              powered by STEAM, S.M.A.R.T. goals, and the F.D.H. methodology.
            </p>

            <div className="hero-actions">
              <button className="btn-primary-hero" onClick={() => navigate('/code')}>
                BECOME A NURD TODAY
              </button>
              <button className="btn-secondary-hero" onClick={() => navigate('/vibe/editor')}>
                EXPLORE THE PLATFORM
              </button>
            </div>
          </div>

          {/* Right Content - Character Illustration */}
          <div className="hero-illustration">
            <div className="illustration-container">
              {/* Placeholder for character illustration */}
              <div className="character-card">
                <div className="character-badge">
                  <div className="badge-icon">👨‍💻</div>
                  <div className="badge-text">
                    <div className="badge-title">TECH SAGE - LEVEL 7</div>
                    <div className="progress-bars">
                      <div className="progress-bar" style={{width: '80%'}}></div>
                      <div className="progress-bar" style={{width: '65%'}}></div>
                      <div className="progress-bar" style={{width: '90%'}}></div>
                    </div>
                  </div>
                </div>

                <div className="character-main">
                  <div className="nurd-logo-big">NURD</div>
                  <div className="character-avatar">
                    <div className="avatar-circle">🚀</div>
                  </div>
                </div>

                <div className="methodology-tags">
                  <div className="tag tag-foster">FOSTER</div>
                  <div className="tag tag-develop">DEVELOP</div>
                  <div className="tag tag-hone">HONE</div>
                </div>

                <div className="goals-card">
                  <div className="goals-title">S.M.A.R.T. GOALS</div>
                  <div className="goals-items">
                    <div className="goal-item">✓ Build portfolio</div>
                    <div className="goal-item">✓ Master React</div>
                    <div className="goal-item">→ Launch startup</div>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="glow-circle glow-cyan"></div>
                <div className="glow-circle glow-orange"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Accent Line */}
      <div className="hero-footer-accent"></div>
    </div>
  );
}
