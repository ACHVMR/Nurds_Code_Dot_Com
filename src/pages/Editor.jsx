import React, { useState, useRef, useEffect } from 'react';
import Editor, { loader } from '@monaco-editor/react';
import { useLocation, Link } from 'react-router-dom';
import { INTELLIGENT_INTERNET_REPOS } from '../data/intelligentInternet';

// Configure Monaco loader
loader.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs' } });

function CodeEditor() {
  const location = useLocation();
  const [code, setCode] = useState('// Start coding here...\n\n');
  
  // Handle incoming prompt from Side Panel
  useEffect(() => {
    if (location.state?.initialPrompt) {
      setCode(`// Generating code for: "${location.state.initialPrompt}"...\n\n// ACHEEVY is thinking...`);
      // In a real implementation, this would trigger the AI generation call
      setTimeout(() => {
        setCode(`// Generated based on: "${location.state.initialPrompt}"\n\nfunction solution() {\n  console.log("V.I.B.E. Engine requires an API key for live generation.");\n  // Integrate actual AI call here\n}`);
      }, 1500);
    }
  }, [location.state]);

  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState('javascript');
  const editorRef = useRef(null);

  const handleEditorDidMount = (editor, monaco) => {
    // ... (theme code)
    editorRef.current = editor;
    
    // Define custom theme
    monaco.editor.defineTheme('nurdscode-theme', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '808080' },
        { token: 'keyword', foreground: '39FF14' },
        { token: 'string', foreground: 'FFC83B' },
      ],
      colors: {
        'editor.background': '#0a0a0a',
        'editor.lineHighlightBackground': '#1a1a1a',
        'editorCursor.foreground': '#FFC83B',
      }
    });
    
    monaco.editor.setTheme('nurdscode-theme');
  };

  const runCode = () => {
     // ... (keep runCode)
    try {
      if (language === 'javascript') {
        const logs = [];
        const customConsole = {
          log: (...args) => logs.push(args.join(' ')),
          error: (...args) => logs.push('Error: ' + args.join(' ')),
          warn: (...args) => logs.push('Warning: ' + args.join(' ')),
        };
        
        // Create a safe execution environment
        const func = new Function('console', code);
        func(customConsole);
        
        setOutput(logs.join('\n') || 'Code executed successfully (no output)');
      } else {
        setOutput(`Execution for ${language} is coming soon! For now, enjoy the syntax highlighting.`);
      }
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    }
  };

  const downloadCode = () => {
    // ... (keep downloadCode)
    const blob = new Blob([code], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `script.${language === 'javascript' ? 'js' : language === 'python' ? 'py' : 'txt'}`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 flex flex-col">
      <div className="max-w-7xl mx-auto w-full grow flex flex-col">
        <div className="mb-6 text-center">
          <h1 className="text-5xl font-bold mb-2 text-text font-doto tracking-widest" style={{ textShadow: '0 0 20px rgba(0, 255, 136, 0.4)' }}>
            The V.I.B.E.
          </h1>
          <div className="flex items-center justify-center gap-4 mb-2">
            <p className="tagline text-xl font-mono text-accent">Think It. Prompt It. Build It.</p>
            <Link 
              to="/agents" 
              className="px-3 py-1 rounded-full text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/40 hover:bg-orange-500/30 transition-all"
            >
              🤖 Open Agent Builder
            </Link>
          </div>
        </div>

        <div className="grow flex gap-6">
          {/* Repository Context Sidebar */}
          <div className="w-64 shrink-0 hidden lg:block panel overflow-y-auto" style={{ maxHeight: '600px' }}>
            <h2 className="text-xl font-semibold mb-4 text-text flex items-center gap-2">
              <span>🌐</span> Intelligent Internet
            </h2>
            <p className="text-xs text-mute mb-4">Live Context from Circuit Box</p>

            {/* Repo List */}
            <div className="space-y-4">
              {['orchestration', 'plug-factory', 'specialist'].map(tier => {
                const repos = INTELLIGENT_INTERNET_REPOS.filter(r => r.tier === tier);
                if (repos.length === 0) return null;
                
                return (
                  <div key={tier}>
                    <h3 className="text-xs uppercase font-bold text-accent mb-2">
                      {tier.replace('-', ' ')}
                    </h3>
                    <div className="space-y-2">
                      {repos.map((repo, i) => (
                        <div key={repo.id} className="flex items-center justify-between p-2 rounded bg-black/20 border border-white/5">
                          <span className="text-sm text-gray-300">{repo.name}</span>
                          <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${repo.status === 'online' ? 'animate-pulse' : ''}`} 
                                  style={{ background: repo.status === 'online' ? 'var(--neon-green)' : 'gray' }}></span>
                            <span className="text-[10px]" style={{ color: repo.status === 'online' ? 'var(--neon-green)' : 'gray' }}>
                              {repo.status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              
              <div className="mt-4 p-3 rounded bg-accent/10 border border-accent/20">
                <p className="text-xs text-accent">
                  ℹ️ Your code has read/write access to these repositories via the Vibe SDK.
                </p>
              </div>
            </div>
          </div>

          <div className="grow flex flex-col">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 grow">
              {/* Editor Panel */}
              <div className="panel flex flex-col h-[600px]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <h2 className="text-xl font-semibold text-text">Code</h2>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="input-field text-sm py-1"
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="python">Python</option>
                      <option value="typescript">TypeScript</option>
                      <option value="html">HTML</option>
                      <option value="css">CSS</option>
                      <option value="json">JSON</option>
                      <option value="sql">SQL</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={downloadCode}
                      className="btn-secondary text-sm px-3 py-1"
                      title="Download Code"
                    >
                      ⬇️
                    </button>
                    <button
                      onClick={runCode}
                      className="btn-primary text-sm px-4 py-1"
                    >
                      Run ▶
                    </button>
                  </div>
                </div>
                
                <div className="grow border border-border overflow-hidden rounded-md">
                  <Editor
                    height="100%"
                    defaultLanguage="javascript"
                    language={language}
                    value={code}
                    onChange={(value) => setCode(value)}
                    onMount={handleEditorDidMount}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      padding: { top: 16, bottom: 16 },
                    }}
                  />
                </div>
              </div>

              {/* Output Panel */}
              <div className="panel flex flex-col h-[600px]">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-text">Output</h2>
                  <button
                    onClick={() => setOutput('')}
                    className="text-xs text-mute hover:text-text"
                  >
                    Clear
                  </button>
                </div>
                <div className="grow bg-black font-mono text-sm p-4 border border-border overflow-auto rounded-md shadow-inner" style={{ color: 'var(--neon-green)' }}>
                  {output ? (
                    <pre className="whitespace-pre-wrap">{output}</pre>
                  ) : (
                    <div className="text-gray-600 italic select-none">
                      // Output will appear here...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="panel text-center">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="text-lg font-semibold mb-2 text-accent">Instant Execution</h3>
            <p className="text-mute text-sm">
              Run your code instantly and see results in real-time
            </p>
          </div>
          <div className="panel text-center">
            <div className="text-3xl mb-3">🎨</div>
            <h3 className="text-lg font-semibold mb-2 text-accent">Syntax Highlighting</h3>
            <p className="text-mute text-sm">
              Professional grade highlighting for over 50 languages
            </p>
          </div>
          <div className="panel text-center">
            <div className="text-3xl mb-3">💾</div>
            <h3 className="text-lg font-semibold mb-2 text-accent">Download Code</h3>
            <p className="text-mute text-sm">
              Save your work locally with a single click
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CodeEditor;
