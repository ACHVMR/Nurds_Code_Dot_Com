import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { BarChart3, TrendingUp, Users, DollarSign, Activity, Loader, Lock } from 'lucide-react';

export default function Analytics() {
  const { user } = useUser();
  const [embedToken, setEmbedToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userTier, setUserTier] = useState('free');
  const [error, setError] = useState(null);

  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787';

  useEffect(() => {
    if (user) {
      loadAnalytics();
    } else {
      // Demo mode - show free tier
      setLoading(false);
      setUserTier('free');
    }
  }, [user]);

  const loadAnalytics = async () => {
    try {
      // Get user tier
      const tierResponse = await fetch(`${apiBase}/api/user/tier/${user?.id || 'demo'}`);
      const tierData = await tierResponse.json();
      setUserTier(tierData.tier || 'free');

      // Get Power BI embed token
      const tokenResponse = await fetch(`${apiBase}/api/analytics/embed-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id || 'demo' })
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to load analytics');
      }

      const tokenData = await tokenResponse.json();
      setEmbedToken(tokenData);

      // Load Power BI report
      if (tokenData.token && window.powerbi) {
        embedPowerBIReport(tokenData);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const embedPowerBIReport = (tokenData) => {
    const embedContainer = document.getElementById('powerbi-container');
    if (!embedContainer) return;

    const config = {
      type: 'report',
      tokenType: window.models.TokenType.Embed,
      accessToken: tokenData.token,
      embedUrl: tokenData.embedUrl,
      id: tokenData.reportId,
      permissions: userTier === 'free' ? window.models.Permissions.Read : window.models.Permissions.All,
      settings: {
        panes: {
          filters: {
            visible: userTier !== 'free'
          },
          pageNavigation: {
            visible: true
          }
        },
        background: window.models.BackgroundType.Transparent,
        bars: {
          statusBar: {
            visible: false
          }
        }
      }
    };

    // Embed the report
    const report = window.powerbi.embed(embedContainer, config);

    // Handle errors
    report.on('error', (event) => {
      console.error('Power BI error:', event.detail);
      setError('Failed to load dashboard');
    });

    // Handle loaded event
    report.on('loaded', () => {
      console.log('Power BI report loaded');
    });
  };

  const upgradeTier = () => {
    window.location.href = '/pricing';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-[#E68961] mx-auto mb-4" />
          <p className="text-gray-400">Loading analytics...</p>
        </div>
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
                Analytics Dashboard
              </h1>
              <p className="text-gray-400">
                Powered by Microsoft Fabric
              </p>
            </div>

            {/* Tier Badge */}
            <div className="flex items-center gap-4">
              <div className={`px-4 py-2 rounded-lg border ${
                userTier === 'enterprise' ? 'bg-[#E68961]/10 border-[#E68961] text-[#E68961]' :
                userTier === 'pro' ? 'bg-yellow-400/10 border-yellow-400 text-yellow-400' :
                'bg-gray-400/10 border-gray-400 text-gray-400'
              }`}>
                <span className="text-sm font-medium capitalize">{userTier} Tier</span>
              </div>

              {userTier === 'free' && (
                <button
                  onClick={upgradeTier}
                  className="px-4 py-2 bg-[#E68961] text-black font-semibold rounded-lg hover:bg-[#D4A05F] transition-colors"
                >
                  Upgrade to Pro
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<Activity className="w-5 h-5" />}
            label="Active Sessions"
            value="--"
            trend="+12%"
            locked={userTier === 'free'}
          />
          <StatCard
            icon={<Users className="w-5 h-5" />}
            label="Team Members"
            value="--"
            trend="+8%"
            locked={userTier === 'free'}
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="Growth Rate"
            value="--"
            trend="+24%"
            locked={userTier === 'free'}
          />
          <StatCard
            icon={<DollarSign className="w-5 h-5" />}
            label="Revenue"
            value="--"
            trend="+18%"
            locked={userTier === 'free'}
          />
        </div>

        {/* Tier Restrictions Notice */}
        {userTier === 'free' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-4">
              <Lock className="w-6 h-6 text-yellow-400 shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">Free Tier - Limited Analytics</h3>
                <p className="text-gray-400 mb-4">
                  You're viewing read-only dashboards with sample data. Upgrade to unlock:
                </p>
                <ul className="space-y-2 text-sm text-gray-400 mb-4">
                  <li className="flex items-center gap-2">
                    <span className="text-[#E68961]">✓</span>
                    Interactive dashboards with live data
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#E68961]">✓</span>
                    AI-powered insights with Fabric Copilot
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#E68961]">✓</span>
                    Custom reports and data exports
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#E68961]">✓</span>
                    Host Zoom sessions and Teams meetings
                  </li>
                </ul>
                <button
                  onClick={upgradeTier}
                  className="px-6 py-2 bg-[#E68961] text-black font-semibold rounded-lg hover:bg-[#D4A05F] transition-colors"
                >
                  Upgrade to Pro - $29.99/mo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Power BI Embedded Container */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          {error ? (
            <div className="p-12 text-center">
              <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Failed to Load Dashboard</h3>
              <p className="text-gray-400 mb-4">{error}</p>
              <button
                onClick={loadAnalytics}
                className="px-6 py-2 bg-[#E68961] text-black font-semibold rounded-lg hover:bg-[#D4A05F] transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            <div
              id="powerbi-container"
              className="w-full"
              style={{ 
                height: 'calc(100vh - 400px)', 
                minHeight: '600px',
                background: '#000'
              }}
            >
              {!embedToken && (
                <div className="flex items-center justify-center h-full">
                  <Loader className="w-8 h-8 animate-spin text-[#E68961]" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <FeatureCard
            title="Real-Time Insights"
            description="Track user engagement, session analytics, and platform performance in real-time"
            available={userTier !== 'free'}
          />
          <FeatureCard
            title="AI Copilot"
            description="Ask questions about your data and get instant insights powered by Azure OpenAI"
            available={userTier !== 'free'}
          />
          <FeatureCard
            title="Custom Reports"
            description="Create and export custom reports tailored to your business needs"
            available={userTier === 'enterprise'}
          />
        </div>
      </div>

      {/* Load Power BI JavaScript SDK */}
      <script src="https://cdn.jsdelivr.net/npm/powerbi-client@2.23.0/dist/powerbi.min.js"></script>
    </div>
  );
}

// Stat Card Component
function StatCard({ icon, label, value, trend, locked }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400">{icon}</span>
        {trend && !locked && (
          <span className="text-xs text-[#E68961]">{trend}</span>
        )}
        {locked && (
          <Lock className="w-4 h-4 text-gray-600" />
        )}
      </div>
      <div className="text-2xl font-bold mb-1">
        {locked ? '--' : value}
      </div>
      <div className="text-sm text-gray-400">{label}</div>
    </div>
  );
}

// Feature Card Component
function FeatureCard({ title, description, available }) {
  return (
    <div className={`bg-zinc-900 border rounded-xl p-6 ${
      available ? 'border-zinc-800' : 'border-zinc-800 opacity-50'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold">{title}</h3>
        {!available && <Lock className="w-5 h-5 text-gray-600" />}
      </div>
      <p className="text-sm text-gray-400">{description}</p>
      {!available && (
        <p className="text-xs text-yellow-400 mt-3">
          Upgrade required
        </p>
      )}
    </div>
  );
}
