import React from 'react';
import { motion } from 'framer-motion';
import { Volume2, Mic, Settings, Sliders } from 'lucide-react';

export default function AudioSettings() {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Sliders className="w-10 h-10 text-purple-400" />
          <div>
            <h1 className="text-3xl font-bold">Audio Settings</h1>
            <p className="text-gray-400">Configure audio input and output</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-4 mb-4">
              <Volume2 className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-semibold">Output Device</h2>
            </div>
            <select className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3">
              <option>System Default</option>
              <option>Speakers</option>
              <option>Headphones</option>
            </select>
          </div>

          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-4 mb-4">
              <Mic className="w-6 h-6 text-green-400" />
              <h2 className="text-xl font-semibold">Input Device</h2>
            </div>
            <select className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3">
              <option>System Default</option>
              <option>Built-in Microphone</option>
              <option>External Microphone</option>
            </select>
          </div>

          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-4 mb-4">
              <Settings className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-semibold">TTS Provider</h2>
            </div>
            <select className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3">
              <option>OpenAI TTS</option>
              <option>ElevenLabs</option>
              <option>Browser Native</option>
            </select>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
