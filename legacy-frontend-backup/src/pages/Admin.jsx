import React, { useState, useEffect } from 'react';

// Circuit Box - Service monitoring dashboard
function Admin() {
  const [services, setServices] = useState([
    { id: 'groq', name: 'GROQ LLM', status: 'online', latency: '45ms', icon: '🤖' },
    { id: 'openai', name: 'OpenAI Whisper', status: 'online', latency: '120ms', icon: '🎙️' },
    { id: 'stripe', name: 'Stripe Payments', status: 'online', latency: '89ms', icon: '💳' },
    { id: 'supabase', name: 'Supabase DB', status: 'online', latency: '32ms', icon: '🗄️' },
    { id: 'd1', name: 'Cloudflare D1', status: 'online', latency: '15ms', icon: '⚡' },
    { id: 'kv', name: 'Workers KV', status: 'online', latency: '8ms', icon: '📦' },
    { id: 'r2', name: 'R2 Storage', status: 'standby', latency: '--', icon: '🪣' },
    { id: 'ai-gateway', name: 'AI Gateway', status: 'online', latency: '22ms', icon: '🌐' },
    { id: 'deepgram', name: 'Deepgram STT', status: 'standby', latency: '--', icon: '🎤' },
    { id: 'elevenlabs', name: 'ElevenLabs TTS', status: 'standby', latency: '--', icon: '🔊' },
  ]);

  const [stats, setStats] = useState({
    totalRequests: 12847,
    activeUsers: 342,
    tokensUsed: '2.4M',
    uptime: '99.98%'
  });

  const toggleService = (id) => {
    setServices(services.map(s => 
      s.id === id 
        ? { ...s, status: s.status === 'online' ? 'standby' : 'online' }
        : s
    ));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'standby': return 'bg-yellow-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-text">Admin Dashboard</h1>
          <p className="tagline text-xl">Circuit Box Control Center</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="panel text-center">
            <div className="text-3xl font-bold text-accent">{stats.totalRequests.toLocaleString()}</div>
            <div className="text-sm text-mute">Total Requests</div>
          </div>
          <div className="panel text-center">
            <div className="text-3xl font-bold text-accent">{stats.activeUsers}</div>
            <div className="text-sm text-mute">Active Users</div>
          </div>
          <div className="panel text-center">
            <div className="text-3xl font-bold text-accent">{stats.tokensUsed}</div>
            <div className="text-sm text-mute">Tokens Used</div>
          </div>
          <div className="panel text-center">
            <div className="text-3xl font-bold text-green-400">{stats.uptime}</div>
            <div className="text-sm text-mute">Uptime</div>
          </div>
        </div>

        {/* Circuit Box Panel */}
        <div className="panel mb-8">
          <h2 className="text-xl font-semibold mb-4 text-text flex items-center gap-2">
            <span>⚡</span> Circuit Box
          </h2>
          <p className="text-mute text-sm mb-6">
            Toggle services on/off. Click a breaker to change its state.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {services.map(service => (
              <button
                key={service.id}
                onClick={() => toggleService(service.id)}
                className={`p-4 border border-border rounded-lg transition-all hover:border-accent ${
                  service.status === 'online' ? 'bg-surface' : 'bg-black/30'
                }`}
              >
                <div className="text-2xl mb-2">{service.icon}</div>
                <div className="text-sm font-medium text-text truncate">{service.name}</div>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(service.status)}`}></div>
                  <span className="text-xs text-mute capitalize">{service.status}</span>
                </div>
                {service.latency !== '--' && (
                  <div className="text-xs text-accent mt-1">{service.latency}</div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="panel">
          <h2 className="text-xl font-semibold mb-4 text-text">Recent Activity</h2>
          <div className="space-y-3">
            {[
              { time: '2 min ago', action: 'User signup', detail: 'user@example.com joined Free tier' },
              { time: '5 min ago', action: 'API call', detail: 'GROQ 70B inference completed (1.2s)' },
              { time: '12 min ago', action: 'Subscription', detail: 'Pro tier activated via Stripe' },
              { time: '18 min ago', action: 'Voice transcription', detail: 'Whisper STT processed 45s audio' },
              { time: '1 hour ago', action: 'System', detail: 'AI Gateway cache cleared' },
            ].map((log, i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-black/20 rounded">
                <span className="text-xs text-mute w-20">{log.time}</span>
                <span className="text-sm font-medium text-accent w-32">{log.action}</span>
                <span className="text-sm text-text flex-1">{log.detail}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;
