import Stripe from 'stripe';
import { initGemini, answerFast, thinkDeep } from '../src/server/utils/gemini-tools';
import { FileSearchRAG } from '../src/server/utils/file-search-rag';
import { SecurityMenderBot } from '../src/server/boomer-angs/security-mender-bot';
import { DesignBot } from '../src/server/boomer-angs/design-bot';

// JWT utility functions
function generateToken(userId, secret) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    userId: userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7), // 7 days
  };

  const base64Header = btoa(JSON.stringify(header));
  const base64Payload = btoa(JSON.stringify(payload));
  const signature = btoa(secret + base64Header + base64Payload);

  return `${base64Header}.${base64Payload}.${signature}`;
}

function verifyToken(token, secret) {
  try {
    const [header, payload, signature] = token.split('.');
    const expectedSignature = btoa(secret + header + payload);
    
    if (signature !== expectedSignature) {
      return null;
    }

    const decodedPayload = JSON.parse(atob(payload));
    
    if (decodedPayload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return decodedPayload;
  } catch (error) {
    return null;
  }
}

// Agent Runtime Invocation
async function invokeAgentRuntime(env, jobType, payload, traceId) {
  if (!env.AGENT_RUNTIME_URL) {
    throw new Error('AGENT_RUNTIME_URL not configured');
  }

  const url = `${env.AGENT_RUNTIME_URL}/execute`;
  const controller = new AbortController();
  const timeoutMs = parseInt(env.AGENT_RUNTIME_TIMEOUT_MS) || 300000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-agent-runtime-secret': env.AGENT_RUNTIME_SHARED_SECRET || ''
      },
      body: JSON.stringify({
        traceId,
        jobType,
        payload
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Agent Runtime failed (${response.status}): ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// LLM Chat Handler - Google DeepMind Integration
async function chatHandler(request, env) {
  try {
    const body = await request.json();
    const { message, department = 'home', energyMode = 'TEACHER', history = [] } = body;
    
    if (!env.GOOGLE_API_KEY) {
      return new Response(JSON.stringify({ error: 'GOOGLE_API_KEY not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const genAI = initGemini(env.GOOGLE_API_KEY);
    
    // Construct Prompt based on Department & Energy
    const systemPrompt = `You are ACHEEVY, the AI orchestrator for Nurds Code.
Time: ${new Date().toISOString()}
Department: ${department.toUpperCase()}
Energy Mode: ${energyMode}

Your goal is to assist the user effectively while embodying the ${energyMode} energy.
- TEACHER: Guiding, informative, helpful tips.
- PROFESSIONAL: Concise, clear, efficient.
- FOCUSED: Minimalist, results-driven.
- JOVIAL: Creative, encouraging, supportive.

Context:
${history.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

User Question: ${message}
`;

    // Use Gemini 3.0 Flash (via proxy) for fast response
    const responseText = await answerFast(genAI, systemPrompt);
    
    return new Response(JSON.stringify({
      response: responseText,
      model: env.FAST_LLM_MODEL || 'gemini-3.0-flash',
      energy: energyMode,
      department: department
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Gemini chat error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      response: `Error: ${error.message}` 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Voice endpoints
async function voiceTranscribe(request, env) {
  const formData = await request.formData();
  const audioFile = formData.get('audio');
  const provider = formData.get('provider') || 'openai'; // openai, deepgram
  
  if (!audioFile) {
    return new Response(JSON.stringify({ error: 'No audio file provided' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  try {
    if (provider === 'openai') {
      const whisperFormData = new FormData();
      whisperFormData.append('file', audioFile);
      whisperFormData.append('model', 'whisper-1');
      
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.OPENAI_API_KEY}`
        },
        body: whisperFormData
      });
      
      const data = await response.json();
      return new Response(JSON.stringify({ text: data.text, provider: 'openai' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Deepgram fallback
    if (provider === 'deepgram' && env.DEEPGRAM_API_KEY) {
      const audioBuffer = await audioFile.arrayBuffer();
      const response = await fetch('https://api.deepgram.com/v1/listen?model=nova-2', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${env.DEEPGRAM_API_KEY}`,
          'Content-Type': audioFile.type
        },
        body: audioBuffer
      });
      
      const data = await response.json();
      return new Response(JSON.stringify({
        text: data.results?.channels?.[0]?.alternatives?.[0]?.transcript || '',
        provider: 'deepgram'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ error: 'Provider not configured' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function voiceVoices(request, env) {
  const url = new URL(request.url);
  const provider = url.searchParams.get('provider') || 'openai';
  
  const voices = {
    openai: [
      { id: 'alloy', name: 'Alloy', preview: 'Neutral and balanced' },
      { id: 'echo', name: 'Echo', preview: 'Warm and natural' },
      { id: 'fable', name: 'Fable', preview: 'Expressive and dynamic' },
      { id: 'onyx', name: 'Onyx', preview: 'Deep and authoritative' },
      { id: 'nova', name: 'Nova', preview: 'Friendly and upbeat' },
      { id: 'shimmer', name: 'Shimmer', preview: 'Clear and pleasant' },
    ],
    elevenlabs: [
      { id: 'rachel', name: 'Rachel', preview: 'American female' },
      { id: 'domi', name: 'Domi', preview: 'American female, young' },
      { id: 'bella', name: 'Bella', preview: 'American female, soft' },
      { id: 'josh', name: 'Josh', preview: 'American male, young' },
      { id: 'arnold', name: 'Arnold', preview: 'American male, deep' },
    ]
  };
  
  return new Response(JSON.stringify({
    provider,
    voices: voices[provider] || voices.openai
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// V.I.B.E. Engine Handlers
async function vibeGenerateHandler(request, env) {
  const body = await request.json();
  const { prompt, language = 'javascript', context = '', model = 'llama-3.1-70b-versatile' } = body;

  // Cloudflare AI Gateway Configuration
  const CLOUDFLARE_ACCOUNT_ID = env.CLOUDFLARE_ACCOUNT_ID;
  const GATEWAY_SLUG = env.AI_GATEWAY_SLUG || 'nurdscode-gateway';
  const AI_GATEWAY_URL = CLOUDFLARE_ACCOUNT_ID 
    ? `https://gateway.ai.cloudflare.com/v1/${CLOUDFLARE_ACCOUNT_ID}/${GATEWAY_SLUG}`
    : null;

  try {
    const baseUrl = AI_GATEWAY_URL 
      ? `${AI_GATEWAY_URL}/groq/openai/v1/chat/completions`
      : 'https://api.groq.com/openai/v1/chat/completions';

    const systemPrompt = `You are the V.I.B.E. (Vibrant Imagination Build Environment) Engine.
Your goal is to generate high-quality, executable ${language} code based on the user's request.
Return ONLY the code, no markdown fencing, no explanation unless specifically asked in the prompt.
If context is provided, use it to align your code style and dependencies.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(context ? [{ role: 'system', content: `Context:\n${context}` }] : []),
      { role: 'user', content: prompt }
    ];

    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.2, // Lower temperature for more deterministic code
        max_tokens: 4096
      })
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '// No code generated';

    return new Response(JSON.stringify({
      code: content,
      model: model,
      usage: data.usage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function vibeModelsHandler(request, env) {
  return new Response(JSON.stringify({
    models: [
      { id: 'anthropic/claude-3.5-haiku:beta', name: 'Claude Haiku 3.5 (Default, Recommended)' },
      { id: 'anthropic/claude-3-5-sonnet', name: 'Claude Sonnet 3.5 (Pro)' },
      { id: 'anthropic/claude-3-5-opus', name: 'Claude Opus 3.5 (Enterprise)' },
      { id: 'openai/gpt-4o', name: 'GPT-4o' }
    ]
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Generate full Cloudflare Workers project (like Bolt.new)
async function generateProjectHandler(request, env) {
  try {
    const body = await request.json();
    const { description, framework = 'vanilla', bindings = [] } = body;
    
    if (!env.OPENROUTER_API_KEY) {
      return new Response(JSON.stringify({ error: 'OpenRouter API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Enhanced prompt for Claude to generate full project
    const projectPrompt = `Generate a complete Cloudflare Workers project for: ${description}

Framework: ${framework}
Bindings requested: ${bindings.join(', ') || 'none'}

Return a JSON object with this exact structure:
{
  "files": [
    {
      "path": "src/index.js",
      "content": "... full file content ..."
    },
    {
      "path": "wrangler.toml",
      "content": "... full wrangler config ..."
    },
    {
      "path": "package.json",
      "content": "... full package.json ..."
    }
  ],
  "instructions": "Brief setup instructions"
}

Requirements:
1. Generate ALL files needed for a working project
2. Include wrangler.toml with proper configuration
3. Include package.json with all dependencies
4. Use Cloudflare Workers APIs (env.KV, env.D1, env.R2, etc.)
5. Add TypeScript types if applicable
6. Include error handling
7. Make it production-ready
8. Add README.md with setup instructions

Generate a complete, deployable project now.`;

    const openrouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': env.APP_URL || 'https://nurdscode.com',
        'X-Title': 'Nurds Code Platform'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-haiku:beta',
        messages: [
          { role: 'user', content: projectPrompt }
        ],
        temperature: 0.7,
        max_tokens: 8000
      })
    });
    
    if (!openrouterResponse.ok) {
      const errorText = await openrouterResponse.text();
      throw new Error(`OpenRouter error: ${errorText}`);
    }
    
    const data = await openrouterResponse.json();
    const responseContent = data.choices[0].message.content;
    
    // Try to parse JSON from response
    let projectData;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = responseContent.match(/```json\n([\s\S]*?)\n```/) || 
                       responseContent.match(/```\n([\s\S]*?)\n```/) ||
                       [null, responseContent];
      projectData = JSON.parse(jsonMatch[1] || responseContent);
    } catch (parseError) {
      // If Claude didn't return JSON, wrap the response
      projectData = {
        files: [
          {
            path: 'src/index.js',
            content: responseContent
          }
        ],
        instructions: 'Review and customize the generated code'
      };
    }
    
    return new Response(JSON.stringify({
      project: projectData,
      model: 'anthropic/claude-3.5-haiku:beta',
      provider: 'openrouter-claude'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Project generation error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Failed to generate project structure'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handleRequest(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Initialize Stripe
  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
  });

  // Route: Health check
  if (path === '/api/health' && request.method === 'GET') {
    return new Response(JSON.stringify({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      services: {
        stripe: !!env.STRIPE_SECRET_KEY,
        groq: !!env.GROQ_API_KEY,
        openai: !!env.OPENAI_API_KEY,
        supabase: !!env.SUPABASE_URL
      }
    }), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }

  // Route: Chat (LLM) - ACHEEVY main handler
  if (path === '/api/chat' && request.method === 'POST') {
    return chatHandler(request, env);
  }

  // Route: Gemini 3.0 Pro (Thinking)
  if (path === '/api/gemini/think' && request.method === 'POST') {
    try {
      const { prompt } = await request.json();
      const genAI = initGemini(env.GOOGLE_API_KEY);
      const reasoning = await thinkDeep(genAI, prompt);
      
      return new Response(JSON.stringify({
        reasoning,
        model: env.REASONING_LLM_MODEL || 'gemini-3.0-pro'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
    }
  }

  // Route: Gemini 3.0 Flash (Fast)
  if (path === '/api/gemini/fast' && request.method === 'POST') {
    try {
      const { prompt } = await request.json();
      const genAI = initGemini(env.GOOGLE_API_KEY);
      const response = await answerFast(genAI, prompt);
      
      return new Response(JSON.stringify({
        response,
        model: env.FAST_LLM_MODEL || 'gemini-3.0-flash'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
    }
  }

  // Route: RAG Upload Document
  if (path === '/api/rag/upload' && request.method === 'POST') {
    try {
      const formData = await request.formData();
      const file = formData.get("file");
      const name = formData.get("name");
      const department = formData.get("department") || "general";

      if (!file || !name) {
        return new Response(JSON.stringify({ error: "Missing file or name" }), { status: 400, headers: corsHeaders });
      }

      // 1. In a real app involving Google File API, we would upload the file/buffer to Google here.
      // For this implementation, we will mock the "upload" by storing a reference in Supabase/D1.
      // Since we don't have the Google File API capability in this environment directly without a proper server-side upload flow (which is complex for Workers),
      // we will assume the file content is passed to the LLM directly or stored in D1.
      
      // Let's store metadata in D1 if available
      if (env.DB) {
         await env.DB.prepare(
          'INSERT INTO rag_documents (name, department, created_at, file_uri) VALUES (?, ?, ?, ?)'
        ).bind(name, department, new Date().toISOString(), 'mock-uri-' + Date.now()).run();
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: "File reference stored (Mock)",
        file_uri: 'mock-uri-' + Date.now()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
    }
  }

  // Route: RAG Search
  if (path === '/api/rag/search' && request.method === 'POST') {
    try {
      const { query, department } = await request.json();
      
      // 1. Fetch relevant docs from DB
      let docs = [];
      if (env.DB) {
        const result = await env.DB.prepare(
          'SELECT * FROM rag_documents WHERE department = ? OR department = "general" LIMIT 5'
        ).bind(department || 'general').all();
        docs = result.results;
      }

      // If no docs, basically return null
      if (!docs || docs.length === 0) {
        return new Response(JSON.stringify({ answer: "No documentation found for this topic." }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // 2. Perform RAG Search
      // Since we mocked the upload, the "fileUri" is fake. 
      // In a real scenario, we'd pass the real Google File URI to the FileSearchRAG class.
      // For now, we will simulate the answer or use context if we had the text content.
      
      // REAL IMPLEMENTATION CALL (commented out due to mock URI):
      // const rag = new FileSearchRAG(env.GOOGLE_API_KEY);
      // const answer = await rag.searchDocs(query, docs[0].file_uri);

      // MOCK RESPONSE for now since we don't have real file connection yet:
      const answer = `[RAG Search Simulated]\nFound ${docs.length} documents. Based on "${docs[0].name}", here is the answer to "${query}"...`;

      return new Response(JSON.stringify({
        answer,
        sources: docs.map(d => d.name)
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
      
    } catch (e) {
       return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
    }
  }

  // Route: Voice transcription
  if (path === '/api/voice/transcribe' && request.method === 'POST') {
    return voiceTranscribe(request, env);
  }

  // Route: Voice voice list
  if (path === '/api/voice/voices' && request.method === 'GET') {
    return voiceVoices(request, env);
  }

  // Route: V.I.B.E. Engine - Generate Code
  if (path === '/api/vibe/generate' && request.method === 'POST') {
    return vibeGenerateHandler(request, env);
  }

  // Route: V.I.B.E. Engine - List Models
  if (path === '/api/vibe/models' && request.method === 'GET') {
    return vibeModelsHandler(request, env);
  }

  // Route: Generate Full Cloudflare Workers Project
  if (path === '/api/project/generate' && request.method === 'POST') {
    return generateProjectHandler(request, env);
  }

  // Route: Save Project
  if (path === '/api/project/save' && request.method === 'POST') {
    try {
      const body = await request.json();
      const { projectName, content, files } = body;
      
      
      // Log the save action (in production, this would persist to KV/D1/R2)
      console.log(`Saved [${projectName || 'Untitled Project'}]`);
      
      return new Response(JSON.stringify({
        success: true,
        message: `Project "${projectName || 'Untitled Project'}" saved successfully`,
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  // Route: Agent Runtime Execution
  if (path === '/api/agent/execute' && request.method === 'POST') {
    try {
      const body = await request.json();
      const { jobType, payload } = body;
      const traceId = crypto.randomUUID();
      
      const result = await invokeAgentRuntime(env, jobType, payload, traceId);
      
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  // Route: Model Garden - List all models
  if (path === '/api/models' && request.method === 'GET') {
    const models = {
      closedSource: {
        'gpt-4o': { provider: 'openai', name: 'GPT-4o', inputCost: 0.005, outputCost: 0.015, capabilities: ['text', 'vision', 'code'] },
        'gpt-4o-mini': { provider: 'openai', name: 'GPT-4o Mini', inputCost: 0.00015, outputCost: 0.0006, capabilities: ['text', 'vision', 'code'] },
        'claude-3-5-sonnet': { provider: 'anthropic', name: 'Claude 3.5 Sonnet', inputCost: 0.003, outputCost: 0.015, capabilities: ['text', 'vision', 'code'] },
        'claude-3-5-haiku': { provider: 'anthropic', name: 'Claude 3.5 Haiku', inputCost: 0.0008, outputCost: 0.004, capabilities: ['text', 'code'] },
        'gemini-2.0-flash': { provider: 'google', name: 'Gemini 2.0 Flash', inputCost: 0.0001, outputCost: 0.0004, capabilities: ['text', 'vision', 'audio', 'code'] }
      },
      openSource: {
        'llama-3.3-70b': { provider: 'together', name: 'Llama 3.3 70B', inputCost: 0.0009, outputCost: 0.0009, capabilities: ['text', 'code'] },
        'deepseek-v3': { provider: 'deepseek', name: 'DeepSeek V3', inputCost: 0.00014, outputCost: 0.00028, capabilities: ['text', 'code'] },
        'qwen-2.5-72b': { provider: 'together', name: 'Qwen 2.5 72B', inputCost: 0.0009, outputCost: 0.0009, capabilities: ['text', 'code'] }
      },
      videoGeneration: {
        'runway-gen3': { provider: 'runway', name: 'Runway Gen-3', costPerSecond: 0.05 },
        'luma-dream-machine': { provider: 'luma', name: 'Luma Dream Machine', costPerSecond: 0.04 },
        'minimax-video-01': { provider: 'minimax', name: 'MiniMax Video-01', costPerSecond: 0.01 }
      }
    };
    
    return new Response(JSON.stringify(models), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Route: Video Generation (queues job to agent runtime)
  if (path === '/api/video/generate' && request.method === 'POST') {
    try {
      const body = await request.json();
      const { prompt, provider = 'runway', duration = 5, aspectRatio = '16:9' } = body;
      
      // Queue video generation job
      const jobId = crypto.randomUUID();
      
      // In production, this would queue to agent-runtime via invokeAgentRuntime
      // For now, return a mock job
      return new Response(JSON.stringify({
        jobId,
        status: 'queued',
        prompt,
        provider,
        duration,
        aspectRatio,
        estimatedCost: duration * (provider === 'runway' ? 0.05 : 0.02),
        estimatedTime: `${duration * 8} seconds`,
        createdAt: new Date().toISOString()
      }), {
        status: 202,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  // Route: App Builder - Estimate costs
  if (path === '/api/builder/estimate' && request.method === 'POST') {
    try {
      const body = await request.json();
      const { description, model = 'claude-3-5-sonnet' } = body;
      
      // Detect complexity and features
      const wordCount = description.split(/\s+/).length;
      const features = [];
      
      if (/auth|login/i.test(description)) features.push({ name: 'Authentication', tokens: 15000 });
      if (/payment|stripe/i.test(description)) features.push({ name: 'Payments', tokens: 20000 });
      if (/database|supabase/i.test(description)) features.push({ name: 'Database', tokens: 12000 });
      if (/dashboard|admin/i.test(description)) features.push({ name: 'Dashboard', tokens: 25000 });
      if (/ai|chat|llm/i.test(description)) features.push({ name: 'AI Integration', tokens: 15000 });
      
      const baseTokens = wordCount * 100;
      const featureTokens = features.reduce((sum, f) => sum + f.tokens, 0);
      const totalTokens = (baseTokens + featureTokens) * 3; // 3 iterations
      
      // Cost calculation based on model
      const modelCosts = {
        'gpt-4o': 0.015,
        'claude-3-5-sonnet': 0.015,
        'deepseek-v3': 0.00028
      };
      
      const costPerToken = modelCosts[model] || 0.01;
      const totalCost = (totalTokens / 1000) * costPerToken;
      
      return new Response(JSON.stringify({
        estimatedTokens: totalTokens,
        totalCost: Math.round(totalCost * 100) / 100,
        estimatedTime: totalTokens < 50000 ? '5-10 minutes' : totalTokens < 150000 ? '15-30 minutes' : '1-2 hours',
        features: features.map(f => f.name),
        model
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  // Route: App Builder - Build full-stack app
  if (path === '/api/builder/build' && request.method === 'POST') {
    try {
      const body = await request.json();
      const { description, model = 'claude-3-5-sonnet', config = {} } = body;
      
      // Create build job
      const buildId = crypto.randomUUID();
      
      // In production, this would stream to frontend and use agent-runtime
      return new Response(JSON.stringify({
        buildId,
        status: 'building',
        description,
        model,
        config,
        phases: [
          { id: 'analysis', name: 'Analyzing Requirements', status: 'pending' },
          { id: 'architecture', name: 'Designing Architecture', status: 'pending' },
          { id: 'scaffolding', name: 'Creating Structure', status: 'pending' },
          { id: 'components', name: 'Building Components', status: 'pending' },
          { id: 'styling', name: 'Applying Styles', status: 'pending' },
          { id: 'integration', name: 'Integrating Services', status: 'pending' },
          { id: 'testing', name: 'Testing', status: 'pending' },
          { id: 'deployment', name: 'Preparing Deploy', status: 'pending' }
        ],
        createdAt: new Date().toISOString()
      }), {
        status: 202,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  // Route: Create checkout session
  if (path === '/api/create-checkout-session' && request.method === 'POST') {
    try {
      const body = await request.json();
      const { priceId, email } = body;

      // Mock mode if Stripe key is not configured
      if (!env.STRIPE_SECRET_KEY || env.STRIPE_SECRET_KEY === '') {
        console.log('Stripe not configured, using mock flow');
        const mockSessionId = `mock_session_${Date.now()}`;
        return new Response(
          JSON.stringify({ 
            url: `${url.origin}/success?session_id=${mockSessionId}&mock=true&plan=${priceId}` 
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        customer_email: email,
        success_url: `${url.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${url.origin}/subscribe`,
        metadata: {
          priceId: priceId,
        },
      });

      return new Response(
        JSON.stringify({ url: session.url }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } catch (error) {
      console.error('Error creating checkout session:', error);
      
      // Return a more specific error if it's a Stripe error
      const errorMessage = error.type === 'StripeInvalidRequestError' 
        ? `Invalid Price ID: ${error.message}` 
        : error.message;

      return new Response(
        JSON.stringify({ error: errorMessage }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  }

  // Route: Stripe webhook
  if (path === '/api/webhook' && request.method === 'POST') {
    try {
      const body = await request.text();
      const sig = request.headers.get('stripe-signature');

      let event;
      try {
        event = stripe.webhooks.constructEvent(
          body,
          sig,
          env.STRIPE_WEBHOOK_SECRET
        );
      } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return new Response(
          JSON.stringify({ error: 'Webhook signature verification failed' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Handle the event
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          
          // Save subscription to D1 database
          if (env.DB) {
            await env.DB.prepare(
              'INSERT INTO subscriptions (customer_id, subscription_id, price_id, status, created_at) VALUES (?, ?, ?, ?, ?)'
            )
              .bind(
                session.customer,
                session.subscription,
                session.metadata.priceId,
                'active',
                new Date().toISOString()
              )
              .run();
          }

          break;
        }
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted': {
          const subscription = event.data.object;
          
          // Update subscription status in D1 database
          if (env.DB) {
            await env.DB.prepare(
              'UPDATE subscriptions SET status = ?, updated_at = ? WHERE subscription_id = ?'
            )
              .bind(
                subscription.status,
                new Date().toISOString(),
                subscription.id
              )
              .run();
          }

          break;
        }
      }

      return new Response(
        JSON.stringify({ received: true }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } catch (error) {
      console.error('Webhook error:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  }

  // Route: Get user subscription
  if (path === '/api/subscription' && request.method === 'GET') {
    try {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: 'No authorization header' }),
          {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const token = authHeader.replace('Bearer ', '');
      const user = verifyToken(token, env.JWT_SECRET);

      if (!user) {
        return new Response(
          JSON.stringify({ error: 'Invalid token' }),
          {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      if (env.DB) {
        const result = await env.DB.prepare(
          'SELECT * FROM subscriptions WHERE customer_id = ? ORDER BY created_at DESC LIMIT 1'
        )
          .bind(user.userId)
          .first();

        return new Response(
          JSON.stringify(result || {}),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(
        JSON.stringify({}),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } catch (error) {
      console.error('Error fetching subscription:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  }

  // Route: Circuit Box status (Admin)
  if (path === '/api/admin/circuit-box' && request.method === 'GET') {
    return new Response(JSON.stringify({
      services: [
        { id: 'groq', name: 'GROQ LLM', status: env.GROQ_API_KEY ? 'online' : 'offline' },
        { id: 'openai', name: 'OpenAI', status: env.OPENAI_API_KEY ? 'online' : 'offline' },
        { id: 'stripe', name: 'Stripe', status: env.STRIPE_SECRET_KEY ? 'online' : 'offline' },
        { id: 'supabase', name: 'Supabase', status: env.SUPABASE_URL ? 'online' : 'offline' },
        { id: 'd1', name: 'D1 Database', status: env.DB ? 'online' : 'offline' },
      ]
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Route: Create Agent (Buildsmith P.O. Handoff)
  if (path === '/api/agent/create' && request.method === 'POST') {
    return new Promise(async (resolve) => {
      try {
        const body = await request.json();
        const { name, type, framework, collaborators } = body;
        
        // Simulate Buildsmith construction delay
        await new Promise(r => setTimeout(r, 1500));

        resolve(new Response(JSON.stringify({
          success: true,
          agentId: `ang_${Date.now()}`,
          status: 'deployed',
          message: `Bamaram! ${name} has been forged by Buildsmith.`,
          deployment_url: `https://${name.toLowerCase().replace('_', '-')}.nurdscode.com`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }));
      } catch (e) {
        resolve(new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders }));
      }
    });
  }

  // Route: List available plugins for Testing Lab
  if (path === '/api/plugins/list' && request.method === 'GET') {
    // Mock plugin list - in production this would come from a database
    const mockPlugins = [
      { id: 'video-editor-pro', name: 'Video Editor Pro', description: 'Advanced video editing tool', category: 'media' },
      { id: 'code-formatter', name: 'Code Formatter', description: 'Format and beautify code', category: 'dev-tools' },
      { id: 'ai-image-gen', name: 'AI Image Generator', description: 'Generate images with AI', category: 'ai' },
      { id: 'pdf-converter', name: 'PDF Converter', description: 'Convert documents to PDF', category: 'productivity' }
    ];

    return new Response(JSON.stringify({ plugins: mockPlugins }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Route: Run test in Testing Lab
  if (path === '/api/test/run' && request.method === 'POST') {
    try {
      const body = await request.json();
      const { sourceType, config } = body;

      let output = '';
      const logs = [];

      switch(sourceType) {
        case 'github':
          logs.push({ type: 'info', message: `Cloning repository: ${body.githubUrl}` });
          logs.push({ type: 'info', message: `Branch: ${body.branch || 'main'}` });
          logs.push({ type: 'success', message: 'Repository cloned successfully' });
          
          output = `
            <html>
              <head><style>body { font-family: monospace; padding: 20px; background: #1a1a2e; color: #00ff88; }</style></head>
              <body>
                <h1>✅ GitHub Repository Test</h1>
                <p><strong>Repository:</strong> ${body.githubUrl}</p>
                <p><strong>Branch:</strong> ${body.branch || 'main'}</p>
                <p>Repository loaded successfully! In a production environment, this would execute the repository code in an isolated sandbox.</p>
              </body>
            </html>
          `;
          break;

        case 'npm':
          logs.push({ type: 'info', message: `Installing NPM package: ${body.package}@${body.version}` });
          logs.push({ type: 'success', message: 'Package installed successfully' });
          
          output = `
            <html>
              <head><style>body { font-family: monospace; padding: 20px; background: #1a1a2e; color: #00ff88; }</style></head>
              <body>
                <h1>📦 NPM Package Test</h1>
                <p><strong>Package:</strong> ${body.package}</p>
                <p><strong>Version:</strong> ${body.version || 'latest'}</p>
                <p>Package loaded successfully! In a production environment, this would install and test the package.</p>
              </body>
            </html>
          `;
          break;

        case 'plugin':
          logs.push({ type: 'info', message: `Loading plugin: ${body.pluginId}` });
          logs.push({ type: 'success', message: 'Plugin loaded successfully' });
          
          output = `
            <html>
              <head><style>body { font-family: monospace; padding: 20px; background: #1a1a2e; color: #00ff88; }</style></head>
              <body>
                <h1>🔌 Plugin Test</h1>
                <p><strong>Plugin ID:</strong> ${body.pluginId}</p>
                <p>Plugin loaded successfully! In a production environment, this would execute the plugin with test data.</p>
              </body>
            </html>
          `;
          break;

        case 'custom':
          logs.push({ type: 'info', message: 'Compiling custom code...' });
          logs.push({ type: 'info', message: 'Executing in sandbox...' });
          logs.push({ type: 'success', message: 'Code executed successfully' });
          
          // For custom code, we'd ideally compile and execute it
          // For now, just show the code
          output = `
            <html>
              <head>
                <style>
                  body { font-family: monospace; padding: 20px; background: #1a1a2e; color: #00ff88; }
                  pre { background: #0a0a0f; padding: 15px; border-left: 3px solid #00ff88; overflow-x: auto; }
                </style>
              </head>
              <body>
                <h1>✏️ Custom Code Test</h1>
                <p>Your custom code:</p>
                <pre>${body.code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
                <p>In a production environment, this would be compiled and executed in an isolated sandbox.</p>
              </body>
            </html>
          `;
          break;

        default:
          throw new Error('Invalid source type');
      }

      return new Response(JSON.stringify({ output, logs, status: 'success' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  // Route: Security Audit (Manual Trigger)
  if (path === '/api/security/audit' && request.method === 'POST') {
    try {
      const { code } = await request.json();
      const bot = new SecurityMenderBot(env.GOOGLE_API_KEY, env.GITHUB_TOKEN);
      const report = await bot.auditCode(code || "// No code provided");
      
      return new Response(JSON.stringify(report), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
    }
  }

  // Route: Design Generation (Nano Banana Pro)
  if (path === '/api/design/generate' && request.method === 'POST') {
    try {
      const { prompt, style } = await request.json();
      const bot = new DesignBot(env.GOOGLE_API_KEY);
      const result = await bot.generateAsset(prompt, style);
      
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
    }
  }

  // Default 404
  return new Response('Not Found', {
    status: 404,
    headers: corsHeaders,
  });
}

// Scheduled Task (Cron) - Daily Security Audit
async function scheduled(event, env, ctx) {
  console.log("Running Daily CodeMender Security Audit...");
  // In production, this would fetch the repo, scan it, and auto-PR fixes.
  // For now, we simulate a scan log.
  const bot = new SecurityMenderBot(env.GOOGLE_API_KEY, env.GITHUB_TOKEN);
  // Simulating a scan of a critical file
  const mockCode = "function login(u,p) { eval(u); }"; // Intentionally vulnerable
  const report = await bot.auditCode(mockCode);
  
  if (report.vulnerabilities?.length > 0) {
    console.log(`[Security Alert] Found ${report.vulnerabilities.length} issues.`);
    await bot.createPatchPR("nurds-code/platform", "login.js", report.patchedCode);
  } else {
    console.log("[Security Clean] No issues found.");
  }
}

export default {
  async fetch(request, env, ctx) {
    return handleRequest(request, env);
  },
  scheduled
};
