import React, { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';

function Admin() {
  const { getToken } = useAuth();
  const [me, setMe] = useState(null);
  const [health, setHealth] = useState(null);
  const [error, setError] = useState('');

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
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="card">
          <h1 className="text-2xl font-bold text-text mb-2">Admin Console</h1>
          <p className="text-text/60">Superadmin-only tools</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-xl font-semibold text-text mb-3">Your Session</h2>
            <pre className="text-xs overflow-auto bg-[#111] p-3 border border-[#2a2a2a] text-text/80">
              {JSON.stringify(me, null, 2)}
            </pre>
          </div>
          <div className="card">
            <h2 className="text-xl font-semibold text-text mb-3">Admin Health</h2>
            <pre className="text-xs overflow-auto bg-[#111] p-3 border border-[#2a2a2a] text-text/80">
              {JSON.stringify(health, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;
