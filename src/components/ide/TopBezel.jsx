
import React from 'react';
import './TopBezel.css';
import { useRole } from '../../context/RoleContext';

export default function TopBezel() {
  const { role, isOwner, toggleRole } = useRole();

  const userTier = isOwner ? 'Expert Nurd' : 'Growing Nurd';
  const userName = isOwner ? 'Owner' : 'Student';
  const avatarColor = isOwner ? '00D4FF' : '00FF41'; // Cyan for Owner, Green for Student

  return (
    <header className="top-bezel">
      {/* Branding Section */}
      <div className="bezel-left">
        <div className="branding-container">
          <div className="acheevy-avatar">
            {/* ACHEEVY Helmet Placeholder - Replace with actual IMG */}
            <span role="img" aria-label="ACHEEVY">🤖</span>
          </div>
          <div className="branding-text">
            <h1 className="platform-name">NurdsCode</h1>
            <span className="platform-tagline">Think It. Prompt It. Build It.</span>
          </div>
        </div>
        
        {/* Platform Loader (Mock) */}
        <div className="platform-loader">
          <label>Context:</label>
          <select className="context-select" defaultValue="training">
            <option value="training">Training IDE</option>
            <option value="bolt">Bolt.new Replica</option>
            <option value="leap">Magic Leap</option>
          </select>
        </div>
      </div>

      {/* Center: Global Notifications */}
      <div className="bezel-center">
        <div className="notification-pill">
          <span className="status-dot green"></span>
          <span>System Online: All Angs Ready</span>
        </div>
      </div>

      {/* Right: User & Auth */}
      <div className="bezel-right">
        <div 
          className="user-profile-badge" 
          onClick={toggleRole} 
          title="Click to toggle role (Simulated Auth)"
          style={{ cursor: 'pointer' }}
        >
             <span className="user-tier">{userTier}</span>
             <img 
               src={`https://ui-avatars.com/api/?name=${userName}&background=${avatarColor}&color=000`} 
               alt="User" 
               className="user-avatar-img" 
             />
        </div>
      </div>
    </header>
  );
}
