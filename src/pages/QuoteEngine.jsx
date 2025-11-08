import React, { useState } from 'react';
import { DollarSign, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

function QuoteEngine() {
  const [formData, setFormData] = useState({
    agentType: 'general',
    taskComplexity: 'medium',
    voiceEnabled: false,
    executionsPerMonth: 100,
    averageTokens: 1000,
  });
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);

  const agentTypes = [
    { id: 'data-analysis', label: 'Data Analysis', multiplier: 1.5 },
    { id: 'code-generation', label: 'Code Generation', multiplier: 2.0 },
    { id: 'api-integration', label: 'API Integration', multiplier: 1.3 },
    { id: 'content-creation', label: 'Content Creation', multiplier: 1.2 },
    { id: 'workflow-automation', label: 'Workflow Automation', multiplier: 1.4 },
    { id: 'general', label: 'General Assistant', multiplier: 1.0 },
  ];

  const complexityLevels = [
    { id: 'simple', label: 'Simple', multiplier: 0.5, description: 'Basic tasks, short responses' },
    { id: 'medium', label: 'Medium', multiplier: 1.0, description: 'Standard complexity' },
    { id: 'complex', label: 'Complex', multiplier: 2.0, description: 'Advanced reasoning, long responses' },
  ];

  const generateQuote = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/quotes/estimate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to generate quote');
      }

      const data = await response.json();
      setQuote(data);
    } catch (err) {
      alert(`Quote generation failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const calculateLocalEstimate = () => {
    // Local estimation logic (backup if API fails)
    const agentType = agentTypes.find(t => t.id === formData.agentType);
    const complexity = complexityLevels.find(c => c.id === formData.taskComplexity);
    
    // Base LLM cost: $0.002 per 1K tokens (average)
    const tokensPerExecution = formData.averageTokens * complexity.multiplier;
    const llmCostPerExecution = (tokensPerExecution / 1000) * 0.002;
    const monthlyLLMCost = llmCostPerExecution * formData.executionsPerMonth * agentType.multiplier;

    // Voice cost: ~$0.02 per minute (if enabled)
    const voiceCostPerExecution = formData.voiceEnabled ? 0.02 : 0;
    const monthlyVoiceCost = voiceCostPerExecution * formData.executionsPerMonth;

    // Storage cost: ~$0.10/GB per month
    const storageCost = 0.50; // Fixed estimate

    const totalMonthly = monthlyLLMCost + monthlyVoiceCost + storageCost;
    const confidence = 0.75; // Local estimate confidence

    return {
      llmCost: monthlyLLMCost,
      voiceCost: monthlyVoiceCost,
      storageCost,
      totalMonthly,
      confidence,
      breakdown: {
        costPerExecution: llmCostPerExecution + voiceCostPerExecution,
        executionsPerMonth: formData.executionsPerMonth,
        avgTokensPerExecution: tokensPerExecution,
      },
    };
  };

  const localQuote = calculateLocalEstimate();

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-8 h-8 text-[#E68961]" />
            <h1 className="text-4xl font-bold">Quote Engine</h1>
          </div>
          <p className="text-gray-400">
            Get pre-execution cost estimates for your AI agents
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuration Form */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Configure Agent</h2>

            {/* Agent Type */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-3">Agent Type</label>
              <select
                value={formData.agentType}
                onChange={(e) => setFormData({ ...formData, agentType: e.target.value })}
                className="w-full bg-[#2a2a2a] text-white px-4 py-3 rounded-lg border border-[#3a3a3a] focus:outline-none focus:border-[#E68961]"
              >
                {agentTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.label}</option>
                ))}
              </select>
            </div>

            {/* Task Complexity */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-3">Task Complexity</label>
              <div className="space-y-2">
                {complexityLevels.map(level => (
                  <div
                    key={level.id}
                    onClick={() => setFormData({ ...formData, taskComplexity: level.id })}
                    className={`p-4 rounded-lg cursor-pointer transition-all ${
                      formData.taskComplexity === level.id
                        ? 'bg-[#E68961]/10 border-2 border-[#E68961]'
                        : 'bg-[#2a2a2a] border-2 border-transparent hover:border-[#E68961]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold">{level.label}</span>
                      <span className="text-sm text-gray-400">{level.multiplier}x cost</span>
                    </div>
                    <p className="text-sm text-gray-400">{level.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Voice Enabled */}
            <div className="mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.voiceEnabled}
                  onChange={(e) => setFormData({ ...formData, voiceEnabled: e.target.checked })}
                  className="w-5 h-5 bg-[#2a2a2a] border-2 border-[#3a3a3a] rounded focus:outline-none focus:border-[#E68961] checked:bg-[#E68961]"
                />
                <div>
                  <span className="font-semibold">Enable Voice Features</span>
                  <p className="text-sm text-gray-400">Voice input/output (~$0.02 per minute)</p>
                </div>
              </label>
            </div>

            {/* Executions Per Month */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-3">
                Executions Per Month: <span className="text-[#E68961]">{formData.executionsPerMonth}</span>
              </label>
              <input
                type="range"
                min="10"
                max="10000"
                step="10"
                value={formData.executionsPerMonth}
                onChange={(e) => setFormData({ ...formData, executionsPerMonth: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>10</span>
                <span>10,000</span>
              </div>
            </div>

            {/* Average Tokens */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-3">
                Average Tokens Per Execution: <span className="text-[#E68961]">{formData.averageTokens}</span>
              </label>
              <input
                type="range"
                min="100"
                max="10000"
                step="100"
                value={formData.averageTokens}
                onChange={(e) => setFormData({ ...formData, averageTokens: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>100</span>
                <span>10,000</span>
              </div>
            </div>

            <button
              onClick={generateQuote}
              disabled={loading}
              className="w-full px-6 py-3 bg-[#E68961] text-black rounded-lg font-semibold hover:bg-[#D4A05F] transition-colors disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate Detailed Quote'}
            </button>
          </div>

          {/* Quote Display */}
          <div>
            {/* Local Estimate (Always Visible) */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-8 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Instant Estimate</h2>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <AlertCircle className="w-4 h-4" />
                  <span>{Math.round(localQuote.confidence * 100)}% confidence</span>
                </div>
              </div>

              <div className="text-center mb-8">
                <p className="text-sm text-gray-400 mb-2">Estimated Monthly Cost</p>
                <p className="text-5xl font-bold text-[#E68961]">
                  ${localQuote.totalMonthly.toFixed(2)}
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  ${localQuote.breakdown.costPerExecution.toFixed(4)} per execution
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">LLM Costs:</span>
                  <span className="font-semibold">${localQuote.llmCost.toFixed(2)}</span>
                </div>
                {formData.voiceEnabled && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Voice Costs:</span>
                    <span className="font-semibold">${localQuote.voiceCost.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Storage:</span>
                  <span className="font-semibold">${localQuote.storageCost.toFixed(2)}</span>
                </div>
                <div className="border-t border-[#2a2a2a] pt-3 flex justify-between">
                  <span className="font-semibold">Total Monthly:</span>
                  <span className="font-bold text-[#E68961]">${localQuote.totalMonthly.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-[#2a2a2a] rounded-lg p-4">
                <h3 className="text-sm font-semibold mb-2">Breakdown</h3>
                <div className="space-y-1 text-xs text-gray-400">
                  <div className="flex justify-between">
                    <span>Executions/month:</span>
                    <span>{localQuote.breakdown.executionsPerMonth.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg tokens/execution:</span>
                    <span>{Math.round(localQuote.breakdown.avgTokensPerExecution).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cost/execution:</span>
                    <span>${localQuote.breakdown.costPerExecution.toFixed(4)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* API Quote (When Available) */}
            {quote && (
              <div className="bg-[#1a1a1a] border border-[#E68961] rounded-lg p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Detailed Quote</h2>
                  <div className="flex items-center gap-2 text-sm text-[#E68961]">
                    <CheckCircle className="w-4 h-4" />
                    <span>{Math.round(quote.confidence * 100)}% confidence</span>
                  </div>
                </div>

                <div className="text-center mb-8">
                  <p className="text-sm text-gray-400 mb-2">API-Generated Estimate</p>
                  <p className="text-5xl font-bold text-[#E68961]">
                    ${quote.totalMonthly.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    Range: ${quote.minMonthly?.toFixed(2)} - ${quote.maxMonthly?.toFixed(2)}
                  </p>
                </div>

                {quote.assumptions && (
                  <div className="bg-[#2a2a2a] rounded-lg p-4 mb-6">
                    <h3 className="text-sm font-semibold mb-2">Assumptions</h3>
                    <p className="text-xs text-gray-400">{quote.assumptions}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => {/* Navigate to agent builder */}}
                    className="flex-1 px-6 py-3 bg-[#E68961] text-black rounded-lg font-semibold hover:bg-[#D4A05F] transition-colors"
                  >
                    Create Agent
                  </button>
                  <button
                    onClick={() => setQuote(null)}
                    className="px-6 py-3 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg transition-colors"
                  >
                    New Quote
                  </button>
                </div>
              </div>
            )}

            {/* Cost Savings Tip */}
            <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-6 mt-6">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="w-6 h-6 text-[#E68961]" />
                <h3 className="font-semibold">Cost Optimization Tips</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Use GROQ models for 90% cost reduction (Free tier)</li>
                <li>• Batch executions to reduce per-execution overhead</li>
                <li>• Disable voice features when text-only is sufficient</li>
                <li>• Use simple complexity for routine tasks</li>
                <li>• Enable caching for repeated queries</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuoteEngine;
