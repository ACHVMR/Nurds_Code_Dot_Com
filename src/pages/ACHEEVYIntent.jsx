import React from 'react';
import { motion } from 'framer-motion';
import { Brain, MessageSquare, Zap } from 'lucide-react';

export default function ACHEEVYIntent() {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-4 mb-8">
          <Brain className="w-10 h-10 text-purple-400" />
          <div>
            <h1 className="text-3xl font-bold">ACHEEVY Intent Engine</h1>
            <p className="text-gray-400">Natural language to action mapping</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <MessageSquare className="w-8 h-8 text-blue-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Intent Detection</h2>
            <p className="text-gray-400 mb-4">Analyze user prompts and extract actionable intents</p>
            <div className="space-y-2">
              {['BUILD', 'DEBUG', 'EXPLAIN', 'DEPLOY', 'RESEARCH'].map((intent) => (
                <span key={intent} className="inline-block px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm mr-2">
                  {intent}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <Zap className="w-8 h-8 text-yellow-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Action Routing</h2>
            <p className="text-gray-400 mb-4">Route intents to specialized II-Agents</p>
            <div className="space-y-2">
              {['NLU', 'Codegen', 'Research', 'Deploy', 'Validation'].map((agent) => (
                <span key={agent} className="inline-block px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm mr-2">
                  {agent}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
