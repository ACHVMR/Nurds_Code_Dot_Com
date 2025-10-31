import React, { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { Users, Plus, Send, Zap, TrendingUp } from 'lucide-react';

/**
 * Plus 1 Team Plan Manager Component
 * Handles team collaboration setup with DIFU ledger integration
 * Rideshare-style pricing: Base plan + $1 per collaborator per day
 */
function Plus1TeamManager() {
  const { getToken } = useAuth();
  const { user } = useUser();
  
  // UI State
  const [activeTab, setActiveTab] = useState('subscription'); // 'subscription', 'collaborators', 'difu'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Subscription State
  const [subscription, setSubscription] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('coffee');
  const [paymentModel, setPaymentModel] = useState('daily');
  const [days, setDays] = useState(1);
  
  // Collaborators State
  const [collaboratorEmail, setCollaboratorEmail] = useState('');
  const [collaborators, setCollaborators] = useState([]);
  
  // DIFU Ledger State
  const [difuBalance, setDifuBalance] = useState(0);
  const [difuAccount, setDifuAccount] = useState(null);
  const [transferAmount, setTransferAmount] = useState('');
  const [transferTo, setTransferTo] = useState('');
  
  const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  
  // Plan pricing
  const PLANS = {
    coffee: { name: 'Coffee', basePrice: 7, color: '#8B7355' },
    lite: { name: 'Lite', basePrice: 20, color: '#E0E0E0' },
    superior: { name: 'Superior', basePrice: 50, color: '#FFD700' }
  };
  
  // Load subscription and balance on mount
  useEffect(() => {
    if (user?.id) {
      loadSubscription();
      loadDifuBalance();
    }
  }, [user?.id]);
  
  // Load subscription
  const loadSubscription = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${apiBase}/api/plus1/subscription?clerkId=${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setSubscription(data.subscription);
      
      if (data.subscription) {
        await loadCollaborators(data.subscription.id);
      }
    } catch (err) {
      console.error('Failed to load subscription:', err);
    }
  };
  
  // Load collaborators
  const loadCollaborators = async (subId) => {
    try {
      const token = await getToken();
      const res = await fetch(`${apiBase}/api/plus1/collaborators?subscriptionId=${subId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setCollaborators(data.collaborators || []);
    } catch (err) {
      console.error('Failed to load collaborators:', err);
    }
  };
  
  // Load DIFU balance
  const loadDifuBalance = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${apiBase}/api/plus1/difu/balance?clerkId=${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setDifuBalance(data.balance);
      setDifuAccount(data);
    } catch (err) {
      console.error('Failed to load DIFU balance:', err);
    }
  };
  
  // Create subscription
  const handleCreateSubscription = async () => {
    if (!selectedPlan) {
      setError('Please select a plan');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const token = await getToken();
      const res = await fetch(`${apiBase}/api/plus1/subscription/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          clerkId: user.id,
          planName: selectedPlan,
          paymentModel,
          totalDays: parseInt(days)
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error);
      }
      
      setSuccess(data.message);
      await loadSubscription();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Add collaborator
  const handleAddCollaborator = async () => {
    if (!collaboratorEmail || !subscription) {
      setError('Enter email and create subscription first');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const token = await getToken();
      const res = await fetch(`${apiBase}/api/plus1/collaborator/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          subscriptionId: subscription.id,
          hostClerkId: user.id,
          collaboratorEmail
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error);
      }
      
      setSuccess(data.message);
      setCollaboratorEmail('');
      await loadCollaborators(subscription.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Transfer DIFU
  const handleTransferDifu = async () => {
    if (!transferAmount || !transferTo) {
      setError('Enter amount and recipient');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const token = await getToken();
      const res = await fetch(`${apiBase}/api/plus1/difu/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          fromClerkId: user.id,
          toClerkId: transferTo,
          amount: parseFloat(transferAmount)
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error);
      }
      
      setSuccess(data.message);
      setTransferAmount('');
      setTransferTo('');
      await loadDifuBalance();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate cost
  const calculateCost = () => {
    if (!subscription) return 0;
    const collabCount = collaborators.length || 1;
    return (collabCount * 1.0 * days).toFixed(2);
  };
  
  return (
    <div className="bg-background min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-text mb-2 flex items-center gap-3">
            <Users className="w-8 h-8 text-neon" />
            Plus 1 Team Plan
          </h1>
          <p className="text-text/60">
            Collaborate with teammates. Just $1 per collaborator per day.
          </p>
        </div>
        
        {/* Alert Messages */}
        {error && (
          <div className="bg-red-950/30 border border-red-500/30 p-4 rounded mb-6 text-red-300">
            ❌ {error}
          </div>
        )}
        {success && (
          <div className="bg-green-950/30 border border-green-500/30 p-4 rounded mb-6 text-green-300">
            ✅ {success}
          </div>
        )}
        
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-[#2a2a2a]">
          <button
            onClick={() => setActiveTab('subscription')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'subscription'
                ? 'text-neon border-b-2 border-neon'
                : 'text-text/60 hover:text-text'
            }`}
          >
            📋 Subscription
          </button>
          <button
            onClick={() => setActiveTab('collaborators')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'collaborators'
                ? 'text-neon border-b-2 border-neon'
                : 'text-text/60 hover:text-text'
            }`}
          >
            👥 Collaborators {collaborators.length > 0 && `(${collaborators.length})`}
          </button>
          <button
            onClick={() => setActiveTab('difu')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'difu'
                ? 'text-neon border-b-2 border-neon'
                : 'text-text/60 hover:text-text'
            }`}
          >
            <Zap className="w-4 h-4 inline mr-1" />
            DIFU Ledger
          </button>
        </div>
        
        {/* Subscription Tab */}
        {activeTab === 'subscription' && (
          <div className="space-y-6">
            {!subscription ? (
              <>
                <h2 className="text-2xl font-bold text-text">Create Subscription</h2>
                
                {/* Plan Selection */}
                <div>
                  <label className="block text-sm font-medium mb-3 text-text">Plan</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(PLANS).map(([key, plan]) => (
                      <div
                        key={key}
                        onClick={() => setSelectedPlan(key)}
                        className={`p-4 rounded border-2 cursor-pointer transition-all ${
                          selectedPlan === key
                            ? 'border-neon bg-neon/10'
                            : 'border-[#2a2a2a] hover:border-[#3a3a3a]'
                        }`}
                      >
                        <div className="font-bold text-lg mb-1" style={{ color: plan.color }}>
                          {plan.name}
                        </div>
                        <div className="text-2xl font-bold text-text">
                          ${plan.basePrice}
                        </div>
                        <div className="text-xs text-text/60 mt-2">
                          Base plan + $1 per collaborator/day
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Payment Model */}
                <div>
                  <label className="block text-sm font-medium mb-3 text-text">Payment Model</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="daily"
                        checked={paymentModel === 'daily'}
                        onChange={(e) => setPaymentModel(e.target.value)}
                        className="w-4 h-4"
                      />
                      <span className="text-text">Daily ($1/day/collaborator)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="prepay_7"
                        checked={paymentModel === 'prepay_7'}
                        onChange={(e) => setPaymentModel(e.target.value)}
                        className="w-4 h-4"
                      />
                      <span className="text-text">Weekly Prepay (Save $1 per collaborator)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="prepay_30"
                        checked={paymentModel === 'prepay_30'}
                        onChange={(e) => setPaymentModel(e.target.value)}
                        className="w-4 h-4"
                      />
                      <span className="text-text">Monthly Prepay (Unlimited collaborators)</span>
                    </label>
                  </div>
                </div>
                
                {/* Days */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-text">Days</label>
                  <input
                    type="number"
                    value={days}
                    onChange={(e) => setDays(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    max="365"
                    className="input-field w-full"
                  />
                </div>
                
                {/* Create Button */}
                <button
                  onClick={handleCreateSubscription}
                  disabled={loading}
                  className="btn-primary w-full"
                >
                  {loading ? 'Creating...' : 'Create Subscription'}
                </button>
              </>
            ) : (
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-6 rounded">
                <h3 className="text-xl font-bold text-text mb-4">Active Subscription</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-xs text-text/60 mb-1">Plan</div>
                    <div className="font-bold text-lg text-neon capitalize">
                      {subscription.plan_name}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-text/60 mb-1">Base Price</div>
                    <div className="font-bold text-lg text-text">
                      ${subscription.base_price}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-text/60 mb-1">Model</div>
                    <div className="font-bold text-lg capitalize text-text">
                      {subscription.payment_model}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-text/60 mb-1">Valid Until</div>
                    <div className="font-bold text-lg text-accent">
                      {new Date(subscription.valid_until).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Collaborators Tab */}
        {activeTab === 'collaborators' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-text">Manage Collaborators</h2>
            
            {/* Add Collaborator */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-6 rounded">
              <h3 className="font-bold text-text mb-4">Invite Collaborator</h3>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Collaborator email"
                  value={collaboratorEmail}
                  onChange={(e) => setCollaboratorEmail(e.target.value)}
                  className="input-field flex-1"
                />
                <button
                  onClick={handleAddCollaborator}
                  disabled={loading}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
              <div className="text-xs text-text/60 mt-2">
                Cost: ${calculateCost()} for {collaborators.length + 1} person(s) × {days} day(s)
              </div>
            </div>
            
            {/* Collaborators List */}
            {collaborators.length > 0 ? (
              <div className="space-y-2">
                {collaborators.map((collab) => (
                  <div key={collab.id} className="bg-[#2a2a2a] p-4 rounded flex items-center justify-between">
                    <div>
                      <div className="font-medium text-text">{collab.email}</div>
                      <div className="text-xs text-text/60">
                        Status: <span className="capitalize">{collab.status}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-neon font-bold">${collab.cost_per_day}/day</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-text/60">
                No collaborators yet. Add one to start coding together!
              </div>
            )}
          </div>
        )}
        
        {/* DIFU Ledger Tab */}
        {activeTab === 'difu' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-text">DIFU Digital Ledger</h2>
            
            {/* Balance Summary */}
            {difuAccount && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-6 rounded">
                  <div className="text-xs text-text/60 mb-2">Current Balance</div>
                  <div className="text-3xl font-bold text-neon">{difuBalance.toFixed(2)}</div>
                  <div className="text-xs text-text/60 mt-1">DIFU</div>
                </div>
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-6 rounded">
                  <div className="text-xs text-text/60 mb-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Total Earned
                  </div>
                  <div className="text-3xl font-bold text-green-400">{difuAccount.totalEarned.toFixed(2)}</div>
                  <div className="text-xs text-text/60 mt-1">All time</div>
                </div>
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-6 rounded">
                  <div className="text-xs text-text/60 mb-2">Tier</div>
                  <div className="text-3xl font-bold text-accent capitalize">{difuAccount.tier}</div>
                  <div className="text-xs text-text/60 mt-1">Account status</div>
                </div>
              </div>
            )}
            
            {/* Transfer DIFU */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-6 rounded">
              <h3 className="font-bold text-text mb-4">Transfer DIFU</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Recipient Clerk ID"
                  value={transferTo}
                  onChange={(e) => setTransferTo(e.target.value)}
                  className="input-field w-full"
                />
                <input
                  type="number"
                  placeholder="Amount (DIFU)"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  min="0"
                  step="0.1"
                  className="input-field w-full"
                />
                <button
                  onClick={handleTransferDifu}
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Transfer {transferAmount ? `${transferAmount} DIFU` : 'DIFU'}
                </button>
              </div>
            </div>
            
            {/* Info */}
            <div className="bg-[#2a2a2a] p-4 rounded text-sm text-text/60">
              <div className="font-medium mb-2">💡 How DIFU Works:</div>
              <ul className="space-y-1 text-xs">
                <li>✅ Earn DIFU for collaborating with teammates</li>
                <li>💰 Spend DIFU to add collaborators to your team</li>
                <li>🎁 Receive bonuses for successful collaborations</li>
                <li>🔄 Transfer DIFU to other team members</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Plus1TeamManager;
