import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { sdkManager } from '../utils/sdkManager';
import { pluginLoader } from '../utils/pluginLoader';

/**
 * Testing Lab - Comprehensive Plugin & Tool Testing Environment
 * 
 * Purpose:
 * - Test open-source repositories from GitHub
 * - Test newly created plugins before deployment
 * - Test user's custom plugins within the platform
 * - Full sandbox environment for any tool/plugin
 * 
 * Example Use Cases:
 * - Creator launches new video editing plugin → users test it here first
 * - Test React components from GitHub repos
 * - Validate NPM packages before integration
 * - Run custom code in isolated sandbox
 */

function TestingLab() {
  // SDK Status
  const [sdkStatus, setSdkStatus] = useState({});
  const [sdksInitialized, setSdksInitialized] = useState(false);
  
  // Active Tab
  const [activeTab, setActiveTab] = useState('github');
  const [loading, setLoading] = useState(false);
  
  // GitHub Loader
  const [githubUrl, setGithubUrl] = useState('');
  
  // NPM Loader
  const [npmPackage, setNpmPackage] = useState('');
  const [npmVersion, setNpmVersion] = useState('latest');
  
  // Custom Code Loader
  const [pluginName, setPluginName] = useState('');
  const [pluginCode, setPluginCode] = useState(`// Write your plugin code here

export default function MyPlugin(input) {
  console.log('Plugin loaded with input:', input);
  
  // Your plugin logic here
  const result = {
    message: 'Hello from custom plugin!',
    data: input,
    timestamp: new Date().toISOString()
  };
  
  console.log('Plugin result:', result);
  return result;
}`);
  
  // Loaded Plugins
  const [loadedPlugins, setLoadedPlugins] = useState([]);
  const [selectedPlugin, setSelectedPlugin] = useState(null);
  
  // Execution
  const [executionInput, setExecutionInput] = useState('{}');
  const [executionResult, setExecutionResult] = useState(null);
  const [consoleOutput, setConsoleOutput] = useState([]);
  const consoleRef = useRef(null);
  
  // Initialize SDKs on mount
  useEffect(() => {
    initializeSDKs();
  }, []);
  
  // Auto-scroll console
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [consoleOutput]);
  
  const initializeSDKs = async () => {
    try {
      addConsoleLog('🚀 Initializing SDKs...', 'system');
      const result = await sdkManager.initializeAll();
      setSdkStatus(result.sdks);
      setSdksInitialized(true);
      
      Object.entries(result.sdks).forEach(([key, sdk]) => {
        if (sdk.status === 'ready' || sdk.status === 'ready_simulation') {
          addConsoleLog(`✅ ${sdk.name} initialized`, 'success');
        } else {
          addConsoleLog(`❌ ${sdk.name} failed: ${sdk.error}`, 'error');
        }
      });
      
      addConsoleLog('✅ All SDKs initialized. Ready to test plugins!', 'success');
    } catch (error) {
      addConsoleLog(`❌ SDK initialization error: ${error.message}`, 'error');
    }
  };
  
  const addConsoleLog = (message, type = 'info') => {
    setConsoleOutput(prev => [...prev, {
      message,
      type,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };
  
  const handleLoadGitHub = async () => {
    if (!githubUrl.trim()) {
      addConsoleLog('❌ Please enter a GitHub URL', 'error');
      return;
    }
    
    setLoading(true);
    try {
      addConsoleLog(`📦 Loading repository: ${githubUrl}`, 'info');
      const plugin = await pluginLoader.loadFromGitHub(githubUrl);
      setLoadedPlugins(prev => [...prev, plugin]);
      setSelectedPlugin(plugin);
      addConsoleLog(`✅ Repository loaded: ${plugin.name}`, 'success');
      addConsoleLog(`⭐ Stars: ${plugin.metadata.stars} | Language: ${plugin.metadata.language}`, 'info');
      setGithubUrl('');
    } catch (error) {
      addConsoleLog(`❌ Failed to load repository: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleLoadNPM = async () => {
    if (!npmPackage.trim()) {
      addConsoleLog('❌ Please enter a package name', 'error');
      return;
    }
    
    setLoading(true);
    try {
      addConsoleLog(`📦 Loading NPM package: ${npmPackage}@${npmVersion}`, 'info');
      const plugin = await pluginLoader.loadFromNPM(npmPackage, npmVersion);
      setLoadedPlugins(prev => [...prev, plugin]);
      setSelectedPlugin(plugin);
      addConsoleLog(`✅ Package loaded: ${plugin.name}@${plugin.version}`, 'success');
      setNpmPackage('');
    } catch (error) {
      addConsoleLog(`❌ Failed to load package: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleLoadCustomCode = async () => {
    if (!pluginName.trim()) {
      addConsoleLog('❌ Please enter a plugin name', 'error');
      return;
    }
    
    if (!pluginCode.trim()) {
      addConsoleLog('❌ Please write some code', 'error');
      return;
    }
    
    setLoading(true);
    try {
      addConsoleLog(`💻 Loading custom code: ${pluginName}`, 'info');
      const plugin = await pluginLoader.loadFromCode(pluginName, pluginCode);
      setLoadedPlugins(prev => [...prev, plugin]);
      setSelectedPlugin(plugin);
      addConsoleLog(`✅ Custom code loaded: ${plugin.name}`, 'success');
    } catch (error) {
      addConsoleLog(`❌ Failed to load code: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleExecutePlugin = async () => {
    if (!selectedPlugin) {
      addConsoleLog('❌ No plugin selected', 'error');
      return;
    }
    
    setLoading(true);
    setExecutionResult(null);
    
    try {
      addConsoleLog(`▶️ Executing plugin: ${selectedPlugin.name}`, 'info');
      
      let input = {};
      try {
        input = JSON.parse(executionInput);
      } catch (error) {
        addConsoleLog('⚠️ Invalid JSON input, using empty object', 'warning');
      }
      
      const { result } = await pluginLoader.executePlugin(selectedPlugin.id, input);
      
      result.logs?.forEach(log => addConsoleLog(log, 'info'));
      
      setExecutionResult(result);
      addConsoleLog(`✅ Execution completed in ${result.metrics.executionTime.toFixed(2)}ms`, 'success');
    } catch (error) {
      addConsoleLog(`❌ Execution error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRemovePlugin = (pluginId) => {
    pluginLoader.removePlugin(pluginId);
    setLoadedPlugins(prev => prev.filter(p => p.id !== pluginId));
    if (selectedPlugin?.id === pluginId) {
      setSelectedPlugin(null);
    }
    addConsoleLog(`🗑️ Plugin removed`, 'info');
  };
  
  const clearConsole = () => {
    setConsoleOutput([]);
  };

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 60px)',
      background: '#0a0a0a',
      color: '#fff',
      fontFamily: 'Inter, sans-serif',
      padding: '20px',
      gap: '20px'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: '20px',
      borderBottom: '2px solid rgba(0, 255, 255, 0.2)'
    },
    title: {
      fontSize: '32px',
      fontFamily: 'VT323, monospace',
      color: '#00ffff',
      margin: 0
    },
    sdkBadges: {
      display: 'flex',
      gap: '10px',
      flexWrap: 'wrap'
    },
    badge: {
      padding: '5px 12px',
      background: 'rgba(0, 255, 153, 0.1)',
      border: '1px solid #00ff99',
      borderRadius: '4px',
      fontSize: '11px',
      fontFamily: 'Fira Code, monospace'
    },
    badgeError: {
      background: 'rgba(255, 0, 0, 0.1)',
      borderColor: '#ff0000'
    },
    layout: {
      display: 'grid',
      gridTemplateColumns: '400px 1fr 350px',
      gap: '20px',
      flexGrow: 1,
      minHeight: 0
    },
    panel: {
      background: '#141414',
      border: '1px solid rgba(0, 255, 255, 0.2)',
      borderRadius: '8px',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    },
    panelHeader: {
      padding: '15px',
      background: 'rgba(0, 255, 255, 0.05)',
      borderBottom: '1px solid rgba(0, 255, 255, 0.2)',
      fontFamily: 'VT323, monospace',
      fontSize: '20px',
      color: '#00ffff'
    },
    panelBody: {
      padding: '20px',
      overflowY: 'auto',
      flexGrow: 1
    },
    tabs: {
      display: 'flex',
      gap: '5px',
      marginBottom: '20px'
    },
    tab: {
      padding: '8px 16px',
      background: 'transparent',
      border: '1px solid rgba(0, 255, 255, 0.3)',
      borderRadius: '4px',
      color: '#888',
      cursor: 'pointer',
      fontFamily: 'Fira Code, monospace',
      fontSize: '13px'
    },
    tabActive: {
      background: 'rgba(0, 255, 255, 0.1)',
      borderColor: '#00ffff',
      color: '#00ffff'
    },
    input: {
      width: '100%',
      padding: '10px',
      background: '#0a0a0a',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '4px',
      color: '#fff',
      fontFamily: 'Fira Code, monospace',
      fontSize: '13px',
      marginBottom: '10px'
    },
    button: {
      width: '100%',
      padding: '12px',
      background: 'linear-gradient(135deg, #00ffff, #00ff99)',
      border: 'none',
      borderRadius: '4px',
      color: '#000',
      fontWeight: 'bold',
      cursor: 'pointer',
      fontSize: '14px',
      fontFamily: 'VT323, monospace',
      textTransform: 'uppercase',
      letterSpacing: '1px'
    },
    buttonDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed'
    },
    pluginList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    },
    pluginItem: {
      padding: '12px',
      background: 'rgba(0, 255, 255, 0.05)',
      border: '1px solid rgba(0, 255, 255, 0.2)',
      borderRadius: '4px',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    pluginItemSelected: {
      background: 'rgba(0, 255, 255, 0.15)',
      borderColor: '#00ffff'
    },
    pluginName: {
      fontWeight: 'bold',
      marginBottom: '5px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    pluginDesc: {
      fontSize: '12px',
      color: '#888',
      marginBottom: '5px'
    },
    pluginSource: {
      fontSize: '11px',
      color: '#00ff99',
      fontFamily: 'Fira Code, monospace'
    },
    removeBtn: {
      background: 'transparent',
      border: 'none',
      color: '#ff0000',
      cursor: 'pointer',
      fontSize: '16px',
      padding: '0 5px'
    },
    console: {
      background: '#000',
      flexGrow: 1,
      padding: '15px',
      fontFamily: 'Fira Code, monospace',
      fontSize: '12px',
      overflowY: 'auto',
      lineHeight: '1.6'
    },
    consoleHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 15px',
      background: 'rgba(0, 255, 255, 0.05)',
      borderBottom: '1px solid rgba(0, 255, 255, 0.2)'
    },
    clearBtn: {
      background: 'transparent',
      border: '1px solid #ff0000',
      borderRadius: '3px',
      color: '#ff0000',
      cursor: 'pointer',
      padding: '4px 8px',
      fontSize: '11px'
    },
    logEntry: {
      marginBottom: '8px',
      display: 'flex',
      gap: '10px'
    },
    logTime: {
      color: '#888'
    },
    logInfo: { color: '#00ffff' },
    logSuccess: { color: '#00ff99' },
    logWarning: { color: '#ffaa00' },
    logError: { color: '#ff0000' },
    logSystem: { color: '#888' },
    resultBox: {
      background: 'rgba(0, 255, 153, 0.05)',
      border: '1px solid #00ff99',
      borderRadius: '4px',
      padding: '15px',
      marginTop: '15px',
      fontFamily: 'Fira Code, monospace',
      fontSize: '12px'
    },
    textarea: {
      width: '100%',
      height: '120px',
      padding: '10px',
      background: '#0a0a0a',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '4px',
      color: '#fff',
      fontFamily: 'Fira Code, monospace',
      fontSize: '12px',
      resize: 'vertical',
      marginBottom: '10px'
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🧪 TESTING LAB</h1>
          <p style={{ margin: '5px 0 0 0', color: '#888', fontSize: '14px' }}>
            Test repos, plugins, and custom code in isolated sandboxes
          </p>
        </div>
        <div style={styles.sdkBadges}>
          {Object.entries(sdkStatus).map(([key, sdk]) => (
            <div 
              key={key}
              style={{
                ...styles.badge,
                ...(sdk.status === 'error' ? styles.badgeError : {})
              }}
            >
              {sdk.status === 'ready' || sdk.status === 'ready_simulation' ? '✅' : '❌'} {sdk.name}
            </div>
          ))}
        </div>
      </div>

      {/* Main Layout */}
      <div style={styles.layout}>
        {/* Left Panel - Load Plugins */}
        <div style={styles.panel}>
          <div style={styles.panelHeader}>📦 LOAD PLUGIN</div>
          <div style={styles.panelBody}>
            <div style={styles.tabs}>
              <button
                style={{...styles.tab, ...(activeTab === 'github' ? styles.tabActive : {})}}
                onClick={() => setActiveTab('github')}
              >
                GitHub
              </button>
              <button
                style={{...styles.tab, ...(activeTab === 'npm' ? styles.tabActive : {})}}
                onClick={() => setActiveTab('npm')}
              >
                NPM
              </button>
              <button
                style={{...styles.tab, ...(activeTab === 'code' ? styles.tabActive : {})}}
                onClick={() => setActiveTab('code')}
              >
                Custom Code
              </button>
            </div>

            {activeTab === 'github' && (
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#888' }}>
                  GitHub Repository URL
                </label>
                <input
                  style={styles.input}
                  type="text"
                  placeholder="https://github.com/owner/repo"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLoadGitHub()}
                />
                <button
                  style={{...styles.button, ...(loading ? styles.buttonDisabled : {})}}
                  onClick={handleLoadGitHub}
                  disabled={loading}
                >
                  {loading ? '⏳ Loading...' : '📦 Load Repository'}
                </button>
              </div>
            )}

            {activeTab === 'npm' && (
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#888' }}>
                  NPM Package Name
                </label>
                <input
                  style={styles.input}
                  type="text"
                  placeholder="package-name"
                  value={npmPackage}
                  onChange={(e) => setNpmPackage(e.target.value)}
                />
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#888' }}>
                  Version
                </label>
                <input
                  style={styles.input}
                  type="text"
                  placeholder="latest"
                  value={npmVersion}
                  onChange={(e) => setNpmVersion(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLoadNPM()}
                />
                <button
                  style={{...styles.button, ...(loading ? styles.buttonDisabled : {})}}
                  onClick={handleLoadNPM}
                  disabled={loading}
                >
                  {loading ? '⏳ Loading...' : '📦 Load Package'}
                </button>
              </div>
            )}

            {activeTab === 'code' && (
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#888' }}>
                  Plugin Name
                </label>
                <input
                  style={styles.input}
                  type="text"
                  placeholder="My Plugin"
                  value={pluginName}
                  onChange={(e) => setPluginName(e.target.value)}
                />
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#888' }}>
                  Code
                </label>
                <Editor
                  height="300px"
                  language="javascript"
                  value={pluginCode}
                  onChange={(value) => setPluginCode(value)}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 12,
                    scrollBeyondLastLine: false
                  }}
                />
                <button
                  style={{...styles.button, ...(loading ? styles.buttonDisabled : {}), marginTop: '10px'}}
                  onClick={handleLoadCustomCode}
                  disabled={loading}
                >
                  {loading ? '⏳ Loading...' : '💻 Load Code'}
                </button>
              </div>
            )}

            {/* Loaded Plugins */}
            {loadedPlugins.length > 0 && (
              <>
                <h3 style={{ marginTop: '30px', marginBottom: '15px', color: '#00ffff', fontFamily: 'VT323, monospace', fontSize: '18px' }}>
                  LOADED PLUGINS ({loadedPlugins.length})
                </h3>
                <div style={styles.pluginList}>
                  {loadedPlugins.map(plugin => (
                    <div
                      key={plugin.id}
                      style={{
                        ...styles.pluginItem,
                        ...(selectedPlugin?.id === plugin.id ? styles.pluginItemSelected : {})
                      }}
                      onClick={() => setSelectedPlugin(plugin)}
                    >
                      <div style={styles.pluginName}>
                        <span>{plugin.name}</span>
                        <button
                          style={styles.removeBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemovePlugin(plugin.id);
                          }}
                        >
                          ✕
                        </button>
                      </div>
                      <div style={styles.pluginDesc}>{plugin.description}</div>
                      <div style={styles.pluginSource}>
                        Source: {plugin.source} | Loaded: {new Date(plugin.loadedAt).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Center Panel - Execution */}
        <div style={styles.panel}>
          <div style={styles.panelHeader}>▶️ EXECUTE & TEST</div>
          <div style={styles.panelBody}>
            {selectedPlugin ? (
              <>
                <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#00ff99' }}>
                  {selectedPlugin.name}
                </h3>
                <p style={{ fontSize: '13px', color: '#888', marginBottom: '20px' }}>
                  {selectedPlugin.description}
                </p>

                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#888' }}>
                  Input (JSON)
                </label>
                <textarea
                  style={styles.textarea}
                  value={executionInput}
                  onChange={(e) => setExecutionInput(e.target.value)}
                  placeholder='{"key": "value"}'
                />

                <button
                  style={{...styles.button, ...(loading ? styles.buttonDisabled : {})}}
                  onClick={handleExecutePlugin}
                  disabled={loading}
                >
                  {loading ? '⏳ Executing...' : '▶️ Execute Plugin'}
                </button>

                {executionResult && (
                  <div style={styles.resultBox}>
                    <div style={{ marginBottom: '10px', fontWeight: 'bold', color: '#00ff99' }}>
                      ✅ Execution Result
                    </div>
                    <div style={{ marginBottom: '5px' }}>
                      <strong>Status:</strong> {executionResult.success ? 'Success' : 'Failed'}
                    </div>
                    <div style={{ marginBottom: '5px' }}>
                      <strong>Output:</strong> {executionResult.output}
                    </div>
                    <div style={{ marginBottom: '5px' }}>
                      <strong>Time:</strong> {executionResult.metrics.executionTime.toFixed(2)}ms
                    </div>
                    <div style={{ marginBottom: '5px' }}>
                      <strong>Memory:</strong> {executionResult.metrics.memoryUsed.toFixed(2)}MB
                    </div>
                    <div>
                      <strong>CPU:</strong> {executionResult.metrics.cpuUsed.toFixed(1)}%
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '50px 20px', color: '#888' }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔍</div>
                <div>No plugin selected</div>
                <div style={{ fontSize: '12px', marginTop: '10px' }}>
                  Load a plugin from the left panel to get started
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Console */}
        <div style={styles.panel}>
          <div style={styles.consoleHeader}>
            <span style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#00ffff' }}>
              💻 CONSOLE
            </span>
            <button style={styles.clearBtn} onClick={clearConsole}>
              Clear
            </button>
          </div>
          <div style={styles.console} ref={consoleRef}>
            {consoleOutput.length === 0 ? (
              <div style={{ color: '#888' }}>Console output will appear here...</div>
            ) : (
              consoleOutput.map((log, index) => (
                <div key={index} style={styles.logEntry}>
                  <span style={styles.logTime}>[{log.timestamp}]</span>
                  <span style={styles[`log${log.type.charAt(0).toUpperCase() + log.type.slice(1)}`]}>
                    {log.message}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TestingLab;
