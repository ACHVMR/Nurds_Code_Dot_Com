import React, { useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * Navbar Component - Nurds Code VibeSDK Theme
 * Fixed navbar with neon green/cyan accents on obsidian background
 */
const Navbar = ({ isSignedIn = false, user = null }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50" style={{
      background: 'rgba(10, 22, 40, 0.95)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(0, 255, 65, 0.2)'
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span style={{ 
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '1.25rem',
              fontWeight: 700,
              color: '#00FF41'
            }}>
              NURDS<span style={{ color: '#FF6B35' }}>CODE</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/editor" className="text-sm hover:text-[#00FF41] transition-colors" style={{ color: '#E2E8F0' }}>
              Editor
            </Link>
            <Link to="/pricing" className="text-sm hover:text-[#00FF41] transition-colors" style={{ color: '#E2E8F0' }}>
              Pricing
            </Link>
            <Link to="/chat-acheevy" className="text-sm hover:text-[#00FF41] transition-colors" style={{ color: '#E2E8F0' }}>
              ACHEEVY
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            {isSignedIn ? (
              <>
                <Link to="/dashboard" className="px-4 py-2 text-sm rounded-lg transition-all" style={{
                  background: 'transparent',
                  border: '1px solid #00FF41',
                  color: '#00FF41'
                }}>
                  Dashboard
                </Link>
                <button className="px-4 py-2 text-sm rounded-lg transition-all" style={{
                  background: '#FF6B35',
                  color: '#0A1628',
                  fontWeight: 600
                }}>
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/auth" className="px-4 py-2 text-sm rounded-lg transition-all hover:opacity-80" style={{
                  background: 'transparent',
                  border: '1px solid #00D4FF',
                  color: '#00D4FF'
                }}>
                  Sign In
                </Link>
                <Link to="/auth/signup" className="px-4 py-2 text-sm rounded-lg transition-all hover:opacity-90" style={{
                  background: '#FF6B35',
                  color: '#0A1628',
                  fontWeight: 600
                }}>
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
