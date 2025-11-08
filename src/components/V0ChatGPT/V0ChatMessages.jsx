/**
 * V0ChatMessages
 * Message display component with markdown, code highlighting, and reactions
 */

import React, { useEffect, useRef } from 'react';
import { Copy, ThumbsUp, ThumbsDown, Share2, Pin } from 'lucide-react';

const V0ChatMessages = ({ messages, isLoading, config }) => {
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;

    return date.toLocaleDateString();
  };

  // Render markdown
  const renderMarkdown = (text) => {
    // Simple markdown rendering - in production use a library like react-markdown
    return (
      <div className="markdown-content">
        {text.split('\n').map((line, i) => {
          if (line.startsWith('#')) {
            const level = line.match(/^#+/)[0].length;
            const content = line.slice(level).trim();
            const Tag = `h${Math.min(level + 1, 6)}`;
            return <Tag key={i}>{content}</Tag>;
          }
          if (line.startsWith('-') || line.startsWith('*')) {
            return <li key={i}>{line.slice(1).trim()}</li>;
          }
          if (line.startsWith('```')) {
            return null; // Code blocks handled separately
          }
          return <p key={i}>{line}</p>;
        })}
      </div>
    );
  };

  // Render code block
  const renderCodeBlock = (code) => {
    return (
      <div className="code-block">
        <div className="code-header">
          <span className="code-language">code</span>
          <button
            className="code-copy"
            onClick={() => navigator.clipboard.writeText(code)}
            title="Copy code"
          >
            <Copy size={14} /> Copy
          </button>
        </div>
        <pre>
          <code>{code}</code>
        </pre>
      </div>
    );
  };

  // Render message
  const renderMessage = (message) => {
    const isUser = message.role === 'user';
    const isAssistant = message.role === 'assistant';
    const isSystem = message.role === 'system';

    return (
      <div
        key={message.id}
        className={`message ${message.role} ${message.type || ''}`}
      >
        {/* Avatar */}
        {!isUser && (
          <div className="message-avatar">
            {isAssistant && <span className="avatar-assistant">🤖</span>}
            {isSystem && <span className="avatar-system">ℹ️</span>}
          </div>
        )}

        {/* Content */}
        <div className="message-content">
          {/* Bubble */}
          <div className={`message-bubble ${config.chatInterface.bubbleStyle}`}>
            {message.type === 'error' ? (
              <div className="message-error">
                <strong>Error:</strong> {message.content}
              </div>
            ) : message.content.includes('```') ? (
              <>
                {message.content.split('```').map((block, i) => {
                  if (i % 2 === 0) {
                    return renderMarkdown(block);
                  }
                  return renderCodeBlock(block);
                })}
              </>
            ) : (
              renderMarkdown(message.content)
            )}

            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="message-attachments">
                {message.attachments.map((attachment, i) => (
                  <div key={i} className="attachment">
                    {attachment.type.startsWith('image/') ? (
                      <img src={attachment.url} alt="attachment" />
                    ) : (
                      <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                        📎 {attachment.name}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Metadata */}
            {(message.sources || message.usage) && (
              <div className="message-metadata">
                {message.sources && message.sources.length > 0 && (
                  <div className="sources">
                    <strong>Sources:</strong>
                    {message.sources.map((source, i) => (
                      <a key={i} href={source.url} target="_blank" rel="noopener noreferrer">
                        {source.title}
                      </a>
                    ))}
                  </div>
                )}
                {message.usage && (
                  <div className="usage">
                    <small>
                      Tokens: {message.usage.prompt_tokens} → {message.usage.completion_tokens}
                    </small>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Timestamp */}
          {config.status.enableTimestamps && (
            <span className="message-time">{formatTime(message.timestamp)}</span>
          )}

          {/* Actions */}
          {isAssistant && config.chatInterface.enableReactions && (
            <div className="message-actions">
              <button className="action-button like" title="Helpful">
                <ThumbsUp size={14} />
              </button>
              <button className="action-button dislike" title="Not helpful">
                <ThumbsDown size={14} />
              </button>
              <button className="action-button share" title="Share">
                <Share2 size={14} />
              </button>
              <button className="action-button pin" title="Pin">
                <Pin size={14} />
              </button>
            </div>
          )}
        </div>

        {/* User Avatar */}
        {isUser && (
          <div className="message-avatar">
            <span className="avatar-user">👤</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="v0-chat-messages">
      {messages.length === 0 ? (
        <div className="messages-empty">
          <div className="empty-icon">🤖</div>
          <h3>Welcome to ACHEEVY</h3>
          <p>Your Web3-enabled AI agent for smart contract analysis and DeFi guidance</p>
          <div className="quick-prompts">
            <button className="quick-prompt">
              📊 Analyze smart contract
            </button>
            <button className="quick-prompt">
              💰 DeFi yield strategies
            </button>
            <button className="quick-prompt">
              🔗 NFT valuation
            </button>
            <button className="quick-prompt">
              ⚡ Gas optimization
            </button>
          </div>
        </div>
      ) : (
        messages.map((message) => renderMessage(message))
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="message assistant loading">
          <div className="message-avatar">
            <span className="avatar-assistant">🤖</span>
          </div>
          <div className="message-content">
            <div className="message-bubble">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scroll target */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default V0ChatMessages;
