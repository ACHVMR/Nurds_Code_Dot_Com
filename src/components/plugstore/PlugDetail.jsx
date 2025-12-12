import React, { useState } from 'react';
import './PlugDetail.css';
import { PRICING_MODELS } from '../../config/creator-economy';

/**
 * PlugDetail - Individual plug detail page with purchase options
 */
export default function PlugDetail({ plug, onBack, language }) {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [purchasing, setPurchasing] = useState(false);

  const handlePurchase = async () => {
    setPurchasing(true);
    // In production, this would call the checkout API
    setTimeout(() => {
      alert(`Purchase flow for ${plug.name} - $${plug.price}`);
      setPurchasing(false);
    }, 1000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: plug.name,
        text: plug.tagline,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const formatPrice = () => {
    if (plug.price === 0) return 'Free';
    if (plug.pricingModel === 'subscription') return `$${plug.price}/month`;
    return `$${plug.price}`;
  };

  const modelInfo = PRICING_MODELS[plug.pricingModel] || PRICING_MODELS.one_time;

  return (
    <div className="plug-detail">
      {/* Header */}
      <div className="detail-header">
        <button className="back-btn" onClick={onBack}>
          ← Back to Store
        </button>
        <div className="header-actions">
          <button className="share-btn" onClick={handleShare}>
            📤 Share
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="detail-hero">
        <div className="hero-left">
          <div className="plug-icon-large">
            {plug.thumbnail ? (
              <img src={plug.thumbnail} alt={plug.name} />
            ) : (
              <div className="icon-placeholder">🔌</div>
            )}
          </div>
        </div>
        <div className="hero-right">
          <div className="creator-info">
            <span className="creator-avatar-lg">{plug.creator.avatar}</span>
            <span className="creator-name-lg">
              {plug.creator.name}
              {plug.creator.verified && <span className="verified-lg">✓ Verified</span>}
            </span>
          </div>
          
          <h1 className="plug-title">{plug.name}</h1>
          <p className="plug-tagline-lg">{plug.tagline}</p>

          <div className="plug-meta">
            <span className="meta-item">
              <span className="stars-lg">{'★'.repeat(Math.floor(plug.rating))}</span>
              {plug.rating} ({plug.reviews} reviews)
            </span>
            <span className="meta-item">⬇️ {plug.downloads.toLocaleString()} downloads</span>
            <span className="meta-item">{modelInfo.icon} {modelInfo.name}</span>
          </div>

          <div className="tags-lg">
            {plug.tags.map(tag => (
              <span key={tag} className="tag-lg">{tag}</span>
            ))}
          </div>

          <div className="purchase-section">
            <div className="price-display">
              <span className="price-lg">{formatPrice()}</span>
              {plug.pricingModel !== 'one_time' && plug.price > 0 && (
                <span className="price-note">Billed {plug.pricingModel === 'subscription' ? 'monthly' : 'once'}</span>
              )}
            </div>
            <div className="purchase-buttons">
              <button 
                className="purchase-btn primary"
                onClick={handlePurchase}
                disabled={purchasing}
              >
                {purchasing ? 'Processing...' : plug.price === 0 ? '🚀 Get for Free' : '💳 Purchase Now'}
              </button>
              {plug.preview_url && (
                <a href={plug.preview_url} target="_blank" rel="noopener noreferrer" className="preview-btn">
                  👁️ Live Demo
                </a>
              )}
            </div>
          </div>

          <div className="security-badge">
            🔒 Secure checkout • License protection • Auto-updates included
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="detail-tabs">
        <button 
          className={`tab ${selectedTab === 'overview' ? 'active' : ''}`}
          onClick={() => setSelectedTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab ${selectedTab === 'screenshots' ? 'active' : ''}`}
          onClick={() => setSelectedTab('screenshots')}
        >
          Screenshots
        </button>
        <button 
          className={`tab ${selectedTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setSelectedTab('reviews')}
        >
          Reviews ({plug.reviews})
        </button>
        <button 
          className={`tab ${selectedTab === 'changelog' ? 'active' : ''}`}
          onClick={() => setSelectedTab('changelog')}
        >
          Changelog
        </button>
        <button 
          className={`tab ${selectedTab === 'support' ? 'active' : ''}`}
          onClick={() => setSelectedTab('support')}
        >
          Support
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {selectedTab === 'overview' && (
          <div className="overview-content">
            <h2>About {plug.name}</h2>
            <p className="description">{plug.description}</p>
            
            <h3>Features</h3>
            <ul className="features-list">
              <li>✓ Full source code included</li>
              <li>✓ Lifetime updates</li>
              <li>✓ Documentation included</li>
              <li>✓ 14-day money-back guarantee</li>
              <li>✓ Priority support</li>
            </ul>

            <h3>Technical Details</h3>
            <div className="tech-grid">
              <div className="tech-item">
                <span className="tech-label">Version</span>
                <span className="tech-value">1.0.0</span>
              </div>
              <div className="tech-item">
                <span className="tech-label">Framework</span>
                <span className="tech-value">React + Vite</span>
              </div>
              <div className="tech-item">
                <span className="tech-label">Category</span>
                <span className="tech-value">{plug.category}</span>
              </div>
              <div className="tech-item">
                <span className="tech-label">Last Updated</span>
                <span className="tech-value">Dec 2024</span>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'screenshots' && (
          <div className="screenshots-content">
            <p className="placeholder-message">📸 Screenshots coming soon</p>
          </div>
        )}

        {selectedTab === 'reviews' && (
          <div className="reviews-content">
            <div className="reviews-summary">
              <div className="rating-big">{plug.rating}</div>
              <div className="rating-bars">
                {[5,4,3,2,1].map(star => (
                  <div key={star} className="rating-bar">
                    <span>{star}★</span>
                    <div className="bar-bg">
                      <div className="bar-fill" style={{ width: `${star * 20}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p className="placeholder-message">💬 Be the first to review!</p>
          </div>
        )}

        {selectedTab === 'changelog' && (
          <div className="changelog-content">
            <div className="changelog-entry">
              <div className="version-badge">v1.0.0</div>
              <div className="changelog-date">December 2024</div>
              <ul>
                <li>Initial release</li>
                <li>Full feature set</li>
                <li>Documentation included</li>
              </ul>
            </div>
          </div>
        )}

        {selectedTab === 'support' && (
          <div className="support-content">
            <div className="support-options">
              <div className="support-card">
                <h4>📚 Documentation</h4>
                <p>Read the full documentation and guides</p>
                <button>View Docs</button>
              </div>
              <div className="support-card">
                <h4>💬 Contact Creator</h4>
                <p>Get direct support from the creator</p>
                <button>Send Message</button>
              </div>
              <div className="support-card">
                <h4>🐛 Report Issue</h4>
                <p>Found a bug? Let us know</p>
                <button>Report</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
