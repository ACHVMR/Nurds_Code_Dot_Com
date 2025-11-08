import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { namingCeremony } from '../services/boomerAngNaming';
import { Sparkles, Bot, CheckCircle, AlertCircle, Zap, Network, GitBranch, Mic } from 'lucide-react';
import { generateAgentCSV, downloadBlob } from '../utils/agentCsv';

const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787';

function AgentBuilder() {
  const { getToken, isSignedIn } = useAuth();
  const navigate = useNavigate();
  const [builderMode, setBuilderMode] = useState('text'); // 'text' or 'voice'
  const [agentPrefix, setAgentPrefix] = useState('');
  const [agentType, setAgentType] = useState('custom');
  const [selectedFramework, setSelectedFramework] = useState('intelligent_internet');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState([]);
  const [previewAgent, setPreviewAgent] = useState(null);
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(null);
  const [iiAgents, setIiAgents] = useState([]);
  const [loadingAgents, setLoadingAgents] = useState(true);

  // Load II Agents on mount
  useEffect(() => {
    if (isSignedIn) {
      loadIIAgents();
    }
  }, [isSignedIn]);

  const loadIIAgents = async () => {
    try {
      const response = await fetch(`${apiBase}/api/agents`);
      const data = await response.json();
      setIiAgents(data.agents || []);
    } catch (error) {
      console.error('Failed to load II agents:', error);
    } finally {
      setLoadingAgents(false);
    }
  };

  const createACHEEVYAgent = async () => {
    if (!agentPrefix.trim()) {
      setErrors(['Please enter an agent name']);
      return;
    }

    setCreating(true);
    setErrors([]);

    try {
      // Use naming ceremony for ACHEEVY branding
      const agentName = namingCeremony(agentPrefix);
      
      // Register with II Agent system
      const response = await fetch(`${apiBase}/api/agents/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: agentName,
          type: agentType,
          repo_url: `https://github.com/acheevy/${agentName.toLowerCase()}`,
          version: '1.0.0',
          capabilities: ['acheevy-certified', agentType, 'custom-agent'],
          metadata: {
            framework: 'ACHEEVY',
            description: description || 'Custom ACHEEVY agent',
            creator: 'House of Ang',
            created_at: new Date().toISOString()
          }
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setCreated(data.agent);
        loadIIAgents(); // Refresh list
        
        // Reset form
        setTimeout(() => {
          setAgentPrefix('');
          setDescription('');
          setCreated(null);
        }, 3000);
      } else {
        setErrors([data.error || 'Failed to create agent']);
      }
    } catch (error) {
      console.error('Agent creation error:', error);
      setErrors(['Network error. Please try again.']);
    } finally {
      setCreating(false);
    }
  };

  if (!isSignedIn) {
    return (
      <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <Bot className="w-16 h-16 text-[#E68961] mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-text mb-4">House of Ang</h1>
          <p className="text-text/60 mb-6">Sign in to join the House of Ang and create ACHEEVY agents</p>
          <a href="/auth" className="btn-primary inline-block">Sign In to Continue</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Network className="w-10 h-10 text-accent" />
              <h1 className="text-4xl font-bold text-text">House of Ang - ACHEEVY Agent Builder</h1>
            </div>
            {/* Mode Toggle */}
            <div className="flex items-center gap-2 bg-[#2a2a2a] rounded-lg p-1">
              <button
                onClick={() => setBuilderMode('text')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  builderMode === 'text' ? 'bg-[#E68961] text-black' : 'text-white hover:bg-[#3a3a3a]'
                }`}
              >
                Text Mode
              </button>
              <button
                onClick={() => navigate('/agents/voice-builder')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white hover:bg-[#3a3a3a] transition-colors"
              >
                <Mic className="w-4 h-4" />
                Voice Mode
              </button>
            </div>
          </div>
          <p className="text-text/70 text-lg">
            Create production-ready ACHEEVY agents powered by Intelligent Internet orchestration
          </p>
        </div>

        {/* Create Agent Form */}
        <div className="bg-[#1a1a1a] rounded-lg p-8 border border-accent/20 mb-8">
          <h2 className="text-2xl font-bold text-text mb-6 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-accent" />
            Create New ACHEEVY Agent
          </h2>

          <div className="space-y-6">
            {/* Agent Name */}
            <div>
              <label className="block text-text mb-2 font-medium">Agent Name</label>
              <input
                type="text"
                value={agentPrefix}
                onChange={(e) => setAgentPrefix(e.target.value)}
                placeholder="Enter agent name (will be branded with ACHEEVY ceremony)"
                className="w-full px-4 py-3 bg-background border border-[#2a2a2a] rounded-lg text-text focus:border-accent focus:outline-none"
              />
              {agentPrefix && (
                <p className="mt-2 text-sm text-accent">
                  → Will be named: {namingCeremony(agentPrefix)}
                </p>
              )}
            </div>

            {/* Agent Type */}
            <div>
              <label className="block text-text mb-2 font-medium">Agent Type</label>
              <select
                value={agentType}
                onChange={(e) => setAgentType(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-[#2a2a2a] rounded-lg text-text focus:border-accent focus:outline-none"
              >
                <option value="custom">Custom Agent</option>
                <option value="orchestrator">Orchestrator</option>
                <option value="code">Code Agent</option>
                <option value="task">Task Agent</option>
                <option value="data">Data Agent</option>
                <option value="monitor">Monitor Agent</option>
              </select>
            </div>

            {/* Framework */}
            <div>
              <label className="block text-text mb-2 font-medium">Framework</label>
              <select
                value={selectedFramework}
                onChange={(e) => setSelectedFramework(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-[#2a2a2a] rounded-lg text-text focus:border-accent focus:outline-none"
              >
                <option value="intelligent_internet">Intelligent Internet (II Agent)</option>
                <option value="boomer_angs">Boomer Angs (Legacy)</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-text mb-2 font-medium">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this agent does..."
                rows={3}
                className="w-full px-4 py-3 bg-background border border-[#2a2a2a] rounded-lg text-text focus:border-accent focus:outline-none"
              />
            </div>

            {/* Errors */}
            {errors.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
                {errors.map((error, i) => (
                  <div key={i} className="flex items-center gap-2 text-red-500">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Success */}
            {created && (
              <div className="bg-accent/10 border border-accent/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-accent">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Agent "{created.name}" created successfully!</span>
                </div>
              </div>
            )}

            {/* Create Button */}
            <button
              onClick={createACHEEVYAgent}
              disabled={creating || !agentPrefix.trim()}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {creating ? (
                <>
                  <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin" />
                  Creating Agent...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Create ACHEEVY Agent
                </>
              )}
            </button>
          </div>
        </div>

        {/* II Agent Integration Status */}
        <div className="bg-[#1a1a1a] rounded-lg p-8 border border-accent/20">
          <h2 className="text-2xl font-bold text-text mb-6 flex items-center gap-2">
            <GitBranch className="w-6 h-6 text-accent" />
            Intelligent Internet Integration
          </h2>

          {loadingAgents ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-text/60">Loading II Agents...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-background rounded-lg p-4 border border-accent/30">
                <div className="text-3xl font-bold text-accent mb-1">{iiAgents.length}</div>
                <div className="text-text/70 text-sm">Total Agents</div>
              </div>
              <div className="bg-background rounded-lg p-4 border border-accent/30">
                <div className="text-3xl font-bold text-accent mb-1">
                  {iiAgents.filter(a => a.status === 'active').length}
                </div>
                <div className="text-text/70 text-sm">Active Agents</div>
              </div>
              <div className="bg-background rounded-lg p-4 border border-accent/30">
                <div className="text-3xl font-bold text-accent mb-1">
                  {iiAgents.filter(a => a.metadata?.framework === 'ACHEEVY').length}
                </div>
                <div className="text-text/70 text-sm">ACHEEVY Agents</div>
              </div>
            </div>
          )}

          <div className="mt-6">
            <a 
              href="/agent-dashboard" 
              className="text-accent hover:text-accent/80 flex items-center gap-2 transition-colors"
            >
              <Network className="w-5 h-5" />
              View Full Agent Dashboard →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgentBuilder;
