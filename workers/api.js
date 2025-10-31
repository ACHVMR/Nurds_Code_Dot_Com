import Stripe from 'stripe';
import { chatHandler } from '../src/server/chat.js';
import {
  handleTranscribe,
  handleSynthesize,
  handleListVoices,
  handleVoiceConversation
} from '../src/server/voiceAPI.js';

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

// ============================================
// Clerk Auth Helpers (JWT verification via JWKS)
// ============================================
let JWKS_CACHE = { keys: null, fetchedAt: 0 };

function base64urlToUint8Array(base64url) {
  const pad = '='.repeat((4 - (base64url.length % 4)) % 4);
  const base64 = (base64url + pad).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

async function getClerkJWKS(env) {
  const maxAgeMs = 5 * 60 * 1000; // 5 minutes
  const now = Date.now();
  if (JWKS_CACHE.keys && now - JWKS_CACHE.fetchedAt < maxAgeMs) return JWKS_CACHE.keys;
  const url = env.CLERK_JWKS_URL;
  if (!url) throw new Error('CLERK_JWKS_URL not configured');
  const res = await fetch(url, { cf: { cacheTtl: 300, cacheEverything: true } });
  if (!res.ok) throw new Error(`Failed to fetch Clerk JWKS: ${res.status}`);
  const jwks = await res.json();
  JWKS_CACHE = { keys: jwks, fetchedAt: now };
  return jwks;
}

async function verifyClerkJWT(token, env) {
  if (!token) throw new Error('Missing token');
  const [headerB64, payloadB64, signatureB64] = token.split('.');
  if (!headerB64 || !payloadB64 || !signatureB64) throw new Error('Invalid JWT format');

  const header = JSON.parse(new TextDecoder().decode(base64urlToUint8Array(headerB64)));
  const payload = JSON.parse(new TextDecoder().decode(base64urlToUint8Array(payloadB64)));
  const signature = base64urlToUint8Array(signatureB64);

  const jwks = await getClerkJWKS(env);
  const jwk = (jwks.keys || []).find(k => k.kid === header.kid);
  if (!jwk) throw new Error('No matching JWK for token kid');

  const algo = header.alg || 'RS256';
  const verifyAlg = algo === 'RS256' ? { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' } : null;
  if (!verifyAlg) throw new Error(`Unsupported alg: ${algo}`);

  const key = await crypto.subtle.importKey(
    'jwk',
    jwk,
    verifyAlg,
    false,
    ['verify']
  );

  const encoder = new TextEncoder();
  const signingInput = encoder.encode(`${headerB64}.${payloadB64}`);
  const ok = await crypto.subtle.verify(
    verifyAlg,
    key,
    signature,
    signingInput
  );
  if (!ok) throw new Error('Invalid token signature');

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && now > payload.exp) throw new Error('Token expired');
  if (payload.nbf && now < payload.nbf) throw new Error('Token not yet valid');

  return payload;
}

async function getClerkSession(request, env) {
  // Prefer Authorization: Bearer <token>
  const auth = request.headers.get('Authorization') || request.headers.get('authorization');
  let token = null;
  if (auth && auth.startsWith('Bearer ')) token = auth.slice(7).trim();

  // Fallback: __session cookie for same-origin
  if (!token) {
    const cookie = request.headers.get('Cookie') || request.headers.get('cookie') || '';
    const match = cookie.match(/(?:^|;\s*)__session=([^;]+)/);
    if (match) token = decodeURIComponent(match[1]);
  }

  if (!token) return null;
  try {
    const claims = await verifyClerkJWT(token, env);
    return { token, claims };
  } catch (_) {
    return null;
  }
}

function parseEmailAllowlist(env) {
  const raw = env.ADMIN_ALLOWLIST || '';
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

function claimsOrgRoles(claims) {
  // Clerk tokens can include org info in different shapes; try a few
  const roles = new Set();
  if (claims?.org_role) roles.add(String(claims.org_role).toLowerCase());
  if (Array.isArray(claims?.orgs)) {
    for (const o of claims.orgs) {
      if (o?.role) roles.add(String(o.role).toLowerCase());
    }
  }
  return roles;
}

function isSuperadminFromClaims(claims, env) {
  if (!claims) return false;
  const allow = parseEmailAllowlist(env);
  const email = (claims.email || claims.email_address || '').toLowerCase();
  if (email && allow.includes(email)) return true;

  const orgIdCfg = (env.CLERK_ORG_ID_SUPERADMINS || '').trim();
  const roleCfg = (env.CLERK_SUPERADMIN_ROLE || 'owner').toLowerCase();
  const roles = claimsOrgRoles(claims);

  // If org is specified, require both org match and role match when available
  if (orgIdCfg) {
    const orgIds = new Set();
    if (claims.org_id) orgIds.add(String(claims.org_id));
    if (Array.isArray(claims.orgs)) {
      for (const o of claims.orgs) if (o?.id) orgIds.add(String(o.id));
    }
    if (orgIds.has(orgIdCfg) && (roles.has(roleCfg) || roles.size === 0)) {
      // If roles missing in token, allow org match alone
      return true;
    }
  } else {
    // No org constraint provided; role alone suffices if present
    if (roles.has(roleCfg)) return true;
  }

  return false;
}

async function requireAuth(request, env) {
  const session = await getClerkSession(request, env);
  if (!session) throw new Error('Unauthorized');
  return session;
}

async function requireSuperadmin(request, env) {
  const session = await requireAuth(request, env);
  const ok = isSuperadminFromClaims(session.claims, env);
  if (!ok) throw new Error('Forbidden');
  return session;
}

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
        success_url: `${url.origin}/success?plan=${encodeURIComponent(priceId)}&session_id={CHECKOUT_SESSION_ID}`,
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

  // Route: Vibe Coding chat assistant (with Clerk auth if available)
  if (path === '/api/chat' && request.method === 'POST') {
    const session = await getClerkSession(request, env);
    if (session?.claims?.sub) {
      // Pass user override to chatHandler
      return chatHandler(request, env, { userId: session.claims.sub });
    }
    return chatHandler(request, env);
  }

  // Route: Auth check (returns Clerk claims)
  if (path === '/api/auth/me' && request.method === 'GET') {
    const session = await getClerkSession(request, env);
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const isSuperadmin = isSuperadminFromClaims(session.claims, env);
    return new Response(JSON.stringify({ userId: session.claims.sub, isSuperadmin, claims: session.claims }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Admin: health check (superadmin only)
  if (path === '/api/admin/health' && request.method === 'GET') {
    try {
      await requireSuperadmin(request, env);
      return new Response(JSON.stringify({ ok: true, ts: Date.now() }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (err) {
      const status = err.message === 'Unauthorized' ? 401 : 403;
      return new Response(JSON.stringify({ ok: false, error: err.message }), {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  // Voice AI Routes
  if (path === '/api/voice/transcribe' && request.method === 'POST') {
    return handleTranscribe(request, env);
  }

  if (path === '/api/voice/synthesize' && request.method === 'POST') {
    return handleSynthesize(request, env);
  }

  if (path === '/api/voice/voices' && request.method === 'GET') {
    return handleListVoices(request, env);
  }

  if (path === '/api/voice/conversation' && request.method === 'POST') {
    return handleVoiceConversation(request, env);
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
