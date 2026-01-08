/**
 * Error Handler Middleware for Cloudflare Workers
 * Global error catching and formatting
 */

import { serverError, APIError } from '../utils/errors.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('ErrorHandler');

/**
 * Global error handling middleware
 * @param {Function} handler - Route handler
 * @returns {Function} Wrapped handler
 */
export function withErrorHandler(handler) {
  return async (request, env, ctx) => {
    const startTime = Date.now();
    
    try {
      const response = await handler(request, env, ctx);
      
      // Log successful request
      const duration = Date.now() - startTime;
      const url = new URL(request.url);
      logger.info('Request completed', {
        method: request.method,
        path: url.pathname,
        status: response.status,
        duration: `${duration}ms`,
      });
      
      return response;
    } catch (error) {
      // Log error
      const duration = Date.now() - startTime;
      const url = new URL(request.url);
      logger.error('Request failed', {
        method: request.method,
        path: url.pathname,
        error: error.message,
        stack: error.stack,
        duration: `${duration}ms`,
      });

      // Handle known API errors
      if (error instanceof APIError) {
        return error.toResponse();
      }

      // Handle unexpected errors
      return serverError(
        process.env.NODE_ENV === 'production' 
          ? 'An unexpected error occurred' 
          : error.message
      );
    }
  };
}

/**
 * Request timeout middleware
 * @param {Function} handler - Route handler
 * @param {number} timeout - Timeout in milliseconds (default 30s)
 * @returns {Function} Wrapped handler
 */
export function withTimeout(handler, timeout = 30000) {
  return async (request, env, ctx) => {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new APIError('Request timeout', 504));
      }, timeout);
    });

    return Promise.race([
      handler(request, env, ctx),
      timeoutPromise,
    ]);
  };
}

/**
 * Request ID middleware - adds unique ID to each request
 * @param {Function} handler - Route handler
 * @returns {Function} Wrapped handler
 */
export function withRequestId(handler) {
  return async (request, env, ctx) => {
    // Generate unique request ID
    ctx.requestId = crypto.randomUUID();
    
    const response = await handler(request, env, ctx);
    
    // Add request ID to response headers
    const newHeaders = new Headers(response.headers);
    newHeaders.set('X-Request-ID', ctx.requestId);
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  };
}
