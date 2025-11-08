import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Calendar, Filter, Download, Zap, Mic, Database, Code } from 'lucide-react';

function UsageLedger() {
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [stats, setStats] = useState({
    totalCost: 0,
    voiceCost: 0,
    llmCost: 0,
    storageCost: 0,
  });

  useEffect(() => {
    fetchUsageLedger();
  }, [dateRange, serviceFilter]);

  const fetchUsageLedger = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/usage/ledger?range=${dateRange}&service=${serviceFilter}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch usage ledger');
      }

      const data = await response.json();
      setLedger(data.entries || []);
      setStats(data.stats || {});
    } catch (err) {
      console.error('Error fetching ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const headers = ['Date', 'Service', 'Description', 'Cost (cents)', 'Model/Provider'];
    const rows = ledger.map(entry => [
      new Date(entry.created_at).toISOString(),
      entry.service_type,
      entry.description,
      entry.cost_cents,
      entry.model_name || entry.provider || 'N/A',
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `usage-ledger-${dateRange}.csv`;
    a.click();
  };

  const getServiceIcon = (serviceType) => {
    switch (serviceType) {
      case 'voice':
        return <Mic className="w-5 h-5" />;
      case 'llm':
        return <Zap className="w-5 h-5" />;
      case 'storage':
        return <Database className="w-5 h-5" />;
      case 'code':
        return <Code className="w-5 h-5" />;
      default:
        return <DollarSign className="w-5 h-5" />;
    }
  };

  const formatCost = (cents) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E68961]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-8 h-8 text-[#E68961]" />
                <h1 className="text-4xl font-bold">Usage Ledger</h1>
              </div>
              <p className="text-gray-400">
                Transparent cost tracking for all services
              </p>
            </div>
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-[#E68961] text-black rounded-lg font-semibold hover:bg-[#D4A05F] transition-colors"
            >
              <Download className="w-5 h-5" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-6 h-6 text-[#E68961]" />
              <h3 className="text-sm font-semibold text-gray-400">Total Cost</h3>
            </div>
            <p className="text-3xl font-bold">{formatCost(stats.totalCost)}</p>
            <p className="text-xs text-gray-500 mt-1">Last {dateRange}</p>
          </div>

          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Mic className="w-6 h-6 text-purple-400" />
              <h3 className="text-sm font-semibold text-gray-400">Voice</h3>
            </div>
            <p className="text-3xl font-bold">{formatCost(stats.voiceCost)}</p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.totalCost > 0 ? Math.round((stats.voiceCost / stats.totalCost) * 100) : 0}% of total
            </p>
          </div>

          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-6 h-6 text-yellow-400" />
              <h3 className="text-sm font-semibold text-gray-400">LLM</h3>
            </div>
            <p className="text-3xl font-bold">{formatCost(stats.llmCost)}</p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.totalCost > 0 ? Math.round((stats.llmCost / stats.totalCost) * 100) : 0}% of total
            </p>
          </div>

          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Database className="w-6 h-6 text-cyan-400" />
              <h3 className="text-sm font-semibold text-gray-400">Storage</h3>
            </div>
            <p className="text-3xl font-bold">{formatCost(stats.storageCost)}</p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.totalCost > 0 ? Math.round((stats.storageCost / stats.totalCost) * 100) : 0}% of total
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-[#2a2a2a] text-white px-4 py-2 rounded-lg border border-[#3a3a3a] focus:outline-none focus:border-[#E68961]"
            >
              <option value="1d">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="bg-[#2a2a2a] text-white px-4 py-2 rounded-lg border border-[#3a3a3a] focus:outline-none focus:border-[#E68961]"
            >
              <option value="all">All Services</option>
              <option value="voice">Voice Only</option>
              <option value="llm">LLM Only</option>
              <option value="storage">Storage Only</option>
              <option value="code">Code Generation</option>
            </select>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#2a2a2a]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Model/Provider
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Cost
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a2a]">
                {ledger.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      No usage data for selected period
                    </td>
                  </tr>
                ) : (
                  ledger.map((entry, index) => (
                    <tr key={index} className="hover:bg-[#2a2a2a]/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(entry.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="text-[#E68961]">
                            {getServiceIcon(entry.service_type)}
                          </div>
                          <span className="text-sm font-medium capitalize">
                            {entry.service_type}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300 max-w-md truncate">
                        {entry.description || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {entry.model_name || entry.provider || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-mono">
                        <span className="text-[#E68961]">{formatCost(entry.cost_cents)}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Chart Placeholder */}
        <div className="mt-8 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Daily Spending Trend</h3>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <TrendingUp className="w-12 h-12 mb-2" />
            <p>Chart visualization coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UsageLedger;
