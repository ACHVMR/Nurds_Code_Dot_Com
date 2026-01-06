import React, { useState } from 'react';
import './ModelSelector.css';
import MODEL_GARDEN, { getModelsByCapability, getModelsByTier } from '../../config/model-garden';

/**
 * ModelSelector - Genspark-style model selection interface
 * Allows users to choose from open-source and closed-source models
 */
export default function ModelSelector({ 
  selectedModel, 
  onSelectModel, 
  capability = null,
  showPricing = true,
  compact = false 
}) {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetails, setShowDetails] = useState(null);

  const allModels = {
    ...MODEL_GARDEN.closedSource,
    ...MODEL_GARDEN.openSource
  };

  const getFilteredModels = () => {
    let models = Object.entries(allModels);

    // Filter by tab
    if (activeTab === 'open') {
      models = Object.entries(MODEL_GARDEN.openSource);
    } else if (activeTab === 'closed') {
      models = Object.entries(MODEL_GARDEN.closedSource);
    } else if (activeTab === 'fast') {
      models = models.filter(([_, m]) => m.speed === 'fast' || m.speed === 'ultra-fast');
    } else if (activeTab === 'budget') {
      models = models.filter(([_, m]) => m.tier === 'budget' || m.tier === 'standard');
    }

    // Filter by capability if specified
    if (capability) {
      models = models.filter(([_, m]) => m.capabilities?.includes(capability));
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      models = models.filter(([id, m]) => 
        id.toLowerCase().includes(query) || 
        m.name.toLowerCase().includes(query) ||
        m.provider.toLowerCase().includes(query)
      );
    }

    return models;
  };

  const filteredModels = getFilteredModels();

  const getSpeedBadge = (speed) => {
    const badges = {
      'ultra-fast': { label: '⚡ Ultra Fast', class: 'speed-ultra' },
      'fast': { label: '🚀 Fast', class: 'speed-fast' },
      'medium': { label: '⏱️ Medium', class: 'speed-medium' },
      'slow': { label: '🐢 Slow', class: 'speed-slow' }
    };
    return badges[speed] || badges.medium;
  };

  const getTierBadge = (tier) => {
    const badges = {
      'budget': { label: '💚 Budget', class: 'tier-budget' },
      'standard': { label: '💙 Standard', class: 'tier-standard' },
      'premium': { label: '💜 Premium', class: 'tier-premium' },
      'enterprise': { label: '🏆 Enterprise', class: 'tier-enterprise' }
    };
    return badges[tier] || badges.standard;
  };

  return (
    <div className={`model-selector ${compact ? 'compact' : ''}`}>
      {/* Header */}
      <div className="selector-header">
        <h3>🧠 Model Garden</h3>
        <div className="model-search">
          <input
            type="text"
            placeholder="Search models..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="model-tabs">
        <button 
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Models
        </button>
        <button 
          className={`tab ${activeTab === 'open' ? 'active' : ''}`}
          onClick={() => setActiveTab('open')}
        >
          🔓 Open Source
        </button>
        <button 
          className={`tab ${activeTab === 'closed' ? 'active' : ''}`}
          onClick={() => setActiveTab('closed')}
        >
          🔒 Closed Source
        </button>
        <button 
          className={`tab ${activeTab === 'fast' ? 'active' : ''}`}
          onClick={() => setActiveTab('fast')}
        >
          ⚡ Fastest
        </button>
        <button 
          className={`tab ${activeTab === 'budget' ? 'active' : ''}`}
          onClick={() => setActiveTab('budget')}
        >
          💰 Budget
        </button>
      </div>

      {/* Model Grid */}
      <div className="model-grid">
        {filteredModels.map(([modelId, model]) => (
          <div 
            key={modelId}
            className={`model-card ${selectedModel === modelId ? 'selected' : ''}`}
            onClick={() => onSelectModel(modelId)}
          >
            <div className="model-card-header">
              <div className="model-provider">{model.provider.split('|')[0]}</div>
              <div className={`model-tier ${getTierBadge(model.tier).class}`}>
                {getTierBadge(model.tier).label}
              </div>
            </div>
            
            <h4 className="model-name">{model.name}</h4>
            <p className="model-description">{model.description}</p>
            
            <div className="model-meta">
              <span className={`model-speed ${getSpeedBadge(model.speed).class}`}>
                {getSpeedBadge(model.speed).label}
              </span>
              {model.license && (
                <span className="model-license">📜 {model.license}</span>
              )}
            </div>

            {showPricing && (
              <div className="model-pricing">
                <span className="price-input">
                  ${(model.inputCost * 1000).toFixed(2)}/1M in
                </span>
                <span className="price-output">
                  ${(model.outputCost * 1000).toFixed(2)}/1M out
                </span>
              </div>
            )}

            {model.capabilities && (
              <div className="model-capabilities">
                {model.capabilities.slice(0, 4).map(cap => (
                  <span key={cap} className="capability-badge">{cap}</span>
                ))}
              </div>
            )}

            {selectedModel === modelId && (
              <div className="selected-indicator">✓ Selected</div>
            )}
          </div>
        ))}
      </div>

      {filteredModels.length === 0 && (
        <div className="no-models">
          No models found matching your criteria.
        </div>
      )}
    </div>
  );
}
