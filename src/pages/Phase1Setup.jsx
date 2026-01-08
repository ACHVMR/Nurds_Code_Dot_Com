import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Check, Cloud, Database, Key } from 'lucide-react';

export default function Phase1Setup() {
  const steps = [
    { icon: Cloud, label: 'GCP Project', status: 'complete' },
    { icon: Database, label: 'D1 Database', status: 'complete' },
    { icon: Key, label: 'API Keys', status: 'pending' },
    { icon: Settings, label: 'Configuration', status: 'pending' },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Phase 1 Setup</h1>

        <div className="space-y-4">
          {steps.map((step, i) => (
            <div
              key={step.label}
              className={`flex items-center gap-4 p-4 rounded-xl border ${
                step.status === 'complete' ? 'bg-green-500/10 border-green-500/30' : 'bg-white/5 border-white/10'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step.status === 'complete' ? 'bg-green-500' : 'bg-white/10'
              }`}>
                {step.status === 'complete' ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
              </div>
              <span className="font-medium">{step.label}</span>
              <span className={`ml-auto text-sm ${step.status === 'complete' ? 'text-green-400' : 'text-gray-500'}`}>
                {step.status === 'complete' ? 'Complete' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
