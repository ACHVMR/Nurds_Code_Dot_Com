// Authentication utility functions

/**
 * Store JWT token in localStorage
 * @param {string} token - JWT token
 */
export function setToken(token) {
  localStorage.setItem('nurdscode_token', token);
}

/**
 * Retrieve JWT token from localStorage
 * @returns {string|null} JWT token or null
 */
export function getToken() {
  return localStorage.getItem('nurdscode_token');
}

/**
 * Remove JWT token from localStorage
 */
export function removeToken() {
  localStorage.removeItem('nurdscode_token');
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if authenticated
 */
export function isAuthenticated() {
  const token = getToken();
  if (!token) return false;
  
  try {
    // Simple validation - check if token has three parts
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    // Decode payload
    const payload = JSON.parse(atob(parts[1]));
    
    // Check expiration
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      removeToken();
      return false;
    }
    
    return true;
  } catch (error) {
    removeToken();
    return false;
  }
}

/**
 * Get user data from JWT token
 * @returns {Object|null} User data or null
 */
export function getUserFromToken() {
  const token = getToken();
  if (!token) return null;
  
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    return {
      userId: payload.userId,
      iat: payload.iat,
      exp: payload.exp,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Make authenticated API request
 * @param {string} url - API endpoint URL
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} Fetch response
 */
export async function authFetch(url, options = {}) {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return fetch(url, {
    ...options,
    headers,
  });
}
