/**
 * NurdsCode API - Cloudflare Worker Entry Point
 * Modular routing with itty-router + D1 Module Access Control
 */

import { Router } from 'itty-router';
import { addCORSHeaders, handleCORSPreflight } from './middleware/cors.js';
import { withErrorHandler } from './middleware/errorHandler.js';
import { optionalAuth } from './middleware/auth.js';
import { withModuleAccess, createModuleHeaders } from './middleware/moduleAccess.js';
import { jsonResponse } from './utils/responses.js';
import { notFound } from './utils/errors.js';

// Route modules are loaded lazily to avoid import-time stalls in local runtimes.
// This keeps `/` and `/api/health` responsive even if some feature modules pull
// in heavier transitive dependencies.
const lazyRouterHandle = (loader, exportName) => async (request, env, ctx) => {
  const mod = await loader();
  const routeRouter = mod?.[exportName];
  if (!routeRouter?.handle) {
    throw new Error(`Lazy route module missing expected export: ${exportName}`);
  }
  return routeRouter.handle(request, env, ctx);
};

// Create main router
const router = Router();

// ============================================
// WELL-KNOWN ENDPOINTS (Standards Compliance)
// ============================================

// KYB (Know Your Bot) - Agent identity disclosure
router.get('/.well-known/kyb', async (request, env) => {
  const { BOOMER_ANG_REGISTRY } = await import('./services/kyb-registry.js');
  
  const agents = Object.entries(BOOMER_ANG_REGISTRY).map(([id, agent]) => ({
    serialId: agent.serialId,
    displayName: agent.displayName,
    description: agent.description,
    capabilities: agent.capabilities,
    verificationBadges: agent.verificationBadges,
    tier: agent.tier,
  }));
  
  return new Response(JSON.stringify({
    version: '1.0',
    organization: 'NURDS Code',
    standard: 'KYB-v1.0',
    description: 'Know Your Bot identity disclosure for AI agents',
    agents,
    endpoints: {
      passport: '/api/kyb/:agentId/passport',
      flightRecorder: '/api/kyb/:agentId/sessions/:sessionId/flights',
      anchorChain: '/api/kyb/:agentId/sessions/:sessionId/anchor',
    },
    generatedAt: new Date().toISOString(),
  }, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
});

// Health check
router.get('/api/health', () => {
  return jsonResponse({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
  });
});

// Root endpoint
router.get('/', () => {
  return jsonResponse({
    name: 'NurdsCode API',
    version: '2.0.0',
    docs: '/api/health',
  });
});

// Mount route modules using itty-router's handle method
// Public routes (no module access check)
router.all('/api/auth/*', lazyRouterHandle(() => import('./routes/auth.js'), 'authRouter'));
router.all('/api/billing/*', lazyRouterHandle(() => import('./routes/billing.js'), 'billingRouter'));
router.all('/api/admin/*', lazyRouterHandle(() => import('./routes/admin.js'), 'adminRouter'));

// Module registry routes (for dashboard)
router.all('/api/modules/*', lazyRouterHandle(() => import('./routes/modules.js'), 'modulesRouter'));

// Module-gated routes (access control applied)
router.all('/api/chat/*', lazyRouterHandle(() => import('./routes/chat.js'), 'chatRouter'));
router.all('/api/agents/*', lazyRouterHandle(() => import('./routes/agents.js'), 'agentsRouter'));
router.all('/api/projects/*', lazyRouterHandle(() => import('./routes/projects.js'), 'projectsRouter'));
router.all('/api/v1/voice/*', lazyRouterHandle(() => import('./routes/voice.js'), 'voiceRouter'));
router.all('/api/v1/*', lazyRouterHandle(() => import('./routes/orchestrate.js'), 'orchestrateRouter'));

// AI routes (OCR, Kie.ai video generation)
router.all('/api/ai/ocr/*', lazyRouterHandle(() => import('./routes/ocr.js'), 'ocrRouter'));
router.all('/api/ai/ocr', lazyRouterHandle(() => import('./routes/ocr.js'), 'ocrRouter'));
router.all('/api/kieai/*', lazyRouterHandle(() => import('./routes/kieai.js'), 'kieaiRouter'));

// Plugs routes (Hybrid deployment system)
router.all('/api/v1/plugs/*', lazyRouterHandle(() => import('./routes/plugs.js'), 'plugsRouter'));
router.all('/api/v1/plugs', lazyRouterHandle(() => import('./routes/plugs.js'), 'plugsRouter'));

// ACHEEVY routes (II-Agent customization)
router.all('/api/v1/acheevy/*', lazyRouterHandle(() => import('./routes/acheevy.js'), 'acheevyRouter'));

// Common_Chronicle routes (Proof-of-Benefit audit trail)
router.all('/api/v1/chronicle/*', lazyRouterHandle(() => import('./routes/chronicle.js'), 'chronicleRouter'));

// Orchestrator routes (Multi-agent coordination)
router.all('/api/v1/orchestrator/*', lazyRouterHandle(() => import('./routes/orchestrator.js'), 'orchestratorRouter'));

// LUC routes (Token billing & refunds)
router.all('/api/v1/luc/*', lazyRouterHandle(() => import('./routes/luc.js'), 'lucRouter'));

// Legacy compatibility - direct chat endpoint
router.post('/api/chat', lazyRouterHandle(() => import('./routes/chat.js'), 'chatRouter'));

// 404 handler
router.all('*', () => {
  return notFound('API endpoint not found');
});

/**
 * Main request handler with module access control
 */
async function handleRequest(request, env, ctx = {}) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return handleCORSPreflight(request);
  }

  // Add optional auth context
  const authMiddleware = optionalAuth(async (req, e, c) => {
    // Wrap with module access control
    const moduleMiddleware = withModuleAccess(async (r, en, cx) => {
      return router.handle(r, en, cx);
    });
    return moduleMiddleware(req, e, c);
  });

  // Execute with middleware chain
  const response = await authMiddleware(request, env, ctx);

  // Add CORS headers to response
  return addCORSHeaders(response, request);
}

/**
 * Cloudflare Worker export
 */
export default {
  async fetch(request, env, ctx) {
    // IMPORTANT:
    // Treat the platform ExecutionContext as immutable.
    // Middlewares in this codebase attach request-scoped data onto `ctx`,
    // so we pass a plain object to avoid proxy/freeze behaviors in some runtimes.
    const requestCtx = {};

    // Local dev stability: Wrangler/Miniflare will probe `/` and `/favicon.ico`.
    // If middleware integration misbehaves in a runtime, ensure these probes
    // always return immediately so local development can proceed.
    const { pathname } = new URL(request.url);
    if (request.method === 'GET' && pathname === '/') {
      return jsonResponse({ name: 'NurdsCode API', version: '2.0.0', docs: '/api/health' });
    }
    if (request.method === 'GET' && pathname === '/api/health') {
      return jsonResponse({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '2.0.0',
      });
    }
    if (request.method === 'GET' && pathname === '/favicon.ico') {
      return new Response(null, { status: 204 });
    }

    return withErrorHandler(handleRequest)(request, env, requestCtx);
  },
};

// Also export for scheduled workers if needed
export const scheduled = async (event, env, ctx) => {
  console.log('[Scheduled] Running scheduled task');
  // Add scheduled task logic here
};
