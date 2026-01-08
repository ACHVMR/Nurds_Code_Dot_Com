import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, Check, AlertCircle, Clock } from 'lucide-react';

export default function DeployWorkbench() {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-4 mb-8">
          <Rocket className="w-10 h-10 text-purple-400" />
          <div>
            <h1 className="text-3xl font-bold">Deploy Workbench</h1>
            <p className="text-gray-400">One-click deployment to production</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <Check className="w-8 h-8 text-green-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Cloudflare Workers</h3>
            <p className="text-gray-400 text-sm mb-4">Edge API deployment</p>
            <span className="text-green-400 text-sm">Deployed</span>
          </div>

          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <Clock className="w-8 h-8 text-yellow-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Cloud Run</h3>
            <p className="text-gray-400 text-sm mb-4">II-Agent containers</p>
            <span className="text-yellow-400 text-sm">Pending</span>
          </div>

          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <AlertCircle className="w-8 h-8 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Vercel</h3>
            <p className="text-gray-400 text-sm mb-4">Frontend hosting</p>
            <span className="text-gray-400 text-sm">Not configured</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
