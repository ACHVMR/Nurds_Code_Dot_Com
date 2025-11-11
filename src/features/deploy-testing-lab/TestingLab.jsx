import React, { useState } from 'react';
import { NothingBrandProvider } from '../deploy-workbench/NothingBrandProvider';
import { DeployErrorBoundary } from '../deploy-workbench/ErrorBoundary';
import { Play, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

/**
 * TestingLab
 * Deploy Testing Lab component for running API tests and viewing results
 */
export function TestingLab() {
  const [scenarios, setScenarios] = useState([
    { id: 1, name: 'User Authentication', status: 'idle', duration: null },
    { id: 2, name: 'Data Fetch API', status: 'idle', duration: null },
    { id: 3, name: 'Payment Flow', status: 'idle', duration: null }
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState(null);

  const runTests = async () => {
    if (isRunning) {
      console.warn('[Charter] Tests already running');
      return;
    }

    setIsRunning(true);
    setError(null);
    
    try {
      // Validate scenarios exist
      if (!scenarios || scenarios.length === 0) {
        throw new Error('No test scenarios available');
      }

      // Reset all scenarios to idle
      setScenarios(prev => prev.map(s => ({ ...s, status: 'idle', duration: null })));

      for (let i = 0; i < scenarios.length; i++) {
        try {
          setScenarios(prev => prev.map((s, idx) => 
            idx === i ? { ...s, status: 'running' } : s
          ));
          
          // Simulate test execution
          await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
          
          const passed = Math.random() > 0.2;
          const duration = (1500 + Math.random() * 1000).toFixed(0);
          
          setScenarios(prev => prev.map((s, idx) => 
            idx === i ? { ...s, status: passed ? 'passed' : 'failed', duration } : s
          ));

          console.log('[Charter] Test scenario completed', { 
            id: scenarios[i].id, 
            name: scenarios[i].name, 
            passed, 
            duration 
          });
        } catch (err) {
          console.error('[Ledger] Test scenario failed:', { 
            id: scenarios[i].id, 
            error: err.message 
          });
          
          setScenarios(prev => prev.map((s, idx) => 
            idx === i ? { ...s, status: 'failed', duration: null } : s
          ));
        }
      }

      console.log('[Charter] All tests completed');
    } catch (err) {
      const errorMsg = err?.message || 'Unknown error occurred';
      setError(`Test run failed: ${errorMsg}`);
      console.error('[Ledger] Test run error:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running':
        return <Clock size={20} className="animate-spin" style={{ color: '#FFD700' }} />;
      case 'passed':
        return <CheckCircle size={20} style={{ color: '#00FF00' }} />;
      case 'failed':
        return <XCircle size={20} style={{ color: '#FF0000' }} />;
      default:
        return <Clock size={20} style={{ color: '#666' }} />;
    }
  };

  return (
    <DeployErrorBoundary>
      <NothingBrandProvider>
        <div className="testing-lab-container" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
          <header className="testing-lab-header" style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Deploy Testing Lab</h1>
            <p style={{ color: '#999', marginBottom: '1.5rem' }}>
              Run automated tests against your plug endpoints and view community results
            </p>
            
            <button 
              className="nb-button"
              onClick={runTests}
              disabled={isRunning}
              style={{ 
                opacity: isRunning ? 0.5 : 1,
                cursor: isRunning ? 'not-allowed' : 'pointer'
              }}
            >
              <Play size={16} style={{ marginRight: '0.5rem', display: 'inline' }} />
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </button>

            {error && (
              <div className="nb-card" style={{ 
                marginTop: '1rem', 
                padding: '1rem', 
                borderLeft: '3px solid #ff0000',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <AlertCircle size={20} style={{ color: '#ff0000', flexShrink: 0 }} />
                <p style={{ margin: 0, color: '#ff6b6b' }}>{error}</p>
              </div>
            )}
          </header>

          <div className="test-results nb-card nb-dots" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Test Scenarios</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {scenarios.map(scenario => (
                <div 
                  key={scenario.id} 
                  className="nb-card-glass" 
                  style={{ 
                    padding: '1rem', 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {getStatusIcon(scenario.status)}
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1rem' }}>{scenario.name}</h3>
                      {scenario.duration && (
                        <p style={{ margin: '0.25rem 0 0', color: '#999', fontSize: '0.875rem' }}>
                          Completed in {scenario.duration}ms
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    backgroundColor: scenario.status === 'passed' ? 'rgba(0, 255, 0, 0.1)' : 
                                     scenario.status === 'failed' ? 'rgba(255, 0, 0, 0.1)' : 
                                     'transparent'
                  }}>
                    {scenario.status}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="nb-card nb-stripe" style={{ marginTop: '2rem', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Community Results</h3>
            <p style={{ color: '#999', fontSize: '0.875rem', margin: 0 }}>
              Shared Testing Lab results from Supabase will appear here (RLS-protected, read-only for anon users)
            </p>
          </div>
        </div>
      </NothingBrandProvider>
    </DeployErrorBoundary>
  );
}
