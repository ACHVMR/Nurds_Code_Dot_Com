import React from 'react';
import { SignIn, SignedIn, SignedOut, UserProfile } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { Sparkles, Code, Zap, Shield } from 'lucide-react';

function Auth() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Column - Hero Content */}
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-[#E68961]/10 border border-[#E68961]/30 rounded-full px-4 py-2 mb-6">
                <Sparkles className="w-4 h-4 text-[#E68961]" />
                <span className="text-sm font-semibold text-[#E68961]">Welcome to Nurds Code</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Build the Future with{' '}
                <span className="text-[#E68961]">Voice-First</span> Development
              </h1>
              
              <p className="text-lg text-gray-300 mb-8">
                Join developers worldwide using ACHEEVY to transform ideas into reality. 
                Sign in to unlock powerful AI-driven development tools.
              </p>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex items-start gap-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <Code className="w-5 h-5 text-[#E68961] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-white text-sm mb-1">Code Generation</h3>
                    <p className="text-xs text-gray-400">AI-powered development</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <Zap className="w-5 h-5 text-[#E68961] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-white text-sm mb-1">Lightning Fast</h3>
                    <p className="text-xs text-gray-400">Cloudflare powered</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <Shield className="w-5 h-5 text-[#E68961] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-white text-sm mb-1">Secure</h3>
                    <p className="text-xs text-gray-400">Enterprise-grade</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <Sparkles className="w-5 h-5 text-[#E68961] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-white text-sm mb-1">Voice First</h3>
                    <p className="text-xs text-gray-400">Talk to build</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/pricing" 
                  className="btn-primary text-base px-8 py-3 text-center"
                >
                  View Pricing Plans
                </Link>
                <Link 
                  to="/" 
                  className="btn-secondary text-base px-8 py-3 text-center"
                >
                  Learn More
                </Link>
              </div>
            </div>

            {/* Right Column - Sign In Form */}
            <div className="w-full max-w-md mx-auto">
              <SignedOut>
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                  <h2 className="text-2xl font-bold text-black mb-2">Sign In to Continue</h2>
                  <p className="text-gray-600 mb-6 text-sm">
                    Access your projects and start building
                  </p>
                  <SignIn routing="hash" signUpUrl="/auth" />
                </div>
              </SignedOut>
              
              <SignedIn>
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                  <h2 className="text-2xl font-bold text-black mb-4">Welcome Back!</h2>
                  <p className="text-gray-600 mb-6">
                    You're signed in. Manage your profile below or continue building.
                  </p>
                  <div className="flex gap-4 mb-6">
                    <Link to="/editor" className="btn-primary flex-1 text-center">
                      Go to Editor
                    </Link>
                    <Link to="/pricing" className="btn-secondary flex-1 text-center">
                      View Plans
                    </Link>
                  </div>
                  <div className="border-t border-gray-200 pt-6">
                    <UserProfile routing="hash" />
                  </div>
                </div>
              </SignedIn>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-400 text-sm mb-6">Trusted by developers worldwide</p>
          <div className="grid grid-cols-3 gap-8 items-center justify-items-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#E68961]">10K+</div>
              <div className="text-sm text-gray-400">Developers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#E68961]">50K+</div>
              <div className="text-sm text-gray-400">Projects Built</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#E68961]">99.9%</div>
              <div className="text-sm text-gray-400">Uptime</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Auth;
