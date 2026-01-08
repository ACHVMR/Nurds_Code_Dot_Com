/**
 * NurdsCode API - Cloudflare Worker Entry Point
 * Modular routing with itty-router + D1 Module Access Control
 */

import { Router } from 'itty-router';
import { withCORS, handleCORSPreflight } from './middleware/cors.js';
import { withErrorHandler } from './middleware/errorHandler.js';
import { optionalAuth } from './middleware/auth.js';
import { withModuleAccess, createModuleHeaders } from './middleware/moduleAccess.js';
import { jsonResponse } from './utils/responses.js';
import { notFound } from './utils/errors.js';

// Import route modules
import { authRouter } from './routes/auth.js';
import { chatRouter } from './routes/chat.js';
import { billingRouter } from './routes/billing.js';
import { agentsRouter } from './routes/agents.js';
import { projectsRouter } from './routes/projects.js';
import { voiceRouter } from './routes/voice.js';
import { adminRouter } from './routes/admin.js';
import { orchestrateRouter } from './routes/orchestrate.js';
import { modulesRouter } from './routes/modules.js';
import { ocrRouter } from './routes/ocr.js';
import { kieaiRouter } from './routes/kieai.js';
import { plugsRouter } from './routes/plugs.js';
import { acheevyRouter } from './routes/acheevy.js';
import { orchestratorRouter } from './routes/orchestrator.js';
import { lucRouter } from './routes/luc.js';

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
router.all('/api/auth/*', authRouter.handle);
router.all('/api/billing/*', billingRouter.handle);
router.all('/api/admin/*', adminRouter.handle);

// Module registry routes (for dashboard)
router.all('/api/modules/*', modulesRouter.handle);

// Module-gated routes (access control applied)
router.all('/api/chat/*', chatRouter.handle);
router.all('/api/agents/*', agentsRouter.handle);
router.all('/api/projects/*', projectsRouter.handle);
router.all('/api/voice/*', voiceRouter.handle);
router.all('/api/v1/*', orchestrateRouter.handle);

// AI routes (OCR, Kie.ai video generation)
router.all('/api/ai/ocr/*', ocrRouter.handle);
router.all('/api/ai/ocr', ocrRouter.handle);
router.all('/api/kieai/*', kieaiRouter.handle);

// Plugs routes (Hybrid deployment system)
router.all('/api/v1/plugs/*', plugsRouter.handle);
router.all('/api/v1/plugs', plugsRouter.handle);

// ACHEEVY routes (II-Agent customization)
router.all('/api/v1/acheevy/*', acheevyRouter.handle);

// Orchestrator routes (Multi-agent coordination)
router.all('/api/v1/orchestrator/*', orchestratorRouter.handle);

// LUC routes (Token billing & refunds)
router.all('/api/v1/luc/*', lucRouter.handle);

// Legacy compatibility - direct chat endpoint
router.post('/api/chat', chatRouter.handle);

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
  return withCORS(response, request);
}

/**
 * Cloudflare Worker export
 */
export default {
  async fetch(request, env, ctx) {
    return withErrorHandler(handleRequest)(request, env, ctx);
  },
};

// Also export for scheduled workers if needed
export const scheduled = async (event, env, ctx) => {
  console.log('[Scheduled] Running scheduled task');
  // Add scheduled task logic here
};
