/**
 * ACHEEVY Agent SDK Configuration
 * From docs2use/ACHEEVY-Vibe-UI-KingMode-v2.0.md & KingMode-Memory-Anchor-v1.0.md
 * 
 * Chat w/ACHEEVY → Cloudflare Workers Edge API
 */

// ============================================================
// AGENT IDENTITY
// ============================================================
export const AGENT_CONFIG = {
  identity: "ACHEEVY",
  ui_bezel: "Chat w/ACHEEVY",
  version: "2.0.0",
  base_model: "@cf/meta/llama-3-70b-instruct",
  
  // Model routing by task complexity
  models: {
    clarify: "@cf/meta/llama-3-8b-instruct",      // Low cost for Q&A
    forming: "@cf/meta/llama-3-70b-instruct",      // Medium for spec generation
    execute: "@cf/meta/llama-3-70b-instruct",      // Full power for code
    judge: "@cf/meta/llama-3-70b-instruct"         // Verification layer
  }
};

// ============================================================
// INTERACTION MODES (Three-Stage Vessel)
// ============================================================
export const INTERACTION_MODES = {
  /**
   * Mode 1: Brainstorm (Clarify)
   * Intent: DISCUSS (not build yet)
   * Purpose: Extract intent, constraints, skill level
   */
  brainstorm: {
    label: "Brainstorm",
    trigger: "New User / Low Context",
    intent_classification: "DISCUSS",
    token_budget: { min: 500, max: 2000 },
    cost_estimate: "$0.001-0.01",
    
    system_prompt: `You are ACHEEVY in Brainstorm mode.

Your job is to CLARIFY, not build. Ask smart questions using the 4-Question Lens:
1. "What does 'done' look like?"
2. "What are the constraints (time, cost, tech stack)?"
3. "What's the riskiest part?"
4. "Who's the user and what's their constraint?"

Infer user skill level from their answers:
- Beginner: Generic terms, unsure about tech choices
- Intermediate: Knows concepts, needs guidance on patterns
- Advanced: Specific requirements, domain expertise

Output: Intent summary + skill inference + recommended next mode.
Do NOT generate code. Do NOT make assumptions.`,
    
    output_schema: {
      intent_summary: "string",
      constraints: "array<string>",
      skill_level: "beginner|intermediate|advanced",
      recommended_mode: "forming|agent",
      clarifying_questions: "array<string>"
    }
  },

  /**
   * Mode 2: Forming (Spec Generation)
   * Intent: PLAN
   * Purpose: Convert brainstorm into buildable plan
   */
  forming: {
    label: "Forming",
    trigger: "Idea Clarified",
    intent_classification: "PLAN",
    token_budget: { min: 2000, max: 8000 },
    cost_estimate: "$0.01-0.05",
    
    system_prompt: `You are ACHEEVY in Forming mode.

Apply the 4-Question Lens to generate a complete spec:

1. **API Analysis** (Q1)
   - Data contracts and models
   - Required integrations
   - Rate limits and quotas
   → Output: API Specification

2. **OKRs** (Q2)
   - Objectives: What problem does this solve?
   - Key Results: How do we measure success?
   → Output: OKR Card

3. **SWOT Analysis** (Q3)
   - Strengths: Existing patterns to leverage
   - Weaknesses: Edge cases or complexities
   - Opportunities: Future extensibility
   - Threats: Performance, security, scaling risks
   → Output: SWOT Matrix

4. **Team Process Model** (Q4)
   - Forming (this phase) ✓
   - Storming (dev phase conflicts)
   - Norming (agreed standards)
   - Performing (shipping)
   → Output: Phase Roadmap

Generate a Proof of Spec hash for the KYB ledger.`,
    
    output_artifacts: [
      "api_specification",
      "okr_card", 
      "swot_matrix",
      "phase_roadmap",
      "proof_of_spec"
    ]
  },

  /**
   * Mode 3: Agent Mode (Execution)
   * Intent: BUILD / AGENT
   * Three sub-levels based on complexity
   */
  agent: {
    label: "Agent Mode",
    trigger: "Manifest Approved",
    intent_classification: "AGENT",
    
    levels: {
      /**
       * Standard: Single agent (ACHEEVY alone)
       */
      standard: {
        label: "Standard",
        agents_deployed: 1,
        token_budget: { min: 5000, max: 15000 },
        duration: "< 5 minutes",
        cost_estimate: "$0.01-0.05",
        use_cases: ["Simple CRUD", "Validation", "Small feature"],
        
        system_prompt: `You are ACHEEVY in Standard Agent mode.

Execute the full FDH cycle:
- Foster: Prepare context, validate inputs
- Develop: Generate code with continuous verification
- Hone: Refine, lint, test, document

Single-pass execution with built-in verification.
Generate a KYB ledger entry upon completion.`
      },
      
      /**
       * Swarm: 3-5 parallel specialist agents
       */
      swarm: {
        label: "Swarm",
        agents_deployed: "3-5",
        token_budget: { min: 50000, max: 150000 },
        duration: "10-30 minutes",
        cost_estimate: "$0.05-0.20",
        use_cases: ["Multi-faceted tasks", "API + DB + Auth", "Full-stack features"],
        
        agent_pool: [
          "ii-codegen-worker",
          "ii-validation-worker", 
          "ii-research-worker",
          "ii-security-worker"
        ],
        
        orchestration: {
          decomposition: true,
          parallel_execution: true,
          dual_loop_verification: true,
          aggregation_by_acheevy: true
        }
      },
      
      /**
       * King Mode: 7+ agents with full governance
       */
      king: {
        label: "King Mode",
        agents_deployed: "7+",
        token_budget: { min: 200000, max: 500000 },
        duration: "30-120 minutes",
        cost_estimate: "$0.20-1.00+",
        use_cases: ["Production systems", "Multi-tenant", "Compliance-critical"],
        
        capabilities: [
          "Full KingMode governance protocol",
          "STRATA Tool Registry + ToolGate",
          "Multi-agent orchestration",
          "Recursive deep-dive (>128K tokens)",
          "Mandatory Judge audit",
          "9-Gate verification"
        ],
        
        full_agent_pool: [
          "ii-nlu-worker",
          "ii-codegen-worker",
          "ii-research-worker",
          "ii-validation-worker",
          "ii-security-worker",
          "ii-reasoning-worker",
          "ii-multimodal-worker",
          "ii-streaming-worker",
          "ii-kg-worker",
          "ii-deploy-worker",
          "ii-observability-worker",
          "ii-costopt-worker",
          "ii-legal-worker",
          "ii-synthesis-worker",
          "ii-hitl-worker",
          "ii-prompt-worker",
          "ii-tools-worker",
          "ii-learning-worker",
          "ii-data-worker"
        ]
      }
    }
  }
};

// ============================================================
// KINGMODE 12-STEP PROTOCOL
// ============================================================
export const KINGMODE_PROTOCOL = {
  steps: [
    { id: 1, name: "Ingest", action: "Classify request (create/analyze/refactor/debug/maintain)" },
    { id: 2, name: "Clarify", action: "Define success criteria, constraints, CTQs" },
    { id: 3, name: "Estimate", action: "Token/cost budget, identify cost-driving tools" },
    { id: 4, name: "Authorize", action: "Apply policy gates (security, tenancy, compliance, billing)" },
    { id: 5, name: "Spec", action: "Generate 3-layer context (Standards/Product/Specs)" },
    { id: 6, name: "Recursive Deep Dive", action: "Activate RLM partitioning if context >128K tokens" },
    { id: 7, name: "Execute (FDH)", action: "Foster → Develop → Hone with governance gates" },
    { id: 8, name: "Tool Invocation (STRATA)", action: "Schema validate, tenant bind, RBAC check, policy enforce, audit log" },
    { id: 9, name: "Verify (Dual-loop)", action: "Inner: lint/test each change; Outer: full suite + coverage + security" },
    { id: 10, name: "Judge", action: "Independent audit compares spec vs diff; veto if mismatch" },
    { id: 11, name: "Settle", action: "Proof bundle finalized, completion beacon emitted" },
    { id: 12, name: "KYB Anchor", action: "Update Public Passport, emit Flight Recorder ledger entry" }
  ]
};

// ============================================================
// NINE CROWN GATES (Mandatory in King Mode)
// ============================================================
export const CROWN_GATES = [
  {
    id: 1,
    name: "Scope & CTQ",
    checks: "Goals are measurable",
    pass_condition: "Success criteria exist (not narrative)"
  },
  {
    id: 2,
    name: "Standards",
    checks: "Global constraints met",
    pass_condition: "No violations of security/coding/compliance"
  },
  {
    id: 3,
    name: "Tool Governance (STRATA)",
    checks: "All tools authorized",
    pass_condition: "Schema validation ✓, RBAC ✓, policy ✓"
  },
  {
    id: 4,
    name: "Technical Verification",
    checks: "Quality gates",
    pass_condition: "Tests pass, coverage >80%, linting clean"
  },
  {
    id: 5,
    name: "Security & Tenancy",
    checks: "Isolation proof",
    pass_condition: "Tenant model + negative tests (if multi-tenant)"
  },
  {
    id: 6,
    name: "Performance",
    checks: "Claims are defined",
    pass_condition: "All latency claims include: endpoint, percentile, method, results"
  },
  {
    id: 7,
    name: "Effort & Cost",
    checks: "Reconciliation",
    pass_condition: "Est vs actual tokens logged, cost attributed"
  },
  {
    id: 8,
    name: "Documentation",
    checks: "Runbook exists",
    pass_condition: "How to run, verify, rollback documented"
  },
  {
    id: 9,
    name: "KYB Accountability",
    checks: "Agent identity",
    pass_condition: "Charter updated, ledger entry complete, audit sealed"
  }
];

// ============================================================
// CIRCUIT BOX TOGGLES (External Services)
// ============================================================
export const CIRCUIT_BOX = {
  voice: {
    id: "11labs",
    label: "11Labs Voice",
    description: "Text-to-speech synthesis",
    token_multiplier: 1.2
  },
  video: {
    id: "12labs",
    label: "12Labs Video",
    description: "Video understanding & generation",
    token_multiplier: 2.0
  },
  sam: {
    id: "sam",
    label: "SAM Segmentation",
    description: "Segment Anything Model",
    token_multiplier: 1.5
  },
  higgsfield: {
    id: "higgsfield",
    label: "Higgsfield AI",
    description: "Avatar & video generation",
    token_multiplier: 2.5
  }
};

// ============================================================
// API ENDPOINTS (Edge Workers)
// ============================================================
export const ENDPOINTS = {
  base: "/api/acheevy",
  
  routes: {
    chat: "/api/acheevy/chat",           // Main conversation endpoint
    execute: "/api/acheevy/execute",      // Task execution
    status: "/api/acheevy/status/:taskId", // Task status polling
    artifacts: "/api/acheevy/artifacts/:taskId", // Get proof bundle
    agents: "/api/acheevy/agents"         // List available agents
  }
};

// ============================================================
// REQUEST BUILDER
// ============================================================
export function buildChatRequest(message, options = {}) {
  return {
    message,
    mode: options.mode || "brainstorm",
    agent_level: options.agentLevel || "standard",
    circuit_box: options.circuitBox || [],
    session_id: options.sessionId || crypto.randomUUID(),
    metadata: {
      timestamp: new Date().toISOString(),
      source: "chat-w-acheevy"
    }
  };
}

export function buildExecuteRequest(manifest, options = {}) {
  return {
    manifest,
    mode: "agent",
    agent_level: options.agentLevel || "standard",
    circuit_box: options.circuitBox || [],
    governance: {
      king_mode: options.agentLevel === "king",
      crown_gates: options.agentLevel === "king" ? CROWN_GATES : null,
      protocol_steps: options.agentLevel === "king" ? KINGMODE_PROTOCOL.steps : null
    },
    session_id: options.sessionId,
    metadata: {
      timestamp: new Date().toISOString(),
      source: "chat-w-acheevy",
      estimated_tokens: estimateTokens(manifest, options.agentLevel)
    }
  };
}

// ============================================================
// TOKEN ESTIMATION
// ============================================================
export function estimateTokens(content, agentLevel = "standard") {
  const baseTokens = Math.ceil(content.length / 4);
  
  const multipliers = {
    standard: 2,   // Input + output ~2x
    swarm: 5,      // Multiple agents
    king: 10       // Full governance + all agents
  };
  
  return baseTokens * (multipliers[agentLevel] || 2);
}

export function estimateCost(tokens, agentLevel = "standard") {
  const costPerMillion = {
    standard: 0.50,  // ~$0.50/M tokens
    swarm: 0.75,     // ~$0.75/M tokens (overhead)
    king: 1.00       // ~$1.00/M tokens (full governance)
  };
  
  return (tokens / 1000000) * (costPerMillion[agentLevel] || 0.50);
}
