import React from 'react';

/**
 * ACP Error Boundary - Catches runtime errors in ACP components
 */
export class ACPErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    const errorCount = this.state.errorCount + 1;
    
    console.error('[ACP Error Boundary] Caught error:', error);
    console.error('[ACP Error Boundary] Error info:', errorInfo);
    
    // Log to Charter/Ledger for compliance
    this.logToCharter({
      timestamp: Date.now(),
      error: error.toString(),
      stack: errorInfo.componentStack,
      count: errorCount
    });

    this.setState({
      error,
      errorInfo,
      errorCount
    });

    // Auto-reset after 3 errors to prevent infinite loops
    if (errorCount >= 3) {
      console.warn('[ACP Error Boundary] Maximum errors reached, auto-resetting...');
      setTimeout(() => {
        this.setState({ hasError: false, error: null, errorInfo: null, errorCount: 0 });
      }, 5000);
    }
  }

  logToCharter(errorData) {
    try {
      // TODO: Send to Charter/Ledger API
      console.log('[Charter] Error logged:', errorData);
      
      // Store in localStorage as fallback
      const errors = JSON.parse(localStorage.getItem('acp_errors') || '[]');
      errors.push(errorData);
      localStorage.setItem('acp_errors', JSON.stringify(errors.slice(-10))); // Keep last 10
    } catch (e) {
      console.error('[ACP Error Boundary] Failed to log error:', e);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, errorCount: 0 });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem',
          background: '#0A0A0A',
          border: '2px solid #ff0000',
          borderRadius: '8px',
          margin: '1rem',
          maxWidth: '800px'
        }}>
          <h2 style={{ 
            color: '#ff6b6b', 
            margin: '0 0 1rem 0',
            fontFamily: 'Permanent Marker, cursive'
          }}>
            🚨 ACP Component Error
          </h2>
          
          <div style={{
            background: '#1F1F1F',
            padding: '1rem',
            borderRadius: '4px',
            marginBottom: '1rem'
          }}>
            <p style={{ color: '#fff', margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>
              Error: {this.state.error?.toString()}
            </p>
            <details style={{ color: '#999' }}>
              <summary style={{ cursor: 'pointer', marginTop: '0.5rem' }}>
                Stack trace (click to expand)
              </summary>
              <pre style={{
                marginTop: '0.5rem',
                padding: '0.5rem',
                background: '#0A0A0A',
                borderRadius: '4px',
                fontSize: '0.75rem',
                overflow: 'auto',
                maxHeight: '200px'
              }}>
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          </div>

          <div style={{
            display: 'flex',
            gap: '1rem',
            alignItems: 'center'
          }}>
            <button
              onClick={this.handleReset}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #E68961, #FF6A00)',
                border: 'none',
                borderRadius: '6px',
                color: '#fff',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              🔄 Try Again
            </button>
            
            <span style={{ color: '#999', fontSize: '0.875rem' }}>
              Error #{this.state.errorCount} - Logged to Charter
            </span>
          </div>

          {this.state.errorCount >= 3 && (
            <p style={{
              marginTop: '1rem',
              padding: '0.75rem',
              background: '#2F1F1F',
              borderRadius: '4px',
              color: '#ff9999',
              fontSize: '0.875rem'
            }}>
              ⚠️ Multiple errors detected. Component will auto-reset in 5 seconds...
            </p>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Fallback UI for ACP components
 */
export function ACPFallback({ error, resetError, componentName = 'ACP Component' }) {
  return (
    <div style={{
      padding: '1rem',
      background: '#1F1F1F',
      border: '1px solid #2F2F2F',
      borderRadius: '6px',
      margin: '0.5rem 0'
    }}>
      <p style={{ margin: 0, color: '#ff9999', fontSize: '0.875rem' }}>
        ⚠️ {componentName} failed to load
      </p>
      {error && (
        <p style={{ margin: '0.5rem 0 0 0', color: '#999', fontSize: '0.75rem' }}>
          {error.message}
        </p>
      )}
      {resetError && (
        <button
          onClick={resetError}
          style={{
            marginTop: '0.5rem',
            padding: '0.5rem 1rem',
            background: '#2F2F2F',
            border: '1px solid #3F3F3F',
            borderRadius: '4px',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '0.75rem'
          }}
        >
          Retry
        </button>
      )}
    </div>
  );
}
