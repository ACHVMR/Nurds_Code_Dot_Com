/**
 * CORS Middleware for Cloudflare Workers
 * Handles preflight requests and adds CORS headers
 */

const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3002',
  'http://localhost:5173',
  'https://nurdscode.com',
  'https://www.nurdscode.com',
];

const DEFAULT_ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];
const DEFAULT_ALLOWED_HEADERS = [
  'Content-Type',
  'Authorization',
  'X-Requested-With',
  'Accept',
  'Origin',
];

/**
 * Get CORS headers for a request
 * @param {Request} request - Incoming request
 * @param {object} options - CORS options
 * @returns {object} CORS headers
 */
export function getCORSHeaders(request, options = {}) {
  const {
    allowedOrigins = DEFAULT_ALLOWED_ORIGINS,
    allowedMethods = DEFAULT_ALLOWED_METHODS,
    allowedHeaders = DEFAULT_ALLOWED_HEADERS,
    allowCredentials = true,
    maxAge = 86400,
  } = options;

  const origin = request.headers.get('Origin') || '*';
  const isAllowed = allowedOrigins.includes(origin) || allowedOrigins.includes('*');

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
    'Access-Control-Allow-Methods': allowedMethods.join(', '),
    'Access-Control-Allow-Headers': allowedHeaders.join(', '),
    'Access-Control-Allow-Credentials': allowCredentials ? 'true' : 'false',
    'Access-Control-Max-Age': String(maxAge),
  };
}

/**
 * Handle CORS preflight (OPTIONS) request
 * @param {Request} request - Incoming request
 * @param {object} options - CORS options
 * @returns {Response} Preflight response
 */
export function handleCORSPreflight(request, options = {}) {
  return new Response(null, {
    status: 204,
    headers: getCORSHeaders(request, options),
  });
}

/**
 * Add CORS headers to a response
 * @param {Response} response - Original response
 * @param {Request} request - Original request
 * @param {object} options - CORS options
 * @returns {Response} Response with CORS headers
 */
export function addCORSHeaders(response, request, options = {}) {
  const corsHeaders = getCORSHeaders(request, options);
  const newHeaders = new Headers(response.headers);
  
  Object.entries(corsHeaders).forEach(([key, value]) => {
    newHeaders.set(key, value);
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}

/**
 * CORS middleware wrapper
 * @param {Function} handler - Route handler
 * @param {object} options - CORS options
 * @returns {Function} Wrapped handler
 */
export function withCORS(handler, options = {}) {
  return async (request, env, ctx) => {
    // Handle preflight
    if (request.method === 'OPTIONS') {
      return handleCORSPreflight(request, options);
    }

    // Execute handler and add CORS headers
    const response = await handler(request, env, ctx);
    return addCORSHeaders(response, request, options);
  };
}
