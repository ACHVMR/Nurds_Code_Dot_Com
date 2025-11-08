import { useState } from 'react';
import { Play, Pause, Edit, Copy, Star, Download, ShoppingCart, Share2, Settings, Trash2 } from 'lucide-react';

/**
 * BOOMER_ANG CARD COMPONENT
 * Standard card for displaying AI Agents (Boomer_Angs)
 * Supports: Custom images, editing, marketplace, sandbox, rent/resell
 */

export function BoomerAngCard({ 
  boomerAng, 
  mode = 'view', // view, edit, marketplace, sandbox
  onEdit,
  onClone,
  onDelete,
  onDeploy,
  onRent,
  onBuy,
  onAddToSandbox,
  className = '' 
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isRunning, setIsRunning] = useState(boomerAng.status === 'running');

  const {
    id,
    name,
    description,
    image, // Custom user-uploaded image
    category,
    effectivenessLevel, // Basic, Advanced, Premium, Enterprise
    tokensPerRun,
    successRate,
    totalRuns,
    creator, // User who created it
    isPublic, // Available in marketplace
    isPremade, // Official Nurds Code creation
    price, // For marketplace (null if free)
    rentPrice, // Monthly rental price
    rating,
    ratingCount,
    tags,
    features,
    lastUpdated,
    isOwned, // User owns this Boomer_Ang
    isRented, // User is renting this
    isFavorite,
  } = boomerAng;

  const handleToggleRun = () => {
    setIsRunning(!isRunning);
    if (onDeploy) onDeploy(id, !isRunning);
  };

  const effectivenessColors = {
    Basic: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
    Advanced: { bg: 'bg-[#E68961]/10', text: 'text-[#E68961]', border: 'border-[#E68961]/30' },
    Premium: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
    Enterprise: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  };

  const colors = effectivenessColors[effectivenessLevel] || effectivenessColors.Basic;

  return (
    <div
      className={`boomer-ang-card relative bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-xl border-2 transition-all duration-300 overflow-hidden ${
        isHovered ? 'border-[#E68961] shadow-[0_0_30px_rgba(230,137,97,0.3)]' : 'border-gray-700'
      } ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header Image */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-[#0F0F0F] to-[#1a1a1a]">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-6xl opacity-50">🤖</div>
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {isPremade && (
            <span className="px-3 py-1 bg-[#E68961] text-black text-xs font-bold rounded-full">
              Official
            </span>
          )}
          {isPublic && !isPremade && (
            <span className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">
              Community
            </span>
          )}
          {isRented && (
            <span className="px-3 py-1 bg-purple-500 text-white text-xs font-bold rounded-full">
              Rented
            </span>
          )}
        </div>

        {/* Running Status */}
        {isRunning && (
          <div className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            Running
          </div>
        )}

        {/* Favorite Star */}
        {isFavorite && (
          <div className="absolute bottom-3 right-3">
            <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title & Category */}
        <div className="mb-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-xl font-bold text-white">{name}</h3>
            <span className={`px-2 py-1 text-xs font-semibold rounded ${colors.bg} ${colors.text} ${colors.border} border`}>
              {effectivenessLevel}
            </span>
          </div>
          <p className="text-sm text-gray-400 mb-2">{category}</p>
          <p className="text-sm text-gray-300 line-clamp-2">{description}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-[#0F0F0F] rounded-lg">
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">Success Rate</div>
            <div className="text-lg font-bold text-[#E68961]">{successRate}%</div>
          </div>
          <div className="text-center border-x border-gray-700">
            <div className="text-xs text-gray-400 mb-1">Total Runs</div>
            <div className="text-lg font-bold text-white">{totalRuns?.toLocaleString() || 0}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">Tokens/Run</div>
            <div className="text-lg font-bold text-blue-400">{tokensPerRun?.toLocaleString() || 0}</div>
          </div>
        </div>

        {/* Features/Tags */}
        {features && features.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {features.slice(0, 3).map((feature, idx) => (
                <span key={idx} className="px-2 py-1 bg-[#2a2a2a] text-gray-300 text-xs rounded">
                  {feature}
                </span>
              ))}
              {features.length > 3 && (
                <span className="px-2 py-1 bg-[#2a2a2a] text-gray-400 text-xs rounded">
                  +{features.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Marketplace Info */}
        {mode === 'marketplace' && (
          <div className="mb-4 p-3 bg-[#0F0F0F] rounded-lg border border-[#E68961]/20">
            <div className="flex items-center justify-between mb-2">
              <div>
                {price ? (
                  <div className="text-2xl font-bold text-[#E68961]">${price}</div>
                ) : (
                  <div className="text-xl font-bold text-green-400">FREE</div>
                )}
                {rentPrice && (
                  <div className="text-sm text-gray-400">${rentPrice}/month to rent</div>
                )}
              </div>
              {rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm font-semibold text-white">{rating}</span>
                  <span className="text-xs text-gray-400">({ratingCount})</span>
                </div>
              )}
            </div>
            {creator && (
              <div className="text-xs text-gray-400">
                by <span className="text-[#E68961]">{creator.name || `User_${creator.id}`}</span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {mode === 'view' && isOwned && (
            <>
              <button
                onClick={handleToggleRun}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                  isRunning
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-[#E68961] hover:bg-[#D4A05F] text-black'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4" />
                    Stop
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Run
                  </>
                )}
              </button>
              <button
                onClick={() => onEdit?.(boomerAng)}
                className="px-4 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-gray-300 rounded-lg transition-all"
                title="Edit"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => onClone?.(boomerAng)}
                className="px-4 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-gray-300 rounded-lg transition-all"
                title="Clone"
              >
                <Copy className="w-4 h-4" />
              </button>
            </>
          )}

          {mode === 'marketplace' && !isOwned && (
            <>
              {price > 0 ? (
                <button
                  onClick={() => onBuy?.(boomerAng)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#E68961] hover:bg-[#D4A05F] text-black font-semibold rounded-lg transition-all"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Buy ${price}
                </button>
              ) : (
                <button
                  onClick={() => onAddToSandbox?.(boomerAng)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-all"
                >
                  <Download className="w-4 h-4" />
                  Add Free
                </button>
              )}
              {rentPrice && (
                <button
                  onClick={() => onRent?.(boomerAng)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition-all"
                >
                  Rent ${rentPrice}/mo
                </button>
              )}
            </>
          )}

          {mode === 'sandbox' && (
            <>
              <button
                onClick={handleToggleRun}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                  isRunning
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-[#E68961] hover:bg-[#D4A05F] text-black'
                }`}
              >
                {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isRunning ? 'Stop' : 'Test'}
              </button>
              <button
                onClick={() => onClone?.(boomerAng)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all"
                title="Clone to My Workspace"
              >
                <Copy className="w-4 h-4" />
              </button>
            </>
          )}

          {mode === 'edit' && (
            <>
              <button
                onClick={() => onDelete?.(boomerAng)}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onEdit?.(boomerAng)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#E68961] hover:bg-[#D4A05F] text-black font-semibold rounded-lg transition-all"
              >
                <Settings className="w-4 h-4" />
                Configure
              </button>
            </>
          )}
        </div>
      </div>

      {/* Hover Overlay - Quick Actions */}
      {isHovered && mode === 'view' && (
        <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/80 to-transparent flex justify-end gap-2 transition-opacity duration-300">
          <button
            onClick={() => onEdit?.(boomerAng)}
            className="p-2 bg-[#E68961] hover:bg-[#D4A05F] text-black rounded-lg transition-all"
            title="Quick Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button className="p-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-gray-300 rounded-lg transition-all" title="Share">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default BoomerAngCard;
