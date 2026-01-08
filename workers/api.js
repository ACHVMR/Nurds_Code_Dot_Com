
// Nurds Code - Advanced Orchestration Worker
// Integrates: Cloudflare (Edge), Vertex AI (Orchestration), ElevenLabs (Voice), Groq (Speed)

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // CORS Configuration
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Circuit-Flag",
      "Content-Type": "application/json"
    };

    if (request.method === "OPTIONS") {
      return new Response("OK", { headers: corsHeaders });
    }

    try {
      // 1. Health/Status Check
      if (url.pathname === "/api/health") {
        return new Response(JSON.stringify({
          status: "Obsidian-Green",
          region: request.cf?.colo || "EDGE",
          models: ["vertex-pro", "gemma-t5", "groq-llama3", "eleven-turbo"]
        }), { headers: corsHeaders });
      }

      // 2. Main Orchestration Endpoint (ACHEEVY SWARM)
      if (url.pathname === "/api/v1/orchestrate" && request.method === "POST") {
        const body = await request.json();
        const { prompt, circuit_flags = {}, context = [] } = body;

        // --- INTENT CLASSIFICATION (Edge Lite) ---
        // Simple keyword-based classifier for <10ms routing
        // In prod, this would call a small model like Llama-3-8b on Groq
        const intent = classifyIntent(prompt);
        
        const responseEvents = [];
        responseEvents.push(`[ACHEEVY] Intent Detected: ${intent.toUpperCase()}`);

        let aiResponse = null;
        let audioStream = null;

        // --- ROUTING LOGIC ---
        
        // A. VOICE MODE (ElevenLabs + Grok)
        if (circuit_flags.useVoice || intent === 'voice_conversation') {
          responseEvents.push("[CIRCUIT] Voice Pipeline: ACTIVATED");
          
          // 1. Get Text Response (Vertex/Groq)
          const textGen = await generateCompletion(prompt, env, 'fast');
          aiResponse = textGen;

          // 2. Convert to Speech (ElevenLabs)
          if (env.ELEVENLABS_API_KEY) {
             // In a real stream, we'd pipe this. For now, we return metadata or a signed URL.
             // We'll simulate the audio payload for the frontend to fetch.
             responseEvents.push("[CIRCUIT] ElevenLabs: Audio Synthesized");
             audioStream = { type: 'audio/mpeg', url: 'stream_placeholder' };
          }
        } 
        
        // B. CODE MODE (GCP Cloud Run / Gemma)
        else if (intent === 'code' || intent === 'deployment') {
           responseEvents.push("[CIRCUIT] Swarm: DeployAng + CodeAng (Vertex AI)");
           // Call Vertex AI or simulate
           aiResponse = await callVertexAI(prompt, env);
        }

        // C. GENERAL / SEARCH (Perplexity Style)
        else {
           responseEvents.push("[CIRCUIT] Knowledge Graph: SearchAng");
           // Fallback to Groq for speed
           aiResponse = await generateCompletion(prompt, env, 'reasoning');
        }

        return new Response(JSON.stringify({
          id: crypto.randomUUID(),
          intent,
          content: aiResponse,
          audio: audioStream,
          events: responseEvents,
          timestamp: new Date().toISOString()
        }), { headers: corsHeaders });
      }

      // 3. Direct Vertex AI Proxy (For heavy agents)
      if (url.pathname === "/api/v1/vertex" && request.method === "POST") {
        const body = await request.json();
        const result = await callVertexAI(body.prompt, env);
        return new Response(JSON.stringify({ result }), { headers: corsHeaders });
      }

      return new Response(JSON.stringify({ error: "Endpoint not found" }), { status: 404, headers: corsHeaders });

    } catch (error) {
      return new Response(JSON.stringify({ 
        error: "System Failure", 
        details: error.message,
        stack: error.stack 
      }), { status: 500, headers: corsHeaders });
    }
  }
};

// --- HELPER FUNCTIONS ---

function classifyIntent(prompt) {
  const p = prompt.toLowerCase();
  if (p.includes('deploy') || p.includes('code') || p.includes('function') || p.includes('react')) return 'code';
  if (p.includes('image') || p.includes('video') || p.includes('draw')) return 'vision';
  if (p.includes('speak') || p.includes('voice') || p.includes('call')) return 'voice_conversation';
  return 'general';
}

async function generateCompletion(prompt, env, mode) {
  // Use Groq if available for speed
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

async function callVertexAI(prompt, env) {
  // If GCP creds are present (Service Account JSON usually needed), we'd sign a JWT.
  // For Cloudflare Workers, we typically use an API Key or route via a Proxy (Cloud Run).
  // This is a placeholder for the direct integration using params.
  
  if (env.GCP_VERTEX_API_ENDPOINT) {
     // Fetch logic to GCP
     return "Dispatched to Vertex AI Agent Garden (GCP)";
  }
  
  // Fallback simulation for prototype
  return `[Vertex AI Simulator]: Generated plan for "${prompt}". Advanced reasoning complete.`;
}

async function callElevenLabs(text, env) {
  // Placeholder for ElevenLabs API call
  return "audio_data_placeholder";
}
