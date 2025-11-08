import React, { useState } from 'react';
import { Wallet, Copy, ExternalLink, Plus, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

function Web3Wallet() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [activeTab, setActiveTab] = useState('assets'); // assets, transactions

  const handleConnectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletConnected(true);
        setWalletAddress(accounts[0]);
      } catch (error) {
        console.error('Wallet connection failed:', error);
      }
    } else {
      alert('MetaMask is not installed.');
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
  };

  const mockAssets = [
    { id: 1, symbol: 'ETH', name: 'Ethereum', balance: 2.5, value: 5250 },
    { id: 2, symbol: 'USDC', name: 'USD Coin', balance: 10000, value: 10000 },
    { id: 3, symbol: 'MATIC', name: 'Polygon', balance: 1000, value: 850 },
    { id: 4, symbol: 'ARB', name: 'Arbitrum', balance: 100, value: 420 },
  ];

  const mockTransactions = [
    { id: 1, type: 'send', to: '0x742d...', amount: 0.5, token: 'ETH', value: 1050, time: '2 hours ago' },
    { id: 2, type: 'receive', from: '0x9f2e...', amount: 1000, token: 'USDC', value: 1000, time: '1 day ago' },
    { id: 3, type: 'swap', tokens: 'ETH → USDC', value: 2100, time: '3 days ago' },
  ];

  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!walletConnected ? (
          <div className="text-center py-20">
            <Wallet className="w-20 h-20 text-gray-500 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-white mb-4">Connect Your Wallet</h1>
            <p className="text-gray-400 mb-8 text-lg">
              Connect your wallet to view your assets, transactions, and manage your portfolio
            </p>
            <button
              onClick={handleConnectWallet}
              className="px-8 py-4 bg-gradient-to-r from-[#39FF14] to-[#D946EF] text-black font-bold rounded-lg hover:opacity-90 transition-all shadow-lg text-lg"
            >
              🔗 Connect Wallet
            </button>
          </div>
        ) : (
          <div>
            {/* Wallet Header */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 mb-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">My Wallet</h2>
                  <div className="flex items-center gap-2">
                    <code className="bg-[#0F0F0F] border border-[#2a2a2a] px-3 py-1 rounded text-gray-400 text-sm">
                      {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                    </code>
                    <button
                      onClick={copyAddress}
                      className="p-2 hover:bg-[#2a2a2a] rounded transition-colors text-gray-400 hover:text-[#39FF14]"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <a
                      href={`https://etherscan.io/address/${walletAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-[#2a2a2a] rounded transition-colors text-gray-400 hover:text-[#39FF14]"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
                <button
                  onClick={() => setWalletConnected(false)}
                  className="px-4 py-2 bg-[#2a2a2a] text-gray-300 rounded-lg hover:bg-red-500/20 hover:text-red-400 transition-all text-sm"
                >
                  Disconnect
                </button>
              </div>

              {/* Portfolio Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#0F0F0F] border border-[#2a2a2a] rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-2">Total Balance</div>
                  <div className="text-3xl font-bold text-[#39FF14]">$17,520</div>
                  <div className="text-xs text-green-400 mt-2">+2.5% (24h)</div>
                </div>
                <div className="bg-[#0F0F0F] border border-[#2a2a2a] rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-2">Assets</div>
                  <div className="text-3xl font-bold text-white">{mockAssets.length}</div>
                  <div className="text-xs text-gray-400 mt-2">Across 3 chains</div>
                </div>
                <div className="bg-[#0F0F0F] border border-[#2a2a2a] rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-2">24h Volume</div>
                  <div className="text-3xl font-bold text-white">$3,240</div>
                  <div className="text-xs text-gray-400 mt-2">Transactions</div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-[#2a2a2a]">
              <button
                onClick={() => setActiveTab('assets')}
                className={`px-4 py-3 font-medium border-b-2 transition-all ${
                  activeTab === 'assets'
                    ? 'border-[#39FF14] text-[#39FF14]'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Assets
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`px-4 py-3 font-medium border-b-2 transition-all ${
                  activeTab === 'transactions'
                    ? 'border-[#39FF14] text-[#39FF14]'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Transactions
              </button>
            </div>

            {/* Assets Tab */}
            {activeTab === 'assets' && (
              <div className="space-y-4">
                {mockAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 flex items-center justify-between hover:border-[#39FF14]/50 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#39FF14] to-[#D946EF] flex items-center justify-center text-white font-bold">
                        {asset.symbol[0]}
                      </div>
                      <div>
                        <div className="text-white font-bold">{asset.symbol}</div>
                        <div className="text-sm text-gray-400">{asset.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold">{asset.balance.toLocaleString()}</div>
                      <div className="text-sm text-gray-400">${asset.value.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Transactions Tab */}
            {activeTab === 'transactions' && (
              <div className="space-y-4">
                {mockTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 flex items-center justify-between hover:border-[#39FF14]/50 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#2a2a2a] flex items-center justify-center text-[#39FF14]">
                        {tx.type === 'send' ? (
                          <ArrowUpRight className="w-6 h-6" />
                        ) : tx.type === 'receive' ? (
                          <ArrowDownLeft className="w-6 h-6" />
                        ) : (
                          <Plus className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <div className="text-white font-bold">
                          {tx.type === 'send' ? 'Sent' : tx.type === 'receive' ? 'Received' : 'Swapped'} {tx.tokens || `${tx.amount} ${tx.token}`}
                        </div>
                        <div className="text-sm text-gray-400">{tx.time}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold">${tx.value.toLocaleString()}</div>
                      <div className={`text-sm ${tx.type === 'send' ? 'text-red-400' : 'text-green-400'}`}>
                        {tx.type === 'send' ? '-' : '+'} {tx.amount || 'Swap'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Web3Wallet;
