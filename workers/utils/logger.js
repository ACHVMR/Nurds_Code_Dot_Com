/**
 * Logger Utilities for Cloudflare Workers
 * Structured logging with levels and context
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

/**
 * Create a logger instance with optional context
 * @param {string} context - Logger context/module name
 * @returns {object} Logger instance
 */
export function createLogger(context = 'API') {
  const minLevel = LOG_LEVELS.INFO; // Could be configurable via env

  const formatMessage = (level, message, data = {}) => {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      context,
      message,
      ...data,
    });
  };

  return {
    debug(message, data = {}) {
      if (LOG_LEVELS.DEBUG >= minLevel) {
        console.log(formatMessage('DEBUG', message, data));
      }
    },

    info(message, data = {}) {
      if (LOG_LEVELS.INFO >= minLevel) {
        console.log(formatMessage('INFO', message, data));
      }
    },

    warn(message, data = {}) {
      if (LOG_LEVELS.WARN >= minLevel) {
        console.warn(formatMessage('WARN', message, data));
      }
    },

    error(message, data = {}) {
      if (LOG_LEVELS.ERROR >= minLevel) {
        console.error(formatMessage('ERROR', message, data));
      }
    },

    /**
     * Log a request with timing
     * @param {Request} request - Incoming request
     * @param {Response} response - Outgoing response
     * @param {number} startTime - Request start timestamp
     */
    request(request, response, startTime) {
      const duration = Date.now() - startTime;
      const url = new URL(request.url);
      
      console.log(formatMessage('INFO', 'Request completed', {
        method: request.method,
        path: url.pathname,
        status: response.status,
        duration: `${duration}ms`,
      }));
    },
  };
}

/**
 * Default logger instance
 */
export const logger = createLogger('API');
