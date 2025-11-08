import React, { useState, useEffect } from 'react';
import { Users, CreditCard, Plus, Trash2, TrendingDown } from 'lucide-react';

function CollaborationBilling() {
  const [subscription, setSubscription] = useState(null);
  const [collaborators, setCollaborators] = useState([]);
  const [billingHistory, setBillingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingCollaborator, setAddingCollaborator] = useState(false);
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState('');

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/collaboration/billing', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch billing data');
      }

      const data = await response.json();
      setSubscription(data.subscription);
      setCollaborators(data.collaborators || []);
      setBillingHistory(data.history || []);
    } catch (err) {
      console.error('Error fetching billing:', err);
    } finally {
      setLoading(false);
    }
  };

  const addCollaborator = async () => {
    if (!newCollaboratorEmail) return;

    try {
      const response = await fetch('/api/collaboration/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ email: newCollaboratorEmail }),
      });

      if (!response.ok) {
        throw new Error('Failed to add collaborator');
      }

      alert('Collaborator added successfully!');
      setNewCollaboratorEmail('');
      setAddingCollaborator(false);
      fetchBillingData();
    } catch (err) {
      alert(`Failed to add collaborator: ${err.message}`);
    }
  };

  const removeCollaborator = async (collaboratorId) => {
    if (!confirm('Are you sure you want to remove this collaborator?')) {
      return;
    }

    try {
      const response = await fetch(`/api/collaboration/remove/${collaboratorId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to remove collaborator');
      }

      alert('Collaborator removed');
      fetchBillingData();
    } catch (err) {
      alert(`Failed to remove collaborator: ${err.message}`);
    }
  };

  const upgradeSubscription = async (newTier) => {
    try {
      const response = await fetch('/api/collaboration/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ tier: newTier }),
      });

      if (!response.ok) {
        throw new Error('Failed to upgrade');
      }

      alert('Subscription upgraded!');
      fetchBillingData();
    } catch (err) {
      alert(`Upgrade failed: ${err.message}`);
    }
  };

  const getDiscountAmount = (collaboratorCount) => {
    const discountMap = { 1: 0, 2: 20, 3: 30, 4: 40, 5: 50 };
    return discountMap[Math.min(collaboratorCount, 5)] || 50;
  };

  const calculateMonthlyCost = (collaboratorCount) => {
    const baseCost = collaboratorCount * 30; // $1/day * 30 days
    const discount = getDiscountAmount(collaboratorCount);
    return baseCost * (1 - discount / 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E68961]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <CreditCard className="w-8 h-8 text-[#E68961]" />
            <h1 className="text-4xl font-bold">Plus One Billing</h1>
          </div>
          <p className="text-gray-400">
            Manage your collaboration subscription and team members
          </p>
        </div>

        {/* Current Subscription */}
        {subscription ? (
          <div className="bg-[#1a1a1a] border border-[#E68961] rounded-lg p-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Active Collaborators</h3>
                <p className="text-4xl font-bold text-[#E68961]">{collaborators.length}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Monthly Cost</h3>
                <p className="text-4xl font-bold">
                  ${calculateMonthlyCost(collaborators.length).toFixed(2)}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  ${(collaborators.length * 1).toFixed(2)}/day
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Your Discount</h3>
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-6 h-6 text-[#E68961]" />
                  <p className="text-4xl font-bold text-[#E68961]">
                    {getDiscountAmount(collaborators.length)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-8 text-center mb-8">
            <h3 className="text-xl font-semibold mb-4">No Active Subscription</h3>
            <p className="text-gray-400 mb-6">
              Start collaborating with your team for just $1/day
            </p>
            <a
              href="/pricing/plus-one"
              className="inline-block px-6 py-3 bg-[#E68961] text-black rounded-lg font-semibold hover:bg-[#D4A05F] transition-colors"
            >
              View Plus One Pricing
            </a>
          </div>
        )}

        {/* Collaborators List */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Team Members</h2>
            <button
              onClick={() => setAddingCollaborator(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#E68961] text-black rounded-lg font-semibold hover:bg-[#D4A05F] transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Collaborator
            </button>
          </div>

          {addingCollaborator && (
            <div className="bg-[#2a2a2a] rounded-lg p-4 mb-6">
              <h3 className="font-semibold mb-3">Add New Collaborator</h3>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={newCollaboratorEmail}
                  onChange={(e) => setNewCollaboratorEmail(e.target.value)}
                  placeholder="collaborator@example.com"
                  className="flex-1 bg-[#1a1a1a] text-white px-4 py-2 rounded-lg border border-[#3a3a3a] focus:outline-none focus:border-[#E68961]"
                />
                <button
                  onClick={addCollaborator}
                  className="px-6 py-2 bg-[#E68961] text-black rounded-lg font-semibold hover:bg-[#D4A05F] transition-colors"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setAddingCollaborator(false);
                    setNewCollaboratorEmail('');
                  }}
                  className="px-6 py-2 bg-[#3a3a3a] rounded-lg hover:bg-[#4a4a4a] transition-colors"
                >
                  Cancel
                </button>
              </div>
              {collaborators.length < 5 && (
                <p className="text-sm text-[#E68961] mt-2">
                  Add {5 - collaborators.length} more to reach max discount (50%)
                </p>
              )}
            </div>
          )}

          {collaborators.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4" />
              <p>No collaborators yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {collaborators.map((collaborator, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-[#2a2a2a] rounded-lg p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#E68961] flex items-center justify-center text-black font-bold">
                      {collaborator.name?.charAt(0) || collaborator.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold">{collaborator.name || collaborator.email}</p>
                      <p className="text-sm text-gray-400">{collaborator.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeCollaborator(collaborator.id)}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Billing History */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Billing History</h2>
          {billingHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No billing history yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-[#2a2a2a]">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">Description</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-400">Amount</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2a2a]">
                  {billingHistory.map((entry, index) => (
                    <tr key={index} className="hover:bg-[#2a2a2a]/50">
                      <td className="px-4 py-3 text-sm">
                        {new Date(entry.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm">{entry.description}</td>
                      <td className="px-4 py-3 text-sm text-right font-semibold">
                        ${entry.amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          entry.status === 'paid'
                            ? 'bg-[#E68961]/10 text-[#E68961]'
                            : entry.status === 'pending'
                            ? 'bg-yellow-500/10 text-yellow-500'
                            : 'bg-red-500/10 text-red-500'
                        }`}>
                          {entry.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CollaborationBilling;
