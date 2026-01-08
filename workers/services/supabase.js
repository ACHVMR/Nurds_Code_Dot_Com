/**
 * Supabase Service for Cloudflare Workers
 * Database client and common queries
 */

import { createClient } from '@supabase/supabase-js';

/**
 * Create Supabase client
 * @param {object} env - Environment bindings
 * @returns {object} Supabase client
 */
export function getSupabaseClient(env) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
    },
  });
}

/**
 * Create Supabase admin client (service role)
 * @param {object} env - Environment bindings
 * @returns {object} Supabase admin client
 */
export function getSupabaseAdmin(env) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// ==================== User Operations ====================

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @param {object} supabase - Supabase client
 * @returns {Promise<object|null>} User or null
 */
export async function getUserById(userId, supabase) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('[Supabase] getUserById error:', error);
    return null;
  }

  return data;
}

/**
 * Get user by email
 * @param {string} email - User email
 * @param {object} supabase - Supabase client
 * @returns {Promise<object|null>} User or null
 */
export async function getUserByEmail(email, supabase) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('[Supabase] getUserByEmail error:', error);
    return null;
  }

  return data;
}

/**
 * Create or update user
 * @param {object} userData - User data
 * @param {object} supabase - Supabase client
 * @returns {Promise<object>} User
 */
export async function upsertUser(userData, supabase) {
  const { data, error } = await supabase
    .from('users')
    .upsert({
      ...userData,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'email',
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to upsert user: ${error.message}`);
  }

  return data;
}

// ==================== Agent Operations ====================

/**
 * Get agents for user
 * @param {string} userId - User ID
 * @param {object} supabase - Supabase client
 * @returns {Promise<array>} Agents
 */
export async function getAgents(userId, supabase) {
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Supabase] getAgents error:', error);
    return [];
  }

  return data;
}

/**
 * Get single agent
 * @param {string} agentId - Agent ID
 * @param {string} userId - User ID
 * @param {object} supabase - Supabase client
 * @returns {Promise<object|null>} Agent or null
 */
export async function getAgent(agentId, userId, supabase) {
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('id', agentId)
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('[Supabase] getAgent error:', error);
    return null;
  }

  return data;
}

/**
 * Create agent
 * @param {object} agentData - Agent data
 * @param {object} supabase - Supabase client
 * @returns {Promise<object>} Created agent
 */
export async function createAgent(agentData, supabase) {
  const { data, error } = await supabase
    .from('agents')
    .insert(agentData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create agent: ${error.message}`);
  }

  return data;
}

/**
 * Update agent
 * @param {string} agentId - Agent ID
 * @param {string} userId - User ID
 * @param {object} updates - Update data
 * @param {object} supabase - Supabase client
 * @returns {Promise<object>} Updated agent
 */
export async function updateAgent(agentId, userId, updates, supabase) {
  const { data, error } = await supabase
    .from('agents')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', agentId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update agent: ${error.message}`);
  }

  return data;
}

/**
 * Delete agent
 * @param {string} agentId - Agent ID
 * @param {string} userId - User ID
 * @param {object} supabase - Supabase client
 * @returns {Promise<void>}
 */
export async function deleteAgent(agentId, userId, supabase) {
  const { error } = await supabase
    .from('agents')
    .delete()
    .eq('id', agentId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to delete agent: ${error.message}`);
  }
}

// ==================== Project Operations ====================

/**
 * Get projects for user
 * @param {string} userId - User ID
 * @param {object} supabase - Supabase client
 * @returns {Promise<array>} Projects
 */
export async function getProjects(userId, supabase) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('[Supabase] getProjects error:', error);
    return [];
  }

  return data;
}

/**
 * Create project
 * @param {object} projectData - Project data
 * @param {object} supabase - Supabase client
 * @returns {Promise<object>} Created project
 */
export async function createProject(projectData, supabase) {
  const { data, error } = await supabase
    .from('projects')
    .insert(projectData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create project: ${error.message}`);
  }

  return data;
}

// ==================== Subscription Operations ====================

/**
 * Get user subscription
 * @param {string} userId - User ID
 * @param {object} supabase - Supabase client
 * @returns {Promise<object|null>} Subscription or null
 */
export async function getSubscription(userId, supabase) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('[Supabase] getSubscription error:', error);
    return null;
  }

  return data;
}

/**
 * Check if user has active subscription
 * @param {string} userId - User ID
 * @param {object} supabase - Supabase client
 * @returns {Promise<boolean>}
 */
export async function hasActiveSubscription(userId, supabase) {
  const subscription = await getSubscription(userId, supabase);
  return subscription?.status === 'active';
}
