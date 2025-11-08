/**
 * V0ChatSidebar
 * Sidebar component with history, bookmarks, templates, Web3 tools
 */

import React, { useState } from 'react';
import { ChevronDown, Trash2, Star, Copy } from 'lucide-react';

const V0ChatSidebar = ({ messages, sections, onSelectConversation }) => {
  const [expandedSections, setExpandedSections] = useState({
    history: true,
    bookmarks: false,
    templates: false,
    web3: true,
    settings: false,
  });

  const [bookmarks, setBookmarks] = useState([]);
  const [templates] = useState([
    {
      id: 1,
      title: 'Smart Contract Audit',
      prompt: 'Please analyze this smart contract for security vulnerabilities and gas optimization opportunities:',
      category: 'contracts',
    },
    {
      id: 2,
      title: 'DeFi Yield Farming',
      prompt: 'What are the current best practices for yield farming on [PROTOCOL]? Include risks and gas costs:',
      category: 'defi',
    },
    {
      id: 3,
      title: 'NFT Valuation',
      prompt: 'Help me understand the valuation metrics for this NFT collection:',
      category: 'nft',
    },
    {
      id: 4,
      title: 'Transaction Analysis',
      prompt: 'Analyze this transaction for any suspicious activity or potential vulnerabilities:',
      category: 'transactions',
    },
    {
      id: 5,
      title: 'Gas Optimization',
      prompt: 'How can I optimize the gas usage for this function?',
      category: 'contracts',
    },
  ]);

  const [conversations, setConversations] = useState([
    {
      id: 1,
      title: 'AAVE V3 Protocol Review',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      messageCount: 12,
      bookmarked: false,
    },
    {
      id: 2,
      title: 'Uniswap Gas Optimization',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      messageCount: 8,
      bookmarked: true,
    },
    {
      id: 3,
      title: 'Ethereum L2 Comparison',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      messageCount: 15,
      bookmarked: false,
    },
  ]);

  const [web3Tools] = useState([
    {
      id: 'wallet',
      name: 'Wallet Inspector',
      description: 'Analyze wallet activity and holdings',
      icon: '💼',
    },
    {
      id: 'transactions',
      name: 'Transaction Decoder',
      description: 'Decode and analyze transactions',
      icon: '⛓️',
    },
    {
      id: 'contracts',
      name: 'Contract Explorer',
      description: 'Explore verified contracts',
      icon: '📜',
    },
    {
      id: 'tokens',
      name: 'Token Analyzer',
      description: 'Analyze token metrics and risks',
      icon: '🪙',
    },
  ]);

  // Toggle section
  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // Bookmark conversation
  const toggleBookmark = (conversationId) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId ? { ...conv, bookmarked: !conv.bookmarked } : conv
      )
    );
  };

  // Delete conversation
  const deleteConversation = (conversationId) => {
    setConversations((prev) => prev.filter((conv) => conv.id !== conversationId));
  };

  // Format time
  const formatTime = (date) => {
    const now = new Date();
    const diff = now - date;

    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;

    return date.toLocaleDateString();
  };

  // Render section
  const renderSection = (section) => {
    const isExpanded = expandedSections[section.id];

    if (section.id === 'history') {
      return (
        <div key={section.id} className="sidebar-section">
          <button
            className="section-header"
            onClick={() => toggleSection(section.id)}
          >
            <ChevronDown
              size={16}
              style={{
                transform: isExpanded ? 'rotate(0)' : 'rotate(-90deg)',
              }}
            />
            <span>{section.title}</span>
            <span className="section-count">{conversations.length}</span>
          </button>

          {isExpanded && (
            <div className="section-content">
              {conversations.length === 0 ? (
                <div className="empty-state">No conversations yet</div>
              ) : (
                <div className="conversation-list">
                  {conversations.map((conv) => (
                    <div
                      key={conv.id}
                      className="conversation-item"
                      onClick={() => onSelectConversation(conv)}
                    >
                      <div className="conversation-info">
                        <h4>{conv.title}</h4>
                        <p className="conversation-meta">
                          {conv.messageCount} messages • {formatTime(conv.timestamp)}
                        </p>
                      </div>
                      <div className="conversation-actions">
                        <button
                          className={`bookmark-btn ${conv.bookmarked ? 'active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmark(conv.id);
                          }}
                        >
                          <Star size={14} />
                        </button>
                        <button
                          className="delete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteConversation(conv.id);
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    if (section.id === 'bookmarks') {
      const bookmarkedConversations = conversations.filter((c) => c.bookmarked);
      return (
        <div key={section.id} className="sidebar-section">
          <button
            className="section-header"
            onClick={() => toggleSection(section.id)}
          >
            <ChevronDown
              size={16}
              style={{
                transform: isExpanded ? 'rotate(0)' : 'rotate(-90deg)',
              }}
            />
            <span>{section.title}</span>
            <span className="section-count">{bookmarkedConversations.length}</span>
          </button>

          {isExpanded && (
            <div className="section-content">
              {bookmarkedConversations.length === 0 ? (
                <div className="empty-state">No bookmarks yet</div>
              ) : (
                <div className="conversation-list">
                  {bookmarkedConversations.map((conv) => (
                    <div key={conv.id} className="conversation-item">
                      <div className="conversation-info">
                        <h4>{conv.title}</h4>
                        <p className="conversation-meta">
                          {conv.messageCount} messages
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    if (section.id === 'templates') {
      return (
        <div key={section.id} className="sidebar-section">
          <button
            className="section-header"
            onClick={() => toggleSection(section.id)}
          >
            <ChevronDown
              size={16}
              style={{
                transform: isExpanded ? 'rotate(0)' : 'rotate(-90deg)',
              }}
            />
            <span>{section.title}</span>
            <span className="section-count">{templates.length}</span>
          </button>

          {isExpanded && (
            <div className="section-content">
              <div className="template-list">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    className="template-item"
                    title={template.prompt}
                  >
                    <div className="template-header">
                      <h4>{template.title}</h4>
                      <span className="template-category">{template.category}</span>
                    </div>
                    <p className="template-preview">{template.prompt.slice(0, 60)}...</p>
                    <div className="template-action">
                      <Copy size={14} /> Use
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (section.id === 'web3') {
      return (
        <div key={section.id} className="sidebar-section web3-section">
          <button
            className="section-header"
            onClick={() => toggleSection(section.id)}
          >
            <ChevronDown
              size={16}
              style={{
                transform: isExpanded ? 'rotate(0)' : 'rotate(-90deg)',
              }}
            />
            <span>{section.title}</span>
            <span className="section-count">{web3Tools.length}</span>
          </button>

          {isExpanded && (
            <div className="section-content">
              <div className="web3-tools">
                {web3Tools.map((tool) => (
                  <button key={tool.id} className="web3-tool">
                    <div className="tool-icon">{tool.icon}</div>
                    <div className="tool-info">
                      <h4>{tool.name}</h4>
                      <p>{tool.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (section.id === 'settings') {
      return (
        <div key={section.id} className="sidebar-section">
          <button
            className="section-header"
            onClick={() => toggleSection(section.id)}
          >
            <ChevronDown
              size={16}
              style={{
                transform: isExpanded ? 'rotate(0)' : 'rotate(-90deg)',
              }}
            />
            <span>{section.title}</span>
          </button>

          {isExpanded && (
            <div className="section-content">
              <div className="settings-list">
                <button className="setting-item">
                  <span>🎨 Theme</span>
                  <span className="setting-value">Dark</span>
                </button>
                <button className="setting-item">
                  <span>🔔 Notifications</span>
                  <span className="setting-value">On</span>
                </button>
                <button className="setting-item">
                  <span>🔒 Privacy</span>
                  <span className="setting-value">Strict</span>
                </button>
                <button className="setting-item">
                  <span>📊 Analytics</span>
                  <span className="setting-value">Off</span>
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="v0-chat-sidebar">
      <div className="sidebar-header">
        <h2>☰ Menu</h2>
      </div>

      <div className="sidebar-sections">
        {sections.map((section) => renderSection(section))}
      </div>

      <div className="sidebar-footer">
        <small>© 2025 ACHEEVY AI</small>
      </div>
    </div>
  );
};

export default V0ChatSidebar;
