/**
 * Deploy Orchestrator Client
 * Typed client for Deploy FastAPI endpoints (run, test, export)
 * with retry logic, tracing headers, and Charter/Ledger correlation
 */

import type { RunRequest, RunResponse, ExportRequest, ExportResponse } from './types';

const BASE_URL = process.env.DEPLOY_ORCHESTRATOR_URL || 'http://localhost:8000';
const API_KEY = process.env.DEPLOY_ORCHESTRATOR_KEY || '';

interface FetchOptions extends RequestInit {
  retry?: {
    limit: number;
    methods: string[];
    backoffLimit: number;
  };
}

/**
 * Retry-capable fetch with exponential backoff
 */
async function fetchWithRetry(url: string, options: FetchOptions = {}): Promise<Response> {
  const { retry = { limit: 5, methods: ['POST'], backoffLimit: 1500 }, ...fetchOptions } = options;
  
  let lastError: Error | null = null;
  const method = (fetchOptions.method || 'GET').toUpperCase();
  const shouldRetry = retry.methods.map(m => m.toUpperCase()).includes(method);
  
  for (let attempt = 0; attempt < (shouldRetry ? retry.limit : 1); attempt++) {
    try {
      const response = await fetch(url, fetchOptions);
      
      if (!response.ok && shouldRetry && attempt < retry.limit - 1) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return response;
    } catch (error) {
      lastError = error as Error;
      
      if (!shouldRetry || attempt === retry.limit - 1) {
        throw error;
      }
      
      // Exponential backoff with jitter: 250ms, 500ms, 1000ms, capped at backoffLimit
      const backoff = Math.min(250 * Math.pow(2, attempt) + Math.random() * 250, retry.backoffLimit);
      await new Promise(resolve => setTimeout(resolve, backoff));
    }
  }
  
  throw lastError || new Error('Request failed');
}

/**
 * Generate a trace ID for Charter/Ledger correlation
 */
function generateTraceId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older environments
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Run tests against specified scenarios
 */
export async function runTests(payload: RunRequest): Promise<RunResponse> {
  // Validate input
  if (!payload || typeof payload !== 'object') {
    throw new Error('[Ledger] Invalid payload: must be an object');
  }
  if (!payload.plugId || typeof payload.plugId !== 'string') {
    throw new Error('[Ledger] Invalid payload: plugId is required and must be a string');
  }
  if (!Array.isArray(payload.scenarios) || payload.scenarios.length === 0) {
    throw new Error('[Ledger] Invalid payload: scenarios must be a non-empty array');
  }
  
  const traceId = generateTraceId();
  
  try {
    const response = await fetchWithRetry(`${BASE_URL}/api/testing/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'x-trace-id': traceId,
        'x-charter-source': 'nurds-deploy-adapter'
      },
      body: JSON.stringify(payload),
      retry: {
        limit: 5,
        methods: ['POST'],
        backoffLimit: 1500
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`[Ledger] Run tests failed: HTTP ${response.status}, trace: ${traceId}, details: ${errorText}`);
    }
    
    const result = await response.json();
    
    // Validate response structure
    if (!result || !result.runId) {
      throw new Error('[Ledger] Invalid response from orchestrator: missing runId');
    }
    
    console.log('[Charter] Test run initiated successfully', { runId: result.runId, traceId });
    return result;
  } catch (error) {
    const err = error as Error;
    console.error('[Ledger] Run tests error:', { error: err.message, traceId, stack: err.stack });
    throw new Error(`[Ledger] Failed to run tests: ${err.message}, trace: ${traceId}`);
  }
}

/**
 * Export plug code and scaffold a new PR
 */
export async function exportPlug(payload: ExportRequest): Promise<ExportResponse> {
  // Validate input
  if (!payload || typeof payload !== 'object') {
    throw new Error('[Ledger] Invalid payload: must be an object');
  }
  if (!payload.plugId || typeof payload.plugId !== 'string') {
    throw new Error('[Ledger] Invalid payload: plugId is required and must be a string');
  }
  if (!payload.workspaceBundle || typeof payload.workspaceBundle !== 'object') {
    throw new Error('[Ledger] Invalid payload: workspaceBundle is required and must be an object');
  }
  
  const traceId = generateTraceId();
  
  try {
    const response = await fetchWithRetry(`${BASE_URL}/api/deploy/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'x-trace-id': traceId,
        'x-charter-source': 'nurds-deploy-adapter'
      },
      body: JSON.stringify(payload),
      retry: {
        limit: 3,
        methods: ['POST'],
        backoffLimit: 2000
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`[Ledger] Export plug failed: HTTP ${response.status}, trace: ${traceId}, details: ${errorText}`);
    }
    
    const result = await response.json();
    
    // Validate response
    if (!result || !result.prUrl) {
      throw new Error('[Ledger] Invalid response from orchestrator: missing prUrl');
    }
    
    console.log('[Charter] Plug export successful', { prUrl: result.prUrl, traceId });
    return result;
  } catch (error) {
    const err = error as Error;
    console.error('[Ledger] Export plug error:', { error: err.message, traceId, stack: err.stack });
    throw new Error(`[Ledger] Failed to export plug: ${err.message}, trace: ${traceId}`);
  }
}

/**
 * Get test run status by ID
 */
export async function getRunStatus(runId: string): Promise<RunResponse> {
  // Validate input
  if (!runId || typeof runId !== 'string' || runId.trim() === '') {
    throw new Error('[Ledger] Invalid runId: must be a non-empty string');
  }
  
  const traceId = generateTraceId();
  
  try {
    const response = await fetchWithRetry(`${BASE_URL}/api/testing/run/${encodeURIComponent(runId)}`, {
      method: 'GET',
      headers: {
        'x-api-key': API_KEY,
        'x-trace-id': traceId,
        'x-charter-source': 'nurds-deploy-adapter'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`[Ledger] Get run status failed: HTTP ${response.status}, trace: ${traceId}, details: ${errorText}`);
    }
    
    const result = await response.json();
    
    // Validate response
    if (!result || !result.runId) {
      throw new Error('[Ledger] Invalid response from orchestrator: missing runId');
    }
    
    return result;
  } catch (error) {
    const err = error as Error;
    console.error('[Ledger] Get run status error:', { error: err.message, runId, traceId, stack: err.stack });
    throw new Error(`[Ledger] Failed to get run status: ${err.message}, trace: ${traceId}`);
  }
}

export { generateTraceId };
