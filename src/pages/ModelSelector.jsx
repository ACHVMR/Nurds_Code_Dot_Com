import React, { useState, useEffect } from 'react';
import { Search, Filter, TrendingUp, Zap, DollarSign, Clock, Layers } from 'lucide-react';

function ModelSelector() {
  const [models, setModels] = useState([]);
  const [filteredModels, setFilteredModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    provider: 'all',
    maxCost: 100,
    minContextWindow: 0,
    modality: 'all',
  });
  const [sortBy, setSortBy] = useState('popularity');

  const providers = ['all', 'openai', 'anthropic', 'google', 'meta', 'mistral', 'cohere', 'groq', 'other'];
  const modalities = ['all', 'text', 'vision', 'audio', 'multimodal'];

  useEffect(() => {
    fetchModels();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [models, searchQuery, filters, sortBy]);

  const fetchModels = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/models/openrouter', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch models');
      }

      const data = await response.json();
      setModels(data.models || []);
    } catch (err) {
      console.error('Error fetching models:', err);
      // Fallback to sample data
      setModels(getSampleModels());
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = models;

    // Search
    if (searchQuery) {
      filtered = filtered.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Provider filter
    if (filters.provider !== 'all') {
      filtered = filtered.filter(m => m.provider === filters.provider);
    }

    // Cost filter
    filtered = filtered.filter(m => (m.pricing?.prompt || 0) * 1000000 <= filters.maxCost);

    // Context window filter
    filtered = filtered.filter(m => (m.context_length || 0) >= filters.minContextWindow);

    // Modality filter
    if (filters.modality !== 'all') {
      filtered = filtered.filter(m => m.modality === filters.modality);
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'popularity':
          return (b.popularity || 0) - (a.popularity || 0);
        case 'cost-asc':
          return (a.pricing?.prompt || 0) - (b.pricing?.prompt || 0);
        case 'cost-desc':
          return (b.pricing?.prompt || 0) - (a.pricing?.prompt || 0);
        case 'context-asc':
          return (a.context_length || 0) - (b.context_length || 0);
        case 'context-desc':
          return (b.context_length || 0) - (a.context_length || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    setFilteredModels(filtered);
  };

  const selectModel = async (modelId) => {
    try {
      const response = await fetch('/api/models/select', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ modelId }),
      });

      if (!response.ok) {
        throw new Error('Failed to select model');
      }

      alert('Model added to your available models!');
    } catch (err) {
      alert(`Failed to select model: ${err.message}`);
    }
  };

  const formatPrice = (pricePerToken) => {
    if (!pricePerToken) return 'Free';
    const pricePerMillion = pricePerToken * 1000000;
    return `$${pricePerMillion.toFixed(2)}/1M tokens`;
  };

  const getSampleModels = () => [
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'openai', pricing: { prompt: 0.00001 }, context_length: 128000, modality: 'text', popularity: 95 },
    { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'anthropic', pricing: { prompt: 0.000015 }, context_length: 200000, modality: 'text', popularity: 90 },
    { id: 'gemini-pro', name: 'Gemini Pro', provider: 'google', pricing: { prompt: 0.000001 }, context_length: 30720, modality: 'multimodal', popularity: 85 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E68961]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Layers className="w-8 h-8 text-[#E68961]" />
            <h1 className="text-4xl font-bold">Model Selector</h1>
          </div>
          <p className="text-gray-400">
            Choose from 300-500 models via OpenRouter (Super Admin Only)
          </p>
        </div>

        {/* Search & Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="md:col-span-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search models..."
                className="flex-1 bg-transparent text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Layers className="w-5 h-5 text-[#E68961]" />
              <span className="text-sm text-gray-400">Total Models</span>
            </div>
            <p className="text-2xl font-bold">{models.length}</p>
          </div>

          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Filter className="w-5 h-5 text-[#E68961]" />
              <span className="text-sm text-gray-400">Filtered</span>
            </div>
            <p className="text-2xl font-bold">{filteredModels.length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Provider */}
            <div>
              <label className="block text-sm font-semibold mb-2">Provider</label>
              <select
                value={filters.provider}
                onChange={(e) => setFilters({ ...filters, provider: e.target.value })}
                className="w-full bg-[#2a2a2a] text-white px-4 py-2 rounded-lg border border-[#3a3a3a] focus:outline-none focus:border-[#E68961]"
              >
                {providers.map(p => (
                  <option key={p} value={p}>{p === 'all' ? 'All Providers' : p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </div>

            {/* Max Cost */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Max Cost: ${filters.maxCost}/1M
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={filters.maxCost}
                onChange={(e) => setFilters({ ...filters, maxCost: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>

            {/* Min Context Window */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Min Context: {filters.minContextWindow.toLocaleString()}
              </label>
              <input
                type="range"
                min="0"
                max="200000"
                step="10000"
                value={filters.minContextWindow}
                onChange={(e) => setFilters({ ...filters, minContextWindow: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>

            {/* Modality */}
            <div>
              <label className="block text-sm font-semibold mb-2">Modality</label>
              <select
                value={filters.modality}
                onChange={(e) => setFilters({ ...filters, modality: e.target.value })}
                className="bg-[#2a2a2a] text-white px-4 py-2 rounded-lg border border-[#3a3a3a] focus:outline-none focus:border-[#E68961]"
              >
                {modalities.map(m => (
                  <option key={m} value={m}>{m === 'all' ? 'All Modalities' : m.charAt(0).toUpperCase() + m.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[#2a2a2a] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#2a2a2a] text-white px-4 py-2 rounded-lg border border-[#3a3a3a] focus:outline-none focus:border-[#39FF14]"
              >
                <option value="popularity">Popularity</option>
                <option value="cost-asc">Cost (Low to High)</option>
                <option value="cost-desc">Cost (High to Low)</option>
                <option value="context-asc">Context (Small to Large)</option>
                <option value="context-desc">Context (Large to Small)</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>

            <button
              onClick={() => {
                setSearchQuery('');
                setFilters({ provider: 'all', maxCost: 100, minContextWindow: 0, modality: 'all' });
                setSortBy('popularity');
              }}
              className="px-4 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Model Cards */}
        {filteredModels.length === 0 ? (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-12 text-center">
            <p className="text-gray-500">No models match your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredModels.map((model) => (
              <div
                key={model.id}
                className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 hover:border-[#E68961] transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold mb-1">{model.name}</h3>
                    <p className="text-sm text-gray-400 capitalize">{model.provider}</p>
                  </div>
                  {model.popularity && model.popularity >= 80 && (
                    <div className="flex items-center gap-1 text-xs bg-[#E68961]/10 text-[#E68961] px-2 py-1 rounded-full">
                      <TrendingUp className="w-3 h-3" />
                      <span>Popular</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400 flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      Price:
                    </span>
                    <span className="font-mono">{formatPrice(model.pricing?.prompt)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Context:
                    </span>
                    <span className="font-mono">{(model.context_length || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400 flex items-center gap-1">
                      <Zap className="w-4 h-4" />
                      Modality:
                    </span>
                    <span className="capitalize">{model.modality || 'text'}</span>
                  </div>
                </div>

                <button
                  onClick={() => selectModel(model.id)}
                  className="w-full px-4 py-2 bg-[#E68961] text-black rounded-lg font-semibold hover:bg-[#D4A05F] transition-colors"
                >
                  Add Model
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ModelSelector;
