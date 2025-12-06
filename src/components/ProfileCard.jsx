import React from 'react';

/**
 * ProfileCard - NURD Trading Card Style
 * Based on the Boomer_Ang Card design with:
 * - Name field
 * - Class (Tech Sage, etc.)
 * - Level
 * - Core Trait
 * - Vibe Ability
 * - NURD Sync Status
 * - Bio
 * - Action buttons
 */

// Class configurations
const CLASSES = {
  'tech-sage': { name: 'TECH SAGE', color: '#00D4FF', icon: '🧙‍♂️' },
  'code-ninja': { name: 'CODE NINJA', color: '#FF5E00', icon: '🥷' },
  'data-wizard': { name: 'DATA WIZARD', color: '#9B59B6', icon: '🧙' },
  'deploy-master': { name: 'DEPLOY MASTER', color: '#00FF88', icon: '🚀' },
  'research-scholar': { name: 'RESEARCH SCHOLAR', color: '#FFD700', icon: '📚' },
  'vibe-architect': { name: 'VIBE ARCHITECT', color: '#FF3366', icon: '🏗️' }
};

// Core traits
const CORE_TRAITS = ['VITALITY', 'WISDOM', 'AGILITY', 'STRENGTH', 'FOCUS', 'CREATIVITY'];

// Vibe abilities
const VIBE_ABILITIES = [
  'KINETIC FITNESS', 'DEEP RESEARCH', 'CODE SYNTHESIS', 'DATA ANALYSIS',
  'PROMPT MASTERY', 'SYSTEM DESIGN', 'RAPID DEPLOY', 'AI INTEGRATION'
];

function ProfileCard({ 
  name = 'NAME',
  avatar = null,
  classType = 'tech-sage',
  level = 7,
  coreTrait = 'VITALITY',
  vibeAbility = 'KINETIC FITNESS',
  syncStatus = 'ACTIVE',
  bio = 'A young innovator with boundless energy, always seeking the next big idea.',
  onConnect,
  onDraft
}) {
  const classConfig = CLASSES[classType] || CLASSES['tech-sage'];

  return (
    <div 
      className="relative w-80 rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #0a1520 0%, #050a10 100%)',
        border: '3px solid transparent',
        backgroundImage: `linear-gradient(#0a1520, #050a10), linear-gradient(180deg, ${classConfig.color}, #00D4FF, #0088FF)`,
        backgroundOrigin: 'border-box',
        backgroundClip: 'padding-box, border-box',
        boxShadow: `0 0 30px ${classConfig.color}30, inset 0 0 60px rgba(0,0,0,0.5)`
      }}
    >
      {/* Inner border glow */}
      <div 
        className="absolute inset-1 rounded-xl pointer-events-none"
        style={{
          border: `1px solid ${classConfig.color}40`,
          boxShadow: `inset 0 0 20px ${classConfig.color}20`
        }}
      />

      {/* Name Badge */}
      <div className="relative px-6 pt-4">
        <div 
          className="inline-block px-4 py-1.5 rounded-lg font-bold text-sm uppercase tracking-wider"
          style={{
            background: 'linear-gradient(135deg, #FF5E00, #CC4400)',
            color: '#fff',
            boxShadow: '0 4px 15px rgba(255,94,0,0.4)'
          }}
        >
          {name}
        </div>
      </div>

      {/* Avatar Area */}
      <div 
        className="relative mx-4 my-4 h-64 rounded-xl overflow-hidden flex items-center justify-center"
        style={{
          background: 'linear-gradient(180deg, #0a1520 0%, #000 100%)',
          border: '1px solid rgba(0,212,255,0.2)'
        }}
      >
        {avatar ? (
          <img src={avatar} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="text-center">
            <div className="text-6xl mb-2">{classConfig.icon}</div>
            <div className="text-sm" style={{ color: '#5a7a8a' }}>Avatar</div>
          </div>
        )}
        
        {/* Glowing platform */}
        <div 
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-2 rounded-full"
          style={{
            background: `linear-gradient(90deg, transparent, ${classConfig.color}, transparent)`,
            boxShadow: `0 0 20px ${classConfig.color}`
          }}
        />
      </div>

      {/* Stats Area */}
      <div className="px-4 pb-4">
        {/* Class and Level */}
        <div 
          className="flex items-center justify-between mb-3 p-2 rounded-lg"
          style={{ 
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(0,212,255,0.2)'
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wide" style={{ color: '#5a7a8a' }}>Class</span>
            <span 
              className="font-bold text-lg"
              style={{ 
                color: classConfig.color,
                textShadow: `0 0 10px ${classConfig.color}50`
              }}
            >
              {classConfig.name}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs uppercase" style={{ color: '#5a7a8a' }}>Level</span>
            <span 
              className="font-bold text-xl"
              style={{ color: '#FFD700' }}
            >
              {level}
            </span>
          </div>
        </div>

        {/* Core Trait & Vibe Ability */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div 
            className="p-2 rounded-lg"
            style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <div className="text-xs uppercase tracking-wide mb-0.5" style={{ color: '#5a7a8a' }}>
              Core Trait
            </div>
            <div className="font-bold text-sm" style={{ color: '#fff' }}>
              {coreTrait}
            </div>
          </div>
          <div 
            className="p-2 rounded-lg"
            style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <div className="text-xs uppercase tracking-wide mb-0.5" style={{ color: '#5a7a8a' }}>
              Vibe Ability
            </div>
            <div className="font-bold text-sm" style={{ color: '#fff' }}>
              {vibeAbility}
            </div>
          </div>
        </div>

        {/* NURD Sync Status */}
        <div 
          className="flex items-center justify-between p-2 rounded-lg mb-3"
          style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <span className="text-xs uppercase tracking-wide" style={{ color: '#5a7a8a' }}>
            NURD Sync Status
          </span>
          <div className="flex items-center gap-2">
            <span 
              className={`w-2 h-2 rounded-full ${syncStatus === 'ACTIVE' ? 'animate-pulse' : ''}`}
              style={{ 
                background: syncStatus === 'ACTIVE' ? '#00FF88' : 
                           syncStatus === 'PENDING' ? '#FFD700' : '#FF3366'
              }}
            />
            <span 
              className="font-bold text-sm"
              style={{ 
                color: syncStatus === 'ACTIVE' ? '#00FF88' : 
                       syncStatus === 'PENDING' ? '#FFD700' : '#FF3366'
              }}
            >
              {syncStatus}
            </span>
          </div>
        </div>

        {/* Bio */}
        <p 
          className="text-sm mb-4 leading-relaxed"
          style={{ color: '#a0b0c0' }}
        >
          {bio}
        </p>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onConnect}
            className="py-2.5 rounded-lg font-bold text-sm uppercase tracking-wide transition-all hover:scale-[1.02]"
            style={{
              background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(0,136,255,0.2))',
              border: '1px solid rgba(0,212,255,0.4)',
              color: '#00D4FF',
              boxShadow: '0 4px 15px rgba(0,212,255,0.2)'
            }}
          >
            Tap to Connect
          </button>
          <button
            onClick={onDraft}
            className="py-2.5 rounded-lg font-bold text-sm uppercase tracking-wide transition-all hover:scale-[1.02]"
            style={{
              background: 'linear-gradient(135deg, #FF5E00, #CC4400)',
              border: 'none',
              color: '#fff',
              boxShadow: '0 4px 15px rgba(255,94,0,0.3)'
            }}
          >
            Swipe to Draft
          </button>
        </div>
      </div>

      {/* Corner decorations */}
      <div 
        className="absolute top-0 left-0 w-8 h-8"
        style={{
          borderTop: `2px solid ${classConfig.color}`,
          borderLeft: `2px solid ${classConfig.color}`
        }}
      />
      <div 
        className="absolute top-0 right-0 w-8 h-8"
        style={{
          borderTop: `2px solid ${classConfig.color}`,
          borderRight: `2px solid ${classConfig.color}`
        }}
      />
      <div 
        className="absolute bottom-0 left-0 w-8 h-8"
        style={{
          borderBottom: `2px solid ${classConfig.color}`,
          borderLeft: `2px solid ${classConfig.color}`
        }}
      />
      <div 
        className="absolute bottom-0 right-0 w-8 h-8"
        style={{
          borderBottom: `2px solid ${classConfig.color}`,
          borderRight: `2px solid ${classConfig.color}`
        }}
      />
    </div>
  );
}

/**
 * BoomerAngCard - Card variant for Boomer_Ang agents
 */
export function BoomerAngCard({
  name = 'Research_Ang',
  icon = '🔍',
  specialty = 'Deep Research',
  level = 5,
  capabilities = ['Web Search', 'Data Analysis', 'Report Generation'],
  status = 'READY',
  uptime = '99.9%',
  tasksCompleted = 142,
  onActivate,
  onConfigure
}) {
  return (
    <div 
      className="relative w-72 rounded-xl overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #1a0a20 0%, #0a0510 100%)',
        border: '2px solid #9B59B6',
        boxShadow: '0 0 30px rgba(155,89,182,0.3)'
      }}
    >
      {/* Header */}
      <div 
        className="p-4 flex items-center gap-3"
        style={{ borderBottom: '1px solid rgba(155,89,182,0.3)' }}
      >
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
          style={{ background: 'rgba(155,89,182,0.2)' }}
        >
          {icon}
        </div>
        <div>
          <div className="font-bold text-lg" style={{ color: '#E8D5F0' }}>{name}</div>
          <div className="text-xs" style={{ color: '#9B59B6' }}>{specialty}</div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-xs" style={{ color: '#888' }}>Level</div>
          <div className="font-bold" style={{ color: '#FFD700' }}>{level}</div>
        </div>
      </div>

      {/* Capabilities */}
      <div className="p-4">
        <div className="text-xs mb-2 uppercase" style={{ color: '#888' }}>Capabilities</div>
        <div className="flex flex-wrap gap-1.5">
          {capabilities.map((cap, i) => (
            <span 
              key={i}
              className="px-2 py-1 rounded text-xs"
              style={{ background: 'rgba(155,89,182,0.2)', color: '#E8D5F0' }}
            >
              {cap}
            </span>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div 
        className="px-4 py-3 grid grid-cols-3 gap-2"
        style={{ background: 'rgba(0,0,0,0.3)' }}
      >
        <div className="text-center">
          <div className="text-xs" style={{ color: '#888' }}>Status</div>
          <div 
            className="font-bold text-sm flex items-center justify-center gap-1"
            style={{ color: status === 'READY' ? '#00FF88' : '#FFD700' }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'currentColor' }} />
            {status}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs" style={{ color: '#888' }}>Uptime</div>
          <div className="font-bold text-sm" style={{ color: '#00D4FF' }}>{uptime}</div>
        </div>
        <div className="text-center">
          <div className="text-xs" style={{ color: '#888' }}>Tasks</div>
          <div className="font-bold text-sm" style={{ color: '#FFD700' }}>{tasksCompleted}</div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-3 grid grid-cols-2 gap-2">
        <button
          onClick={onActivate}
          className="py-2 rounded-lg font-bold text-sm transition-all hover:scale-[1.02]"
          style={{ background: '#9B59B6', color: '#fff' }}
        >
          Activate
        </button>
        <button
          onClick={onConfigure}
          className="py-2 rounded-lg font-bold text-sm transition-all hover:scale-[1.02]"
          style={{ background: 'rgba(155,89,182,0.2)', color: '#9B59B6', border: '1px solid #9B59B6' }}
        >
          Configure
        </button>
      </div>
    </div>
  );
}

export default ProfileCard;
