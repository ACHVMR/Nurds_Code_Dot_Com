import React, { useState, useEffect } from 'react';
import { BREAKERS, TIER_CONFIG, getTierSummary, getBreakersByTier } from '../data/circuitBox';

/**
 * Circuit Box Dashboard - Deploy Platform v4.0
 * Admin control panel organized like an electrician's circuit breaker panel
 * 
 * ACHEEVY is the Digital CEO - orchestrates all operations
 * Buildsmith is the Plug Factory blacksmith - receives P.O. from ACHEEVY
 */
function CircuitBox() {
  const [breakers, setBreakers] = useState(BREAKERS);
  const [selectedBreaker, setSelectedBreaker] = useState(null);
  const [selectedTier, setSelectedTier] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [healthStatus, setHealthStatus] = useState({});
  const [isPolling, setIsPolling] = useState(true);

  // Poll health status from Backend (Circuit Box v4.0)
  useEffect(() => {
    if (!isPolling) return;

    const checkHealth = async () => {
      try {
        const response = await fetch('/api/admin/circuit-box');
        if (response.ok) {
          const data = await response.json();
          const newHealth = {};
          
          // Map backend services to frontend breakers
          data.services.forEach(svc => {
             // Map backend 'stripe', 'openai' to relevant breakers
             // This is a simplification; in production, map IDs more precisely
             breakers.forEach(b => {
               if (b.service.includes(svc.id)) {
                 newHealth[b.service] = svc.status === 'online' ? 'healthy' : 'offline';
               }
             });
          });
          
          // Keep random simulation for others not in backend response for demo liveliness
          breakers.forEach(b => {
            if (!newHealth[b.service]) {
              newHealth[b.service] = Math.random() > 0.05 ? 'healthy' : 'degraded';
            }
          });

          setHealthStatus(newHealth);
        }
      } catch (e) {
        console.error('Circuit Box polling error:', e);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 5000);
    return () => clearInterval(interval);
  }, [breakers, isPolling]);

  // Toggle breaker status
  const toggleBreaker = (breakerId) => {
    setBreakers(prev => prev.map(b => 
      b.id === breakerId 
        ? { ...b, status: b.status === 'on' ? 'off' : 'on' }
        : b
    ));
  };

  // Filter breakers
  const filteredBreakers = breakers.filter(b => {
    const matchesTier = selectedTier === 'all' || b.tier === selectedTier;
    const matchesSearch = !searchQuery || 
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTier && matchesSearch;
  });

  // Get tier summary
  const tierSummary = getTierSummary();
  const tiers = Object.keys(TIER_CONFIG);

  // Calculate overall stats
  const totalBreakers = breakers.length;
  const onlineBreakers = breakers.filter(b => b.status === 'on').length;
  const healthyCount = Object.values(healthStatus).filter(h => h === 'healthy').length;

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--bg)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold mb-3 font-doto tracking-tight" style={{ color: 'var(--text)', textShadow: '0 0 20px rgba(0,255,136,0.3)' }}>
            DEPLOY CIRCUIT BOX
          </h1>
          <p className="text-xl font-doto" style={{ color: 'var(--honey-gold)' }}>
            v4.0 INFRASTRUCTURE CONTROL
          </p>
          <p className="text-sm mt-2" style={{ color: 'var(--mute)' }}>
            Admin control panel for all infrastructure services.
          </p>
        </div>

        {/* Quick Stats - Glass Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          <div className="panel text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="text-4xl font-bold font-doto mb-1" style={{ color: 'var(--text)' }}>{totalBreakers}</div>
            <div className="text-xs uppercase tracking-widest" style={{ color: 'var(--mute)' }}>Services</div>
          </div>
          <div className="panel text-center">
            <div className="text-4xl font-bold font-doto mb-1" style={{ color: 'var(--neon-green)', textShadow: '0 0 10px rgba(0,255,136,0.5)' }}>{onlineBreakers}</div>
            <div className="text-xs uppercase tracking-widest" style={{ color: 'var(--mute)' }}>Online</div>
          </div>
          <div className="panel text-center">
            <div className="text-4xl font-bold font-doto mb-1" style={{ color: 'var(--mute)' }}>{totalBreakers - onlineBreakers}</div>
            <div className="text-xs uppercase tracking-widest" style={{ color: 'var(--mute)' }}>Standby</div>
          </div>
          <div className="panel text-center">
            <div className="text-4xl font-bold font-doto mb-1" style={{ color: 'var(--neon-orange)' }}>{healthyCount}</div>
            <div className="text-xs uppercase tracking-widest" style={{ color: 'var(--mute)' }}>Healthy</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="panel mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="🔍 Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field w-full"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm" style={{ color: 'var(--mute)' }}>Polling:</label>
              <button
                onClick={() => setIsPolling(!isPolling)}
                className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                  isPolling ? 'text-black' : 'bg-gray-600 text-gray-300'
                }`}
                style={{ background: isPolling ? 'var(--neon-green)' : undefined }}
              >
                {isPolling ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>

        {/* Tier Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedTier('all')}
            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
              selectedTier === 'all'
                ? 'text-black'
                : 'border border-gray-600 hover:border-accent'
            }`}
            style={{
              background: selectedTier === 'all' ? 'var(--accent)' : 'transparent',
              color: selectedTier === 'all' ? '#0E0E0E' : 'var(--text)'
            }}
          >
            All Services ({totalBreakers})
          </button>
          {tiers.map(tier => {
            const config = TIER_CONFIG[tier];
            const summary = tierSummary[tier];
            return (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                  selectedTier === tier
                    ? 'text-white'
                    : 'border border-gray-600 hover:border-white'
                }`}
                style={{
                  background: selectedTier === tier ? config.color : 'transparent',
                  borderColor: selectedTier === tier ? config.color : undefined
                }}
              >
                <span>{config.icon}</span>
                <span>{config.label}</span>
                <span className="text-xs opacity-70">({summary.count})</span>
              </button>
            );
          })}
        </div>

        {/* Circuit Box Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {filteredBreakers.map(breaker => {
            const tierConfig = TIER_CONFIG[breaker.tier];
            const health = healthStatus[breaker.service];
            
            return (
              <div
                key={breaker.id}
                className={`relative rounded-xl p-5 border transition-all cursor-pointer hover:scale-[1.02] panel ${
                  breaker.status === 'on'
                    ? 'bg-gradient-to-br from-white/5 to-transparent'
                    : ''
                }`}
                style={{
                  borderColor: breaker.status === 'on' ? tierConfig.color : '#333',
                  boxShadow: breaker.status === 'on' ? `0 0 20px ${tierConfig.color}20` : 'none'
                }}
                onClick={() => setSelectedBreaker(breaker)}
              >
                {/* Status indicator */}
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <span 
                    className={`w-3 h-3 rounded-full animate-pulse ${
                      health === 'healthy' ? '' :
                      health === 'degraded' ? 'bg-yellow-500' : 'bg-gray-500'
                    }`}
                    style={{ background: health === 'healthy' ? 'var(--neon-green)' : undefined }}
                  />
                </div>

                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                  <div 
                    className="text-3xl p-2 rounded-lg"
                    style={{ background: `${tierConfig.color}20` }}
                  >
                    {tierConfig.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg truncate" style={{ color: 'var(--text)' }}>
                      {breaker.name}
                    </h3>
                    <p 
                      className="text-xs uppercase tracking-wide"
                      style={{ color: tierConfig.color }}
                    >
                      {tierConfig.label}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--mute)' }}>
                  {breaker.description}
                </p>

                {/* Role badge (if exists) */}
                {breaker.role && (
                  <div 
                    className="text-xs p-2 rounded-lg mb-3"
                    style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--honey-gold)' }}
                  >
                    💼 {breaker.role.substring(0, 60)}...
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <code 
                    className="text-xs px-2 py-1 rounded"
                    style={{ background: 'rgba(0,0,0,0.3)', color: 'var(--mute)' }}
                  >
                    {breaker.service}
                  </code>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBreaker(breaker.id);
                    }}
                    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                      breaker.status === 'on'
                        ? 'text-black'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                    style={{
                      background: breaker.status === 'on' ? 'var(--neon-green)' : undefined
                    }}
                  >
                    <span className={`w-2 h-2 rounded-full ${
                      breaker.status === 'on' ? 'bg-black' : 'bg-gray-400'
                    }`}></span>
                    {breaker.status.toUpperCase()}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* No results */}
        {filteredBreakers.length === 0 && (
          <div className="panel text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <p style={{ color: 'var(--mute)' }}>No services found matching your criteria</p>
          </div>
        )}

        {/* Detail Modal */}
        {selectedBreaker && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
            onClick={() => setSelectedBreaker(null)}
          >
            <div 
              className="w-full max-w-2xl rounded-2xl p-6 max-h-[80vh] overflow-y-auto"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-4xl">{TIER_CONFIG[selectedBreaker.tier].icon}</span>
                    <div>
                      <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                        {selectedBreaker.name}
                      </h2>
                      <p 
                        className="text-sm uppercase tracking-wide"
                        style={{ color: TIER_CONFIG[selectedBreaker.tier].color }}
                      >
                        {TIER_CONFIG[selectedBreaker.tier].label}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedBreaker(null)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  style={{ color: 'var(--mute)' }}
                >
                  ✕
                </button>
              </div>

              {/* Description */}
              <p className="mb-4" style={{ color: 'var(--mute)' }}>
                {selectedBreaker.description}
              </p>

              {/* Role */}
              {selectedBreaker.role && (
                <div 
                  className="p-4 rounded-xl mb-4"
                  style={{ background: 'rgba(255,94,0,0.1)', border: '1px solid rgba(255,94,0,0.3)' }}
                >
                  <p className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--mute)' }}>
                    Role in Ecosystem
                  </p>
                  <p style={{ color: 'var(--honey-gold)' }}>{selectedBreaker.role}</p>
                </div>
              )}

              {/* Capabilities */}
              {selectedBreaker.capabilities && (
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--mute)' }}>
                    Capabilities
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedBreaker.capabilities.map((cap, i) => (
                      <span 
                        key={i}
                        className="px-3 py-1 rounded-full text-sm"
                        style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text)' }}
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Specialists (House of ANG) */}
              {selectedBreaker.specialists && (
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--mute)' }}>
                    17 Specialist Boomer_Angs
                  </p>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {selectedBreaker.specialists.map((spec, i) => (
                      <div 
                        key={i}
                        className="p-2 rounded-lg flex items-center gap-2"
                        style={{ background: 'rgba(0,0,0,0.3)' }}
                      >
                        <span className="text-xl">{spec.icon}</span>
                        <div>
                          <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{spec.name}</p>
                          <p className="text-xs" style={{ color: 'var(--mute)' }}>{spec.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Technical Details */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 rounded-lg" style={{ background: 'rgba(0,0,0,0.3)' }}>
                  <p className="text-xs mb-1" style={{ color: 'var(--mute)' }}>Service ID</p>
                  <code className="text-sm" style={{ color: 'var(--text)' }}>{selectedBreaker.service}</code>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(0,0,0,0.3)' }}>
                  <p className="text-xs mb-1" style={{ color: 'var(--mute)' }}>Health Endpoint</p>
                  <code className="text-sm truncate block" style={{ color: 'var(--text)' }}>
                    {selectedBreaker.health_endpoint || 'N/A'}
                  </code>
                </div>
                {selectedBreaker.maturity && (
                  <div className="p-3 rounded-lg" style={{ background: 'rgba(0,0,0,0.3)' }}>
                    <p className="text-xs mb-1" style={{ color: 'var(--mute)' }}>Maturity</p>
                    <span 
                      className="text-sm font-medium uppercase"
                      style={{ color: 'var(--accent)' }}
                    >
                      {selectedBreaker.maturity}
                    </span>
                  </div>
                )}
                {selectedBreaker.score && (
                  <div className="p-3 rounded-lg" style={{ background: 'rgba(0,0,0,0.3)' }}>
                    <p className="text-xs mb-1" style={{ color: 'var(--mute)' }}>Deploy Score</p>
                    <span 
                      className="text-sm font-bold"
                      style={{ color: 'var(--neon-green)' }}
                    >
                      {selectedBreaker.score}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => toggleBreaker(selectedBreaker.id)}
                  className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                    selectedBreaker.status === 'on'
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'text-black'
                  }`}
                  style={{
                    background: selectedBreaker.status !== 'on' ? 'var(--neon-green)' : undefined
                  }}
                >
                  {selectedBreaker.status === 'on' ? '⏹ Turn OFF' : '▶ Turn ON'}
                </button>
                <button
                  onClick={() => setSelectedBreaker(null)}
                  className="px-6 py-3 rounded-xl font-bold transition-all"
                  style={{ background: 'var(--border)', color: 'var(--text)' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Wiring Diagram Section */}
        <div className="panel">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text)' }}>
            📐 Wiring Diagram
          </h2>
          <p className="text-sm mb-4" style={{ color: 'var(--mute)' }}>
            How services connect in the RFP-to-Bamaram workflow
          </p>
          <div 
            className="p-4 rounded-xl font-mono text-sm overflow-x-auto"
            style={{ background: 'rgba(0,0,0,0.5)' }}
          >
            <pre style={{ color: 'var(--text)' }}>
{`┌─────────────────────────────────────────────────────────────┐
│  USER REQUEST                                               │
│  "I need a customer support automation Plug"               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 1: RFP INTAKE (ACHEEVY)                              │
│  • Conducts 4-Question Discovery Lens                       │
│  • Captures: Intent, Risks, Audience, Excellence            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 2-5: RFP-BAMARAM (ACHEEVY + PICKER_ANG)              │
│  • ACHEEVY analyzes requirements                            │
│  • PICKER_ANG selects optimal tools/frameworks              │
│  • Generate quote → User accepts                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 6: P.O. HANDOFF → BUILDSMITH (Plug Factory)          │
│  • Receives P.O. with tools, requirements, budget           │
│  • Executes build using selected frameworks                 │
│  • Applies [UserPrefix]_Ang naming                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 7-10: QA → DELIVERY → BAMARAM ✓                      │
│  • THE_FARMER security scan                                 │
│  • NTNTN approval                                           │
│  • Deploy to production                                     │
│  • ACHEEVY declares BAMARAM (complete)                      │
└─────────────────────────────────────────────────────────────┘`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CircuitBox;
