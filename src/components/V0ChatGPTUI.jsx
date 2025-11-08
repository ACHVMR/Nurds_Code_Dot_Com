/**
 * V0ChatGPTUI
 * Main chat interface component integrating v0 Chat SDK and ChainGPT UI
 */

import React, { useState, useRef, useEffect } from 'react';
import { useV0ChatGPT } from '../context/V0ChatGPTProvider';
import V0ChatHeader from './V0ChatGPT/V0ChatHeader';
import V0ChatSidebar from './V0ChatGPT/V0ChatSidebar';
import V0ChatMessages from './V0ChatGPT/V0ChatMessages';
import V0ChatInput from './V0ChatGPT/V0ChatInput';
import V0ChatWeb3Panel from './V0ChatGPT/V0ChatWeb3Panel';
import '../styles/v0-chaingpt-ui.css';

const V0ChatGPTUI = ({
  position = 'right',
  width = '400px',
  height = '600px',
  onMessage = null,
  onWalletConnect = null,
  theme = 'dark',
}) => {
  // Context
  const {
    config,
    connectionStatus,
    walletConnected,
    walletAddress,
    currentNetwork,
    connectWeb3Wallet,
    disconnectWeb3Wallet,
    error,
  } = useV0ChatGPT();

  // Local State
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showWeb3Panel, setShowWeb3Panel] = useState(false);
  const [selectedModel, setSelectedModel] = useState(config.v0.models.default);
  const containerRef = useRef(null);

  // Handle new message
  const handleSendMessage = async (content, attachments = []) => {
    try {
      setIsLoading(true);

      // Add user message to chat
      const userMessage = {
        id: Date.now(),
        role: 'user',
        content,
        attachments,
        timestamp: new Date().toISOString(),
        wallet: walletConnected ? walletAddress : null,
        network: currentNetwork,
      };

      setMessages((prev) => [...prev, userMessage]);

      // Call callback if provided
      if (onMessage) {
        onMessage(userMessage);
      }

      // Send to V0 API (in real implementation)
      const response = await fetch('/api/v0/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.v0.sdk.apiKey}`,
        },
        body: JSON.stringify({
          message: content,
          model: selectedModel,
          context: {
            walletAddress: walletConnected ? walletAddress : null,
            network: currentNetwork,
            previousMessages: messages.slice(-10), // Last 10 messages for context
          },
          attachments,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();

      // Add assistant message
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.content,
        timestamp: new Date().toISOString(),
        model: selectedModel,
        usage: data.usage,
        sources: data.sources || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('❌ Error sending message:', err);

      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        role: 'system',
        content: `Error: ${err.message}`,
        timestamp: new Date().toISOString(),
        type: 'error',
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle wallet connection
  const handleWalletConnect = async () => {
    try {
      const address = await connectWeb3Wallet();
      if (onWalletConnect) {
        onWalletConnect(address);
      }

      // Add system message
      const systemMessage = {
        id: Date.now(),
        role: 'system',
        content: `🔗 Wallet connected: ${address}`,
        timestamp: new Date().toISOString(),
        type: 'info',
      };
      setMessages((prev) => [...prev, systemMessage]);
    } catch (err) {
      console.error('Failed to connect wallet:', err);
    }
  };

  // Handle wallet disconnect
  const handleWalletDisconnect = () => {
    disconnectWeb3Wallet();
    const systemMessage = {
      id: Date.now(),
      role: 'system',
      content: '🔌 Wallet disconnected',
      timestamp: new Date().toISOString(),
      type: 'info',
    };
    setMessages((prev) => [...prev, systemMessage]);
  };

  // Render connection status
  if (connectionStatus === 'error' && config.v0.sdk.apiKey) {
    return (
      <div
        className={`v0-chaingpt-container v0-chaingpt-error ${isFullscreen ? 'fullscreen' : ''}`}
        style={{
          position: isFullscreen ? 'fixed' : 'relative',
          width: isFullscreen ? '100%' : width,
          height: isFullscreen ? '100%' : height,
          left: 0,
          top: 0,
          zIndex: isFullscreen ? 9999 : 'auto',
        }}
      >
        <div className="error-message">
          <h3>⚠️ Connection Error</h3>
          <p>{error || 'Failed to connect to V0 Chat Service'}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  // Minimize/Maximize
  if (isMinimized) {
    return (
      <div
        className={`v0-chaingpt-minimized ${position}`}
        onClick={() => setIsMinimized(false)}
      >
        <div className="minimized-button">
          <span>💬</span>
          {isLoading && <div className="loading-dot"></div>}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`v0-chaingpt-container ${theme} ${position} ${isFullscreen ? 'fullscreen' : ''}`}
      style={{
        position: isFullscreen ? 'fixed' : 'fixed',
        width: isFullscreen ? '100%' : width,
        height: isFullscreen ? '100%' : height,
        right: position === 'right' && !isFullscreen ? '20px' : undefined,
        left: position === 'left' && !isFullscreen ? '20px' : undefined,
        bottom: !isFullscreen ? '20px' : '0',
        zIndex: isFullscreen ? 9999 : 9998,
        borderRadius: config.chaingpt.layout.borderRadius,
      }}
    >
      {/* Header */}
      <V0ChatHeader
        connectionStatus={connectionStatus}
        walletConnected={walletConnected}
        walletAddress={walletAddress}
        currentNetwork={currentNetwork}
        onMinimize={() => setIsMinimized(true)}
        onMaximize={() => setIsFullscreen(!isFullscreen)}
        onWalletConnect={handleWalletConnect}
        onWalletDisconnect={handleWalletDisconnect}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        models={config.v0.models.available}
      />

      <div className="v0-chaingpt-body">
        {/* Sidebar */}
        {config.chaingpt.layout.enableSidebar && (
          <V0ChatSidebar
            messages={messages}
            sections={config.chaingpt.sidebar.sections}
            onSelectConversation={(conversation) => {
              setMessages(conversation.messages);
            }}
          />
        )}

        {/* Main Content */}
        <div className="v0-chaingpt-content">
          {/* Web3 Panel Toggle */}
          {config.web3.web3Components.enableWalletDisplay && (
            <button
              className="web3-panel-toggle"
              onClick={() => setShowWeb3Panel(!showWeb3Panel)}
              title="Toggle Web3 Panel"
            >
              {showWeb3Panel ? '✕' : '🔗'} Web3
            </button>
          )}

          {/* Web3 Panel */}
          {showWeb3Panel && walletConnected && (
            <V0ChatWeb3Panel
              walletAddress={walletAddress}
              network={currentNetwork}
              config={config.web3}
            />
          )}

          {/* Messages */}
          <V0ChatMessages
            messages={messages}
            isLoading={isLoading}
            config={config.chaingpt}
          />

          {/* Input */}
          <V0ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            walletConnected={walletConnected}
            onWalletConnect={handleWalletConnect}
            config={config.chaingpt}
            maxLength={config.chaingpt.input.maxLength}
          />
        </div>
      </div>
    </div>
  );
};

V0ChatGPTUI.defaultProps = {
  position: 'right',
  width: '400px',
  height: '600px',
  theme: 'dark',
};

export default V0ChatGPTUI;
