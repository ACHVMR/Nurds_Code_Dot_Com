// Circuit Box - Main Export
// The brain of the Nurds Code platform

export { BRAND_DNA, getSystemPrompt, getBrandColors, getBrandFonts } from './brand-dna';

export { 
  MODEL_REGISTRY, 
  getModelForTier, 
  getModelById, 
  listModels, 
  getCodeModels,
  type ModelConfig 
} from './registry';

export { 
  BOOMER_ANGS, 
  getAng, 
  getAngForTask, 
  listAngs,
  type BoomerAng 
} from './boomer-angs';

export { 
  CircuitBoxOrchestrator, 
  getOrchestrator,
  type CircuitState,
  type OrchestratorConfig,
  type ChatRequest,
  type ChatResponse
} from './orchestrator';

// Quick access to brand colors for frontend
export const NURD_PALETTE = {
  void: '#0a0a0a',
  panel: '#161616',
  slime: '#00ffcc',
  electric: '#ffaa00',
  graffiti: '#ffffff',
  danger: '#ff3366',
} as const;

// Quick access to fonts
export const NURD_FONTS = {
  headers: 'Doto',
  accents: 'Permanent Marker',
  body: 'Inter',
} as const;

// Version info
export const CIRCUIT_BOX_VERSION = '1.0.0';
