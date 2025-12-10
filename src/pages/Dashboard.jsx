import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource-variable/doto';

// NURD OS Palette
const PALETTE = {
  void: '#0a0a0a',
  panel: '#161616',
  slime: '#00ffcc',
  electric: '#ffaa00',
  graffiti: '#ffffff',
  danger: '#ff3366',
};

// Power Switch Component - LED Toggle
function PowerSwitch({ enabled, onToggle, label }) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-3 group"
    >
      <div className={`
        relative w-12 h-6 rounded-sm border transition-all duration-300
        ${enabled 
          ? 'border-slime bg-slime/10' 
          : 'border-danger bg-danger/10'
        }
      `}>
        <motion.div
          className={`
            absolute top-0.5 w-5 h-5 rounded-sm
            ${enabled ? 'bg-slime' : 'bg-danger'}
          `}
          animate={{ left: enabled ? '24px' : '2px' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
        {/* LED Indicator */}
        <div className={`
          absolute -top-1 -right-1 w-2 h-2 rounded-full
          ${enabled 
            ? 'bg-slime shadow-neon animate-pulse' 
            : 'bg-danger'
          }
        `} />
      </div>
      <span className="font-doto text-xs text-mute group-hover:text-graffiti transition-colors">
        {enabled ? 'ONLINE' : 'OFFLINE'}
      </span>
    </button>
  );
}

// Load Bar Component - Progress indicator
function LoadBar({ value, label, color = 'slime' }) {
  const colorClasses = {
    slime: 'bg-slime',
    electric: 'bg-electric',
    danger: 'bg-danger',
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="font-doto text-xs text-mute">{label}</span>
        <span className="font-doto text-xs text-graffiti">{value}%</span>
      </div>
      <div className="h-2 bg-void rounded-sm overflow-hidden border border-panel">
        <motion.div
          className={`h-full ${colorClasses[color]}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

// Module Card Component
function ModuleCard({ module, onToggle }) {
  const [isHovered, setIsHovered] = useState(false);
  
  const statusColor = module.status === 'online' ? 'slime' : 'danger';
  const loadColor = module.load > 80 ? 'danger' : module.load > 60 ? 'electric' : 'slime';

  return (
    <motion.div
      className={`
        relative bg-panel border border-panel p-4 
        hover:border-slime/50 transition-all duration-300
        overflow-hidden
      `}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
      layout
    >
      {/* Scan line effect on hover */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-slime/5 to-transparent pointer-events-none"
            initial={{ opacity: 0, y: '-100%' }}
            animate={{ opacity: 1, y: '100%' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-doto text-lg text-graffiti">{module.name}</h3>
          <p className="font-doto text-xs text-mute">ID: {module.id}</p>
        </div>
        <PowerSwitch
          enabled={module.status === 'online'}
          onToggle={() => onToggle(module.id)}
        />
      </div>

      {/* Stats */}
      <div className="space-y-3">
        <LoadBar value={module.load} label="LOAD" color={loadColor} />
        
        <div className="flex justify-between items-center pt-2 border-t border-void">
          <span className="font-doto text-xs text-mute">LATENCY</span>
          <span className={`font-doto text-sm ${module.latency > 100 ? 'text-electric' : 'text-slime'}`}>
            {module.latency}ms
          </span>
        </div>
      </div>

      {/* Status indicator bar */}
      <div className={`
        absolute bottom-0 left-0 right-0 h-1
        ${module.status === 'online' ? 'bg-slime' : 'bg-danger'}
      `} />
    </motion.div>
  );
}

// System Stats Panel
function SystemStats({ modules }) {
  const onlineCount = modules.filter(m => m.status === 'online').length;
  const avgLoad = Math.round(modules.reduce((acc, m) => acc + m.load, 0) / modules.length);
  const avgLatency = Math.round(modules.reduce((acc, m) => acc + m.latency, 0) / modules.length);

  return (
    <div className="bg-panel border border-panel p-4">
      <h2 className="font-doto text-sm text-mute mb-4">SYSTEM OVERVIEW</h2>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="font-doto text-3xl text-slime">{onlineCount}/{modules.length}</div>
          <div className="font-doto text-xs text-mute">MODULES ONLINE</div>
        </div>
        <div className="text-center">
          <div className={`font-doto text-3xl ${avgLoad > 70 ? 'text-electric' : 'text-slime'}`}>
            {avgLoad}%
          </div>
          <div className="font-doto text-xs text-mute">AVG LOAD</div>
        </div>
        <div className="text-center">
          <div className={`font-doto text-3xl ${avgLatency > 100 ? 'text-electric' : 'text-slime'}`}>
            {avgLatency}ms
          </div>
          <div className="font-doto text-xs text-mute">AVG LATENCY</div>
        </div>
      </div>
    </div>
  );
}

// Main Dashboard Component
export default function Dashboard() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch modules from API
  useEffect(() => {
    async function fetchModules() {
      try {
        const response = await fetch('/api/circuit-box/modules');
        if (!response.ok) throw new Error('Failed to fetch modules');
        const data = await response.json();
        setModules(data.modules);
      } catch (err) {
        // Use mock data if API fails
        setModules([
          { id: 'voice-agent', name: 'Voice Agent', status: 'online', load: 45, latency: 120 },
          { id: 'code-gen', name: 'Code Generation', status: 'online', load: 78, latency: 50 },
          { id: 'database', name: 'D1 Database', status: 'online', load: 23, latency: 15 },
          { id: 'storage', name: 'R2 Storage', status: 'offline', load: 0, latency: 0 },
          { id: 'cache', name: 'KV Cache', status: 'online', load: 67, latency: 5 },
          { id: 'ai-gateway', name: 'AI Gateway', status: 'online', load: 89, latency: 200 },
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchModules();
    // Poll every 10 seconds
    const interval = setInterval(fetchModules, 10000);
    return () => clearInterval(interval);
  }, []);

  // Toggle module status
  async function handleToggle(moduleId) {
    const module = modules.find(m => m.id === moduleId);
    const newStatus = module.status === 'online' ? 'offline' : 'online';

    // Optimistic update
    setModules(prev => prev.map(m => 
      m.id === moduleId 
        ? { ...m, status: newStatus, load: newStatus === 'offline' ? 0 : m.load }
        : m
    ));

    try {
      await fetch('/api/circuit-box/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId, enabled: newStatus === 'online' }),
      });
    } catch (err) {
      console.error('Toggle failed:', err);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="text-center">
          <div className="font-doto text-2xl text-slime animate-pulse">
            INITIALIZING CIRCUIT BOX...
          </div>
          <div className="mt-4 w-48 h-1 bg-panel mx-auto overflow-hidden">
            <motion.div
              className="h-full bg-slime"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void bg-circuit-pattern">
      {/* Header */}
      <header className="border-b border-panel bg-panel/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="font-doto text-2xl text-graffiti">CIRCUIT BOX</h1>
              <p className="font-doto text-xs text-mute">SYSTEM MANAGEMENT PANEL</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-slime animate-pulse" />
                <span className="font-doto text-xs text-slime">SYSTEM ACTIVE</span>
              </div>
              <span className="font-doto text-xs text-mute">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* System Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <SystemStats modules={modules} />
        </motion.div>

        {/* Module Grid */}
        <div className="mb-4">
          <h2 className="font-doto text-sm text-mute">ACTIVE MODULES</h2>
        </div>
        
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {modules.map((module, index) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <ModuleCard module={module} onToggle={handleToggle} />
            </motion.div>
          ))}
        </motion.div>

        {/* Footer Info */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p className="font-doto text-xs text-mute">
            NURDS CODE • CIRCUIT BOX v1.0.0 • 
            <span className="text-slime"> THINK IT. PROMPT IT. BUILD IT.</span>
          </p>
        </motion.div>
      </main>
    </div>
  );
}
