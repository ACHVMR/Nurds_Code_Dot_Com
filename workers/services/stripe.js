/**
 * Stripe Service for Cloudflare Workers
 * Payment processing and subscription management
 */

import Stripe from 'stripe';

/**
 * Initialize Stripe client
 * @param {object} env - Environment bindings
 * @returns {Stripe} Stripe client instance
 */
export function getStripeClient(env) {
  return new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
  });
}

/**
 * Create a Stripe checkout session
 * @param {object} options - Checkout options
 * @param {object} env - Environment bindings
 * @returns {Promise<object>} Checkout session
 */
export async function createCheckoutSession(options, env) {
  const stripe = getStripeClient(env);
  const {
    priceId,
    userId,
    email,
    successUrl,
    cancelUrl,
    metadata = {},
  } = options;

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    customer_email: email,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      ...metadata,
    },
  });

  return session;
}

/**
 * Create a customer portal session
 * @param {string} customerId - Stripe customer ID
 * @param {string} returnUrl - Return URL after portal
 * @param {object} env - Environment bindings
 * @returns {Promise<object>} Portal session
 */
export async function createPortalSession(customerId, returnUrl, env) {
  const stripe = getStripeClient(env);
  
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}

/**
 * Get customer by email
 * @param {string} email - Customer email
 * @param {object} env - Environment bindings
 * @returns {Promise<object|null>} Customer or null
 */
export async function getCustomerByEmail(email, env) {
  const stripe = getStripeClient(env);
  
  const customers = await stripe.customers.list({
    email,
    limit: 1,
  });

  return customers.data[0] || null;
}

/**
 * Get customer subscriptions
 * @param {string} customerId - Stripe customer ID
 * @param {object} env - Environment bindings
 * @returns {Promise<array>} Active subscriptions
 */
export async function getSubscriptions(customerId, env) {
  const stripe = getStripeClient(env);
  
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: 'active',
  });

  return subscriptions.data;
}

/**
 * Cancel a subscription
 * @param {string} subscriptionId - Subscription ID
 * @param {object} env - Environment bindings
 * @returns {Promise<object>} Cancelled subscription
 */
export async function cancelSubscription(subscriptionId, env) {
  const stripe = getStripeClient(env);
  
  return stripe.subscriptions.cancel(subscriptionId);
}

/**
 * Verify Stripe webhook signature
 * @param {string} payload - Raw request body
 * @param {string} signature - Stripe signature header
 * @param {object} env - Environment bindings
 * @returns {object} Verified event
 */
export function verifyWebhookSignature(payload, signature, env) {
  const stripe = getStripeClient(env);
  
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    env.STRIPE_WEBHOOK_SECRET
  );
}

/**
 * Handle subscription webhook events
 * @param {object} event - Stripe event
 * @param {object} supabase - Supabase client
 * @returns {Promise<void>}
 */
export async function handleSubscriptionEvent(event, supabase) {
  const subscription = event.data.object;
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.warn('[Stripe] No userId in subscription metadata');
    return;
  }

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await supabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          stripe_subscription_id: subscription.id,
          stripe_customer_id: subscription.customer,
          status: subscription.status,
          price_id: subscription.items.data[0]?.price?.id,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });
      break;

    case 'customer.subscription.deleted':
      await supabase
        .from('subscriptions')
        .update({
          status: 'canceled',
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscription.id);
      break;
  }
}

/**
 * Pricing tiers configuration
 */
export const PRICING_TIERS = {
  free: {
    name: 'Free',
    priceId: null,
    features: ['1 Agent', '100 messages/month', 'Basic templates'],
  },
  solo: {
    name: 'Solo',
    priceId: 'price_solo_monthly',
    features: ['5 Agents', '1,000 messages/month', 'All templates', 'Voice support'],
  },
  plusOne: {
    name: 'Plus One',
    priceId: 'price_plusone_monthly',
    features: ['10 Agents', '5,000 messages/month', 'Collaboration (2 users)', 'Priority support'],
  },
  team: {
    name: 'Team',
    priceId: 'price_team_monthly',
    features: ['Unlimited Agents', 'Unlimited messages', 'Full team collaboration', 'Custom integrations'],
  },
};
