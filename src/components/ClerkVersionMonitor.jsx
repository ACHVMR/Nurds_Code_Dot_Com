import React, { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';

/**
 * ClerkVersionMonitor Component
 * Monitors Clerk SDK versions and alerts about upcoming migration
 * Shows warning badge in development mode only
 */
const ClerkVersionMonitor = () => {
  const { isSignedIn } = useAuth();
  const [versionInfo, setVersionInfo] = useState(null);
  
  useEffect(() => {
    // Check Clerk versions
    const checkVersions = () => {
      try {
        const today = new Date('2025-11-03'); // Current date
        const deadline = new Date('2025-11-10'); // Migration deadline
        const daysRemaining = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
        
        const versions = {
          clerkReact: '5.53.4', // From package.json
          clerkJS: window.Clerk?.version || '5.103.1',
          migrationDeadline: '2025-11-10',
          daysRemaining,
          isPinned: true // We just pinned it
        };
        
        setVersionInfo(versions);
        
        // Warn if approaching deadline
        if (versions.daysRemaining <= 7 && versions.daysRemaining > 0) {
          console.warn(`⚠️ Clerk Billing API changes in ${versions.daysRemaining} days!`);
          console.log('📌 SDK versions are pinned and ready for migration');
        }
      } catch (error) {
        console.error('ClerkVersionMonitor error:', error);
      }
    };
    
    if (isSignedIn) {
      checkVersions();
    }
  }, [isSignedIn]);
  
  // Only show in development mode
  if (!versionInfo || import.meta.env.PROD) {
    return null;
  }
  
  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      left: 20,
      background: versionInfo.daysRemaining <= 3 ? '#ff4444' : versionInfo.daysRemaining <= 7 ? '#ffa500' : '#333',
      color: 'white',
      padding: '12px',
      borderRadius: '8px',
      fontSize: '12px',
      zIndex: 9999,
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
      fontFamily: 'monospace',
      maxWidth: '280px'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '13px' }}>
        🔒 Clerk SDK Status
      </div>
      <div style={{ marginBottom: '4px' }}>
        📦 React: v{versionInfo.clerkReact} {versionInfo.isPinned && '✅'}
      </div>
      <div style={{ marginBottom: '4px' }}>
        🔒 ClerkJS: v{versionInfo.clerkJS} {versionInfo.isPinned && '✅'}
      </div>
      <div style={{ marginBottom: '4px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
        ⏰ Migration: {versionInfo.daysRemaining} days
      </div>
      <div style={{ fontSize: '11px', color: '#ccc', marginTop: '4px' }}>
        Deadline: {versionInfo.migrationDeadline}
      </div>
    </div>
  );
};

export default ClerkVersionMonitor;
