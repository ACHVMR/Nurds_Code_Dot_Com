import React, { useState, useContext } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { DepartmentContext } from '../context/DepartmentContext';

// Sub-page: Editor
function VibeEditor() {
  const [code, setCode] = useState(`// Welcome to V.I.B.E. Editor
// Start coding your next project!

export default {
  async fetch(request, env) {
    return new Response("Hello from Nurds Code!");
  }
};`);

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">💻 Code Editor</h2>
        <div className="flex gap-2">
          <button className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-500">Run</button>
          <button className="px-3 py-1 bg-gray-700 text-white rounded text-sm hover:bg-gray-600">Save</button>
        </div>
      </div>
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="flex-1 bg-gray-900 border border-gray-700 rounded-lg p-4 font-mono text-sm text-green-400 resize-none focus:outline-none focus:border-purple-500"
        spellCheck={false}
      />
    </div>
  );
}

// Sub-page: AI Chat
function VibeChat() {
  const { energyLevel } = useContext(DepartmentContext);
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">🤖 AI Assistant</h2>
      <div className="bg-gray-800/50 rounded-xl p-6">
        <p className="text-gray-400 mb-4">
          Current Energy: <span className="text-purple-400">{energyLevel}</span>
        </p>
        <p className="text-white">
          Use the floating ACHEEVY panel (💬 button in bottom-right) to chat with the AI assistant.
          The V.I.B.E. department uses JOVIAL energy for creative, encouraging responses.
        </p>
      </div>
    </div>
  );
}

// Sub-page: Templates
function VibeTemplates() {
  const templates = [
    { name: 'REST API', desc: 'Cloudflare Worker with CRUD endpoints', icon: '🔌' },
    { name: 'React SPA', desc: 'Single-page app with Vite', icon: '⚛️' },
    { name: 'Landing Page', desc: 'Marketing page with animations', icon: '🎨' },
    { name: 'Full-Stack App', desc: 'Worker + D1 + React frontend', icon: '🏗️' }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">📋 Templates</h2>
      <div className="grid grid-cols-2 gap-4">
        {templates.map((t, i) => (
          <div key={i} className="bg-gray-800/50 rounded-xl p-6 hover:bg-gray-700/50 cursor-pointer transition-colors">
            <span className="text-3xl mb-3 block">{t.icon}</span>
            <p className="text-white font-medium">{t.name}</p>
            <p className="text-gray-500 text-sm">{t.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Sub-page: Projects
function VibeProjects() {
  const projects = [
    { name: 'my-api', language: 'TypeScript', lastEdit: '2 hours ago' },
    { name: 'portfolio-site', language: 'React', lastEdit: '1 day ago' },
    { name: 'discord-bot', language: 'JavaScript', lastEdit: '3 days ago' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">📁 Projects</h2>
        <button onClick={() => window.location.href = '/vibe-ide'} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500">+ New Project</button>
      </div>
      <div className="space-y-3">
        {projects.map((p, i) => (
          <div key={i} className="bg-gray-800/50 rounded-xl p-4 flex items-center justify-between hover:bg-gray-700/50 cursor-pointer transition-colors">
            <div>
              <p className="text-white font-medium">{p.name}</p>
              <p className="text-gray-500 text-sm">{p.language} • {p.lastEdit}</p>
            </div>
            <button className="text-purple-400 hover:text-purple-300">Open →</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Sub-page: Settings
function VibeSettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">⚙️ Editor Settings</h2>
      <div className="bg-gray-800/50 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between py-2 border-b border-gray-700">
          <div>
            <p className="text-white">Theme</p>
            <p className="text-gray-500 text-sm">Editor color scheme</p>
          </div>
          <select className="bg-gray-900 border border-gray-700 rounded px-3 py-1 text-white">
            <option>Dark (Default)</option>
            <option>Light</option>
            <option>Monokai</option>
          </select>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-gray-700">
          <div>
            <p className="text-white">Font Size</p>
            <p className="text-gray-500 text-sm">Code editor font size</p>
          </div>
          <select className="bg-gray-900 border border-gray-700 rounded px-3 py-1 text-white">
            <option>12px</option>
            <option>14px</option>
            <option>16px</option>
          </select>
        </div>
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-white">Auto-save</p>
            <p className="text-gray-500 text-sm">Automatically save changes</p>
          </div>
          <input type="checkbox" defaultChecked className="w-5 h-5 accent-purple-500" />
        </div>
      </div>
    </div>
  );
}

// Main V.I.B.E. Page with Sub-navigation
export default function Vibe() {
  const navItems = [
    { path: 'editor', label: 'Editor', icon: '💻' },
    { path: 'projects', label: 'Projects', icon: '📁' },
    { path: 'templates', label: 'Templates', icon: '📋' },
    { path: 'ai-chat', label: 'AI Chat', icon: '🤖' },
    { path: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <div className="flex gap-8 p-6">
      {/* Sidebar Navigation */}
      <nav className="w-56 shrink-0">
        <h1 className="text-xl font-bold text-white mb-6">💻 V.I.B.E.</h1>
        <p className="text-xs text-gray-500 mb-4">Vibrant Imagination Build Environment</p>
        <div className="space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-purple-600/20 text-purple-400 border-l-2 border-purple-400'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Content Area */}
      <div className="flex-1 max-w-4xl">
        <Routes>
          <Route index element={<Navigate to="editor" replace />} />
          <Route path="editor" element={<VibeEditor />} />
          <Route path="projects" element={<VibeProjects />} />
          <Route path="templates" element={<VibeTemplates />} />
          <Route path="ai-chat" element={<VibeChat />} />
          <Route path="settings" element={<VibeSettings />} />
        </Routes>
      </div>
    </div>
  );
}
