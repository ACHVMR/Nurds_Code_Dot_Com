/**
 * V0ChatWeb3Panel
 * Web3-specific panel showing wallet info, balances, and blockchain data
 */

import React, { useState, useEffect } from 'react';
import { RefreshCw, ExternalLink, Copy } from 'lucide-react';

const V0ChatWeb3Panel = ({ walletAddress, network, config }) => {
  const [tokenBalances, setTokenBalances] = useState([]);
  const [nftHoldings, setNftHoldings] = useState([]);
  const [networkInfo, setNetworkInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch wallet data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch token balances
        const balancesResponse = await fetch('/api/v0/web3/balances', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address: walletAddress,
            network,
          }),
        });

        if (balancesResponse.ok) {
          const balances = await balancesResponse.json();
          setTokenBalances(balances.tokens || []);
        }

        // Fetch NFT holdings
        const nftsResponse = await fetch('/api/v0/web3/nfts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address: walletAddress,
            network,
          }),
        });

        if (nftsResponse.ok) {
          const nfts = await nftsResponse.json();
          setNftHoldings(nfts.nfts || []);
        }

        // Fetch network info
        setNetworkInfo({
          name: network.toUpperCase(),
          rpc: config.networks[network]?.rpcUrl,
          chainId: config.networks[network]?.chainId,
          explorer: config.networks[network]?.explorerUrl,
        });
      } catch (err) {
        console.error('Error fetching Web3 data:', err);
        setError('Failed to fetch wallet data');
      } finally {
        setIsLoading(false);
      }
    };

    if (walletAddress && network) {
      fetchData();
    }
  }, [walletAddress, network, config]);

  // Format number
  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
    return parseFloat(num).toFixed(4);
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  // Format address
  const formatAddress = (addr) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';

  return (
    <div className="v0-chat-web3-panel">
      {/* Panel Header */}
      <div className="web3-panel-header">
        <h3>🔗 Web3 Info</h3>
        <button className="refresh-btn" onClick={() => window.location.reload()}>
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="panel-error">
          <p>⚠️ {error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="panel-loading">
          <div className="spinner"></div>
          <p>Loading Web3 data...</p>
        </div>
      ) : (
        <div className="panel-content">
          {/* Wallet Info */}
          <div className="panel-section wallet-info">
            <h4>Wallet</h4>
            <div className="info-row">
              <span className="label">Address:</span>
              <div className="value">
                <span>{formatAddress(walletAddress)}</span>
                <button
                  className="copy-btn"
                  onClick={() => copyToClipboard(walletAddress)}
                >
                  <Copy size={12} />
                </button>
              </div>
            </div>
            <div className="info-row">
              <span className="label">Network:</span>
              <span className="value network-badge">{networkInfo?.name}</span>
            </div>
            <div className="info-row">
              <span className="label">Chain ID:</span>
              <span className="value">{networkInfo?.chainId}</span>
            </div>
            {networkInfo?.explorer && (
              <div className="info-row">
                <a
                  href={`${networkInfo.explorer}/address/${walletAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="explorer-link"
                >
                  View on Explorer <ExternalLink size={12} />
                </a>
              </div>
            )}
          </div>

          {/* Token Balances */}
          <div className="panel-section token-balances">
            <h4>💰 Token Balances</h4>
            {tokenBalances.length === 0 ? (
              <p className="empty-state">No tokens found</p>
            ) : (
              <div className="token-list">
                {tokenBalances.slice(0, 5).map((token, i) => (
                  <div key={i} className="token-item">
                    <div className="token-info">
                      <div className="token-icon">{token.icon || '🪙'}</div>
                      <div className="token-details">
                        <span className="token-symbol">{token.symbol}</span>
                        <span className="token-name">{token.name}</span>
                      </div>
                    </div>
                    <div className="token-balance">
                      <span className="balance">{formatNumber(token.balance)}</span>
                      {token.usdValue && (
                        <span className="usd-value">${formatNumber(token.usdValue)}</span>
                      )}
                    </div>
                  </div>
                ))}
                {tokenBalances.length > 5 && (
                  <button className="view-more">
                    View {tokenBalances.length - 5} more tokens
                  </button>
                )}
              </div>
            )}
          </div>

          {/* NFT Holdings */}
          {nftHoldings.length > 0 && (
            <div className="panel-section nft-holdings">
              <h4>🖼️ NFTs ({nftHoldings.length})</h4>
              <div className="nft-grid">
                {nftHoldings.slice(0, 3).map((nft, i) => (
                  <div key={i} className="nft-item">
                    {nft.image && (
                      <img src={nft.image} alt={nft.name} className="nft-image" />
                    )}
                    <div className="nft-info">
                      <h5>{nft.name || `NFT #${nft.tokenId}`}</h5>
                      <p className="nft-collection">{nft.collection}</p>
                      {nft.floorPrice && (
                        <p className="nft-price">Floor: {nft.floorPrice} ETH</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {nftHoldings.length > 3 && (
                <button className="view-more">
                  View {nftHoldings.length - 3} more NFTs
                </button>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <div className="panel-section quick-actions">
            <h4>⚡ Quick Actions</h4>
            <div className="action-buttons">
              <button className="action-btn swap">
                🔄 Swap Tokens
              </button>
              <button className="action-btn bridge">
                🌉 Bridge
              </button>
              <button className="action-btn stake">
                💎 Stake
              </button>
              <button className="action-btn send">
                📤 Send
              </button>
            </div>
          </div>

          {/* Suggested Actions */}
          <div className="panel-section suggestions">
            <h4>💡 Suggestions</h4>
            <div className="suggestion-list">
              <button className="suggestion-item">
                <span className="icon">📊</span>
                <span>Analyze holdings for yield opportunities</span>
              </button>
              <button className="suggestion-item">
                <span className="icon">⚠️</span>
                <span>Check for rugpull/scam tokens</span>
              </button>
              <button className="suggestion-item">
                <span className="icon">💰</span>
                <span>View portfolio performance</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default V0ChatWeb3Panel;
