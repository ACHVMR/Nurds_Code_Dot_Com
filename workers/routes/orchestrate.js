import { Router } from 'itty-router';
import { jsonResponse } from '../utils/responses.js';
import { createOracle } from '../services/oracle.js';

export const orchestrateRouter = Router({ base: '/api/v1' });

// ============================================
// II-AGENT CLOUD RUN INTEGRATION
// ============================================

const II_AGENTS = {
  nlu: 'ii-nlu-worker',
  codegen: 'ii-codegen-worker',
  research: 'ii-research-worker',
  validation: 'ii-validation-worker',
  security: 'ii-security-worker',
  testing: 'ii-testing-worker',
  deployment: 'ii-deployment-worker',
  monitoring: 'ii-monitoring-worker',
  documentation: 'ii-documentation-worker',
  optimization: 'ii-optimization-worker',
  database: 'ii-database-worker',
  api: 'ii-api-worker',
  frontend: 'ii-frontend-worker',
  review: 'ii-review-worker',
  refactor: 'ii-refactor-worker',
  architecture: 'ii-architecture-worker',
  integration: 'ii-integration-worker',
  performance: 'ii-performance-worker',
  accessibility: 'ii-accessibility-worker'
};

function getTimeoutMs(env, fallback = 30000) {
  const raw = env?.RESPONSE_TIMEOUT_MS;
  const parsed = typeof raw === 'string' ? Number.parseInt(raw, 10) : Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

async function fetchWithTimeout(url, init, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort('timeout'), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

// --- HELPER FUNCTIONS ---

function classifyIntent(prompt) {
  const p = prompt.toLowerCase();
  if (p.includes('deploy') || p.includes('publish') || p.includes('ship')) return 'deployment';
  if (p.includes('code') || p.includes('generate') || p.includes('function') || p.includes('react')) return 'code';
  if (p.includes('test') || p.includes('spec') || p.includes('coverage')) return 'testing';
  if (p.includes('security') || p.includes('vulnerability') || p.includes('audit')) return 'security';
  if (p.includes('image') || p.includes('video') || p.includes('draw')) return 'vision';
  if (p.includes('speak') || p.includes('voice') || p.includes('call')) return 'voice_conversation';
  if (p.includes('research') || p.includes('find') || p.includes('search')) return 'research';
  if (p.includes('review') || p.includes('analyze')) return 'review';
  if (p.includes('optimize') || p.includes('performance')) return 'optimization';
  if (p.includes('database') || p.includes('sql') || p.includes('schema')) return 'database';
  return 'general';
}

function selectAgents(intent) {
  const agentMap = {
    code: ['nlu', 'codegen', 'validation'],
    deployment: ['codegen', 'deployment', 'security'],
    testing: ['testing', 'validation'],
    security: ['security', 'review'],
    research: ['research', 'documentation'],
    review: ['review', 'refactor'],
    optimization: ['optimization', 'performance'],
    database: ['database', 'api'],
    vision: ['frontend'],
    voice_conversation: ['nlu'],
    general: ['nlu', 'codegen']
  };
  return agentMap[intent] || ['nlu'];
}

/**
 * Create module context headers for Cloud Run billing/tracking
 */
function createModuleHeaders(ctx, env) {
  return {
    'X-User-Id': ctx?.userId || 'anonymous',
    'X-Module-Id': ctx?.moduleId || 'unknown',
    'X-Plan-Tier': ctx?.tier || 'free',
    'X-Request-Id': crypto.randomUUID(),
    'X-Worker-Url': env.CLOUDFLARE_WORKER_URL || '',
  };
}

async function callCloudRunAgent(agentName, prompt, env, flags = {}, ctx = {}) {
  const hubUrl = env.ACHEEVY_HUB_URL;
  const region = env.GCP_REGION || 'us-central1';
  const projectId = env.GCP_PROJECT_ID;
  
  if (!hubUrl || !projectId) {
    // Fallback to direct Groq call if Cloud Run not configured
    return generateCompletion(prompt, env, 'fast');
  }
  
  const serviceUrl = `https://${II_AGENTS[agentName]}-${projectId}.${region}.run.app`;
  
  try {
    const resp = await fetchWithTimeout(`${serviceUrl}/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.GCP_SERVICE_TOKEN || ''}`,
        ...createModuleHeaders(ctx, env)
      },
      body: JSON.stringify({
        prompt,
        flags,
        context: [],
        user_id: ctx?.userId,
        module_id: ctx?.moduleId,
      })
    }, getTimeoutMs(env));
    
    if (!resp.ok) {
      throw new Error(`Agent ${agentName} returned ${resp.status}`);
    }
    
    const data = await resp.json();
    return data.output || data.result || data;
  } catch (e) {
    console.error(`[${agentName}] Cloud Run error:`, e.message);
    // Fallback to Groq
    return generateCompletion(prompt, env, 'fast');
  }
}

async function callACHEEVYHub(workflowId, prompt, agents, env) {
  const hubUrl = env.ACHEEVY_HUB_URL;
  
  if (!hubUrl) {
    return { status: 'simulated', workflow: workflowId, agents };
  }
  
  try {
    const resp = await fetchWithTimeout(`${hubUrl}/api/v1/workflow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.ACHEEVY_API_KEY || ''}`
      },
      body: JSON.stringify({
        workflow_id: workflowId,
        prompt,
        agents,
        callback_url: `${env.CLOUDFLARE_WORKER_URL || ''}/api/v1/workflow/callback`
      })
    }, getTimeoutMs(env));
    
    return await resp.json();
  } catch (e) {
    console.error('[ACHEEVY Hub] Error:', e.message);
    return { status: 'error', message: e.message };
  }
}

async function generateCompletion(prompt, env, mode) {
  if (env.GROQ_API_KEY) {
    try {
      const model = mode === 'fast' ? 'llama3-8b-8192' : 'llama3-70b-8192';
      const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          model: model
        })
      });
      const data = await resp.json();
      return data.choices?.[0]?.message?.content || "Groq Error";
    } catch (e) {
      return `Error using Groq: ${e.message}`;
    }
  }
  return "AI Configuration Missing: Please set GROQ_API_KEY";
}

async function synthesizeVoice(text, env) {
  if (!env.ELEVENLABS_API_KEY) {
    return null;
  }
  
  try {
    const voiceId = env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'; // Rachel voice
    const resp = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': env.ELEVENLABS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: { stability: 0.5, similarity_boost: 0.5 }
      })
    });
    
    if (resp.ok) {
      return { type: 'audio/mpeg', url: 'stream_ready', status: 'synthesized' };
    }
    return null;
  } catch (e) {
    console.error('[ElevenLabs] Error:', e.message);
    return null;
  }
}

async function callVertexAI(prompt, env) {
  if (env.GCP_VERTEX_API_ENDPOINT) {
     return "Dispatched to Vertex AI Agent Garden (GCP)";
  }
  return `[Vertex AI Simulator]: Generated plan for "${prompt}". Advanced reasoning complete.`;
}

// --- ROUTES ---

// Main orchestration endpoint with II-Agent swarm routing
orchestrateRouter.post('/orchestrate', async (request, env) => {
  try {
    const body = await request.json();
    let { prompt, circuit_flags = {}, context = [] } = body;
    const workflowId = crypto.randomUUID();
    
    // Check for voice transcript header (from VoiceInput component)
    const voiceTranscript = request.headers.get('X-Voice-Transcript');
    const isVoiceMode = !!voiceTranscript || circuit_flags.enableVoice;
    
    if (voiceTranscript) {
      // Voice input overrides prompt
      prompt = voiceTranscript;
      circuit_flags = {
        ...circuit_flags,
        enableVoice: true,
        enableGroq: true,
        source: 'voice'
      };
    }

    // 1. Intent Classification
    const intent = classifyIntent(prompt);
    const selectedAgents = selectAgents(intent);
    const responseEvents = [];
    responseEvents.push(`[ACHEEVY] Workflow Started: ${workflowId}`);
    responseEvents.push(`[ACHEEVY] Intent Detected: ${intent.toUpperCase()}`);
    if (isVoiceMode) {
      responseEvents.push(`[VOICE] Mode: ACTIVE | Transcript: "${prompt.slice(0, 50)}..."`);
    }
    responseEvents.push(`[II-AGENT] Dispatching to: ${selectedAgents.join(', ')}`);

    let aiResponse = null;
    let audioStream = null;
    let agentResults = {};

    // 2. Routing Logic with II-Agent Integration
    
    // A. VOICE MODE - Fast path with ElevenLabs synthesis
    if (circuit_flags.useVoice || intent === 'voice_conversation') {
      responseEvents.push("[CIRCUIT] Voice Pipeline: ACTIVATED");
      
      // Use NLU agent for understanding
      const nluResult = await callCloudRunAgent('nlu', prompt, env, circuit_flags);
      agentResults.nlu = nluResult;
      
      // Generate response
      const textGen = await generateCompletion(prompt, env, 'fast');
      aiResponse = textGen;
      
      // Synthesize voice
      audioStream = await synthesizeVoice(textGen, env);
      if (audioStream) {
        responseEvents.push("[CIRCUIT] ElevenLabs: Audio Synthesized");
      }
    }
    
    // B. CODE MODE - Full II-Agent swarm
    else if (intent === 'code' || intent === 'deployment') {
      responseEvents.push("[CIRCUIT] II-Agent Swarm: CodeGen + Validation + Security");
      
      // Parallel agent calls for code generation pipeline
      const [codegenResult, validationResult] = await Promise.all([
        callCloudRunAgent('codegen', prompt, env, circuit_flags),
        callCloudRunAgent('validation', `Validate this request: ${prompt}`, env, circuit_flags)
      ]);
      
      agentResults.codegen = codegenResult;
      agentResults.validation = validationResult;
      
      // Security scan if deployment
      if (intent === 'deployment') {
        const securityResult = await callCloudRunAgent('security', `Security review: ${prompt}`, env, circuit_flags);
        agentResults.security = securityResult;
        responseEvents.push("[II-AGENT] Security Scan: COMPLETE");
      }
      
      aiResponse = codegenResult;
      responseEvents.push("[II-AGENT] Code Generation: COMPLETE");
    }
    
    // C. RESEARCH MODE
    else if (intent === 'research') {
      responseEvents.push("[CIRCUIT] Research Pipeline: Research + Documentation");
      
      const researchResult = await callCloudRunAgent('research', prompt, env, circuit_flags);
      agentResults.research = researchResult;
      aiResponse = researchResult;
      responseEvents.push("[II-AGENT] Research: COMPLETE");
    }
    
    // D. GENERAL - Fallback with Groq
    else {
      responseEvents.push("[CIRCUIT] Knowledge Graph: Groq Fast-Path");
      aiResponse = await generateCompletion(prompt, env, 'reasoning');
    }

    // 3. Report to ACHEEVY Hub (async, don't await)
    callACHEEVYHub(workflowId, prompt, selectedAgents, env).catch(e => 
      console.error('[ACHEEVY] Hub reporting failed:', e.message)
    );

    return jsonResponse({
      id: workflowId,
      intent,
      agents_used: selectedAgents,
      content: aiResponse,
      agent_results: agentResults,
      audio: audioStream,
      events: responseEvents,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[Orchestrator] Error:', error);
    return jsonResponse({ error: error.message }, 500);
  }
});

// Code generation endpoint (direct to II-Codegen)
orchestrateRouter.post('/generate-code', async (request, env) => {
  try {
    const body = await request.json();
    const { description, language = "javascript" } = body;
    
    // Call II-Codegen worker directly
    const codeResult = await callCloudRunAgent('codegen', 
      `Generate ${language} code: ${description}`, 
      env, 
      { language }
    );
    
    return jsonResponse({
      code: codeResult,
      language,
      status: "generated",
      agent: "ii-codegen-worker"
    });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
});

// Workflow status endpoint
orchestrateRouter.get('/workflow/:id', async (request, env) => {
  const { id } = request.params;
  
  // TODO: Fetch from ACHEEVY Hub or Supabase
  return jsonResponse({
    workflow_id: id,
    status: 'pending',
    message: 'Workflow status tracking coming soon'
  });
});

// Workflow callback endpoint (for ACHEEVY Hub async results)
orchestrateRouter.post('/workflow/callback', async (request, env) => {
  try {
    const body = await request.json();
    console.log('[ACHEEVY] Workflow callback received:', body.workflow_id);
    
    // TODO: Store result in Supabase or trigger frontend update
    return jsonResponse({ received: true, workflow_id: body.workflow_id });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
});

// Agent health check endpoint
orchestrateRouter.get('/agents/health', async (request, env) => {
  const agentStatus = {};
  const agentList = Object.keys(II_AGENTS);
  
  // Check first 3 agents (to avoid timeout)
  for (const agent of agentList.slice(0, 3)) {
    try {
      const hubUrl = env.ACHEEVY_HUB_URL;
      const region = env.GCP_REGION || 'us-central1';
      const projectId = env.GCP_PROJECT_ID;
      
      if (hubUrl && projectId) {
        const serviceUrl = `https://${II_AGENTS[agent]}-${projectId}.${region}.run.app/health`;
        const resp = await fetch(serviceUrl, { method: 'GET' });
        agentStatus[agent] = resp.ok ? 'healthy' : 'unhealthy';
      } else {
        agentStatus[agent] = 'not_configured';
      }
    } catch {
      agentStatus[agent] = 'unreachable';
    }
  }
  
  return jsonResponse({
    status: 'ok',
    agents: agentStatus,
    total_agents: agentList.length,
    timestamp: new Date().toISOString()
  });
});

// ============================================
// ORACLE ROUTING ENDPOINT
// ============================================

/**
 * Get ORACLE routing decision for a prompt
 * Returns the optimal model(s) based on task complexity, quality, speed, cost
 */
orchestrateRouter.post('/oracle/route', async (request, env) => {
  try {
    const body = await request.json();
    const { prompt, taskType, qualityThreshold, speedRequirement, costConstraint } = body;
    
    if (!prompt) {
      return jsonResponse({ error: 'Prompt is required' }, 400);
    }
    
    const oracle = createOracle(env);
    const decision = oracle.route({
      prompt,
      taskType: taskType || 'general',
      qualityThreshold: qualityThreshold || 0.90,
      speedRequirement: speedRequirement || 'normal',
      costConstraint: costConstraint || 'budget_aware',
    });
    
    return jsonResponse({
      routing: decision,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
});

/**
 * Get ORACLE routing for a specific agent type
 */
orchestrateRouter.post('/oracle/route/:agentType', async (request, env) => {
  try {
    const { agentType } = request.params;
    const body = await request.json();
    const { prompt } = body;
    
    if (!prompt) {
      return jsonResponse({ error: 'Prompt is required' }, 400);
    }
    
    const oracle = createOracle(env);
    const decision = oracle.routeForAgent(agentType, { prompt });
    
    return jsonResponse({
      agentType,
      routing: decision,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
});

/**
 * List available models in ORACLE registry
 */
orchestrateRouter.get('/oracle/models', async (request, env) => {
  const { MODEL_REGISTRY } = await import('../services/oracle.js');
  
  const models = Object.entries(MODEL_REGISTRY).map(([id, model]) => ({
    id,
    provider: model.provider,
    tier: model.tier,
    quality: model.quality,
    latency: model.latency,
    costPerMTokenInput: model.costPerMTokenInput,
    costPerMTokenOutput: model.costPerMTokenOutput,
    capabilities: model.capabilities,
  }));
  
  return jsonResponse({
    models,
    count: models.length,
    timestamp: new Date().toISOString()
  });
});
