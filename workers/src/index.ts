// workers/src/index.ts
// Cloudflare Workers - API Gateway & Orchestrator Proxy

export interface Env {
  DB: D1Database;
  AGENT_RUNTIME_URL: string;
  AGENT_RUNTIME_TIMEOUT_MS: string;
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
      const targetPath = url.pathname === '/api/orchestrate' 
        ? '/api/agent/discuss' // Route orchestration to the swarm coordinator
        : url.pathname;
        
      const targetUrl = new URL(targetPath, env.AGENT_RUNTIME_URL);
      
      // Pass through search params
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
        // Ensure SSE/Streaming works by passing through the response as-is
        const newResponse = new Response(response.body, response);
        Object.entries(corsHeaders).forEach(([key, value]) => {
          newResponse.headers.set(key, value);
        });
        return newResponse;
      } catch (e) {
        return new Response(`Agent Runtime Error: ${e}`, { status: 502, headers: corsHeaders });
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
        edge: "Cloudflare" 
      }), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    return new Response("Nurds Code Gateway", { status: 200, headers: corsHeaders });
  },
};
