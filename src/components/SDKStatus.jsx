import React, { useState, useEffect } from 'react';
import { sdkManager } from '../utils/sdkManager';
import LoadingScreen from './LoadingScreen';

/**
 * SDK Status Display Component
 * Shows the status of all configured SDKs for stack building and tool calling
 */
function SDKStatus({ compact = false, showFullScreenLoader = false }) {
  const [sdkStatus, setSdkStatus] = useState({});
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeSDKs();
  }, []);

  const initializeSDKs = async () => {
    setLoading(true);
    const result = await sdkManager.initializeAll();
    setSdkStatus(sdkManager.getStatus());
    setInitialized(result.success);
    setLoading(false);
  };

  if (loading) {
    // Show full-screen loader if requested
    if (showFullScreenLoader) {
      return <LoadingScreen message="Initializing All SDKs" />;
    }
    
    return (
      <div style={compact ? styles.compactContainer : styles.container}>
        <div style={styles.loading}>
          <span style={styles.spinner}>⚡</span>
          <span>Initializing SDKs...</span>
        </div>
      </div>
    );
  }

  if (compact) {
    const readyCount = Object.values(sdkStatus).filter(s => 
      s.status === 'ready' || s.status === 'ready_simulation'
    ).length;
    const totalCount = Object.keys(sdkStatus).length;

    return (
      <div style={styles.compactStatus}>
        <span style={styles.compactLabel}>SDKs:</span>
        <span style={readyCount === totalCount ? styles.allReady : styles.someReady}>
          {readyCount}/{totalCount} Ready
        </span>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.title}>🛠️ SDK Status</span>
        <button style={styles.refreshBtn} onClick={initializeSDKs}>
          🔄 Refresh
        </button>
      </div>
      
      <div style={styles.sdkList}>
        {Object.entries(sdkStatus).map(([key, sdk]) => {
          const isReady = sdk.status === 'ready' || sdk.status === 'ready_simulation';
          const isError = sdk.status === 'error';
          
          return (
            <div key={key} style={styles.sdkItem}>
              <div style={styles.sdkMain}>
                <span style={styles.sdkIcon}>
                  {isReady ? '✅' : isError ? '❌' : '⏳'}
                </span>
                <div style={styles.sdkInfo}>
                  <div style={styles.sdkName}>{sdk.name}</div>
                  <div style={getStatusStyle(sdk.status)}>
                    {sdk.status.replace('_', ' ')}
                  </div>
                </div>
              </div>
              {sdk.error && (
                <div style={styles.errorMessage}>{sdk.error}</div>
              )}
            </div>
          );
        })}
      </div>

      <div style={styles.footer}>
        <div style={styles.summary}>
          All SDKs available for stack building and tool calling
        </div>
      </div>
    </div>
  );
}

const getStatusStyle = (status) => {
  const baseStyle = styles.sdkStatus;
  
  if (status === 'ready') {
    return { ...baseStyle, color: '#00ff88' };
  } else if (status === 'ready_simulation') {
    return { ...baseStyle, color: '#ffd93d' };
  } else if (status === 'error') {
    return { ...baseStyle, color: '#ff6b6b' };
  } else {
    return { ...baseStyle, color: '#6bcfff' };
  }
};

const styles = {
  container: {
    background: '#1a1a2e',
    border: '1px solid #00ff88',
    borderRadius: '8px',
    padding: '15px',
    color: '#00ff88',
    fontFamily: 'monospace'
  },
  compactContainer: {
    padding: '10px',
    borderRadius: '5px',
    background: '#0f0f1a'
  },
  compactStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '12px',
    padding: '5px 10px',
    background: '#1a1a2e',
    borderRadius: '5px',
    border: '1px solid #00ff88'
  },
  compactLabel: {
    color: '#00ff88',
    fontWeight: 'bold'
  },
  allReady: {
    color: '#00ff88',
    fontWeight: 'bold'
  },
  someReady: {
    color: '#ffd93d',
    fontWeight: 'bold'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
    paddingBottom: '10px',
    borderBottom: '1px solid #00ff88'
  },
  title: {
    fontSize: '16px',
    fontWeight: 'bold'
  },
  refreshBtn: {
    background: 'transparent',
    border: '1px solid #00ff88',
    color: '#00ff88',
    padding: '5px 10px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'all 0.3s'
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    justifyContent: 'center',
    padding: '20px',
    color: '#6bcfff'
  },
  spinner: {
    fontSize: '24px',
    animation: 'pulse 1s infinite'
  },
  sdkList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  sdkItem: {
    background: '#0f0f1a',
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #2a2a3e'
  },
  sdkMain: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  sdkIcon: {
    fontSize: '20px'
  },
  sdkInfo: {
    flex: 1
  },
  sdkName: {
    fontWeight: 'bold',
    marginBottom: '3px',
    color: '#00ff88'
  },
  sdkStatus: {
    fontSize: '12px',
    textTransform: 'uppercase'
  },
  errorMessage: {
    marginTop: '8px',
    padding: '8px',
    background: '#2e1a1a',
    color: '#ff6b6b',
    borderRadius: '3px',
    fontSize: '12px'
  },
  footer: {
    marginTop: '15px',
    paddingTop: '10px',
    borderTop: '1px solid #2a2a3e'
  },
  summary: {
    fontSize: '12px',
    color: '#6bcfff',
    textAlign: 'center'
  }
};

export default SDKStatus;
