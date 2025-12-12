import React, { useState } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';

// Sub-page: Profile
function ProfileSettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Profile Settings</h2>
      <div className="bg-gray-800/50 rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Display Name</label>
          <input type="text" defaultValue="Nurds User" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2">Email</label>
          <input type="email" defaultValue="user@nurdscode.com" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2">Bio</label>
          <textarea rows={3} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white" placeholder="Tell us about yourself..." />
        </div>
        <button className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500">Save Changes</button>
      </div>
    </div>
  );
}

// Sub-page: Billing
function BillingSettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Billing & Subscription</h2>
      <div className="bg-gray-800/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-gray-400 text-sm">Current Plan</p>
            <p className="text-xl font-bold text-emerald-400">Free Tier</p>
          </div>
          <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500">Upgrade</button>
        </div>
        <div className="border-t border-gray-700 pt-4">
          <p className="text-gray-400 text-sm mb-2">Usage This Month</p>
          <div className="w-full bg-gray-900 rounded-full h-2">
            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '35%' }}></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">350 / 1,000 API calls</p>
        </div>
      </div>
    </div>
  );
}

// Sub-page: API Keys
function APIKeysSettings() {
  const [keys] = useState([
    { name: 'Production Key', key: 'sk-prod-****...', created: '2024-01-15' },
    { name: 'Development Key', key: 'sk-dev-****...', created: '2024-02-01' }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">API Keys</h2>
        <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500">+ New Key</button>
      </div>
      <div className="space-y-3">
        {keys.map((k, i) => (
          <div key={i} className="bg-gray-800/50 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-white font-medium">{k.name}</p>
              <p className="text-gray-500 text-sm font-mono">{k.key}</p>
            </div>
            <div className="flex gap-2">
              <button className="text-gray-400 hover:text-white text-sm">Copy</button>
              <button className="text-red-400 hover:text-red-300 text-sm">Revoke</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Sub-page: Notifications
function NotificationSettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Notifications</h2>
      <div className="bg-gray-800/50 rounded-xl p-6 space-y-4">
        {[
          { label: 'Email notifications', desc: 'Receive updates via email' },
          { label: 'Push notifications', desc: 'Browser push alerts' },
          { label: 'Weekly digest', desc: 'Summary of your activity' },
          { label: 'Security alerts', desc: 'Important security updates' }
        ].map((item, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0">
            <div>
              <p className="text-white">{item.label}</p>
              <p className="text-gray-500 text-sm">{item.desc}</p>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5 accent-emerald-500" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Sub-page: Security
function SecuritySettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Security</h2>
      <div className="bg-gray-800/50 rounded-xl p-6 space-y-6">
        <div>
          <p className="text-white font-medium mb-2">Change Password</p>
          <div className="space-y-3">
            <input type="password" placeholder="Current password" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white" />
            <input type="password" placeholder="New password" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white" />
            <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500">Update Password</button>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-4">
          <p className="text-white font-medium mb-2">Two-Factor Authentication</p>
          <p className="text-gray-500 text-sm mb-3">Add an extra layer of security to your account.</p>
          <button className="px-4 py-2 border border-emerald-500 text-emerald-400 rounded-lg hover:bg-emerald-500/10">Enable 2FA</button>
        </div>
      </div>
    </div>
  );
}

// Main Settings Page with Sub-navigation
export default function Settings() {
  const navItems = [
    { path: 'profile', label: 'Profile', icon: '👤' },
    { path: 'billing', label: 'Billing', icon: '💳' },
    { path: 'api-keys', label: 'API Keys', icon: '🔑' },
    { path: 'notifications', label: 'Notifications', icon: '🔔' },
    { path: 'security', label: 'Security', icon: '🛡️' }
  ];

  return (
    <div className="flex gap-8 p-6">
      {/* Sidebar Navigation */}
      <nav className="w-56 shrink-0">
        <h1 className="text-xl font-bold text-white mb-6">⚙️ Settings</h1>
        <div className="space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-emerald-600/20 text-emerald-400 border-l-2 border-emerald-400'
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
      <div className="flex-1 max-w-3xl">
        <Routes>
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="profile" element={<ProfileSettings />} />
          <Route path="billing" element={<BillingSettings />} />
          <Route path="api-keys" element={<APIKeysSettings />} />
          <Route path="notifications" element={<NotificationSettings />} />
          <Route path="security" element={<SecuritySettings />} />
        </Routes>
      </div>
    </div>
  );
}
