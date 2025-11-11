import React, { useState, useEffect } from 'react';
import { Settings, Zap } from 'lucide-react';
import { useV0ChatGPT } from '../context/V0ChatGPTProvider';
import V0ChatGPTUI from '../components/V0ChatGPTUI';

function Web3Dashboard() {
  const { 
    walletConnected, 
    walletAddress, 
    currentNetwork, 
    initializeV0SDK,
    connectWeb3Wallet,
    disconnectWeb3Wallet,
    connectionStatus
  } = useV0ChatGPT();
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [portfolioStats, setPortfolioStats] = useState(null);

  // Initialize V0 SDK on mount
  useEffect(() => {
    initializeV0SDK();
    setIsInitialized(true);
  }, [initializeV0SDK]);

  // Fetch portfolio stats when wallet connected
  useEffect(() => {
    if (walletConnected && walletAddress) {
      // TODO: Fetch real data from backend
      setPortfolioStats({
        balance: '$0.00',
        holdings: 0,
        volume24h: '$0.00'
      });
    }
  }, [walletConnected, walletAddress]);

  const handleWalletAction = async () => {
    if (walletConnected) {
      await disconnectWeb3Wallet();
    } else {
      await connectWeb3Wallet('metamask');
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-linear-to-br from-[#39FF14] to-[#D946EF] flex items-center justify-center">
                <span className="text-black font-bold text-lg">B</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">ACHEEVY</h1>
                <p className="text-gray-400">AI-Powered Web3 Agent</p>
              </div>
            </div>

            {/* Wallet Status */}
            <div className="flex items-center gap-4">
              {connectionStatus && (
                <div className="text-right">
                  <div className={`text-sm font-medium ${
                    walletConnected ? 'text-[#39FF14]' : 'text-gray-400'
                  }`}>
                    {walletConnected ? (
                      <>
                        <span className="inline-block w-2 h-2 rounded-full bg-[#39FF14] mr-2"></span>
                        Connected
                      </>
                    ) : (
                      <>
                        <span className="inline-block w-2 h-2 rounded-full bg-gray-500 mr-2"></span>
                        Disconnected
                      </>
                    )}
                  </div>
                  {walletConnected && (
                    <div className="text-xs text-gray-400 mt-1">
                      {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handleWalletAction}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  walletConnected
                    ? 'bg-[#2a2a2a] text-gray-300 hover:bg-red-500/20 hover:text-red-400'
                    : 'bg-[#39FF14] text-black hover:bg-[#2FCC0A]'
                }`}
              >
                {walletConnected ? 'Disconnect' : '🔗 Connect Wallet'}
              </button>
            </div>
          </div>

          {/* Status Banner */}
          {isInitialized && (
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4">
              <p className="text-gray-300 text-sm">
                <Zap className="inline w-4 h-4 mr-2 text-[#39FF14]" />
                {walletConnected
                  ? 'Your wallet is connected. ACHEEVY is ready to analyze your portfolio and find opportunities!'
                  : 'Connect your wallet to unlock advanced Web3 analysis, portfolio management, and DeFi insights.'}
              </p>
            </div>
          )}
        </div>

        {/* Main Chat Area - V0ChatGPTUI */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg overflow-hidden shadow-lg">
          <V0ChatGPTUI
            position="full"
            theme="dark"
            walletConnected={walletConnected}
            walletAddress={walletAddress}
            currentNetwork={currentNetwork}
            onWalletConnect={handleWalletAction}
          />
        </div>

        {/* Stats Cards */}
        {walletConnected && portfolioStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
              <div className="text-gray-400 text-sm mb-2">Total Balance</div>
              <div className="text-3xl font-bold text-[#39FF14]">{portfolioStats.balance}</div>
              <div className="text-xs text-gray-500 mt-2">Across all chains</div>
            </div>
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
              <div className="text-gray-400 text-sm mb-2">Holdings</div>
              <div className="text-3xl font-bold text-white">{portfolioStats.holdings}</div>
              <div className="text-xs text-gray-500 mt-2">Unique tokens</div>
            </div>
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
              <div className="text-gray-400 text-sm mb-2">24h Volume</div>
              <div className="text-3xl font-bold text-white">{portfolioStats.volume24h}</div>
              <div className="text-xs text-gray-500 mt-2">Trading activity</div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
            <h3 className="text-white font-bold mb-4">🤖 ACHEEVY Capabilities</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>✓ Smart contract analysis & security audits</li>
              <li>✓ Portfolio analysis across multiple chains</li>
              <li>✓ Transaction simulation & optimization</li>
              <li>✓ DeFi opportunity detection</li>
              <li>✓ Rug pull & scam detection</li>
              <li>✓ Real-time market insights</li>
            </ul>
          </div>

          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
            <h3 className="text-white font-bold mb-4">🔗 Supported Networks</h3>
            <div className="space-y-2">
              {['Ethereum', 'Polygon', 'Arbitrum', 'Optimism'].map((network) => (
                <div key={network} className="flex items-center justify-between">
                  <span className="text-gray-400">{network}</span>
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    currentNetwork?.toLowerCase() === network.toLowerCase()
                      ? 'bg-[#39FF14]/20 text-[#39FF14]'
                      : 'bg-[#2a2a2a] text-gray-500'
                  }`}>
                    {currentNetwork?.toLowerCase() === network.toLowerCase() ? 'Active' : 'Available'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Web3Dashboard;
