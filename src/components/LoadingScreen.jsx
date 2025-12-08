import React, { useState, useEffect } from 'react';

/**
 * Loading Screen with Count Timer
 * Shows loading progress with elapsed time
 */
function LoadingScreen({ message = 'Initializing...', onComplete }) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    // Timer for elapsed seconds
    const timerInterval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    // Animated dots
    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => {
      clearInterval(timerInterval);
      clearInterval(dotsInterval);
    };
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        {/* Animated Logo */}
        <div style={styles.logoContainer}>
          <div style={styles.spinnerOuter}>
            <div style={styles.spinnerInner}>
              <span style={styles.logo}>⚡</span>
            </div>
          </div>
        </div>

        {/* Loading Message */}
        <div style={styles.message}>
          {message}{dots}
        </div>

        {/* Timer */}
        <div style={styles.timer}>
          <span style={styles.timerLabel}>Time Elapsed:</span>
          <span style={styles.timerValue}>{formatTime(elapsedTime)}</span>
        </div>

        {/* Progress Bar */}
        <div style={styles.progressBar}>
          <div style={styles.progressFill} />
        </div>

        {/* Status Text */}
        <div style={styles.statusText}>
          Loading SDKs and initializing platform...
        </div>
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
    background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    fontFamily: 'monospace'
  },
  container: {
    textAlign: 'center',
    color: '#00ff88',
    maxWidth: '400px',
    padding: '40px'
  },
  logoContainer: {
    marginBottom: '30px',
    display: 'flex',
    justifyContent: 'center'
  },
  spinnerOuter: {
    width: '120px',
    height: '120px',
    border: '3px solid #00ff8820',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'spin 3s linear infinite'
  },
  spinnerInner: {
    width: '80px',
    height: '80px',
    border: '3px solid #00ff8840',
    borderTop: '3px solid #00ff88',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'spin 1.5s linear infinite'
  },
  logo: {
    fontSize: '48px',
    animation: 'pulse 2s ease-in-out infinite'
  },
  message: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#00ff88',
    minHeight: '30px'
  },
  timer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '25px',
    fontSize: '16px'
  },
  timerLabel: {
    color: '#6bcfff',
    fontWeight: 'normal'
  },
  timerValue: {
    color: '#00ff88',
    fontSize: '24px',
    fontWeight: 'bold',
    fontFamily: 'monospace',
    background: '#0f0f1a',
    padding: '5px 15px',
    borderRadius: '5px',
    border: '1px solid #00ff8840'
  },
  progressBar: {
    width: '100%',
    height: '4px',
    background: '#1a1a2e',
    borderRadius: '2px',
    overflow: 'hidden',
    marginBottom: '20px',
    border: '1px solid #00ff8820'
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #00ff88, #6bcfff)',
    width: '100%',
    animation: 'progress 2s ease-in-out infinite'
  },
  statusText: {
    fontSize: '12px',
    color: '#6bcfff',
    opacity: 0.7
  }
};

// Add keyframe animations via a style tag
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    @keyframes pulse {
      0%, 100% { 
        transform: scale(1); 
        opacity: 1;
      }
      50% { 
        transform: scale(1.1); 
        opacity: 0.8;
      }
    }
    
    @keyframes progress {
      0% { 
        transform: translateX(-100%);
        opacity: 0.5;
      }
      50% {
        opacity: 1;
      }
      100% { 
        transform: translateX(100%);
        opacity: 0.5;
      }
    }
  `;
  
  if (!document.getElementById('loading-screen-animations')) {
    styleSheet.id = 'loading-screen-animations';
    document.head.appendChild(styleSheet);
  }
}

export default LoadingScreen;
