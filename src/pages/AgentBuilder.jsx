import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Plus, Settings } from 'lucide-react';

export default function AgentBuilder() {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Agent Builder
          </h1>
          <button className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg inline-flex items-center gap-2">
            <Plus className="w-5 h-5" />
            New Agent
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {['Research Assistant', 'Code Reviewer', 'Documentation Writer'].map((name) => (
            <div key={name} className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-purple-500/50 transition-colors cursor-pointer">
              <Bot className="w-10 h-10 text-purple-400 mb-4" />
              <h3 className="font-semibold mb-2">{name}</h3>
              <p className="text-gray-500 text-sm mb-4">Custom agent template</p>
              <Settings className="w-5 h-5 text-gray-500" />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
