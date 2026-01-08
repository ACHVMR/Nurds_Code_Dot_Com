import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Check } from 'lucide-react';

export default function Subscribe() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white py-20">
      <div className="max-w-2xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">Complete Your Subscription</h1>
          <p className="text-gray-400">You're one step away from unlimited AI power</p>
        </motion.div>

        <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
          <div className="flex items-center gap-4 mb-8">
            <CreditCard className="w-8 h-8 text-purple-400" />
            <div>
              <h2 className="text-xl font-semibold">Galaxy Plan</h2>
              <p className="text-gray-400">$49/month • Billed monthly</p>
            </div>
          </div>

          <div className="space-y-3 mb-8">
            {['Unlimited prompts', 'All 19 II-Agents', 'KingMode workflows', 'API access'].map((f) => (
              <div key={f} className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-400" />
                <span>{f}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setLoading(true)}
            disabled={loading}
            className="w-full py-4 bg-purple-500 hover:bg-purple-600 rounded-xl font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Subscribe Now'}
          </button>
        </div>
      </div>
    </div>
  );
}
