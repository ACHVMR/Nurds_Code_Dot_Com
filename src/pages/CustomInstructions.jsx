import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Save } from 'lucide-react';

export default function CustomInstructions() {
  const [instructions, setInstructions] = useState('');

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <FileText className="w-10 h-10 text-purple-400" />
          <div>
            <h1 className="text-3xl font-bold">Custom Instructions</h1>
            <p className="text-gray-400">Personalize how AI responds to you</p>
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <label className="block text-sm font-medium mb-2">Your Instructions</label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Tell the AI about your preferences, coding style, or specific requirements..."
            className="w-full h-64 bg-black/50 border border-white/10 rounded-lg p-4 text-white resize-none focus:outline-none focus:border-purple-500"
          />
          
          <button className="mt-4 px-6 py-3 bg-purple-500 hover:bg-purple-600 rounded-lg inline-flex items-center gap-2">
            <Save className="w-5 h-5" />
            Save Instructions
          </button>
        </div>
      </motion.div>
    </div>
  );
}
