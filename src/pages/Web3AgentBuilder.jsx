import React, { useState } from 'react';
import { Plus, Trash2, Play, Pause, Code2 } from 'lucide-react';

function Web3AgentBuilder() {
  const [agents, setAgents] = useState([
    {
      id: 1,
      name: 'Portfolio Analyzer',
      description: 'Analyzes your holdings across all chains',
      status: 'active',
      tasks: 5,
      lastRun: '2 hours ago'
    },
    {
      id: 2,
      name: 'Yield Optimizer',
      description: 'Finds best yield farming opportunities',
      status: 'paused',
      tasks: 3,
      lastRun: 'Never'
    }
  ]);

  const [showNewAgent, setShowNewAgent] = useState(false);
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentDescription, setNewAgentDescription] = useState('');

  const handleCreateAgent = () => {
    if (newAgentName.trim()) {
      setAgents([...agents, {
        id: agents.length + 1,
        name: newAgentName,
        description: newAgentDescription,
        status: 'paused',
        tasks: 0,
        lastRun: 'Never'
      }]);
      setNewAgentName('');
      setNewAgentDescription('');
      setShowNewAgent(false);
    }
  };

  const toggleAgentStatus = (id) => {
    setAgents(agents.map(agent =>
      agent.id === id
        ? { ...agent, status: agent.status === 'active' ? 'paused' : 'active' }
        : agent
    ));
  };

  const deleteAgent = (id) => {
    setAgents(agents.filter(agent => agent.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Agent Builder
          </h1>
          <p className="text-gray-400">
            Create and manage your custom Web3 AI agents. Automate analysis, trading, and more.
          </p>
        </div>

        {/* Create New Agent Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowNewAgent(!showNewAgent)}
            className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-[#39FF14] to-[#D946EF] text-black font-bold rounded-lg hover:opacity-90 transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Create New Agent
          </button>
        </div>

        {/* New Agent Form */}
        {showNewAgent && (
          <div className="mb-8 p-6 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg">
            <h2 className="text-xl font-bold text-white mb-6">New Agent Configuration</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-white font-medium mb-2">Agent Name</label>
                <input
                  type="text"
                  value={newAgentName}
                  onChange={(e) => setNewAgentName(e.target.value)}
                  placeholder="e.g., Smart Contract Analyzer"
                  className="w-full bg-[#0F0F0F] border border-[#2a2a2a] rounded-lg px-4 py-3 text-gray-300 placeholder-gray-500 focus:border-[#39FF14] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Description</label>
                <textarea
                  value={newAgentDescription}
                  onChange={(e) => setNewAgentDescription(e.target.value)}
                  placeholder="Describe what this agent does..."
                  rows="4"
                  className="w-full bg-[#0F0F0F] border border-[#2a2a2a] rounded-lg px-4 py-3 text-gray-300 placeholder-gray-500 focus:border-[#39FF14] focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleCreateAgent}
                  className="px-4 py-3 bg-[#39FF14] text-black font-bold rounded-lg hover:bg-[#2FCC0A] transition-all"
                >
                  Create Agent
                </button>
                <button
                  onClick={() => setShowNewAgent(false)}
                  className="px-4 py-3 bg-[#2a2a2a] text-gray-300 font-bold rounded-lg hover:bg-[#333333] transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Agents Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 hover:border-[#39FF14]/50 transition-all"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-2">{agent.name}</h3>
                  <p className="text-sm text-gray-400">{agent.description}</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${agent.status === 'active' ? 'bg-[#39FF14]' : 'bg-gray-500'}`} />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-[#2a2a2a]">
                <div>
                  <div className="text-xs text-gray-400 mb-1">Tasks</div>
                  <div className="text-lg font-bold text-[#39FF14]">{agent.tasks}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Last Run</div>
                  <div className="text-sm text-white font-medium">{agent.lastRun}</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => toggleAgentStatus(agent.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#2a2a2a] text-gray-300 rounded-lg hover:bg-[#39FF14]/20 hover:text-[#39FF14] transition-all text-sm font-medium"
                >
                  {agent.status === 'active' ? (
                    <>
                      <Pause className="w-4 h-4" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Start
                    </>
                  )}
                </button>
                <button
                  className="flex items-center justify-center px-3 py-2 bg-[#2a2a2a] text-gray-300 rounded-lg hover:bg-[#D946EF]/20 hover:text-[#D946EF] transition-all"
                  title="Edit agent code"
                >
                  <Code2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteAgent(agent.id)}
                  className="flex items-center justify-center px-3 py-2 bg-[#2a2a2a] text-gray-300 rounded-lg hover:bg-red-500/20 hover:text-red-400 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {agents.length === 0 && !showNewAgent && (
          <div className="text-center py-20">
            <Code2 className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-400 mb-2">No agents yet</h3>
            <p className="text-gray-500 mb-6">Create your first agent to get started</p>
            <button
              onClick={() => setShowNewAgent(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#39FF14] text-black font-bold rounded-lg hover:bg-[#2FCC0A] transition-all"
            >
              <Plus className="w-5 h-5" />
              Create First Agent
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Web3AgentBuilder;
