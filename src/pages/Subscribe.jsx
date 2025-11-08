import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

function Subscribe() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(searchParams.get('plan') || 'free');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  const plans = useMemo(() => ({
    free: {
      name: 'Free',
      price: 0,
      billing: 'per month',
      summary: 'GROQ models, 2 projects max, community support',
    },
    price_coffee: {
      name: 'Buy Me a Coffee',
      price: 6.99,
      billing: 'per month',
      summary: '10M tokens/month, basic voice features, 5 projects',
    },
    price_lite: {
      name: 'LITE',
      price: 14.99,
      billing: 'per month',
      summary: '30M tokens/month, full voice integration, unlimited projects',
    },
    price_medium: {
      name: 'Medium',
      price: 49.99,
      billing: 'per month',
      summary: '150M tokens/month, all premium models, team collaboration',
    },
    price_heavy: {
      name: 'Heavy',
      price: 149.99,
      billing: 'per month',
      summary: '500M tokens/month, advanced AI models, premium support',
    },
    price_superior: {
      name: 'Superior',
      price: 349.99,
      billing: 'per month',
      summary: 'Unlimited tokens, enterprise features, white-label options',
    },
  }), []);

  useEffect(() => {
    const planParam = searchParams.get('plan');
    if (planParam && plans[planParam]) {
      setSelectedPlan(planParam);
    }
  }, [searchParams, plans]);

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
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Developer Illustration */}
          <div className="hidden lg:flex justify-center">
            <img 
              src="/assets/illustrations/nurd-developer.png" 
              alt="Developer with NURD"
              className="w-full max-w-md h-auto drop-shadow-2xl"
              style={{ filter: 'drop-shadow(0 0 20px rgba(57, 255, 20, 0.3))' }}
            />
          </div>

          {/* Right: Subscription Form */}
          <div className="card">
          <h1 className="text-4xl font-bold mb-8 text-center text-text">
            Subscribe to Nurds Code
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
                <option value="price_coffee">Buy Me a Coffee - $6.99/month</option>
                <option value="price_lite">LITE - $14.99/month</option>
                <option value="price_medium">Medium - $49.99/month</option>
                <option value="price_heavy">Heavy - $149.99/month</option>
                <option value="price_superior">Superior - $349.99/month</option>
              </select>
            </div>

            <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg text-text">Selected Plan:</span>
                <span className="text-2xl font-bold text-accent">
                  {plans[selectedPlan]?.name}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg text-text">Total:</span>
                <span className="text-3xl font-bold text-text">
                  ${plans[selectedPlan]?.price}
                  <span className="text-sm text-text/60">/{plans[selectedPlan]?.billing || 'month'}</span>
                </span>
              </div>
              {plans[selectedPlan]?.summary && (
                <p className="text-sm text-text/60 mt-4">
                  {plans[selectedPlan].summary}
                </p>
              )}
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

          <p className="text-sm text-text/60 text-center mt-6">
            By subscribing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
    </div>
  );
}

export default Subscribe;
