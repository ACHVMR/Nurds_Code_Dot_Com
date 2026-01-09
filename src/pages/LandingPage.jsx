/**
 * NURD Landing Page
/**
 * Landing Page - Immersive Experience
 * Background: IMG_1862.PNG (branding image)
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function LandingPage() {
  const [activeZone, setActiveZone] = useState(null);
  
  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-[#0a0f1a]">
      
      {/* LAYER 0: Background Image */}
      <div 
        className="absolute inset-0 w-full h-full z-0"
        style={{
          backgroundImage: 'url("/assets/branding/IMG_1862.PNG")',
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#0a0f1a',
        }}
        role="img"
        aria-label="NURDS Code - AI-Powered Development Platform"
      />
      
      {/* LAYER 1: Gradient Overlay for depth */}
      <div className="absolute inset-0 z-[1] pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />
      </div>

      {/* LAYER 2: SEO Hidden Text */}
      <div className="sr-only">
        <h1>NURDS Code - AI-Powered Development Platform</h1>
        <p>Build faster with ACHEEVY - 19 specialized II-Agents for code generation, research, architecture, and deployment.</p>
        <h2>Features</h2>
        <ul>
          <li>KingMode Workflow - Brainstorm, Form, Execute</li>
          <li>Multi-Model Intelligence - Gemini, GLM, Claude</li>
          <li>Circuit Box - Toggle AI tools on/off</li>
          <li>Boomer_Ang Agents - Pre-configured specialists</li>
        </ul>
      </div>

      {/* LAYER 3: Floating CTA Buttons */}
      
      {/* Primary CTA - Chat w/ACHEEVY */}
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="fixed bottom-8 right-8 z-50"
      >
        <Link to="/chat-acheevy">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(139, 92, 246, 0.5)" }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-3 bg-gradient-to-r from-purple-600 to-cyan-500 text-white px-6 py-4 rounded-2xl font-semibold shadow-xl shadow-purple-500/30 border border-white/20"
          >
            <span className="text-2xl">🚀</span>
            <div className="text-left">
              <div className="text-lg font-bold">Chat w/ACHEEVY</div>
              <div className="text-xs text-white/70">Start Building Now</div>
            </div>
          </motion.button>
        </Link>
      </motion.div>

      {/* Secondary CTA - View Pricing */}
      <motion.div
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="fixed bottom-8 left-8 z-50"
      >
        <Link to="/pricing">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(16, 185, 129, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-5 py-3 rounded-xl font-semibold shadow-lg shadow-green-500/20 border border-white/10"
          >
            <span>View Pricing</span>
            <span>→</span>
          </motion.button>
        </Link>
      </motion.div>

      {/* Top Navigation Hints */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="fixed top-6 right-8 z-50 flex items-center gap-4"
      >
        <Link to="/boomer-angs">
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg text-white/80 text-sm font-medium border border-white/10 hover:bg-white/20 transition-colors"
          >
            Explore Agents
          </motion.button>
        </Link>
        <Link to="/editor">
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg text-white/80 text-sm font-medium border border-white/10 hover:bg-white/20 transition-colors"
          >
            V.I.B.E Editor
          </motion.button>
        </Link>
      </motion.div>

      {/* Animated Corner Accents */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="fixed top-0 left-0 w-32 h-32 z-40 pointer-events-none"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path
            d="M0,100 L0,30 Q0,0 30,0 L100,0"
            fill="none"
            stroke="url(#gradient1)"
            strokeWidth="2"
          />
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="fixed bottom-0 right-0 w-32 h-32 z-40 pointer-events-none rotate-180"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path
            d="M0,100 L0,30 Q0,0 30,0 L100,0"
            fill="none"
            stroke="url(#gradient2)"
            strokeWidth="2"
          />
          <defs>
            <linearGradient id="gradient2" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      {/* Subtle Particle Effect */}
      <div className="fixed inset-0 z-[2] pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/30 rounded-full"
            initial={{ 
              x: Math.random() * 100 + '%', 
              y: '110%',
              opacity: 0 
            }}
            animate={{ 
              y: '-10%',
              opacity: [0, 0.5, 0]
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: i * 1.5,
              ease: 'linear'
            }}
          />
        ))}
      </div>

    </div>
  );
}
