import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSignUp, useSignIn } from '@clerk/clerk-react';
import '../styles/signUp.css';

export default function SignUp() {
  const navigate = useNavigate();
  const { signUp, setActive: setSignUpActive } = useSignUp();
  const { signIn, setActive: setSignInActive } = useSignIn();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);

  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email || !validateEmail(email)) {
      setError(email ? 'Invalid email' : 'Email required');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const result = await signUp.create({ emailAddress: email });
      if (result.status === 'missing_requirements') {
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      }
      setEmailSent(true);
      setPendingVerification(true);
    } catch (err) {
      if (err.errors?.[0]?.code === 'form_identifier_exists') {
        try {
          await signIn.create({ identifier: email, strategy: 'email_code' });
          await signIn.prepareFirstFactor({ strategy: 'email_code' });
          setEmailSent(true);
          setPendingVerification(true);
        } catch (e) {
          setError('Failed to send email');
        }
      } else {
        setError('Account error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    if (!verificationCode) { setError('Code required'); return; }
    setIsLoading(true);
    try {
      if (signUp?.verificationAttempt) {
        const result = await signUp.attemptEmailAddressVerification({ code: verificationCode });
        if (result.status === 'complete') {
          await setSignUpActive({ session: result.createdSessionId });
          navigate('/auth/onboarding');
          return;
        }
      }
      if (signIn) {
        const result = await signIn.attemptFirstFactor({ strategy: 'email_code', code: verificationCode });
        if (result.status === 'complete') {
          await setSignInActive({ session: result.createdSessionId });
          navigate('/auth/onboarding');
        }
      }
    } catch (err) {
      setError('Invalid code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider) => {
    try {
      await signUp.authenticateWithRedirect({
        strategy: oauth_,
        redirectUrl: '/auth/onboarding',
        redirectUrlComplete: '/auth/onboarding',
      });
    } catch (err) {
      setError(OAuth failed);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-left">
        <div className="branding-section">
          <div className="logo-large">nurds</div>
          <h1 className="tagline">Think It. Prompt It. Let's Build It.</h1>
        </div>
        <div className="illustration">
          <svg viewBox="0 0 400 500" className="tech-illustration">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#333" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="400" height="500" fill="url(#grid)" />
            <circle cx="80" cy="80" r="25" fill="none" stroke="#666" strokeWidth="2" />
            <rect x="180" y="60" width="80" height="50" fill="none" stroke="#666" strokeWidth="2" rx="4" />
            <polygon points="320,100 350,150 290,150" fill="none" stroke="#666" strokeWidth="2" />
            <line x1="105" y1="80" x2="180" y2="85" stroke="#444" strokeWidth="1" />
          </svg>
        </div>
        <div className="value-props">
          <p className="value-prop"><span className="checkmark"></span> Build apps in hours</p>
          <p className="value-prop"><span className="checkmark"></span> No setup. Just intent.</p>
          <p className="value-prop"><span className="checkmark"></span> Idea to deployed in 60 min</p>
        </div>
        <p className="footer-tagline">Minimal. Intentional. Clear.</p>
      </div>
      <div className="signup-right">
        <form onSubmit={emailSent && pendingVerification ? handleVerificationSubmit : handleEmailSubmit} className="signup-form">
          <div className="form-header">
            <h2 className="form-title">{emailSent && pendingVerification ? 'Check Email' : 'Create Account'}</h2>
            <p className="form-subtitle">{emailSent && pendingVerification ? 'Enter your code' : 'Choose signup method'}</p>
          </div>
          {emailSent && pendingVerification ? (
            <div className="verification-section">
              <input type="text" placeholder="000000" value={verificationCode} onChange={(e) => { setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }} maxLength="6" className="form-input" autoFocus disabled={isLoading} />
              {error && <p className="error-text">{error}</p>}
              <button type="submit" className="cta-button" disabled={isLoading || verificationCode.length !== 6}>{isLoading ? 'Verifying...' : 'Verify'}</button>
            </div>
          ) : (
            <>
              <div className="oauth-section">
                <button type="button" className="oauth-button oauth-google" onClick={() => handleOAuth('google')} disabled={isLoading}><span>Google</span></button>
                <button type="button" className="oauth-button oauth-github" onClick={() => handleOAuth('github')} disabled={isLoading}><span>GitHub</span></button>
                <button type="button" className="oauth-button oauth-linkedin" onClick={() => handleOAuth('linkedin')} disabled={isLoading}><span>LinkedIn</span></button>
              </div>
              <div className="divider-section"><span className="divider-text">or</span></div>
              <input id="email" type="email" placeholder="your@email.com" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} className={orm-input } disabled={isLoading} autoFocus />
              {error && <p className="error-text">{error}</p>}
              <button type="submit" className="cta-button" disabled={isLoading || !email}>{isLoading ? 'Sending...' : 'Continue'}</button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
