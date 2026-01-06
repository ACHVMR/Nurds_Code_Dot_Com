import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './TestingLab.css';

/**
 * Testing Lab - Prompt-based Testing Interface
 * Users describe what they want to test, AI runs the tests
 */
export default function TestingLab() {
  const [prompt, setPrompt] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState([]);

  const handleTest = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || isRunning) return;

    setIsRunning(true);
    setTestResults(prev => [...prev, { type: 'user', content: prompt }]);
    setPrompt('');

    // Simulate test execution
    await new Promise(r => setTimeout(r, 2000));
    
    setTestResults(prev => [...prev, {
      type: 'result',
      content: `Test executed for: "${prompt}"`,
      passed: Math.random() > 0.3,
      details: [
        '✓ Syntax validation passed',
        '✓ Dependencies resolved',
        '✓ Build successful',
        Math.random() > 0.3 ? '✓ All tests passed' : '✗ 2 tests failed'
      ]
    }]);

    setIsRunning(false);
  };

  return (
    <div className="testing-lab dots-bg">
      {/* Navigation */}
      <nav className="lab-nav">
        <Link to="/" className="nav-logo">
          <span>Nurds</span>
          <span className="accent">Code</span>
        </Link>
        <div className="nav-links">
          <Link to="/">Hub</Link>
          <Link to="/code">Prompt to Code</Link>
          <Link to="/vibe/editor">V.I.B.E.</Link>
          <Link to="/testing-lab" className="active">Testing Lab</Link>
          <Link to="/agents">Boomer_Angs</Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="lab-content">
        <div className="lab-header animate-fade-in">
          <div className="dot-grid">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
          <h1>Testing Lab</h1>
          <p>Describe what you want to test. AI will run it.</p>
        </div>

        {/* Results Area */}
        <div className="results-area">
          {testResults.length === 0 ? (
            <div className="empty-results animate-fade-in">
              <div className="empty-icon">🧪</div>
              <h3>No tests yet</h3>
              <p>Type a prompt below to test code, packages, or plugins</p>
            </div>
          ) : (
            testResults.map((result, i) => (
              <div key={i} className={`result-item ${result.type} animate-fade-in`}>
                {result.type === 'user' ? (
                  <div className="user-prompt">{result.content}</div>
                ) : (
                  <div className={`test-result ${result.passed ? 'passed' : 'failed'}`}>
                    <div className="result-header">
                      <span className="result-status">
                        {result.passed ? '✓ PASSED' : '✗ FAILED'}
                      </span>
                    </div>
                    <div className="result-details">
                      {result.details.map((detail, j) => (
                        <div key={j} className="detail-line">{detail}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
          
          {isRunning && (
            <div className="running-indicator animate-fade-in">
              <div className="spinner"></div>
              <span>Running tests...</span>
            </div>
          )}
        </div>

        {/* Prompt Input */}
        <form className="lab-prompt-form" onSubmit={handleTest}>
          <div className="prompt-box">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want to test (e.g., 'Test this React component for accessibility')"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleTest(e);
                }
              }}
            />
            <button type="submit" disabled={isRunning || !prompt.trim()}>
              {isRunning ? '...' : '→'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
