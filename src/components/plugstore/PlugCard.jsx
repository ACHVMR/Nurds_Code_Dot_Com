import React from 'react';
import './PlugCard.css';

/**
 * PlugCard - Individual plug listing in the marketplace
 */
export default function PlugCard({ plug, onClick, featured = false }) {
  const formatPrice = (price, model) => {
    if (price === 0 || model === 'freemium') return 'Free';
    if (model === 'subscription') return `$${price}/mo`;
    if (model === 'rental') return `$${price}/rental`;
    return `$${price}`;
  };

  const ratingStars = () => {
    const full = Math.floor(plug.rating);
    const half = plug.rating % 1 >= 0.5;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - (half ? 1 : 0));
  };

  return (
    <div 
      className={`plug-card ${featured ? 'featured' : ''}`}
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="plug-thumbnail">
        {plug.thumbnail ? (
          <img src={plug.thumbnail} alt={plug.name} />
        ) : (
          <div className="plug-thumbnail-placeholder">
            <span className="placeholder-icon">🔌</span>
          </div>
        )}
        {featured && <span className="featured-badge">⭐ Featured</span>}
        {plug.price === 0 && <span className="free-badge">FREE</span>}
      </div>

      {/* Content */}
      <div className="plug-content">
        {/* Creator */}
        <div className="plug-creator">
          <span className="creator-avatar">{plug.creator.avatar}</span>
          <span className="creator-name">
            {plug.creator.name}
            {plug.creator.verified && <span className="verified-badge">✓</span>}
          </span>
        </div>

        {/* Title */}
        <h3 className="plug-name">{plug.name}</h3>
        <p className="plug-tagline">{plug.tagline}</p>

        {/* Tags */}
        <div className="plug-tags">
          {plug.tags.slice(0, 3).map(tag => (
            <span key={tag} className="plug-tag">{tag}</span>
          ))}
        </div>

        {/* Stats */}
        <div className="plug-stats">
          <span className="plug-rating">
            <span className="stars">{ratingStars()}</span>
            <span className="rating-value">{plug.rating}</span>
            <span className="rating-count">({plug.reviews})</span>
          </span>
        </div>

        {/* Footer */}
        <div className="plug-footer">
          <span className="plug-downloads">
            ⬇️ {plug.downloads.toLocaleString()}
          </span>
          <span className="plug-price">
            {formatPrice(plug.price, plug.pricingModel)}
          </span>
        </div>
      </div>
    </div>
  );
}
