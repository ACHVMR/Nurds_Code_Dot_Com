import React, { useState, useMemo } from 'react';
import { TOOL_CATALOG, SHELVES, getToolsByShelf, searchTools, CLASSIFICATIONS } from '../data/toolCatalog';

/**
 * Tool Catalog - SmelterOS v4.0
 * Complete tool registry for the Deploy platform
 * Organized into 11 Shelves following the Circuit Box architecture
 */

// Star rating component
const StarRating = ({ rating }) => {
  const stars = (rating.match(/⭐/g) || []).length;
  return (
    <span title={`${stars}/5 stars`}>
      {Array(5).fill(0).map((_, i) => (
        <span 
          key={i} 
          style={{ opacity: i < stars ? 1 : 0.2 }}
        >
          ⭐
        </span>
      ))}
    </span>
  );
};

function ToolCatalog() {
  const [selectedShelf, setSelectedShelf] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTool, setSelectedTool] = useState(null);
  const [filterClassification, setFilterClassification] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Filter and sort tools
  const filteredTools = useMemo(() => {
    let tools = [...TOOL_CATALOG];
    
    // Filter by shelf
    if (selectedShelf !== 'all') {
      tools = tools.filter(t => t.shelf === selectedShelf);
    }
    
    // Filter by classification
    if (filterClassification !== 'all') {
      tools = tools.filter(t => t.classification === filterClassification);
    }
    
    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      tools = tools.filter(t => 
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query)
      );
    }
    
    // Sort
    tools.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'rating') {
        const ratingA = (a.rating.match(/⭐/g) || []).length;
        const ratingB = (b.rating.match(/⭐/g) || []).length;
        return ratingB - ratingA;
      }
      return 0;
    });
    
    return tools;
  }, [selectedShelf, searchQuery, filterClassification, sortBy]);

  // Get unique classifications
  const classifications = [...new Set(TOOL_CATALOG.map(t => t.classification))];
  
  // Get shelf counts
  const shelfCounts = useMemo(() => {
    const counts = { all: TOOL_CATALOG.length };
    Object.keys(SHELVES).forEach(shelfId => {
      counts[shelfId] = TOOL_CATALOG.filter(t => t.shelf === shelfId).length;
    });
    return counts;
  }, []);

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--bg)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--text)' }}>
            🧰 SmelterOS Tool Catalog
          </h1>
          <p className="text-xl" style={{ color: 'var(--honey-gold)', fontFamily: "'Permanent Marker', cursive" }}>
            317+ AI Tools at Your Fingertips
          </p>
          <p className="text-sm mt-2" style={{ color: 'var(--mute)' }}>
            Browse, search, and integrate tools for your Deploy agents
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="panel text-center">
            <div className="text-3xl font-bold" style={{ color: 'var(--accent)' }}>
              {TOOL_CATALOG.length}
            </div>
            <div className="text-sm" style={{ color: 'var(--mute)' }}>Total Tools</div>
          </div>
          <div className="panel text-center">
            <div className="text-3xl font-bold" style={{ color: '#00A651' }}>
              {Object.keys(SHELVES).length}
            </div>
            <div className="text-sm" style={{ color: 'var(--mute)' }}>Shelves</div>
          </div>
          <div className="panel text-center">
            <div className="text-3xl font-bold" style={{ color: '#5B7FFF' }}>
              {classifications.length}
            </div>
            <div className="text-sm" style={{ color: 'var(--mute)' }}>Categories</div>
          </div>
          <div className="panel text-center">
            <div className="text-3xl font-bold" style={{ color: '#FF5E00' }}>
              {TOOL_CATALOG.filter(t => t.featured).length}
            </div>
            <div className="text-sm" style={{ color: 'var(--mute)' }}>Featured</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="panel mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="🔍 Search tools by name, description, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field w-full"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterClassification}
                onChange={(e) => setFilterClassification(e.target.value)}
                className="input-field"
              >
                <option value="all">All Types</option>
                {classifications.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-field"
              >
                <option value="name">Sort: Name</option>
                <option value="rating">Sort: Rating</option>
              </select>
            </div>
          </div>
        </div>

        {/* Shelf Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedShelf('all')}
            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
              selectedShelf === 'all' ? 'text-black' : ''
            }`}
            style={{
              background: selectedShelf === 'all' ? 'var(--accent)' : 'var(--surface)',
              color: selectedShelf === 'all' ? '#0E0E0E' : 'var(--text)',
              border: `1px solid ${selectedShelf === 'all' ? 'var(--accent)' : 'var(--border)'}`
            }}
          >
            📦 All Shelves ({shelfCounts.all})
          </button>
          {Object.entries(SHELVES).map(([shelfId, shelf]) => (
            <button
              key={shelfId}
              onClick={() => setSelectedShelf(shelfId)}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                selectedShelf === shelfId ? 'text-black' : ''
              }`}
              style={{
                background: selectedShelf === shelfId ? 'var(--accent)' : 'var(--surface)',
                color: selectedShelf === shelfId ? '#0E0E0E' : 'var(--text)',
                border: `1px solid ${selectedShelf === shelfId ? 'var(--accent)' : 'var(--border)'}`
              }}
            >
              <span>{shelf.emoji}</span>
              <span className="hidden md:inline">{shelf.name}</span>
              <span className="text-xs opacity-70">({shelfCounts[shelfId] || 0})</span>
            </button>
          ))}
        </div>

        {/* Selected Shelf Description */}
        {selectedShelf !== 'all' && SHELVES[selectedShelf] && (
          <div 
            className="p-4 rounded-xl mb-6"
            style={{ background: 'rgba(201,164,73,0.1)', border: '1px solid rgba(201,164,73,0.3)' }}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{SHELVES[selectedShelf].emoji}</span>
              <div>
                <h3 className="font-bold" style={{ color: 'var(--text)' }}>
                  {SHELVES[selectedShelf].name}
                </h3>
                <p className="text-sm" style={{ color: 'var(--mute)' }}>
                  {SHELVES[selectedShelf].description}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Results Count */}
        <p className="text-sm mb-4" style={{ color: 'var(--mute)' }}>
          Showing {filteredTools.length} tool{filteredTools.length !== 1 ? 's' : ''}
        </p>

        {/* Tool Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {filteredTools.map(tool => {
            const classification = CLASSIFICATIONS[tool.classification] || { color: '#666', icon: '🔧' };
            
            return (
              <div
                key={tool.id}
                className="rounded-xl p-5 border transition-all cursor-pointer hover:scale-[1.02]"
                style={{
                  background: 'var(--surface)',
                  borderColor: tool.featured ? 'var(--accent)' : 'var(--border)',
                  boxShadow: tool.featured ? '0 0 20px rgba(201,164,73,0.2)' : 'none'
                }}
                onClick={() => setSelectedTool(tool)}
              >
                {/* Featured Badge */}
                {tool.featured && (
                  <div 
                    className="absolute top-2 right-2 text-xs px-2 py-1 rounded"
                    style={{ background: 'var(--accent)', color: '#0E0E0E' }}
                  >
                    ⭐ Featured
                  </div>
                )}

                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                  <div 
                    className="text-2xl p-2 rounded-lg"
                    style={{ background: `${classification.color}20` }}
                  >
                    {classification.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold truncate" style={{ color: 'var(--text)' }}>
                      {tool.name}
                    </h3>
                    <p 
                      className="text-xs px-2 py-0.5 rounded inline-block"
                      style={{ background: `${classification.color}30`, color: classification.color }}
                    >
                      {tool.classification}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--mute)' }}>
                  {tool.description}
                </p>

                {/* Rating and Tiers */}
                <div className="flex items-center justify-between">
                  <StarRating rating={tool.rating} />
                  <span 
                    className="text-xs px-2 py-1 rounded"
                    style={{ background: 'rgba(0,0,0,0.3)', color: 'var(--mute)' }}
                  >
                    {tool.tiers}
                  </span>
                </div>

                {/* Install Command */}
                {tool.install && tool.install !== 'internal' && (
                  <div 
                    className="mt-3 p-2 rounded text-xs font-mono overflow-x-auto"
                    style={{ background: 'rgba(0,0,0,0.3)' }}
                  >
                    <code style={{ color: 'var(--neon)' }}>{tool.install}</code>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* No Results */}
        {filteredTools.length === 0 && (
          <div className="panel text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <p style={{ color: 'var(--mute)' }}>No tools found matching your criteria</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedShelf('all');
                setFilterClassification('all');
              }}
              className="btn-secondary mt-4"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Tool Detail Modal */}
        {selectedTool && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
            onClick={() => setSelectedTool(null)}
          >
            <div 
              className="w-full max-w-2xl rounded-2xl p-6 max-h-[80vh] overflow-y-auto"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div 
                    className="text-4xl p-3 rounded-xl"
                    style={{ background: `${CLASSIFICATIONS[selectedTool.classification]?.color || '#666'}20` }}
                  >
                    {CLASSIFICATIONS[selectedTool.classification]?.icon || '🔧'}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                      {selectedTool.name}
                    </h2>
                    <p 
                      className="text-sm"
                      style={{ color: CLASSIFICATIONS[selectedTool.classification]?.color || '#666' }}
                    >
                      {selectedTool.classification} · {selectedTool.category}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTool(null)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  style={{ color: 'var(--mute)' }}
                >
                  ✕
                </button>
              </div>

              {/* Description */}
              <p className="text-lg mb-6" style={{ color: 'var(--mute)' }}>
                {selectedTool.description}
              </p>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)' }}>
                  <p className="text-xs mb-1" style={{ color: 'var(--mute)' }}>Rating</p>
                  <StarRating rating={selectedTool.rating} />
                </div>
                <div className="p-4 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)' }}>
                  <p className="text-xs mb-1" style={{ color: 'var(--mute)' }}>Tier Availability</p>
                  <p className="font-bold" style={{ color: 'var(--text)' }}>{selectedTool.tiers}</p>
                </div>
                <div className="p-4 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)' }}>
                  <p className="text-xs mb-1" style={{ color: 'var(--mute)' }}>Type</p>
                  <p className="font-medium" style={{ color: 'var(--text)' }}>
                    {selectedTool.ossSaas === '✅' ? 'Open Source' : 
                     selectedTool.ossSaas === 'SaaS' ? 'SaaS' : 
                     'Internal'}
                  </p>
                </div>
                {selectedTool.stars && (
                  <div className="p-4 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)' }}>
                    <p className="text-xs mb-1" style={{ color: 'var(--mute)' }}>GitHub Stars</p>
                    <p className="font-bold" style={{ color: '#FFD700' }}>⭐ {selectedTool.stars}</p>
                  </div>
                )}
              </div>

              {/* Install Command */}
              {selectedTool.install && selectedTool.install !== 'internal' && (
                <div className="mb-6">
                  <p className="text-sm mb-2" style={{ color: 'var(--mute)' }}>Install / Access:</p>
                  <div 
                    className="p-4 rounded-xl font-mono text-sm flex items-center justify-between"
                    style={{ background: 'rgba(0,0,0,0.5)' }}
                  >
                    <code style={{ color: 'var(--neon)' }}>{selectedTool.install}</code>
                    <button
                      onClick={() => navigator.clipboard.writeText(selectedTool.install)}
                      className="px-3 py-1 rounded text-xs"
                      style={{ background: 'var(--accent)', color: '#0E0E0E' }}
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}

              {/* Similar Tools */}
              {selectedTool.similar && selectedTool.similar.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm mb-2" style={{ color: 'var(--mute)' }}>Similar Tools:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTool.similar.map(s => (
                      <span 
                        key={s}
                        className="px-3 py-1 rounded-full text-sm"
                        style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text)' }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  className="flex-1 py-3 rounded-xl font-bold transition-all"
                  style={{ background: 'var(--accent)', color: '#0E0E0E' }}
                >
                  📋 Add to Agent
                </button>
                <button
                  onClick={() => setSelectedTool(null)}
                  className="px-6 py-3 rounded-xl font-bold transition-all"
                  style={{ background: 'var(--border)', color: 'var(--text)' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ToolCatalog;
