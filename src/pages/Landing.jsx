import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource-variable/doto';

// Interactive Circuit Box Component
function FloatingCircuitBox() {
  const [modules, setModules] = useState([
    { id: 1, name: 'AI', active: true, x: 0, y: 0 },
    { id: 2, name: 'CODE', active: true, x: 1, y: 0 },
    { id: 3, name: 'DEPLOY', active: false, x: 2, y: 0 },
    { id: 4, name: 'DB', active: true, x: 0, y: 1 },
    { id: 5, name: 'API', active: true, x: 1, y: 1 },
    { id: 6, name: 'CACHE', active: false, x: 2, y: 1 },
  ]);

  const toggleModule = (id) => {
    setModules(prev => prev.map(m => 
      m.id === id ? { ...m, active: !m.active } : m
    ));
  };

  return (
    <motion.div
      className="relative w-80 h-56 bg-panel border border-slime/30 p-4"
      initial={{ opacity: 0, scale: 0.9, rotateX: 10 }}
      animate={{ opacity: 1, scale: 1, rotateX: 0 }}
      transition={{ duration: 0.8, delay: 0.5 }}
      style={{
        boxShadow: '0 20px 60px rgba(0, 255, 204, 0.2), 0 0 100px rgba(0, 255, 204, 0.1)',
        transform: 'perspective(1000px)',
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-slime/20">
        <span className="font-doto text-xs text-slime">CIRCUIT BOX v1.0</span>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-slime animate-pulse" />
          <span className="font-doto text-xs text-mute">ACTIVE</span>
        </div>
      </div>

      {/* Module Grid */}
      <div className="grid grid-cols-3 gap-2">
        {modules.map((module) => (
          <motion.button
            key={module.id}
            onClick={() => toggleModule(module.id)}
            className={`
              p-2 border transition-all duration-300 cursor-pointer
              ${module.active 
                ? 'border-slime bg-slime/10 text-slime' 
                : 'border-danger/50 bg-danger/5 text-danger/50'
              }
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="font-doto text-xs">{module.name}</div>
            <div className={`
              w-full h-1 mt-1 
              ${module.active ? 'bg-slime' : 'bg-danger/30'}
            `} />
          </motion.button>
        ))}
      </div>

      {/* Status Bar */}
      <div className="absolute bottom-2 left-4 right-4 flex justify-between items-center">
        <span className="font-doto text-xs text-mute">
          {modules.filter(m => m.active).length}/{modules.length} ONLINE
        </span>
        <span className="font-doto text-xs text-electric">CLICK TO TOGGLE</span>
      </div>

      {/* Glow effect */}
      <div className="absolute -inset-1 bg-slime/5 blur-xl -z-10" />
    </motion.div>
  );
}

// Feature Card Component
function FeatureCard({ icon, title, description, delay }) {
  return (
    <motion.div
      className="bg-panel border border-panel p-6 hover:border-slime/50 transition-all duration-300 group"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="font-doto text-lg text-graffiti mb-2">{title}</h3>
      <p className="text-sm text-mute leading-relaxed">{description}</p>
    </motion.div>
  );
}

// Animated Stats Counter
function StatCounter({ value, label, suffix = '' }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="text-center">
      <div className="font-doto text-4xl md:text-5xl text-slime">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="font-doto text-xs text-mute mt-2">{label}</div>
    </div>
  );
}

// Main Landing Page
export default function Landing() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-void">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-circuit-pattern opacity-30" />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-void via-transparent to-void" />

        {/* Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-block mb-6"
          >
            <span className="font-doto text-xs px-4 py-2 border border-slime/30 bg-slime/10 text-slime">
              ⚡ POWERED BY CLOUDFLARE WORKERS
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
          >
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              THINK IT.
            </span>
            <br />
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              PROMPT IT.
            </span>
            <br />
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              BUILD IT.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="font-marker text-2xl md:text-3xl text-electric mb-8"
          >
            Join the Tribe of Nurds.
          </motion.p>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-lg text-mute max-w-2xl mx-auto mb-10"
          >
            The AI-powered coding platform for creatives who grew up to become 
            9-to-5 professionals who like to have fun. Build full-stack apps 
            with voice, deploy globally in seconds.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Link
              to="/editor"
              className="px-8 py-4 bg-slime text-void font-doto font-bold text-lg hover:shadow-neon transition-all duration-300 hover:scale-105"
            >
              START BUILDING →
            </Link>
            <Link
              to="/dashboard"
              className="px-8 py-4 border border-electric text-electric font-doto font-bold text-lg hover:bg-electric/10 transition-all duration-300"
            >
              VIEW DASHBOARD
            </Link>
          </motion.div>

          {/* Interactive Circuit Box */}
          <div className="flex justify-center">
            <FloatingCircuitBox />
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="font-doto text-xs text-mute">SCROLL TO EXPLORE</div>
          <div className="w-px h-8 bg-gradient-to-b from-slime to-transparent mx-auto mt-2" />
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-panel/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-doto text-3xl md:text-4xl text-graffiti mb-4">
              THE CIRCUIT BOX SYSTEM
            </h2>
            <p className="text-mute max-w-2xl mx-auto">
              A modular AI-powered development platform. Each component works 
              independently but together they create magic.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon="💻"
              title="VIBE CODING"
              description="Build full-stack apps with natural language. Just describe what you want and watch it come to life."
              delay={0.1}
            />
            <FeatureCard
              icon="🎤"
              title="VOICE FIRST"
              description="Talk to ACHEEVY, your AI coding assistant. Code with your voice, hands-free development."
              delay={0.2}
            />
            <FeatureCard
              icon="🚀"
              title="INSTANT DEPLOY"
              description="Deploy to Cloudflare's global edge network in seconds. 300+ locations worldwide."
              delay={0.3}
            />
            <FeatureCard
              icon="🤖"
              title="AI AGENTS"
              description="Specialized Boomer Angs for every task. Code_Ang, Paint_Ang, Ops_Ang, and more."
              delay={0.4}
            />
            <FeatureCard
              icon="⚡"
              title="CIRCUIT BREAKER"
              description="Intelligent failover between AI providers. Never lose a request, always stay online."
              delay={0.5}
            />
            <FeatureCard
              icon="🎨"
              title="NURD OS AESTHETIC"
              description="Industrial meets graffiti. Dark themes, electric accents, and that cyberpunk cash register vibe."
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 border-y border-panel">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCounter value={10000} label="NURDS BUILDING" suffix="+" />
            <StatCounter value={50000} label="APPS DEPLOYED" suffix="+" />
            <StatCounter value={99} label="UPTIME" suffix="%" />
            <StatCounter value={300} label="EDGE LOCATIONS" suffix="+" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-panel border border-slime/30 p-12"
          >
            <h2 className="font-marker text-3xl md:text-4xl text-electric mb-4">
              "I'm cool like that."
            </h2>
            <p className="text-mute mb-8 max-w-xl mx-auto">
              Ready to join the tribe? Start building with the most fun 
              AI-powered coding platform on the planet.
            </p>
            <Link
              to="/subscribe"
              className="inline-block px-10 py-4 bg-gradient-hero text-void font-doto font-bold text-lg hover:shadow-neon transition-all duration-300 hover:scale-105"
            >
              GET STARTED FREE
            </Link>
            <p className="font-doto text-xs text-mute mt-4">
              No credit card required • Free tier forever
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-panel">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-doto text-sm text-mute">
            © 2024 NURDS CODE • THINK IT. PROMPT IT. BUILD IT.
          </div>
          <div className="flex gap-6">
            <Link to="/pricing" className="font-doto text-xs text-mute hover:text-slime transition-colors">
              PRICING
            </Link>
            <Link to="/docs" className="font-doto text-xs text-mute hover:text-slime transition-colors">
              DOCS
            </Link>
            <a href="https://github.com" className="font-doto text-xs text-mute hover:text-slime transition-colors">
              GITHUB
            </a>
            <a href="https://discord.com" className="font-doto text-xs text-mute hover:text-slime transition-colors">
              DISCORD
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
