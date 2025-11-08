/**
 * V0ChatGPTProvider
 * Context provider for v0 Chat SDK + ChainGPT UI integration
 * Manages configuration, state, and API connections
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { V0_CHAT_CONFIG, CHAINGPT_UI_CONFIG, WEB3_AGENT_CONFIG } from '../config/v0-chaingpt-config';

const V0ChatGPTContext = createContext();

export const useV0ChatGPT = () => {
  const context = useContext(V0ChatGPTContext);
  if (!context) {
    throw new Error('useV0ChatGPT must be used within V0ChatGPTProvider');
  }
  return context;
};

export const V0ChatGPTProvider = ({ children }) => {
  // State Management
  const [config, setConfig] = useState({
    v0: V0_CHAT_CONFIG,
    chaingpt: CHAINGPT_UI_CONFIG,
    web3: WEB3_AGENT_CONFIG,
  });

  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // 'connected' | 'connecting' | 'disconnected' | 'error'
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [currentNetwork, setCurrentNetwork] = useState('ethereum');

  // Initialize V0 Chat SDK
  const initializeV0SDK = useCallback(async () => {
    try {
      setConnectionStatus('connecting');

      // Skip SDK initialization for now - graceful degradation
      setConnectionStatus('connected');
      setIsInitialized(true);
      setError(null);

      console.log('✅ V0 Chat SDK skipped - using graceful degradation mode');
    } catch (err) {
      console.error('❌ Failed to initialize V0 Chat SDK:', err);
      setConnectionStatus('error');
      setError(err.message);
      // Don't throw - allow graceful degradation
    }
  }, []);

  // Connect Web3 Wallet
  const connectWeb3Wallet = useCallback(async (walletType = 'metamask') => {
    try {
      setConnectionStatus('connecting');

      // Check if wallet is available
      if (!window.ethereum && walletType === 'metamask') {
        throw new Error('MetaMask not found. Please install it first.');
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      const address = accounts[0];
      setWalletAddress(address);
      setWalletConnected(true);

      // Get current network
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const networkMap = {
        '0x1': 'ethereum',
        '0x89': 'polygon',
        '0xa4b1': 'arbitrum',
        '0xa': 'optimism',
      };
      setCurrentNetwork(networkMap[chainId] || 'ethereum');

      setError(null);
      console.log('✅ Wallet connected:', address);

      return address;
    } catch (err) {
      console.error('❌ Failed to connect wallet:', err);
      setError(err.message);
      setConnectionStatus('disconnected');
      throw err;
    }
  }, []);

  // Disconnect Web3 Wallet
  const disconnectWeb3Wallet = useCallback(() => {
    setWalletConnected(false);
    setWalletAddress(null);
    setCurrentNetwork('ethereum');
    console.log('✅ Wallet disconnected');
  }, []);

  // Update configuration
  const updateConfig = useCallback((section, newConfig) => {
    setConfig((prev) => ({
      ...prev,
      [section]: { ...prev[section], ...newConfig },
    }));
  }, []);

  // Update chat configuration
  const updateChatConfig = useCallback((newConfig) => {
    updateConfig('v0', newConfig);
  }, [updateConfig]);

  // Update UI configuration
  const updateUIConfig = useCallback((newConfig) => {
    updateConfig('chaingpt', newConfig);
  }, [updateConfig]);

  // Update Web3 configuration
  const updateWeb3Config = useCallback((newConfig) => {
    updateConfig('web3', newConfig);
  }, [updateConfig]);

  // Initialize on mount
  useEffect(() => {
    initializeV0SDK();

    // Listen for wallet changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          disconnectWeb3Wallet();
        } else {
          setWalletAddress(accounts[0]);
        }
      });

      window.ethereum.on('chainChanged', (chainId) => {
        const networkMap = {
          '0x1': 'ethereum',
          '0x89': 'polygon',
          '0xa4b1': 'arbitrum',
          '0xa': 'optimism',
        };
        setCurrentNetwork(networkMap[chainId] || 'ethereum');
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners();
      }
    };
  }, [initializeV0SDK, disconnectWeb3Wallet]);

  // Context value
  const value = {
    // Configuration
    config,
    updateConfig,
    updateChatConfig,
    updateUIConfig,
    updateWeb3Config,

    // V0 Chat SDK
    initializeV0SDK,
    isInitialized,
    connectionStatus,

    // Web3 Integration
    connectWeb3Wallet,
    disconnectWeb3Wallet,
    walletConnected,
    walletAddress,
    currentNetwork,

    // Error handling
    error,
    setError,

    // Helper methods
    isConnected: connectionStatus === 'connected',
    isConnecting: connectionStatus === 'connecting',
    isError: connectionStatus === 'error',
  };

  return (
    <V0ChatGPTContext.Provider value={value}>
      {children}
    </V0ChatGPTContext.Provider>
  );
};

export default V0ChatGPTProvider;
