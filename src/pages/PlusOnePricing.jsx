import React from 'react';
import { Users, Check, TrendingDown } from 'lucide-react';

function PlusOnePricing() {
  const pricingTiers = [
    { collaborators: 1, dailyCost: 1.00, monthlyCost: 30.00, discount: 0 },
    { collaborators: 2, dailyCost: 1.60, monthlyCost: 48.00, discount: 20 },
    { collaborators: 3, dailyCost: 2.10, monthlyCost: 63.00, discount: 30 },
    { collaborators: 4, dailyCost: 2.40, monthlyCost: 72.00, discount: 40 },
    { collaborators: 5, dailyCost: 2.50, monthlyCost: 75.00, discount: 50 },
  ];

  const features = [
    'Unlimited voice conversations',
    'Priority model access (GPT-4, Claude Opus)',
    'Shared project workspaces',
    'Real-time collaboration',
    'Microsoft Teams integration',
    'Zoom integration',
    'Google Meet integration (coming soon)',
    'Advanced analytics dashboard',
    'Priority support',
    'Custom voice profiles',
    'Context engineering profiles',
    'Daily AI insights',
  ];

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Users className="w-12 h-12 text-[#E68961]" />
            <h1 className="text-5xl font-bold">Plus One Pricing</h1>
          </div>
          <p className="text-xl text-gray-400 mb-2">
            Collaborate with your team and save up to 50%
          </p>
          <p className="text-lg text-[#E68961]">
            Add collaborators for just $1/day • Get progressive discounts
          </p>
        </div>

        {/* Value Proposition */}
        <div className="bg-[#1a1a1a] border border-[#E68961] rounded-lg p-8 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-4xl font-bold text-[#E68961] mb-2">$1/day</div>
              <p className="text-gray-400">per collaborator</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#E68961] mb-2">50%</div>
              <p className="text-gray-400">max discount (5 collaborators)</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#E68961] mb-2">∞</div>
              <p className="text-gray-400">voice conversations</p>
            </div>
          </div>
        </div>

        {/* Pricing Tiers */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Choose Your Team Size</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {pricingTiers.map((tier, index) => (
              <div
                key={tier.collaborators}
                className={`bg-[#1a1a1a] border rounded-lg p-6 relative ${
                  tier.collaborators === 5
                    ? 'border-[#E68961] bg-[#E68961]/5'
                    : 'border-[#2a2a2a]'
                }`}
              >
                {tier.collaborators === 5 && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#E68961] text-black px-3 py-1 rounded-full text-xs font-bold">
                    BEST VALUE
                  </div>
                )}

                <div className="text-center mb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Users className="w-6 h-6 text-[#E68961]" />
                    <span className="text-2xl font-bold">{tier.collaborators}</span>
                  </div>
                  <p className="text-sm text-gray-400">
                    {tier.collaborators === 1 ? 'Collaborator' : 'Collaborators'}
                  </p>
                </div>

                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-[#E68961] mb-1">
                    ${tier.dailyCost.toFixed(2)}
                  </div>
                  <p className="text-xs text-gray-400 mb-2">per day</p>
                  <div className="text-lg font-semibold">
                    ${tier.monthlyCost.toFixed(2)}
                  </div>
                  <p className="text-xs text-gray-400">per month</p>
                </div>

                {tier.discount > 0 && (
                  <div className="flex items-center justify-center gap-1 text-[#E68961] text-sm font-semibold mb-4">
                    <TrendingDown className="w-4 h-4" />
                    <span>{tier.discount}% discount</span>
                  </div>
                )}

                <button className="w-full px-4 py-2 bg-[#E68961] text-black rounded-lg font-semibold hover:bg-[#D4A05F] transition-colors">
                  Subscribe
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-8 mb-12">
          <h3 className="text-2xl font-bold mb-6 text-center">Pricing Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-[#2a2a2a]">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">Collaborators</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-400">Daily</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-400">Monthly</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-400">Per Person/Month</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-400">Discount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a2a]">
                {pricingTiers.map((tier) => (
                  <tr key={tier.collaborators} className="hover:bg-[#2a2a2a]/50">
                    <td className="px-4 py-3 font-semibold">{tier.collaborators}</td>
                    <td className="px-4 py-3 text-right">${tier.dailyCost.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-[#E68961]">
                      ${tier.monthlyCost.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      ${(tier.monthlyCost / tier.collaborators).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {tier.discount > 0 ? (
                        <span className="text-[#E68961] font-semibold">{tier.discount}%</span>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Features List */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-8">
          <h3 className="text-2xl font-bold mb-6 text-center">All Plans Include</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <Check className="w-5 h-5 text-[#E68961] shrink-0" />
                <span className="text-gray-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-12 text-center">
          <h3 className="text-2xl font-bold mb-4">How It Works</h3>
          <div className="max-w-3xl mx-auto space-y-4 text-left">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
              <h4 className="font-semibold text-[#E68961] mb-2">1. Select Your Team Size</h4>
              <p className="text-gray-400">
                Choose how many collaborators you need. Start with 1 and add more anytime.
              </p>
            </div>
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
              <h4 className="font-semibold text-[#E68961] mb-2">2. Get Progressive Discounts</h4>
              <p className="text-gray-400">
                The more collaborators you add, the bigger your discount. Max 50% off at 5 collaborators.
              </p>
            </div>
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
              <h4 className="font-semibold text-[#E68961] mb-2">3. Pay Daily or Monthly</h4>
              <p className="text-gray-400">
                Choose daily billing ($1/day per collaborator) or lock in monthly for convenience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlusOnePricing;
