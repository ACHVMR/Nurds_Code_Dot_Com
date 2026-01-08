/**
 * OAuth Service for Cloudflare Workers
 * Google and GitHub OAuth implementation
 */

import { generateToken } from '../utils/jwt.js';

/**
 * OAuth provider configurations
 */
const OAUTH_PROVIDERS = {
  google: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
    scopes: ['openid', 'email', 'profile'],
  },
  github: {
    authUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    userInfoUrl: 'https://api.github.com/user',
    scopes: ['user:email', 'read:user'],
  },
};

/**
 * Generate OAuth authorization URL
 * @param {string} provider - OAuth provider (google/github)
 * @param {object} env - Environment bindings
 * @param {string} redirectUri - Callback URL
 * @returns {string} Authorization URL
 */
export function getAuthorizationUrl(provider, env, redirectUri) {
  const config = OAUTH_PROVIDERS[provider];
  if (!config) {
    throw new Error(`Unknown OAuth provider: ${provider}`);
  }

  const clientId = provider === 'google' 
    ? env.GOOGLE_CLIENT_ID 
    : env.GITHUB_CLIENT_ID;

  const state = crypto.randomUUID();
  
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: config.scopes.join(' '),
    state,
  });

  if (provider === 'google') {
    params.set('access_type', 'offline');
    params.set('prompt', 'consent');
  }

  return `${config.authUrl}?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens
 * @param {string} provider - OAuth provider
 * @param {string} code - Authorization code
 * @param {object} env - Environment bindings
 * @param {string} redirectUri - Callback URL
 * @returns {Promise<object>} Token response
 */
export async function exchangeCodeForTokens(provider, code, env, redirectUri) {
  const config = OAUTH_PROVIDERS[provider];
  
  const clientId = provider === 'google' 
    ? env.GOOGLE_CLIENT_ID 
    : env.GITHUB_CLIENT_ID;
  
  const clientSecret = provider === 'google' 
    ? env.GOOGLE_CLIENT_SECRET 
    : env.GITHUB_CLIENT_SECRET;

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  });

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  return response.json();
}

/**
 * Get user info from OAuth provider
 * @param {string} provider - OAuth provider
 * @param {string} accessToken - Access token
 * @returns {Promise<object>} User info
 */
export async function getUserInfo(provider, accessToken) {
  const config = OAUTH_PROVIDERS[provider];

  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Accept': 'application/json',
  };

  if (provider === 'github') {
    headers['User-Agent'] = 'NurdsCode-App';
  }

  const response = await fetch(config.userInfoUrl, { headers });

  if (!response.ok) {
    throw new Error(`Failed to get user info: ${response.statusText}`);
  }

  const userInfo = await response.json();

  // Get email for GitHub (might need separate request)
  if (provider === 'github' && !userInfo.email) {
    const emailResponse = await fetch('https://api.github.com/user/emails', { headers });
    if (emailResponse.ok) {
      const emails = await emailResponse.json();
      const primaryEmail = emails.find(e => e.primary);
      userInfo.email = primaryEmail?.email || emails[0]?.email;
    }
  }

  return normalizeUserInfo(provider, userInfo);
}

/**
 * Normalize user info across providers
 * @param {string} provider - OAuth provider
 * @param {object} rawInfo - Raw user info from provider
 * @returns {object} Normalized user info
 */
function normalizeUserInfo(provider, rawInfo) {
  if (provider === 'google') {
    return {
      id: rawInfo.id,
      email: rawInfo.email,
      name: rawInfo.name,
      picture: rawInfo.picture,
      provider: 'google',
    };
  }

  if (provider === 'github') {
    return {
      id: String(rawInfo.id),
      email: rawInfo.email,
      name: rawInfo.name || rawInfo.login,
      picture: rawInfo.avatar_url,
      username: rawInfo.login,
      provider: 'github',
    };
  }

  return rawInfo;
}

/**
 * Create or update user in database and generate session token
 * @param {object} userInfo - Normalized user info
 * @param {object} supabase - Supabase client
 * @param {object} env - Environment bindings
 * @returns {Promise<object>} Session with token
 */
export async function createSession(userInfo, supabase, env) {
  // Upsert user in database
  const { data: user, error } = await supabase
    .from('users')
    .upsert({
      email: userInfo.email,
      name: userInfo.name,
      avatar_url: userInfo.picture,
      provider: userInfo.provider,
      provider_id: userInfo.id,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'email',
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create user: ${error.message}`);
  }

  // Generate JWT token
  const token = generateToken(user.id, env.JWT_SECRET);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar_url: user.avatar_url,
    },
    token,
    expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
  };
}
