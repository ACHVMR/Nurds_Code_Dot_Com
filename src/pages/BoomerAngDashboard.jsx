import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Fingerprint, Shield, Activity } from 'lucide-react';

export default function BoomerAngDashboard() {
  const agents = [
    { id: 'BA-001', name: 'Research Pioneer', status: 'active' },
    { id: 'BA-002', name: 'Code Architect', status: 'active' },
    { id: 'BA-003', name: 'Security Guardian', status: 'standby' },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-4 mb-8">
          <Bot className="w-10 h-10 text-purple-400" />
          <div>
            <h1 className="text-3xl font-bold">Boomer_Ang Registry</h1>
            <p className="text-gray-400">KYB-compliant AI agent identities</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {agents.map((agent) => (
            <div key={agent.id} className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <Fingerprint className="w-8 h-8 text-purple-400" />
                <span className={`px-2 py-1 rounded-full text-xs ${
                  agent.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {agent.status}
                </span>
              </div>
              <h3 className="font-semibold mb-1">{agent.name}</h3>
              <p className="text-gray-500 text-sm font-mono">{agent.id}</p>
              <div className="mt-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-gray-400">KYB Verified</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
