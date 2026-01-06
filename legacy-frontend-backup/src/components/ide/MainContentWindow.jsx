
import React, { useState } from 'react';
import './MainContentWindow.css';
import Editor from '@monaco-editor/react';

export default function MainContentWindow() {
  const [code, setCode] = useState(`// Welcome to NurdsCode V.I.B.E. Editor
// Context: Training Mode
// Agent: Coding_Ang ready.

function initSystem() {
  console.log("System initialized.");
  return "Ready to build.";
}

// Start prompt below...
`);

  return (
    <div className="main-content-window">
      {/* Tab Bar */}
      <div className="editor-tabs">
        <div className="tab active">
          <span className="tab-icon">📄</span>
          <span className="tab-name">main.js</span>
          <span className="tab-close">×</span>
        </div>
        <div className="tab">
          <span className="tab-icon">📄</span>
          <span className="tab-name">styles.css</span>
        </div>
        <div className="tab-add">+</div>
      </div>

      {/* Editor Surface */}
      <div className="editor-surface">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value)}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "'Doto', 'Courier New', monospace",
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 16 }
          }}
        />
      </div>

      {/* Terminal / Output Panel */}
      <div className="output-panel">
        <div className="panel-header">
          <span className="panel-title">TERMINAL</span>
          <span className="panel-status">Ready</span>
        </div>
        <div className="terminal-content">
          <div className="log-line"><span className="log-prefix">➜</span> <span className="log-cmd">top</span></div>
          <div className="log-line">Tasks: 19 agents, 1 running, 18 sleeping</div>
          <div className="log-line">Load average: 0.00, 0.01, 0.05</div>
          <div className="log-line"><span className="log-prefix">➜</span> <span className="log-cursor">_</span></div>
        </div>
      </div>
    </div>
  );
}
