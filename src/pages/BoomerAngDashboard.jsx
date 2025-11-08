import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Grid, List, Star, TrendingUp, Clock, ShoppingCart } from 'lucide-react';
import BoomerAngCard from '../components/BoomerAngCard';
import BoomerAngEditor from '../components/BoomerAngEditor';
import { fetchAuthed } from '../utils/fetchAuthed';

/**
 * BOOMER_ANG DASHBOARD
 * Central hub for AI Agents (Boomer_Angs)
 * Features: My Agents, Premade Library, Sandbox, Marketplace
 */

export function BoomerAngDashboard() {
  const [activeTab, setActiveTab] = useState('my-agents'); // my-agents, premade, sandbox, marketplace
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [sortBy, setSortBy] = useState('recent'); // recent, popular, rating, price

  const [myBoomerAngs, setMyBoomerAngs] = useState([]);
  const [premadeBoomerAngs, setPremadeBoomerAngs] = useState([]);
  const [marketplaceBoomerAngs, setMarketplaceBoomerAngs] = useState([]);
  const [sandboxBoomerAngs, setSandboxBoomerAngs] = useState([]);

  const [showEditor, setShowEditor] = useState(false);
  const [editingBoomerAng, setEditingBoomerAng] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userTier, setUserTier] = useState('free'); // free, pro, enterprise

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [myAgents, premade, marketplace, sandbox, profile] = await Promise.all([
        fetchAuthed('/api/boomer-angs/my-agents'),
        fetchAuthed('/api/boomer-angs/premade'),
        fetchAuthed('/api/boomer-angs/marketplace'),
        fetchAuthed('/api/boomer-angs/sandbox'),
        fetchAuthed('/api/profile'),
      ]);

      setMyBoomerAngs(myAgents);
      setPremadeBoomerAngs(premade);
      setMarketplaceBoomerAngs(marketplace);
      setSandboxBoomerAngs(sandbox);
      setUserTier(profile.tier || 'free');
    } catch (error) {
      console.error('Failed to load Boomer_Angs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingBoomerAng(null);
    setShowEditor(true);
  };

  const handleEdit = (boomerAng) => {
    setEditingBoomerAng(boomerAng);
    setShowEditor(true);
  };

  const handleSave = async (formData) => {
    try {
      const url = editingBoomerAng
        ? `/api/boomer-angs/${editingBoomerAng.id}`
        : '/api/boomer-angs';
      
      const method = editingBoomerAng ? 'PUT' : 'POST';

      const response = await fetchAuthed(url, {
        method,
        body: JSON.stringify(formData),
      });

      if (editingBoomerAng) {
        setMyBoomerAngs(prev => 
          prev.map(ba => ba.id === editingBoomerAng.id ? response : ba)
        );
      } else {
        setMyBoomerAngs(prev => [response, ...prev]);
      }

      setShowEditor(false);
      setEditingBoomerAng(null);
    } catch (error) {
      console.error('Failed to save Boomer_Ang:', error);
      alert('Failed to save. Please try again.');
    }
  };

  const handleDelete = async (boomerAng) => {
    if (!confirm(`Delete "${boomerAng.name}"? This cannot be undone.`)) return;

    try {
      await fetchAuthed(`/api/boomer-angs/${boomerAng.id}`, { method: 'DELETE' });
      setMyBoomerAngs(prev => prev.filter(ba => ba.id !== boomerAng.id));
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Failed to delete. Please try again.');
    }
  };

  const handleClone = async (boomerAng) => {
    try {
      const response = await fetchAuthed(`/api/boomer-angs/${boomerAng.id}/clone`, {
        method: 'POST',
      });
      setMyBoomerAngs(prev => [response, ...prev]);
    } catch (error) {
      console.error('Failed to clone:', error);
      alert('Failed to clone. Please try again.');
    }
  };

  const handleAddToSandbox = async (boomerAng) => {
    try {
      const response = await fetchAuthed('/api/boomer-angs/sandbox/add', {
        method: 'POST',
        body: JSON.stringify({ boomerAngId: boomerAng.id }),
      });
      setSandboxBoomerAngs(prev => [response, ...prev]);
      setActiveTab('sandbox');
    } catch (error) {
      console.error('Failed to add to sandbox:', error);
      alert('Failed to add to sandbox. Please try again.');
    }
  };

  const handleBuy = async (boomerAng) => {
    // Integrate with payment system
    try {
      const response = await fetchAuthed(`/api/boomer-angs/${boomerAng.id}/purchase`, {
        method: 'POST',
      });
      setMyBoomerAngs(prev => [response, ...prev]);
      alert('Purchase successful! Boomer_Ang added to your collection.');
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Purchase failed. Please try again.');
    }
  };

  const handleRent = async (boomerAng) => {
    try {
      const response = await fetchAuthed(`/api/boomer-angs/${boomerAng.id}/rent`, {
        method: 'POST',
      });
      setMyBoomerAngs(prev => [response, ...prev]);
      alert('Rental activated! Boomer_Ang available for 30 days.');
    } catch (error) {
      console.error('Rental failed:', error);
      alert('Rental failed. Please try again.');
    }
  };

  const handleDeploy = async (id, isRunning) => {
    try {
      await fetchAuthed(`/api/boomer-angs/${id}/deploy`, {
        method: 'POST',
        body: JSON.stringify({ isRunning }),
      });
      // Update status in state
      setMyBoomerAngs(prev =>
        prev.map(ba => (ba.id === id ? { ...ba, status: isRunning ? 'running' : 'stopped' } : ba))
      );
    } catch (error) {
      console.error('Deploy failed:', error);
    }
  };

  // Filter and sort data
  const getFilteredAndSortedData = (data) => {
    let filtered = data;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(ba =>
        ba.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ba.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ba.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(ba => ba.category === filterCategory);
    }

    // Level filter
    if (filterLevel !== 'all') {
      filtered = filtered.filter(ba => ba.effectivenessLevel === filterLevel);
    }

    // Sort
    if (sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
    } else if (sortBy === 'popular') {
      filtered.sort((a, b) => (b.totalRuns || 0) - (a.totalRuns || 0));
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'price') {
      filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
    }

    return filtered;
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'my-agents':
        return getFilteredAndSortedData(myBoomerAngs);
      case 'premade':
        return getFilteredAndSortedData(premadeBoomerAngs);
      case 'sandbox':
        return getFilteredAndSortedData(sandboxBoomerAngs);
      case 'marketplace':
        return getFilteredAndSortedData(marketplaceBoomerAngs);
      default:
        return [];
    }
  };

  const currentData = getCurrentData();

  const tabs = [
    { id: 'my-agents', label: 'My Boomer_Angs', icon: Star, count: myBoomerAngs.length },
    { id: 'premade', label: 'Premade Library', icon: TrendingUp, count: premadeBoomerAngs.length },
    { id: 'sandbox', label: 'Testing Lab', icon: Clock, count: sandboxBoomerAngs.length },
    { id: 'marketplace', label: 'Creator Economy', icon: ShoppingCart, count: marketplaceBoomerAngs.length },
  ];

  const categories = ['all', 'General', 'Coding Assistant', 'Data Analysis', 'Content Creation', 'Customer Support'];
  const levels = ['all', 'Basic', 'Advanced', 'Premium', 'Enterprise'];

  if (showEditor) {
    return (
      <BoomerAngEditor
        boomerAng={editingBoomerAng}
        userTier={userTier}
        onSave={handleSave}
        onCancel={() => {
          setShowEditor(false);
          setEditingBoomerAng(null);
        }}
      />
    );
  }

  return (
    <div className="boomer-ang-dashboard min-h-screen bg-[#0F0F0F] text-white p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#E68961] to-[#D4A05F] bg-clip-text text-transparent mb-2">
              Boomer_Ang Dashboard
            </h1>
            <p className="text-gray-400">Manage, create, and deploy your AI Boomer_Angs</p>
          </div>
          {activeTab === 'my-agents' && (
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-2 px-6 py-3 bg-[#E68961] hover:bg-[#D4A05F] text-black font-bold rounded-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              Create New Boomer_Ang
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-700 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 font-semibold border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-[#E68961] text-[#E68961]'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                <span className="px-2 py-0.5 bg-[#2a2a2a] rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filters & Search */}
        <div className="flex flex-wrap gap-4 mb-6">
          {/* Search */}
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, description, or tags..."
                className="w-full pl-12 pr-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-[#E68961] focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:border-[#E68961] focus:outline-none transition-all"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>

          {/* Level Filter */}
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="px-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:border-[#E68961] focus:outline-none transition-all"
          >
            {levels.map(level => (
              <option key={level} value={level}>
                {level === 'all' ? 'All Levels' : level}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:border-[#E68961] focus:outline-none transition-all"
          >
            <option value="recent">Most Recent</option>
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="price">Lowest Price</option>
          </select>

          {/* View Toggle */}
          <div className="flex gap-2 bg-[#1a1a1a] border border-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-[#E68961] text-black' : 'text-gray-400'}`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-[#E68961] text-black' : 'text-gray-400'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-[#E68961] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-400">Loading Boomer_Angs...</p>
          </div>
        ) : currentData.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No Boomer_Angs Found</h3>
            <p className="text-gray-400 mb-6">
              {activeTab === 'my-agents'
                ? 'Create your first Boomer_Ang to get started'
                : 'Try adjusting your filters or search query'}
            </p>
            {activeTab === 'my-agents' && (
              <button
                onClick={handleCreateNew}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#E68961] hover:bg-[#D4A05F] text-black font-bold rounded-lg transition-all"
              >
                <Plus className="w-5 h-5" />
                Create Your First Boomer_Ang
              </button>
            )}
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }
          >
            {currentData.map(boomerAng => (
              <BoomerAngCard
                key={boomerAng.id}
                boomerAng={boomerAng}
                mode={activeTab === 'marketplace' ? 'marketplace' : activeTab === 'sandbox' ? 'sandbox' : 'view'}
                onEdit={handleEdit}
                onClone={handleClone}
                onDelete={handleDelete}
                onDeploy={handleDeploy}
                onRent={handleRent}
                onBuy={handleBuy}
                onAddToSandbox={handleAddToSandbox}
                className={viewMode === 'list' ? 'max-w-full' : ''}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BoomerAngDashboard;
