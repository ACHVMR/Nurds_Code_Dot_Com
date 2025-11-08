import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Cpu, 
  Loader, 
  Pause, 
  Play, 
  RefreshCw,
  TrendingUp,
  Zap
} from 'lucide-react';

export default function AgentDashboard() {
  const { user } = useUser();
  const [agents, setAgents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // 'all', 'code', 'task', 'data', 'monitor', 'orchestrator'
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'inactive'

  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787';

  useEffect(() => {
    loadAgents();
    const interval = setInterval(loadAgents, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const loadAgents = async () => {
    try {
      const response = await fetch(`${apiBase}/api/agents`);
      const data = await response.json();
      setAgents(data.agents || []);
      calculateStats(data.agents || []);
    } catch (error) {
      console.error('Failed to load agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (agentList) => {
    const stats = {
      total: agentList.length,
      active: agentList.filter(a => a.status === 'active').length,
      inactive: agentList.filter(a => a.status === 'inactive').length,
      error: agentList.filter(a => a.status === 'error').length,
      byType: {
        orchestrator: agentList.filter(a => a.type === 'orchestrator').length,
        code: agentList.filter(a => a.type === 'code').length,
        task: agentList.filter(a => a.type === 'task').length,
        data: agentList.filter(a => a.type === 'data').length,
        monitor: agentList.filter(a => a.type === 'monitor').length
      }
    };
    setStats(stats);
  };

  const toggleAgent = async (agentId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const response = await fetch(`${apiBase}/api/agents/${agentId}/${newStatus === 'active' ? 'start' : 'stop'}`, {
        method: 'POST'
      });

      if (response.ok) {
        loadAgents(); // Reload agents
      }
    } catch (error) {
      console.error('Failed to toggle agent:', error);
    }
  };

  const filteredAgents = agents.filter(agent => {
    if (filterType !== 'all' && agent.type !== filterType) return false;
    if (filterStatus !== 'all' && agent.status !== filterStatus) return false;
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-[#E68961]';
      case 'inactive': return 'text-gray-400';
      case 'error': return 'text-red-500';
      case 'paused': return 'text-yellow-500';
      case 'deploying': return 'text-blue-500';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-5 h-5" />;
      case 'inactive': return <Pause className="w-5 h-5" />;
      case 'error': return <AlertCircle className="w-5 h-5" />;
      case 'paused': return <Clock className="w-5 h-5" />;
      case 'deploying': return <RefreshCw className="w-5 h-5 animate-spin" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'orchestrator': return <Cpu className="w-5 h-5" />;
      case 'code': return <Activity className="w-5 h-5" />;
      case 'task': return <Zap className="w-5 h-5" />;
      case 'data': return <TrendingUp className="w-5 h-5" />;
      case 'monitor': return <Activity className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader className="w-12 h-12 animate-spin text-[#E68961]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-900">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Permanent Marker, cursive' }}>
                Agent Dashboard
              </h1>
              <p className="text-gray-400">Intelligent Internet Agent Orchestration</p>
            </div>
            <button
              onClick={loadAgents}
              className="flex items-center gap-2 px-4 py-2 bg-[#E68961] text-black rounded-lg hover:bg-[#D4A05F] transition-colors font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {/* Stats Grid */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
              <StatCard
                label="Total Agents"
                value={stats.total}
                icon={<Cpu />}
                color="text-white"
              />
              <StatCard
                label="Active"
                value={stats.active}
                icon={<CheckCircle />}
                color="text-[#E68961]"
              />
              <StatCard
                label="Inactive"
                value={stats.inactive}
                icon={<Pause />}
                color="text-gray-400"
              />
              <StatCard
                label="Errors"
                value={stats.error}
                icon={<AlertCircle />}
                color="text-red-500"
              />
              <StatCard
                label="Orchestrators"
                value={stats.byType.orchestrator}
                icon={<Zap />}
                color="text-blue-400"
              />
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="flex flex-wrap gap-4 mb-6">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Filter by Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-[#E68961]"
            >
              <option value="all">All Types</option>
              <option value="orchestrator">Orchestrator</option>
              <option value="code">Code</option>
              <option value="task">Task</option>
              <option value="data">Data</option>
              <option value="monitor">Monitor</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-[#E68961]"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="error">Error</option>
            </select>
          </div>
        </div>

        {/* Agent Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAgents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onToggle={toggleAgent}
              getStatusColor={getStatusColor}
              getStatusIcon={getStatusIcon}
              getTypeIcon={getTypeIcon}
            />
          ))}
        </div>

        {filteredAgents.length === 0 && (
          <div className="text-center py-12">
            <Activity className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400 text-lg">No agents found matching filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400 text-sm">{label}</span>
        <div className={color}>{icon}</div>
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </div>
  );
}

function AgentCard({ agent, onToggle, getStatusColor, getStatusIcon, getTypeIcon }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-[#E68961] transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-[#E68961]">
            {getTypeIcon(agent.type)}
          </div>
          <div>
            <h3 className="font-bold text-lg">{agent.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs px-2 py-0.5 bg-zinc-800 rounded text-gray-400">
                {agent.type}
              </span>
              <span className="text-xs text-gray-500">v{agent.version}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className={`flex items-center gap-2 mb-4 ${getStatusColor(agent.status)}`}>
        {getStatusIcon(agent.status)}
        <span className="text-sm font-medium capitalize">{agent.status}</span>
      </div>

      {/* Metadata */}
      {agent.metadata?.description && (
        <p className="text-sm text-gray-400 mb-4 line-clamp-2">{agent.metadata.description}</p>
      )}

      {/* Capabilities */}
      {agent.capabilities && agent.capabilities.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {agent.capabilities.slice(0, 3).map((capability, idx) => (
              <span
                key={idx}
                className="text-xs px-2 py-1 bg-zinc-800 text-[#E68961] rounded"
              >
                {capability}
              </span>
            ))}
            {agent.capabilities.length > 3 && (
              <span className="text-xs px-2 py-1 bg-zinc-800 text-gray-400 rounded">
                +{agent.capabilities.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onToggle(agent.id, agent.status)}
          disabled={agent.status === 'error' || agent.status === 'deploying'}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
            agent.status === 'active'
              ? 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
              : 'bg-[#E68961] text-black hover:bg-[#D4A05F]'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {agent.status === 'active' ? (
            <span className="flex items-center gap-2 justify-center">
              <Pause className="w-4 h-4" /> Stop
            </span>
          ) : (
            <span className="flex items-center gap-2 justify-center">
              <Play className="w-4 h-4" /> Start
            </span>
          )}
        </button>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="px-4 py-2 bg-zinc-800 text-gray-300 rounded-lg hover:bg-zinc-700 transition-colors"
        >
          Details
        </button>
      </div>

      {/* Details Panel */}
      {showDetails && (
        <div className="mt-4 pt-4 border-t border-zinc-800">
          <dl className="space-y-2">
            {agent.repo_url && (
              <div>
                <dt className="text-xs text-gray-500">Repository</dt>
                <dd className="text-sm text-gray-300 truncate">
                  <a 
                    href={agent.repo_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-[#E68961] transition-colors"
                  >
                    {agent.repo_url}
                  </a>
                </dd>
              </div>
            )}
            {agent.last_heartbeat_at && (
              <div>
                <dt className="text-xs text-gray-500">Last Heartbeat</dt>
                <dd className="text-sm text-gray-300">
                  {new Date(agent.last_heartbeat_at).toLocaleString()}
                </dd>
              </div>
            )}
            {agent.dependencies && agent.dependencies.length > 0 && (
              <div>
                <dt className="text-xs text-gray-500">Dependencies</dt>
                <dd className="text-sm text-gray-300">
                  {agent.dependencies.join(', ')}
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}
    </div>
  );
}
