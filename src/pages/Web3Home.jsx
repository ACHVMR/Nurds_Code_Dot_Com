import React from 'react';
import { Link } from 'react-router-dom';
import { Wallet, Zap, Shield, Sparkles } from 'lucide-react';

function Web3Home() {
  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      {/* Hero Section */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            {/* Animated Background */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-0 left-1/2 w-96 h-96 bg-[#39FF14]/10 rounded-full blur-3xl transform -translate-x-1/2"></div>
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#D946EF]/10 rounded-full blur-3xl"></div>
            </div>

            <div className="mb-12">
              <div className="inline-block px-4 py-2 rounded-full border border-[#39FF14]/30 bg-[#39FF14]/5 mb-6">
                <span className="text-[#39FF14] font-semibold">🔗 Web3 AI Platform</span>
              </div>
              
              <h1 className="text-6xl sm:text-7xl font-bold mb-6 text-white leading-tight">
                ACHEEVY
                <br />
                <span className="bg-linear-to-r from-[#39FF14] to-[#D946EF] text-transparent bg-clip-text">
                  Web3 AI Agent
                </span>
              </h1>

              <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-12">
                Meet ACHEEVY - Your AI-powered Web3 Agent. Build, analyze, and interact with blockchain applications with unparalleled ease and intelligence.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/web3/dashboard" 
                  className="px-8 py-4 bg-[#39FF14] text-black font-bold rounded-lg hover:bg-[#2FCC0A] transition-all shadow-lg hover:shadow-[0_0_20px_rgba(57,255,20,0.3)]"
                >
                  Enter Platform
                </Link>
                <Link 
                  to="/web3/agents"
                  className="px-8 py-4 border-2 border-[#39FF14] text-[#39FF14] font-bold rounded-lg hover:bg-[#39FF14]/5 transition-all"
                >
                  Agent Builder
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 border-t border-[#2a2a2a]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-20 text-white">
            Powered by Cutting-Edge Technology
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] hover:border-[#39FF14]/50 transition-all">
              <Wallet className="w-12 h-12 text-[#39FF14] mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Web3 Native</h3>
              <p className="text-gray-400">
                Native blockchain integration with multi-chain support. MetaMask, WalletConnect, and more.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] hover:border-[#39FF14]/50 transition-all">
              <Zap className="w-12 h-12 text-[#D946EF] mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Lightning Fast</h3>
              <p className="text-gray-400">
                Real-time data streaming with WebSocket support. Instant transaction analysis and simulation.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] hover:border-[#39FF14]/50 transition-all">
              <Shield className="w-12 h-12 text-cyan-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Secure</h3>
              <p className="text-gray-400">
                Enterprise-grade security. Smart contract audits, rug pull detection, and scam prevention.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] hover:border-[#39FF14]/50 transition-all">
              <Sparkles className="w-12 h-12 text-yellow-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">AI-Powered</h3>
              <p className="text-gray-400">
                Advanced AI analysis of transactions, smart contracts, and DeFi opportunities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 border-t border-[#2a2a2a]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-20 text-white">
            What ACHEEVY Can Do
          </h2>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-[#39FF14] mb-6">🔍 Analysis</h3>
              <ul className="space-y-4 text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-[#39FF14] font-bold">✓</span>
                  <span>Smart contract auditing & vulnerability detection</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#39FF14] font-bold">✓</span>
                  <span>Transaction simulation & gas optimization</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#39FF14] font-bold">✓</span>
                  <span>Portfolio analysis & risk assessment</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#39FF14] font-bold">✓</span>
                  <span>Rug pull & scam detection</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-[#D946EF] mb-6">⚡ Interaction</h3>
              <ul className="space-y-4 text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-[#D946EF] font-bold">✓</span>
                  <span>Wallet management & token operations</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#D946EF] font-bold">✓</span>
                  <span>DeFi protocol interaction & yield farming</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#D946EF] font-bold">✓</span>
                  <span>NFT discovery & portfolio tracking</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#D946EF] font-bold">✓</span>
                  <span>Automated trading & arbitrage opportunities</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Networks */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 border-t border-[#2a2a2a]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-20 text-white">
            Multi-Chain Support
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: 'Ethereum', symbol: 'ETH', color: 'from-blue-600' },
              { name: 'Polygon', symbol: 'MATIC', color: 'from-purple-600' },
              { name: 'Arbitrum', symbol: 'ARB', color: 'from-cyan-600' },
              { name: 'Optimism', symbol: 'OP', color: 'from-red-600' },
            ].map((network) => (
              <div key={network.name} className="text-center">
                <div className={`w-20 h-20 rounded-full bg-linear-to-br ${network.color} to-transparent mx-auto mb-4 flex items-center justify-center`}>
                  <span className="text-2xl font-bold text-white">{network.symbol[0]}</span>
                </div>
                <h3 className="text-xl font-bold text-white">{network.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 border-t border-[#2a2a2a]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Web3 Experience?
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Connect your wallet and start leveraging ACHEEVY's AI power today.
          </p>
          <Link
            to="/web3/dashboard"
            className="inline-block px-8 py-4 bg-[#39FF14] text-black font-bold rounded-lg hover:bg-[#2FCC0A] transition-all shadow-lg hover:shadow-[0_0_20px_rgba(57,255,20,0.3)]"
          >
            Get Started Now
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Web3Home;
