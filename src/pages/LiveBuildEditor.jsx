import React from 'react';
import { motion } from 'framer-motion';
import { Code, Play, Save } from 'lucide-react';

export default function LiveBuildEditor() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Code className="w-6 h-6 text-purple-400" />
          <span className="font-semibold">Live Build Editor</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg inline-flex items-center gap-2 text-sm">
            <Save className="w-4 h-4" />
            Save
          </button>
          <button className="px-3 py-1.5 bg-green-500 hover:bg-green-600 rounded-lg inline-flex items-center gap-2 text-sm">
            <Play className="w-4 h-4" />
            Run
          </button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-2">
        <div className="border-r border-white/10 p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full bg-gray-900 rounded-lg p-4 font-mono text-sm"
          >
            <pre className="text-green-400">// Start coding here...</pre>
          </motion.div>
        </div>
        <div className="p-4">
          <div className="h-full bg-gray-900 rounded-lg p-4 flex items-center justify-center text-gray-500">
            Preview will appear here
          </div>
        </div>
      </div>
    </div>
  );
}
