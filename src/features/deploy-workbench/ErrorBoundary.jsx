import React, { Component } from 'react';

/**
 * Error boundary for Deploy Workbench
 * Catches runtime errors and displays a fallback UI
 */
export class DeployErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[Ledger] Deploy Workbench error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="deploy-error-container">
          <div className="deploy-error-card">
            <h1 className="deploy-error-title">
              Something went wrong
            </h1>
            <p className="deploy-error-message">
              The Deploy Workbench encountered an error. Please try refreshing the page.
            </p>
            {this.state.error && (
              <details className="deploy-error-details">
                <summary className="deploy-error-summary">
                  Error details
                </summary>
                <pre className="deploy-error-stack">
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="deploy-error-reload"
            >
              Reload page
            </button>
          </div>
          <style>{`
            .deploy-error-container {
              padding: 2rem;
              background-color: #000;
              color: #fff;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-direction: column;
            }
            .deploy-error-card {
              max-width: 600px;
              padding: 2rem;
              background-color: #1a1a1a;
              border: 2px solid #ff0000;
              border-radius: 8px;
            }
            .deploy-error-title {
              color: #ff0000;
              margin-bottom: 1rem;
            }
            .deploy-error-message {
              margin-bottom: 1rem;
              color: #ccc;
            }
            .deploy-error-details {
              margin-top: 1rem;
            }
            .deploy-error-summary {
              cursor: pointer;
              color: #999;
            }
            .deploy-error-stack {
              margin-top: 0.5rem;
              padding: 1rem;
              background-color: #000;
              color: #ff6b6b;
              font-size: 0.875rem;
              overflow: auto;
              border-radius: 4px;
            }
            .deploy-error-reload {
              margin-top: 1.5rem;
              padding: 0.75rem 1.5rem;
              background-color: #fff;
              color: #000;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-weight: bold;
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}
