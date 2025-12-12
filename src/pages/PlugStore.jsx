import React, { useState, useEffect } from 'react';
import './PlugStore.css';
import PlugCard from '../components/plugstore/PlugCard';
import PlugFilters from '../components/plugstore/PlugFilters';
import PlugDetail from '../components/plugstore/PlugDetail';
import { PLUG_CATEGORIES, SUPPORTED_LANGUAGES } from '../config/creator-economy';

/**
 * Plug Store - Creator Economy Marketplace
 * The App Store for Vibe-Coded Applications
 */
export default function PlugStore() {
  const [plugs, setPlugs] = useState([]);
  const [filteredPlugs, setFilteredPlugs] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPlug, setSelectedPlug] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [priceFilter, setPriceFilter] = useState('all');
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(true);

  // Mock featured plugs (would come from API)
  const mockPlugs = [
    {
      id: 'smelter-os',
      name: 'SmelterOS',
      tagline: 'AVVA NOON\'s Proprietary Creative OS',
      description: 'A proprietary operating system designed for AVVA NOON to grow and create without limits.',
      creator: { name: 'NurdsCode', avatar: '🔥', verified: true },
      thumbnail: 'https://storage.nurdscode.com/plugs/smelteros.jpg',
      category: 'productivity',
      price: 299,
      pricingModel: 'one_time',
      rating: 4.9,
      reviews: 128,
      downloads: 5420,
      tags: ['os', 'creative', 'enterprise'],
      featured: true
    },
    {
      id: 'footprint-ai',
      name: 'Footprint AI',
      tagline: 'Reverse-hack the hackers',
      description: 'Advanced tracking application that reverse hacks attackers and pinpoints their digital footprint.',
      creator: { name: 'SecurityNurd', avatar: '🔒', verified: true },
      thumbnail: 'https://storage.nurdscode.com/plugs/footprint-ai.jpg',
      category: 'security',
      price: 149,
      pricingModel: 'subscription',
      rating: 4.8,
      reviews: 89,
      downloads: 3200,
      tags: ['security', 'tracking', 'ai'],
      featured: true
    },
    {
      id: 'bid-plug',
      name: 'Bid Plug',
      tagline: 'Smart bidding automation',
      description: 'Automated bidding system for auctions and marketplaces with AI-powered strategy.',
      creator: { name: 'BizBuilder', avatar: '💰', verified: false },
      thumbnail: '',
      category: 'business',
      price: 49,
      pricingModel: 'one_time',
      rating: 4.5,
      reviews: 34,
      downloads: 890,
      tags: ['bidding', 'automation', 'business']
    },
    {
      id: 'crew-plug',
      name: 'Crew Plug',
      tagline: 'Team collaboration simplified',
      description: 'Manage your team, assign tasks, and collaborate in real-time with military precision.',
      creator: { name: 'TeamNurd', avatar: '👥', verified: true },
      thumbnail: '',
      category: 'productivity',
      price: 19,
      pricingModel: 'subscription',
      rating: 4.7,
      reviews: 156,
      downloads: 4500,
      tags: ['team', 'collaboration', 'project']
    },
    {
      id: 'vibe-sync-boomer',
      name: 'Vibe Sync Boomer-Ang',
      tagline: 'Tune your tasks. Feel the flow.',
      description: 'AI-powered task orchestration with strategist, executor, and automator modes.',
      creator: { name: 'FlowMaster', avatar: '🎯', verified: true },
      thumbnail: '',
      category: 'ai_tools',
      price: 0,
      pricingModel: 'freemium',
      rating: 4.6,
      reviews: 203,
      downloads: 8900,
      tags: ['automation', 'workflow', 'ai'],
      featured: true
    }
  ];

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setPlugs(mockPlugs);
      setFilteredPlugs(mockPlugs);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    let result = [...plugs];

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.tagline.toLowerCase().includes(query) ||
        p.tags.some(t => t.toLowerCase().includes(query))
      );
    }

    // Price filter
    if (priceFilter === 'free') {
      result = result.filter(p => p.price === 0);
    } else if (priceFilter === 'paid') {
      result = result.filter(p => p.price > 0);
    }

    // Sort
    if (sortBy === 'popular') {
      result.sort((a, b) => b.downloads - a.downloads);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    }

    setFilteredPlugs(result);
  }, [plugs, selectedCategory, searchQuery, sortBy, priceFilter]);

  if (selectedPlug) {
    return (
      <PlugDetail 
        plug={selectedPlug} 
        onBack={() => setSelectedPlug(null)} 
        language={language}
      />
    );
  }

  return (
    <div className="plug-store">
      {/* Hero */}
      <div className="store-hero">
        <h1>🔌 Plug Store</h1>
        <p className="store-tagline">The Creator Economy Marketplace</p>
        <p className="store-subtitle">Discover, buy, and deploy vibe-coded applications</p>

        {/* Search Bar */}
        <div className="hero-search">
          <input
            type="text"
            placeholder="Search plugs, creators, or categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button className="search-btn">🔍</button>
        </div>

        {/* Language Switcher */}
        <div className="language-switcher">
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            className="lang-select"
          >
            {SUPPORTED_LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.native} ({lang.name})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Featured Section */}
      <section className="featured-section">
        <h2>⭐ Featured Plugs</h2>
        <div className="featured-grid">
          {plugs.filter(p => p.featured).map(plug => (
            <PlugCard 
              key={plug.id} 
              plug={plug} 
              onClick={() => setSelectedPlug(plug)}
              featured
            />
          ))}
        </div>
      </section>

      {/* Main Content */}
      <div className="store-content">
        {/* Sidebar Filters */}
        <aside className="store-sidebar">
          <PlugFilters
            categories={PLUG_CATEGORIES}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            priceFilter={priceFilter}
            onPriceChange={setPriceFilter}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        </aside>

        {/* Plug Grid */}
        <main className="store-main">
          <div className="results-header">
            <span className="results-count">{filteredPlugs.length} Plugs found</span>
          </div>

          {loading ? (
            <div className="loading-grid">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="plug-skeleton"></div>
              ))}
            </div>
          ) : (
            <div className="plug-grid">
              {filteredPlugs.map(plug => (
                <PlugCard 
                  key={plug.id} 
                  plug={plug}
                  onClick={() => setSelectedPlug(plug)}
                />
              ))}
            </div>
          )}

          {!loading && filteredPlugs.length === 0 && (
            <div className="no-results">
              <span className="no-results-icon">🔍</span>
              <h3>No plugs found</h3>
              <p>Try adjusting your filters or search query</p>
            </div>
          )}
        </main>
      </div>

      {/* CTA for Creators */}
      <section className="creator-cta">
        <div className="cta-content">
          <h2>🚀 Become a Creator</h2>
          <p>Build apps with NurdsCode V.I.B.E. IDE and sell them on the Plug Store</p>
          <div className="cta-buttons">
            <button className="cta-primary">Start Building</button>
            <button className="cta-secondary">Learn More</button>
          </div>
        </div>
      </section>
    </div>
  );
}
