import React, { useState } from 'react';
import { voiceRouter } from '../services/voiceRouter';

/**
 * VoiceCommandOverlay Component
 * Shows detected intent from voice commands with confidence score
 */
export default function VoiceCommandOverlay({ transcript, onConfirm, onCancel }) {
  const [routing, setRouting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    if (transcript) {
      routeCommand();
    }
  }, [transcript]);

  const routeCommand = async () => {
    try {
      setRouting(true);
      setError(null);
      
      const routingResult = await voiceRouter.routeCommand(transcript);
      setResult(routingResult);
      
      // Auto-confirm if confidence is high
      if (!routingResult.needsConfirmation) {
        setTimeout(() => {
          onConfirm(routingResult);
        }, 1000);
      }
    } catch (err) {
      console.error('Routing error:', err);
      setError(err.message);
    } finally {
      setRouting(false);
    }
  };

  const getIntentDisplay = (intent) => {
    const intentMap = {
      create_agent: { label: 'Create Agent', icon: '🤖', color: 'text-green-400' },
      execute_task: { label: 'Execute Task', icon: '⚡', color: 'text-blue-400' },
      modify_agent: { label: 'Modify Agent', icon: '✏️', color: 'text-yellow-400' },
      delete_agent: { label: 'Delete Agent', icon: '🗑️', color: 'text-red-400' },
      get_info: { label: 'Get Info', icon: 'ℹ️', color: 'text-purple-400' },
      help: { label: 'Help', icon: '❓', color: 'text-gray-400' },
      other: { label: 'Other', icon: '💬', color: 'text-gray-500' }
    };
    
    return intentMap[intent] || intentMap.other;
  };

  if (routing) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-gray-900 border-2 border-[#E68961] rounded-xl p-8 max-w-md">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-[#E68961]/20 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-[#E68961] animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Understanding Command...</h3>
            <p className="text-gray-400 text-sm text-center">"{transcript}"</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-gray-900 border-2 border-red-500 rounded-xl p-8 max-w-md">
          <div className="text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-white mb-2">Command Error</h3>
            <p className="text-red-400 text-sm mb-6">{error}</p>
            <button
              onClick={onCancel}
              className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (result) {
    const intentDisplay = getIntentDisplay(result.intent);
    const confidence = Math.round(result.confidence * 100);
    
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-gray-900 border-2 border-[#E68961] rounded-xl p-8 max-w-md">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">{intentDisplay.icon}</div>
            <h3 className="text-2xl font-bold text-white mb-2">{intentDisplay.label}</h3>
            <p className="text-gray-400 text-sm mb-4">"{transcript}"</p>
            
            {/* Confidence Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Confidence</span>
                <span className={confidence >= 70 ? 'text-[#E68961]' : 'text-yellow-400'}>{confidence}%</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    confidence >= 70 ? 'bg-[#E68961]' : 'bg-yellow-400'
                  }`}
                  style={{ width: `${confidence}%` }}
                />
              </div>
            </div>

            {/* Parameters */}
            {result.params && Object.keys(result.params).length > 0 && (
              <div className="bg-gray-800 rounded-lg p-3 mb-4 text-left">
                <div className="text-xs text-gray-500 mb-2">Detected Parameters:</div>
                {Object.entries(result.params).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">{key}:</span>
                    <span className="text-white font-mono">{value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Low Confidence Warning */}
            {result.needsConfirmation && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
                <p className="text-yellow-400 text-xs">
                  ⚠️ Low confidence. Please confirm this is what you meant.
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(result)}
              className="flex-1 px-4 py-3 bg-[#E68961] hover:bg-[#D4A05F] text-black font-bold rounded-lg transition-colors"
            >
              {result.needsConfirmation ? 'Confirm' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
