import React from 'react';

/**
 * Loading Screen - Dots Theme
 */
export default function LoadingScreen({ message = 'Loading' }) {
  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        <div style={styles.dotGrid}>
          <span style={{...styles.dot, animationDelay: '0s'}}></span>
          <span style={{...styles.dot, animationDelay: '0.15s'}}></span>
          <span style={{...styles.dot, animationDelay: '0.3s'}}></span>
        </div>
        <div style={styles.message}>{message}</div>
      </div>
      <style>{keyframes}</style>
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
  dotGrid: {
    display: 'flex',
    gap: '10px'
  },
  dot: {
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    background: '#00FF41',
    animation: 'dotPulse 1.2s ease-in-out infinite'
  },
  message: {
    color: '#666',
    fontSize: '14px',
    fontFamily: 'Inter, sans-serif'
  }
};

const keyframes = `
  @keyframes dotPulse {
    0%, 100% { opacity: 0.3; transform: scale(0.8); }
    50% { opacity: 1; transform: scale(1); }
  }
`;
