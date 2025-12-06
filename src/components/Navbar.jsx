import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useRole } from '../context/RoleContext';

/**
 * Navbar - Nurds Code IDE
 * 
 * Navigation for the Nurds Code IDE platform
 * The IDE is built on Cloudflare Vibecoding SDK
 * Deploy Platform is a SEPARATE connected platform
 */
function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { role, toggleRole, isOwner } = useRole();
  const location = useLocation();

  // Only show navbar on non-home pages (home has its own header)
  const isHomePage = location.pathname === '/';
  
  if (isHomePage) {
    return null; // Home page has its own integrated header
  }

  // Navigation items for Nurds Code IDE
  const navItems = [
    { path: '/', label: 'Hub', icon: '🏠' },
    { path: '/editor', label: 'Vibe Editor', icon: '</>', highlight: true },
    { path: '/workbench', label: 'Testing Lab', icon: '🧪' },
    { path: '/agents', label: 'Boomer_Angs', icon: '🤖' },
    { path: '/tools', label: 'Tool Catalog', icon: '🧰' },
    ...(isOwner ? [{ path: '/circuit-box', label: 'Circuit Box', icon: '⚡', highlight: true }] : []), // Conditional Admin Link
    { path: '/admin', label: 'Deploy →', icon: '🚀', isExternal: true },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav 
      className="sticky top-0 z-50"
      style={{ 
        background: 'rgba(5, 5, 5, 0.8)', 
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)' 
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div 
                className="text-xl font-bold transition-all group-hover:scale-105"
                style={{ 
                  color: '#00FF88',
                  textShadow: '0 0 20px rgba(0, 255, 136, 0.5)'
                }}
              >
                NurdsCode
              </div>
              <div 
                className="text-[10px] px-2 py-0.5 rounded tracking-wider uppercase"
                style={{ 
                  background: 'rgba(0, 255, 136, 0.15)',
                  color: '#00FF88',
                  border: '1px solid rgba(0, 255, 136, 0.3)'
                }}
              >
                IDE
              </div>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map(item => (
              <Link 
                key={item.path}
                to={item.path} 
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all text-sm font-medium ${
                  isActive(item.path) ? '' : 'hover:bg-white/5'
                }`}
                style={{
                  background: isActive(item.path) 
                    ? '#00FF88' 
                    : item.highlight 
                      ? 'rgba(0, 255, 136, 0.1)'
                      : 'transparent',
                  color: isActive(item.path) 
                    ? '#0a0f0a' 
                    : item.isExternal
                      ? '#00D4FF'
                      : item.highlight 
                        ? '#00FF88'
                        : '#A8D5A8',
                  border: item.highlight && !isActive(item.path) 
                    ? '1px solid rgba(0, 255, 136, 0.3)' 
                    : item.isExternal && !isActive(item.path)
                      ? '1px solid rgba(0, 212, 255, 0.3)'
                      : '1px solid transparent'
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
            
            {/* Role Toggle Switch (Dev Feature) */}
            <button
              onClick={toggleRole}
              className="ml-4 px-3 py-1 rounded-full text-xs font-bold border transition-all"
              style={{
                borderColor: isOwner ? '#00D4FF' : '#FF00FF',
                color: isOwner ? '#00D4FF' : '#FF00FF',
                background: isOwner ? 'rgba(0, 212, 255, 0.1)' : 'rgba(255, 0, 255, 0.1)'
              }}
              title="Toggle Platform Role"
            >
              {isOwner ? '👑 OWNER' : '👤 USER'}
            </button>
            
            {/* Chat with ACHEEVY button */}
            <button 
              className="ml-4 px-5 py-2 rounded-full font-medium transition-all hover:scale-105 flex items-center gap-2 text-sm"
              style={{ 
                background: 'var(--surface)',
                color: 'var(--neon-green)',
                border: '1px solid var(--neon-green)',
                boxShadow: '0 0 10px rgba(0, 255, 136, 0.2)'
              }}
            >
              <span>🎤</span>
              <span>ACHEEVY</span>
            </button>
          </div>

          {/* Profile Menu */}
          <div className="hidden md:block relative">
            <button 
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{ 
                background: 'linear-gradient(135deg, #00FF88, #00CC66)',
                boxShadow: '0 0 15px rgba(0, 255, 136, 0.3)'
              }}
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <span className="text-black text-sm">👤</span>
            </button>
            
            {showProfileMenu && (
              <div 
                className="absolute right-0 top-12 w-48 rounded-xl py-2 z-50"
                style={{ 
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  backdropFilter: 'blur(12px)'
                }}
              >
                <Link 
                  to="/settings" 
                  className="block px-4 py-2 hover:bg-white/10 flex items-center gap-2 text-sm"
                  style={{ color: '#E8F5E9' }}
                >
                  ⚙️ Account Settings
                </Link>
                <Link 
                  to="/workbench" 
                  className="block px-4 py-2 hover:bg-white/10 flex items-center gap-2 text-sm"
                  style={{ color: '#E8F5E9' }}
                >
                  🔧 Workbench
                </Link>
                <button 
                  className="w-full text-left px-4 py-2 hover:bg-white/10 flex items-center gap-2 text-sm"
                  style={{ color: '#E8F5E9' }}
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg transition-colors"
              style={{ color: '#00FF88' }}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div 
          className="md:hidden"
          style={{ 
            background: 'var(--bg)', 
            borderTop: '1px solid var(--border)' 
          }}
        >
          <div className="px-4 py-4 space-y-2">
            {navItems.map(item => (
              <Link 
                key={item.path}
                to={item.path} 
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${
                  isActive(item.path) ? '' : ''
                }`}
                style={{
                  background: isActive(item.path) ? '#00FF88' : 'transparent',
                  color: isActive(item.path) ? '#0a0f0a' : '#A8D5A8'
                }}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
            
            {/* Mobile ACHEEVY button */}
            <button
              onClick={() => setIsOpen(false)}
              className="w-full text-center px-4 py-3 rounded-lg font-medium mt-4 flex items-center justify-center gap-2"
              style={{ 
                background: 'var(--surface)',
                color: 'var(--neon-green)',
                border: '1px solid var(--neon-green)'
              }}
            >
              <span>🎤</span>
              <span>Chat with ACHEEVY</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
