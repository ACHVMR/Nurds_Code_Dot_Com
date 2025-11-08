/**
 * Agent CSV Export Utilities
 * Generate and download CSV files for agent configurations
 */

/**
 * Generate CSV content from agent data
 * @param {Object} agent - Agent configuration object
 * @returns {string} CSV formatted string
 */
export function generateAgentCSV(agent) {
  const headers = ['Field', 'Value'];
  const rows = [
    ['Agent Name', agent.name || ''],
    ['Agent Type', agent.type || ''],
    ['Framework', agent.framework || ''],
    ['Description', agent.description || ''],
    ['Status', agent.status || ''],
    ['Created At', agent.createdAt || new Date().toISOString()],
    ['Tier', agent.tier || ''],
    ['Model', agent.model || ''],
    ['Temperature', agent.temperature || ''],
    ['Max Tokens', agent.maxTokens || ''],
  ];

  // Convert to CSV format
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csvContent;
}

/**
 * Download a blob as a file
 * @param {Blob} blob - Blob to download
 * @param {string} filename - Name for the downloaded file
 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate and download agent CSV
 * @param {Object} agent - Agent configuration object
 * @param {string} filename - Optional custom filename
 */
export function downloadAgentCSV(agent, filename) {
  const csv = generateAgentCSV(agent);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const defaultFilename = `agent-${agent.name || 'export'}-${Date.now()}.csv`;
  downloadBlob(blob, filename || defaultFilename);
}

/**
 * Generate CSV for multiple agents
 * @param {Array} agents - Array of agent objects
 * @returns {string} CSV formatted string
 */
export function generateAgentsCSV(agents) {
  if (!agents || agents.length === 0) {
    return 'No agents to export';
  }

  const headers = ['Name', 'Type', 'Framework', 'Description', 'Status', 'Created At', 'Tier'];
  const rows = agents.map(agent => [
    agent.name || '',
    agent.type || '',
    agent.framework || '',
    agent.description || '',
    agent.status || '',
    agent.createdAt || '',
    agent.tier || '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csvContent;
}

/**
 * Download multiple agents as CSV
 * @param {Array} agents - Array of agent objects
 * @param {string} filename - Optional custom filename
 */
export function downloadAgentsCSV(agents, filename) {
  const csv = generateAgentsCSV(agents);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const defaultFilename = `agents-export-${Date.now()}.csv`;
  downloadBlob(blob, filename || defaultFilename);
}
