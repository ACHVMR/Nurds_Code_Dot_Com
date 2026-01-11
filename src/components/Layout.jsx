import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

/**
 * Layout Component - Nurds Code VibeSDK Theme
 * Obsidian dark background with neon green/cyan accents
 */
const Layout = ({ children, isSignedIn, user }) => {
  return (
    <div className="min-h-screen flex flex-col" style={{ 
      background: 'linear-gradient(180deg, #0A1628 0%, #0F1A2B 50%, #0A1628 100%)',
      color: '#E2E8F0'
    }}>
      <Navbar isSignedIn={isSignedIn} user={user} />
      <main className="flex-1 pt-16">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
