import React from 'react';
import { Link } from 'react-router-dom';

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
    <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-4 text-text">
            Pricing
          </h1>
          <p className="tagline mb-10">
            Think It. Prompt It. Build It.
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

        <hr className="my-10 border-border" />

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
