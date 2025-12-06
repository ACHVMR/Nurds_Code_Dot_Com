import React, { useState } from 'react';
import ProfileCard, { BoomerAngCard } from '../components/ProfileCard';

/**
 * NURD Page - Training, Workshops, and Community
 * Showcases Profile Cards and Boomer_Ang Cards
 */

// Sample profile data
const SAMPLE_PROFILES = [
  {
    name: 'TechSage_07',
    classType: 'tech-sage',
    level: 7,
    coreTrait: 'VITALITY',
    vibeAbility: 'KINETIC FITNESS',
    syncStatus: 'ACTIVE',
    bio: 'A young innovator with boundless energy, always seeking the next big idea.'
  },
  {
    name: 'CodeNinja_12',
    classType: 'code-ninja',
    level: 12,
    coreTrait: 'AGILITY',
    vibeAbility: 'CODE SYNTHESIS',
    syncStatus: 'ACTIVE',
    bio: 'Master of rapid development, turning ideas into reality at lightning speed.'
  },
  {
    name: 'DataWiz_05',
    classType: 'data-wizard',
    level: 5,
    coreTrait: 'WISDOM',
    vibeAbility: 'DATA ANALYSIS',
    syncStatus: 'PENDING',
    bio: 'Unravels complex datasets to reveal hidden patterns and insights.'
  }
];

// House of ANG Boomer_Angs
const HOUSE_OF_ANG = [
  {
    name: 'Research_Ang',
    icon: '🔍',
    specialty: 'Deep Research',
    level: 8,
    capabilities: ['Web Search', 'Data Analysis', 'Report Generation'],
    status: 'READY',
    uptime: '99.9%',
    tasksCompleted: 142
  },
  {
    name: 'Code_Ang',
    icon: '💻',
    specialty: 'Code Generation',
    level: 10,
    capabilities: ['Code Review', 'Bug Fixing', 'Refactoring'],
    status: 'READY',
    uptime: '99.8%',
    tasksCompleted: 287
  },
  {
    name: 'Data_Ang',
    icon: '📊',
    specialty: 'Data Processing',
    level: 7,
    capabilities: ['ETL', 'Visualization', 'ML Prep'],
    status: 'READY',
    uptime: '99.7%',
    tasksCompleted: 198
  },
  {
    name: 'Voice_Ang',
    icon: '🎙️',
    specialty: 'Voice Processing',
    level: 6,
    capabilities: ['STT', 'TTS', 'Voice Commands'],
    status: 'BUSY',
    uptime: '99.5%',
    tasksCompleted: 89
  },
  {
    name: 'Security_Ang',
    icon: '🛡️',
    specialty: 'Security Scanning',
    level: 9,
    capabilities: ['Vulnerability Scan', 'Code Audit', 'Compliance'],
    status: 'READY',
    uptime: '99.9%',
    tasksCompleted: 156
  },
  {
    name: 'Deploy_Ang',
    icon: '🚀',
    specialty: 'Deployment Automation',
    level: 8,
    capabilities: ['CI/CD', 'Container Mgmt', 'Rollback'],
    status: 'READY',
    uptime: '99.8%',
    tasksCompleted: 234
  }
];

function NURD() {
  const [activeTab, setActiveTab] = useState('profiles');

  return (
    <div 
      className="min-h-screen py-8 px-4"
      style={{ 
        background: 'linear-gradient(135deg, #0a0f0a 0%, #0d1a0d 50%, #0a0f0a 100%)',
        color: '#E8F5E9'
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 
            className="text-5xl font-bold mb-4"
            style={{ 
              color: '#00FF88',
              textShadow: '0 0 40px rgba(0,255,136,0.3)'
            }}
          >
            NURD
          </h1>
          <p className="text-xl mb-2" style={{ color: '#A8D5A8' }}>
            Training, Workshops, and Community
          </p>
          <p className="text-sm" style={{ color: '#5a8a5a' }}>
            Connect with the Tribe. Level up your skills. Build together.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center gap-4 mb-12">
          {['profiles', 'boomer-angs', 'courses'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-6 py-3 rounded-xl font-bold transition-all"
              style={{
                background: activeTab === tab 
                  ? '#00FF88' 
                  : 'rgba(0,255,136,0.1)',
                color: activeTab === tab ? '#0a0f0a' : '#00FF88',
                border: `1px solid ${activeTab === tab ? '#00FF88' : 'rgba(0,255,136,0.3)'}`
              }}
            >
              {tab === 'profiles' && '👤 NURD Profiles'}
              {tab === 'boomer-angs' && '🤖 House of ANG'}
              {tab === 'courses' && '📚 Courses'}
            </button>
          ))}
        </div>

        {/* Profile Cards */}
        {activeTab === 'profiles' && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: '#E8F5E9' }}>
              NURD Profile Cards
            </h2>
            <p className="text-center mb-8" style={{ color: '#A8D5A8' }}>
              Each user gets a unique trading card showcasing their class, level, and abilities
            </p>
            <div className="flex flex-wrap justify-center gap-8">
              {SAMPLE_PROFILES.map((profile, i) => (
                <ProfileCard
                  key={i}
                  {...profile}
                  onConnect={() => console.log('Connect:', profile.name)}
                  onDraft={() => console.log('Draft:', profile.name)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Boomer_Ang Cards */}
        {activeTab === 'boomer-angs' && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: '#E8F5E9' }}>
              House of ANG - 17 Specialist Boomer_Angs
            </h2>
            <p className="text-center mb-8" style={{ color: '#A8D5A8' }}>
              Specialized worker-agents that collaborate with Buildsmith to create your Plugs
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
              {HOUSE_OF_ANG.map((ang, i) => (
                <BoomerAngCard
                  key={i}
                  {...ang}
                  onActivate={() => console.log('Activate:', ang.name)}
                  onConfigure={() => console.log('Configure:', ang.name)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Courses */}
        {activeTab === 'courses' && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: '#E8F5E9' }}>
              Active Courses
            </h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {[
                {
                  title: 'Vibe Coding Fundamentals',
                  description: 'Learn the basics of AI-assisted development with Cloudflare Vibecoding SDK',
                  progress: 45,
                  lessons: 12,
                  duration: '4 hours'
                },
                {
                  title: 'Boomer_Ang Creation',
                  description: 'Master the art of creating and configuring specialized AI agents',
                  progress: 20,
                  lessons: 8,
                  duration: '3 hours'
                }
              ].map((course, i) => (
                <div
                  key={i}
                  className="rounded-xl p-6 transition-all hover:scale-[1.02]"
                  style={{
                    background: 'rgba(0,255,136,0.05)',
                    border: '1px solid rgba(0,255,136,0.2)'
                  }}
                >
                  <h3 className="text-xl font-bold mb-2" style={{ color: '#E8F5E9' }}>
                    {course.title}
                  </h3>
                  <p className="text-sm mb-4" style={{ color: '#A8D5A8' }}>
                    {course.description}
                  </p>
                  <div className="flex items-center gap-4 mb-4 text-sm" style={{ color: '#5a8a5a' }}>
                    <span>📚 {course.lessons} lessons</span>
                    <span>⏱ {course.duration}</span>
                  </div>
                  {/* Progress bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span style={{ color: '#A8D5A8' }}>Progress</span>
                      <span style={{ color: '#00FF88' }}>{course.progress}%</span>
                    </div>
                    <div 
                      className="h-2 rounded-full overflow-hidden"
                      style={{ background: 'rgba(0,255,136,0.2)' }}
                    >
                      <div 
                        className="h-full rounded-full transition-all"
                        style={{ 
                          width: `${course.progress}%`,
                          background: 'linear-gradient(90deg, #00FF88, #00CC66)'
                        }}
                      />
                    </div>
                  </div>
                  <button
                    className="w-full py-2.5 rounded-lg font-bold transition-all hover:scale-[1.02]"
                    style={{ background: '#00FF88', color: '#0a0f0a' }}
                  >
                    Continue Learning
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div 
          className="mt-16 p-6 rounded-xl text-center"
          style={{ 
            background: 'rgba(0,255,136,0.05)',
            border: '1px solid rgba(0,255,136,0.2)'
          }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: '2,847', label: 'Active NURDs' },
              { value: '17', label: 'Boomer_Angs' },
              { value: '12', label: 'Courses' },
              { value: '99.9%', label: 'Uptime' }
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-3xl font-bold" style={{ color: '#00FF88' }}>
                  {stat.value}
                </div>
                <div className="text-sm" style={{ color: '#A8D5A8' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NURD;
