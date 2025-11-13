/**
 * OAuth Callback Handler
 * Processes OAuth tokens from URL and stores them securely
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { extractSessionFromURL, storeOAuthSession } from '../utils/oauthSession';

function OAuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        setStatus('processing');
        
        // Extract session data from URL
        const sessionData = extractSessionFromURL();
        
        if (!sessionData) {
          setError('Invalid or missing authentication token');
          setStatus('error');
          return;
        }

        // Store session securely
        const stored = storeOAuthSession(sessionData);
        
        if (!stored) {
          setError('Failed to store authentication session');
          setStatus('error');
          return;
        }

        setStatus('success');
        
        // Redirect to onboarding after a brief delay
        setTimeout(() => {
          navigate('/auth/onboarding');
        }, 1500);

      } catch (err) {
        console.error('OAuth callback error:', err);
        setError('Authentication failed. Please try again.');
        setStatus('error');
      }
    };

    handleOAuthCallback();
  }, [navigate]);

  const handleRetry = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-900 border border-gray-700 rounded-lg p-8 text-center">
        {status === 'processing' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E68961] mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-white mb-2">Processing Authentication</h2>
            <p className="text-gray-400">Please wait while we complete your sign-in...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <h2 className="text-xl font-bold text-white mb-2">Authentication Successful</h2>
            <p className="text-gray-400">Redirecting you to the onboarding...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-red-500 text-5xl mb-4">✗</div>
            <h2 className="text-xl font-bold text-white mb-2">Authentication Failed</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              onClick={handleRetry}
              className="bg-[#E68961] text-black px-6 py-2 rounded font-semibold hover:bg-[#E68961]/90 transition-colors"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default OAuthCallback;