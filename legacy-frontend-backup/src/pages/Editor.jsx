import React, { useState, useRef, useEffect } from 'react';
import Editor, { loader } from '@monaco-editor/react';
import { useNavigate } from 'react-router-dom';
import SDKStatus from '../components/SDKStatus';
import FileTree from '../components/FileTree';
import FrameworkSelector from '../components/FrameworkSelector';
import BindingsSelector from '../components/BindingsSelector';

loader.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs' } });

const PLATFORMS = [
  { id: 'bolt', name: 'Bolt', rating: 4.9, type: 'Web Fullstack' },
  { id: 'cursor', name: 'Cursor', rating: 4.9, type: 'AI Agent' },
  { id: 'lovable', name: 'Lovable', rating: 4.8, type: 'Natural Language' },
  { id: 'v0', name: 'v0 by Vercel', rating: 4.7, type: 'UI Generator' },
  { id: 'windsurf', name: 'Windsurf', rating: 4.6, type: 'Codeium IDE' },
];

function VibeIDE() {
  const navigate = useNavigate();
  const [selectedPlatform, setSelectedPlatform] = useState(PLATFORMS[0]);
  const [prompt, setPrompt] = useState('');
  const [code, setCode] = useState('// Awaiting prompt execution...\n\n');
  const [chatHistory, setChatHistory] = useState([
    {
      type: 'ai',
      message: 'V.I.B.E. Engine online. Cloudflare Workers SDK ready. What are we building today?',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [activeTab, setActiveTab] = useState('code');
  const [isBuilding, setIsBuilding] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState('javascript');
  
  // NEW: Project mode state
  const [projectMode, setProjectMode] = useState(false); // Toggle between single file vs project
  const [project, setProject] = useState({ files: [], instructions: '' });
  const [activeFile, setActiveFile] = useState(null);
  const [framework, setFramework] = useState('hono'); // Default: Hono (best for Cloudflare Workers)
  const [bindings, setBindings] = useState([]); // Selected Cloudflare bindings
  
  const editorRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monaco.editor.defineTheme('vibe-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6272a4' },
        { token: 'keyword', foreground: 'ff79c6' },
        { token: 'string', foreground: 'f1fa8c' },
        { token: 'function', foreground: '8be9fd' },
      ],
      colors: {
        'editor.background': '#080808',
        'editor.lineHighlightBackground': '#0f0f0f',
        'editorCursor.foreground': '#00ffff',
      }
    });
    monaco.editor.setTheme('vibe-dark');
  };

  const handleBuildIt = async () => {
    if (!prompt.trim()) return;

    // Add user message
    setChatHistory(prev => [...prev, {
      type: 'user',
      message: prompt,
      timestamp: new Date().toLocaleTimeString()
    }]);

    setIsBuilding(true);
    const userPrompt = prompt;
    setPrompt('');

    // Initial AI response
    setChatHistory(prev => [...prev, {
      type: 'ai',
      message: `Acknowledged. Connecting to ${selectedPlatform.name} via Cloudflare AI Gateway...`,
      timestamp: new Date().toLocaleTimeString(),
      platform: selectedPlatform.name
    }]);

    try {
      // Check if API URL is configured
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8787';
      
      // Choose endpoint based on project mode
      const endpoint = projectMode ? '/api/project/generate' : '/api/chat';
      const requestBody = projectMode ? {
        description: userPrompt,
        framework: framework,
        bindings: bindings
      } : {
        message: `Generate code for: ${userPrompt}`,
        plan: 'free',
        platform: selectedPlatform.id
      };
      
      // Call the backend API
      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      
      if (projectMode && data.project) {
        // Project mode: handle multiple files
        setProject(data.project);
        
        // Set first file as active
        if (data.project.files && data.project.files.length > 0) {
          setActiveFile(data.project.files[0].path);
        }
        
        setIsBuilding(false);
        setActiveTab('preview');
        
        const provider = data.provider || 'Claude';
        const model = data.model || 'haiku-3.5';
        
        setChatHistory(prev => [...prev, {
          type: 'ai',
          message: `✅ Project generated with ${provider} (${model})!\n\n📦 Created ${data.project.files.length} files\n🎨 Framework: ${framework}\n⚡ Bindings: ${bindings.join(', ') || 'none'}\n\n${data.project.instructions || 'Browse the file tree to see all files.'}`,
          timestamp: new Date().toLocaleTimeString()
        }]);
      } else {
        // Single file mode
        const generatedCode = data.response || data.code || data.message || `// Generated code for: ${userPrompt}\n\n// API response received but no code generated`;

        setCode(generatedCode);
        setDetectedLanguage('javascript');
        setIsBuilding(false);
        
        // Auto-switch to Preview tab to show the generated code
        setActiveTab('preview');

        const provider = data.provider || 'AI';
        const model = data.model || 'default';

        setChatHistory(prev => [...prev, {
          type: 'ai',
          message: `✅ Build complete! Generated with ${provider} (${model}).\n\nCode is now visible in the Preview tab.`,
          timestamp: new Date().toLocaleTimeString()
        }]);
      }
    } catch (error) {
      console.error('Build error:', error);
      
      setIsBuilding(false);

      setChatHistory(prev => [...prev, {
        type: 'ai',
        message: `❌ Error generating code: ${error.message}\n\nPlease try again or check the console for details.`,
        timestamp: new Date().toLocaleTimeString()
      }]);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      alert('Code copied!');
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vibe-app.${detectedLanguage === 'javascript' ? 'jsx' : 'txt'}`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleSave = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8787';
      const response = await fetch(`${apiUrl}/api/project/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectName: projectMode ? 'Multi-File Project' : 'Single File',
          content: code,
          files: projectMode ? project.files : null
        })
      });

      if (!response.ok) {
        throw new Error(`Save failed: ${response.status}`);
      }

      const data = await response.json();
      alert(data.message || 'Project saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      alert(`Save failed: ${error.message}`);
    }
  };

  const styles = {
    container: {
      display: 'flex',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      background: '#050505',
      color: '#ffffff',
      fontFamily: 'Inter, sans-serif',
      fontSize: '14px'
    },
    leftSidebar: {
      width: '60px',
      background: '#0a0a0a',
      borderRight: '1px solid rgba(0, 255, 255, 0.15)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: '20px',
      gap: '20px'
    },
    iconBtn: {
      background: 'none',
      border: 'none',
      color: '#888',
      fontSize: '24px',
      cursor: 'pointer',
      padding: '10px',
      transition: 'all 0.2s'
    },
    iconBtnActive: {
      background: 'rgba(0, 255, 255, 0.1)',
      border: '2px solid #00ffff',
      color: '#00ffff',
      borderRadius: '8px'
    },
    leftPane: {
      width: '380px',
      minWidth: '380px',
      background: '#0a0a0a',
      borderRight: '1px solid rgba(0, 255, 255, 0.15)',
      display: 'flex',
      flexDirection: 'column'
    },
    controlsTop: {
      padding: '15px',
      borderBottom: '1px solid rgba(0, 255, 255, 0.15)',
      background: 'rgba(0,255,255,0.03)'
    },
    cyberLabel: {
      fontFamily: 'VT323, monospace',
      color: '#00ffff',
      marginBottom: '5px',
      display: 'block',
      fontSize: '18px',
      letterSpacing: '1px'
    },
    select: {
      width: '100%',
      padding: '10px',
      background: '#141414',
      border: '1px solid rgba(0,255,255,0.3)',
      color: 'white',
      fontFamily: 'Fira Code, monospace',
      borderRadius: '4px',
      outline: 'none',
      fontSize: '14px'
    },
    modeToggle: {
      display: 'flex',
      gap: '8px',
      marginBottom: '16px',
      marginTop: '12px'
    },
    modeButton: {
      flex: 1,
      padding: '10px',
      background: '#111',
      border: '1px solid #333',
      borderRadius: '6px',
      color: '#aaa',
      fontSize: '13px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      fontWeight: '500'
    },
    modeButtonActive: {
      background: 'rgba(255, 215, 0, 0.1)',
      borderColor: 'gold',
      color: 'gold'
    },
    chatHistory: {
      flexGrow: 1,
      overflowY: 'auto',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '15px'
    },
    chatBubble: {
      padding: '12px 15px',
      borderRadius: '6px',
      maxWidth: '90%',
      fontSize: '14px',
      lineHeight: '1.4'
    },
    bubbleUser: {
      alignSelf: 'flex-end',
      background: 'rgba(0, 255, 255, 0.05)',
      border: '1px solid #00ffff'
    },
    bubbleAi: {
      alignSelf: 'flex-start',
      background: 'rgba(0, 255, 153, 0.05)',
      border: '1px solid #00ff99'
    },
    bubbleMeta: {
      fontFamily: 'VT323, monospace',
      opacity: 0.7,
      marginBottom: '5px',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    aiDot: {
      width: '6px',
      height: '6px',
      background: '#00ff99',
      borderRadius: '50%',
      boxShadow: '0 0 5px #00ff99'
    },
    inputArea: {
      padding: '20px',
      borderTop: '1px solid rgba(0, 255, 255, 0.15)',
      background: '#0a0a0a'
    },
    textarea: {
      width: '100%',
      height: '80px',
      background: '#141414',
      border: '1px solid rgba(255,255,255,0.2)',
      color: 'white',
      padding: '12px',
      fontFamily: 'Inter, sans-serif',
      resize: 'none',
      borderRadius: '4px',
      marginBottom: '12px',
      outline: 'none',
      fontSize: '14px'
    },
    buildBtn: {
      width: '100%',
      padding: '12px',
      background: 'linear-gradient(135deg, #ffcc00, #ffaa00)',
      border: 'none',
      borderRadius: '4px',
      color: '#000',
      fontFamily: 'VT323, monospace',
      fontSize: '22px',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      cursor: 'pointer',
      boxShadow: '0 4px 15px rgba(255, 204, 0, 0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    },
    rightPane: {
      flexGrow: 1,
      display: 'flex',
      flexDirection: 'column',
      background: '#0c0c0c'
    },
    tabsBar: {
      height: '45px',
      background: '#0a0a0a',
      borderBottom: '1px solid rgba(0, 255, 255, 0.15)',
      display: 'flex',
      paddingLeft: '10px'
    },
    tabBtn: {
      padding: '0 20px',
      height: '100%',
      background: 'transparent',
      border: 'none',
      color: '#888',
      fontFamily: 'VT323, monospace',
      fontSize: '18px',
      cursor: 'pointer',
      borderBottom: '2px solid transparent',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    tabBtnActive: {
      color: '#00ffff',
      borderBottomColor: '#00ffff',
      background: 'rgba(0,255,255,0.02)'
    },
    contentStage: {
      flexGrow: 1,
      position: 'relative'
    },
    stageView: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      flexDirection: 'column'
    },
    toolbar: {
      height: '40px',
      background: '#141414',
      borderBottom: '1px solid rgba(0, 255, 255, 0.15)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 15px',
      fontFamily: 'Fira Code, monospace',
      fontSize: '12px',
      color: '#aaa'
    },
    toolbarActions: {
      display: 'flex',
      gap: '10px'
    },
    toolBtn: {
      padding: '5px 10px',
      background: 'transparent',
      border: '1px solid #444',
      color: '#ccc',
      borderRadius: '3px',
      cursor: 'pointer',
      fontFamily: 'Fira Code, monospace',
      fontSize: '11px'
    },
    toolBtnGold: {
      borderColor: '#ffcc00',
      color: '#ffcc00'
    },
    editorContainer: {
      flexGrow: 1,
      position: 'relative'
    },
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(8,8,8,0.95)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#00ffff',
      fontFamily: 'VT323, monospace',
      fontSize: '20px',
      zIndex: 1000
    },
    spinner: {
      width: '40px',
      height: '40px',
      border: '3px solid rgba(0,255,255,0.2)',
      borderTopColor: '#00ffff',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      marginBottom: '15px'
    },
    previewContainer: {
      flexGrow: 1,
      background: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'black',
      flexDirection: 'column'
    }
  };

  return (
    <div style={styles.container}>
      {/* LEFT SIDEBAR */}
      <div style={styles.leftSidebar}>
        <button
          onClick={() => navigate('/')}
          style={{...styles.iconBtn}}
          title="Home"
        >
          🏠
        </button>
        <button
          style={{...styles.iconBtn, ...styles.iconBtnActive}}
          title="V.I.B.E. Editor"
        >
          &lt;/&gt;
        </button>
        <button
          style={styles.iconBtn}
          title="Testing Lab"
          onClick={() => navigate('/workbench')}
        >
          🧪
        </button>
      </div>

      {/* LEFT PANE - CHAT */}
      <div style={styles.leftPane}>
        {/* Platform Selector */}
        <div style={styles.controlsTop}>
          <label style={styles.cyberLabel}>⚡ VIBE ENGINE</label>
          
          {/* Project Mode Toggle */}
          <div style={styles.modeToggle}>
            <button
              style={{
                ...styles.modeButton,
                ...((!projectMode) && styles.modeButtonActive)
              }}
              onClick={() => setProjectMode(false)}
            >
              📄 Single File
            </button>
            <button
              style={{
                ...styles.modeButton,
                ...(projectMode && styles.modeButtonActive)
              }}
              onClick={() => setProjectMode(true)}
            >
              📦 Full Project
            </button>
          </div>

          {/* Show framework and bindings selectors only in project mode */}
          {projectMode && (
            <>
              <FrameworkSelector
                selected={framework}
                onChange={setFramework}
              />
              <BindingsSelector
                selected={bindings}
                onChange={setBindings}
              />
            </>
          )}

          {!projectMode && (
            <select
              style={styles.select}
              value={selectedPlatform.id}
              onChange={(e) => setSelectedPlatform(PLATFORMS.find(p => p.id === e.target.value))}
            >
              {PLATFORMS.map(platform => (
                <option key={platform.id} value={platform.id}>
                  {platform.name} [{platform.rating}★] ({platform.type})
                </option>
              ))}
            </select>
          )}

          <div style={{ marginTop: '10px' }}>
            <SDKStatus compact={true} />
          </div>
        </div>

        {/* Chat History */}
        <div style={styles.chatHistory}>
          {chatHistory.map((msg, index) => (
            <div
              key={index}
              style={{
                ...styles.chatBubble,
                ...(msg.type === 'user' ? styles.bubbleUser : styles.bubbleAi)
              }}
            >
              <div style={styles.bubbleMeta}>
                {msg.type === 'ai' && <div style={styles.aiDot}></div>}
                {msg.type === 'user' ? 'YOU' : 'VIBE ENGINE'}
              </div>
              {msg.message}
            </div>
          ))}
          <div ref={chatEndRef}></div>
        </div>

        {/* Input Area */}
        <div style={styles.inputArea}>
          <textarea
            style={styles.textarea}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your app idea here..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.shiftKey) {
                e.preventDefault();
                handleBuildIt();
              }
            }}
          />
          <button 
            style={{
              ...styles.buildBtn,
              opacity: isBuilding ? 0.6 : 1,
              cursor: isBuilding ? 'not-allowed' : 'pointer'
            }} 
            onClick={handleBuildIt}
            disabled={isBuilding}
          >
            {isBuilding ? '⚡ BUILDING...' : '✨ BUILD IT'}
          </button>
        </div>
      </div>

      {/* RIGHT PANE - WORKBENCH */}
      <div style={styles.rightPane}>
        {/* Tabs */}
        <div style={styles.tabsBar}>
          {['code', 'preview', 'data'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                ...styles.tabBtn,
                ...(activeTab === tab ? styles.tabBtnActive : {})
              }}
            >
              {tab === 'code' && '💻 Code'}
              {tab === 'preview' && '👁️ Preview'}
              {tab === 'data' && '🛢️ Data'}
            </button>
          ))}
        </div>

        {/* Content Stage */}
        <div style={styles.contentStage}>
          {/* CODE TAB */}
          {activeTab === 'code' && (
            <div style={styles.stageView}>
              {projectMode && project.files && project.files.length > 0 ? (
                // PROJECT MODE: Show file tree + editor
                <div style={{ display: 'flex', height: '100%' }}>
                  {/* File Tree */}
                  <div style={{ width: '250px', borderRight: '1px solid #333' }}>
                    <FileTree
                      files={project.files}
                      activeFile={activeFile}
                      onFileSelect={setActiveFile}
                    />
                  </div>
                  
                  {/* Editor for selected file */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={styles.toolbar}>
                      <span style={{ color: 'gold', fontWeight: 'bold' }}>
                        📄 {activeFile || 'No file selected'}
                      </span>
                      <div style={styles.toolbarActions}>
                        <button style={styles.toolBtn} onClick={() => {
                          const file = project.files.find(f => f.path === activeFile);
                          if (file) {
                            navigator.clipboard.writeText(file.content);
                          }
                        }}>
                          📄 Copy
                        </button>
                        <button style={{...styles.toolBtn, ...styles.toolBtnGold}} onClick={() => {
                          // Download all files as zip (TODO: implement)
                          alert('Download as .zip coming soon!');
                        }}>
                          ⬇ Download .zip
                        </button>
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <Editor
                        height="100%"
                        language={detectedLanguage}
                        value={project.files.find(f => f.path === activeFile)?.content || '// Select a file from the tree'}
                        onChange={(value) => {
                          // Update file content
                          setProject(prev => ({
                            ...prev,
                            files: prev.files.map(f =>
                              f.path === activeFile ? { ...f, content: value } : f
                            )
                          }));
                        }}
                        onMount={handleEditorDidMount}
                        options={{
                          minimap: { enabled: true },
                          fontSize: 14,
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                          padding: { top: 16, bottom: 16 }
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                // SINGLE FILE MODE: Original editor
                <>
                  <div style={styles.toolbar}>
                    <span>Lang: {detectedLanguage} (Auto-detected)</span>
                    <div style={styles.toolbarActions}>
                      <button style={styles.toolBtn} onClick={handleCopy}>
                        📄 Copy
                      </button>
                      <button style={{...styles.toolBtn, ...styles.toolBtnGold}} onClick={handleSave}>
                        💾 Save
                      </button>
                    </div>
                  </div>
                  <div style={styles.editorContainer}>
                    <Editor
                      height="100%"
                      language={detectedLanguage}
                      value={code}
                      onChange={(value) => setCode(value)}
                      onMount={handleEditorDidMount}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        padding: { top: 16, bottom: 16 }
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* PREVIEW TAB */}
          {activeTab === 'preview' && (
            <div style={styles.stageView}>
              {code && code !== '// Awaiting prompt execution...\n\n' ? (
                <>
                  <div style={styles.toolbar}>
                    <span>Generated Code Preview (Read-only)</span>
                    <div style={styles.toolbarActions}>
                      <button style={styles.toolBtn} onClick={handleCopy}>
                        📄 Copy
                      </button>
                      <button style={{...styles.toolBtn, ...styles.toolBtnGold}} onClick={handleSave}>
                        💾 Save
                      </button>
                    </div>
                  </div>
                  <div style={{ height: 'calc(100% - 50px)', width: '100%' }}>
                    <Editor
                      height="100%"
                      language={detectedLanguage}
                      value={code}
                      theme="vibe-dark"
                      options={{
                        minimap: { enabled: true },
                        fontSize: 14,
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        wordWrap: 'on',
                        readOnly: true,
                        automaticLayout: true
                      }}
                    />
                  </div>
                </>
              ) : (
                <div style={styles.previewContainer}>
                  <h3>[ CODE PREVIEW ]</h3>
                  <p>(Build something first to see the generated code)</p>
                </div>
              )}
            </div>
          )}

          {/* DATA TAB */}
          {activeTab === 'data' && (
            <div style={styles.stageView}>
              <div style={{ padding: '20px', color: '#00ff99', fontFamily: 'Fira Code, monospace' }}>
                <div>&gt; Checking D1 Database connections...</div>
                <div>&gt; No active schemas found.</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          
          ::-webkit-scrollbar {
            width: 8px;
          }
          
          ::-webkit-scrollbar-track {
            background: #0a0a0a;
          }
          
          ::-webkit-scrollbar-thumb {
            background: rgba(0, 255, 255, 0.3);
            border-radius: 4px;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: rgba(0, 255, 255, 0.5);
          }
        `}
      </style>
    </div>
  );
}

export default VibeIDE;
