import React, { useState } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';

// Sub-page: Overview
function DeployOverview() {
  const projects = [
    { name: 'my-api', status: 'live', url: 'my-api.nurdscode.workers.dev', lastDeploy: '2 hours ago' },
    { name: 'landing-page', status: 'live', url: 'landing.nurdscode.pages.dev', lastDeploy: '1 day ago' },
    { name: 'test-worker', status: 'stopped', url: 'test.nurdscode.workers.dev', lastDeploy: '5 days ago' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Deployments</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500">+ New Deployment</button>
      </div>
      <div className="space-y-3">
        {projects.map((p, i) => (
          <div key={i} className="bg-gray-800/50 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className={`w-2 h-2 rounded-full ${p.status === 'live' ? 'bg-green-400' : 'bg-gray-500'}`}></span>
              <div>
                <p className="text-white font-medium">{p.name}</p>
                <p className="text-gray-500 text-sm">{p.url}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">{p.lastDeploy}</p>
              <button className="text-blue-400 text-sm hover:underline">View Logs</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Sub-page: Workers
function WorkersPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Cloudflare Workers</h2>
      <div className="bg-gray-800/50 rounded-xl p-6">
        <p className="text-gray-400 mb-4">Manage your serverless functions deployed on Cloudflare's global network.</p>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-gray-900 rounded-lg p-4">
            <p className="text-3xl font-bold text-blue-400">3</p>
            <p className="text-gray-500 text-sm">Active Workers</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-4">
            <p className="text-3xl font-bold text-green-400">1.2K</p>
            <p className="text-gray-500 text-sm">Requests Today</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-4">
            <p className="text-3xl font-bold text-yellow-400">12ms</p>
            <p className="text-gray-500 text-sm">Avg Latency</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-page: Pages
function PagesPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Cloudflare Pages</h2>
      <div className="bg-gray-800/50 rounded-xl p-6">
        <p className="text-gray-400 mb-4">Deploy full-stack applications with Git integration.</p>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500">Connect Repository</button>
      </div>
    </div>
  );
}

// Sub-page: Domains
function DomainsPage() {
  const [domains] = useState([
    { domain: 'nurdscode.com', status: 'Active', ssl: true },
    { domain: 'api.nurdscode.com', status: 'Active', ssl: true }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Custom Domains</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500">+ Add Domain</button>
      </div>
      <div className="space-y-3">
        {domains.map((d, i) => (
          <div key={i} className="bg-gray-800/50 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-white font-medium">{d.domain}</p>
              <p className="text-gray-500 text-sm">{d.status} • SSL {d.ssl ? '✓' : '✗'}</p>
            </div>
            <button className="text-gray-400 hover:text-white text-sm">Manage</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Sub-page: Environment Variables
function EnvVarsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Environment Variables</h2>
      <div className="bg-gray-800/50 rounded-xl p-6">
        <p className="text-gray-400 mb-4">Securely store secrets and configuration for your deployments.</p>
        <div className="space-y-3">
          {[
            { key: 'GOOGLE_API_KEY', value: '••••••••' },
            { key: 'STRIPE_SECRET_KEY', value: '••••••••' },
            { key: 'DATABASE_URL', value: '••••••••' }
          ].map((env, i) => (
            <div key={i} className="flex items-center gap-4 bg-gray-900 rounded-lg p-3">
              <code className="text-blue-400 flex-1">{env.key}</code>
              <code className="text-gray-500">{env.value}</code>
              <button className="text-gray-400 hover:text-white text-sm">Edit</button>
            </div>
          ))}
        </div>
        <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500">+ Add Variable</button>
      </div>
    </div>
  );
}

// Main Deploy Page with Sub-navigation
export default function Deploy() {
  const navItems = [
    { path: 'overview', label: 'Overview', icon: '🚀' },
    { path: 'workers', label: 'Workers', icon: '⚡' },
    { path: 'pages', label: 'Pages', icon: '📄' },
    { path: 'domains', label: 'Domains', icon: '🌐' },
    { path: 'env-vars', label: 'Env Variables', icon: '🔐' }
  ];

  return (
    <div className="flex gap-8 p-6">
      {/* Sidebar Navigation */}
      <nav className="w-56 shrink-0">
        <h1 className="text-xl font-bold text-white mb-6">🚀 Deploy</h1>
        <div className="space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border-l-2 border-blue-400'
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
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<DeployOverview />} />
          <Route path="workers" element={<WorkersPage />} />
          <Route path="pages" element={<PagesPage />} />
          <Route path="domains" element={<DomainsPage />} />
          <Route path="env-vars" element={<EnvVarsPage />} />
        </Routes>
      </div>
    </div>
  );
}
