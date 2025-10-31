import React, { useState, useEffect } from 'react';
import { Power, AlertTriangle, CheckCircle, XCircle, Activity, Zap } from 'lucide-react';

const CircuitBox = () => {
  const [breakers, setBreakers] = useState([]);
  const [selectedBreaker, setSelectedBreaker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'on', 'off', 'error'

  useEffect(() => {
    fetchCircuitStatus();
    // Refresh every 30 seconds
    const interval = setInterval(fetchCircuitStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchCircuitStatus = async () => {
    try {
      // In production, this would fetch from /api/admin/circuit-box
      // For now, we'll load the static config with simulated health checks
      const response = await fetch('/circuit-box/breakers.yaml');
      const yamlText = await response.text();
      
      // Parse YAML (simplified - in production use a proper YAML parser)
      const mockBreakers = [
        {
          id: 'breaker-1',
          name: 'Cloudflare Workers API',
          service: 'workers-api',
          tier: 'core',
          status: 'on',
          health: 'healthy',
          description: 'Main API router with Clerk auth, chat, voice, Stripe webhooks',
          uptime: '99.9%'
        },
        {
          id: 'breaker-2',
          name: 'Clerk Authentication',
          service: 'clerk-auth',
          tier: 'core',
          status: 'on',
          health: 'healthy',
          description: 'User authentication and session management',
          uptime: '99.8%'
        },
        {
          id: 'breaker-3',
          name: 'Supabase Database',
          service: 'supabase',
          tier: 'core',
          status: 'on',
          health: 'healthy',
          description: 'PostgreSQL database with RLS and real-time capabilities',
          uptime: '99.95%'
        },
        {
          id: 'breaker-4',
          name: 'Admin Console',
          service: 'admin-dashboard',
          tier: 'core',
          status: 'on',
          health: 'healthy',
          description: 'Superadmin-only control panel',
          uptime: '100%'
        },
        {
          id: 'breaker-5',
          name: 'LLM Gateway',
          service: 'llm-router',
          tier: 'ai',
          status: 'on',
          health: 'healthy',
          description: 'Multi-provider LLM routing (OpenAI, Anthropic, GROQ, OpenRouter)',
          providers: ['OpenAI', 'Anthropic', 'GROQ', 'OpenRouter']
        },
        {
          id: 'breaker-6',
          name: 'GPT-5 Feature Flag',
          service: 'gpt5-routing',
          tier: 'ai',
          status: 'off',
          health: 'disabled',
          description: 'Premium GPT-5 routing (when enabled)'
        },
        {
          id: 'breaker-10',
          name: 'Voice Integration Layer',
          service: 'voice-orchestrator',
          tier: 'voice',
          status: 'on',
          health: 'healthy',
          description: 'Multi-provider voice AI with STT/TTS orchestration',
          providers: ['OpenAI Whisper', 'OpenAI TTS', 'Deepgram', 'ElevenLabs']
        },
        {
          id: 'breaker-15',
          name: 'Multi-Agent Builder Kit',
          service: 'agent-orchestrator',
          tier: 'agents',
          status: 'on',
          health: 'healthy',
          description: 'Multi-framework agent builder with Boomer_Angs naming system',
          frameworks: ['Boomer_Angs', 'CrewAI', 'Microsoft Agent Framework', 'OpenAI Agents SDK']
        },
        {
          id: 'breaker-20',
          name: 'Stripe Integration',
          service: 'stripe-billing',
          tier: 'payments',
          status: 'on',
          health: 'healthy',
          description: 'Subscription billing and payment processing'
        },
        {
          id: 'breaker-30',
          name: 'Superadmin RBAC',
          service: 'rbac-enforcement',
          tier: 'security',
          status: 'on',
          health: 'healthy',
          description: 'Role-based access control with email allowlist'
        },
        {
          id: 'breaker-32',
          name: 'Security Scanner (The_Farmer)',
          service: 'security-scanner',
          tier: 'security',
          status: 'off',
          health: 'disabled',
          description: 'Autonomous vulnerability detection and patching'
        },
        {
          id: 'breaker-35',
          name: 'Code Editor',
          service: 'editor',
          tier: 'execution',
          status: 'on',
          health: 'healthy',
          description: 'Multi-language code editor with auto-detect'
        }
      ];

      setBreakers(mockBreakers);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch circuit status:', error);
      setLoading(false);
    }
  };

  const toggleBreaker = async (breakerId) => {
    const breaker = breakers.find(b => b.id === breakerId);
    if (!breaker) return;

    const newStatus = breaker.status === 'on' ? 'off' : 'on';
    
    // In production, this would call /api/admin/circuit-box/toggle
    // For now, update locally
    setBreakers(breakers.map(b => 
      b.id === breakerId 
        ? { ...b, status: newStatus, health: newStatus === 'on' ? 'healthy' : 'disabled' }
        : b
    ));
  };

  const getStatusIcon = (status, health) => {
    if (status === 'off' || health === 'disabled') {
      return <XCircle className="w-5 h-5 text-gray-500" />;
    }
    if (health === 'error') {
      return <AlertTriangle className="w-5 h-5 text-red-500" />;
    }
    return <CheckCircle className="w-5 h-5 text-[#39FF14]" />;
  };

  const getTierColor = (tier) => {
    const colors = {
      core: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      ai: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      voice: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      agents: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
      payments: 'bg-green-500/10 text-green-400 border-green-500/30',
      security: 'bg-red-500/10 text-red-400 border-red-500/30',
      execution: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
    };
    return colors[tier] || 'bg-gray-500/10 text-gray-400 border-gray-500/30';
  };

  const filteredBreakers = breakers.filter(b => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'on') return b.status === 'on';
    if (statusFilter === 'off') return b.status === 'off';
    if (statusFilter === 'error') return b.health === 'error';
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Activity className="w-8 h-8 text-[#39FF14] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text flex items-center gap-2">
            <Zap className="w-6 h-6 text-[#39FF14]" />
            Circuit Box Dashboard
          </h2>
          <p className="text-text/60 mt-1">
            Infrastructure control panel • Toggle breakers to enable/disable services
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-lg text-sm ${
              statusFilter === 'all' 
                ? 'bg-[#39FF14]/20 text-[#39FF14]' 
                : 'bg-[#1a1a1a] text-text/60 hover:text-text'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('on')}
            className={`px-3 py-1 rounded-lg text-sm ${
              statusFilter === 'on' 
                ? 'bg-[#39FF14]/20 text-[#39FF14]' 
                : 'bg-[#1a1a1a] text-text/60 hover:text-text'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setStatusFilter('off')}
            className={`px-3 py-1 rounded-lg text-sm ${
              statusFilter === 'off' 
                ? 'bg-gray-500/20 text-gray-400' 
                : 'bg-[#1a1a1a] text-text/60 hover:text-text'
            }`}
          >
            Inactive
          </button>
        </div>
      </div>

      {/* Circuit Box Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBreakers.map((breaker) => (
          <div
            key={breaker.id}
            className="card hover:border-[#39FF14]/40 transition-all cursor-pointer"
            onClick={() => setSelectedBreaker(breaker)}
          >
            {/* Breaker Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {getStatusIcon(breaker.status, breaker.health)}
                  <h3 className="font-semibold text-text text-sm">{breaker.name}</h3>
                </div>
                <span className={`inline-block px-2 py-0.5 rounded text-xs border ${getTierColor(breaker.tier)}`}>
                  {breaker.tier}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleBreaker(breaker.id);
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  breaker.status === 'on' ? 'bg-[#39FF14]' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    breaker.status === 'on' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Breaker Details */}
            <p className="text-xs text-text/60 mb-3">{breaker.description}</p>

            {/* Status Indicators */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-text/40">{breaker.service}</span>
              {breaker.uptime && (
                <span className="text-[#39FF14]">{breaker.uptime} uptime</span>
              )}
            </div>

            {/* Optional: Sub-services */}
            {breaker.providers && (
              <div className="mt-3 pt-3 border-t border-[#2a2a2a]">
                <p className="text-xs text-text/40 mb-1">Providers:</p>
                <div className="flex flex-wrap gap-1">
                  {breaker.providers.slice(0, 3).map((provider, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-[#1a1a1a] text-text/60 rounded text-xs"
                    >
                      {provider}
                    </span>
                  ))}
                  {breaker.providers.length > 3 && (
                    <span className="px-2 py-0.5 bg-[#1a1a1a] text-text/60 rounded text-xs">
                      +{breaker.providers.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}

            {breaker.frameworks && (
              <div className="mt-3 pt-3 border-t border-[#2a2a2a]">
                <p className="text-xs text-text/40 mb-1">Frameworks:</p>
                <div className="flex flex-wrap gap-1">
                  {breaker.frameworks.slice(0, 2).map((framework, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-[#1a1a1a] text-text/60 rounded text-xs"
                    >
                      {framework}
                    </span>
                  ))}
                  {breaker.frameworks.length > 2 && (
                    <span className="px-2 py-0.5 bg-[#1a1a1a] text-text/60 rounded text-xs">
                      +{breaker.frameworks.length - 2}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Detailed View Modal */}
      {selectedBreaker && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedBreaker(null)}
        >
          <div
            className="card max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-text mb-2">{selectedBreaker.name}</h3>
                <p className="text-text/60 text-sm">{selectedBreaker.description}</p>
              </div>
              <button
                onClick={() => setSelectedBreaker(null)}
                className="text-text/60 hover:text-text"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-text/40">Service ID</label>
                <p className="text-text font-mono text-sm">{selectedBreaker.service}</p>
              </div>
              
              <div>
                <label className="text-xs text-text/40">Tier</label>
                <p className="text-text capitalize">{selectedBreaker.tier}</p>
              </div>
              
              <div>
                <label className="text-xs text-text/40">Status</label>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusIcon(selectedBreaker.status, selectedBreaker.health)}
                  <span className="text-text capitalize">{selectedBreaker.status}</span>
                </div>
              </div>

              {selectedBreaker.uptime && (
                <div>
                  <label className="text-xs text-text/40">Uptime</label>
                  <p className="text-[#39FF14]">{selectedBreaker.uptime}</p>
                </div>
              )}

              {selectedBreaker.providers && (
                <div>
                  <label className="text-xs text-text/40 block mb-2">Available Providers</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedBreaker.providers.map((provider, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-[#1a1a1a] text-text rounded"
                      >
                        {provider}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedBreaker.frameworks && (
                <div>
                  <label className="text-xs text-text/40 block mb-2">Agent Frameworks</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedBreaker.frameworks.map((framework, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-[#1a1a1a] text-text rounded"
                      >
                        {framework}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-[#2a2a2a]">
                <button
                  onClick={() => toggleBreaker(selectedBreaker.id)}
                  className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${
                    selectedBreaker.status === 'on'
                      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                      : 'bg-[#39FF14]/20 text-[#39FF14] hover:bg-[#39FF14]/30'
                  }`}
                >
                  {selectedBreaker.status === 'on' ? 'Disable Service' : 'Enable Service'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CircuitBox;
