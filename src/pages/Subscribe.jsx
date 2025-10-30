import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

function Subscribe() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(searchParams.get('plan') || 'free');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  const plans = {
    free: { name: 'Free', price: 0 },
    price_pro: { name: 'Pro', price: 29 },
    price_enterprise: { name: 'Enterprise', price: 99 },
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    if (selectedPlan === 'free') {
      // For free plan, just show success
      navigate('/success?plan=free');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: selectedPlan,
          email: email,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to create checkout session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="card">
          <h1 className="text-4xl font-bold mb-8 text-center">
            Subscribe to Nurdscode
          </h1>

          <form onSubmit={handleSubscribe} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field w-full"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="plan" className="block text-sm font-medium mb-2">
                Select Plan
              </label>
              <select
                id="plan"
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                className="input-field w-full"
              >
                <option value="free">Free - $0/month</option>
                <option value="price_pro">Pro - $29/month</option>
                <option value="price_enterprise">Enterprise - $99/month</option>
              </select>
            </div>

            <div className="bg-gray-700 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg">Selected Plan:</span>
                <span className="text-2xl font-bold text-nurd-purple">
                  {plans[selectedPlan]?.name}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg">Total:</span>
                <span className="text-3xl font-bold">
                  ${plans[selectedPlan]?.price}
                  <span className="text-sm text-gray-400">/month</span>
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full btn-primary ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Processing...' : 'Continue to Payment'}
            </button>
          </form>

          <p className="text-sm text-gray-400 text-center mt-6">
            By subscribing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Subscribe;
