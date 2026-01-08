/**
 * JWT Utilities for Cloudflare Workers
 * Handles token generation and verification
 */

/**
 * Generate a simple JWT token
 * @param {string} userId - User identifier
 * @param {string} secret - JWT secret
 * @returns {string} JWT token
 */
export function generateToken(userId, secret) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7), // 7 days
  };

  const base64Header = btoa(JSON.stringify(header));
  const base64Payload = btoa(JSON.stringify(payload));
  const signature = btoa(secret + base64Header + base64Payload);

  return `${base64Header}.${base64Payload}.${signature}`;
}

/**
 * Verify a JWT token
 * @param {string} token - JWT token to verify
 * @param {string} secret - JWT secret
 * @returns {object|null} Decoded payload or null if invalid
 */
export function verifyToken(token, secret) {
  try {
    const [header, payload, signature] = token.split('.');
    const expectedSignature = btoa(secret + header + payload);

    if (signature !== expectedSignature) {
      return null;
    }

    const decodedPayload = JSON.parse(atob(payload));

    if (decodedPayload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return decodedPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Base64URL decode utility
 * @param {string} base64url - Base64URL encoded string
 * @returns {Uint8Array} Decoded bytes
 */
export function base64urlToUint8Array(base64url) {
  const pad = '='.repeat((4 - (base64url.length % 4)) % 4);
  const base64 = (base64url + pad).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}
