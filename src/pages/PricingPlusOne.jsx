import React from 'react';
import { motion } from 'framer-motion';
import { Users, DollarSign, Plus } from 'lucide-react';

export default function PricingPlusOne() {
  return (
    <div className="min-h-screen bg-black text-white py-20">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Plus className="w-8 h-8 text-purple-400" />
            <h1 className="text-5xl font-bold">Plus 1 Team Plan</h1>
          </div>
          <p className="text-xl text-gray-400">Rideshare-style pricing for teams</p>
        </motion.div>

        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-8 border border-purple-500/20 mb-8">
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-purple-400" />
              <h3 className="text-2xl font-bold">$1/collaborator/day</h3>
              <p className="text-gray-400">Only pay for active team members</p>
            </div>
            <div className="text-center">
              <DollarSign className="w-12 h-12 mx-auto mb-4 text-green-400" />
              <h3 className="text-2xl font-bold">DIFU Credits</h3>
              <p className="text-gray-400">Share and transfer credits between team</p>
            </div>
          </div>

          <button className="w-full py-4 bg-purple-500 hover:bg-purple-600 rounded-xl font-semibold transition-colors">
            Start Team Trial
          </button>
        </div>
      </div>
    </div>
  );
}
