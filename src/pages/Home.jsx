import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import scribe2 from '../utils/scribe2';
import { useRole } from '../context/RoleContext';
import ownerBg from '../assets/owner_bg.png';
import userBg from '../assets/user_bg.png';


// Owner Modules (Industrial/Blue)
const MODULES_OWNER = [
  {
    id: 'deploy-platform',
    title: 'Deploy Circuit Box',
    subtitle: 'INFRASTRUCTURE CONTROL',
    description: 'Manage ACHEEVY, Buildsmith, and System Breakers. The engine room.',
    status: 'Ready',
    statusColor: '#00D4FF',
    action: 'Open Circuit Box',
    link: '/circuit-box',
    gradient: 'linear-gradient(135deg, #0a1f2a 0%, #0d2a3d 100%)',
    borderColor: '#00D4FF',
    icon: '⚡'
  },
  {
    id: 'agents',
    title: 'Agent Builder',
    subtitle: 'BUILD SMITH',
    description: 'Forge new autonomous agents.',
    status: 'System Optimal',
    statusColor: '#FF8800',
    action: 'Build Agent',
    link: '/agents',
    gradient: 'linear-gradient(135deg, #2a1f0a 0%, #3d2a0d 100%)',
    borderColor: '#FF8800',
    icon: '🤖'
  }
];

// User Modules (Creative/Green/Magenta)
const MODULES_USER = [
  {
    id: 'vibe-coding',
    title: 'Vibe Coding',
    subtitle: 'VIBE CODING',
    description: 'Build full-stack apps with AI agents.',
    status: 'Ready to code',
    statusColor: '#00FF88',
    action: 'Open Vibe Editor',
    link: '/editor',
    gradient: 'linear-gradient(135deg, #0a2a1f 0%, #0d3d2a 100%)',
    borderColor: '#00FF88',
    icon: '</>'
  },
  {
    id: 'nurd',
    title: 'NURD Platform',
    subtitle: 'POWERED BY V.I.B.E.',
    description: 'Launch the immersive learning platform.',
    status: 'External System',
    statusColor: '#FF00FF',
    action: 'Launch Platform ↗',
    link: 'http://localhost:5000',
    isExternal: true,
    gradient: 'linear-gradient(135deg, #2a0a2a 0%, #3d0d3d 100%)',
    borderColor: '#FF00FF',
    icon: '🚀'
  }
];

const STATS = [
  { icon: '🚀', label: 'Apps Deployed', value: '12' },
  { icon: '⚡', label: 'API Calls Today', value: '1.2K' },
  { icon: '🤖', label: 'Active Agents', value: '3' },
  { icon: '📊', label: 'Uptime', value: '99.9%' }
];

function Home() {
  const [showAcheevy, setShowAcheevy] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { role, toggleRole, isOwner } = useRole();

  const MODULES = isOwner ? MODULES_OWNER : MODULES_USER;
  const primaryColor = isOwner ? '#00D4FF' : '#00FF88';
  const roleLabel = isOwner ? 'PLATFORM OWNER' : 'NURD STUDENT';

  const toggleRecording = async () => {
    // ... (keep existing logic)
    if (isRecording) {
      setIsRecording(false);
      setIsProcessing(true);
      const audioBlob = await scribe2.stopRecording();
      const text = await scribe2.transcribe(audioBlob);
      setTranscript(text || 'Could not hear you clearly.');
      setIsProcessing(false);
    } else {
      const started = await scribe2.startRecording();
      if (started) {
        setIsRecording(true);
        setTranscript('');
      } else {
        alert('Microphone access denied. Please check your permissions.');
      }
    }
  };

  return (
    <div 
      className="min-h-screen relative overflow-hidden transition-colors duration-500"
      style={{ 
        background: 'var(--bg)',
        color: 'var(--text)'
      }}
    >
      {/* Dynamic Background Image */}
      <div 
        className="absolute inset-0 z-0 opacity-40 transition-opacity duration-1000"
        style={{
          backgroundImage: isOwner 
            ? `url(${ownerBg})`
            : `url(${userBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(3px)'
        }}
      />

      {/* Background grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-10 z-0"
        style={{
          backgroundImage: `
            linear-gradient(${primaryColor}20 1px, transparent 1px),
            linear-gradient(90deg, ${primaryColor}20 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Header */}
      <header 
        className="sticky top-0 z-50 px-6 py-3 flex items-center justify-between"
        style={{ 
          background: 'rgba(5, 5, 5, 0.8)', 
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border)'
        }}
      >
        {/* Logo & Role Badge */}
        <div className="flex items-center gap-4">
          <div 
            className="text-2xl font-bold"
            style={{ 
              color: primaryColor,
              textShadow: `0 0 20px ${primaryColor}50`
            }}
          >
            NurdsCode
          </div>
          
          <button
            onClick={toggleRole}
            className="font-mono text-xs px-2 py-0.5 rounded border transition-all hover:scale-105"
            style={{
              color: primaryColor,
              border: `1px solid ${primaryColor}80`,
              background: `${primaryColor}10`
            }}
            title="Switch Role"
          >
            {roleLabel} 🔄
          </button>
        </div>

        {/* Center - Chat with ACHEEVY */}
        <button 
          className="hidden md:flex px-6 py-2 rounded-full items-center gap-2 font-medium transition-all hover:scale-105"
          style={{ 
            background: `linear-gradient(135deg, ${primaryColor}20, transparent)`,
            border: `1px solid ${primaryColor}40`,
            color: primaryColor
          }}
          onClick={() => setShowAcheevy(true)}
        >
          <span>🎤</span>
          <span>Chat with ACHEEVY</span>
        </button>

        {/* Profile Menu */}
        <div className="relative">
          <button 
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{ 
              background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}AA)`,
              boxShadow: `0 0 20px ${primaryColor}40`
            }}
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <span className="text-black font-bold">👤</span>
          </button>
          
          {showProfileMenu && (
            <div 
              className="absolute right-0 top-12 w-48 rounded-xl py-2 z-50"
              style={{ 
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                backdropFilter: 'blur(12px)'
              }}
            >
              <Link to="/settings" className="block px-4 py-2 hover:bg-white/10 flex items-center gap-2" style={{ color: '#E8F5E9' }}>
                ⚙️ Account Settings
              </Link>
              <Link to="/workbench" className="block px-4 py-2 hover:bg-white/10 flex items-center gap-2" style={{ color: '#E8F5E9' }}>
                🔧 Workbench
              </Link>
              <button className="w-full text-left px-4 py-2 hover:bg-white/10 flex items-center gap-2" style={{ color: '#E8F5E9' }}>
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 p-6 max-w-7xl mx-auto flex flex-col justify-center min-h-[80vh]">
        {/* Module Cards Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {MODULES.map(module => (
            <div
              key={module.id}
              className="rounded-2xl p-8 transition-all hover:scale-[1.02] cursor-pointer relative overflow-hidden group"
              style={{
                background: 'rgba(10, 10, 10, 0.8)',
                border: `1px solid ${module.borderColor}40`,
                boxShadow: `0 0 30px -10px ${module.borderColor}30`
              }}
            >
              {/* Corner decoration */}
              <div 
                className="absolute top-0 right-0 w-40 h-40 opacity-10 transition-opacity group-hover:opacity-30"
                style={{
                  background: `radial-gradient(circle at top right, ${module.borderColor}, transparent 70%)`
                }}
              />

              {/* Subtitle badge */}
              <div 
                className="inline-block px-3 py-1 rounded-md text-xs font-bold mb-4 tracking-widest"
                style={{ 
                  background: `${module.borderColor}10`,
                  color: module.borderColor,
                  border: `1px solid ${module.borderColor}30`
                }}
              >
                {module.subtitle}
              </div>

              {/* Title */}
              <h2 className="text-3xl font-bold mb-3" style={{ color: '#E8F5E9' }}>
                {module.title}
              </h2>

              {/* Description */}
              <p className="text-sm mb-6 opacity-70 leading-relaxed" style={{ color: '#A8D5A8' }}>
                {module.description}
              </p>

              {/* Status */}
              <div className="flex items-center gap-2 mb-6 opacity-60">
                <span 
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ background: module.statusColor }}
                />
                <span className="text-xs uppercase tracking-wide" style={{ color: module.statusColor }}>
                  {module.status}
                </span>
              </div>

              {/* Action Button */}
              <div className="mt-auto">
              {module.isExternal ? (
                <a
                  href={module.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm transition-all hover:bg-opacity-90"
                  style={{ 
                    background: module.borderColor,
                    color: '#000',
                    boxShadow: `0 0 20px ${module.borderColor}40`
                  }}
                >
                  {module.action}
                </a>
              ) : (
                <Link
                  to={module.link}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm transition-all hover:bg-opacity-90"
                  style={{ 
                    background: module.borderColor,
                    color: '#000',
                    boxShadow: `0 0 20px ${module.borderColor}40`
                  }}
                >
                  {module.action}
                </Link>
              )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Stats Bar */}
      <footer 
        className="fixed bottom-0 left-0 right-0 px-6 py-3 flex items-center justify-center gap-8 flex-wrap"
        style={{ 
          background: 'var(--surface)',
          borderTop: '1px solid var(--border)',
          zIndex: 40
        }}
      >
        {STATS.map((stat, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span>{stat.icon}</span>
            <span style={{ color: '#A8D5A8' }}>{stat.label}:</span>
            <span className="font-bold" style={{ color: '#00FF88' }}>{stat.value}</span>
          </div>
        ))}
      </footer>

      {/* ACHEEVY Floating Panel */}
      {showAcheevy && (
        <div 
          className="fixed right-6 top-24 w-80 rounded-2xl overflow-hidden z-40"
          style={{ 
            background: 'rgba(15, 25, 15, 0.95)',
            border: '1px solid rgba(0,255,136,0.3)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
          }}
        >
          {/* Header */}
          <div 
            className="p-4 flex items-center justify-between"
            style={{ borderBottom: '1px solid rgba(0,255,136,0.2)' }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ 
                  background: 'linear-gradient(135deg, #00FF88, #00CC66)',
                  border: '2px solid rgba(0,255,136,0.5)'
                }}
              >
                <span className="text-2xl">🧠</span>
              </div>
              <div>
                <div className="font-bold" style={{ color: '#00FF88' }}>ACHEEVY</div>
                <div className="text-xs" style={{ color: '#A8D5A8' }}>Digital CEO</div>
              </div>
            </div>
            <button 
              onClick={() => setShowAcheevy(false)}
              className="p-1 rounded hover:bg-white/10"
              style={{ color: '#A8D5A8' }}
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            <p className="mb-4" style={{ color: '#E8F5E9' }}>
              Welcome back, <span style={{ color: '#00FF88' }}>[User]</span>! What would you like to do today?
            </p>

            {/* Transcript Display */}
            {transcript && (
              <div className="mb-4 p-3 rounded-lg bg-black/40 border border-white/10 text-sm italic">
                "{transcript}"
              </div>
            )}

            {/* Quick Actions */}
            <div className="space-y-2">
              {['Start new project', 'View my apps', 'Browse templates', 'Get help'].map((action, i) => (
                <button
                  key={i}
                  className="w-full py-2.5 px-4 rounded-lg text-left text-sm font-medium transition-all hover:scale-[1.02]"
                  style={{ 
                    background: 'rgba(0,255,136,0.1)',
                    border: '1px solid rgba(0,255,136,0.2)',
                    color: '#E8F5E9'
                  }}
                >
                  {action}
                </button>
              ))}
            </div>

            {/* Voice Input */}
            <button 
              onClick={toggleRecording}
              disabled={isProcessing}
              className={`w-full mt-4 py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-all hover:scale-[1.02] ${
                isRecording ? 'animate-pulse' : ''
              }`}
              style={{ 
                background: isRecording 
                  ? 'rgba(255, 94, 0, 0.2)'
                  : 'linear-gradient(135deg, rgba(0,255,136,0.2), rgba(0,204,102,0.2))',
                border: isRecording
                  ? '1px solid var(--neon-orange)'
                  : '1px solid rgba(0,255,136,0.3)',
                color: isRecording ? 'var(--neon-orange)' : '#00FF88'
              }}
            >
              <span>{isRecording ? '⏹' : '🎤'}</span>
              <span>
                {isRecording ? 'Listening...' : isProcessing ? 'Processing...' : 'Voice input ready'} ({scribe2.constructor.name})
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Padding for fixed footer */}
      <div className="h-20" />
    </div>
  );
}

export default Home;
