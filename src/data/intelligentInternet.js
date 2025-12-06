export const INTELLIGENT_INTERNET_REPOS = [
  // Tier 1: Orchestration
  { id: 'acheevy', name: 'ACHEEVY (Core)', tier: 'orchestration', status: 'online', access: 'read-write', description: 'Digital CEO & Orchestrator' },
  { id: 'ntntn', name: 'NTNTN (Quality)', tier: 'orchestration', status: 'online', access: 'read-only', description: 'Quality Gates & Approval' },
  { id: 'chronicle', name: 'Chronicle (Logs)', tier: 'orchestration', status: 'online', access: 'write-only', description: 'Audit Logging System' },

  // Tier 2: Plug Factory (House of ANG)
  { id: 'picker-ang', name: 'Picker_Ang', tier: 'plug-factory', status: 'online', access: 'read-write', description: 'Tool Selection & BOM' },
  { id: 'buildsmith', name: 'Buildsmith', tier: 'plug-factory', status: 'online', access: 'read-write', description: 'Agent Construction Factory' },
  
  // House of ANG Specialists
  { id: 'research-ang', name: 'Research_Ang', tier: 'specialist', status: 'online', access: 'read-write', description: 'Deep Research' },
  { id: 'code-ang', name: 'Code_Ang', tier: 'specialist', status: 'online', access: 'read-write', description: 'Code Generation' },
  { id: 'data-ang', name: 'Data_Ang', tier: 'specialist', status: 'online', access: 'read-write', description: 'Data Analysis' },
  { id: 'voice-ang', name: 'Voice_Ang', tier: 'specialist', status: 'online', access: 'read-write', description: 'Voice Processing' },
  { id: 'security-ang', name: 'Security_Ang', tier: 'specialist', status: 'online', access: 'read-only', description: 'Security Scanning' },
  { id: 'deploy-ang', name: 'Deploy_Ang', tier: 'specialist', status: 'online', access: 'read-write', description: 'Deployment Automation' },
  { id: 'test-ang', name: 'Test_Ang', tier: 'specialist', status: 'online', access: 'read-write', description: 'Test Automation' },
  { id: 'doc-ang', name: 'Doc_Ang', tier: 'specialist', status: 'online', access: 'write-only', description: 'Documentation' },
  { id: 'vision-ang', name: 'Vision_Ang', tier: 'specialist', status: 'online', access: 'read-only', description: 'Image Analysis' },
  { id: 'gateway-ang', name: 'Gateway_Ang', tier: 'specialist', status: 'online', access: 'read-only', description: 'API Management' },
  { id: 'terminal-ang', name: 'Terminal_Ang', tier: 'specialist', status: 'online', access: 'read-write', description: 'CLI Operations' },
  { id: 'optimize-ang', name: 'Optimize_Ang', tier: 'specialist', status: 'online', access: 'read-write', description: 'Performance Tuning' }
];

export const getRepoById = (id) => INTELLIGENT_INTERNET_REPOS.find(r => r.id === id);
export const getReposByTier = (tier) => INTELLIGENT_INTERNET_REPOS.filter(r => r.tier === tier);
