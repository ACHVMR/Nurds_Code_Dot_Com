import { CheckCircle, Shield, AlertTriangle, XCircle } from 'lucide-react';

export default function TrustBadge({ verified, trustScore, tier, size = 'md', showScore = true, onClick }) {
  const sizes = {
    sm: {
      icon: 'w-3 h-3',
      text: 'text-xs',
      score: 'text-[10px]',
      padding: 'px-2 py-1',
      gap: 'gap-1'
    },
    md: {
      icon: 'w-4 h-4',
      text: 'text-sm',
      score: 'text-xs',
      padding: 'px-3 py-1.5',
      gap: 'gap-2'
    },
    lg: {
      icon: 'w-5 h-5',
      text: 'text-base',
      score: 'text-sm',
      padding: 'px-4 py-2',
      gap: 'gap-2'
    }
  };

  const badges = {
    verified_trusted: {
      icon: <CheckCircle className={sizes[size].icon} />,
      label: 'Verified Trusted',
      color: 'text-[#E68961]',
      bgColor: 'bg-[#E68961]/10',
      borderColor: 'border-[#E68961]',
      glow: 'shadow-[0_0_15px_rgba(230,137,97,0.3)]'
    },
    standard_verified: {
      icon: <Shield className={sizes[size].icon} />,
      label: 'Verified',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10',
      borderColor: 'border-yellow-400',
      glow: 'shadow-[0_0_10px_rgba(250,204,21,0.2)]'
    },
    unverified: {
      icon: <AlertTriangle className={sizes[size].icon} />,
      label: 'Unverified',
      color: 'text-gray-400',
      bgColor: 'bg-gray-400/10',
      borderColor: 'border-gray-400',
      glow: ''
    },
    restricted: {
      icon: <XCircle className={sizes[size].icon} />,
      label: 'Restricted',
      color: 'text-red-400',
      bgColor: 'bg-red-400/10',
      borderColor: 'border-red-400',
      glow: ''
    }
  };

  // Default to unverified if no tier provided
  const badgeConfig = badges[tier] || badges.unverified;

  // Override if not verified
  if (!verified) {
    badgeConfig.icon = badges.unverified.icon;
    badgeConfig.label = 'Unverified';
    badgeConfig.color = badges.unverified.color;
  }

  return (
    <div
      onClick={onClick}
      className={`
        inline-flex items-center ${sizes[size].gap} ${sizes[size].padding}
        rounded-lg border
        ${badgeConfig.bgColor} ${badgeConfig.borderColor} ${badgeConfig.glow}
        ${onClick ? 'cursor-pointer hover:scale-105' : ''}
        transition-all duration-200
      `}
    >
      <span className={badgeConfig.color}>
        {badgeConfig.icon}
      </span>
      <div className="flex flex-col">
        <span className={`${sizes[size].text} font-medium ${badgeConfig.color}`}>
          {badgeConfig.label}
        </span>
        {showScore && trustScore !== undefined && (
          <span className={`${sizes[size].score} text-gray-400`}>
            Trust: {trustScore}/100
          </span>
        )}
      </div>
    </div>
  );
}

// Helper function to get trust tier from score
export function getTrustTier(trustScore) {
  if (trustScore >= 80) return 'verified_trusted';
  if (trustScore >= 50) return 'standard_verified';
  if (trustScore >= 0) return 'unverified';
  return 'restricted';
}

// Helper function to calculate trust score
export function calculateTrustScore(verified, riskScore = 50) {
  const baseScore = verified ? 60 : 0;
  const riskAdjustment = Math.max(0, 40 - riskScore / 2);
  return Math.round(baseScore + riskAdjustment);
}
