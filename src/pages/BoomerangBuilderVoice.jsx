import React, { useState, useEffect } from 'react';
import { Mic, Type, User, Zap, FileCode, DollarSign } from 'lucide-react';
import VoiceRecorder from '../components/VoiceRecorder';
import { routeCommand } from '../services/voiceRouter';
import { translateToBoomerAng } from '../services/boomerAngNaming';

function BoomerangBuilderVoice() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    voiceDescription: '',
    agentType: '',
    agentName: '',
    boomerAngName: '',
    triggers: [],
    quote: null,
  });
  const [processing, setProcessing] = useState(false);
  const [suggestedType, setSuggestedType] = useState(null);

  // Step 1: Voice Description
  const handleVoiceTranscript = async (transcript, cost) => {
    setFormData({ ...formData, voiceDescription: transcript });
    
    // Automatically detect agent type from voice
    setProcessing(true);
    try {
      const routingResult = await routeCommand(transcript);
      if (routingResult.intent === 'create_boomerang') {
        const suggestedType = routingResult.parameters?.agentType || 'general';
        setSuggestedType(suggestedType);
        setFormData({ ...formData, voiceDescription: transcript, agentType: suggestedType });
      }
    } catch (err) {
      console.error('Failed to detect agent type:', err);
    } finally {
      setProcessing(false);
    }
  };

  // Step 2: Confirm Type
  const agentTypes = [
    { id: 'data-analysis', name: 'Data Analysis', icon: '📊', description: 'Process and analyze data' },
    { id: 'code-generation', name: 'Code Generation', icon: '💻', description: 'Generate code from specs' },
    { id: 'api-integration', name: 'API Integration', icon: '🔌', description: 'Connect external APIs' },
    { id: 'content-creation', name: 'Content Creation', icon: '✍️', description: 'Generate content' },
    { id: 'workflow-automation', name: 'Workflow Automation', icon: '⚙️', description: 'Automate tasks' },
    { id: 'general', name: 'General Assistant', icon: '🤖', description: 'Multi-purpose agent' },
  ];

  // Step 3: Naming Ceremony (House of Ang)
  const generateBoomerAngName = async () => {
    const angName = await translateToBoomerAng(formData.agentName);
    setFormData({ ...formData, boomerAngName: angName });
  };

  useEffect(() => {
    if (step === 3 && formData.agentName && !formData.boomerAngName) {
      generateBoomerAngName();
    }
  }, [step, formData.agentName]);

  // Step 4: Triggers
  const triggerOptions = [
    { id: 'voice', name: 'Voice Command', icon: <Mic className="w-5 h-5" />, description: 'Activate via voice' },
    { id: 'webhook', name: 'Webhook', icon: <Zap className="w-5 h-5" />, description: 'HTTP endpoint trigger' },
    { id: 'cron', name: 'Schedule', icon: '⏰', description: 'Run on schedule' },
    { id: 'file', name: 'File Upload', icon: <FileCode className="w-5 h-5" />, description: 'Trigger on file upload' },
  ];

  const toggleTrigger = (triggerId) => {
    const triggers = formData.triggers.includes(triggerId)
      ? formData.triggers.filter(t => t !== triggerId)
      : [...formData.triggers, triggerId];
    setFormData({ ...formData, triggers });
  };

  // Step 5: Quote
  const generateQuote = async () => {
    setProcessing(true);
    try {
      const response = await fetch('/api/quotes/estimate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          agentType: formData.agentType,
          voiceEnabled: formData.triggers.includes('voice'),
          complexity: 'medium',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate quote');
      }

      const quote = await response.json();
      setFormData({ ...formData, quote });
    } catch (err) {
      alert(`Quote generation failed: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    if (step === 5 && !formData.quote) {
      generateQuote();
    }
  }, [step]);

  // Step 6: Deploy
  const deployAgent = async () => {
    setProcessing(true);
    try {
      const response = await fetch('/api/agents/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          name: formData.agentName,
          boomerAngName: formData.boomerAngName,
          type: formData.agentType,
          description: formData.voiceDescription,
          triggers: formData.triggers,
          quote: formData.quote,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to deploy agent');
      }

      const agent = await response.json();
      alert(`Agent "${formData.boomerAngName}" deployed successfully!`);
      window.location.href = '/agents';
    } catch (err) {
      alert(`Deployment failed: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4, 5, 6].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    s <= step ? 'bg-[#E68961] text-black' : 'bg-[#2a2a2a] text-gray-500'
                  }`}
                >
                  {s}
                </div>
                {s < 6 && (
                  <div className={`h-1 w-12 md:w-20 ${s < step ? 'bg-[#E68961]' : 'bg-[#2a2a2a]'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>Voice</span>
            <span>Type</span>
            <span>Name</span>
            <span>Triggers</span>
            <span>Quote</span>
            <span>Deploy</span>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-8">
          {/* Step 1: Voice Description */}
          {step === 1 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Mic className="w-8 h-8 text-[#E68961]" />
                <div>
                  <h2 className="text-3xl font-bold">Describe Your Agent</h2>
                  <p className="text-gray-400">Tell us what you want your agent to do (voice or text)</p>
                </div>
              </div>

              <div className="mb-6">
                <VoiceRecorder onTranscript={handleVoiceTranscript} />
              </div>

              <div className="text-center text-gray-400 mb-4">OR</div>

              <textarea
                value={formData.voiceDescription}
                onChange={(e) => setFormData({ ...formData, voiceDescription: e.target.value })}
                placeholder="Type your description here... e.g., 'Create an agent that analyzes sales data and generates reports'"
                className="w-full h-32 bg-[#2a2a2a] text-white p-4 rounded-lg border border-[#3a3a3a] focus:outline-none focus:border-[#E68961]"
              />

              {formData.voiceDescription && (
                <button
                  onClick={() => setStep(2)}
                  disabled={processing}
                  className="mt-6 w-full px-6 py-3 bg-[#E68961] text-black rounded-lg font-semibold hover:bg-[#D4A05F] transition-colors disabled:opacity-50"
                >
                  {processing ? 'Analyzing...' : 'Continue'}
                </button>
              )}
            </div>
          )}

          {/* Step 2: Agent Type */}
          {step === 2 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Type className="w-8 h-8 text-[#E68961]" />
                <div>
                  <h2 className="text-3xl font-bold">Choose Agent Type</h2>
                  <p className="text-gray-400">
                    {suggestedType ? 'We detected your agent type' : 'Select the type of agent'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {agentTypes.map((type) => (
                  <div
                    key={type.id}
                    onClick={() => setFormData({ ...formData, agentType: type.id })}
                    className={`p-6 rounded-lg cursor-pointer transition-all ${
                      formData.agentType === type.id
                        ? 'bg-[#E68961]/10 border-2 border-[#E68961]'
                        : 'bg-[#2a2a2a] border-2 border-transparent hover:border-[#E68961]/50'
                    }`}
                  >
                    <div className="text-4xl mb-3">{type.icon}</div>
                    <h3 className="text-xl font-bold mb-2">{type.name}</h3>
                    <p className="text-sm text-gray-400">{type.description}</p>
                    {suggestedType === type.id && (
                      <div className="mt-3 text-xs text-[#E68961] font-semibold">✨ AI Suggested</div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 px-6 py-3 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!formData.agentType}
                  className="flex-1 px-6 py-3 bg-[#E68961] text-black rounded-lg font-semibold hover:bg-[#D4A05F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Naming Ceremony */}
          {step === 3 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <User className="w-8 h-8 text-[#E68961]" />
                <div>
                  <h2 className="text-3xl font-bold">Naming Ceremony</h2>
                  <p className="text-gray-400">Give your agent a name (House of Ang translation included)</p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">Agent Name</label>
                <input
                  type="text"
                  value={formData.agentName}
                  onChange={(e) => setFormData({ ...formData, agentName: e.target.value })}
                  placeholder="e.g., Sales Report Generator"
                  className="w-full bg-[#2a2a2a] text-white px-4 py-3 rounded-lg border border-[#3a3a3a] focus:outline-none focus:border-[#E68961]"
                />
              </div>

              {formData.boomerAngName && (
                <div className="bg-[#E68961]/10 border border-[#E68961] rounded-lg p-6 mb-6">
                  <p className="text-sm text-gray-400 mb-2">House of Ang Translation:</p>
                  <p className="text-2xl font-bold text-[#E68961]">{formData.boomerAngName}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 px-6 py-3 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  disabled={!formData.agentName}
                  className="flex-1 px-6 py-3 bg-[#E68961] text-black rounded-lg font-semibold hover:bg-[#D4A05F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Triggers */}
          {step === 4 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Zap className="w-8 h-8 text-[#E68961]" />
                <div>
                  <h2 className="text-3xl font-bold">Activation Triggers</h2>
                  <p className="text-gray-400">How should your agent be triggered? (Select all that apply)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {triggerOptions.map((trigger) => (
                  <div
                    key={trigger.id}
                    onClick={() => toggleTrigger(trigger.id)}
                    className={`p-6 rounded-lg cursor-pointer transition-all ${
                      formData.triggers.includes(trigger.id)
                        ? 'bg-[#E68961]/10 border-2 border-[#E68961]'
                        : 'bg-[#2a2a2a] border-2 border-transparent hover:border-[#E68961]/50'
                    }`}
                  >
                    <div className="text-[#E68961] mb-3">{trigger.icon}</div>
                    <h3 className="text-xl font-bold mb-2">{trigger.name}</h3>
                    <p className="text-sm text-gray-400">{trigger.description}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 px-6 py-3 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(5)}
                  disabled={formData.triggers.length === 0}
                  className="flex-1 px-6 py-3 bg-[#E68961] text-black rounded-lg font-semibold hover:bg-[#D4A05F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Quote */}
          {step === 5 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <DollarSign className="w-8 h-8 text-[#E68961]" />
                <div>
                  <h2 className="text-3xl font-bold">Cost Estimate</h2>
                  <p className="text-gray-400">Pre-execution quote for your agent</p>
                </div>
              </div>

              {processing || !formData.quote ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E68961] mx-auto mb-4"></div>
                  <p className="text-gray-400">Calculating costs...</p>
                </div>
              ) : (
                <div>
                  <div className="bg-[#E68961]/10 border border-[#E68961] rounded-lg p-8 mb-6">
                    <div className="text-center mb-6">
                      <p className="text-sm text-gray-400 mb-2">Estimated Monthly Cost</p>
                      <p className="text-5xl font-bold text-[#E68961]">
                        ${formData.quote.totalMonthly.toFixed(2)}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">LLM Costs:</span>
                        <span className="font-semibold">${formData.quote.llmCost.toFixed(2)}</span>
                      </div>
                      {formData.triggers.includes('voice') && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Voice Costs:</span>
                          <span className="font-semibold">${formData.quote.voiceCost.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-400">Storage:</span>
                        <span className="font-semibold">${formData.quote.storageCost.toFixed(2)}</span>
                      </div>
                      <div className="border-t border-[#2a2a2a] pt-3 flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span className="text-[#E68961]">${formData.quote.totalMonthly.toFixed(2)}/mo</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-400 text-center mb-6">
                    * Estimate based on {formData.quote.assumptions || 'typical usage patterns'}
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(4)}
                      className="flex-1 px-6 py-3 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setStep(6)}
                      className="flex-1 px-6 py-3 bg-[#E68961] text-black rounded-lg font-semibold hover:bg-[#D4A05F] transition-colors"
                    >
                      Accept & Deploy
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 6: Deploy */}
          {step === 6 && (
            <div className="text-center">
              <div className="mb-8">
                <div className="text-6xl mb-4">🚀</div>
                <h2 className="text-3xl font-bold mb-2">Ready to Deploy!</h2>
                <p className="text-gray-400">
                  Your agent "<span className="text-[#E68961] font-semibold">{formData.boomerAngName}</span>" is ready to launch
                </p>
              </div>

              <div className="bg-[#2a2a2a] rounded-lg p-6 mb-8 text-left">
                <h3 className="font-bold mb-4">Agent Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Name:</span>
                    <span>{formData.agentName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Boomer Ang:</span>
                    <span className="text-[#E68961]">{formData.boomerAngName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Type:</span>
                    <span className="capitalize">{formData.agentType.replace('-', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Triggers:</span>
                    <span>{formData.triggers.join(', ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Est. Monthly Cost:</span>
                    <span className="text-[#E68961]">${formData.quote?.totalMonthly.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={deployAgent}
                disabled={processing}
                className="w-full px-8 py-4 bg-[#E68961] text-black rounded-lg font-bold text-lg hover:bg-[#D4A05F] transition-colors disabled:opacity-50"
              >
                {processing ? 'Deploying...' : '🚀 Deploy Agent'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BoomerangBuilderVoice;
