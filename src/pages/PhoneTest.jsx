import React, { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import './PhoneTest.css';

const PhoneTest = () => {
  const { isSignedIn } = useAuth();
  const [testResults, setTestResults] = useState({
    nxtl: { tested: false, chirp: false, voice: false, text: false },
    blkbrry: { tested: false, click: false, keyboard: false, send: false },
    tchscrn: { tested: false, ui: false, bubbles: false, mic: false },
    rcrdbx: { tested: false, reels: false, rec: false, led: false },
    clssc: { tested: false, chat: false, timestamps: false, voice: false },
    nurdchat: { tested: false, loaded: false, functional: false }
  });

  const markTest = (phone, feature, value) => {
    setTestResults(prev => ({
      ...prev,
      [phone]: {
        ...prev[phone],
        tested: true,
        [feature]: value
      }
    }));
  };

  const getTestStatus = (phone) => {
    const tests = testResults[phone];
    if (!tests.tested) return '⏳';
    const features = Object.entries(tests).filter(([key]) => key !== 'tested');
    const allPassed = features.every(([_, value]) => value === true);
    return allPassed ? '✅' : '❌';
  };

  if (!isSignedIn) {
    return (
      <div className="test-container">
        <h2>Please sign in to test phones</h2>
      </div>
    );
  }

  return (
    <div className="phone-test-container">
      <h1>📱 Phone Interface Test Dashboard</h1>
      
      <div className="test-grid">
        {/* Nxtl Test */}
        <div className="test-card">
          <h3>📱 Nxtl (Nextel)</h3>
          <div className="test-status">{getTestStatus('nxtl')}</div>
          <div className="test-checklist">
            <label>
              <input 
                type="checkbox" 
                onChange={(e) => markTest('nxtl', 'chirp', e.target.checked)}
              />
              Chirp sound plays
            </label>
            <label>
              <input 
                type="checkbox"
                onChange={(e) => markTest('nxtl', 'voice', e.target.checked)}
              />
              Push-to-talk works
            </label>
            <label>
              <input 
                type="checkbox"
                onChange={(e) => markTest('nxtl', 'text', e.target.checked)}
              />
              Text input fallback
            </label>
          </div>
        </div>

        {/* BlkBrry Test */}
        <div className="test-card">
          <h3>🔒 BlkBrry (BlackBerry)</h3>
          <div className="test-status">{getTestStatus('blkbrry')}</div>
          <div className="test-checklist">
            <label>
              <input 
                type="checkbox"
                onChange={(e) => markTest('blkbrry', 'click', e.target.checked)}
              />
              Click sound on keys
            </label>
            <label>
              <input 
                type="checkbox"
                onChange={(e) => markTest('blkbrry', 'keyboard', e.target.checked)}
              />
              QWERTY keyboard visible
            </label>
            <label>
              <input 
                type="checkbox"
                onChange={(e) => markTest('blkbrry', 'send', e.target.checked)}
              />
              SEND button works
            </label>
          </div>
        </div>

        {/* IPhne Test */}
        <div className="test-card">
          <h3>📲 IPhne (iPhone)</h3>
          <div className="test-status">{getTestStatus('tchscrn')}</div>
          <div className="test-checklist">
            <label>
              <input 
                type="checkbox"
                onChange={(e) => markTest('tchscrn', 'ui', e.target.checked)}
              />
              iOS-style interface
            </label>
            <label>
              <input 
                type="checkbox"
                onChange={(e) => markTest('tchscrn', 'bubbles', e.target.checked)}
              />
              Bubble messages
            </label>
            <label>
              <input 
                type="checkbox"
                onChange={(e) => markTest('tchscrn', 'mic', e.target.checked)}
              />
              Mic button records
            </label>
          </div>
        </div>

        {/* V.RCRDR Test */}
        <div className="test-card">
          <h3>📼 V.RCRDR (Recorder)</h3>
          <div className="test-status">{getTestStatus('rcrdbx')}</div>
          <div className="test-checklist">
            <label>
              <input 
                type="checkbox"
                onChange={(e) => markTest('rcrdbx', 'reels', e.target.checked)}
              />
              Tape reels visible
            </label>
            <label>
              <input 
                type="checkbox"
                onChange={(e) => markTest('rcrdbx', 'rec', e.target.checked)}
              />
              REC button works
            </label>
            <label>
              <input 
                type="checkbox"
                onChange={(e) => markTest('rcrdbx', 'led', e.target.checked)}
              />
              LED display shows status
            </label>
          </div>
        </div>

        {/* Clssc Test */}
        <div className="test-card">
          <h3>💬 Clssc (Classic)</h3>
          <div className="test-status">{getTestStatus('clssc')}</div>
          <div className="test-checklist">
            <label>
              <input 
                type="checkbox"
                onChange={(e) => markTest('clssc', 'chat', e.target.checked)}
              />
              Chat interface loads
            </label>
            <label>
              <input 
                type="checkbox"
                onChange={(e) => markTest('clssc', 'timestamps', e.target.checked)}
              />
              Timestamps visible
            </label>
            <label>
              <input 
                type="checkbox"
                onChange={(e) => markTest('clssc', 'voice', e.target.checked)}
              />
              Voice and text work
            </label>
          </div>
        </div>

        {/* CHIRP Test */}
        <div className="test-card">
          <h3>🔊 CHIRP (NurdChat)</h3>
          <div className="test-status">{getTestStatus('nurdchat')}</div>
          <div className="test-checklist">
            <label>
              <input 
                type="checkbox"
                onChange={(e) => markTest('nurdchat', 'loaded', e.target.checked)}
              />
              Interface loads
            </label>
            <label>
              <input 
                type="checkbox"
                onChange={(e) => markTest('nurdchat', 'functional', e.target.checked)}
              />
              All features work
            </label>
          </div>
        </div>
      </div>

      <div className="test-summary">
        <h2>Test Summary</h2>
        <div className="summary-stats">
          <div>Total Phones: 6</div>
          <div>Tested: {Object.values(testResults).filter(t => t.tested).length}</div>
          <div>Passed: {Object.keys(testResults).filter(k => getTestStatus(k) === '✅').length}</div>
          <div>Failed: {Object.keys(testResults).filter(k => getTestStatus(k) === '❌').length}</div>
        </div>
        
        <button 
          className="export-btn"
          onClick={() => {
            const report = JSON.stringify(testResults, null, 2);
            console.log('Test Report:', report);
            navigator.clipboard.writeText(report);
            alert('Test report copied to clipboard!');
          }}
        >
          📋 Export Test Report
        </button>
      </div>
    </div>
  );
};

export default PhoneTest;
