import React from 'react';
import { Link } from 'react-router-dom';

function Pricing() {
  const tiers = [
    {
      name: 'Free',
      price: '$0',
      cta: 'Get Started',
      bullets: [
        'GROQ models only',
        '2 projects max',
        'No collaboration',
        'No voice features',
        'Community support',
      ],
      footnote: 'Perfect for learning.',
      priceId: 'free',
    },
    {
      name: 'Buy Me a Coffee',
      price: '$6.99 / mo',
      cta: 'Join Coffee Tier',
      bullets: [
        '10M tokens/month',
        'Basic voice features',
        '5 projects max',
        'Email support',
      ],
      footnote: 'Great for hobbyists.',
      priceId: 'price_coffee',
    },
    {
      name: 'LITE',
      price: '$14.99 / mo',
      cta: 'Upgrade to LITE',
      bullets: [
        '30M tokens/month',
        'Full voice integration',
        'Unlimited projects',
        'Priority support',
      ],
      footnote: 'For individual developers.',
      priceId: 'price_lite',
    },
    {
      name: 'Medium',
      price: '$49.99 / mo',
      cta: 'Upgrade to Medium',
      bullets: [
        '150M tokens/month',
        'All premium models (GPT-4, Claude)',
        'Full voice features',
        'Team collaboration',
        'Priority support',
      ],
      footnote: 'For teams & serious builders.',
      priceId: 'price_medium',
      popular: true,
    },
    {
      name: 'Heavy',
      price: '$149.99 / mo',
      cta: 'Upgrade to Heavy',
      bullets: [
        '500M tokens/month',
        'Advanced AI models',
        'Dedicated resources',
        'Premium support',
        'Custom integrations',
      ],
      footnote: 'For power users.',
      priceId: 'price_heavy',
    },
    {
      name: 'Superior',
      price: '$349.99 / mo',
      cta: 'Go Superior',
      bullets: [
        'Unlimited tokens',
        'Enterprise features',
        'Dedicated support',
        'SLA guarantees',
        'White-label options',
      ],
      footnote: 'For large organizations.',
      priceId: 'price_superior',
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
    <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Tagline */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4 text-text">
            Pricing
          </h1>
          <p className="tagline mb-8">
            Think It. Prompt It. Build It.
          </p>
          
          {/* NURD Tagline Sticker */}
          <div className="flex justify-center mb-8">
            <img 
              src="/assets/branding/nurd-tagline.png" 
              alt="NURD I'm cool like that"
              className="h-16 md:h-20 object-contain hover:scale-105 transition-transform"
            />
          </div>
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
              
              <ul className="space-y-2 mb-6 grow">
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

        <hr className="my-10 border-border" />

        {/* Plus One Pricing Section */}
        <div className="mb-16 bg-[#E68961]/5 border border-[#E68961] rounded-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-text mb-2">Plus One: Add Collaborators</h2>
            <p className="text-text/70 text-lg">
              Add team members for just $1/day • Save up to 50% with progressive discounts
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center p-6 bg-[#1a1a1a] rounded-lg">
              <div className="text-4xl font-bold text-[#E68961] mb-2">$1/day</div>
              <div className="text-text/60">per collaborator</div>
            </div>
            <div className="text-center p-6 bg-[#1a1a1a] rounded-lg">
              <div className="text-4xl font-bold text-[#E68961] mb-2">50%</div>
              <div className="text-text/60">max discount (5 people)</div>
            </div>
            <div className="text-center p-6 bg-[#1a1a1a] rounded-lg">
              <div className="text-4xl font-bold text-[#E68961] mb-2">∞</div>
              <div className="text-text/60">unlimited projects</div>
            </div>
          </div>

          <div className="text-center">
            <Link
              to="/pricing/plus-one"
              className="inline-block px-8 py-3 bg-[#E68961] text-black rounded-lg font-semibold hover:bg-[#D4A05F] transition-colors"
            >
              View Plus One Details
            </Link>
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-2xl mb-4 text-text">Model options & upgrade guidance</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {modelNotes.map((model) => (
              <div key={model.name} className="panel p-4">
                <div className="font-semibold text-text mb-2">{model.name}</div>
                <div className="text-sm mt-1">
                  <span className="text-neon">+</span> {model.pro}
                </div>
                <div className="text-sm">
                  <span className="text-accent">–</span> {model.con}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-mute text-sm">
            All plans include a 14-day money-back guarantee. No questions asked.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Pricing;
