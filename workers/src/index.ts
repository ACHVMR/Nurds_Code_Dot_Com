// workers/src/index.ts
// Cloudflare Workers - API Gateway & Orchestrator Proxy

export interface Env {
  DB: D1Database;
  AGENT_RUNTIME_URL?: string;
  CLOUDFLARE_ONLY?: string;
  ENABLE_SWARM?: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // CORS Headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // 1. Agent Runtime Proxy (Heavy Compute)
    if (url.pathname.startsWith('/api/agent/') || url.pathname === '/api/orchestrate') {
      // Check if Cloudflare-only mode is enabled
      if (env.CLOUDFLARE_ONLY === "true" || env.ENABLE_SWARM === "false") {
        // Cloudflare-only mode: Return a basic response
        if (request.method === "POST") {
          const body = await request.json();
          return new Response(JSON.stringify({
            status: "acknowledged",
            message: "Orchestration request received (Cloudflare-only mode)",
            mode: "cloudflare-only",
            timestamp: new Date().toISOString(),
            data: body
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
        return new Response(JSON.stringify({
          error: "Agent swarm not enabled. Set ENABLE_SWARM=true to use this feature."
        }), {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // Swarm mode: Proxy to external agent runtime
      if (!env.AGENT_RUNTIME_URL) {
        return new Response(JSON.stringify({
          error: "AGENT_RUNTIME_URL not configured"
        }), {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      const targetPath = url.pathname === '/api/orchestrate'
        ? '/api/agent/discuss'
        : url.pathname;

      const targetUrl = new URL(targetPath, env.AGENT_RUNTIME_URL);

      url.searchParams.forEach((value, key) => {
        targetUrl.searchParams.set(key, value);
      });

      const proxyRequest = new Request(targetUrl, {
        method: request.method,
        headers: request.headers,
        body: request.body,
      });

      try {
        const response = await fetch(proxyRequest);
        const newResponse = new Response(response.body, response);
        Object.entries(corsHeaders).forEach(([key, value]) => {
          newResponse.headers.set(key, value);
        });
        return newResponse;
      } catch (e) {
        return new Response(JSON.stringify({
          error: "Agent Runtime Error",
          message: String(e)
        }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }

    // 2. User Settings (D1 Relational Storage)
    if (url.pathname === '/api/user/settings') {
      if (request.method === 'POST') {
        try {
          const settings = await request.json() as any;
          // In practice, identify user via Clerk/Auth. For now, use a default global user.
          const userId = "global_user"; 
          
          await env.DB.prepare(
            "INSERT OR REPLACE INTO user_settings (user_id, settings_json, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)"
          ).bind(userId, JSON.stringify(settings)).run();

          return new Response(JSON.stringify({ success: true }), { 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          });
        } catch (e) {
          return new Response(`DB Error: ${e}`, { status: 500, headers: corsHeaders });
        }
      }

      if (request.method === 'GET') {
        const userId = "global_user";
        const result = await env.DB.prepare("SELECT settings_json FROM user_settings WHERE user_id = ?")
          .bind(userId)
          .first();
        
        return new Response(result ? (result as any).settings_json : "{}", {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }

    // 3. Status/Ping
    if (url.pathname === '/api/status') {
      return new Response(JSON.stringify({
        status: "ONLINE",
        version: "1.0.0",
        edge: "Cloudflare",
        mode: env.CLOUDFLARE_ONLY === "true" ? "cloudflare-only" : "hybrid",
        swarmEnabled: env.ENABLE_SWARM === "true",
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 4. Health Check (Alternative endpoint)
    if (url.pathname === '/health' || url.pathname === '/') {
      return new Response(JSON.stringify({
        service: "Nurds Code API Gateway",
        status: "healthy",
        version: "1.0.0",
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({
      service: "Nurds Code API Gateway",
      message: "Welcome to Nurds Code API",
      endpoints: [
        "GET  /api/status - API status",
        "GET  /api/user/settings - Get user settings",
        "POST /api/user/settings - Update user settings",
        "POST /api/orchestrate - Agent orchestration"
      ]
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  },
};
