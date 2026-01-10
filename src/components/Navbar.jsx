import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, UserButton } from '@clerk/clerk-react';
import TokenBalance from './TokenBalance';
import VoiceRecorder from './VoiceRecorder';
// import './Navbar.css';

const Navbar = ({ isSignedIn = false, user = null }) => {
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const isSuperAdmin = user?.emailAddresses?.[0]?.emailAddress === 'owner@nurdscode.com';

  return (
    <>
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            <img 
              src="/assets/branding/IMG_1836.PNG" 
              alt="NURDS CODE" 
              className="h-10 w-auto object-contain" 
            />
          </Link>

          <div className="nav-actions">
            {/* Start Your Journey CTA - Always Visible in Header */}
            {!isSignedIn && (
              <Link 
                to="/auth/signup" 
                className="btn-primary text-sm px-6 py-2 rounded-lg hover:shadow-lg transition-all"
                style={{ backgroundColor: '#FF6B00', color: 'black', fontWeight: '600' }}
              >
                Get Started
              </Link>
            )}

            {isSignedIn ? (
              <>
                {/* Audio Settings Link */}
                <Link 
                  to="/audio-settings"
                  className="nav-link"
                  title="Audio Settings"
                >
                  🔊
                </Link>

                <button 
                  className="voice-launcher"
                  onClick={() => setShowVoiceModal(true)}
                  title="Voice Command"
                >
                  🎤
                </button>
                
                {/* <TokenBalance /> */}
                
                {isSuperAdmin && (
                  <Link to="/admin" className="admin-link">
                    Admin
                  </Link>
                )}
                
                {/* Only show UserButton if Clerk is available */}
                {typeof UserButton !== 'undefined' ? (
                  <UserButton afterSignOutUrl="/" />
                ) : (
                  <button className="nav-cta" onClick={() => console.log('Sign out clicked')}>
                    Sign Out
                  </button>
                )}
              </>
            ) : (
              <Link to="/auth" className="nav-cta">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Voice Modal */}
      {showVoiceModal && (
        <div className="voice-modal-overlay" onClick={() => setShowVoiceModal(false)}>
          <div className="voice-modal" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close"
              onClick={() => setShowVoiceModal(false)}
            >
              ✕
            </button>
            <h2>🎤 What would you like to build?</h2>
            {/* <VoiceRecorder 
              autoStart={true}
              onTranscript={(transcript) => {
                console.log('Voice command:', transcript);
                setShowVoiceModal(false);
                // Navigate to ACHEEVY with custom intent
                window.location.href = `/acheevy?intent=${encodeURIComponent(transcript)}`;
              }} */}
            <div>Voice Recorder Disabled</div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
