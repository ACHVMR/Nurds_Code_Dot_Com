import React, { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import CircuitBox from '../components/CircuitBox';

function Admin() {
  const { getToken } = useAuth();
  const [me, setMe] = useState(null);
  const [health, setHealth] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('circuit-box'); // 'circuit-box', 'session', 'health'

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const meRes = await fetch('/api/auth/me', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const meJson = await meRes.json();
        setMe(meJson);
        if (!meRes.ok || !meJson?.isSuperadmin) {
          setError('Forbidden: superadmin access required.');
          return;
        }
        const healthRes = await fetch('/api/admin/health', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const healthJson = await healthRes.json();
        setHealth(healthJson);
      } catch (e) {
        setError(e.message || 'Unknown error');
      }
    })();
  }, [getToken]);

  if (error) {
    return (
      <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto">
          <div className="card">
            <h1 className="text-2xl font-bold text-text mb-4">Admin Console</h1>
            <p className="text-accent">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="card">
          <h1 className="text-3xl font-bold text-text mb-2">Admin Console</h1>
          <p className="text-text/60">Superadmin infrastructure control panel</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-[#2a2a2a]">
          <button
            onClick={() => setActiveTab('circuit-box')}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === 'circuit-box'
                ? 'text-[#E68961] border-b-2 border-[#E68961]'
                : 'text-text/60 hover:text-text'
            }`}
          >
            Circuit Box
          </button>
          <button
            onClick={() => setActiveTab('session')}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === 'session'
                ? 'text-[#E68961] border-b-2 border-[#E68961]'
                : 'text-text/60 hover:text-text'
            }`}
          >
            Session Info
          </button>
          <button
            onClick={() => setActiveTab('health')}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === 'health'
                ? 'text-[#E68961] border-b-2 border-[#E68961]'
                : 'text-text/60 hover:text-text'
            }`}
          >
            System Health
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'circuit-box' && (
          <CircuitBox />
        )}

        {activeTab === 'session' && (
          <div className="card">
            <h2 className="text-xl font-semibold text-text mb-4">Your Session</h2>
            <pre className="text-xs overflow-auto bg-[#111] p-4 border border-[#2a2a2a] text-text/80 rounded">
              {JSON.stringify(me, null, 2)}
            </pre>
          </div>
        )}

        {activeTab === 'health' && (
          <div className="card">
            <h2 className="text-xl font-semibold text-text mb-4">System Health Status</h2>
            <pre className="text-xs overflow-auto bg-[#111] p-4 border border-[#2a2a2a] text-text/80 rounded">
              {JSON.stringify(health, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;
