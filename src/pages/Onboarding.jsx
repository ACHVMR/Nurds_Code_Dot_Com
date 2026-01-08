import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Rocket, Code, Zap, ArrowRight } from 'lucide-react';

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const steps = [
    { icon: Rocket, title: 'Welcome to Nurds Code', desc: 'Your AI-powered development platform' },
    { icon: Code, title: 'Pick Your Stack', desc: 'Tell us what you love to build' },
    { icon: Zap, title: 'Ready to Build', desc: 'Start your first project' },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="max-w-lg w-full px-6">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-center"
        >
          {React.createElement(steps[step].icon, { className: 'w-16 h-16 mx-auto mb-6 text-purple-400' })}
          <h1 className="text-3xl font-bold mb-4">{steps[step].title}</h1>
          <p className="text-gray-400 mb-8">{steps[step].desc}</p>

          <button
            onClick={() => step < 2 ? setStep(step + 1) : navigate('/editor')}
            className="px-8 py-3 bg-purple-500 hover:bg-purple-600 rounded-xl font-semibold inline-flex items-center gap-2"
          >
            {step < 2 ? 'Continue' : 'Get Started'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>

        <div className="flex justify-center gap-2 mt-8">
          {steps.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full ${i === step ? 'bg-purple-500' : 'bg-white/20'}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
