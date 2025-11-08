import React from 'react';
import { Lock, Zap, Users, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function FreeTierGate({ userTier, featureType, projectCount, children }) {
  const navigate = useNavigate();

  const tierLimits = {
    free: {
      models: ['groq-llama'],
      maxProjects: 2,
      collaboration: false,
      voiceEnabled: false,
      priorityModels: false,
    },
    lite: {
      models: ['groq-llama', 'gpt-3.5-turbo'],
      maxProjects: 5,
      collaboration: false,
      voiceEnabled: true,
      priorityModels: false,
    },
    plus: {
      models: 'all',
      maxProjects: Infinity,
      collaboration: true,
      voiceEnabled: true,
      priorityModels: true,
    },
  };

  const currentTier = tierLimits[userTier] || tierLimits.free;

  // Check if user has access to the feature
  const hasAccess = () => {
    switch (featureType) {
      case 'model':
        return currentTier.models === 'all' || currentTier.models.includes(featureType);
      case 'project':
        return projectCount < currentTier.maxProjects;
      case 'collaboration':
        return currentTier.collaboration;
      case 'voice':
        return currentTier.voiceEnabled;
      case 'priority-models':
        return currentTier.priorityModels;
      default:
        return true;
    }
  };

  if (hasAccess()) {
    return <>{children}</>;
  }

  const getGateMessage = () => {
    switch (featureType) {
      case 'model':
        return {
          title: 'Premium Model Access Required',
          description: 'This model is available on Lite or Plus tiers',
          icon: <Zap className="w-12 h-12 text-[#E68961]" />,
        };
      case 'project':
        return {
          title: 'Project Limit Reached',
          description: `Free tier allows ${currentTier.maxProjects} projects. Upgrade for unlimited projects.`,
          icon: <Lock className="w-12 h-12 text-[#E68961]" />,
        };
      case 'collaboration':
        return {
          title: 'Collaboration Requires Plus One',
          description: 'Add team members with Plus One subscription',
          icon: <Users className="w-12 h-12 text-[#E68961]" />,
        };
      case 'voice':
        return {
          title: 'Voice Features Require Upgrade',
          description: 'Voice input and output available on Lite or Plus tiers',
          icon: <Crown className="w-12 h-12 text-[#E68961]" />,
        };
      case 'priority-models':
        return {
          title: 'Priority Model Access',
          description: 'Access to GPT-4, Claude Opus, and other premium models requires Plus tier',
          icon: <Zap className="w-12 h-12 text-[#E68961]" />,
        };
      default:
        return {
          title: 'Upgrade Required',
          description: 'This feature requires a higher tier',
          icon: <Lock className="w-12 h-12 text-[#E68961]" />,
        };
    }
  };

  const message = getGateMessage();

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-12 text-center">
          <div className="mb-6">{message.icon}</div>
          <h2 className="text-3xl font-bold mb-4">{message.title}</h2>
          <p className="text-xl text-gray-400 mb-8">{message.description}</p>

          {/* Tier Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className={`bg-[#2a2a2a] rounded-lg p-4 ${userTier === 'free' ? 'border-2 border-[#E68961]' : ''}`}>
              <h3 className="font-bold mb-2">Free Tier</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>✓ GROQ models only</li>
                <li>✓ 2 projects max</li>
                <li>✗ No collaboration</li>
                <li>✗ No voice features</li>
              </ul>
              {userTier === 'free' && (
                <div className="mt-3 text-xs text-[#E68961] font-semibold">Current Tier</div>
              )}
            </div>

            <div className={`bg-[#2a2a2a] rounded-lg p-4 ${userTier === 'lite' ? 'border-2 border-[#E68961]' : ''}`}>
              <h3 className="font-bold mb-2">Lite Tier</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>✓ Basic models</li>
                <li>✓ 5 projects</li>
                <li>✓ Voice features</li>
                <li>✗ No collaboration</li>
              </ul>
              {userTier === 'lite' && (
                <div className="mt-3 text-xs text-[#E68961] font-semibold">Current Tier</div>
              )}
            </div>

            <div className={`bg-[#2a2a2a] rounded-lg p-4 ${userTier === 'plus' ? 'border-2 border-[#E68961]' : ''}`}>
              <h3 className="font-bold mb-2">Plus Tier</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>✓ All premium models</li>
                <li>✓ Unlimited projects</li>
                <li>✓ Voice features</li>
                <li>✓ Team collaboration</li>
              </ul>
              {userTier === 'plus' && (
                <div className="mt-3 text-xs text-[#E68961] font-semibold">Current Tier</div>
              )}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/pricing')}
              className="px-8 py-4 bg-[#E68961] text-black rounded-lg font-semibold hover:bg-[#D4A05F] transition-colors"
            >
              View Pricing
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-8 py-4 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>

        {/* Feature Comparison Table */}
        <div className="mt-8 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-center">What You Get With Each Tier</h3>
          <table className="w-full text-sm">
            <thead className="border-b border-[#2a2a2a]">
              <tr>
                <th className="py-2 text-left">Feature</th>
                <th className="py-2 text-center">Free</th>
                <th className="py-2 text-center">Lite</th>
                <th className="py-2 text-center">Plus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a]">
              <tr>
                <td className="py-2">Projects</td>
                <td className="py-2 text-center text-gray-400">2</td>
                <td className="py-2 text-center text-gray-400">5</td>
                <td className="py-2 text-center text-[#E68961]">Unlimited</td>
              </tr>
              <tr>
                <td className="py-2">Models</td>
                <td className="py-2 text-center text-gray-400">GROQ Only</td>
                <td className="py-2 text-center text-gray-400">Basic</td>
                <td className="py-2 text-center text-[#E68961]">All Premium</td>
              </tr>
              <tr>
                <td className="py-2">Voice Features</td>
                <td className="py-2 text-center text-red-500">✗</td>
                <td className="py-2 text-center text-[#E68961]">✓</td>
                <td className="py-2 text-center text-[#E68961]">✓</td>
              </tr>
              <tr>
                <td className="py-2">Collaboration</td>
                <td className="py-2 text-center text-red-500">✗</td>
                <td className="py-2 text-center text-red-500">✗</td>
                <td className="py-2 text-center text-[#E68961]">✓</td>
              </tr>
              <tr>
                <td className="py-2">Priority Support</td>
                <td className="py-2 text-center text-red-500">✗</td>
                <td className="py-2 text-center text-gray-400">Email</td>
                <td className="py-2 text-center text-[#E68961]">24/7</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default FreeTierGate;
