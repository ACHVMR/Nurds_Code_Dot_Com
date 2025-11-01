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
      summary: 'Groq 8B playground access and community tutorials',
    },
    price_coffee: {
      name: 'Buy Me a Coffee ☕',
      price: 7,
      billing: 'per month',
      summary: 'Groq 70B default routing with extended token limits',
    },
    price_pro: {
      name: 'Pro',
      price: 29,
      billing: 'per month',
      summary: 'GPT-4o mini via Cloudflare gateway with project workspaces',
    },
    price_enterprise: {
      name: 'Enterprise',
      price: 99,
      billing: 'per month',
      summary: 'Hybrid routing with Claude for teams, governance, and SLA support',
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
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* NURD Drip Hero Section */}
        <div className="flex justify-center mb-16">
          <div className="relative w-full max-w-md h-96 flex items-center justify-center">
            <img 
              src="/assets/logos/nurd-drip-hero.svg" 
              alt="NURD Drip Logo"
              className="w-full h-full object-contain drop-shadow-2xl"
              style={{ 
                filter: 'drop-shadow(0 0 30px rgba(57, 255, 20, 0.4)) drop-shadow(0 0 60px rgba(217, 70, 239, 0.2))',
                animation: 'float 3s ease-in-out infinite'
              }}
            />
            <style>{`
              @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-10px); }
              }
            `}</style>
          </div>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Plan Description */}
          <div className="text-center lg:text-left">
            <h1 className="text-5xl font-bold mb-4 text-text">
              Start Building with <span className="text-[#39FF14]">Nurds Code</span>
            </h1>
            <p className="text-lg text-text/70 mb-8">
              Choose a plan that fits your journey. Upgrade anytime to unlock more AI, more collaboration, and more power.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🤖</span>
                <p className="text-text">ACHEEVY AI Assistant</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎯</span>
                <p className="text-text">Real-time Code Collaboration</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚡</span>
                <p className="text-text">One-Click Deployments</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">💰</span>
                <p className="text-text">DIFU Digital Currency System</p>
              </div>
            </div>
          </div>

          {/* Right: Subscription Form */}
          <div className="card">
            <h2 className="text-3xl font-bold mb-8 text-center text-text">
              Choose Your Plan
            </h2>

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
                  <option value="price_coffee">Buy Me a Coffee ☕ - $7/month</option>
                <option value="price_pro">Pro - $29/month</option>
                <option value="price_enterprise">Enterprise - $99/month</option>
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
