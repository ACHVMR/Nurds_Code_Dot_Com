/**
 * ================================================
 * PLUS 1 TEAM PLAN API - Collaborative Pricing Backend
 * ================================================
 * Handles Plus 1 team subscriptions, DIFU ledger, and Clerk integration
 * Rideshare-style pricing: Base plan + $1 per collaborator per day
 * 
 * Routes:
 * POST   /api/plus1/subscription/create       - Create Plus 1 subscription
 * POST   /api/plus1/collaborator/add         - Add collaborator to team
 * POST   /api/plus1/collaborator/accept      - Accept collaboration invite
 * POST   /api/plus1/checkout                 - Initiate Plus 1 checkout
 * POST   /api/plus1/payment/webhook          - Stripe webhook handler
 * GET    /api/plus1/subscription             - Get user's current subscription
 * GET    /api/plus1/collaborators            - Get collaborators list
 * GET    /api/plus1/difu/balance             - Get DIFU account balance
 * POST   /api/plus1/difu/transfer            - Transfer DIFU between users
 */

import { json, Router } from 'itty-router';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const router = Router();

// ================================================
// INITIALIZE CLIENTS
// ================================================

function getSupabaseClient(env) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
}

function getStripeClient(env) {
  return new Stripe(env.STRIPE_SECRET_KEY);
}

// ================================================
// CLERK USER SYNC
// ================================================

/**
 * Sync Clerk user to local profiles table
 * Called on first login or profile update
 */
async function syncClerkUser(env, clerkId, clerkEmail, firstName, lastName, avatarUrl) {
  const supabase = getSupabaseClient(env);
  
  const { data, error } = await supabase
    .from('clerk_user_profiles')
    .upsert({
      clerk_id: clerkId,
      clerk_email: clerkEmail,
      clerk_first_name: firstName,
      clerk_last_name: lastName,
      clerk_avatar_url: avatarUrl,
      synced_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'clerk_id'
    })
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to sync Clerk user: ${error.message}`);
  }
  
  // Create DIFU account if doesn't exist
  await supabase.rpc('get_or_create_difu_account', {
    p_user_id: data.id,
    p_clerk_id: clerkId
  });
  
  return data;
}

// ================================================
// PLUS 1 SUBSCRIPTION ENDPOINTS
// ================================================

/**
 * POST /api/plus1/subscription/create
 * Create a new Plus 1 subscription for a user
 * 
 * Body:
 * {
 *   clerkId: string,
 *   planName: 'coffee' | 'lite' | 'superior',
 *   paymentModel: 'daily' | 'prepay_7' | 'prepay_30',
 *   totalDays?: number (default 1)
 * }
 */
router.post('/api/plus1/subscription/create', async (req, env) => {
  try {
    const { clerkId, planName, paymentModel, totalDays = 1 } = await req.json();
    
    if (!clerkId || !planName || !paymentModel) {
      return json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const supabase = getSupabaseClient(env);
    
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('clerk_user_profiles')
      .select('id')
      .eq('clerk_id', clerkId)
      .single();
    
    if (profileError) {
      return json({ error: 'User profile not found' }, { status: 404 });
    }
    
    // Create subscription using stored function
    const { data: subscription, error: subError } = await supabase.rpc(
      'create_plus_1_subscription',
      {
        p_user_id: profile.id,
        p_plan_name: planName,
        p_payment_model: paymentModel,
        p_total_days: totalDays
      }
    );
    
    if (subError) {
      return json({ error: `Failed to create subscription: ${subError.message}` }, { status: 500 });
    }
    
    return json({
      success: true,
      subscriptionId: subscription,
      message: `Plus 1 ${planName.toUpperCase()} subscription created`
    });
  } catch (error) {
    return json({ error: error.message }, { status: 500 });
  }
});

/**
 * POST /api/plus1/collaborator/add
 * Add a collaborator to Plus 1 team
 * 
 * Body:
 * {
 *   subscriptionId: UUID,
 *   hostClerkId: string,
 *   collaboratorEmail: string,
 *   collaboratorClerkId?: string (if already registered)
 * }
 */
router.post('/api/plus1/collaborator/add', async (req, env) => {
  try {
    const { subscriptionId, hostClerkId, collaboratorEmail, collaboratorClerkId } = await req.json();
    
    if (!subscriptionId || !hostClerkId || !collaboratorEmail) {
      return json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const supabase = getSupabaseClient(env);
    
    // Get host profile
    const { data: hostProfile } = await supabase
      .from('clerk_user_profiles')
      .select('id')
      .eq('clerk_id', hostClerkId)
      .single();
    
    let collaboratorId = null;
    
    // If collaborator already registered, get their ID
    if (collaboratorClerkId) {
      const { data: collabProfile } = await supabase
        .from('clerk_user_profiles')
        .select('id')
        .eq('clerk_id', collaboratorClerkId)
        .single();
      
      if (collabProfile) {
        collaboratorId = collabProfile.id;
      }
    }
    
    // Add collaborator using stored function
    const { data: result, error } = await supabase.rpc(
      'add_plus_1_collaborator',
      {
        p_subscription_id: subscriptionId,
        p_host_id: hostProfile.id,
        p_collaborator_id: collaboratorId,
        p_email: collaboratorEmail
      }
    );
    
    if (error) {
      return json({ error: `Failed to add collaborator: ${error.message}` }, { status: 500 });
    }
    
    return json({
      success: true,
      collaboratorRecordId: result,
      email: collaboratorEmail,
      message: 'Collaborator invite sent (pending acceptance)'
    });
  } catch (error) {
    return json({ error: error.message }, { status: 500 });
  }
});

/**
 * POST /api/plus1/collaborator/accept
 * Collaborator accepts team invitation
 */
router.post('/api/plus1/collaborator/accept', async (req, env) => {
  try {
    const { collaboratorRecordId, collaboratorClerkId } = await req.json();
    
    if (!collaboratorRecordId || !collaboratorClerkId) {
      return json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const supabase = getSupabaseClient(env);
    
    // Get collaborator profile
    const { data: collabProfile } = await supabase
      .from('clerk_user_profiles')
      .select('id')
      .eq('clerk_id', collaboratorClerkId)
      .single();
    
    // Update collaborator record
    const { error } = await supabase
      .from('plus_1_collaborators')
      .update({
        collaborator_id: collabProfile.id,
        accepted_at: new Date().toISOString(),
        status: 'accepted'
      })
      .eq('id', collaboratorRecordId);
    
    if (error) {
      return json({ error: error.message }, { status: 500 });
    }
    
    // Credit DIFU to host for successful collaborator
    await supabase.rpc('credit_difu', {
      p_user_id: (await supabase.from('plus_1_collaborators').select('host_id').eq('id', collaboratorRecordId).single()).data.host_id,
      p_amount: 10.0,
      p_transaction_type: 'bonus_collaborator_joined',
      p_description: `Bonus: Collaborator accepted invitation`,
      p_collaboration_id: null
    });
    
    return json({
      success: true,
      message: 'Collaboration invitation accepted! Host received 10 DIFU bonus.'
    });
  } catch (error) {
    return json({ error: error.message }, { status: 500 });
  }
});

/**
 * POST /api/plus1/checkout
 * Initiate Plus 1 checkout (Stripe payment intent)
 * 
 * Body:
 * {
 *   clerkId: string,
 *   subscriptionId: UUID,
 *   collaboratorCount: number,
 *   days: number,
 *   paymentModel: 'daily' | 'split' | 'host_pays'
 * }
 */
router.post('/api/plus1/checkout', async (req, env) => {
  try {
    const { clerkId, subscriptionId, collaboratorCount, days, paymentModel } = await req.json();
    
    if (!clerkId || !subscriptionId || !collaboratorCount || !days) {
      return json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const stripe = getStripeClient(env);
    const supabase = getSupabaseClient(env);
    
    // Get subscription details
    const { data: subscription } = await supabase
      .from('plus_1_subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .single();
    
    if (!subscription) {
      return json({ error: 'Subscription not found' }, { status: 404 });
    }
    
    // Calculate cost: $1 per collaborator per day
    const costPerCollab = 1.00;
    const totalAmount = collaboratorCount * costPerCollab * days * 100; // Convert to cents
    
    // Get or create Stripe customer
    let stripeCustomer;
    const { data: profile } = await supabase
      .from('clerk_user_profiles')
      .select('id')
      .eq('clerk_id', clerkId)
      .single();
    
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount),
      currency: 'usd',
      description: `Plus 1 Team Plan - ${collaboratorCount} collaborators for ${days} day(s)`,
      metadata: {
        clerkId,
        subscriptionId,
        collaboratorCount,
        days,
        paymentModel
      }
    });
    
    return json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      amount: totalAmount / 100,
      message: `Checkout initiated: $${(totalAmount / 100).toFixed(2)} for ${collaboratorCount} collaborator(s) × ${days} day(s)`
    });
  } catch (error) {
    return json({ error: error.message }, { status: 500 });
  }
});

/**
 * POST /api/plus1/payment/webhook
 * Stripe webhook handler for Plus 1 payments
 * Activates PiP mode and credits DIFU on successful payment
 */
router.post('/api/plus1/payment/webhook', async (req, env) => {
  try {
    const signature = req.headers.get('stripe-signature');
    const body = await req.text();
    
    const stripe = getStripeClient(env);
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );
    
    const supabase = getSupabaseClient(env);
    
    // Handle payment_intent.succeeded
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const { clerkId, subscriptionId, collaboratorCount, days } = paymentIntent.metadata;
      
      // Get user profile
      const { data: profile } = await supabase
        .from('clerk_user_profiles')
        .select('id')
        .eq('clerk_id', clerkId)
        .single();
      
      // Update subscription: pip_enabled = true
      await supabase
        .from('plus_1_subscriptions')
        .update({
          status: 'active',
          amount_paid_usd: paymentIntent.amount / 100
        })
        .eq('id', subscriptionId);
      
      // Enable PiP mode in collaboration session
      await supabase
        .from('collab_sessions')
        .update({ pip_enabled: true })
        .eq('id', subscriptionId); // Assuming subscription links to session
      
      // Credit DIFU to host for collaborating
      const difuAmount = collaboratorCount * 5; // 5 DIFU per collaborator
      await supabase.rpc('credit_difu', {
        p_user_id: profile.id,
        p_amount: difuAmount,
        p_transaction_type: 'earn_collaboration',
        p_description: `Earned ${difuAmount} DIFU for Plus 1 team collaboration`,
        p_collaboration_id: null
      });
      
      // Log payment in ledger
      await supabase
        .from('difu_ledger')
        .insert({
          user_id: profile.id,
          clerk_id: clerkId,
          transaction_type: 'spend_plus1',
          amount: -(paymentIntent.amount / 100),
          balance_after: 0, // Updated by trigger
          description: `Plus 1 payment: ${collaboratorCount} collaborators × ${days} days`,
          status: 'completed'
        });
    }
    
    return json({ received: true });
  } catch (error) {
    return json({ error: error.message }, { status: 500 });
  }
});

/**
 * GET /api/plus1/subscription
 * Get user's current Plus 1 subscription
 * Query: ?clerkId=...
 */
router.get('/api/plus1/subscription', async (req, env) => {
  try {
    const { searchParams } = new URL(req.url);
    const clerkId = searchParams.get('clerkId');
    
    if (!clerkId) {
      return json({ error: 'Missing clerkId' }, { status: 400 });
    }
    
    const supabase = getSupabaseClient(env);
    
    const { data: profile } = await supabase
      .from('clerk_user_profiles')
      .select('id')
      .eq('clerk_id', clerkId)
      .single();
    
    const { data: subscription, error } = await supabase
      .from('plus_1_subscriptions')
      .select('*')
      .eq('user_id', profile.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    return json({
      subscription: subscription || null,
      message: subscription ? 'Active subscription found' : 'No active subscription'
    });
  } catch (error) {
    return json({ error: error.message }, { status: 500 });
  }
});

/**
 * GET /api/plus1/collaborators
 * Get list of collaborators in a subscription
 * Query: ?subscriptionId=...
 */
router.get('/api/plus1/collaborators', async (req, env) => {
  try {
    const { searchParams } = new URL(req.url);
    const subscriptionId = searchParams.get('subscriptionId');
    
    if (!subscriptionId) {
      return json({ error: 'Missing subscriptionId' }, { status: 400 });
    }
    
    const supabase = getSupabaseClient(env);
    
    const { data: collaborators, error } = await supabase
      .from('plus_1_collaborators')
      .select('*')
      .eq('subscription_id', subscriptionId)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return json({ collaborators, count: collaborators.length });
  } catch (error) {
    return json({ error: error.message }, { status: 500 });
  }
});

/**
 * GET /api/plus1/difu/balance
 * Get user's DIFU account balance
 * Query: ?clerkId=...
 */
router.get('/api/plus1/difu/balance', async (req, env) => {
  try {
    const { searchParams } = new URL(req.url);
    const clerkId = searchParams.get('clerkId');
    
    if (!clerkId) {
      return json({ error: 'Missing clerkId' }, { status: 400 });
    }
    
    const supabase = getSupabaseClient(env);
    
    const { data: account, error } = await supabase
      .from('difu_accounts')
      .select('*')
      .eq('clerk_id', clerkId)
      .single();
    
    if (error) {
      throw error;
    }
    
    return json({
      balance: account.balance,
      totalEarned: account.total_earned,
      totalSpent: account.total_spent,
      tier: account.tier,
      currency: account.preferred_currency
    });
  } catch (error) {
    return json({ error: error.message }, { status: 500 });
  }
});

/**
 * POST /api/plus1/difu/transfer
 * Transfer DIFU between users
 * 
 * Body:
 * {
 *   fromClerkId: string,
 *   toClerkId: string,
 *   amount: number
 * }
 */
router.post('/api/plus1/difu/transfer', async (req, env) => {
  try {
    const { fromClerkId, toClerkId, amount } = await req.json();
    
    if (!fromClerkId || !toClerkId || !amount || amount <= 0) {
      return json({ error: 'Invalid transfer parameters' }, { status: 400 });
    }
    
    const supabase = getSupabaseClient(env);
    
    // Get sender profile
    const { data: fromProfile } = await supabase
      .from('clerk_user_profiles')
      .select('id')
      .eq('clerk_id', fromClerkId)
      .single();
    
    // Get recipient profile
    const { data: toProfile } = await supabase
      .from('clerk_user_profiles')
      .select('id')
      .eq('clerk_id', toClerkId)
      .single();
    
    // Debit sender
    await supabase.rpc('debit_difu', {
      p_user_id: fromProfile.id,
      p_amount: amount,
      p_transaction_type: 'transfer_out',
      p_description: `Transferred ${amount} DIFU to ${toClerkId}`,
      p_collaboration_id: null
    });
    
    // Credit recipient
    await supabase.rpc('credit_difu', {
      p_user_id: toProfile.id,
      p_amount: amount,
      p_transaction_type: 'transfer_in',
      p_description: `Received ${amount} DIFU from ${fromClerkId}`,
      p_collaboration_id: null
    });
    
    return json({
      success: true,
      message: `Transferred ${amount} DIFU from ${fromClerkId} to ${toClerkId}`
    });
  } catch (error) {
    return json({ error: error.message }, { status: 500 });
  }
});

export default router;
