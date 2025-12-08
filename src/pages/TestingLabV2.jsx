import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import SDKStatus from '../components/SDKStatus';

/**
 * Nurds Code Testing Lab
 * 
 * Universal testing environment for:
 * - Open-source GitHub repositories
 * - NPM packages
 * - Creator plugins (e.g., new video creator tools)
 * - Custom user code
 * - Platform plugins
 * 
 * Users can fully test anything within the platform before using it.
 */

function TestingLabV2() {
  const navigate = useNavigate();
  const iframeRef = useRef(null);
  
  // Source Type Selection
  const [sourceType, setSourceType] = useState('github'); // github, npm, plugin, custom
  
  // GitHub
  const [githubUrl, setGithubUrl] = useState('');
  const [githubBranch, setGithubBranch] = useState('main');
  
  // NPM
  const [npmPackage, setNpmPackage] = useState('');
  const [npmVersion, setNpmVersion] = useState('latest');
  
  // Plugin
  const [pluginId, setPluginId] = useState('');
  const [pluginSearch, setPluginSearch] = useState('');
  const [availablePlugins, setAvailablePlugins] = useState([]);
  
  // Custom Code
  const [customCode, setCustomCode] = useState(`// Your test code here
import React from 'react';

export default function TestComponent() {
  return (
    <div style={{ padding: '20px', background: '#1a1a2e', color: '#0ff' }}>
      <h1>🚀 Testing Component</h1>
      <p>Edit this code and click "Run Test" to see it in action!</p>
    </div>
  );
}`);
  
  // Execution
  const [isLoading, setIsLoading] = useState(false);
  const [testOutput, setTestOutput] = useState('');
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [testStatus, setTestStatus] = useState('idle'); // idle, loading, success, error
  const [testTimer, setTestTimer] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  
  // Configuration
  const [testConfig, setTestConfig] = useState({
    autoReload: true,
    isolatedEnv: true,
    allowNetwork: true,
    timeout: 30000
  });

  // Initialize - Load available plugins from backend
  useEffect(() => {
    loadAvailablePlugins();
  }, []);

  const loadAvailablePlugins = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8787';
      const response = await fetch(`${apiUrl}/api/plugins/list`);
      if (response.ok) {
        const data = await response.json();
        setAvailablePlugins(data.plugins || []);
      }
    } catch (error) {
      console.error('Failed to load plugins:', error);
    }
  };

  const addConsoleLog = (type, message) => {
    const timestamp = new Date().toLocaleTimeString();
    setConsoleLogs(prev => [...prev, { type, message, timestamp }]);
  };

  const handleRunTest = async () => {
    setIsLoading(true);
    setTestStatus('loading');
    setTestOutput('');
    setConsoleLogs([]);
    setTestTimer(0);
    
    // Start timer
    const interval = setInterval(() => {
      setTestTimer(prev => prev + 1);
    }, 1000);
    setTimerInterval(interval);
    
    addConsoleLog('info', `Starting test for ${sourceType}...`);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8787';
      
      let payload = {
        sourceType,
        config: testConfig
      };

      // Build payload based on source type
      switch(sourceType) {
        case 'github':
          if (!githubUrl.trim()) {
            throw new Error('GitHub URL is required');
          }
          payload.githubUrl = githubUrl;
          payload.branch = githubBranch;
          addConsoleLog('info', `Fetching from GitHub: ${githubUrl}`);
          break;
          
        case 'npm':
          if (!npmPackage.trim()) {
            throw new Error('NPM package name is required');
          }
          payload.package = npmPackage;
          payload.version = npmVersion;
          addConsoleLog('info', `Loading NPM package: ${npmPackage}@${npmVersion}`);
          break;
          
        case 'plugin':
          if (!pluginId) {
            throw new Error('Please select a plugin');
          }
          payload.pluginId = pluginId;
          addConsoleLog('info', `Loading plugin: ${pluginId}`);
          break;
          
        case 'custom':
          if (!customCode.trim()) {
            throw new Error('Custom code is required');
          }
          payload.code = customCode;
          addConsoleLog('info', 'Compiling custom code...');
          break;
      }

      const response = await fetch(`${apiUrl}/api/test/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Test execution failed');
      }

      setTestOutput(data.output || data.html || '');
      setTestStatus('success');
      addConsoleLog('success', 'Test completed successfully!');
      
      if (data.logs) {
        data.logs.forEach(log => addConsoleLog(log.type || 'info', log.message));
      }

    } catch (error) {
      setTestStatus('error');
      addConsoleLog('error', error.message);
      setTestOutput(`<div style="padding: 20px; background: #2e1a1a; color: #ff6b6b; font-family: monospace;">
        <h2>❌ Test Failed</h2>
        <p>${error.message}</p>
      </div>`);
    } finally {
      setIsLoading(false);
      // Stop timer
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
    }
  };

  const handleClearOutput = () => {
    setTestOutput('');
    setConsoleLogs([]);
    setTestStatus('idle');
  };

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: '#0a0a0f',
      color: '#00ff88',
      fontFamily: 'monospace',
      overflow: 'hidden'
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '15px 25px',
      background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
      borderBottom: '2px solid #00ff88',
      boxShadow: '0 4px 15px rgba(0, 255, 136, 0.2)'
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px'
    },
    logo: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#00ff88',
      textShadow: '0 0 10px #00ff88'
    },
    navButtons: {
      display: 'flex',
      gap: '10px'
    },
    navBtn: {
      padding: '8px 16px',
      background: 'transparent',
      border: '1px solid #00ff88',
      color: '#00ff88',
      borderRadius: '5px',
      cursor: 'pointer',
      transition: 'all 0.3s',
      fontSize: '14px'
    },
    mainContent: {
      display: 'flex',
      flex: 1,
      overflow: 'hidden'
    },
    leftPanel: {
      width: '400px',
      borderRight: '2px solid #00ff88',
      display: 'flex',
      flexDirection: 'column',
      background: '#0f0f1a'
    },
    panelHeader: {
      padding: '15px',
      background: '#1a1a2e',
      borderBottom: '1px solid #00ff88',
      fontWeight: 'bold',
      fontSize: '16px'
    },
    panelContent: {
      flex: 1,
      overflowY: 'auto',
      padding: '20px'
    },
    tabButtons: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '10px',
      marginBottom: '20px'
    },
    tabBtn: (active) => ({
      padding: '12px',
      background: active ? '#00ff88' : '#1a1a2e',
      color: active ? '#0a0a0f' : '#00ff88',
      border: '1px solid #00ff88',
      borderRadius: '5px',
      cursor: 'pointer',
      fontWeight: 'bold',
      transition: 'all 0.3s',
      fontSize: '14px'
    }),
    formGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      color: '#00ff88',
      fontSize: '14px'
    },
    input: {
      width: '100%',
      padding: '10px',
      background: '#1a1a2e',
      border: '1px solid #00ff88',
      color: '#00ff88',
      borderRadius: '5px',
      fontSize: '14px',
      boxSizing: 'border-box'
    },
    select: {
      width: '100%',
      padding: '10px',
      background: '#1a1a2e',
      border: '1px solid #00ff88',
      color: '#00ff88',
      borderRadius: '5px',
      fontSize: '14px',
      cursor: 'pointer'
    },
    runButton: {
      width: '100%',
      padding: '15px',
      background: isLoading ? '#555' : 'linear-gradient(135deg, #00ff88, #00cc6a)',
      color: '#0a0a0f',
      border: 'none',
      borderRadius: '8px',
      fontWeight: 'bold',
      fontSize: '16px',
      cursor: isLoading ? 'not-allowed' : 'pointer',
      marginTop: '20px',
      transition: 'all 0.3s'
    },
    clearButton: {
      width: '100%',
      padding: '10px',
      background: 'transparent',
      color: '#ff6b6b',
      border: '1px solid #ff6b6b',
      borderRadius: '5px',
      cursor: 'pointer',
      marginTop: '10px'
    },
    rightPanel: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column'
    },
    outputHeader: {
      padding: '15px',
      background: '#1a1a2e',
      borderBottom: '1px solid #00ff88',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    statusBadge: {
      padding: '5px 15px',
      borderRadius: '15px',
      fontSize: '12px',
      fontWeight: 'bold',
      background: testStatus === 'success' ? '#00ff88' : testStatus === 'error' ? '#ff6b6b' : '#555',
      color: '#0a0a0f'
    },
    outputArea: {
      flex: 1,
      overflow: 'hidden',
      position: 'relative'
    },
    iframe: {
      width: '100%',
      height: '100%',
      border: 'none',
      background: 'white'
    },
    emptyState: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      gap: '20px',
      color: '#555'
    },
    consolePanel: {
      height: '250px',
      borderTop: '2px solid #00ff88',
      background: '#0a0a0f',
      display: 'flex',
      flexDirection: 'column'
    },
    consoleHeader: {
      padding: '10px 15px',
      background: '#1a1a2e',
      borderBottom: '1px solid #00ff88',
      fontWeight: 'bold',
      fontSize: '14px'
    },
    consoleContent: {
      flex: 1,
      overflowY: 'auto',
      padding: '10px',
      fontFamily: 'monospace',
      fontSize: '12px'
    },
    consoleLog: (type) => ({
      padding: '5px',
      marginBottom: '5px',
      borderLeft: `3px solid ${
        type === 'error' ? '#ff6b6b' :
        type === 'warning' ? '#ffd93d' :
        type === 'success' ? '#00ff88' : '#6bcfff'
      }`,
      paddingLeft: '10px',
      color: type === 'error' ? '#ff6b6b' :
           type === 'warning' ? '#ffd93d' :
           type === 'success' ? '#00ff88' : '#6bcfff'
    })
  };

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logo}>🧪 Nurds Code Testing Lab</div>
        </div>
        <div style={styles.navButtons}>
          <button style={styles.navBtn} onClick={() => navigate('/')}>
            🏠 Home
          </button>
          <button style={styles.navBtn} onClick={() => navigate('/editor')}>
            &lt;/&gt; V.I.B.E. Editor
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={styles.mainContent}>
        {/* LEFT PANEL - SOURCE CONFIGURATION */}
        <div style={styles.leftPanel}>
          <div style={styles.panelHeader}>⚙️ Test Configuration</div>
          <div style={styles.panelContent}>
            
            {/* SDK Status */}
            <SDKStatus compact={false} showFullScreenLoader={true} />
            
            {/* Source Type Tabs */}
            <div style={styles.tabButtons}>
              <button
                style={styles.tabBtn(sourceType === 'github')}
                onClick={() => setSourceType('github')}
              >
                📦 GitHub
              </button>
              <button
                style={styles.tabBtn(sourceType === 'npm')}
                onClick={() => setSourceType('npm')}
              >
                📚 NPM
              </button>
              <button
                style={styles.tabBtn(sourceType === 'plugin')}
                onClick={() => setSourceType('plugin')}
              >
                🔌 Plugin
              </button>
              <button
                style={styles.tabBtn(sourceType === 'custom')}
                onClick={() => setSourceType('custom')}
              >
                ✏️ Custom
              </button>
            </div>

            {/* GitHub Form */}
            {sourceType === 'github' && (
              <>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Repository URL</label>
                  <input
                    style={styles.input}
                    type="text"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/username/repo"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Branch</label>
                  <input
                    style={styles.input}
                    type="text"
                    value={githubBranch}
                    onChange={(e) => setGithubBranch(e.target.value)}
                    placeholder="main"
                  />
                </div>
                <div style={{ fontSize: '12px', color: '#6bcfff', marginTop: '10px' }}>
                  💡 Test any public GitHub repository. The lab will clone and run it in an isolated environment.
                </div>
              </>
            )}

            {/* NPM Form */}
            {sourceType === 'npm' && (
              <>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Package Name</label>
                  <input
                    style={styles.input}
                    type="text"
                    value={npmPackage}
                    onChange={(e) => setNpmPackage(e.target.value)}
                    placeholder="react, lodash, etc."
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Version</label>
                  <input
                    style={styles.input}
                    type="text"
                    value={npmVersion}
                    onChange={(e) => setNpmVersion(e.target.value)}
                    placeholder="latest"
                  />
                </div>
                <div style={{ fontSize: '12px', color: '#6bcfff', marginTop: '10px' }}>
                  💡 Test any NPM package before installing it in your project.
                </div>
              </>
            )}

            {/* Plugin Form */}
            {sourceType === 'plugin' && (
              <>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Search Plugins</label>
                  <input
                    style={styles.input}
                    type="text"
                    value={pluginSearch}
                    onChange={(e) => setPluginSearch(e.target.value)}
                    placeholder="Search for plugins..."
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Select Plugin</label>
                  <select
                    style={styles.select}
                    value={pluginId}
                    onChange={(e) => setPluginId(e.target.value)}
                  >
                    <option value="">-- Choose a plugin --</option>
                    {availablePlugins
                      .filter(p => p.name.toLowerCase().includes(pluginSearch.toLowerCase()))
                      .map(plugin => (
                        <option key={plugin.id} value={plugin.id}>
                          {plugin.name} - {plugin.description}
                        </option>
                      ))
                    }
                  </select>
                </div>
                <div style={{ fontSize: '12px', color: '#6bcfff', marginTop: '10px' }}>
                  💡 Test creator plugins (like video editors) before using them in production.
                </div>
              </>
            )}

            {/* Custom Code Form */}
            {sourceType === 'custom' && (
              <>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Custom Code</label>
                  <div style={{ height: '300px', border: '1px solid #00ff88', borderRadius: '5px', overflow: 'hidden' }}>
                    <Editor
                      height="300px"
                      defaultLanguage="javascript"
                      value={customCode}
                      onChange={(value) => setCustomCode(value || '')}
                      theme="vs-dark"
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false
                      }}
                    />
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: '#6bcfff', marginTop: '10px' }}>
                  💡 Write and test your own code in an isolated sandbox.
                </div>
              </>
            )}

            {/* Test Actions */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button style={styles.runButton} onClick={handleRunTest} disabled={isLoading}>
                {isLoading ? '⏳ Running Test...' : '▶️ Run Test'}
              </button>
              {isLoading && (
                <div style={{ 
                  color: '#00ff88', 
                  fontSize: '16px', 
                  fontFamily: 'monospace',
                  background: '#0f0f1a',
                  padding: '8px 16px',
                  borderRadius: '5px',
                  border: '1px solid #00ff8840'
                }}>
                  ⏱️ {Math.floor(testTimer / 60)}:{(testTimer % 60).toString().padStart(2, '0')}
                </div>
              )}
            </div>
            <button style={styles.clearButton} onClick={handleClearOutput}>
              🗑️ Clear Output
            </button>
          </div>
        </div>

        {/* RIGHT PANEL - OUTPUT */}
        <div style={styles.rightPanel}>
          <div style={styles.outputHeader}>
            <span>📊 Test Output</span>
            <span style={styles.statusBadge}>
              {testStatus === 'idle' ? 'Ready' :
               testStatus === 'loading' ? 'Running...' :
               testStatus === 'success' ? 'Success' : 'Error'}
            </span>
          </div>
          
          <div style={styles.outputArea}>
            {testOutput ? (
              <iframe
                ref={iframeRef}
                srcDoc={testOutput}
                style={styles.iframe}
                sandbox="allow-scripts allow-same-origin"
                title="Test Output"
              />
            ) : (
              <div style={styles.emptyState}>
                <div style={{ fontSize: '64px' }}>🧪</div>
                <div style={{ fontSize: '18px' }}>No test running</div>
                <div style={{ fontSize: '14px' }}>Configure a test source and click "Run Test"</div>
              </div>
            )}
          </div>

          {/* Console Panel */}
          <div style={styles.consolePanel}>
            <div style={styles.consoleHeader}>💻 Console</div>
            <div style={styles.consoleContent}>
              {consoleLogs.length === 0 ? (
                <div style={{ color: '#555' }}>Console output will appear here...</div>
              ) : (
                consoleLogs.map((log, idx) => (
                  <div key={idx} style={styles.consoleLog(log.type)}>
                    <span style={{ opacity: 0.6 }}>[{log.timestamp}]</span> {log.message}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TestingLabV2;
