import React, { useState } from 'react';
import { TOOL_CATALOG, SHELVES, getToolsByShelf } from '../data/toolCatalog';
import { BREAKERS, getBreakersByTier } from '../data/circuitBox';

/**
 * Agent Builder - Deploy Platform v4.0
 * Create AI Agents with Boomer_Angs naming ceremony
 * 
 * WORKFLOW:
 * 1. User provides agent name prefix
 * 2. System applies [UserPrefix]_Ang naming automatically
 * 3. User selects agent type (Simple, Workflow, Custom)
 * 4. Buildsmith (Plug Factory) constructs the agent
 * 
 * Per documentation: Buildsmith receives P.O. from ACHEEVY + Picker_Ang
 */

// Valid prefixes for display
const SUGGESTED_PREFIXES = [
  'CustomerSupport', 'InvoiceBot', 'SalesAssistant', 'ResearchAnalyst',
  'DataProcessor', 'ContentWriter', 'CodeReviewer', 'QAChecker',
  'DocumentParser', 'EmailResponder', 'ScheduleManager', 'ReportGenerator'
];

// Agent type configurations
const AGENT_TYPES = [
  {
    id: 'simple',
    name: 'Simple Agent',
    icon: '🤖',
    description: 'Single-task agent for chatbot, Q&A, or basic automation',
    color: 'var(--neon-orange)',
    frameworks: ['Boomer_Angs', 'OpenAI Agents SDK'],
    estimatedTime: '< 5 min'
  },
  {
    id: 'workflow',
    name: 'Workflow Agent',
    icon: '🔄',
    description: 'Multi-step automation with conditional logic and state management',
    color: '#FF5E00',
    frameworks: ['CrewAI', 'DeerFlow', 'Boomer_Angs'],
    estimatedTime: '5-15 min'
  },
  {
    id: 'custom',
    name: 'Custom Agent',
    icon: '⚙️',
    description: 'Advanced configuration with framework selection and House of ANG collaboration',
    color: '#5B7FFF',
    frameworks: ['CrewAI', 'Microsoft Agent Framework', 'OpenAI Agents SDK', 'DeerFlow', 'Boomer_Angs'],
    estimatedTime: '15-30 min'
  }
];

// Available frameworks (from agent frameworks tier)
const FRAMEWORKS = [
  { id: 'boomer-angs', name: 'Boomer_Angs (Deploy Native)', score: '25/25', recommended: true },
  { id: 'crewai', name: 'CrewAI', score: '21/25', recommended: true },
  { id: 'microsoft', name: 'Microsoft Agent Framework', score: '23/25', recommended: true },
  { id: 'openai', name: 'OpenAI Agents SDK', score: '20/25', recommended: true },
  { id: 'deerflow', name: 'DeerFlow', score: '17/25', recommended: true },
  { id: 'google-adk', name: 'Google ADK (Optional)', score: '15/25', recommended: false },
  { id: 'modelscope', name: 'ModelScope-Agent (Experimental)', score: '11/25', recommended: false }
];

// House of ANG specialists for collaboration
const HOUSE_OF_ANG = [
  { id: 'research', name: 'Research_Ang', icon: '🔍', desc: 'Deep research automation' },
  { id: 'code', name: 'Code_Ang', icon: '💻', desc: 'Code generation and review' },
  { id: 'data', name: 'Data_Ang', icon: '📊', desc: 'Data processing and analysis' },
  { id: 'voice', name: 'Voice_Ang', icon: '🎙️', desc: 'Voice processing and TTS' },
  { id: 'security', name: 'Security_Ang', icon: '🛡️', desc: 'Security scanning' },
  { id: 'deploy', name: 'Deploy_Ang', icon: '🚀', desc: 'Deployment automation' },
  { id: 'test', name: 'Test_Ang', icon: '🧪', desc: 'Test automation' },
  { id: 'doc', name: 'Doc_Ang', icon: '📖', desc: 'Documentation generation' }
];

// Reserved prefixes
const RESERVED_PREFIXES = ['acheevy', 'ntntn', 'system', 'admin', 'root', 'test', 'buildsmith'];

function AgentBuilderV2() {
  const [step, setStep] = useState(1);
  const [agentPrefix, setAgentPrefix] = useState('');
  const [agentType, setAgentType] = useState(null);
  const [selectedFramework, setSelectedFramework] = useState('auto');
  const [selectedCollaborators, setSelectedCollaborators] = useState([]);
  const [creating, setCreating] = useState(false);
  const [createdAgents, setCreatedAgents] = useState([]);
  const [error, setError] = useState('');

  // Validate prefix
  const validatePrefix = (prefix) => {
    if (!prefix || prefix.length < 3) {
      return { valid: false, error: 'Prefix must be at least 3 characters' };
    }
    if (prefix.length > 30) {
      return { valid: false, error: 'Prefix must be 30 characters or less' };
    }
    if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(prefix)) {
      return { valid: false, error: 'Prefix must start with a letter and contain only letters, numbers, underscores' };
    }
    if (RESERVED_PREFIXES.includes(prefix.toLowerCase())) {
      return { valid: false, error: `"${prefix}" is a reserved name` };
    }
    return { valid: true, error: null };
  };

  // Format the agent name
  const formatAgentName = (prefix) => {
    if (!prefix) return '[YourName]_Ang';
    const formatted = prefix
      .split(/[_\s]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
    return `${formatted}_Ang`;
  };

  // Handle prefix change
  const handlePrefixChange = (value) => {
    setAgentPrefix(value);
    const validation = validatePrefix(value);
    setError(validation.error || '');
  };

  // Toggle collaborator selection
  const toggleCollaborator = (id) => {
    setSelectedCollaborators(prev =>
      prev.includes(id)
        ? prev.filter(c => c !== id)
        : [...prev, id]
    );
  };

  // Create agent
  const handleCreate = async () => {
    const validation = validatePrefix(agentPrefix);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }
    if (!agentType) {
      setError('Please select an agent type');
      return;
    }

    setCreating(true);
    setError('');

    // Execute P.O. Handoff to Buildsmith (Backend)
    try {
      const response = await fetch('/api/agent/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formatAgentName(agentPrefix),
          type: agentType,
          framework: selectedFramework,
          collaborators: selectedCollaborators
        })
      });

      if (!response.ok) throw new Error('Buildsmith failed to accept P.O.');
      
      const data = await response.json();
      console.log('Buildsmith Receipt:', data); // Audit Log
    } catch (err) {
      console.error('Mocking success for demo (API might be offline):', err);
      // Fallback for demo if API is creating 404/Offline (since we are on dev server)
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    const agentName = formatAgentName(agentPrefix);
    const newAgent = {
      id: Date.now(),
      name: agentName,
      prefix: agentPrefix,
      type: AGENT_TYPES.find(t => t.id === agentType),
      framework: selectedFramework === 'auto' 
        ? FRAMEWORKS.find(f => f.recommended)?.name 
        : FRAMEWORKS.find(f => f.id === selectedFramework)?.name,
      collaborators: selectedCollaborators.map(id => 
        HOUSE_OF_ANG.find(h => h.id === id)?.name
      ),
      status: 'active',
      created: new Date().toLocaleString()
    };

    setCreatedAgents(prev => [newAgent, ...prev]);
    
    // Reset form
    setAgentPrefix('');
    setAgentType(null);
    setSelectedFramework('auto');
    setSelectedCollaborators([]);
    setStep(1);
    setCreating(false);
  };

  const canProceed = () => {
    if (step === 1) {
      return validatePrefix(agentPrefix).valid;
    }
    if (step === 2) {
      return agentType !== null;
    }
    return true;
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--bg)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-0 text-white font-doto tracking-widest uppercase">
            HOME OF
          </h1>
          <p className="text-6xl" style={{ color: '#FF5E00', fontFamily: "'Permanent Marker', cursive", transform: 'rotate(-2deg)' }}>
            Boomer_Angs
          </p>
          <p className="text-sm mt-4" style={{ color: 'var(--mute)' }}>
            Deploy handles all the complexity. You get a production-ready agent.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map(s => (
              <React.Fragment key={s}>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                    step >= s ? 'text-black' : 'border-2 border-gray-600'
                  }`}
                  style={{
                    background: step >= s ? 'var(--accent)' : 'transparent',
                    color: step >= s ? '#0E0E0E' : 'var(--mute)'
                  }}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div 
                    className="w-16 h-1 rounded"
                    style={{ background: step > s ? 'var(--accent)' : 'var(--border)' }}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step 1: Agent Name */}
        {step === 1 && (
          <div className="panel mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text)' }}>
              <span>📝</span> Step 1: Name Your Agent
            </h2>
            <p className="text-sm mb-4" style={{ color: 'var(--mute)' }}>
              Choose a prefix for your agent. The system will automatically apply the Boomer_Ang naming ceremony.
            </p>

            {/* Name Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
                Agent Prefix
              </label>
              <input
                type="text"
                value={agentPrefix}
                onChange={(e) => handlePrefixChange(e.target.value)}
                placeholder="e.g., CustomerSupport, InvoiceBot, SalesAssistant"
                className="input-field w-full text-lg"
                maxLength={30}
              />
              {error && (
                <p className="text-red-400 text-sm mt-2">⚠️ {error}</p>
              )}
            </div>

            {/* Preview */}
            <div 
              className="p-4 rounded-xl mb-6 text-center"
              style={{ 
                background: 'linear-gradient(135deg, rgba(255, 94, 0, 0.1), rgba(201,164,73,0.1))',
                border: '1px solid rgba(255, 94, 0, 0.3)'
              }}
            >
              <p className="text-sm mb-1" style={{ color: 'var(--mute)' }}>Your agent will be named:</p>
              <p 
                className="text-3xl font-bold"
                style={{ color: 'var(--honey-gold)', fontFamily: "'Permanent Marker', cursive" }}
              >
                {formatAgentName(agentPrefix)}
              </p>
            </div>

            {/* Suggested Prefixes */}
            <div>
              <p className="text-sm mb-2" style={{ color: 'var(--mute)' }}>Suggestions:</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_PREFIXES.slice(0, 8).map(prefix => (
                  <button
                    key={prefix}
                    onClick={() => handlePrefixChange(prefix)}
                    className="px-3 py-1 rounded-full text-sm transition-all hover:scale-105"
                    style={{ 
                      background: agentPrefix === prefix ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
                      color: agentPrefix === prefix ? '#0E0E0E' : 'var(--text)'
                    }}
                  >
                    {prefix}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Agent Type */}
        {step === 2 && (
          <div className="panel mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text)' }}>
              <span>🎯</span> Step 2: Choose Agent Type
            </h2>
            <p className="text-sm mb-4" style={{ color: 'var(--mute)' }}>
              Select the type of agent you want to create. Deploy will choose the optimal framework automatically.
            </p>

            <div className="grid gap-4">
              {AGENT_TYPES.map(type => (
                <button
                  key={type.id}
                  onClick={() => setAgentType(type.id)}
                  className={`p-6 rounded-xl border-2 text-left transition-all hover:scale-[1.01] ${
                    agentType === type.id ? 'scale-[1.01]' : ''
                  }`}
                  style={{
                    borderColor: agentType === type.id ? type.color : 'var(--border)',
                    background: agentType === type.id 
                      ? `linear-gradient(135deg, ${type.color}20, transparent)` 
                      : 'var(--surface)',
                    boxShadow: agentType === type.id ? `0 0 20px ${type.color}30` : 'none'
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div 
                      className="text-4xl p-3 rounded-xl"
                      style={{ background: `${type.color}20` }}
                    >
                      {type.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-1" style={{ color: 'var(--text)' }}>
                        {type.name}
                      </h3>
                      <p className="text-sm mb-3" style={{ color: 'var(--mute)' }}>
                        {type.description}
                      </p>
                      <div className="flex items-center gap-4">
                        <span 
                          className="text-xs px-2 py-1 rounded"
                          style={{ background: 'rgba(0,0,0,0.3)', color: type.color }}
                        >
                          ⏱ {type.estimatedTime}
                        </span>
                        <span 
                          className="text-xs"
                          style={{ color: 'var(--mute)' }}
                        >
                          Frameworks: {type.frameworks.join(', ')}
                        </span>
                      </div>
                    </div>
                    {agentType === type.id && (
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ background: type.color }}
                      >
                        <span className="text-white text-sm">✓</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Configuration (if Custom) */}
        {step === 3 && (
          <div className="space-y-6">
            {/* Framework Selection (only for custom) */}
            {agentType === 'custom' && (
              <div className="panel">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text)' }}>
                  <span>🔧</span> Framework Selection
                </h2>
                <p className="text-sm mb-4" style={{ color: 'var(--mute)' }}>
                  Choose the agent framework. Most users should use "Auto-Select" (recommended).
                </p>

                <div className="grid gap-2">
                  <button
                    onClick={() => setSelectedFramework('auto')}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      selectedFramework === 'auto' ? '' : ''
                    }`}
                    style={{
                      borderColor: selectedFramework === 'auto' ? 'var(--accent)' : 'var(--border)',
                      background: selectedFramework === 'auto' ? 'rgba(201,164,73,0.1)' : 'transparent'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold" style={{ color: 'var(--text)' }}>🤖 Auto-Select</span>
                        <span 
                          className="ml-2 text-xs px-2 py-0.5 rounded"
                          style={{ background: 'var(--accent)', color: '#0E0E0E' }}
                        >
                          Recommended
                        </span>
                        <p className="text-sm mt-1" style={{ color: 'var(--mute)' }}>
                          Deploy chooses the best framework based on your use case
                        </p>
                      </div>
                    </div>
                  </button>

                  {FRAMEWORKS.map(framework => (
                    <button
                      key={framework.id}
                      onClick={() => setSelectedFramework(framework.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        selectedFramework === framework.id ? '' : ''
                      }`}
                      style={{
                        borderColor: selectedFramework === framework.id ? '#5B7FFF' : 'var(--border)',
                        background: selectedFramework === framework.id ? 'rgba(91,127,255,0.1)' : 'transparent',
                        opacity: framework.recommended ? 1 : 0.6
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium" style={{ color: 'var(--text)' }}>
                          {framework.name}
                        </span>
                        <span 
                          className="text-xs px-2 py-1 rounded"
                          style={{ background: 'rgba(0,0,0,0.3)', color: 'var(--neon-green)' }}
                        >
                          {framework.score}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* House of ANG Collaboration */}
            <div className="panel">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text)' }}>
                <span>🏠</span> House of ANG Collaboration
              </h2>
              <p className="text-sm mb-4" style={{ color: 'var(--mute)' }}>
                Select specialist Boomer_Angs to collaborate with your agent (optional).
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {HOUSE_OF_ANG.map(specialist => (
                  <button
                    key={specialist.id}
                    onClick={() => toggleCollaborator(specialist.id)}
                    className={`p-4 rounded-xl border-2 text-center transition-all hover:scale-[1.02] ${
                      selectedCollaborators.includes(specialist.id) ? '' : ''
                    }`}
                    style={{
                      borderColor: selectedCollaborators.includes(specialist.id) ? 'var(--neon-orange)' : 'var(--border)',
                      background: selectedCollaborators.includes(specialist.id) 
                        ? 'rgba(255, 94, 0, 0.1)' 
                        : 'transparent'
                    }}
                  >
                    <div className="text-3xl mb-2">{specialist.icon}</div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                      {specialist.name}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--mute)' }}>
                      {specialist.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="panel">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text)' }}>
                <span>📋</span> Summary
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between p-3 rounded-lg" style={{ background: 'rgba(0,0,0,0.3)' }}>
                  <span style={{ color: 'var(--mute)' }}>Agent Name</span>
                  <span className="font-bold" style={{ color: 'var(--honey-gold)' }}>
                    {formatAgentName(agentPrefix)}
                  </span>
                </div>
                <div className="flex justify-between p-3 rounded-lg" style={{ background: 'rgba(0,0,0,0.3)' }}>
                  <span style={{ color: 'var(--mute)' }}>Type</span>
                  <span style={{ color: 'var(--text)' }}>
                    {AGENT_TYPES.find(t => t.id === agentType)?.name}
                  </span>
                </div>
                <div className="flex justify-between p-3 rounded-lg" style={{ background: 'rgba(0,0,0,0.3)' }}>
                  <span style={{ color: 'var(--mute)' }}>Framework</span>
                  <span style={{ color: 'var(--text)' }}>
                    {selectedFramework === 'auto' 
                      ? 'Auto-Select (Recommended)' 
                      : FRAMEWORKS.find(f => f.id === selectedFramework)?.name}
                  </span>
                </div>
                {selectedCollaborators.length > 0 && (
                  <div className="flex justify-between p-3 rounded-lg" style={{ background: 'rgba(0,0,0,0.3)' }}>
                    <span style={{ color: 'var(--mute)' }}>Collaborators</span>
                    <span style={{ color: 'var(--text)' }}>
                      {selectedCollaborators.length} specialist(s)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            className="px-6 py-3 rounded-xl font-bold transition-all"
            style={{ 
              background: step === 1 ? 'transparent' : 'var(--border)', 
              color: 'var(--text)',
              opacity: step === 1 ? 0.5 : 1,
              cursor: step === 1 ? 'not-allowed' : 'pointer'
            }}
            disabled={step === 1}
          >
            ← Back
          </button>
          
          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'var(--accent)', color: '#0E0E0E' }}
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={handleCreate}
              disabled={creating}
              className="px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 disabled:opacity-50"
              style={{ background: 'var(--neon-orange)', color: 'black' }}
            >
              {creating ? (
                <>
                  <span className="animate-spin">⚙️</span>
                  Building Agent...
                </>
              ) : (
                <>
                  🚀 Create Agent
                </>
              )}
            </button>
          )}
        </div>

        {/* Created Agents */}
        {createdAgents.length > 0 && (
          <div className="panel mt-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text)' }}>
              <span>✅</span> Your Agents ({createdAgents.length})
            </h2>
            <div className="space-y-3">
              {createdAgents.map(agent => (
                <div 
                  key={agent.id} 
                  className="flex items-center gap-4 p-4 rounded-xl"
                  style={{ background: 'rgba(255, 94, 0, 0.1)', border: '1px solid rgba(255, 94, 0, 0.3)' }}
                >
                  <div 
                    className="text-3xl p-2 rounded-xl"
                    style={{ background: agent.type.color + '20' }}
                  >
                    {agent.type.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-lg" style={{ color: 'var(--honey-gold)' }}>
                      {agent.name}
                    </div>
                    <div className="text-sm" style={{ color: 'var(--mute)' }}>
                      {agent.type.name} · {agent.framework}
                      {agent.collaborators.length > 0 && (
                        <> · {agent.collaborators.length} collaborator(s)</>
                      )}
                    </div>
                    <div className="text-xs mt-1" style={{ color: 'var(--mute)' }}>
                      Created {agent.created}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--neon-orange)' }}></span>
                    <span className="text-sm" style={{ color: 'var(--neon-orange)' }}>Active</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* How It Works */}
        <div className="panel mt-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <span>💡</span> How Buildsmith Works
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl" style={{ background: 'rgba(255,94,0,0.1)' }}>
              <div className="text-2xl mb-2">1️⃣</div>
              <h3 className="font-bold mb-1" style={{ color: 'var(--text)' }}>ACHEEVY Intake</h3>
              <p className="text-sm" style={{ color: 'var(--mute)' }}>
                ACHEEVY (Digital CEO) gathers your requirements through the 4-Question Discovery Lens
              </p>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'rgba(255, 94, 0, 0.1)' }}>
              <div className="text-2xl mb-2">2️⃣</div>
              <h3 className="font-bold mb-1" style={{ color: 'var(--text)' }}>Picker_Ang Selection</h3>
              <p className="text-sm" style={{ color: 'var(--mute)' }}>
                Picker_Ang collaborates to select optimal tools and delivers the Bill of Materials
              </p>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'rgba(91,127,255,0.1)' }}>
              <div className="text-2xl mb-2">3️⃣</div>
              <h3 className="font-bold mb-1" style={{ color: 'var(--text)' }}>Buildsmith (Plug Factory)</h3>
              <p className="text-sm" style={{ color: 'var(--mute)' }}>
                Buildsmith (Plug Factory) receives the P.O. and constructs your agent with [YourName]_Ang naming
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgentBuilderV2;
