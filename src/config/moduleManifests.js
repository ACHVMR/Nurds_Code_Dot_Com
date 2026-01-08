/**
 * Module Manifests Configuration
 * Defines all available Nurds Code Plugs with their capabilities
 */

export const MODULE_MANIFESTS = {
  // ============================================
  // CORE PLUGS (User-Facing Tools)
  // ============================================
  
  boomer_ang: {
    id: 'boomer_ang',
    name: 'Boomer_Ang',
    version: '1.0.0',
    description: 'AI Agent Orchestrator - Build and deploy intelligent agents that work together',
    icon: '/assets/branding/icons/boomer.png',
    category: 'core',
    
    // Unlock Requirements
    unlock: {
      level: 1,
      credits: 0,
      prerequisites: [],
      hours_required: 0,
    },
    
    // API Configuration
    api: {
      base_path: '/api/v1/boomer',
      endpoints: [
        { method: 'POST', path: '/execute', description: 'Execute agent workflow' },
        { method: 'GET', path: '/status/:id', description: 'Get workflow status' },
        { method: 'POST', path: '/create', description: 'Create new Boomer_Ang' },
        { method: 'GET', path: '/list', description: 'List user\'s agents' },
      ],
      rate_limit: { requests: 100, period: '1m' },
    },
    
    // Deployment Options
    deployment: {
      is_standalone: true,
      cloud_run_service: 'acheevy-hub',
      can_self_host: true,
      docker_image: 'gcr.io/nurds-code-prod/boomer-ang:latest',
    },
    
    // UI Configuration
    ui: {
      route: '/dashboard/boomer',
      color: '#FF6B00',
      features: ['agent-builder', 'workflow-editor', 'execution-logs'],
    },
  },
  
  vibe_ide: {
    id: 'vibe_ide',
    name: 'V.I.B.E. IDE',
    version: '1.0.0',
    description: 'Vibe-driven Code Generation Engine with live preview and AI assistance',
    icon: '/assets/branding/icons/vibe.png',
    category: 'core',
    
    unlock: {
      level: 2,
      credits: 50,
      prerequisites: ['boomer_ang'],
      hours_required: 5,
    },
    
    api: {
      base_path: '/api/v1/vibe',
      endpoints: [
        { method: 'POST', path: '/generate', description: 'Generate code from prompt' },
        { method: 'POST', path: '/refactor', description: 'Refactor existing code' },
        { method: 'POST', path: '/explain', description: 'Explain code' },
        { method: 'POST', path: '/preview', description: 'Generate live preview' },
      ],
      rate_limit: { requests: 50, period: '1m' },
    },
    
    deployment: {
      is_standalone: true,
      cloud_run_service: 'ii-codegen-worker',
      can_self_host: true,
      docker_image: 'gcr.io/nurds-code-prod/vibe-ide:latest',
    },
    
    ui: {
      route: '/editor',
      color: '#00F0FF',
      features: ['monaco-editor', 'sandpack-preview', 'ai-chat', 'voice-control'],
    },
  },
  
  circuit_box: {
    id: 'circuit_box',
    name: 'Circuit Box',
    version: '1.0.0',
    description: 'Analytics Dashboard & Cost Metrics - Track usage, costs, and performance',
    icon: '/assets/branding/icons/circuit.png',
    category: 'core',
    
    unlock: {
      level: 3,
      credits: 100,
      prerequisites: ['boomer_ang'],
      hours_required: 10,
    },
    
    api: {
      base_path: '/api/v1/circuit',
      endpoints: [
        { method: 'GET', path: '/usage', description: 'Get usage metrics' },
        { method: 'GET', path: '/costs', description: 'Get cost breakdown' },
        { method: 'GET', path: '/performance', description: 'Get performance stats' },
        { method: 'GET', path: '/alerts', description: 'Get active alerts' },
      ],
      rate_limit: { requests: 200, period: '1m' },
    },
    
    deployment: {
      is_standalone: true,
      cloud_run_service: 'ii-observability-worker',
      can_self_host: false,
      docker_image: null,
    },
    
    ui: {
      route: '/dashboard/analytics',
      color: '#8B5CF6',
      features: ['charts', 'real-time-metrics', 'cost-tracking', 'alerts'],
    },
  },
  
  grounding: {
    id: 'grounding',
    name: 'Grounding Engine',
    version: '1.0.0',
    description: 'RAG & Knowledge Base with semantic search for accurate, grounded responses',
    icon: '/assets/branding/icons/grounding.png',
    category: 'core',
    
    unlock: {
      level: 3,
      credits: 100,
      prerequisites: ['boomer_ang'],
      hours_required: 15,
    },
    
    api: {
      base_path: '/api/v1/grounding',
      endpoints: [
        { method: 'POST', path: '/search', description: 'Semantic search' },
        { method: 'POST', path: '/ingest', description: 'Ingest documents' },
        { method: 'DELETE', path: '/documents/:id', description: 'Remove document' },
        { method: 'GET', path: '/collections', description: 'List collections' },
      ],
      rate_limit: { requests: 30, period: '1m' },
    },
    
    deployment: {
      is_standalone: true,
      cloud_run_service: 'ii-research-worker',
      can_self_host: true,
      docker_image: 'gcr.io/nurds-code-prod/grounding-engine:latest',
    },
    
    ui: {
      route: '/dashboard/knowledge',
      color: '#10B981',
      features: ['document-upload', 'search-interface', 'collection-manager'],
    },
  },
  
  voice_studio: {
    id: 'voice_studio',
    name: 'Voice Studio',
    version: '1.0.0',
    description: 'TTS & STT Pipeline with ElevenLabs + Deepgram for voice-driven coding',
    icon: '/assets/branding/icons/voice.png',
    category: 'core',
    
    unlock: {
      level: 4,
      credits: 150,
      prerequisites: ['boomer_ang'],
      hours_required: 20,
    },
    
    api: {
      base_path: '/api/v1/voice',
      endpoints: [
        { method: 'POST', path: '/synthesize', description: 'Text to speech' },
        { method: 'POST', path: '/transcribe', description: 'Speech to text' },
        { method: 'POST', path: '/conversation', description: 'Voice conversation' },
        { method: 'GET', path: '/voices', description: 'List available voices' },
      ],
      rate_limit: { requests: 20, period: '1m' },
    },
    
    deployment: {
      is_standalone: true,
      cloud_run_service: 'ii-nlu-worker',
      can_self_host: false,
      docker_image: null,
    },
    
    ui: {
      route: '/dashboard/voice',
      color: '#EC4899',
      features: ['voice-recorder', 'tts-player', 'voice-settings'],
    },
  },
  
  // ============================================
  // II-AGENT PLUGS (Backend Services)
  // ============================================
  
  ii_nlu: {
    id: 'ii_nlu',
    name: 'II-NLU Agent',
    version: '1.0.0',
    description: 'Natural Language Understanding & Intent Classification',
    icon: '/assets/branding/icons/ii-nlu.png',
    category: 'agent',
    
    unlock: { level: 2, credits: 25, prerequisites: ['boomer_ang'], hours_required: 5 },
    
    api: {
      base_path: '/api/v1/agents/nlu',
      endpoints: [
        { method: 'POST', path: '/classify', description: 'Classify intent' },
        { method: 'POST', path: '/extract', description: 'Extract entities' },
      ],
      rate_limit: { requests: 100, period: '1m' },
    },
    
    deployment: {
      is_standalone: false,
      cloud_run_service: 'ii-nlu-worker',
      can_self_host: true,
      docker_image: 'gcr.io/nurds-code-prod/ii-nlu-worker:latest',
    },
    
    ui: { route: null, color: '#6366F1', features: [] },
  },
  
  ii_codegen: {
    id: 'ii_codegen',
    name: 'II-Codegen Agent',
    version: '1.0.0',
    description: 'Advanced Code Generation with multi-language support',
    icon: '/assets/branding/icons/ii-codegen.png',
    category: 'agent',
    
    unlock: { level: 2, credits: 50, prerequisites: ['ii_nlu'], hours_required: 10 },
    
    api: {
      base_path: '/api/v1/agents/codegen',
      endpoints: [
        { method: 'POST', path: '/generate', description: 'Generate code' },
        { method: 'POST', path: '/complete', description: 'Code completion' },
      ],
      rate_limit: { requests: 50, period: '1m' },
    },
    
    deployment: {
      is_standalone: false,
      cloud_run_service: 'ii-codegen-worker',
      can_self_host: true,
      docker_image: 'gcr.io/nurds-code-prod/ii-codegen-worker:latest',
    },
    
    ui: { route: null, color: '#22D3EE', features: [] },
  },
  
  ii_research: {
    id: 'ii_research',
    name: 'II-Research Agent',
    version: '1.0.0',
    description: 'Web research and synthesis',
    icon: '/assets/branding/icons/ii-research.png',
    category: 'agent',
    
    unlock: { level: 3, credits: 50, prerequisites: ['ii_nlu'], hours_required: 15 },
    
    api: {
      base_path: '/api/v1/agents/research',
      endpoints: [
        { method: 'POST', path: '/search', description: 'Web search' },
        { method: 'POST', path: '/synthesize', description: 'Synthesize findings' },
      ],
      rate_limit: { requests: 20, period: '1m' },
    },
    
    deployment: {
      is_standalone: false,
      cloud_run_service: 'ii-research-worker',
      can_self_host: true,
      docker_image: 'gcr.io/nurds-code-prod/ii-research-worker:latest',
    },
    
    ui: { route: null, color: '#A855F7', features: [] },
  },
  
  ii_security: {
    id: 'ii_security',
    name: 'II-Security Agent',
    version: '1.0.0',
    description: 'Code security analysis and vulnerability scanning',
    icon: '/assets/branding/icons/ii-security.png',
    category: 'agent',
    
    unlock: { level: 4, credits: 75, prerequisites: ['ii_codegen'], hours_required: 25 },
    
    api: {
      base_path: '/api/v1/agents/security',
      endpoints: [
        { method: 'POST', path: '/scan', description: 'Security scan' },
        { method: 'POST', path: '/audit', description: 'Full audit' },
      ],
      rate_limit: { requests: 10, period: '1m' },
    },
    
    deployment: {
      is_standalone: false,
      cloud_run_service: 'ii-security-worker',
      can_self_host: true,
      docker_image: 'gcr.io/nurds-code-prod/ii-security-worker:latest',
    },
    
    ui: { route: null, color: '#EF4444', features: [] },
  },
  
  ii_validation: {
    id: 'ii_validation',
    name: 'II-Validation Agent',
    version: '1.0.0',
    description: 'Code validation and testing',
    icon: '/assets/branding/icons/ii-validation.png',
    category: 'agent',
    
    unlock: { level: 3, credits: 50, prerequisites: ['ii_codegen'], hours_required: 15 },
    
    api: {
      base_path: '/api/v1/agents/validation',
      endpoints: [
        { method: 'POST', path: '/validate', description: 'Validate code' },
        { method: 'POST', path: '/test', description: 'Generate tests' },
      ],
      rate_limit: { requests: 30, period: '1m' },
    },
    
    deployment: {
      is_standalone: false,
      cloud_run_service: 'ii-validation-worker',
      can_self_host: true,
      docker_image: 'gcr.io/nurds-code-prod/ii-validation-worker:latest',
    },
    
    ui: { route: null, color: '#F59E0B', features: [] },
  },
  
  // ============================================
  // INTEGRATION PLUGS
  // ============================================
  
  plus1: {
    id: 'plus1',
    name: 'Plus+1 Collaboration',
    version: '1.0.0',
    description: 'Real-time team collaboration and code sharing',
    icon: '/assets/branding/icons/plus1.png',
    category: 'integration',
    
    unlock: { level: 2, credits: 75, prerequisites: ['boomer_ang'], hours_required: 10 },
    
    api: {
      base_path: '/api/v1/plus1',
      endpoints: [
        { method: 'POST', path: '/room/create', description: 'Create collaboration room' },
        { method: 'POST', path: '/room/join', description: 'Join room' },
        { method: 'POST', path: '/share', description: 'Share code' },
      ],
      rate_limit: { requests: 50, period: '1m' },
    },
    
    deployment: {
      is_standalone: true,
      cloud_run_service: null,
      can_self_host: true,
      docker_image: 'gcr.io/nurds-code-prod/plus1:latest',
    },
    
    ui: {
      route: '/dashboard/collaborate',
      color: '#14B8A6',
      features: ['room-manager', 'live-cursor', 'chat', 'screen-share'],
    },
  },
  
  kie_vision: {
    id: 'kie_vision',
    name: 'Kie.ai Vision',
    version: '1.0.0',
    description: 'Image and video generation powered by Kie.ai',
    icon: '/assets/branding/icons/kie.png',
    category: 'integration',
    
    unlock: { level: 3, credits: 100, prerequisites: ['boomer_ang'], hours_required: 15 },
    
    api: {
      base_path: '/api/v1/kie',
      endpoints: [
        { method: 'POST', path: '/generate/image', description: 'Generate image' },
        { method: 'POST', path: '/generate/video', description: 'Generate video' },
        { method: 'GET', path: '/status/:id', description: 'Check generation status' },
      ],
      rate_limit: { requests: 10, period: '1m' },
    },
    
    deployment: {
      is_standalone: false,
      cloud_run_service: 'ii-multimodal-worker',
      can_self_host: false,
      docker_image: null,
    },
    
    ui: {
      route: '/dashboard/vision',
      color: '#F472B6',
      features: ['image-generator', 'video-generator', 'gallery'],
    },
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get all modules as array
 */
export function getAllModules() {
  return Object.values(MODULE_MANIFESTS);
}

/**
 * Get module by ID
 */
export function getModuleById(id) {
  return MODULE_MANIFESTS[id] || null;
}

/**
 * Get modules by category
 */
export function getModulesByCategory(category) {
  return getAllModules().filter(m => m.category === category);
}

/**
 * Get core plugs only
 */
export function getCorePlugs() {
  return getModulesByCategory('core');
}

/**
 * Get agent plugs only
 */
export function getAgentPlugs() {
  return getModulesByCategory('agent');
}

/**
 * Check if user can unlock module
 */
export function canUnlockModule(module, userLevel, userCredits, unlockedModules = []) {
  // Check level
  if (userLevel < module.unlock.level) return false;
  
  // Check credits
  if (userCredits < module.unlock.credits) return false;
  
  // Check prerequisites
  for (const prereq of module.unlock.prerequisites) {
    if (!unlockedModules.includes(prereq)) return false;
  }
  
  return true;
}

/**
 * Get total unlock cost for a module chain
 */
export function getUnlockChainCost(moduleId, unlockedModules = []) {
  const module = getModuleById(moduleId);
  if (!module) return 0;
  
  let totalCost = module.unlock.credits;
  
  for (const prereq of module.unlock.prerequisites) {
    if (!unlockedModules.includes(prereq)) {
      totalCost += getUnlockChainCost(prereq, unlockedModules);
    }
  }
  
  return totalCost;
}

export default MODULE_MANIFESTS;
