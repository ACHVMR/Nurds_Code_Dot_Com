import React, { useState } from 'react';
import { NothingBrandProvider } from './NothingBrandProvider';
import { DeployErrorBoundary } from './ErrorBoundary';
import Editor from '@monaco-editor/react';
import { Save, Download, Play } from 'lucide-react';
import { IntentButtons } from '../../acp-integration/ui/components/IntentButtons';
import { 
  ReimagineModal, 
  ImportModal, 
  LabModal, 
  AgentsModal 
} from '../../acp-integration/ui/components/IntentModals';
import '../../acp-integration/ui/components/IntentButtons.css';
import '../../acp-integration/ui/components/IntentModals.css';

/**
 * WorkbenchShell
 * Deploy Workbench main component with Monaco editor, file tree, and Export Plug Code action
 */
export function WorkbenchShell({ onExport }) {
  const [code, setCode] = useState('// Start coding...\n');
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState('');
  const [error, setError] = useState(null);
  const [activeIntent, setActiveIntent] = useState(null);
  
  // Modal states
  const [showReimagineModal, setShowReimagineModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showLabModal, setShowLabModal] = useState(false);
  const [showAgentsModal, setShowAgentsModal] = useState(false);

  const handleIntent = async (intent) => {
    console.log(`[Workbench] Intent selected: ${intent}`);
    setActiveIntent(intent);
    
    // Open appropriate modal based on intent
    switch (intent) {
      case 're-imagine':
        setShowReimagineModal(true);
        break;
      case 'import':
        setShowImportModal(true);
        break;
      case 'lab':
        setShowLabModal(true);
        break;
      case 'agents':
        setShowAgentsModal(true);
        break;
    }
  };

  // Backend API calls
  const handleReimagineSubmit = async (data) => {
    console.log('[ACP] RE-IMAGINE request:', data);
    
    const response = await fetch('/api/acp/reimagine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    // TODO: Handle response
    console.log('[ACP] Reimagine response:', result);
    setExportStatus(`✨ Analysis complete for ${result.competitorUrl}.`);
  };

  const handleImportSubmit = async (data) => {
    console.log('[ACP] IMPORT request:', data);
    
    const response = await fetch('/api/acp/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (result.status === 'pending') {
      setExportStatus(`📥 Repository import queued for ${result.repoUrl}.`);
      // TODO: Update UI based on import status
      console.log('[ACP] Import status:', result.message);
    }
  };

  const handleLabSubmit = async (data) => {
    console.log('[ACP] LAB request:', data);
    
    const response = await fetch('/api/acp/lab', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (result.status === 'submitted') {
      setExportStatus(`🧪 Submission ${result.submissionId} received by the lab.`);
      console.log('[ACP] Lab submission result:', result);
    }
  };

  const handleAgentsSubmit = async (data) => {
    console.log('[ACP] AGENTS request:', data);
    
    const response = await fetch('/api/acp/agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (result.status === 'provisioning') {
      setExportStatus(`🤖 Agent '${result.agentName}' is being provisioned.`);
      console.log('[ACP] Agent provisioned:', result);
    }
  };

  const handleExport = async () => {
    // Validate before exporting
    if (!code || code.trim() === '' || code.trim() === '// Start coding...') {
      setError('Cannot export empty code. Please write some code first.');
      setExportStatus('');
      return;
    }

    setIsExporting(true);
    setExportStatus('Exporting plug code...');
    setError(null);
    
    try {
      if (!onExport || typeof onExport !== 'function') {
        throw new Error('Export handler not configured');
      }
      
      await onExport({ 
        plugId: 'demo-plug',
        workspaceBundle: { 
          files: { 'index.js': code } 
        }
      });
      
      setExportStatus('Export complete! Check your PR.');
    } catch (err) {
      const errorMsg = err?.message || 'Unknown error occurred';
      setError(`Export failed: ${errorMsg}`);
      setExportStatus('');
      console.error('[Charter] Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCodeChange = (value) => {
    setCode(value || '');
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  return (
    <DeployErrorBoundary>
      <NothingBrandProvider>
        {/* Intent Modals */}
        <ReimagineModal 
          isOpen={showReimagineModal}
          onClose={() => setShowReimagineModal(false)}
          onSubmit={handleReimagineSubmit}
        />
        <ImportModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onSubmit={handleImportSubmit}
        />
        <LabModal
          isOpen={showLabModal}
          onClose={() => setShowLabModal(false)}
          onSubmit={handleLabSubmit}
        />
        <AgentsModal
          isOpen={showAgentsModal}
          onClose={() => setShowAgentsModal(false)}
          onSubmit={handleAgentsSubmit}
        />
        
        <div className="workbench-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
          <header className="workbench-header nb-card" style={{ padding: '1rem', borderBottom: '1px solid #1F1F1F' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Deploy Workbench</h1>
                <p style={{ margin: '0.5rem 0 0', color: '#999', fontSize: '0.875rem' }}>
                  Build, test, and export your plug code
                </p>
              </div>
              <IntentButtons onIntent={handleIntent} />
            </div>
          </header>
          
          <div className="workbench-body" style={{ flex: 1, display: 'flex' }}>
            <aside className="file-tree nb-card" style={{ width: '250px', borderRight: '1px solid #1F1F1F', padding: '1rem' }}>
              <h3 style={{ fontSize: '0.875rem', marginBottom: '1rem', textTransform: 'uppercase', color: '#999' }}>Files</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ padding: '0.5rem', cursor: 'pointer', borderRadius: '4px' }} className="nb-stripe">
                  📄 index.js
                </li>
                <li style={{ padding: '0.5rem', cursor: 'pointer', borderRadius: '4px', marginTop: '0.25rem' }}>
                  📄 utils.js
                </li>
              </ul>
            </aside>
            
            <main className="editor-main" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div className="editor-toolbar" style={{ padding: '0.5rem 1rem', borderBottom: '1px solid #1F1F1F', display: 'flex', gap: '0.5rem' }}>
                <button className="nb-button" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                  <Save size={16} style={{ marginRight: '0.5rem', display: 'inline' }} />
                  Save
                </button>
                <button className="nb-button" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                  <Play size={16} style={{ marginRight: '0.5rem', display: 'inline' }} />
                  Run
                </button>
                <button 
                  className="nb-button" 
                  style={{ 
                    padding: '0.5rem 1rem', 
                    fontSize: '0.875rem', 
                    marginLeft: 'auto',
                    opacity: isExporting ? 0.6 : 1,
                    cursor: isExporting ? 'not-allowed' : 'pointer'
                  }}
                  onClick={handleExport}
                  disabled={isExporting}
                >
                  <Download size={16} style={{ marginRight: '0.5rem', display: 'inline' }} />
                  {isExporting ? 'Exporting...' : 'Export Plug Code'}
                </button>
              </div>
              
              <div style={{ flex: 1, position: 'relative' }}>
                <Editor
                  height="100%"
                  defaultLanguage="javascript"
                  theme="vs-dark"
                  value={code}
                  onChange={handleCodeChange}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true
                  }}
                />
              </div>
              
              {error && (
                <div className="nb-card" style={{ margin: '1rem', padding: '1rem', borderLeft: '3px solid #ff0000' }}>
                  <p style={{ margin: 0, color: '#ff6b6b' }}>{error}</p>
                </div>
              )}
              
              {exportStatus && !error && (
                <div className="nb-card-glass" style={{ margin: '1rem', padding: '1rem' }}>
                  <p style={{ margin: 0 }}>{exportStatus}</p>
                </div>
              )}
            </main>
          </div>
        </div>
      </NothingBrandProvider>
    </DeployErrorBoundary>
  );
}
