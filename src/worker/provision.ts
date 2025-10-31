// Multi-tenant user provisioning for Nurds Code platform
// Creates tenant, user, and initial plug on signup

import { createClient } from '@supabase/supabase-js';
import type { Env, ProvisionUserRequest } from './env';

/**
 * Provision a new user with tenant isolation
 * Called after Clerk signup webhook or manual provision
 */
export async function provisionUser(
  user: ProvisionUserRequest,
  env: Env
): Promise<{ tenant: any; user: any; plug: any }> {
  const supabase = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // Step 1: Create tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        name: `tenant_${user.id}`,
        slug: user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '_'),
        metadata: {
          created_by: 'auto_provision',
          clerk_user_id: user.id,
        },
      })
      .select()
      .single();

    if (tenantError) throw tenantError;

    // Step 2: Create user record
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        tenant_id: tenant.id,
        email: user.email,
        tier: user.tier || 'free',
        credits_remaining: getTierTokens(user.tier || 'free'),
        metadata: {
          provisioned_at: new Date().toISOString(),
          initial_tier: user.tier || 'free',
        },
      })
      .select()
      .single();

    if (userError) throw userError;

    // Step 3: Create initial "Welcome" plug
    const agentName = `Welcome_Ang`; // Boomer_Angs naming convention
    const { data: plug, error: plugError } = await supabase
      .from('plugs')
      .insert({
        tenant_id: tenant.id,
        owner: user.id,
        name: 'Welcome Plug',
        description: 'Your first Nurds Code plug - start building!',
        tier: user.tier || 'free',
        status: 'active',
        agent_name: agentName,
        framework: 'boomer_angs',
        config: {
          auto_generated: true,
          template: 'welcome',
        },
      })
      .select()
      .single();

    if (plugError) throw plugError;

    // Step 4: Create tenant schema for isolation
    await supabase.rpc('create_user_schema', { uid: user.id });

    // Step 5: Initialize circuit breaker monitoring for user
    await supabase.from('usage_logs').insert({
      user_id: user.id,
      plug_id: plug.id,
      service: 'provisioning',
      tokens_used: 0,
      cost_usd: 0,
      metadata: {
        action: 'user_provisioned',
        tenant_id: tenant.id,
      },
    });

    return { tenant, user: userData, plug };
  } catch (error) {
    console.error('Provision error:', error);
    throw new Error(`Failed to provision user: ${error.message}`);
  }
}

/**
 * Get token allocation for tier
 */
function getTierTokens(tier: string): number {
  const allocations: Record<string, number> = {
    free: 0,
    coffee: 25000,
    lite: 200000,
    medium: 600000,
    heavy: 1500000,
    superior: 1500000,
  };
  return allocations[tier] || 0;
}

/**
 * Deprovision user (soft delete - archive data)
 */
export async function deprovisionUser(
  userId: string,
  env: Env
): Promise<void> {
  const supabase = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Archive all plugs
  await supabase
    .from('plugs')
    .update({ status: 'archived' })
    .eq('owner', userId);

  // Archive agents
  await supabase
    .from('agents')
    .update({ status: 'archived' })
    .eq('user_id', userId);

  // User record stays for audit trail but tenant is marked
  await supabase
    .from('tenants')
    .update({ metadata: { archived: true, archived_at: new Date().toISOString() } })
    .eq('id', (await supabase.from('users').select('tenant_id').eq('id', userId).single()).data?.tenant_id);
}

/**
 * Upgrade user tier
 */
export async function upgradeUserTier(
  userId: string,
  newTier: string,
  stripeSubscriptionId: string,
  env: Env
): Promise<void> {
  const supabase = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Update user tier
  await supabase
    .from('users')
    .update({
      tier: newTier,
      credits_remaining: getTierTokens(newTier),
    })
    .eq('id', userId);

  // Create/update subscription record
  await supabase.from('subscriptions').upsert({
    user_id: userId,
    stripe_subscription_id: stripeSubscriptionId,
    tier: newTier,
    status: 'active',
    current_period_start: new Date(),
    current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
  });

  // Log the upgrade
  await supabase.from('usage_logs').insert({
    user_id: userId,
    service: 'billing',
    tokens_used: 0,
    cost_usd: 0,
    metadata: {
      action: 'tier_upgrade',
      old_tier: 'free', // TODO: fetch old tier
      new_tier: newTier,
      subscription_id: stripeSubscriptionId,
    },
  });
}
