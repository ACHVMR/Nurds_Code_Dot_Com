/**
 * Response Utilities for Cloudflare Workers
 * Standardized response helpers
 */

/**
 * Create a JSON response
 * @param {any} data - Response data
 * @param {number} status - HTTP status code
 * @param {object} extraHeaders - Additional headers
 * @returns {Response}
 */
export function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
  });
}

/**
 * Create a success response
 * @param {any} data - Response data
 * @param {string} message - Success message
 * @returns {Response}
 */
export function successResponse(data, message = 'Success') {
  return jsonResponse({
    success: true,
    message,
    data,
  });
}

/**
 * Create an error response
 * @param {string} message - Error message
 * @param {number} status - HTTP status code
 * @param {object} details - Additional error details
 * @returns {Response}
 */
export function errorResponse(message, status = 400, details = {}) {
  return jsonResponse({
    success: false,
    error: message,
    ...details,
  }, status);
}

/**
 * Create a created response (201)
 * @param {any} data - Created resource data
 * @returns {Response}
 */
export function createdResponse(data) {
  return jsonResponse({
    success: true,
    message: 'Created',
    data,
  }, 201);
}

/**
 * Create a no content response (204)
 * @returns {Response}
 */
export function noContentResponse() {
  return new Response(null, { status: 204 });
}

/**
 * Create a redirect response
 * @param {string} url - Redirect URL
 * @param {number} status - Redirect status (301, 302, 307, 308)
 * @returns {Response}
 */
export function redirectResponse(url, status = 302) {
  return new Response(null, {
    status,
    headers: { Location: url },
  });
}

/**
 * Create a streaming response
 * @param {ReadableStream} stream - Stream to send
 * @param {string} contentType - Content type header
 * @returns {Response}
 */
export function streamResponse(stream, contentType = 'text/event-stream') {
  return new Response(stream, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

/**
 * Create a CORS-enabled response
 * @param {Response} response - Original response
 * @param {string} origin - Allowed origin
 * @returns {Response}
 */
export function withCORS(response, origin = '*') {
  const newHeaders = new Headers(response.headers);
  newHeaders.set('Access-Control-Allow-Origin', origin);
  newHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  newHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  newHeaders.set('Access-Control-Max-Age', '86400');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}
