import React from 'react';
import { WorkbenchShell } from '../features/deploy-workbench/WorkbenchShell';
import { exportPlug } from '../server/deploy-adapter';

/**
 * DeployWorkbench Page
 * Lazy-loaded route for Deploy Workbench feature
 */
export default function DeployWorkbench() {
  const handleExport = async ({ code }) => {
    try {
      const result = await exportPlug({
        code,
        metadata: {
          name: 'Exported Plug',
          description: 'Generated from Deploy Workbench',
          author: 'Nurds User'
        }
      });
      
      console.log('[Charter] Export successful:', result.prUrl);
      
      // Could show a toast notification here
      if (result.previewUrl) {
        window.open(result.previewUrl, '_blank');
      }
      
      return result;
    } catch (error) {
      console.error('[Ledger] Export failed:', error);
      throw error;
    }
  };

  return <WorkbenchShell onExport={handleExport} />;
}
