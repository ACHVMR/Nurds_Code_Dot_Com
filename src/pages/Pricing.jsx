import React from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Crown, Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';

const tiers = [
  {
    name: 'Satellite',
    price: 'Free',
    description: 'Perfect for getting started',
    icon: Rocket,
    color: '#3B82F6',
    features: ['5 prompts/day', 'Basic agents', 'Community support'],
  },
  {
    name: 'Star',
    price: '$19/mo',
    description: 'For individual creators',
    icon: Zap,
    color: '#F59E0B',
    features: ['100 prompts/day', 'All II-Agents', 'Voice features', 'Priority support'],
  },
  {
    name: 'Galaxy',
    price: '$49/mo',
    description: 'For teams and power users',
    icon: Crown,
    color: '#8B5CF6',
    features: ['Unlimited prompts', 'KingMode', 'Custom agents', 'API access', 'Dedicated support'],
    popular: true,
  },
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-black text-white py-20">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-400">Choose your level. Scale as you grow.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative bg-white/5 rounded-2xl p-8 border ${
                tier.popular ? 'border-purple-500' : 'border-white/10'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-purple-500 rounded-full text-sm font-medium">
                  Most Popular
                </div>
              )}
              <tier.icon className="w-10 h-10 mb-4" style={{ color: tier.color }} />
              <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
              <p className="text-gray-400 mb-4">{tier.description}</p>
              <div className="text-4xl font-bold mb-6">{tier.price}</div>
              <ul className="space-y-3 mb-8">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-400" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/subscribe"
                className={`block w-full py-3 rounded-lg text-center font-medium transition-colors ${
                  tier.popular
                    ? 'bg-purple-500 hover:bg-purple-600'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                Get Started
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link to="/pricing/plus-one" className="text-purple-400 hover:text-purple-300">
            Looking for team pricing? Check out Plus 1 →
          </Link>
        </div>
      </div>
    </div>
  );
}
