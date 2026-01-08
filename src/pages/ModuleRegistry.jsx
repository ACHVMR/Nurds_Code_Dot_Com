/**
 * Module Registry Dashboard
 * Displays all Nurds Code Plugs with unlock status and progression
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';

// Module Card Component
function ModuleCard({ module, userLevel, onUnlock }) {
  const isUnlocked = module.access_status === 'active';
  const canUnlock = module.can_unlock && module.can_afford;
  const meetsLevel = userLevel >= module.min_level_required;

  const getCategoryColor = (category) => {
    switch (category) {
      case 'core': return 'border-accent';
      case 'agent': return 'border-neon';
      case 'integration': return 'border-purple-500';
      default: return 'border-gray-700';
    }
  };

  const getCategoryBadge = (category) => {
    switch (category) {
      case 'core': return 'bg-accent/20 text-accent';
      case 'agent': return 'bg-neon/20 text-neon';
      case 'integration': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-gray-700/20 text-gray-400';
    }
  };

  return (
    <div 
      className={`
        relative border-2 rounded-xl p-6 transition-all duration-300
        ${isUnlocked ? getCategoryColor(module.category) : 'border-gray-800'}
        ${isUnlocked ? 'bg-gray-900/50' : 'bg-gray-900/30'}
        hover:shadow-lg hover:shadow-accent/10
      `}
    >
      {/* Status Badge */}
      <div className="absolute top-4 right-4">
        {isUnlocked ? (
          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-mono rounded">
            UNLOCKED
          </span>
        ) : (
          <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-mono rounded">
            LOCKED
          </span>
        )}
      </div>

      {/* Category Badge */}
      <span className={`px-2 py-1 text-xs font-mono rounded ${getCategoryBadge(module.category)}`}>
        {module.category?.toUpperCase()}
      </span>

      {/* Icon & Name */}
      <div className="flex items-center gap-4 mt-4 mb-3">
        <div className="w-14 h-14 rounded-lg bg-gray-800 flex items-center justify-center overflow-hidden">
          {module.icon_url ? (
            <img 
              src={module.icon_url} 
              alt={module.name} 
              className="w-10 h-10 object-contain"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <span className="text-2xl">🔌</span>
          )}
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">{module.name}</h3>
          <p className="text-sm text-gray-400">v{module.version}</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
        {module.description}
      </p>

      {/* Requirements */}
      <div className="flex gap-4 text-xs text-gray-500 mb-4">
        <span className={meetsLevel ? 'text-green-400' : 'text-red-400'}>
          LVL {module.min_level_required}+
        </span>
        {module.unlock_cost_credits > 0 && (
          <span className={module.can_afford ? 'text-green-400' : 'text-yellow-400'}>
            {module.unlock_cost_credits} CREDITS
          </span>
        )}
        {module.is_standalone && (
          <span className="text-neon">STANDALONE</span>
        )}
      </div>

      {/* Action Button */}
      {isUnlocked ? (
        <button 
          onClick={() => window.location.href = module.route_path}
          className="
            w-full py-3 px-4 rounded-lg font-mono font-bold
            bg-gradient-to-r from-accent to-orange-600
            hover:from-orange-600 hover:to-accent
            text-white transition-all duration-300
            shadow-lg shadow-accent/20
          "
        >
          OPEN TOOL_
        </button>
      ) : canUnlock ? (
        <button 
          onClick={() => onUnlock(module)}
          className="
            w-full py-3 px-4 rounded-lg font-mono font-bold
            bg-gradient-to-r from-neon to-cyan-600
            hover:from-cyan-600 hover:to-neon
            text-black transition-all duration-300
          "
        >
          UNLOCK ({module.unlock_cost_credits} CREDITS)
        </button>
      ) : (
        <div className="
          w-full py-3 px-4 rounded-lg font-mono text-center
          bg-gray-800 border border-red-900/50 text-red-400 text-sm
        ">
          {!meetsLevel 
            ? `REQUIRES LVL ${module.min_level_required}` 
            : 'INSUFFICIENT CREDITS'}
        </div>
      )}
    </div>
  );
}

// Progression Bar Component
function ProgressionBar({ level, xp, xpToNext, credits, tier }) {
  const progressPercent = xpToNext > 0 ? ((1000 - xpToNext) / 1000) * 100 : 100;

  return (
    <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6 mb-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Level */}
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-accent/20 border-2 border-accent flex items-center justify-center">
            <span className="text-2xl font-bold text-accent">{level}</span>
          </div>
          <div>
            <p className="text-sm text-gray-400">LEVEL</p>
            <p className="text-white font-bold">
              {level === 1 && 'Star Coder'}
              {level === 2 && 'Satellite Dev'}
              {level === 3 && 'Nebula Builder'}
              {level === 4 && 'Galaxy Architect'}
              {level >= 5 && 'Universe Creator'}
            </p>
          </div>
        </div>

        {/* XP Progress */}
        <div className="flex-1 min-w-[200px] max-w-md">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>XP PROGRESS</span>
            <span>{1000 - xpToNext} / 1000</span>
          </div>
          <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-accent to-neon rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Credits */}
        <div className="text-center px-6 py-2 bg-gray-800 rounded-lg border border-neon/30">
          <p className="text-xs text-gray-400">CREDITS</p>
          <p className="text-2xl font-bold text-neon">{credits}</p>
        </div>

        {/* Tier */}
        <div className="text-center px-6 py-2 bg-gray-800 rounded-lg">
          <p className="text-xs text-gray-400">TIER</p>
          <p className="text-lg font-bold text-white uppercase">{tier}</p>
        </div>
      </div>
    </div>
  );
}

// Main Module Registry Page
export default function ModuleRegistry() {
  const { getToken, isSignedIn } = useAuth();
  const [modules, setModules] = useState([]);
  const [user, setUser] = useState({ level: 1, credits: 0, xp: 0, tier: 'free' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [unlocking, setUnlocking] = useState(null);

  // Fetch modules and user data
  useEffect(() => {
    fetchModules();
  }, [isSignedIn]);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const token = isSignedIn ? await getToken() : null;
      
      const response = await fetch('/api/modules', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });

      if (!response.ok) throw new Error('Failed to fetch modules');

      const data = await response.json();
      setModules(data.modules || []);
      setUser(data.user || { level: 1, credits: 0, xp: 0, tier: 'free' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async (module) => {
    if (!isSignedIn) {
      window.location.href = '/auth/login';
      return;
    }

    try {
      setUnlocking(module.id);
      const token = await getToken();

      const response = await fetch(`/api/modules/${module.id}/unlock`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to unlock module');
        return;
      }

      // Refresh modules
      await fetchModules();
      alert(`🎉 ${module.name} unlocked!`);
    } catch (err) {
      alert('Error unlocking module: ' + err.message);
    } finally {
      setUnlocking(null);
    }
  };

  // Filter modules
  const filteredModules = modules.filter(m => {
    if (filter === 'all') return true;
    if (filter === 'unlocked') return m.access_status === 'active';
    if (filter === 'locked') return m.access_status !== 'active';
    return m.category === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 font-mono">LOADING MODULES...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-obsidian text-white">
      {/* Header */}
      <div className="bg-gradient-to-b from-gray-900 to-obsidian border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold font-mono mb-2">
            <span className="text-accent">&gt;</span> SYSTEM_MODULES
          </h1>
          <p className="text-gray-400">
            Unlock tools as you level up. Each module enhances your vibe coding experience.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Progression Bar */}
        <ProgressionBar 
          level={user.level}
          xp={user.xp}
          xpToNext={1000 - (user.xp % 1000)}
          credits={user.credits}
          tier={user.tier}
        />

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['all', 'unlocked', 'locked', 'core', 'agent', 'integration'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`
                px-4 py-2 rounded-lg font-mono text-sm transition-all
                ${filter === f 
                  ? 'bg-accent text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}
              `}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="flex gap-4 mb-6 text-sm text-gray-400">
          <span>{modules.length} Total Modules</span>
          <span>•</span>
          <span className="text-green-400">
            {modules.filter(m => m.access_status === 'active').length} Unlocked
          </span>
          <span>•</span>
          <span className="text-red-400">
            {modules.filter(m => m.access_status !== 'active').length} Locked
          </span>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
            <button 
              onClick={fetchModules}
              className="mt-2 text-sm text-white underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Module Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModules.map((module) => (
            <ModuleCard
              key={module.id}
              module={module}
              userLevel={user.level}
              onUnlock={handleUnlock}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredModules.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No modules match your filter.</p>
            <button 
              onClick={() => setFilter('all')}
              className="mt-4 text-accent underline"
            >
              Show all modules
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
