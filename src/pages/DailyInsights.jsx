import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Zap, Clock, BarChart3 } from 'lucide-react';

export default function DailyInsights() {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Daily Insights
        </h1>

        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { icon: Zap, label: 'Prompts Today', value: '47' },
            { icon: Clock, label: 'Time Saved', value: '3.2h' },
            { icon: TrendingUp, label: 'Productivity', value: '+23%' },
            { icon: BarChart3, label: 'Tokens Used', value: '12.4K' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/5 rounded-xl p-4 border border-white/10">
              <stat.icon className="w-6 h-6 text-purple-400 mb-2" />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-gray-500 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h2 className="text-xl font-semibold mb-4">Activity Feed</h2>
          <p className="text-gray-400">Your AI activity will appear here...</p>
        </div>
      </motion.div>
    </div>
  );
}
