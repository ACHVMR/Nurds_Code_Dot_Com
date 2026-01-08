/**
 * Error Utilities for Cloudflare Workers
 * Standardized error responses and error handling
 */

/**
 * Create a standardized JSON error response
 * @param {string} message - Error message
 * @param {number} status - HTTP status code (default 500)
 * @param {object} details - Additional error details
 * @returns {Response} JSON error response
 */
export function errorResponse(message, status = 500, details = {}) {
  return new Response(
    JSON.stringify({
      error: true,
      message,
      status,
      ...details,
      timestamp: new Date().toISOString(),
    }),
    {
      status,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

/**
 * 400 Bad Request
 */
export function badRequest(message = 'Bad Request', details = {}) {
  return errorResponse(message, 400, details);
}

/**
 * 401 Unauthorized
 */
export function unauthorized(message = 'Unauthorized', details = {}) {
  return errorResponse(message, 401, details);
}

/**
 * 403 Forbidden
 */
export function forbidden(message = 'Forbidden', details = {}) {
  return errorResponse(message, 403, details);
}

/**
 * 404 Not Found
 */
export function notFound(message = 'Not Found', details = {}) {
  return errorResponse(message, 404, details);
}

/**
 * 405 Method Not Allowed
 */
export function methodNotAllowed(message = 'Method Not Allowed', details = {}) {
  return errorResponse(message, 405, details);
}

/**
 * 429 Rate Limited
 */
export function rateLimited(message = 'Too Many Requests', details = {}) {
  return errorResponse(message, 429, details);
}

/**
 * 500 Internal Server Error
 */
export function serverError(message = 'Internal Server Error', details = {}) {
  return errorResponse(message, 500, details);
}

/**
 * 503 Service Unavailable
 */
export function serviceUnavailable(message = 'Service Unavailable', details = {}) {
  return errorResponse(message, 503, details);
}

/**
 * Custom error class for API errors
 */
export class APIError extends Error {
  constructor(message, status = 500, details = {}) {
    super(message);
    this.status = status;
    this.details = details;
    this.name = 'APIError';
  }

  toResponse() {
    return errorResponse(this.message, this.status, this.details);
  }
}

/**
 * Wrap async handler with error catching
 * @param {Function} handler - Async request handler
 * @returns {Function} Wrapped handler
 */
export function withErrorHandling(handler) {
  return async (request, env, ctx) => {
    try {
      return await handler(request, env, ctx);
    } catch (error) {
      console.error('[API Error]', error);
      
      if (error instanceof APIError) {
        return error.toResponse();
      }
      
      return serverError(
        error.message || 'An unexpected error occurred',
        { stack: error.stack }
      );
    }
  };
}
