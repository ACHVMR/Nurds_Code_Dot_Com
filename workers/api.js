import Stripe from 'stripe';

// JWT utility functions
function generateToken(userId, secret) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    userId: userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7), // 7 days
  };

  const base64Header = btoa(JSON.stringify(header));
  const base64Payload = btoa(JSON.stringify(payload));
  const signature = btoa(secret + base64Header + base64Payload);

  return `${base64Header}.${base64Payload}.${signature}`;
}

function verifyToken(token, secret) {
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

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

async function handleRequest(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Initialize Stripe
  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
  });

  // Route: Create checkout session
  if (path === '/api/create-checkout-session' && request.method === 'POST') {
    try {
      const body = await request.json();
      const { priceId, email } = body;

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
        success_url: `${url.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${url.origin}/subscribe`,
        metadata: {
          priceId: priceId,
        },
      });

      return new Response(
        JSON.stringify({ url: session.url }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } catch (error) {
      console.error('Error creating checkout session:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  }

  // Route: Stripe webhook
  if (path === '/api/webhook' && request.method === 'POST') {
    try {
      const body = await request.text();
      const sig = request.headers.get('stripe-signature');

      let event;
      try {
        event = stripe.webhooks.constructEvent(
          body,
          sig,
          env.STRIPE_WEBHOOK_SECRET
        );
      } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return new Response(
          JSON.stringify({ error: 'Webhook signature verification failed' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Handle the event
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          
          // Save subscription to D1 database
          await env.DB.prepare(
            'INSERT INTO subscriptions (customer_id, subscription_id, price_id, status, created_at) VALUES (?, ?, ?, ?, ?)'
          )
            .bind(
              session.customer,
              session.subscription,
              session.metadata.priceId,
              'active',
              new Date().toISOString()
            )
            .run();

          break;
        }
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted': {
          const subscription = event.data.object;
          
          // Update subscription status in D1 database
          await env.DB.prepare(
            'UPDATE subscriptions SET status = ?, updated_at = ? WHERE subscription_id = ?'
          )
            .bind(
              subscription.status,
              new Date().toISOString(),
              subscription.id
            )
            .run();

          break;
        }
      }

      return new Response(
        JSON.stringify({ received: true }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } catch (error) {
      console.error('Webhook error:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  }

  // Route: Get user subscription
  if (path === '/api/subscription' && request.method === 'GET') {
    try {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: 'No authorization header' }),
          {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const token = authHeader.replace('Bearer ', '');
      const user = verifyToken(token, env.JWT_SECRET);

      if (!user) {
        return new Response(
          JSON.stringify({ error: 'Invalid token' }),
          {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const result = await env.DB.prepare(
        'SELECT * FROM subscriptions WHERE customer_id = ? ORDER BY created_at DESC LIMIT 1'
      )
        .bind(user.userId)
        .first();

      return new Response(
        JSON.stringify(result || {}),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } catch (error) {
      console.error('Error fetching subscription:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  }

  // Default 404
  return new Response('Not Found', {
    status: 404,
    headers: corsHeaders,
  });
}

export default {
  async fetch(request, env, ctx) {
    return handleRequest(request, env);
  },
};
