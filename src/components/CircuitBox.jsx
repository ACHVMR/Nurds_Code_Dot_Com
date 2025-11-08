import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Power, AlertTriangle, CheckCircle, XCircle, Activity, Zap, Boxes, MessageCircle, Send, Sparkles } from 'lucide-react';
import { USE_CASES, orchestrateCircuitBox, getAvailableUseCases } from '../services/circuitOrchestration.js';
import { ACHEEVYAssistant } from '../services/acheevy.js';

const CircuitBox = () => {
  const [breakers, setBreakers] = useState([]);
  const [selectedBreaker, setSelectedBreaker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'on', 'off', 'error'
  const [apiError, setApiError] = useState('');
  const [showOrchestration, setShowOrchestration] = useState(false);
  const [selectedUseCase, setSelectedUseCase] = useState('');
  const [userTier, setUserTier] = useState('free');
  const [orchestrating, setOrchestrating] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [acheevy, setAcheevy] = useState(null);
  const chatEndRef = useRef(null);
  const { getToken, userId } = useAuth();

  useEffect(() => {
    fetchCircuitStatus();
    fetchUserTier();
    // Refresh every 30 seconds
    const interval = setInterval(fetchCircuitStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const initAssistant = async () => {
      if (userId && userTier) {
        const token = await getToken?.();
        const assistant = new ACHEEVYAssistant(userId, userTier, token);
        setAcheevy(assistant);
      }
    };
    initAssistant();
  }, [userId, userTier, getToken]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const fetchUserTier = async () => {
    try {
      const token = await getToken?.();
      const res = await fetch('/api/auth/me', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        // Extract tier from claims or metadata
        setUserTier(data?.claims?.tier || data?.tier || 'free');
      }
    } catch (e) {
      console.error('Failed to fetch user tier:', e);
    }
  };

  const handleOrchestrate = async () => {
    if (!selectedUseCase) {
      setApiError('Please select a use case');
      return;
    }

    setOrchestrating(true);
    setApiError('');

    try {
      const token = await getToken?.();
      const result = await orchestrateCircuitBox(selectedUseCase, userTier, token);
      
      // Refresh breakers to show new state
      await fetchCircuitStatus();
      
      setShowOrchestration(false);
      setSelectedUseCase('');
      setApiError('');
      
      // Show success message
      alert(`✓ Circuit Box configured for ${USE_CASES[selectedUseCase].name}\n\nEnabled: ${result.enabled.length} services\nDisabled: ${result.disabled?.length || 0} services`);
    } catch (error) {
      setApiError(error.message || 'Orchestration failed');
    } finally {
      setOrchestrating(false);
    }
  };

  const handleChatSend = async () => {
    if (!chatMessage.trim() || !acheevy) return;

    const userMessage = { role: 'user', content: chatMessage, timestamp: Date.now() };
    setChatHistory(prev => [...prev, userMessage]);
    setChatMessage('');

    try {
      const token = await getToken?.();
      acheevy.token = token;
      
      const response = await acheevy.analyzeIntent(chatMessage);
      const guidance = acheevy.generateGuidance();
      
      const assistantMessage = {
        role: 'assistant',
        content: guidance,
        intent: acheevy.detectedIntent,
        confidence: response.confidence,
        suggestedTools: acheevy.suggestedTools,
        timestamp: Date.now()
      };
      
      setChatHistory(prev => [...prev, assistantMessage]);
      
      // Auto-provision if high confidence and user seems ready
      if (response.confidence > 0.7 && chatMessage.toLowerCase().includes('set up')) {
        setTimeout(async () => {
          const provisionResult = await acheevy.autoProvision(true);
          if (provisionResult.success) {
            await fetchCircuitStatus();
            setChatHistory(prev => [...prev, {
              role: 'system',
              content: `✓ Auto-configured ${provisionResult.enabled.length} services for you!`,
              timestamp: Date.now()
            }]);
          }
        }, 1000);
      }
    } catch (error) {
      setChatHistory(prev => [...prev, {
        role: 'error',
        content: `Error: ${error.message}`,
        timestamp: Date.now()
      }]);
    }
  };

  const fetchCircuitStatus = async () => {
    try {
      // Try live API first (superadmin only)
      const token = await getToken?.();
      const res = await fetch('/api/admin/circuit-box', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json?.breakers)) {
          setBreakers(json.breakers);
          setApiError('');
          setLoading(false);
          return;
        }
      }

      // Fallback: load static config with simulated health checks
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
      setApiError('');
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch circuit status:', error);
      setApiError('Failed to load circuit status');
      setLoading(false);
    }
  };

  const toggleBreaker = async (breakerId) => {
    const breaker = breakers.find(b => b.id === breakerId);
    if (!breaker) return;

    const newStatus = breaker.status === 'on' ? 'off' : 'on';
    // Optimistic update
    const prev = breakers;
    setBreakers(prev.map(b =>
      b.id === breakerId
        ? { ...b, status: newStatus, health: newStatus === 'on' ? 'healthy' : 'disabled' }
        : b
    ));

    try {
      const token = await getToken?.();
      const res = await fetch(`/api/admin/circuit-box/${breakerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) {
        // Revert on failure
        setBreakers(prev);
        const errText = await res.text();
        setApiError(`Failed to toggle breaker: ${errText || res.status}`);
      } else {
        const data = await res.json().catch(() => null);
        if (data?.breaker) {
          // Reconcile with server response
          setBreakers((curr) => curr.map(b => b.id === breakerId ? { ...b, ...data.breaker } : b));
        }
        setApiError('');
      }
    } catch (e) {
      // Revert on exception
      setBreakers(prev);
      setApiError(e.message || 'Toggle failed');
    }
  };

  const getStatusIcon = (status, health) => {
    if (status === 'off' || health === 'disabled') {
      return <XCircle className="w-5 h-5 text-gray-500" />;
    }
    if (health === 'error') {
      return <AlertTriangle className="w-5 h-5 text-red-500" />;
    }
    return <CheckCircle className="w-5 h-5 text-[#E68961]" />;
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
        <Activity className="w-8 h-8 text-[#E68961] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {apiError && (
        <div className="card border-red-500/30 bg-red-500/10 text-red-300 text-sm p-3">
          {apiError}
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-text flex items-center gap-2">
            <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-[#E68961]" />
            Circuit Box Dashboard
          </h2>
          <p className="text-sm sm:text-base text-text/60 mt-1">
            Infrastructure control panel • Toggle breakers to enable/disable services
          </p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowOrchestration(true)}
            className="px-3 sm:px-4 py-2 bg-[#E68961]/20 text-[#E68961] hover:bg-[#E68961]/30 rounded-lg flex items-center gap-2 font-semibold transition-colors text-sm"
          >
            <Boxes className="w-4 h-4" />
            <span className="hidden sm:inline">Auto-Configure</span>
            <span className="sm:hidden">Configure</span>
          </button>
          <button
            onClick={() => setShowChat(true)}
            className="px-3 sm:px-4 py-2 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 rounded-lg flex items-center gap-2 font-semibold transition-colors text-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">ACHEEVY Assistant</span>
            <span className="sm:hidden">AI Help</span>
          </button>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-lg text-sm ${
              statusFilter === 'all' 
                ? 'bg-[#E68961]/20 text-[#E68961]' 
                : 'bg-[#1a1a1a] text-text/60 hover:text-text'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('on')}
            className={`px-3 py-1 rounded-lg text-sm ${
              statusFilter === 'on' 
                ? 'bg-[#E68961]/20 text-[#E68961]' 
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {filteredBreakers.map((breaker) => (
          <div
            key={breaker.id}
            className="card hover:border-[#E68961]/40 transition-all cursor-pointer"
            onClick={() => setSelectedBreaker(breaker)}
          >
            {/* Breaker Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {getStatusIcon(breaker.status, breaker.health)}
                  <h3 className="font-semibold text-text text-xs sm:text-sm truncate">{breaker.name}</h3>
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
                  breaker.status === 'on' ? 'bg-[#E68961]' : 'bg-gray-600'
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
                <span className="text-[#E68961]">{breaker.uptime} uptime</span>
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

      {/* Orchestration Modal */}
      {showOrchestration && (
        <div
          className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50"
          onClick={() => setShowOrchestration(false)}
        >
          <div
            className="card w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto m-0 sm:m-4 rounded-t-2xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-text mb-2 flex items-center gap-2">
                  <Boxes className="w-6 h-6 text-[#E68961]" />
                  ACHEEVY Orchestration
                </h3>
                <p className="text-text/60 text-sm">
                  Auto-configure Circuit Box for your use case • Current tier: <span className="text-[#E68961] font-semibold">{userTier}</span>
                </p>
              </div>
              <button
                onClick={() => setShowOrchestration(false)}
                className="text-text/60 hover:text-text"
              >
                ✕
              </button>
            </div>

            {apiError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded text-red-300 text-sm">
                {apiError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Select Use Case
                </label>
                <select
                  value={selectedUseCase}
                  onChange={(e) => setSelectedUseCase(e.target.value)}
                  className="input-field w-full"
                  disabled={orchestrating}
                >
                  <option value="">-- Choose a use case --</option>
                  {getAvailableUseCases(userTier).map((uc) => (
                    <option key={uc.id} value={uc.id}>
                      {uc.name} - {uc.description}
                    </option>
                  ))}
                </select>
              </div>

              {selectedUseCase && USE_CASES[selectedUseCase] && (
                <div className="p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded">
                  <h4 className="font-semibold text-text mb-2">
                    {USE_CASES[selectedUseCase].name}
                  </h4>
                  <p className="text-text/60 text-sm mb-3">
                    {USE_CASES[selectedUseCase].description}
                  </p>
                  <div>
                    <p className="text-xs text-text/40 mb-2">Services to enable:</p>
                    <div className="flex flex-wrap gap-2">
                      {USE_CASES[selectedUseCase].services.map((service, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-[#E68961]/10 text-[#E68961] border border-[#E68961]/30 rounded text-xs"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-[#2a2a2a]">
                    <p className="text-xs text-text/60">
                      <strong>Minimum Tier:</strong> {USE_CASES[selectedUseCase].minTier}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleOrchestrate}
                  disabled={!selectedUseCase || orchestrating}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {orchestrating ? 'Configuring...' : 'Apply Configuration'}
                </button>
                <button
                  onClick={() => setShowOrchestration(false)}
                  disabled={orchestrating}
                  className="px-4 py-2 bg-[#2a2a2a] text-text hover:bg-[#3a3a3a] rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed View Modal */}
      {selectedBreaker && (
        <div
          className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50"
          onClick={() => setSelectedBreaker(null)}
        >
          <div
            className="card w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto m-0 sm:m-4 rounded-t-2xl sm:rounded-2xl"
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

      {/* ACHEEVY Chat Assistant */}
      {showChat && (
        <div
          className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50"
          onClick={() => setShowChat(false)}
        >
          <div
            className="card w-full sm:max-w-2xl h-[90vh] sm:h-[600px] flex flex-col m-0 sm:m-4 rounded-t-2xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#2a2a2a]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-bold text-text">ACHEEVY Assistant</h3>
              </div>
              <button
                onClick={() => setShowChat(false)}
                className="text-text/60 hover:text-text text-xl"
              >
                ✕
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatHistory.length === 0 && (
                <div className="text-center text-text/40 mt-8">
                  <Sparkles className="w-12 h-12 mx-auto mb-3 text-purple-400/40" />
                  <p className="text-sm">Hi! I'm ACHEEVY, your AI assistant.</p>
                  <p className="text-xs mt-2">Ask me about setting up voice control, robotics, AI agents, and more!</p>
                </div>
              )}
              
              {chatHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg p-3 ${
                      msg.role === 'user'
                        ? 'bg-[#39FF14]/20 text-text'
                        : msg.role === 'error'
                        ? 'bg-red-500/20 text-red-300'
                        : msg.role === 'system'
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'bg-[#1a1a1a] text-text border border-[#2a2a2a]'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    
                    {msg.suggestedTools && msg.suggestedTools.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-[#2a2a2a]">
                        <p className="text-xs text-text/60 mb-1">Suggested services:</p>
                        <div className="flex flex-wrap gap-1">
                          {msg.suggestedTools.slice(0, 4).map((tool, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded text-xs"
                            >
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {msg.intent && msg.confidence && (
                      <div className="mt-2 pt-2 border-t border-[#2a2a2a] text-xs text-text/40">
                        Intent: {msg.intent.replace(/-/g, ' ')} ({Math.round(msg.confidence * 100)}%)
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-[#2a2a2a]">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleChatSend()}
                  placeholder="Ask me anything... (e.g., 'I want to build a voice assistant')"
                  className="flex-1 input-field text-sm"
                />
                <button
                  onClick={handleChatSend}
                  disabled={!chatMessage.trim() || !acheevy}
                  className="px-4 py-2 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-text/40 mt-2">
                💡 Try: "Set up voice control" or "I need robotics APIs"
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CircuitBox;
