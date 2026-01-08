/**
 * Billing Routes for Cloudflare Workers
 * Stripe checkout, subscriptions, webhooks
 */

import { Router } from 'itty-router';
import { jsonResponse, successResponse, noContentResponse } from '../utils/responses.js';
import { badRequest, unauthorized } from '../utils/errors.js';
import { requireAuth } from '../middleware/auth.js';
import {
  createCheckoutSession,
  createPortalSession,
  getCustomerByEmail,
  getSubscriptions,
  cancelSubscription,
  verifyWebhookSignature,
  handleSubscriptionEvent,
  PRICING_TIERS,
} from '../services/stripe.js';
import { getSupabaseClient, getSubscription } from '../services/supabase.js';

const router = Router({ base: '/api/billing' });

/**
 * GET /api/billing/plans - Get pricing plans
 */
router.get('/plans', async (request, env) => {
  return successResponse(PRICING_TIERS);
});

/**
 * GET /api/billing/subscription - Get current subscription
 */
router.get('/subscription', requireAuth(async (request, env, ctx) => {
  const supabase = getSupabaseClient(env);
  const subscription = await getSubscription(ctx.user.userId, supabase);

  return successResponse(subscription || { status: 'free' });
}));

/**
 * POST /api/billing/checkout - Create checkout session
 */
router.post('/checkout', requireAuth(async (request, env, ctx) => {
  const body = await request.json();
  const { priceId, tier } = body;

  // Get price ID from tier if not provided directly
  const finalPriceId = priceId || PRICING_TIERS[tier]?.priceId;

  if (!finalPriceId) {
    return badRequest('Invalid plan or price ID');
  }

  // Get user email
  const supabase = getSupabaseClient(env);
  const { data: user } = await supabase
    .from('users')
    .select('email')
    .eq('id', ctx.user.userId)
    .single();

  if (!user?.email) {
    return badRequest('User email not found');
  }

  const url = new URL(request.url);
  const session = await createCheckoutSession({
    priceId: finalPriceId,
    userId: ctx.user.userId,
    email: user.email,
    successUrl: `${url.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${url.origin}/pricing`,
    metadata: { tier },
  }, env);

  return successResponse({ url: session.url, sessionId: session.id });
}));

/**
 * POST /api/billing/portal - Create customer portal session
 */
router.post('/portal', requireAuth(async (request, env, ctx) => {
  const supabase = getSupabaseClient(env);
  const subscription = await getSubscription(ctx.user.userId, supabase);

  if (!subscription?.stripe_customer_id) {
    return badRequest('No active subscription found');
  }

  const url = new URL(request.url);
  const session = await createPortalSession(
    subscription.stripe_customer_id,
    `${url.origin}/pricing`,
    env
  );

  return successResponse({ url: session.url });
}));

/**
 * POST /api/billing/cancel - Cancel subscription
 */
router.post('/cancel', requireAuth(async (request, env, ctx) => {
  const supabase = getSupabaseClient(env);
  const subscription = await getSubscription(ctx.user.userId, supabase);

  if (!subscription?.stripe_subscription_id) {
    return badRequest('No active subscription found');
  }

  await cancelSubscription(subscription.stripe_subscription_id, env);

  return successResponse({ cancelled: true });
}));

/**
 * POST /api/billing/webhook - Stripe webhook handler
 */
router.post('/webhook', async (request, env) => {
  const signature = request.headers.get('stripe-signature');
  
  if (!signature) {
    return badRequest('Missing signature');
  }

  try {
    const payload = await request.text();
    const event = verifyWebhookSignature(payload, signature, env);

    const supabase = getSupabaseClient(env);
    
    // Handle subscription events
    if (event.type.startsWith('customer.subscription.')) {
      await handleSubscriptionEvent(event, supabase);
    }

    // Handle checkout completion
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      
      if (userId && session.subscription) {
        // Link subscription to user
        await supabase
          .from('subscriptions')
          .upsert({
            user_id: userId,
            stripe_subscription_id: session.subscription,
            stripe_customer_id: session.customer,
            status: 'active',
          }, {
            onConflict: 'user_id',
          });
      }
    }

    return noContentResponse();
  } catch (error) {
    console.error('[Billing] Webhook error:', error);
    return badRequest('Webhook processing failed');
  }
});

/**
 * GET /api/billing/usage - Get usage stats
 */
router.get('/usage', requireAuth(async (request, env, ctx) => {
  const supabase = getSupabaseClient(env);
  
  // Get current month usage
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('usage_logs')
    .select('prompt_tokens, completion_tokens, total_tokens')
    .eq('user_id', ctx.user.userId)
    .gte('created_at', startOfMonth.toISOString());

  if (error) {
    console.error('[Billing] Usage error:', error);
    return successResponse({ tokens: 0, messages: 0 });
  }

  const totalTokens = data.reduce((sum, log) => sum + (log.total_tokens || 0), 0);
  const messages = data.length;

  return successResponse({
    tokens: totalTokens,
    messages,
    period: {
      start: startOfMonth.toISOString(),
      end: new Date().toISOString(),
    },
  });
}));

export { router as billingRouter };
