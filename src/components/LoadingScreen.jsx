import React, { useState, useEffect } from 'react';

/**
 * Loading Screen - Matte Black Theme
 * Clean, minimal loading indicator
 */
function LoadingScreen({ message = 'Loading...' }) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        <div style={styles.spinner} />
        <div style={styles.message}>{message}{dots}</div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: '#0A0A0A',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '24px'
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '3px solid #1A1A1A',
    borderTopColor: '#00FF41',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite'
  },
  message: {
    color: '#888',
    fontSize: '14px',
    fontFamily: 'Inter, sans-serif',
    minWidth: '140px'
  }
};

// Add spinner animation
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
  if (!document.getElementById('loading-spinner-style')) {
    style.id = 'loading-spinner-style';
    document.head.appendChild(style);
  }
}

export default LoadingScreen;
