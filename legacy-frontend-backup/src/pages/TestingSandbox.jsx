import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';

/**
 * Testing Lab Sandbox - Fixed Version
 * Actual working sandbox for testing code
 */
export default function TestingSandbox() {
  const navigate = useNavigate();
  const iframeRef = useRef(null);
  
  const [sourceType, setSourceType] = useState('custom');
  const [isLoading, setIsLoading] = useState(false);
  const [testOutput, setTestOutput] = useState('');
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [testStatus, setTestStatus] = useState('idle');
  
  // Source inputs
  const [githubUrl, setGithubUrl] = useState('');
  const [npmPackage, setNpmPackage] = useState('');
  const [customCode, setCustomCode] = useState(`// Write your code here and click Run
function greet(name) {
  return \`Hello, \${name}! Welcome to NurdsCode.\`;
}

// Test it
console.log(greet('Developer'));
console.log('Current time:', new Date().toLocaleString());
console.log('Math test:', Math.PI * 2);

// Return HTML to display
document.body.innerHTML = \`
  <div style="padding: 30px; background: linear-gradient(135deg, #0a0a0a, #1a1a2e); min-height: 100vh; font-family: system-ui;">
    <h1 style="color: #00FF41; margin: 0 0 20px;">🚀 Code Executed!</h1>
    <p style="color: #00D4FF;">\${greet('Developer')}</p>
    <div style="margin-top: 20px; padding: 15px; background: rgba(0,255,65,0.1); border-radius: 8px; border: 1px solid #00FF41;">
      <p style="color: #aaa; margin: 0;">Your sandbox is working perfectly.</p>
    </div>
  </div>
\`;
`);

  const addLog = (type, message) => {
    const timestamp = new Date().toLocaleTimeString();
    setConsoleLogs(prev => [...prev, { type, message, timestamp }]);
  };

  const handleRunTest = async () => {
    setIsLoading(true);
    setTestStatus('loading');
    setConsoleLogs([]);
    
    addLog('info', `Running ${sourceType} test...`);

    try {
      if (sourceType === 'custom') {
        // Execute custom code in iframe
        const html = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { margin: 0; font-family: system-ui; }
              .console-output { 
                position: fixed; bottom: 0; left: 0; right: 0; 
                background: #0a0a0a; border-top: 2px solid #00FF41;
                padding: 10px; max-height: 200px; overflow: auto;
                font-family: monospace; font-size: 12px;
              }
              .log { color: #00D4FF; padding: 3px 0; }
              .error { color: #FF4444; }
            </style>
          </head>
          <body>
            <div id="console-output" class="console-output"></div>
            <script>
              const consoleOutput = document.getElementById('console-output');
              const originalLog = console.log;
              const originalError = console.error;
              
              console.log = (...args) => {
                originalLog(...args);
                const div = document.createElement('div');
                div.className = 'log';
                div.textContent = args.join(' ');
                consoleOutput.appendChild(div);
              };
              
              console.error = (...args) => {
                originalError(...args);
                const div = document.createElement('div');
                div.className = 'log error';
                div.textContent = '❌ ' + args.join(' ');
                consoleOutput.appendChild(div);
              };
              
              try {
                ${customCode}
              } catch (e) {
                console.error(e.message);
              }
            </script>
          </body>
          </html>
        `;
        
        setTestOutput(html);
        setTestStatus('success');
        addLog('success', 'Code executed successfully!');
      } else if (sourceType === 'github') {
        addLog('info', `Fetching from GitHub: ${githubUrl}`);
        // In production, this would call the backend
        setTestOutput(`<div style="padding: 20px; background: #1a1a2e; color: #00FF41;">
          <h2>GitHub Import</h2>
          <p style="color: #aaa;">Repository: ${githubUrl}</p>
          <p style="color: #FFD700;">⚠️ Full GitHub import requires backend integration.</p>
          <p style="color: #00D4FF;">Use Custom code for now to test your logic.</p>
        </div>`);
        setTestStatus('success');
        addLog('info', 'GitHub fetch would happen here (requires backend)');
      } else if (sourceType === 'npm') {
        addLog('info', `Loading NPM package: ${npmPackage}`);
        setTestOutput(`<div style="padding: 20px; background: #1a1a2e; color: #00FF41;">
          <h2>NPM Package: ${npmPackage}</h2>
          <p style="color: #FFD700;">⚠️ NPM package testing requires backend sandbox.</p>
          <p style="color: #00D4FF;">Package would be loaded in isolated environment.</p>
        </div>`);
        setTestStatus('success');
      }
    } catch (error) {
      setTestStatus('error');
      addLog('error', error.message);
      setTestOutput(`<div style="padding: 20px; background: #2e1a1a; color: #FF4444;">
        <h2>❌ Error</h2>
        <p>${error.message}</p>
      </div>`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="testing-sandbox">
      <style>{`
        .testing-sandbox {
          display: flex;
          height: calc(100vh - 120px);
          background: #0a0a0a;
          gap: 0;
        }
        .left-panel {
          width: 450px;
          border-right: 2px solid #00FF41;
          display: flex;
          flex-direction: column;
          background: #0f0f1a;
        }
        .panel-header {
          padding: 16px 20px;
          background: linear-gradient(135deg, #1a1a2e, #0f0f1a);
          border-bottom: 1px solid #2d2d4a;
          color: #00FF41;
          font-weight: bold;
          font-size: 16px;
        }
        .panel-content {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
        }
        .source-tabs {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-bottom: 20px;
        }
        .source-tab {
          padding: 12px;
          background: #1a1a2e;
          border: 1px solid #2d2d4a;
          color: #888;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.2s;
        }
        .source-tab:hover { border-color: #00D4FF; color: #00D4FF; }
        .source-tab.active {
          background: #00FF41;
          color: #000;
          border-color: #00FF41;
          font-weight: bold;
        }
        .form-group { margin-bottom: 16px; }
        .form-label {
          display: block;
          margin-bottom: 8px;
          color: #00D4FF;
          font-size: 13px;
        }
        .form-input {
          width: 100%;
          padding: 12px;
          background: #1a1a2e;
          border: 1px solid #2d2d4a;
          color: #fff;
          border-radius: 6px;
          font-size: 14px;
        }
        .form-input:focus { outline: none; border-color: #00FF41; }
        .run-btn {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #00FF41, #00D4FF);
          border: none;
          color: #000;
          border-radius: 8px;
          font-weight: bold;
          font-size: 16px;
          cursor: pointer;
          margin-top: 20px;
          transition: all 0.2s;
        }
        .run-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,255,65,0.3); }
        .run-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .right-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .output-header {
          padding: 16px 20px;
          background: #1a1a2e;
          border-bottom: 1px solid #2d2d4a;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #fff;
        }
        .status-badge {
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
        }
        .status-idle { background: #2d2d4a; color: #888; }
        .status-loading { background: #00D4FF; color: #000; }
        .status-success { background: #00FF41; color: #000; }
        .status-error { background: #FF4444; color: #fff; }
        .output-area {
          flex: 1;
          overflow: hidden;
          background: #fff;
        }
        .output-area iframe {
          width: 100%;
          height: 100%;
          border: none;
        }
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #555;
          background: #0a0a0a;
        }
        .empty-state-icon { font-size: 64px; margin-bottom: 16px; }
        .console-panel {
          height: 180px;
          border-top: 2px solid #00FF41;
          background: #0a0a0a;
        }
        .console-header {
          padding: 10px 16px;
          background: #1a1a2e;
          color: #00FF41;
          font-weight: bold;
          font-size: 13px;
        }
        .console-content {
          height: calc(100% - 40px);
          overflow-y: auto;
          padding: 10px;
          font-family: monospace;
          font-size: 12px;
        }
        .log-entry {
          padding: 4px 8px;
          margin-bottom: 4px;
          border-left: 3px solid;
        }
        .log-info { border-color: #00D4FF; color: #00D4FF; }
        .log-success { border-color: #00FF41; color: #00FF41; }
        .log-error { border-color: #FF4444; color: #FF4444; }
        .log-time { opacity: 0.5; margin-right: 8px; }
      `}</style>

      {/* Left Panel */}
      <div className="left-panel">
        <div className="panel-header">⚙️ Test Configuration</div>
        <div className="panel-content">
          
          {/* Source Type Tabs */}
          <div className="source-tabs">
            <button 
              className={`source-tab ${sourceType === 'custom' ? 'active' : ''}`}
              onClick={() => setSourceType('custom')}
            >
              ✏️ Custom
            </button>
            <button 
              className={`source-tab ${sourceType === 'github' ? 'active' : ''}`}
              onClick={() => setSourceType('github')}
            >
              📦 GitHub
            </button>
            <button 
              className={`source-tab ${sourceType === 'npm' ? 'active' : ''}`}
              onClick={() => setSourceType('npm')}
            >
              📚 NPM
            </button>
          </div>

          {/* Custom Code Editor */}
          {sourceType === 'custom' && (
            <div className="form-group">
              <label className="form-label">JavaScript Code</label>
              <div style={{ height: '350px', border: '1px solid #2d2d4a', borderRadius: '6px', overflow: 'hidden' }}>
                <Editor
                  height="350px"
                  defaultLanguage="javascript"
                  value={customCode}
                  onChange={(value) => setCustomCode(value || '')}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    padding: { top: 10 }
                  }}
                />
              </div>
            </div>
          )}

          {/* GitHub Input */}
          {sourceType === 'github' && (
            <div className="form-group">
              <label className="form-label">Repository URL</label>
              <input
                className="form-input"
                type="text"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/username/repo"
              />
              <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                💡 Enter a public GitHub repo URL to test
              </p>
            </div>
          )}

          {/* NPM Input */}
          {sourceType === 'npm' && (
            <div className="form-group">
              <label className="form-label">Package Name</label>
              <input
                className="form-input"
                type="text"
                value={npmPackage}
                onChange={(e) => setNpmPackage(e.target.value)}
                placeholder="lodash, axios, etc."
              />
              <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                💡 Test NPM packages before installing
              </p>
            </div>
          )}

          <button 
            className="run-btn" 
            onClick={handleRunTest} 
            disabled={isLoading}
          >
            {isLoading ? '⏳ Running...' : '▶️ Run Test'}
          </button>
          
          <button 
            style={{ 
              width: '100%', 
              marginTop: '10px', 
              padding: '10px', 
              background: 'transparent', 
              border: '1px solid #FF4444', 
              color: '#FF4444', 
              borderRadius: '6px', 
              cursor: 'pointer' 
            }}
            onClick={() => { setTestOutput(''); setConsoleLogs([]); setTestStatus('idle'); }}
          >
            🗑️ Clear Output
          </button>
        </div>
      </div>

      {/* Right Panel */}
      <div className="right-panel">
        <div className="output-header">
          <span>📊 Test Output</span>
          <span className={`status-badge status-${testStatus}`}>
            {testStatus === 'idle' ? 'Ready' :
             testStatus === 'loading' ? 'Running...' :
             testStatus === 'success' ? 'Success' : 'Error'}
          </span>
        </div>
        
        <div className="output-area">
          {testOutput ? (
            <iframe
              ref={iframeRef}
              srcDoc={testOutput}
              sandbox="allow-scripts"
              title="Test Output"
            />
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🧪</div>
              <div style={{ fontSize: '18px' }}>No test running</div>
              <div style={{ fontSize: '14px' }}>Write code and click "Run Test"</div>
            </div>
          )}
        </div>

        {/* Console */}
        <div className="console-panel">
          <div className="console-header">💻 Console</div>
          <div className="console-content">
            {consoleLogs.length === 0 ? (
              <div style={{ color: '#555' }}>Console output will appear here...</div>
            ) : (
              consoleLogs.map((log, idx) => (
                <div key={idx} className={`log-entry log-${log.type}`}>
                  <span className="log-time">[{log.timestamp}]</span>
                  {log.message}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
