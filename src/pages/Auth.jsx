import React from 'react';
import '../styles/signUp.css';

function Auth() {
  const startOAuth = (provider) => {
    // Frontend just redirects to the worker endpoint which starts the OAuth flow
    // Worker will redirect to the provider's authorization URL
    window.location.href = `/api/auth/${provider}`;
  };

  return (
    <div className="signup-container">
      <div className="signup-right">
        <div className="form-header">
          <h2 className="form-title">Sign in / Sign up</h2>
          <p className="form-subtitle">Use Google or GitHub to continue</p>
        </div>

        <div className="oauth-section" style={{ display: 'flex', gap: '0.75rem', flexDirection: 'column' }}>
          <button type="button" className="oauth-button oauth-google" onClick={() => startOAuth('google')}>Continue with Google</button>
          <button type="button" className="oauth-button oauth-github" onClick={() => startOAuth('github')}>Continue with GitHub</button>
        </div>

        <div style={{ marginTop: '1.25rem', color: '#aaa' }}>
          <p>If you prefer email-based magic links, visit <a href="/auth/signup">Email sign up</a>.</p>
        </div>
      </div>
    </div>
  );
}

export default Auth;
