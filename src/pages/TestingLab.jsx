import React, { useState } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { auditCode } from '../utils/deepmind-api';

// Import the fixed Testing Sandbox
import TestingSandbox from './TestingSandbox';

// Sub-page: Security Scanner (Uses CodeMender)
function SecurityScanner() {
  const [code, setCode] = useState(`// Paste code to scan for vulnerabilities
function login(username, password) {
  const query = "SELECT * FROM users WHERE user='" + username + "'";
  return db.query(query);
}`);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleScan = async () => {
    setLoading(true);
    try {
      const report = await auditCode(code);
      setResult(report);
    } catch (e) {
      setResult({ error: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">🛡️ Security Scanner</h2>
      <p className="text-gray-400">Powered by CodeMender AI - Scan your code for OWASP vulnerabilities.</p>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Code to Scan</label>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-64 bg-gray-900 border border-gray-700 rounded-lg p-4 font-mono text-sm text-green-400 resize-none"
            spellCheck={false}
          />
          <button
            onClick={handleScan}
            disabled={loading}
            className="mt-3 px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-500 disabled:opacity-50"
          >
            {loading ? 'Scanning...' : '🔍 Scan Code'}
          </button>
        </div>
        
        <div>
          <label className="block text-sm text-gray-400 mb-2">Security Report</label>
          <div className="h-64 bg-gray-900 border border-gray-700 rounded-lg p-4 overflow-auto">
            {result ? (
              result.error ? (
                <p className="text-red-400">{result.error}</p>
              ) : (
                <div className="space-y-3">
                  {result.vulnerabilities?.map((v, i) => (
                    <div key={i} className="p-2 bg-red-900/30 border-l-2 border-red-500 rounded">
                      <p className="text-red-400 font-medium">{v.severity}: {v.type}</p>
                      <p className="text-gray-400 text-sm">{v.description}</p>
                    </div>
                  ))}
                  {result.vulnerabilities?.length === 0 && (
                    <p className="text-green-400">✓ No vulnerabilities found!</p>
                  )}
                </div>
              )
            ) : (
              <p className="text-gray-500">Results will appear here after scanning.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-page: Performance Monitor
function PerformanceMonitor() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">📊 Performance Monitor</h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-800/50 rounded-xl p-6 text-center">
          <p className="text-4xl font-bold text-green-400">12ms</p>
          <p className="text-gray-500 text-sm">Avg Response Time</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-6 text-center">
          <p className="text-4xl font-bold text-blue-400">1.2K</p>
          <p className="text-gray-500 text-sm">Requests/min</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-6 text-center">
          <p className="text-4xl font-bold text-yellow-400">99.9%</p>
          <p className="text-gray-500 text-sm">Uptime</p>
        </div>
      </div>
      <div className="bg-gray-800/50 rounded-xl p-6">
        <p className="text-gray-400">Real-time performance monitoring coming soon. This will track Worker CPU time, memory usage, and request latency.</p>
      </div>
    </div>
  );
}

// Sub-page: Unit Tests
function UnitTests() {
  const [tests] = useState([
    { name: 'API Health Check', status: 'passed', time: '12ms' },
    { name: 'Auth Flow', status: 'passed', time: '45ms' },
    { name: 'Database Connection', status: 'passed', time: '8ms' },
    { name: 'Rate Limiting', status: 'failed', time: '120ms' }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">🧬 Unit Tests</h2>
        <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-500">Run All Tests</button>
      </div>
      <div className="space-y-2">
        {tests.map((t, i) => (
          <div key={i} className={`p-4 rounded-lg flex items-center justify-between ${t.status === 'passed' ? 'bg-green-900/20 border border-green-700' : 'bg-red-900/20 border border-red-700'}`}>
            <div className="flex items-center gap-3">
              <span>{t.status === 'passed' ? '✅' : '❌'}</span>
              <span className="text-white">{t.name}</span>
            </div>
            <span className="text-gray-500 text-sm">{t.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Sub-page: Logs
function LogsViewer() {
  const [logs] = useState([
    { time: '13:45:02', level: 'info', message: 'Worker started successfully' },
    { time: '13:45:03', level: 'info', message: 'Database connection established' },
    { time: '13:45:05', level: 'warn', message: 'Rate limit approaching for IP 192.168.1.1' },
    { time: '13:45:10', level: 'error', message: 'Failed to fetch external API' },
    { time: '13:45:12', level: 'info', message: 'Request processed: GET /api/health' }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">📜 Logs</h2>
        <button className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600">Clear Logs</button>
      </div>
      <div className="bg-gray-900 rounded-xl p-4 font-mono text-sm max-h-[500px] overflow-auto">
        {logs.map((log, i) => (
          <div key={i} className={`py-1 ${log.level === 'error' ? 'text-red-400' : log.level === 'warn' ? 'text-yellow-400' : 'text-gray-400'}`}>
            <span className="text-gray-600">[{log.time}]</span> <span className="uppercase">{log.level}</span>: {log.message}
          </div>
        ))}
      </div>
    </div>
  );
}

// Main Testing Lab Page with Sub-navigation
export default function TestingLab() {
  const navItems = [
    { path: 'sandbox', label: 'Sandbox', icon: '🧪' },
    { path: 'security', label: 'Security', icon: '🛡️' },
    { path: 'performance', label: 'Performance', icon: '📊' },
    { path: 'tests', label: 'Unit Tests', icon: '🧬' },
    { path: 'logs', label: 'Logs', icon: '📜' }
  ];

  return (
    <div className="flex gap-8 p-6">
      {/* Sidebar Navigation */}
      <nav className="w-56 shrink-0">
        <h1 className="text-xl font-bold text-white mb-6">🧪 Testing Lab</h1>
        <div className="space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-yellow-600/20 text-yellow-400 border-l-2 border-yellow-400'
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
      <div className="flex-1">
        <Routes>
          <Route index element={<Navigate to="sandbox" replace />} />
          <Route path="sandbox" element={<TestingSandbox />} />
          <Route path="security" element={<SecurityScanner />} />
          <Route path="performance" element={<PerformanceMonitor />} />
          <Route path="tests" element={<UnitTests />} />
          <Route path="logs" element={<LogsViewer />} />
        </Routes>
      </div>
    </div>
  );
}
