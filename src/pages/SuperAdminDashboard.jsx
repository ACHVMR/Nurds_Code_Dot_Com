import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Database, Settings } from 'lucide-react';

export default function SuperAdminDashboard() {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-4 mb-8">
          <Shield className="w-10 h-10 text-red-400" />
          <div>
            <h1 className="text-3xl font-bold">SuperAdmin Dashboard</h1>
            <p className="text-gray-400">System administration and monitoring</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { icon: Users, label: 'Total Users', value: '1,247' },
            { icon: Database, label: 'D1 Records', value: '45.2K' },
            { icon: Settings, label: 'Active Agents', value: '19' },
            { icon: Shield, label: 'System Status', value: 'Healthy' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/5 rounded-xl p-4 border border-white/10">
              <stat.icon className="w-6 h-6 text-purple-400 mb-2" />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-gray-500 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white/5 rounded-xl p-6 border border-red-500/20">
          <h2 className="text-xl font-semibold mb-4 text-red-400">Admin Controls</h2>
          <p className="text-gray-400">Administrative functions available here...</p>
        </div>
      </motion.div>
    </div>
  );
}
