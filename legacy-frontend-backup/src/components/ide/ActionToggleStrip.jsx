
import React from 'react';
import './ActionToggleStrip.css';

export default function ActionToggleStrip() {
  return (
    <div className="action-toggle-strip">
      <div className="strip-group">
        <button className="strip-btn" title="Upload File">📂</button>
        <button className="strip-btn" title="Model Switcher">🧠</button>
      </div>

      <div className="strip-group">
        <button className="strip-btn primary" title="Run Code">▶</button>
      </div>

      <div className="strip-group">
        <button className="strip-btn" title="Settings">⚙️</button>
      </div>
    </div>
  );
}
