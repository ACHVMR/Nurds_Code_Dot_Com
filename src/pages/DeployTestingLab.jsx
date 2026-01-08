import React from 'react';
import { motion } from 'framer-motion';
import { FlaskConical, Play, CheckCircle, XCircle } from 'lucide-react';

export default function DeployTestingLab() {
  const tests = [
    { name: 'API Health Check', status: 'pass' },
    { name: 'D1 Connection', status: 'pass' },
    { name: 'Auth Flow', status: 'pass' },
    { name: 'Agent Routing', status: 'pending' },
    { name: 'Stripe Integration', status: 'fail' },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <FlaskConical className="w-10 h-10 text-purple-400" />
            <div>
              <h1 className="text-3xl font-bold">Testing Lab</h1>
              <p className="text-gray-400">Automated deployment tests</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg inline-flex items-center gap-2">
            <Play className="w-5 h-5" />
            Run All Tests
          </button>
        </div>

        <div className="space-y-3">
          {tests.map((test) => (
            <div key={test.name} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
              <span className="font-medium">{test.name}</span>
              <div className="flex items-center gap-2">
                {test.status === 'pass' && <CheckCircle className="w-5 h-5 text-green-400" />}
                {test.status === 'fail' && <XCircle className="w-5 h-5 text-red-400" />}
                {test.status === 'pending' && <div className="w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />}
                <span className={`text-sm ${
                  test.status === 'pass' ? 'text-green-400' : 
                  test.status === 'fail' ? 'text-red-400' : 'text-yellow-400'
                }`}>
                  {test.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
