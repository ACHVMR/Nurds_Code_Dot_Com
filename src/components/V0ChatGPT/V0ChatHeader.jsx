/**
 * V0ChatHeader
 * Header component with status, wallet, and model selection
 */

import React, { useState } from 'react';
import { Menu, X, Minimize2, Maximize2, Zap } from 'lucide-react';

const V0ChatHeader = ({
  connectionStatus,
  walletConnected,
  walletAddress,
  currentNetwork,
  onMinimize,
  onMaximize,
  onWalletConnect,
  onWalletDisconnect,
  selectedModel,
  onModelChange,
  models,
}) => {
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const statusColor = {
    connected: '#39FF14',
    connecting: '#FFAA44',
    disconnected: '#FF4444',
    error: '#FF4444',
  };

  const formatAddress = (addr) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';

  return (
    <div className="v0-chat-header">
      <div className="header-left">
        <div className="header-title">
          <h3>ACHEEVY</h3>
          <span className="header-subtitle">Web3 AI Agent</span>
        </div>
        
        {/* Connection Status */}
        <div
          className="status-indicator"
          style={{ backgroundColor: statusColor[connectionStatus] }}
          title={`Status: ${connectionStatus}`}
        >
          {connectionStatus === 'connecting' && <div className="pulse"></div>}
        </div>
      </div>

      <div className="header-center">
        {/* Model Selector */}
        <div className="model-selector">
          <button
            className="model-button"
            onClick={() => setShowModelMenu(!showModelMenu)}
          >
            <Zap size={16} />
            <span>{models.find((m) => m.id === selectedModel)?.name || selectedModel}</span>
          </button>

          {showModelMenu && (
            <div className="model-menu">
              {models.map((model) => (
                <button
                  key={model.id}
                  className={`model-option ${selectedModel === model.id ? 'active' : ''}`}
                  onClick={() => {
                    onModelChange(model.id);
                    setShowModelMenu(false);
                  }}
                >
                  <span className="model-name">{model.name}</span>
                  <span className="model-tier">{model.tier}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Wallet Status */}
        {walletConnected ? (
          <div className="wallet-status connected">
            <div className="wallet-info">
              <span className="network-badge">{currentNetwork}</span>
              <span className="wallet-address">{formatAddress(walletAddress)}</span>
            </div>
            <button
              className="wallet-disconnect"
              onClick={onWalletDisconnect}
              title="Disconnect wallet"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            className="wallet-connect-button"
            onClick={onWalletConnect}
            title="Connect Web3 wallet"
          >
            🔗 Connect
          </button>
        )}
      </div>

      <div className="header-right">
        {/* Menu */}
        <button
          className="header-button menu-button"
          onClick={() => setShowMenu(!showMenu)}
          title="Menu"
        >
          <Menu size={20} />
        </button>

        {showMenu && (
          <div className="header-menu">
            <button onClick={onMaximize}>⛶ Maximize</button>
            <button onClick={onMinimize}>📦 Minimize</button>
            <button onClick={() => window.print()}>🖨 Print</button>
            <button onClick={() => navigator.clipboard.writeText(window.location.href)}>
              📋 Copy Link
            </button>
          </div>
        )}

        {/* Minimize Button */}
        <button
          className="header-button minimize-button"
          onClick={onMinimize}
          title="Minimize"
        >
          <Minimize2 size={20} />
        </button>

        {/* Maximize Button */}
        <button
          className="header-button maximize-button"
          onClick={onMaximize}
          title="Maximize"
        >
          <Maximize2 size={20} />
        </button>
      </div>
    </div>
  );
};

export default V0ChatHeader;
