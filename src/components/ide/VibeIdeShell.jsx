
import React from 'react';
import './VibeIdeShell.css';
import TopBezel from './TopBezel';
import MainContentWindow from './MainContentWindow';
import RightMarginRail from './RightMarginRail';
import ActionToggleStrip from './ActionToggleStrip';

export default function VibeIdeShell() {
  return (
    <div className="vibe-ide-shell matte-black-theme">
      {/* Top Bezel: Branding & Context */}
      <TopBezel />

      <div className="ide-workspace">
        {/* Main Content: Editor & Output */}
        <div className="main-content-area">
          <MainContentWindow />
          
          {/* Floating Action Strip */}
          <ActionToggleStrip />
        </div>

        {/* Right Rail: Collab & AI */}
        <RightMarginRail />
      </div>
    </div>
  );
}
