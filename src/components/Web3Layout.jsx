import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Wallet } from 'lucide-react';

function Web3Layout({ children }) {
  return (
    <div className="min-h-screen bg-[#0F0F0F] flex flex-col">
      {/* Web3 Navbar */}
      <nav className="bg-[#1a1a1a] border-b border-[#2a2a2a] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left - Logo */}
            <Link to="/web3" className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#39FF14] to-[#D946EF] flex items-center justify-center">
                <span className="text-black font-bold text-lg">B</span>
              </div>
              <div>
                <div className="text-xl font-bold text-[#39FF14]">ACHEEVY</div>
                <div className="text-xs text-gray-400">Web3 AI Agent</div>
              </div>
            </Link>

            {/* Center - Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/web3/dashboard" className="text-gray-300 hover:text-[#39FF14] transition-colors font-medium">
                Dashboard
              </Link>
              <Link to="/web3/agents" className="text-gray-300 hover:text-[#39FF14] transition-colors font-medium">
                Agents
              </Link>
              <Link to="/web3/wallet" className="text-gray-300 hover:text-[#39FF14] transition-colors font-medium">
                Wallet
              </Link>
            </div>

            {/* Right - Actions */}
            <div className="flex items-center space-x-4">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#39FF14]/30 text-[#39FF14] hover:bg-[#39FF14]/10 transition-all">
                <Wallet className="w-4 h-4" />
                <span className="hidden sm:inline">Connect</span>
              </button>
              <Link 
                to="/"
                className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-gray-300 transition-colors"
                title="Return to main app"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">Back</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Web3 Footer */}
      <footer className="bg-[#1a1a1a] border-t border-[#2a2a2a] mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Platform */}
            <div>
              <h3 className="text-white font-bold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="/web3" className="hover:text-[#39FF14] transition-colors">Home</Link></li>
                <li><Link to="/web3/dashboard" className="hover:text-[#39FF14] transition-colors">Dashboard</Link></li>
                <li><Link to="/web3/agents" className="hover:text-[#39FF14] transition-colors">Agents</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-white font-bold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-[#39FF14] transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-[#39FF14] transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-[#39FF14] transition-colors">Guides</a></li>
              </ul>
            </div>

            {/* Community */}
            <div>
              <h3 className="text-white font-bold mb-4">Community</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-[#39FF14] transition-colors">Discord</a></li>
                <li><a href="#" className="hover:text-[#39FF14] transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-[#39FF14] transition-colors">GitHub</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-white font-bold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-[#39FF14] transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-[#39FF14] transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-[#39FF14] transition-colors">Security</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#2a2a2a] pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© 2025 ACHEEVY. All rights reserved.</p>
            <Link to="/" className="text-gray-400 hover:text-[#39FF14] text-sm transition-colors mt-4 md:mt-0">
              Back to Nurds Code
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Web3Layout;
