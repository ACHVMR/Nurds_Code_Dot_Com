import React, { useState } from 'react';
import { BarChart3, FileCode, Zap, Users, Plus, ArrowRight, Clock } from 'lucide-react';

/**
 * User Dashboard Page (/dashboard)
 * Reference: IMG_1850.PNG (User Dashboard mockup)
 *
 * Displays user stats, recent projects, quick actions, and more
 * Uses Nurds Code design tokens: Cyan primary, Neon Green success, Orange warnings
 */
export default function Dashboard() {
  const [projects] = useState([
    {
      id: 1,
      name: 'Authentication UI',
      language: 'React',
      status: 'active',
      lastUpdated: '2 hours ago',
      description: 'Login and signup components',
    },
    {
      id: 2,
      name: 'API Integration',
      language: 'Node.js',
      status: 'completed',
      lastUpdated: '1 day ago',
      description: 'RESTful API endpoints',
    },
    {
      id: 3,
      name: 'Data Dashboard',
      language: 'React',
      status: 'in-progress',
      lastUpdated: '3 hours ago',
      description: 'Analytics visualization',
    },
  ]);

  const stats = [
    {
      label: 'Active Projects',
      value: '8',
      icon: FileCode,
      color: '#00F0FF',
      trend: '+2 this week',
    },
    {
      label: 'Tokens Used',
      value: '24,582',
      icon: Zap,
      color: '#00FF88',
      trend: 'est. cost: $24.58',
    },
    {
      label: 'Team Members',
      value: '5',
      icon: Users,
      color: '#FF6B00',
      trend: '+1 pending',
    },
    {
      label: 'Build Time (Avg)',
      value: '2.4s',
      icon: Clock,
      color: '#00F0FF',
      trend: '↓ 15% faster',
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-[#00FF88]';
      case 'completed':
        return 'text-[#00F0FF]';
      case 'in-progress':
        return 'text-[#FF9500]';
      default:
        return 'text-[#b0b0b0]';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'active':
        return 'bg-[#00FF88]/10';
      case 'completed':
        return 'bg-[#00F0FF]/10';
      case 'in-progress':
        return 'bg-[#FF9500]/10';
      default:
        return 'bg-[#1a1a2e]';
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-[#f5f5f5] pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Dashboard</h1>
            <p className="text-[#b0b0b0] mt-2">Welcome back! Here's your project overview</p>
          </div>

          <button className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#00F0FF] text-[#1a1a2e] font-semibold hover:bg-[#00dae6] transition-all shadow-lg shadow-[rgba(0,240,255,0.2)]">
            <Plus size={20} />
            New Project
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="bg-[#16213e] border border-[rgba(0,240,255,0.2)] rounded-lg p-6 space-y-4 hover:border-[#00F0FF]/50 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: `${stat.color}15` }}
                  >
                    <Icon size={24} style={{ color: stat.color }} />
                  </div>
                  <span className="text-xs text-[#00FF88]">{stat.trend}</span>
                </div>

                <div>
                  <p className="text-[#b0b0b0] text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Projects Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 size={24} className="text-[#00F0FF]" />
              Recent Projects
            </h2>

            <a
              href="/projects"
              className="flex items-center gap-1 text-[#00F0FF] hover:text-[#00dae6] transition-colors text-sm font-medium"
            >
              View All <ArrowRight size={16} />
            </a>
          </div>

          <div className="bg-[#16213e] border border-[rgba(0,240,255,0.2)] rounded-lg overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-3 md:grid-cols-5 gap-4 bg-[#0f3460] px-6 py-4 border-b border-[rgba(0,240,255,0.1)] text-sm font-semibold text-[#b0b0b0]">
              <div>Project Name</div>
              <div className="hidden md:block">Language</div>
              <div className="hidden md:block">Status</div>
              <div className="hidden md:block">Updated</div>
              <div className="text-right">Action</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-[rgba(0,240,255,0.1)]">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="grid grid-cols-3 md:grid-cols-5 gap-4 px-6 py-4 hover:bg-[#0f3460]/50 transition-colors items-center"
                >
                  <div>
                    <p className="font-medium">{project.name}</p>
                    <p className="text-xs text-[#707070]">{project.description}</p>
                  </div>

                  <div className="hidden md:block text-sm text-[#b0b0b0]">
                    {project.language}
                  </div>

                  <div className="hidden md:block">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBg(
                        project.status
                      )} ${getStatusColor(project.status)}`}
                    >
                      {project.status.replace('-', ' ')}
                    </span>
                  </div>

                  <div className="hidden md:block text-sm text-[#707070]">
                    {project.lastUpdated}
                  </div>

                  <div className="text-right">
                    <button className="flex items-center gap-1 px-3 py-1.5 rounded text-xs bg-[#1a1a2e] text-[#00F0FF] hover:bg-[#00F0FF]/10 border border-[#00F0FF]/30 transition-all ml-auto">
                      Open <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#16213e] border border-[rgba(0,240,255,0.2)] rounded-lg p-6 space-y-4 hover:border-[#00F0FF]/50 transition-all cursor-pointer">
            <FileCode size={32} className="text-[#00F0FF]" />
            <div>
              <h3 className="font-semibold mb-1">Create from Template</h3>
              <p className="text-sm text-[#b0b0b0]">Start with pre-built templates</p>
            </div>
            <button className="w-full py-2 rounded bg-[#00F0FF]/10 text-[#00F0FF] font-medium text-sm hover:bg-[#00F0FF]/20 transition-all">
              Browse Templates
            </button>
          </div>

          <div className="bg-[#16213e] border border-[rgba(0,240,255,0.2)] rounded-lg p-6 space-y-4 hover:border-[#00F0FF]/50 transition-all cursor-pointer">
            <Zap size={32} className="text-[#00FF88]" />
            <div>
              <h3 className="font-semibold mb-1">Upgrade Plan</h3>
              <p className="text-sm text-[#b0b0b0]">Get more tokens & features</p>
            </div>
            <button className="w-full py-2 rounded bg-[#00FF88]/10 text-[#00FF88] font-medium text-sm hover:bg-[#00FF88]/20 transition-all">
              View Pricing
            </button>
          </div>

          <div className="bg-[#16213e] border border-[rgba(0,240,255,0.2)] rounded-lg p-6 space-y-4 hover:border-[#00F0FF]/50 transition-all cursor-pointer">
            <Users size={32} className="text-[#FF6B00]" />
            <div>
              <h3 className="font-semibold mb-1">Invite Team</h3>
              <p className="text-sm text-[#b0b0b0]">Collaborate with your team</p>
            </div>
            <button className="w-full py-2 rounded bg-[#FF6B00]/10 text-[#FF6B00] font-medium text-sm hover:bg-[#FF6B00]/20 transition-all">
              Invite Members
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
