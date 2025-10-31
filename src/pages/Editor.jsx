import React, { useState, useEffect } from 'react';

function Editor() {
  const [code, setCode] = useState('// Nurds Code Editor\n// Think It. Prompt It. Build It.\n\nconsole.log("Hello, World!");');
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState('javascript');

  const runCode = () => {
    try {
      // Simple JavaScript execution for demo
      if (language === 'javascript') {
        const logs = [];
        const customConsole = {
          log: (...args) => logs.push(args.join(' ')),
        };
        
        // Create a function with custom console
        const func = new Function('console', code);
        func(customConsole);
        
        setOutput(logs.join('\n') || 'Code executed successfully!');
      } else {
        setOutput('This is a demo editor. Full execution support coming soon!');
      }
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold mb-2 text-text">Editor</h1>
          <p className="tagline text-2xl">Think It. Prompt It. Build It.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor Panel */}
          <div className="panel">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-text">Editor</h2>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="input-field text-sm"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="typescript">TypeScript</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
              </select>
            </div>
            
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-96 bg-background text-text font-mono text-sm p-4 border border-border focus:outline-none focus:border-accent resize-none"
              spellCheck="false"
            />
            
            <button
              onClick={runCode}
              className="btn-primary w-full mt-4"
            >
              Run Code
            </button>
          </div>

          {/* Output Panel */}
          <div className="panel">
            <h2 className="text-xl font-semibold mb-4 text-text">Output</h2>
            <div className="bg-background text-text font-mono text-sm p-4 border border-border h-96 overflow-auto">
              {output ? (
                <pre className="whitespace-pre-wrap">{output}</pre>
              ) : (
                <div className="text-mute">Output will appear here...</div>
              )}
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
            <div className="text-3xl mb-3">💾</div>
            <h3 className="text-lg font-semibold mb-2 text-accent">Auto-Save</h3>
            <p className="text-mute text-sm">
              Your code is automatically saved as you type
            </p>
          </div>
          <div className="panel text-center">
            <div className="text-3xl mb-3">🔧</div>
            <h3 className="text-lg font-semibold mb-2 text-accent">Multi-Language</h3>
            <p className="text-mute text-sm">
              Support for JavaScript, Python, TypeScript, and more
            </p>
          </div>
        </div>

        {/* Pro Features CTA */}
        <div className="panel mt-8 border-2 border-accent">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4 text-text">Unlock Pro Features</h3>
            <p className="text-text mb-6">
              Get access to advanced debugging, code sharing, team collaboration, and more
            </p>
            <button className="btn-primary">
              Upgrade to Pro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Editor;
