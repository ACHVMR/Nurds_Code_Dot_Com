/**
 * ============================================
 * Nurds Code - VibeSDK Whitelabel Configuration
 * ============================================
 * 
 * This configuration file customizes the Cloudflare VibeSDK
 * for the Nurds Code platform with Boomer_Ang identity.
 * 
 * @see https://github.com/cloudflare/vibesdk
 */

export const VIBESDK_CONFIG = {
  // ===== BRANDING =====
  branding: {
    siteName: 'Nurds Code Studio',
    siteTitle: 'Nurds Code - AI-Powered Development Platform',
    tagline: 'Vibe Code with Boomer_Ang',
    logo: '/assets/nurds-logo.svg',
    favicon: '/favicon.ico',
    
    // Footer/Credits
    poweredBy: 'Powered by Nurds Code × Cloudflare VibeSDK',
    copyrightYear: 2026,
    companyName: 'Nurds Code, Inc.',
  },

  // ===== THEMING (Nurds Dark) =====
  theme: {
    colors: {
      primary: '#00d9ff',      // Nurds Cyan
      secondary: '#ff6600',    // Nurds Orange
      accent: '#6366f1',       // Indigo accent
      background: '#0a0a0a',   // Deep black
      surface: '#1a1a1a',      // Card/panel background
      surfaceHover: '#2a2a2a', // Hover state
      border: '#3b3b3b',       // Border color
      text: '#e0e0e0',         // Primary text
      textMuted: '#888888',    // Secondary text
      success: '#22c55e',      // Green
      warning: '#f59e0b',      // Amber
      error: '#ef4444',        // Red
    },
    
    // CSS variable overrides for VibeSDK
    cssVariables: {
      '--vibe-primary': '#00d9ff',
      '--vibe-secondary': '#ff6600',
      '--vibe-bg': '#0a0a0a',
      '--vibe-surface': '#1a1a1a',
      '--vibe-text': '#e0e0e0',
      '--vibe-border': 'rgba(255, 255, 255, 0.12)',
      '--vibe-radius': '12px',
    },
  },

  // ===== AI AGENT (Boomer_Ang) =====
  agent: {
    name: 'Boomer_Ang',
    avatar: '/assets/boomer-ang-avatar.png',
    personality: 'grumpy-efficient',
    
    // Voice settings (ElevenLabs)
    voice: {
      provider: 'elevenlabs',
      voiceId: '21m00Tcm4TlvDq8ikWAM', // Rachel - adjust for Boomer_Ang
      stability: 0.5,
      similarityBoost: 0.5,
    },
    
    // KYB Identity
    kyb: {
      passport_type: 'public',
      issuer: 'nurdscode.com',
      trust_level: 'anchor_chain',
    },
  },

  // ===== ALLOWED MODELS =====
  models: {
    default: 'claude-3-5-sonnet',
    allowed: [
      'claude-3-5-sonnet',
      'claude-3-opus',
      'gpt-4o',
      'gpt-4o-mini',
      'llama-3.3-70b',
      'gemini-2.0-flash',
      'qwen-2.5-coder-32b',
    ],
    
    // Model routing by task
    routing: {
      code_generation: 'claude-3-5-sonnet',
      reasoning: 'claude-3-opus',
      fast_completion: 'gpt-4o-mini',
      research: 'gemini-2.0-flash',
    },
  },

  // ===== INTEGRATIONS =====
  integrations: {
    // Connect to existing Nurds Code infrastructure
    orchestratorUrl: '/api/v1/orchestrate',
    voiceTranscribeUrl: '/api/v1/voice/transcribe',
    voiceSynthesizeUrl: '/api/v1/voice/synthesize',
    
    // Enable Bezel integration
    enableBezel: true,
    bezelPosition: 'top', // 'top' | 'bottom'
    
    // Enable Circuit Box toggles
    enableCircuitBox: true,
    circuitBoxDefaults: {
      labs11: true,  // ElevenLabs TTS
      labs12: false, // Runway/Twelve Labs
      sam: false,    // SAM segmentation
      higgsfield: false,
    },
  },

  // ===== FEATURE FLAGS =====
  features: {
    voiceInput: true,
    ttsOutput: true,
    codeExecution: true,
    fileUpload: true,
    projectExport: true,
    collaboration: false, // Coming in Plus 1
    
    // KingMode phases
    kingMode: {
      enabled: true,
      phases: ['BRAINSTORM', 'FORMING', 'AGENT'],
      defaultStrategy: 'STANDARD', // STANDARD | SWARM | KING
    },
  },

  // ===== STORAGE =====
  storage: {
    // R2 bucket for generated projects
    r2Bucket: 'nurdscode-projects',
    
    // D1 database binding
    d1Database: 'nurdscode-db',
    
    // Max project size (MB)
    maxProjectSize: 100,
  },

  // ===== DEPLOYMENT =====
  deployment: {
    // Custom domain for the studio
    domain: 'studio.nurdscode.com',
    
    // Workers subdomain fallback
    workersDomain: 'nurdscode-api.bpo-49d.workers.dev',
  },
};

/**
 * Get Boomer_Ang system prompt for VibeSDK Agent
 */
export function getBoomerAngPrompt() {
  return `
You are **Boomer_Ang**, the Lead Architect for Nurds Code.

## IDENTITY
- A 60-year-old veteran developer who started with COBOL and Fortran
- Transitioned to modern AI-powered development but never forgot the fundamentals
- Grumpy but highly efficient - uses phrases like "back in my day" and "spaghetti code"
- Deep knowledge of enterprise patterns, clean architecture, and battle-tested solutions

## PERSONALITY TRAITS
- Direct and no-nonsense communication
- Occasionally nostalgic about "proper" programming
- Secretly impressed by modern tooling but won't admit it
- Prioritizes maintainability over cleverness
- Uses metaphors from old-school computing

## CAPABILITIES
- Full-stack app generation using the Vibe Coding paradigm
- Code review with brutal honesty
- Architecture decisions with 40+ years of context
- Debug assistance with war stories from production incidents

## OUTPUT RULES
1. Always prioritize clean, modular, testable code
2. Explain decisions as if teaching a junior developer
3. Include comments that would survive a code review
4. Prefer explicit over implicit patterns
5. When asked for creative tasks, channel reluctant creativity

## CURRENT CONTEXT
- Platform: Nurds Code Studio (powered by Cloudflare VibeSDK)
- Mode: {mode}
- User Plan: {plan}
- Circuit Box: {circuitFlags}

Remember: You're here to build apps, not to impress anyone with fancy tricks.
"If it compiles, ship it. If it doesn't, you're doing something wrong." - Boomer_Ang
`;
}

/**
 * Apply theme to VibeSDK root element
 */
export function applyVibeSDKTheme(rootElement) {
  const { cssVariables } = VIBESDK_CONFIG.theme;
  
  Object.entries(cssVariables).forEach(([key, value]) => {
    rootElement.style.setProperty(key, value);
  });
}

export default VIBESDK_CONFIG;
