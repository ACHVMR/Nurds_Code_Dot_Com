import React from 'react';
import { Link } from 'react-router-dom';

// Plug Example Card Component
function PlugExampleCard({ icon, name, description }) {
  return (
    <div className="bg-slate-800/50 border border-[#39FF14]/30 rounded-lg p-6 hover:border-[#39FF14]/60 hover:shadow-lg hover:shadow-[#39FF14]/20 transition-all group cursor-pointer">
      <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="text-lg font-bold text-text mb-2">{name}</h3>
      <p className="text-sm text-text/60 mb-4">{description}</p>
      <div className="text-xs text-[#39FF14] font-semibold group-hover:text-white transition-colors">
        View Template →
      </div>
    </div>
  );
}

function Pricing() {
  const tiers = [
    {
      name: 'Free',
      price: '$0',
      cta: 'Get Started',
      bullets: [
        'GROQ 8B default • 5K tokens/day',
        'Basic editor & tutorials',
        'Community support',
      ],
      footnote: 'Best for learning.',
      priceId: 'free',
    },
    {
      name: 'Buy Me a Coffee ☕',
      price: '$7 / mo',
      cta: 'Join Coffee Tier',
      bullets: [
        'GROQ 70B default • 150K tokens/mo',
        'Priority tutorial tracks',
        'Early access labs',
      ],
      footnote: 'Great for hobbyists.',
      priceId: 'price_coffee',
    },
    {
      name: 'Pro',
      price: '$29 / mo',
      cta: 'Upgrade to Pro',
      bullets: [
        'GPT-4o mini default • 2M tokens/mo',
        'Project workspaces & sharing',
        'Priority inference routing',
      ],
      footnote: 'For serious builders.',
      priceId: 'price_pro',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: '$99 / mo',
      cta: 'Talk to Sales',
      bullets: [
        'Mixed routing (GROQ + Claude/GPT)',
        '5M tokens/mo • Team features',
        'SLA + custom controls',
      ],
      footnote: 'Teams & schools.',
      priceId: 'price_enterprise',
    },
  ];

  const modelNotes = [
    {
      name: 'GROQ 8B (default free)',
      pro: 'fast, $0',
      con: 'weaker reasoning & tools',
    },
    {
      name: 'GROQ 70B',
      pro: 'stronger coding',
      con: 'higher latency',
    },
    {
      name: 'GPT-4o mini',
      pro: 'balanced quality/cost',
      con: 'paid',
    },
    {
      name: 'Claude mix',
      pro: 'long-context, safety',
      con: 'premium',
    },
  ];

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero: What Can You Create? - Plugs Centerpiece */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 text-text">
            <span className="text-[#39FF14]">What Can You Create?</span>
          </h1>
          <p className="text-xl text-text/70 mb-12 max-w-3xl mx-auto">
            Deploy custom plugs with any plan. From simple chatbots to complex AI workflows—build and ship in minutes.
          </p>

          {/* Plug Showcase - Centerpiece */}
          <div className="flex justify-center mb-16">
            <div className="relative w-full max-w-xl">
              {/* Main Featured Plug */}
              <img 
                src="/assets/plugs/plug-neon-curve.png" 
                alt="Plug Me In - Heavy"
                className="w-full max-w-md h-auto mx-auto drop-shadow-2xl"
                style={{ 
                  filter: 'drop-shadow(0 0 40px rgba(57, 255, 20, 0.4)) drop-shadow(0 0 80px rgba(217, 70, 239, 0.25))',
                  animation: 'pulse-glow 2s ease-in-out infinite'
                }}
              />
              <style>{`
                @keyframes pulse-glow {
                  0%, 100% { filter: drop-shadow(0 0 40px rgba(57, 255, 20, 0.4)) drop-shadow(0 0 80px rgba(217, 70, 239, 0.25)); }
                  50% { filter: drop-shadow(0 0 60px rgba(57, 255, 20, 0.6)) drop-shadow(0 0 100px rgba(217, 70, 239, 0.35)); }
                }
              `}</style>
            </div>
          </div>

          {/* Plug Examples Grid */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-text mb-8">Popular Plug Templates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <PlugExampleCard 
                icon="💬" 
                name="Chatbot" 
                description="Customer support & engagement"
              />
              <PlugExampleCard 
                icon="⚙️" 
                name="API Agent" 
                description="REST & GraphQL automation"
              />
              <PlugExampleCard 
                icon="📋" 
                name="Form Builder" 
                description="Dynamic data collection"
              />
              <PlugExampleCard 
                icon="📊" 
                name="Dashboard" 
                description="Real-time analytics"
              />
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-[#39FF14]/10 to-[#D946EF]/10 border border-[#39FF14]/30 rounded-lg p-8 mb-16">
            <h3 className="text-2xl font-bold text-text mb-3">Ready to Deploy Your First Plug?</h3>
            <p className="text-text/70 mb-6">Choose a plan below and start building. All plans include access to our plug marketplace and deployment templates.</p>
            <div className="text-sm text-text/60">✨ Get $50 DIFU credits on your first purchase</div>
          </div>
        </div>

        {/* Pricing Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-text">
            Plans for Every Builder
          </h2>
          <p className="text-lg text-text/60 mb-8">
            From learning to enterprise—find your fit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`panel flex flex-col ${
                tier.popular ? 'border-2 border-accent' : ''
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-accent text-background px-3 py-1 text-xs font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-xl mb-1 text-text">{tier.name}</div>
              <div className="text-3xl mb-4 text-text">{tier.price}</div>
              
              <ul className="space-y-2 mb-6 flex-grow">
                {tier.bullets.map((bullet) => (
                  <li key={bullet} className="text-sm text-text">
                    • {bullet}
                  </li>
                ))}
              </ul>

              <Link
                to={`/subscribe?plan=${tier.priceId}`}
                className="btn-primary text-center block mt-auto"
              >
                {tier.cta}
              </Link>
              
              <div className="text-xs text-mute mt-3">{tier.footnote}</div>
            </div>
          ))}
        </div>

        <hr className="my-12 border-border" />

        {/* AI Model Guidance */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-text mb-6 text-center">Choose Your AI Engine</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {modelNotes.map((model) => (
              <div key={model.name} className="panel p-4 hover:border-[#39FF14]/60 transition-colors">
                <div className="font-semibold text-text mb-3">{model.name}</div>
                <div className="text-sm space-y-2">
                  <div>
                    <span className="text-[#39FF14]">✓</span>
                    <span className="text-text/80 ml-2">{model.pro}</span>
                  </div>
                  <div>
                    <span className="text-amber-500">−</span>
                    <span className="text-text/60 ml-2 text-xs">{model.con}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-text/60 text-sm mb-4">
            🎁 All plans include <span className="text-[#39FF14] font-semibold">14-day money-back guarantee</span>. No questions asked.
          </p>
          <p className="text-text/40 text-xs">
            Upgrade or downgrade anytime. Usage resets monthly.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Pricing;
