import React from 'react';
import { motion } from 'framer-motion';
import { Mic, Volume2, Settings } from 'lucide-react';

export default function VoiceProfileSettings() {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Mic className="w-10 h-10 text-purple-400" />
          <div>
            <h1 className="text-3xl font-bold">Voice Profile Settings</h1>
            <p className="text-gray-400">Configure your voice interaction preferences</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-4 mb-4">
              <Volume2 className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-semibold">Voice Output</h2>
            </div>
            <select className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3">
              <option>Alloy (Default)</option>
              <option>Echo</option>
              <option>Fable</option>
              <option>Onyx</option>
              <option>Nova</option>
              <option>Shimmer</option>
            </select>
          </div>

          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-4 mb-4">
              <Settings className="w-6 h-6 text-green-400" />
              <h2 className="text-xl font-semibold">Input Settings</h2>
            </div>
            <div className="flex items-center justify-between">
              <span>Enable voice input</span>
              <div className="w-12 h-6 bg-purple-500 rounded-full relative cursor-pointer">
                <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
