import React from 'react';
import { motion } from 'framer-motion';
import { Receipt, TrendingUp, Calendar } from 'lucide-react';

export default function UsageLedger() {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-4 mb-8">
          <Receipt className="w-10 h-10 text-purple-400" />
          <div>
            <h1 className="text-3xl font-bold">Usage Ledger</h1>
            <p className="text-gray-400">Track your AI usage and costs</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <TrendingUp className="w-6 h-6 text-green-400 mb-2" />
            <p className="text-2xl font-bold">124.5K</p>
            <p className="text-gray-500 text-sm">Tokens This Month</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <Calendar className="w-6 h-6 text-blue-400 mb-2" />
            <p className="text-2xl font-bold">$12.45</p>
            <p className="text-gray-500 text-sm">Current Bill</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <Receipt className="w-6 h-6 text-purple-400 mb-2" />
            <p className="text-2xl font-bold">847</p>
            <p className="text-gray-500 text-sm">API Calls</p>
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
          <p className="text-gray-400">Your usage history will appear here...</p>
        </div>
      </motion.div>
    </div>
  );
}
