import React from 'react';
import './PlugFilters.css';

/**
 * PlugFilters - Sidebar filters for the Plug Store
 */
export default function PlugFilters({
  categories,
  selectedCategory,
  onCategoryChange,
  priceFilter,
  onPriceChange,
  sortBy,
  onSortChange
}) {
  return (
    <div className="plug-filters">
      {/* Categories */}
      <div className="filter-section">
        <h3 className="filter-title">Categories</h3>
        <ul className="category-list">
          <li 
            className={`category-item ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => onCategoryChange('all')}
          >
            <span className="cat-icon">📦</span>
            <span className="cat-name">All Plugs</span>
          </li>
          {categories.map(cat => (
            <li 
              key={cat.id}
              className={`category-item ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => onCategoryChange(cat.id)}
              style={{ '--cat-color': cat.color }}
            >
              <span className="cat-icon">{cat.icon}</span>
              <span className="cat-name">{cat.name}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Price Filter */}
      <div className="filter-section">
        <h3 className="filter-title">Price</h3>
        <div className="price-filters">
          <label className={`radio-label ${priceFilter === 'all' ? 'active' : ''}`}>
            <input 
              type="radio" 
              name="price" 
              value="all"
              checked={priceFilter === 'all'}
              onChange={() => onPriceChange('all')}
            />
            <span className="radio-custom"></span>
            All Prices
          </label>
          <label className={`radio-label ${priceFilter === 'free' ? 'active' : ''}`}>
            <input 
              type="radio" 
              name="price" 
              value="free"
              checked={priceFilter === 'free'}
              onChange={() => onPriceChange('free')}
            />
            <span className="radio-custom"></span>
            Free Only
          </label>
          <label className={`radio-label ${priceFilter === 'paid' ? 'active' : ''}`}>
            <input 
              type="radio" 
              name="price" 
              value="paid"
              checked={priceFilter === 'paid'}
              onChange={() => onPriceChange('paid')}
            />
            <span className="radio-custom"></span>
            Paid Only
          </label>
        </div>
      </div>

      {/* Sort */}
      <div className="filter-section">
        <h3 className="filter-title">Sort By</h3>
        <select 
          className="sort-select"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
        >
          <option value="popular">Most Popular</option>
          <option value="rating">Highest Rated</option>
          <option value="newest">Newest</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>
      </div>

      {/* Quick Links */}
      <div className="filter-section">
        <h3 className="filter-title">Quick Links</h3>
        <ul className="quick-links">
          <li>🆕 New This Week</li>
          <li>🔥 Trending</li>
          <li>⭐ Top Rated</li>
          <li>💎 Premium Picks</li>
          <li>🎁 Free Plugs</li>
        </ul>
      </div>
    </div>
  );
}
