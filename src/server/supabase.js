/**
 * Supabase Client for Cloudflare Workers
 * Replaces D1 with PostgreSQL + Row Level Security
 */

import { createClient } from '@supabase/supabase-js';

/**
 * Initialize Supabase client with service role key
 * @param {Object} env - Environment variables from Cloudflare Worker
 * @returns {Object} Supabase client instance
 */
export function getSupabaseClient(env) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      },
      db: {
        schema: 'public'
      }
    }
  );
}

/**
 * Initialize Supabase client with anon key (for frontend)
 * @param {Object} env - Environment variables
 * @returns {Object} Supabase client instance
 */
export function getSupabaseAnonClient(env) {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_ANON_KEY');
  }

  return createClient(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true
      }
    }
  );
}

/**
 * Get or create tenant for user
 * @param {Object} supabase - Supabase client
 * @param {string} email - User email
 * @param {string} tier - Subscription tier
 * @returns {Promise<Object>} Tenant record
 */
export async function getOrCreateTenant(supabase, email, tier = 'free') {
  const slug = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-');
  
  // Check if tenant exists
  const { data: existingTenant, error: fetchError } = await supabase
    .from('tenants')
    .select('*')
    .eq('slug', slug)
    .single();

  if (existingTenant) {
    return existingTenant;
  }

  // Create new tenant
  const { data: newTenant, error: createError } = await supabase
    .from('tenants')
    .insert({
      name: `${email.split('@')[0]}'s Workspace`,
      slug,
      tier,
      metadata: { created_from: 'signup', email }
    })
    .select()
    .single();

  if (createError) {
    throw new Error(`Failed to create tenant: ${createError.message}`);
  }

  return newTenant;
}

/**
 * Get or create user in tenant
 * @param {Object} supabase - Supabase client
 * @param {string} tenantId - Tenant UUID
 * @param {string} email - User email
 * @param {string} name - User name
 * @returns {Promise<Object>} User record
 */
export async function getOrCreateUser(supabase, tenantId, email, name = null) {
  // Check if user exists
  const { data: existingUser, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .eq('tenant_id', tenantId)
    .single();

  if (existingUser) {
    // Update last_seen_at
    await supabase
      .from('users')
      .update({ last_seen_at: new Date().toISOString() })
      .eq('id', existingUser.id);
    
    return existingUser;
  }

  // Create new user
  const { data: newUser, error: createError } = await supabase
    .from('users')
    .insert({
      tenant_id: tenantId,
      email,
      name: name || email.split('@')[0],
      role: 'user',
      last_seen_at: new Date().toISOString()
    })
    .select()
    .single();

  if (createError) {
    throw new Error(`Failed to create user: ${createError.message}`);
  }

  return newUser;
}

/**
 * Save chat message to history
 * @param {Object} supabase - Supabase client
 * @param {string} tenantId - Tenant UUID
 * @param {string} userId - User UUID
 * @param {string} sessionId - Chat session UUID
 * @param {string} role - Message role (user/assistant/system)
 * @param {string} content - Message content
 * @param {Object} metadata - Additional metadata (model, tokens, etc.)
 * @returns {Promise<Object>} Chat history record
 */
export async function saveChatMessage(supabase, tenantId, userId, sessionId, role, content, metadata = {}) {
  const { data, error } = await supabase
    .from('chat_history')
    .insert({
      tenant_id: tenantId,
      user_id: userId,
      session_id: sessionId,
      role,
      content,
      model: metadata.model,
      tokens_used: metadata.tokens_used,
      plan: metadata.plan,
      metadata: metadata.extra || {}
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to save chat message:', error);
    // Non-blocking - don't throw
    return null;
  }

  return data;
}

/**
 * Get chat history for session
 * @param {Object} supabase - Supabase client
 * @param {string} sessionId - Chat session UUID
 * @param {number} limit - Maximum messages to retrieve
 * @returns {Promise<Array>} Array of chat messages
 */
export async function getChatHistory(supabase, sessionId, limit = 20) {
  const { data, error } = await supabase
    .from('chat_history')
    .select('role, content, created_at')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('Failed to fetch chat history:', error);
    return [];
  }

  return data.map(msg => ({
    role: msg.role,
    content: msg.content
  }));
}

/**
 * Log API usage for analytics
 * @param {Object} supabase - Supabase client
 * @param {string} tenantId - Tenant UUID
 * @param {string} userId - User UUID (optional)
 * @param {string} endpoint - API endpoint
 * @param {string} method - HTTP method
 * @param {number} statusCode - Response status code
 * @param {number} responseTimeMs - Response time in milliseconds
 * @param {Object} metadata - Additional metadata
 * @returns {Promise<void>}
 */
export async function logAPIUsage(supabase, tenantId, userId, endpoint, method, statusCode, responseTimeMs, metadata = {}) {
  await supabase
    .from('api_usage')
    .insert({
      tenant_id: tenantId,
      user_id: userId,
      endpoint,
      method,
      status_code: statusCode,
      response_time_ms: responseTimeMs,
      tokens_used: metadata.tokens_used,
      metadata: metadata.extra || {}
    });
}

/**
 * Update subscription in Supabase (from Stripe webhook)
 * @param {Object} supabase - Supabase client
 * @param {string} customerId - Stripe customer ID
 * @param {Object} subscriptionData - Subscription details from Stripe
 * @returns {Promise<Object>} Updated subscription record
 */
export async function upsertSubscription(supabase, customerId, subscriptionData) {
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!tenant) {
    throw new Error(`No tenant found for customer ${customerId}`);
  }

  const { data, error } = await supabase
    .from('subscriptions')
    .upsert({
      tenant_id: tenant.id,
      customer_id: customerId,
      subscription_id: subscriptionData.id,
      price_id: subscriptionData.items.data[0].price.id,
      status: subscriptionData.status,
      current_period_start: new Date(subscriptionData.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscriptionData.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscriptionData.cancel_at_period_end,
      metadata: subscriptionData.metadata || {}
    }, {
      onConflict: 'subscription_id'
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update subscription: ${error.message}`);
  }

  // Update tenant tier based on price_id
  const tierMap = {
    'price_coffee': 'coffee',
    'price_pro': 'pro',
    'price_enterprise': 'enterprise'
  };

  const tier = tierMap[subscriptionData.items.data[0].price.id] || 'free';
  
  await supabase
    .from('tenants')
    .update({ tier })
    .eq('id', tenant.id);

  return data;
}

/**
 * Get subscription for user
 * @param {Object} supabase - Supabase client
 * @param {string} email - User email
 * @returns {Promise<Object>} Subscription details with tenant info
 */
export async function getSubscriptionByEmail(supabase, email) {
  const { data: user } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('email', email)
    .single();

  if (!user) {
    return null;
  }

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select(`
      *,
      tenants (
        id,
        name,
        tier,
        slug
      )
    `)
    .eq('tenant_id', user.tenant_id)
    .eq('status', 'active')
    .single();

  return subscription;
}
