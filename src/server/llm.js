/**
 * LLM Integration for Nurds Code
 * Default: GROQ (free tier)
 * Upgrade options: OpenRouter, Cloudflare AI Gateway
 */

/**
 * Call GROQ API (default for free tier)
 * @param {string} prompt - User prompt
 * @param {object} env - Environment variables
 * @param {string} model - Model to use (default: llama3-8b-instant)
 * @returns {Promise<object>} - API response
 */
export async function callGroq(prompt, env, model = 'llama3-8b-instant') {
  return fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
    }),
  }).then((r) => r.json());
}

/**
 * Call OpenRouter API (for Pro+ tiers)
 * @param {string} prompt - User prompt
 * @param {object} env - Environment variables
 * @param {string} model - Model to use (default: gpt-4o-mini)
 * @returns {Promise<object>} - API response
 */
export async function callOpenRouter(prompt, env, model = 'openai/gpt-4o-mini') {
  return fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
    }),
  }).then((r) => r.json());
}

/**
 * Call through Cloudflare AI Gateway (optional: for logging/caching/rate limits)
 * @param {string} providerPath - Provider path (e.g., 'groq/chat/completions')
 * @param {object} payload - Request payload
 * @param {object} env - Environment variables
 * @returns {Promise<object>} - API response
 */
export async function callViaGateway(providerPath, payload, env) {
  return fetch(`${env.AI_GATEWAY_URL}/${providerPath}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  }).then((r) => r.json());
}

/**
 * Generate response based on user's plan tier
 * @param {object} user - User object with plan property
 * @param {string} prompt - User prompt
 * @param {object} env - Environment variables
 * @returns {Promise<object>} - API response
 */
export async function generateForUser(user, prompt, env) {
  // Global override: enable GPT-5 for all clients if feature flag is set and provider available
  const enableGpt5 = String(env?.ENABLE_GPT5 || '').toLowerCase() === 'true';
  if (enableGpt5) {
    if (env?.AI_GATEWAY_URL) {
      return callViaGateway(
        'openai/chat/completions',
        {
          model: 'gpt-5',
          messages: [{ role: 'user', content: prompt }],
        },
        env
      );
    }
    if (env?.OPENROUTER_API_KEY) {
      return callOpenRouter(prompt, env, 'openai/gpt-5');
    }
    // If neither OpenAI via Gateway nor OpenRouter is available, fall back to plan-based routing below.
  }

  // Free tier: GROQ 8B (fast, free)
  if (user.plan === 'free') {
    return callGroq(prompt, env, 'llama3-8b-instant');
  }

  // Coffee tier: GROQ 70B (better reasoning)
  if (user.plan === 'coffee') {
    if (env.AI_GATEWAY_URL) {
      return callViaGateway(
        'groq/chat/completions',
        {
          model: 'llama3-70b-8192',
          messages: [{ role: 'user', content: prompt }],
        },
        env
      );
    }

    return callGroq(prompt, env, 'llama3-70b-8192');
  }

  // Pro tier: GPT-4o mini (balanced)
  if (user.plan === 'pro') {
    if (env.AI_GATEWAY_URL) {
      return callViaGateway(
        'openai/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
        },
        env
      );
    }

    if (env.OPENROUTER_API_KEY) {
      return callOpenRouter(prompt, env, 'openai/gpt-4o-mini');
    }

    return callGroq(prompt, env, 'llama3-70b-8192');
  }

  // Enterprise tier: Claude (premium)
  if (env.AI_GATEWAY_URL) {
    return callViaGateway(
      'anthropic/messages',
      {
        model: 'claude-3-opus-20240229',
        messages: [{ role: 'user', content: prompt }],
      },
      env
    );
  }

  if (env.OPENROUTER_API_KEY) {
    return callOpenRouter(prompt, env, 'anthropic/claude-3-opus');
  }

  return callGroq(prompt, env, 'llama3-70b-8192');
}
