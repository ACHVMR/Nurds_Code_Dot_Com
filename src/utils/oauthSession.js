/**
 * OAuth Session Management Utilities
 * Handles secure storage and validation of OAuth tokens
 */

const SESSION_KEY = 'nurds_oauth_session';
const TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 minutes buffer

/**
 * Store OAuth session securely in localStorage
 * @param {Object} sessionData - Session data from OAuth callback
 */
export function storeOAuthSession(sessionData) {
  try {
    const session = {
      ...sessionData,
      timestamp: Date.now(),
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return true;
  } catch (error) {
    console.error('Failed to store OAuth session:', error);
    return false;
  }
}

/**
 * Retrieve OAuth session from localStorage
 * @returns {Object|null} Session data or null if not found/expired
 */
export function getOAuthSession() {
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) return null;

    const session = JSON.parse(stored);
    
    // Check if session is expired (if exp field exists)
    if (session.exp && session.exp * 1000 < Date.now() + TOKEN_EXPIRY_BUFFER) {
      clearOAuthSession();
      return null;
    }

    return session;
  } catch (error) {
    console.error('Failed to retrieve OAuth session:', error);
    clearOAuthSession();
    return null;
  }
}

/**
 * Clear OAuth session from localStorage
 */
export function clearOAuthSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.error('Failed to clear OAuth session:', error);
  }
}

/**
 * Check if user is authenticated via OAuth
 * @returns {boolean} True if authenticated
 */
export function isOAuthAuthenticated() {
  const session = getOAuthSession();
  return session !== null && session.userId;
}

/**
 * Get current user info from OAuth session
 * @returns {Object|null} User info or null
 */
export function getOAuthUser() {
  const session = getOAuthSession();
  if (!session) return null;

  return {
    id: session.userId,
    email: session.email,
    name: session.name,
    avatar: session.avatar,
    provider: session.provider,
  };
}

/**
 * Validate JWT token structure (basic validation)
 * @param {string} token - JWT token to validate
 * @returns {Object|null} Decoded payload or null if invalid
 */
export function validateJWTStructure(token) {
  try {
    if (!token || typeof token !== 'string') return null;
    
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch (error) {
    console.error('Invalid JWT structure:', error);
    return null;
  }
}

/**
 * Extract session data from URL parameters (for OAuth callback)
 * @returns {Object|null} Session data from URL or null
 */
export function extractSessionFromURL() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (!token) return null;

    const payload = validateJWTStructure(token);
    if (!payload) return null;

    // Clean URL by removing token parameter
    const newUrl = new URL(window.location);
    newUrl.searchParams.delete('token');
    window.history.replaceState({}, document.title, newUrl.toString());

    return {
      token,
      userId: payload.userId,
      exp: payload.exp,
      iat: payload.iat,
    };
  } catch (error) {
    console.error('Failed to extract session from URL:', error);
    return null;
  }
}