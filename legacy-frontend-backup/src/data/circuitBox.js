/**
 * Circuit Box Registry - Deploy Platform v4.0
 * Organized like an electrician's circuit breaker panel
 * 
 * ACHEEVY is the Digital CEO and orchestrator
 * Buildsmith is the Plug Factory blacksmith (receives P.O. from ACHEEVY + Picker_Ang)
 * House of ANG are specialist Boomer_Ang collaborators
 */

export const CIRCUIT_BOX_VERSION = "4.0-FINAL";
export const LAST_UPDATED = "2025-12-05T13:40:00Z";

// Tier definitions with colors and icons
export const TIER_CONFIG = {
  orchestration: { 
    label: 'Orchestration', 
    color: '#FF5E00', 
    icon: '🧠',
    description: 'CEO Layer - ACHEEVY & Core Intelligence'
  },
  'plug-factory': { 
    label: 'Plug Factory', 
    color: '#00A651', 
    icon: '⚡',
    description: 'Build Execution - Buildsmith & House of ANG'
  },
  voice: { 
    label: 'Voice SDKs', 
    color: '#5B7FFF', 
    icon: '🎤',
    description: '5 Voice Providers - STT, TTS, Voice Agents'
  },
  'build-tools': { 
    label: 'Agent Frameworks', 
    color: '#FF3366', 
    icon: '🔧',
    description: 'Tools used BY Buildsmith to construct agents'
  },
  research: { 
    label: 'Market Research', 
    color: '#9B59B6', 
    icon: '🔬',
    description: 'Market Persona Kit - ACHEEVY delegates research'
  },
  foundry: { 
    label: 'SmelterOS Foundry', 
    color: '#E67E22', 
    icon: '⚗️',
    description: '317+ AI Tools - House of Alchemist, V.I.B.E.'
  },
  persistence: { 
    label: 'Databases', 
    color: '#3498DB', 
    icon: '🗄️',
    description: 'Supabase, Charter DB, Ledger DB'
  },
  security: { 
    label: 'Security & Secrets', 
    color: '#E74C3C', 
    icon: '🔒',
    description: 'Vault, The_Farmer Scanner'
  }
};

// Main Circuit Box Breakers Registry
export const BREAKERS = [
  // ============================================
  // TIER 1: ORCHESTRATION (CEO Layer)
  // ============================================
  {
    id: "breaker-1",
    name: "ACHEEVY (Digital CEO)",
    service: "acheevy",
    tier: "orchestration",
    status: "on",
    health_endpoint: "http://localhost:8000/health",
    description: "Primary orchestrator, user interface, delegates all Boomer_Angs",
    role: "CEO - conducts RFP, collaborates with Picker_Ang, delivers P.O. to Buildsmith",
    capabilities: [
      "4-Question Discovery Lens",
      "RFP-to-Bamaram workflow",
      "Voice/Text interface",
      "Boomer_Ang delegation"
    ]
  },
  {
    id: "breaker-2",
    name: "NTNTN Quality Gates",
    service: "ntntn",
    tier: "orchestration",
    status: "on",
    health_endpoint: "http://localhost:8002/health",
    description: "Quality assurance, HITL gates, approval workflows",
    role: "Gatekeeper - ensures quality at each stage"
  },
  {
    id: "breaker-3",
    name: "Chronicle Logger",
    service: "chronicle",
    tier: "orchestration",
    status: "on",
    health_endpoint: "http://localhost:8003/health",
    description: "Dual-artifact logging (Charter customer-safe, Ledger internal audit)",
    role: "Historian - maintains Charter and Ledger logs"
  },
  {
    id: "breaker-4",
    name: "Researcher Agent",
    service: "researcher",
    tier: "orchestration",
    status: "on",
    health_endpoint: "http://localhost:8004/health",
    description: "Research and data gathering for RFP/Bamaram workflow",
    role: "Intelligence - gathers data for informed decisions"
  },

  // ============================================
  // TIER 2: PLUG FACTORY (Build Execution)
  // ============================================
  {
    id: "breaker-5",
    name: "Buildsmith (Plug Factory)",
    service: "buildsmith",
    tier: "plug-factory",
    status: "on",
    health_endpoint: "http://localhost:8006/health",
    description: "The blacksmith of the Plug Factory - ONLY builds Plugs after receiving P.O.",
    role: "Receives P.O. from ACHEEVY + Picker_Ang, executes builds, collaborates with House of ANG",
    capabilities: [
      "Plug construction",
      "Framework selection",
      "[UserPrefix]_Ang naming",
      "House of ANG collaboration"
    ]
  },
  {
    id: "breaker-6",
    name: "Picker_Ang",
    service: "picker-ang",
    tier: "plug-factory",
    status: "on",
    health_endpoint: "http://localhost:8005/health",
    description: "Tool and framework selection during RFP-Bamaram workflow",
    role: "Collaborates with ACHEEVY to select optimal tools, delivers Bill of Materials to Buildsmith"
  },
  {
    id: "breaker-7",
    name: "House of ANG (17 Specialists)",
    service: "house-of-ang",
    tier: "plug-factory",
    status: "on",
    health_endpoint: "http://localhost:8007/health",
    description: "17 specialist Boomer_Angs providing plug-in skills to Buildsmith",
    role: "Specialist collaborators for advanced workflows",
    specialists: [
      { name: "Research_Ang", icon: "🔍", desc: "Deep research automation" },
      { name: "Code_Ang", icon: "💻", desc: "Code generation and review" },
      { name: "Multi_Ang", icon: "🔄", desc: "Multi-agent orchestration" },
      { name: "Chronicle_Ang", icon: "📜", desc: "Timeline documentation" },
      { name: "Terminal_Ang", icon: "⌨️", desc: "CLI operations" },
      { name: "Gateway_Ang", icon: "🌐", desc: "API management" },
      { name: "Data_Ang", icon: "📊", desc: "Data processing" },
      { name: "Present_Ang", icon: "🎯", desc: "Presentation generation" },
      { name: "Learn_Ang", icon: "📚", desc: "Learning systems" },
      { name: "RL_Ang", icon: "🎮", desc: "Reinforcement learning" },
      { name: "Voice_Ang", icon: "🎙️", desc: "Voice processing" },
      { name: "Vision_Ang", icon: "👁️", desc: "Image analysis" },
      { name: "Security_Ang", icon: "🛡️", desc: "Security scanning" },
      { name: "Deploy_Ang", icon: "🚀", desc: "Deployment automation" },
      { name: "Test_Ang", icon: "🧪", desc: "Test automation" },
      { name: "Doc_Ang", icon: "📖", desc: "Documentation" },
      { name: "Optimize_Ang", icon: "⚡", desc: "Performance optimization" }
    ]
  },

  // ============================================
  // TIER 3: VOICE SDKs
  // ============================================
  {
    id: "breaker-10",
    name: "Deepgram STT",
    service: "deepgram",
    tier: "voice",
    status: "on",
    health_endpoint: "http://localhost:8010/health",
    description: "Real-time speech-to-text",
    cost_per_minute: 0.01,
    maturity: "high"
  },
  {
    id: "breaker-11",
    name: "VAPI Voice Agent",
    service: "vapi",
    tier: "voice",
    status: "on",
    health_endpoint: "http://localhost:8011/health",
    description: "Voice AI for real-time calls",
    cost_per_minute: 0.05,
    maturity: "high"
  },
  {
    id: "breaker-12",
    name: "PlayHT TTS",
    service: "playht",
    tier: "voice",
    status: "on",
    health_endpoint: "http://localhost:8012/health",
    description: "Text-to-speech synthesis",
    cost_per_minute: 0.03,
    maturity: "high"
  },
  {
    id: "breaker-13",
    name: "Resemble Voice Clone",
    service: "resemble",
    tier: "voice",
    status: "off",
    health_endpoint: "http://localhost:8013/health",
    description: "Voice cloning (disabled until enabled)",
    cost_setup: 8.00,
    maturity: "medium"
  },
  {
    id: "breaker-14",
    name: "Whisper Local",
    service: "whisper",
    tier: "voice",
    status: "on",
    health_endpoint: "http://localhost:8014/health",
    description: "Local speech-to-text (free)",
    cost_per_minute: 0.00,
    maturity: "very-high"
  },

  // ============================================
  // TIER 4: AGENT FRAMEWORKS (Used BY Buildsmith)
  // ============================================
  {
    id: "breaker-20",
    name: "CrewAI",
    service: "crewai",
    tier: "build-tools",
    status: "on",
    health_endpoint: "http://localhost:8020/health",
    description: "Multi-agent workflows, production-ready",
    maturity: "high",
    install: "pip install crewai",
    score: "21/25"
  },
  {
    id: "breaker-21",
    name: "Microsoft Agent Framework",
    service: "microsoft-agent-framework",
    tier: "build-tools",
    status: "on",
    health_endpoint: "http://localhost:8021/health",
    description: "Enterprise governance, long-running tasks",
    maturity: "very-high",
    install: "pip install autogen",
    score: "23/25"
  },
  {
    id: "breaker-22",
    name: "OpenAI Agents SDK",
    service: "openai-agents-sdk",
    tier: "build-tools",
    status: "on",
    health_endpoint: "http://localhost:8022/health",
    description: "OpenAI ecosystem, GPT-4 agents",
    maturity: "high",
    install: "pip install openai",
    score: "20/25"
  },
  {
    id: "breaker-23",
    name: "DeerFlow",
    service: "deerflow",
    tier: "build-tools",
    status: "on",
    health_endpoint: "http://localhost:8023/health",
    description: "Workflow automation, visual builder",
    maturity: "medium",
    install: "pip install deerflow",
    score: "17/25"
  },
  {
    id: "breaker-24",
    name: "Boomer_Angs (Custom)",
    service: "boomer-angs",
    tier: "build-tools",
    status: "on",
    health_endpoint: "http://localhost:8024/health",
    description: "Deploy-native agents with naming ceremony",
    maturity: "production",
    naming_pattern: "[UserPrefix]_Ang",
    score: "25/25"
  },
  {
    id: "breaker-25",
    name: "Google ADK",
    service: "google-adk",
    tier: "build-tools",
    status: "off",
    health_endpoint: "http://localhost:8025/health",
    description: "Google Cloud native agents (optional)",
    maturity: "medium",
    install: "pip install google-adk",
    score: "15/25"
  },
  {
    id: "breaker-26",
    name: "ModelScope-Agent",
    service: "modelscope-agent",
    tier: "build-tools",
    status: "off",
    health_endpoint: "http://localhost:8026/health",
    description: "Research, experimental (optional)",
    maturity: "low",
    install: "pip install modelscope-agent",
    score: "11/25"
  },

  // ============================================
  // TIER 5: MARKET PERSONA KIT (NOT "SyntheticUsers")
  // ============================================
  {
    id: "breaker-30",
    name: "Market Persona Kit",
    service: "market-persona-kit",
    tier: "research",
    status: "on",
    health_endpoint: "http://localhost:8030/health",
    description: "LLM-based synthetic persona generation for market research (ACHEEVY delegates this)",
    role: "ACHEEVY delegates persona/market research to specialized Boomer_Angs",
    capabilities: [
      "Persona generation (demographic, psychographic, behavioral)",
      "Cohort simulation",
      "Bias mitigation (ensemble methods)",
      "CSV/JSON-L export"
    ],
    research_basis: "2024-2025 academic research on LLM personas",
    ethical_guardrails: [
      "Transparency disclosure",
      "Bias checking",
      "User documentation"
    ]
  },

  // ============================================
  // TIER 6: FOUNDRY TOOLS (SmelterOS)
  // ============================================
  {
    id: "breaker-40",
    name: "House of Alchemist",
    service: "house-of-alchemist",
    tier: "foundry",
    status: "on",
    health_endpoint: "http://localhost:8040/health",
    description: "AI tool composition and recipe system",
    tools_count: 150
  },
  {
    id: "breaker-41",
    name: "V.I.B.E. Engine",
    service: "vibe-engine",
    tier: "foundry",
    status: "on",
    health_endpoint: "http://localhost:8041/health",
    description: "Voice-Initiated Build Environment",
    tools_count: 100
  },
  {
    id: "breaker-42",
    name: "InfinityLM Core",
    service: "infinitylm-core",
    tier: "foundry",
    status: "on",
    health_endpoint: "http://localhost:8042/health",
    description: "Model routing and optimization",
    tools_count: 67
  },

  // ============================================
  // TIER 7: PERSISTENCE (Databases)
  // ============================================
  {
    id: "breaker-50",
    name: "Supabase (Main DB)",
    service: "supabase",
    tier: "persistence",
    status: "on",
    health_endpoint: "http://localhost:54321/health",
    description: "Postgres, Auth, Storage, Realtime"
  },
  {
    id: "breaker-51",
    name: "Charter DB",
    service: "charter-db",
    tier: "persistence",
    status: "on",
    health_endpoint: "http://localhost:5432/health",
    description: "Customer-safe artifact storage"
  },
  {
    id: "breaker-52",
    name: "Ledger DB",
    service: "ledger-db",
    tier: "persistence",
    status: "on",
    health_endpoint: "http://localhost:5433/health",
    description: "Internal audit log"
  },

  // ============================================
  // TIER 8: SECURITY & SECRETS
  // ============================================
  {
    id: "breaker-60",
    name: "Vault (Secrets Manager)",
    service: "vault",
    tier: "security",
    status: "on",
    health_endpoint: "http://localhost:8200/v1/sys/health",
    description: "Encrypted secrets storage (HashiCorp)"
  },
  {
    id: "breaker-61",
    name: "The_Farmer (Security Scanner)",
    service: "the-farmer",
    tier: "security",
    status: "on",
    health_endpoint: "http://localhost:8061/health",
    description: "Security scanning and vulnerability detection"
  }
];

// Get breakers by tier
export const getBreakersByTier = (tier) => {
  return BREAKERS.filter(b => b.tier === tier);
};

// Get all tiers with breaker counts
export const getTierSummary = () => {
  const summary = {};
  Object.keys(TIER_CONFIG).forEach(tier => {
    const breakers = getBreakersByTier(tier);
    summary[tier] = {
      ...TIER_CONFIG[tier],
      count: breakers.length,
      online: breakers.filter(b => b.status === 'on').length,
      offline: breakers.filter(b => b.status === 'off').length
    };
  });
  return summary;
};

// Toggle breaker status
export const toggleBreaker = (breakerId, currentBreakers, setBreakers) => {
  setBreakers(currentBreakers.map(b => 
    b.id === breakerId 
      ? { ...b, status: b.status === 'on' ? 'off' : 'on' }
      : b
  ));
};

export default BREAKERS;
