import React, { useState } from 'react';

// Boomer_Angs Agent Naming System
const agentPrefixes = ['Byte', 'Vibe', 'Nurd', 'Code', 'Flux', 'Nova', 'Sage', 'Sync'];
const agentRoles = [
  { id: 'coder', name: 'Code Assistant', icon: '💻', desc: 'Writes and debugs code' },
  { id: 'reviewer', name: 'Code Reviewer', icon: '🔍', desc: 'Reviews and suggests improvements' },
  { id: 'architect', name: 'System Architect', icon: '🏗️', desc: 'Designs system architecture' },
  { id: 'tester', name: 'QA Tester', icon: '🧪', desc: 'Creates and runs tests' },
  { id: 'devops', name: 'DevOps Engineer', icon: '🚀', desc: 'CI/CD and deployment' },
  { id: 'docs', name: 'Documentation', icon: '📚', desc: 'Writes documentation' },
];

function AgentBuilder() {
  const [agentName, setAgentName] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedModel, setSelectedModel] = useState('groq-70b');
  const [createdAgents, setCreatedAgents] = useState([]);
  const [generating, setGenerating] = useState(false);

  const generateAgentName = () => {
    const prefix = agentPrefixes[Math.floor(Math.random() * agentPrefixes.length)];
    const suffix = 'Ang' + Math.floor(Math.random() * 99);
    return `${prefix}_${suffix}`;
  };

  const handleGenerateName = () => {
    setAgentName(generateAgentName());
  };

  const handleCreateAgent = async () => {
    if (!agentName || !selectedRole) {
      alert('Please provide agent name and select a role');
      return;
    }

    setGenerating(true);
    
    // Simulate agent creation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newAgent = {
      id: Date.now(),
      name: agentName,
      role: agentRoles.find(r => r.id === selectedRole),
      model: selectedModel,
      status: 'active',
      created: new Date().toLocaleString(),
    };
    
    setCreatedAgents([newAgent, ...createdAgents]);
    setAgentName('');
    setSelectedRole('');
    setGenerating(false);
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-text">Agent Builder</h1>
          <p className="tagline text-xl">Create Your Boomer_Angs</p>
        </div>

        {/* Agent Creation Form */}
        <div className="panel mb-8">
          <h2 className="text-xl font-semibold mb-4 text-text">Build New Agent</h2>
          
          {/* Agent Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-text">Agent Name</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="e.g., Byte_Ang42"
                className="input-field flex-1"
              />
              <button 
                onClick={handleGenerateName}
                className="btn-secondary px-4"
              >
                🎲 Generate
              </button>
            </div>
            <p className="text-xs text-mute mt-1">Format: [Prefix]_Ang[Number]</p>
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-text">Agent Role</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {agentRoles.map(role => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`p-4 border rounded-lg text-left transition-all ${
                    selectedRole === role.id 
                      ? 'border-accent bg-accent/10' 
                      : 'border-border hover:border-accent/50'
                  }`}
                >
                  <div className="text-2xl mb-1">{role.icon}</div>
                  <div className="font-medium text-text text-sm">{role.name}</div>
                  <div className="text-xs text-mute">{role.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Model Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-text">AI Model</label>
            <select 
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="input-field w-full"
            >
              <option value="groq-8b">GROQ 8B (Fast, Free tier)</option>
              <option value="groq-70b">GROQ 70B (Balanced)</option>
              <option value="gpt-4o-mini">GPT-4o Mini (Pro tier)</option>
              <option value="claude-sonnet">Claude Sonnet (Enterprise)</option>
            </select>
          </div>

          {/* Create Button */}
          <button
            onClick={handleCreateAgent}
            disabled={generating}
            className={`btn-primary w-full py-3 ${generating ? 'opacity-50' : ''}`}
          >
            {generating ? '⚙️ Creating Agent...' : '🚀 Create Agent'}
          </button>
        </div>

        {/* Created Agents List */}
        {createdAgents.length > 0 && (
          <div className="panel">
            <h2 className="text-xl font-semibold mb-4 text-text">Your Agents</h2>
            <div className="space-y-3">
              {createdAgents.map(agent => (
                <div key={agent.id} className="flex items-center gap-4 p-4 bg-black/20 rounded-lg">
                  <div className="text-3xl">{agent.role.icon}</div>
                  <div className="flex-1">
                    <div className="font-semibold text-text">{agent.name}</div>
                    <div className="text-sm text-mute">{agent.role.name} · {agent.model}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-xs text-mute">{agent.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AgentBuilder;
