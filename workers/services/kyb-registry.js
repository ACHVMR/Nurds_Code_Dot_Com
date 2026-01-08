/**
 * ============================================
 * KYB (Know Your Bot) Registry for Workers
 * ============================================
 * 
 * Defines the BOOMER_ANG_REGISTRY for agent identity disclosure
 */

// BOOMER_ANG Agent Registry
export const BOOMER_ANG_REGISTRY = {
  acheevy: {
    serialId: 'BA-ACHEEVY-001',
    displayName: 'ACHEEVY',
    description: 'Hub orchestrator for all II-Agents. Manages task routing and KingMode phases.',
    capabilities: ['orchestration', 'routing', 'kingmode', 'task_management'],
    verificationBadges: ['certified', 'premium'],
    tier: 'hub',
    version: '2.0.0',
  },
  code_ang: {
    serialId: 'BA-CODE-002',
    displayName: 'Code Ang',
    description: 'Code generation and refactoring specialist using Claude 3.5 Sonnet.',
    capabilities: ['codegen', 'refactoring', 'testing', 'review'],
    verificationBadges: ['certified'],
    tier: 'premium',
    version: '2.0.0',
  },
  test_ang: {
    serialId: 'BA-TEST-003',
    displayName: 'Test Ang',
    description: 'Test generation and validation agent.',
    capabilities: ['testing', 'validation', 'coverage'],
    verificationBadges: ['certified'],
    tier: 'standard',
    version: '2.0.0',
  },
  doc_ang: {
    serialId: 'BA-DOC-004',
    displayName: 'Doc Ang',
    description: 'Documentation generation and maintenance.',
    capabilities: ['documentation', 'api_docs', 'guides'],
    verificationBadges: ['certified'],
    tier: 'standard',
    version: '2.0.0',
  },
  security_ang: {
    serialId: 'BA-SEC-005',
    displayName: 'Security Ang',
    description: 'Security scanning and compliance verification.',
    capabilities: ['security', 'compliance', 'vulnerability_scan'],
    verificationBadges: ['certified', 'security_audited'],
    tier: 'premium',
    version: '2.0.0',
  },
  perf_ang: {
    serialId: 'BA-PERF-006',
    displayName: 'Perf Ang',
    description: 'Performance optimization and analysis.',
    capabilities: ['performance', 'optimization', 'profiling'],
    verificationBadges: ['certified'],
    tier: 'standard',
    version: '2.0.0',
  },
  judge_ang: {
    serialId: 'BA-JUDGE-007',
    displayName: 'Judge Ang',
    description: 'Final quality judgment and approval gate.',
    capabilities: ['review', 'approval', 'quality_gate'],
    verificationBadges: ['certified', 'judge'],
    tier: 'premium',
    version: '2.0.0',
  },
  governance_ang: {
    serialId: 'BA-GOV-008',
    displayName: 'Governance Ang',
    description: 'Policy enforcement and compliance governance.',
    capabilities: ['governance', 'policy', 'audit'],
    verificationBadges: ['certified', 'governance'],
    tier: 'enterprise',
    version: '2.0.0',
  },
};

export default BOOMER_ANG_REGISTRY;
