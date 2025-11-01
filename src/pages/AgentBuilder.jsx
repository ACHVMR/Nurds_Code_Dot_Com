import React, { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { namingCeremony } from '../services/boomerAngNaming';
import { Sparkles, Bot, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import { generateAgentCSV, generateAgentJSONL, downloadBlob } from '../utils/agentCsv';

function AgentBuilder() {
  const { getToken, isSignedIn } = useAuth();
  const [agentPrefix, setAgentPrefix] = useState('');
  const [agentType, setAgentType] = useState('custom');
  const [selectedFramework, setSelectedFramework] = useState('boomer_angs');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState([]);
  const [previewAgent, setPreviewAgent] = useState(null);
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(null);

  const agentTypes = [
    { id: 'customer_support', label: 'Customer Support', icon: '💬' },
    { id: 'sales', label: 'Sales Assistant', icon: '💰' },
    { id: 'research', label: 'Research Analyst', icon: '🔍' },
    { id: 'code', label: 'Code Assistant', icon: '💻' },
    { id: 'content', label: 'Content Creator', icon: '✍️' },
    { id: 'analytics', label: 'Data Analytics', icon: '📊' },
    { id: 'workflow', label: 'Workflow Automation', icon: '⚙️' },
    { id: 'custom', label: 'Custom Agent', icon: '🎯' }
  ];

  const frameworks = [
    {
      id: 'boomer_angs',
      name: 'Boomer_Angs',
      description: 'Deploy-native agent framework with naming ceremony',
      status: 'recommended',
      maturity: 'production'
    },
    {
      id: 'crewai',
      name: 'CrewAI',
      description: 'Multi-agent workflows, production-ready',
      status: 'available',
      maturity: 'high'
    },
    {
      id: 'microsoft',
      name: 'Microsoft Agent Framework',
      description: 'Enterprise governance, long-running tasks',
      status: 'available',
      maturity: 'very-high'
    },
    {
      id: 'openai',
      name: 'OpenAI Agents SDK',
      description: 'OpenAI ecosystem, GPT-4 agents',
      status: 'available',
      maturity: 'high'
    }
  ];

  const handlePrefixChange = (value) => {
    setAgentPrefix(value);
    setErrors([]);
    
    if (value.trim().length >= 3) {
      const validation = namingCeremony.validatePrefix(value);
      if (!validation.valid) {
        setErrors(validation.errors);
        setPreviewAgent(null);
      } else {
        const agentInfo = namingCeremony.generateAgentName(value);
        setPreviewAgent(agentInfo);
      }
    } else {
      setPreviewAgent(null);
    }
  };

  const handleTypeChange = (type) => {
    setAgentType(type);
    // Auto-suggest a prefix if none entered
    if (!agentPrefix && type !== 'custom') {
      const suggestions = namingCeremony.suggestPrefixes(type);
      if (suggestions.length > 0) {
        handlePrefixChange(suggestions[0]);
      }
    }
  };

  const handleCreateAgent = async () => {
    if (!previewAgent || !previewAgent.success) {
      setErrors(['Please provide a valid agent name']);
      return;
    }

    setCreating(true);
    setErrors([]);

    try {
      const token = await getToken();
      const response = await fetch('/api/agents/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          agentName: previewAgent.agentName,
          prefix: previewAgent.prefix,
          type: agentType,
          framework: selectedFramework,
          description,
          metadata: previewAgent.metadata
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create agent');
      }

      const data = await response.json();
      setCreated(data);
      
      // Reset form
      setTimeout(() => {
        setAgentPrefix('');
        setDescription('');
        setPreviewAgent(null);
        setCreated(null);
      }, 5000);
    } catch (error) {
      setErrors([error.message || 'Failed to create agent']);
    } finally {
      setCreating(false);
    }
  };

  if (!isSignedIn) {
    return (
      <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <Bot className="w-16 h-16 text-[#39FF14] mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-text mb-4">House of Ang</h1>
          <p className="text-text/60 mb-6">Sign in to join the House of Ang and create Boomer_Angs agents</p>
          <a href="/auth" className="btn-primary inline-block">
            Sign In to Continue
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with Illustration - Rebranded to House of Ang */}
        <div className="grid lg:grid-cols-2 gap-12 items-start mb-12">
          {/* Left: House of Ang Illustration */}
          <div className="hidden lg:flex justify-center order-last lg:order-first">
            <img 
              src="/assets/illustrations/house-of-ang-hero.svg" 
              alt="House of Ang" 
              className="w-full max-w-md h-auto drop-shadow-2xl"
              style={{ filter: 'drop-shadow(0 6px 30px rgba(57, 255, 20, 0.18))' }}
            />
          </div>

          {/* Right: Header Text */}
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-3">
              <Sparkles className="w-8 h-8 text-[#39FF14]" />
              <h1 className="text-4xl font-bold text-text">House of Ang</h1>
            </div>
            <p className="text-text/60 text-lg mb-6">
              Build Boomer_Angs — the deploy-native agent model. Naming ceremony included.
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">

        {/* Success Message */}
        {created && (
          <div className="card bg-[#39FF14]/10 border-[#39FF14]">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-[#39FF14] flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-[#39FF14] mb-1">Agent Created Successfully!</h3>
                <p className="text-text/80 text-sm mb-2">
                  <strong>{created.agentName}</strong> is ready to deploy
                </p>
                <pre className="text-xs bg-[#0a0a0a] p-3 rounded border border-[#2a2a2a] text-text/60 overflow-x-auto">
                  {created.certificate || 'Agent deployment initiated...'}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Main Form */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column: Configuration */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-xl font-semibold text-text mb-4">Agent Configuration</h2>

              {/* Agent Type */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-text/80 mb-2">
                  Agent Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {agentTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => handleTypeChange(type.id)}
                      className={`p-3 rounded-lg text-left transition-all ${
                        agentType === type.id
                          ? 'bg-[#39FF14]/20 border border-[#39FF14] text-text'
                          : 'bg-[#1a1a1a] border border-[#2a2a2a] text-text/60 hover:text-text hover:border-[#39FF14]/40'
                      }`}
                    >
                      <span className="text-xl mr-2">{type.icon}</span>
                      <span className="text-sm font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Agent Name Prefix */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-text/80 mb-2">
                  Agent Name Prefix
                </label>
                <input
                  type="text"
                  value={agentPrefix}
                  onChange={(e) => handlePrefixChange(e.target.value)}
                  placeholder="e.g., CustomerSupport, SalesBot, ResearchAI"
                  className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-text focus:border-[#39FF14] focus:outline-none"
                />
                <p className="text-xs text-text/40 mt-1">
                  Will be converted to: <strong>{previewAgent?.agentName || '[YourPrefix]_Ang'}</strong>
                </p>
              </div>

              {/* Errors */}
              {errors.length > 0 && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <div className="space-y-1">
                      {errors.map((error, idx) => (
                        <p key={idx} className="text-sm text-red-400">{error}</p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-text/80 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what your agent will do..."
                  rows={4}
                  className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-text focus:border-[#39FF14] focus:outline-none resize-none"
                />
              </div>

              {/* Framework Selection */}
              <div>
                <label className="block text-sm font-medium text-text/80 mb-2">
                  Agent Framework
                </label>
                <div className="space-y-2">
                  {frameworks.map((framework) => (
                    <button
                      key={framework.id}
                      onClick={() => setSelectedFramework(framework.id)}
                      className={`w-full p-3 rounded-lg text-left transition-all ${
                        selectedFramework === framework.id
                          ? 'bg-[#39FF14]/20 border border-[#39FF14]'
                          : 'bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#39FF14]/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-text">{framework.name}</span>
                        {framework.status === 'recommended' && (
                          <span className="px-2 py-0.5 bg-[#39FF14]/20 text-[#39FF14] text-xs rounded">
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-text/60">{framework.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Preview */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-xl font-semibold text-text mb-4">Agent Preview</h2>

              {previewAgent && previewAgent.success ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-[#1a1a1a] rounded-lg border border-[#39FF14]/40">
                    <Bot className="w-12 h-12 text-[#39FF14]" />
                    <div>
                      <h3 className="text-xl font-bold text-text">{previewAgent.agentName}</h3>
                      <p className="text-sm text-text/60">
                        {agentTypes.find(t => t.id === agentType)?.label || 'Custom Agent'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-text/40">Naming Convention</label>
                      <p className="text-text text-sm font-mono">[{previewAgent.prefix}]_Ang</p>
                    </div>

                    <div>
                      <label className="text-xs text-text/40">Framework</label>
                      <p className="text-text text-sm">
                        {frameworks.find(f => f.id === selectedFramework)?.name || 'Boomer_Angs'}
                      </p>
                    </div>

                    <div>
                      <label className="text-xs text-text/40">Ceremony Status</label>
                      <div className="flex items-center gap-2 text-[#39FF14] text-sm">
                        <CheckCircle className="w-4 h-4" />
                        <span>Ready for naming ceremony</span>
                      </div>
                    </div>

                    {description && (
                      <div>
                        <label className="text-xs text-text/40">Description</label>
                        <p className="text-text/80 text-sm">{description}</p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleCreateAgent}
                    disabled={creating}
                    className="w-full btn-primary flex items-center justify-center gap-2"
                  >
                    {creating ? (
                      <>
                        <Zap className="w-5 h-5 animate-pulse" />
                        Creating Agent...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Create Agent
                      </>
                    )}
                  </button>
                  {/* Export CSV for production ingestion */}
                  <button
                    onClick={() => {
                      const now = new Date().toISOString();
                      const agent = {
                        agentName: previewAgent?.agentName || `${agentPrefix}_Ang`,
                        prefix: previewAgent?.prefix || agentPrefix,
                        framework: selectedFramework,
                        type: agentType,
                        persona: previewAgent?.persona || '',
                        backstory: previewAgent?.metadata?.backstory || '',
                        goals: previewAgent?.metadata?.goals || [],
                        skills: previewAgent?.metadata?.skills || [],
                        prompts: previewAgent?.metadata?.prompts || {},
                        training_sources: previewAgent?.metadata?.training_sources || [],
                        evaluation_metrics: previewAgent?.metadata?.evaluation_metrics || [],
                        tags: previewAgent?.metadata?.tags || [],
                        notes: description || '',
                        created_by: 'ui-export',
                        created_at: now
                      };
                      const csv = generateAgentCSV([agent]);
                      downloadBlob(`${agent.agentName || 'agent'}.csv`, csv, 'text/csv');
                    }}
                    className="w-full mt-2 btn-outline flex items-center justify-center gap-2"
                  >
                    Export Agent CSV
                  </button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Bot className="w-16 h-16 text-text/20 mx-auto mb-3" />
                  <p className="text-text/40">
                    Enter a valid agent name to see preview
                  </p>
                </div>
              )}
            </div>

            {/* Suggestions */}
            {agentType !== 'custom' && (
              <div className="card">
                <h3 className="text-sm font-semibold text-text mb-2">Suggested Names</h3>
                <div className="flex flex-wrap gap-2">
                  {namingCeremony.suggestPrefixes(agentType).map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePrefixChange(suggestion)}
                      className="px-3 py-1 bg-[#1a1a1a] text-text/60 hover:text-text hover:bg-[#39FF14]/20 rounded text-sm transition-colors"
                    >
                      {suggestion}_Ang
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgentBuilder;
import React, { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { namingCeremony } from '../services/boomerAngNaming';
import { Sparkles, Bot, CheckCircle, AlertCircle, Zap } from 'lucide-react';

function AgentBuilder() {
  const { getToken, isSignedIn } = useAuth();
  const [agentPrefix, setAgentPrefix] = useState('');
  const [agentType, setAgentType] = useState('custom');
  const [selectedFramework, setSelectedFramework] = useState('boomer_angs');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState([]);
  const [previewAgent, setPreviewAgent] = useState(null);
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(null);

  const agentTypes = [
    { id: 'customer_support', label: 'Customer Support', icon: '💬' },
    { id: 'sales', label: 'Sales Assistant', icon: '💰' },
    { id: 'research', label: 'Research Analyst', icon: '🔍' },
    { id: 'code', label: 'Code Assistant', icon: '💻' },
    { id: 'content', label: 'Content Creator', icon: '✍️' },
    { id: 'analytics', label: 'Data Analytics', icon: '📊' },
    { id: 'workflow', label: 'Workflow Automation', icon: '⚙️' },
    { id: 'custom', label: 'Custom Agent', icon: '🎯' }
  ];

  const frameworks = [
    {
      id: 'boomer_angs',
      name: 'Boomer_Angs',
      description: 'Deploy-native agent framework with naming ceremony',
      status: 'recommended',
      maturity: 'production'
    },
    {
      id: 'crewai',
      name: 'CrewAI',
      description: 'Multi-agent workflows, production-ready',
      status: 'available',
      maturity: 'high'
    },
    {
      id: 'microsoft',
      name: 'Microsoft Agent Framework',
      description: 'Enterprise governance, long-running tasks',
      status: 'available',
      maturity: 'very-high'
    },
    {
      id: 'openai',
      name: 'OpenAI Agents SDK',
      description: 'OpenAI ecosystem, GPT-4 agents',
      status: 'available',
      maturity: 'high'
    }
  ];

  const handlePrefixChange = (value) => {
    setAgentPrefix(value);
    setErrors([]);
    
    if (value.trim().length >= 3) {
      const validation = namingCeremony.validatePrefix(value);
      if (!validation.valid) {
        setErrors(validation.errors);
        setPreviewAgent(null);
      } else {
        const agentInfo = namingCeremony.generateAgentName(value);
        setPreviewAgent(agentInfo);
      }
    } else {
      setPreviewAgent(null);
    }
  };

  const handleTypeChange = (type) => {
    setAgentType(type);
    // Auto-suggest a prefix if none entered
    if (!agentPrefix && type !== 'custom') {
      const suggestions = namingCeremony.suggestPrefixes(type);
      if (suggestions.length > 0) {
        handlePrefixChange(suggestions[0]);
      }
    }
  };

  const handleCreateAgent = async () => {
    if (!previewAgent || !previewAgent.success) {
      setErrors(['Please provide a valid agent name']);
      return;
    }

    setCreating(true);
    setErrors([]);

    try {
      const token = await getToken();
      const response = await fetch('/api/agents/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          agentName: previewAgent.agentName,
          prefix: previewAgent.prefix,
          type: agentType,
          framework: selectedFramework,
          description,
          metadata: previewAgent.metadata
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create agent');
      }

      const data = await response.json();
      setCreated(data);
      
      // Reset form
      setTimeout(() => {
        setAgentPrefix('');
        setDescription('');
        setPreviewAgent(null);
        setCreated(null);
      }, 5000);
    } catch (error) {
      setErrors([error.message || 'Failed to create agent']);
    } finally {
      setCreating(false);
    }
  };

  if (!isSignedIn) {
    return (
      <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <Bot className="w-16 h-16 text-[#39FF14] mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-text mb-4">House of Ang</h1>
          <p className="text-text/60 mb-6">Sign in to join the House of Ang and create Boomer_Angs agents</p>
          <a href="/auth" className="btn-primary inline-block">
            Sign In to Continue
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with Illustration - Rebranded to House of Ang */}
        <div className="grid lg:grid-cols-2 gap-12 items-start mb-12">
          {/* Left: House of Ang Illustration */}
          <div className="hidden lg:flex justify-center order-last lg:order-first">
            <img 
              src="/assets/illustrations/house-of-ang-hero.svg" 
              alt="House of Ang" 
              className="w-full max-w-md h-auto drop-shadow-2xl"
              style={{ filter: 'drop-shadow(0 6px 30px rgba(57, 255, 20, 0.18))' }}
            />
          </div>

          {/* Right: Header Text */}
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-3">
              <Sparkles className="w-8 h-8 text-[#39FF14]" />
              <h1 className="text-4xl font-bold text-text">House of Ang</h1>
            </div>
            <p className="text-text/60 text-lg mb-6">
              Build Boomer_Angs — the deploy-native agent model. Naming ceremony included.
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">

        {/* Success Message */}
        {created && (
          <div className="card bg-[#39FF14]/10 border-[#39FF14]">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-[#39FF14] flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-[#39FF14] mb-1">Agent Created Successfully!</h3>
                <p className="text-text/80 text-sm mb-2">
                  <strong>{created.agentName}</strong> is ready to deploy
                </p>
                <pre className="text-xs bg-[#0a0a0a] p-3 rounded border border-[#2a2a2a] text-text/60 overflow-x-auto">
                  {created.certificate || 'Agent deployment initiated...'}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Main Form */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column: Configuration */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-xl font-semibold text-text mb-4">Agent Configuration</h2>

              {/* Agent Type */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-text/80 mb-2">
                  Agent Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {agentTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => handleTypeChange(type.id)}
                      className={`p-3 rounded-lg text-left transition-all ${
                        agentType === type.id
                          ? 'bg-[#39FF14]/20 border border-[#39FF14] text-text'
                          : 'bg-[#1a1a1a] border border-[#2a2a2a] text-text/60 hover:text-text hover:border-[#39FF14]/40'
                      }`}
                    >
                      <span className="text-xl mr-2">{type.icon}</span>
                      <span className="text-sm font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Agent Name Prefix */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-text/80 mb-2">
                  Agent Name Prefix
                </label>
                <input
                  type="text"
                  value={agentPrefix}
                  onChange={(e) => handlePrefixChange(e.target.value)}
                  placeholder="e.g., CustomerSupport, SalesBot, ResearchAI"
                  className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-text focus:border-[#39FF14] focus:outline-none"
                />
                <p className="text-xs text-text/40 mt-1">
                  Will be converted to: <strong>{previewAgent?.agentName || '[YourPrefix]_Ang'}</strong>
                </p>
              </div>

              {/* Errors */}
              {errors.length > 0 && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <div className="space-y-1">
                      {errors.map((error, idx) => (
                        <p key={idx} className="text-sm text-red-400">{error}</p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-text/80 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what your agent will do..."
                  rows={4}
                  className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-text focus:border-[#39FF14] focus:outline-none resize-none"
                />
              </div>

              {/* Framework Selection */}
              <div>
                <label className="block text-sm font-medium text-text/80 mb-2">
                  Agent Framework
                </label>
                <div className="space-y-2">
                  {frameworks.map((framework) => (
                    <button
                      key={framework.id}
                      onClick={() => setSelectedFramework(framework.id)}
                      className={`w-full p-3 rounded-lg text-left transition-all ${
                        selectedFramework === framework.id
                          ? 'bg-[#39FF14]/20 border border-[#39FF14]'
                          : 'bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#39FF14]/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-text">{framework.name}</span>
                        {framework.status === 'recommended' && (
                          <span className="px-2 py-0.5 bg-[#39FF14]/20 text-[#39FF14] text-xs rounded">
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-text/60">{framework.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Preview */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-xl font-semibold text-text mb-4">Agent Preview</h2>

              {previewAgent && previewAgent.success ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-[#1a1a1a] rounded-lg border border-[#39FF14]/40">
                    <Bot className="w-12 h-12 text-[#39FF14]" />
                    <div>
                      <h3 className="text-xl font-bold text-text">{previewAgent.agentName}</h3>
                      <p className="text-sm text-text/60">
                        {agentTypes.find(t => t.id === agentType)?.label || 'Custom Agent'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-text/40">Naming Convention</label>
                      <p className="text-text text-sm font-mono">[{previewAgent.prefix}]_Ang</p>
                    </div>

                    <div>
                      <label className="text-xs text-text/40">Framework</label>
                      <p className="text-text text-sm">
                        {frameworks.find(f => f.id === selectedFramework)?.name || 'Boomer_Angs'}
                      </p>
                    </div>

                    <div>
                      <label className="text-xs text-text/40">Ceremony Status</label>
                      <div className="flex items-center gap-2 text-[#39FF14] text-sm">
                        <CheckCircle className="w-4 h-4" />
                        <span>Ready for naming ceremony</span>
                      </div>
                    </div>

                    {description && (
                      <div>
                        <label className="text-xs text-text/40">Description</label>
                        <p className="text-text/80 text-sm">{description}</p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleCreateAgent}
                    disabled={creating}
                    className="w-full btn-primary flex items-center justify-center gap-2"
                  >
                    {creating ? (
                      <>
                        <Zap className="w-5 h-5 animate-pulse" />
                        Creating Agent...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Create Agent
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Bot className="w-16 h-16 text-text/20 mx-auto mb-3" />
                  <p className="text-text/40">
                    Enter a valid agent name to see preview
                  </p>
                </div>
              )}
            </div>

            {/* Suggestions */}
            {agentType !== 'custom' && (
              <div className="card">
                <h3 className="text-sm font-semibold text-text mb-2">Suggested Names</h3>
                <div className="flex flex-wrap gap-2">
                  {namingCeremony.suggestPrefixes(agentType).map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePrefixChange(suggestion)}
                      className="px-3 py-1 bg-[#1a1a1a] text-text/60 hover:text-text hover:bg-[#39FF14]/20 rounded text-sm transition-colors"
                    >
                      {suggestion}_Ang
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgentBuilder;
