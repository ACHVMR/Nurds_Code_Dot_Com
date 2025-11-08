import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { chatHandler } from '../src/server/chat.js';
// Removed legacy voiceAPI handlers to avoid duplicate routes; using unified VOICE ENDPOINTS below

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

  // Route: Vibe Coding chat assistant
  // If AGENT_CORE_URL is configured, proxy to ACHEEVY orchestrator.
  // Otherwise, fall back to local chatHandler.
  if (path === '/api/chat' && request.method === 'POST') {
    try {
      const session = await getClerkSession(request, env);
      const agentCoreUrl = (env.AGENT_CORE_URL || '').trim();
      if (agentCoreUrl) {
        const body = await request.json();
        const payload = {
          message: body?.message,
          history: body?.history || [],
          plan: body?.plan || null,
          context: body?.context || null,
          user: session?.claims?.sub || null,
          claims: session?.claims || null,
          session: {
            ip: request.headers.get('CF-Connecting-IP') || null,
            userAgent: request.headers.get('User-Agent') || null,
          },
        };

        const authHeader = (env.AGENT_CORE_AUTH || '').trim();
        const res = await fetch(`${agentCoreUrl.replace(/\/$/, '')}/agent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(authHeader ? { Authorization: authHeader } : {}),
          },
          body: JSON.stringify(payload),
        });

        const text = await res.text();
        return new Response(text, {
          status: res.status,
          headers: { ...corsHeaders, 'Content-Type': res.headers.get('Content-Type') || 'application/json' },
        });
      }

      // Fallback to local handler
      if (session?.claims?.sub) {
        return chatHandler(request, env, { userId: session.claims.sub });
      }
      return chatHandler(request, env);
    } catch (err) {
      console.error('Chat route error:', err);
      return new Response(JSON.stringify({ error: err.message || 'Chat failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
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

  // Legacy voice routes removed; see VOICE ENDPOINTS section for current implementation

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

  // ============================================
  // Agent Management API
  // ============================================

  // Route: Create new agent with Boomer_Angs naming ceremony
  if (path === '/api/agents/create' && request.method === 'POST') {
    try {
      const authHeader = request.headers.get('Authorization');
      const token = authHeader?.replace('Bearer ', '');
      
      if (!token) {
        return new Response(
          JSON.stringify({ error: 'Authentication required' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const clerkPayload = await verifyClerkJWT(token, env);
      const userId = clerkPayload.sub;

      const body = await request.json();
      const { agentName, prefix, type, framework, description, metadata } = body;

      if (!agentName || !prefix) {
        return new Response(
          JSON.stringify({ error: 'Agent name and prefix are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Generate naming ceremony certificate
      const certificate = `
╔════════════════════════════════════════════════════════════╗
║           ACHEEVY AGENT NAMING CEREMONY CERTIFICATE        ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  Agent Name: ${agentName.padEnd(48)} ║
║  Prefix:     ${prefix.padEnd(48)} ║
║  Owner:      ${userId.substring(0, 16).padEnd(48)} ║
║  Type:       ${(type || 'custom').padEnd(48)} ║
║  Framework:  ${(framework || 'boomer_angs').padEnd(48)} ║
║  Ceremony:   ACHEEVY Agent Naming Convention v1.0          ║
║  Created:    ${new Date().toISOString().padEnd(48)} ║
║                                                            ║
║  Pattern:    [UserPrefix]_Ang                              ║
║  Status:     ✓ Naming Ceremony Complete                    ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝

This agent has been officially recognized under the ACHEEVY Platform
Agent naming convention and is ready for deployment.
      `.trim();

      // In production, this would store agent in database
      // For now, return success with certificate
      const agentData = {
        id: crypto.randomUUID(),
        agentName,
        prefix,
        type: type || 'custom',
        framework: framework || 'boomer_angs',
        description: description || '',
        userId,
        metadata: metadata || {},
        createdAt: new Date().toISOString(),
        status: 'active',
        certificate
      };

      return new Response(
        JSON.stringify(agentData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Error creating agent:', error);
      return new Response(
        JSON.stringify({ error: error.message || 'Failed to create agent' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  // Route: List user's agents
  if (path === '/api/agents' && request.method === 'GET') {
    try {
      const authHeader = request.headers.get('Authorization');
      const token = authHeader?.replace('Bearer ', '');
      
      if (!token) {
        return new Response(
          JSON.stringify({ error: 'Authentication required' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const clerkPayload = await verifyClerkJWT(token, env);
      const userId = clerkPayload.sub;

      // Query Supabase for user's agents
      const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
      const { data: agents, error } = await supabase
        .from('agents')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return new Response(
        JSON.stringify({ agents: agents || [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Error fetching agents:', error);
      return new Response(
        JSON.stringify({ error: error.message || 'Failed to fetch agents' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  // Route: Provision new user (called after Clerk signup)
  if (path === '/api/provision' && request.method === 'POST') {
    try {
      const { id, email, tier } = await request.json();

      if (!id || !email) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: id, email' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

      // Create tenant
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .insert({
          name: `tenant_${id}`,
          slug: email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '_'),
          metadata: { created_by: 'auto_provision', clerk_user_id: id }
        })
        .select()
        .single();

      if (tenantError) throw tenantError;

      // Create user
      const { data: user, error: userError } = await supabase
        .from('users')
        .insert({
          id,
          tenant_id: tenant.id,
          email,
          tier: tier || 'free',
          credits_remaining: tier === 'coffee' ? 25000 : tier === 'lite' ? 200000 : 0,
          metadata: { provisioned_at: new Date().toISOString() }
        })
        .select()
        .single();

      if (userError) throw userError;

      // Create welcome plug
      const { data: plug, error: plugError } = await supabase
        .from('plugs')
        .insert({
          tenant_id: tenant.id,
          owner: id,
          name: 'Welcome Plug',
          description: 'Your first Nurds Code plug - start building!',
          tier: tier || 'free',
          agent_name: 'Welcome_Ang',
          framework: 'boomer_angs',
          config: { auto_generated: true, template: 'welcome' }
        })
        .select()
        .single();

      if (plugError) throw plugError;

      // Create tenant schema
      await supabase.rpc('create_user_schema', { uid: id });

      return new Response(
        JSON.stringify({ tenant, user, plug }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Provision error:', error);
      return new Response(
        JSON.stringify({ error: error.message || 'Failed to provision user' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  // Route: Get circuit breaker status
  if (path === '/api/admin/circuit-box' && request.method === 'GET') {
    try {
      // Verify superadmin
      const authHeader = request.headers.get('Authorization');
      const token = authHeader?.replace('Bearer ', '');
      if (!token) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const clerkPayload = await verifyClerkJWT(token, env);
      const userId = clerkPayload.sub;
      const userEmail = clerkPayload.email;
      const isSuperadmin = isSuperadminFromClaims(clerkPayload, env);

      if (!isSuperadmin) {
        return new Response(JSON.stringify({ error: 'Forbidden: superadmin only' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Get circuit breaker status from Supabase
      const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
      const { data: breakers, error } = await supabase
        .from('circuit_breakers')
        .select('*')
        .order('tier', { ascending: true });

      if (error) throw error;

      return new Response(
        JSON.stringify({ breakers: breakers || [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Circuit box error:', error);
      return new Response(
        JSON.stringify({ error: error.message || 'Failed to fetch circuit status' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  // Route: Toggle circuit breaker
  if (path.startsWith('/api/admin/circuit-box/') && request.method === 'PATCH') {
    try {
      // Verify superadmin
      const authHeader = request.headers.get('Authorization');
      const token = authHeader?.replace('Bearer ', '');
      if (!token) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const clerkPayload = await verifyClerkJWT(token, env);
      const userEmail = clerkPayload.email;
      const isSuperadmin = isSuperadminFromClaims(clerkPayload, env);

      if (!isSuperadmin) {
        return new Response(JSON.stringify({ error: 'Forbidden: superadmin only' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const breakerId = path.split('/').pop();
      const { status } = await request.json();

      if (!['on', 'off'].includes(status)) {
        return new Response(
          JSON.stringify({ error: 'Invalid status. Must be "on" or "off"' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update circuit breaker
      const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
      const { data, error } = await supabase
        .from('circuit_breakers')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', breakerId)
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ breaker: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Toggle circuit error:', error);
      return new Response(
        JSON.stringify({ error: error.message || 'Failed to toggle circuit' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  // Route: ACHEEVY orchestration - Auto-configure circuit breakers based on use case
  if (path === '/api/admin/circuit-box/orchestrate' && request.method === 'POST') {
    try {
      // Verify superadmin
      const session = await requireSuperadmin(request, env);

      const { useCase, tier, services } = await request.json();

      if (!useCase) {
        return new Response(
          JSON.stringify({ error: 'useCase is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // ACHEEVY orchestration logic: Auto-enable required services based on use case
      const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
      
      // Use case to breaker mapping
      const useCaseBreakers = {
        'voice-assistant': ['breaker-1', 'breaker-2', 'breaker-3', 'breaker-5', 'breaker-10'],
        'ai-agent-builder': ['breaker-1', 'breaker-2', 'breaker-3', 'breaker-5', 'breaker-15'],
        'code-editor': ['breaker-1', 'breaker-2', 'breaker-3', 'breaker-35'],
        'full-platform': ['breaker-1', 'breaker-2', 'breaker-3', 'breaker-5', 'breaker-10', 'breaker-15', 'breaker-20', 'breaker-30', 'breaker-35'],
        'security-scan': ['breaker-1', 'breaker-2', 'breaker-3', 'breaker-30', 'breaker-32'],
        'billing-only': ['breaker-1', 'breaker-2', 'breaker-3', 'breaker-20']
      };

      const breakersToEnable = services || useCaseBreakers[useCase] || [];

      if (breakersToEnable.length === 0) {
        return new Response(
          JSON.stringify({ error: 'No breakers configured for this use case', useCase }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Enable required breakers
      const { data: enabled, error: enableError } = await supabase
        .from('circuit_breakers')
        .update({ status: 'on', updated_at: new Date().toISOString() })
        .in('id', breakersToEnable)
        .select();

      if (enableError) throw enableError;

      // Optionally disable breakers not in the list (if tier-limited)
      let disabled = [];
      if (tier && tier !== 'superior') {
        const { data: allBreakers } = await supabase
          .from('circuit_breakers')
          .select('id')
          .not('id', 'in', `(${breakersToEnable.join(',')})`);
        
        const breakersToDisable = (allBreakers || []).map(b => b.id);
        
        if (breakersToDisable.length > 0) {
          const { data: disabledData } = await supabase
            .from('circuit_breakers')
            .update({ status: 'off', updated_at: new Date().toISOString() })
            .in('id', breakersToDisable)
            .select();
          
          disabled = disabledData || [];
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          useCase,
          tier,
          enabled: enabled || [],
          disabled,
          message: `Circuit Box configured for ${useCase}`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Orchestration error:', error);
      return new Response(
        JSON.stringify({ error: error.message || 'Orchestration failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  // OCR endpoint - Extract text from images using Cloudflare AI
  if (path === '/api/ai/ocr' && request.method === 'POST') {
    try {
      const { image, mode, language, enhanceQuality } = await request.json();

      if (!image) {
        return new Response(
          JSON.stringify({ error: 'Image data required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Use Cloudflare AI Workers AI for OCR
      // Model: @cf/meta/llama-3.2-11b-vision-instruct (supports image analysis)
      const prompt = mode === 'code'
        ? 'Extract all code from this image. Preserve exact formatting, indentation, and syntax. Output ONLY the code, no explanations.'
        : mode === 'handwriting'
        ? 'Extract all handwritten text from this image. Convert to typed text.'
        : 'Extract all text from this image exactly as shown.';

      const inputs = {
        image: image.startsWith('data:') ? image : `data:image/png;base64,${image}`,
        prompt,
        max_tokens: 2048
      };

      const aiResponse = await env.AI.run(
        '@cf/meta/llama-3.2-11b-vision-instruct',
        inputs
      );

      // Extract text from response
      const extractedText = aiResponse.response || aiResponse.description || '';

      // Detect language for code mode
      let detectedLanguage = language;
      if (mode === 'code' && language === 'auto') {
        detectedLanguage = detectLanguageFromCode(extractedText);
      }

      return new Response(
        JSON.stringify({
          text: extractedText,
          confidence: 0.85,
          detectedLanguage,
          metadata: {
            mode,
            enhanceQuality,
            model: '@cf/meta/llama-3.2-11b-vision-instruct'
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('OCR error:', error);
      return new Response(
        JSON.stringify({ error: error.message || 'OCR extraction failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  // AI Code Generation - Generate code from natural language
  if (path === '/api/ai/generate-code' && request.method === 'POST') {
    try {
      const { prompt, language, context } = await request.json();

      if (!prompt) {
        return new Response(
          JSON.stringify({ error: 'Prompt required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const systemPrompt = `You are ACHEEVY, an expert ${language || 'programming'} code generator. Generate clean, production-ready code based on the user's request. Include comments and follow best practices. Output ONLY the code, no explanations.`;

      const userPrompt = context 
        ? `Generate ${language} code for: ${prompt}\n\nExisting context:\n${context}`
        : `Generate ${language} code for: ${prompt}`;

      const aiResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 2048,
        temperature: 0.3
      });

      return new Response(
        JSON.stringify({ 
          code: aiResponse.response || aiResponse.result?.response || '',
          model: '@cf/meta/llama-3.1-8b-instruct'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Code generation failed: ' + error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  // AI Code Explanation - Explain code in natural language
  if (path === '/api/ai/explain-code' && request.method === 'POST') {
    try {
      const { code, language } = await request.json();

      if (!code) {
        return new Response(
          JSON.stringify({ error: 'Code required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const prompt = `Explain this ${language || 'code'} in simple terms. Break down what it does, how it works, and any important concepts:\n\n${code}`;

      const aiResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [
          { role: 'system', content: 'You are ACHEEVY, a helpful coding assistant. Explain code clearly and concisely.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1024
      });

      return new Response(
        JSON.stringify({ 
          explanation: aiResponse.response || aiResponse.result?.response || '',
          model: '@cf/meta/llama-3.1-8b-instruct'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Explanation failed: ' + error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  // AI Code Optimization - Optimize and refactor code
  if (path === '/api/ai/optimize-code' && request.method === 'POST') {
    try {
      const { code, language } = await request.json();

      if (!code) {
        return new Response(
          JSON.stringify({ error: 'Code required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const prompt = `Optimize and refactor this ${language || 'code'}. Improve performance, readability, and follow best practices. Output ONLY the optimized code:\n\n${code}`;

      const aiResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [
          { role: 'system', content: 'You are ACHEEVY, an expert code optimizer. Output only clean, optimized code without explanations.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 2048,
        temperature: 0.2
      });

      return new Response(
        JSON.stringify({ 
          optimized: aiResponse.response || aiResponse.result?.response || code,
          model: '@cf/meta/llama-3.1-8b-instruct'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Optimization failed: ' + error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  // =====================================================
  // VERIFICATION ENDPOINTS (Shufti Pro Integration)
  // =====================================================

  // Initiate verification
  if (path === '/api/verify/initiate' && request.method === 'POST') {
    try {
      const { user_id, verification_type, country, email } = await request.json();
      
      if (!user_id || !verification_type) {
        return new Response(
          JSON.stringify({ error: 'user_id and verification_type are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create verification payload for Shufti Pro
      const verificationPayload = {
        reference: user_id,
        country: country || 'US',
        language: 'en',
        email: email || '',
        callback_url: `${url.origin}/api/verify/callback`,
        redirect_url: `${url.origin}/verification-complete`,
        verification_mode: 'image_only',
        show_consent: 1,
        show_results: 1,
        face: { proof: 'video' },
        document: {
          supported_types: ['passport', 'id_card', 'driving_license'],
          name: true,
          dob: true,
          expiry_date: true
        }
      };

      // Add business verification if needed
      if (verification_type === 'business') {
        verificationPayload.document.additional_proof = 'business_registration';
      }

      // Call Shufti Pro API
      const shuftiClientId = env.SHUFTI_PRO_CLIENT_ID || 'ddf359e60538d3329cf817ef47008cdb65c877d659bce5a50ae0c0b33fdb10f6';
      const shuftiSecretKey = env.SHUFTI_PRO_SECRET_KEY || 'PgJzfgF56J9ERzCX3ffkrtLvFsE7qr1j';
      const authToken = btoa(`${shuftiClientId}:${shuftiSecretKey}`);

      const shuftiResponse = await fetch('https://api.shuftipro.com/verification', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(verificationPayload)
      });

      const shuftiData = await shuftiResponse.json();

      // Store verification initiation in Supabase
      await supabase.from('verifications').insert({
        user_id,
        verification_type,
        verification_id: shuftiData.reference || user_id,
        status: 'pending',
        verification_data: shuftiData
      });

      return new Response(
        JSON.stringify({
          reference: shuftiData.reference || user_id,
          verification_url: shuftiData.verification_url,
          status: 'pending'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Verification initiation failed: ' + error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  // Shufti Pro webhook callback
  if (path === '/api/verify/callback' && request.method === 'POST') {
    try {
      const callbackData = await request.json();
      
      const userId = callbackData.reference;
      const status = callbackData.event === 'verification.accepted' ? 'verified' : 
                     callbackData.event === 'verification.declined' ? 'declined' : 'pending';

      // Update verification in Supabase
      await supabase.from('verifications').update({
        status,
        verified: status === 'verified',
        document_data: callbackData.document || {},
        face_match_score: callbackData.face?.confidence || null,
        verification_data: callbackData,
        callback_received_at: new Date().toISOString()
      }).eq('user_id', userId);

      // Calculate and update trust score
      if (status === 'verified') {
        const riskScoreResult = await supabase
          .from('risk_scores')
          .select('risk_score')
          .eq('user_id', userId)
          .order('timestamp', { ascending: false })
          .limit(1);

        const latestRiskScore = riskScoreResult.data?.[0]?.risk_score || 50;
        const baseScore = 60;
        const riskAdjustment = Math.max(0, 40 - latestRiskScore / 2);
        const trustScore = baseScore + riskAdjustment;
        const tier = trustScore >= 80 ? 'verified_trusted' : 
                     trustScore >= 50 ? 'standard_verified' : 'unverified';

        await supabase.from('trust_profiles').upsert({
          user_id: userId,
          trust_score: Math.round(trustScore),
          tier,
          seller_enabled: true,
          marketplace_enabled: true,
          collaboration_enabled: true,
          last_updated: new Date().toISOString()
        });
      }

      // Log audit
      await supabase.from('verification_audit_log').insert({
        user_id: userId,
        action: status,
        verification_id: callbackData.reference,
        metadata: callbackData
      });

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Callback processing failed: ' + error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  // Get verification status
  if (path.startsWith('/api/verify/status/') && request.method === 'GET') {
    try {
      const userId = path.split('/').pop();

      const [verificationResult, trustProfileResult] = await Promise.all([
        supabase.from('verifications').select('*').eq('user_id', userId).single(),
        supabase.from('trust_profiles').select('*').eq('user_id', userId).single()
      ]);

      return new Response(
        JSON.stringify({
          verification: verificationResult.data,
          trust_profile: trustProfileResult.data
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ verification: null, trust_profile: null }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  // =====================================================
  // COLLABORATION ENDPOINTS
  // =====================================================

  // Create collaboration project
  if (path === '/api/collaboration/projects' && request.method === 'POST') {
    try {
      const { name, description, owner_user_id } = await request.json();
      
      if (!name || !owner_user_id) {
        return new Response(
          JSON.stringify({ error: 'name and owner_user_id are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const projectResult = await supabase.from('collaboration_projects').insert({
        name,
        description,
        owner_user_id
      }).select().single();

      // Add owner as admin member
      await supabase.from('collaboration_members').insert({
        project_id: projectResult.data.id,
        user_id: owner_user_id,
        role: 'owner',
        status: 'active',
        joined_at: new Date().toISOString()
      });

      return new Response(
        JSON.stringify(projectResult.data),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Project creation failed: ' + error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  // Get project details
  if (path.match(/^\/api\/collaboration\/projects\/[^/]+$/) && request.method === 'GET') {
    try {
      const projectId = path.split('/').pop();
      const result = await supabase.from('collaboration_projects').select('*').eq('id', projectId).single();

      return new Response(
        JSON.stringify(result.data),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Project not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  // Get project members
  if (path.match(/^\/api\/collaboration\/projects\/[^/]+\/members$/) && request.method === 'GET') {
    try {
      const projectId = path.split('/')[4];
      const result = await supabase.from('project_members_with_trust').select('*').eq('project_id', projectId);

      return new Response(
        JSON.stringify(result.data || []),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch members' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  // Get project files
  if (path.match(/^\/api\/collaboration\/projects\/[^/]+\/files$/) && request.method === 'GET') {
    try {
      const projectId = path.split('/')[4];
      const result = await supabase.from('collaboration_files').select('*').eq('project_id', projectId);

      return new Response(
        JSON.stringify(result.data || []),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch files' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  // Update file content
  if (path.match(/^\/api\/collaboration\/files\/[^/]+$/) && request.method === 'PUT') {
    try {
      const fileId = path.split('/').pop();
      const { content, updated_by } = await request.json();

      await supabase.from('collaboration_files').update({
        content,
        updated_by,
        updated_at: new Date().toISOString()
      }).eq('id', fileId);

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'File update failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  // Send collaboration invitation
  if (path === '/api/collaboration/invite' && request.method === 'POST') {
    try {
      const { project_id, inviter_user_id, invitee_email, role, billing_type } = await request.json();
      
      if (!project_id || !inviter_user_id || !invitee_email) {
        return new Response(
          JSON.stringify({ error: 'project_id, inviter_user_id, and invitee_email are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Generate unique token
      const token = crypto.randomUUID();

      const inviteResult = await supabase.from('collaboration_invitations').insert({
        project_id,
        inviter_user_id,
        invitee_email,
        role: role || 'viewer',
        billing_type: billing_type || 'daily',
        token
      }).select().single();

      // TODO: Send email notification with invitation link

      return new Response(
        JSON.stringify({
          invite_id: inviteResult.data.id,
          invite_link: `${url.origin}/collaboration/join/${token}`,
          status: 'sent'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Invitation failed: ' + error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  // Kie.ai proxy endpoints (avoid CORS issues)
  if (path.startsWith('/api/kieai/')) {
    const kieaiPath = path.replace('/api/kieai/', '');
    const kieaiUrl = `https://api.kie.ai/api/v1/${kieaiPath}`;
    
    const kieaiHeaders = {
      'Authorization': `Bearer ${env.KIE_API_KEY || '6423cd116ad6e1e3f43f3506aaf4b751'}`,
      'Content-Type': request.headers.get('Content-Type') || 'application/json'
    };

    try {
      const kieaiResponse = await fetch(kieaiUrl + url.search, {
        method: request.method,
        headers: kieaiHeaders,
        body: request.method !== 'GET' ? await request.text() : undefined
      });

      const kieaiData = await kieaiResponse.text();
      
      return new Response(kieaiData, {
        status: kieaiResponse.status,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Kie.ai proxy error: ' + error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  // =====================================================
  // MICROSOFT FABRIC + TEAMS + ZOOM INTEGRATION
  // =====================================================

  // Get user tier
  if (path.match(/^\/api\/user\/tier\/[^/]+$/) && request.method === 'GET') {
    try {
      const userId = path.split('/').pop();
      const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
      
      const { data: user, error } = await supabase
        .from('users')
        .select('tier')
        .eq('id', userId)
        .single();

      if (error) {
        // Return free tier as default if user not found
        return new Response(
          JSON.stringify({ tier: 'free' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ tier: user?.tier || 'free' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ tier: 'free' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  // Generate Power BI Embed Token
  if (path === '/api/analytics/embed-token' && request.method === 'POST') {
    try {
      const { userId } = await request.json();
      
      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'userId required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get user tier
      const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
      const { data: user } = await supabase
        .from('users')
        .select('tier')
        .eq('id', userId)
        .single();

      const tier = user?.tier || 'free';

      // Map tier to Fabric workspace
      const workspaceMap = {
        free: env.FABRIC_WORKSPACE_FREE || 'demo-workspace',
        pro: env.FABRIC_WORKSPACE_PRO || 'pro-workspace',
        enterprise: env.FABRIC_WORKSPACE_ENTERPRISE || 'enterprise-workspace'
      };
      const workspaceId = workspaceMap[tier];

      // Get Azure AD token (for production - implement OAuth flow)
      // For now, return mock data for development
      const mockToken = btoa(`mock-powerbi-token-${userId}-${Date.now()}`);
      const mockReportId = env.FABRIC_REPORT_ID || 'sample-report-id';
      
      // Store token in database
      await supabase.from('powerbi_embed_tokens').insert({
        user_id: userId,
        token: mockToken,
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour
      });

      return new Response(
        JSON.stringify({
          token: mockToken,
          embedUrl: `https://app.powerbi.com/reportEmbed?reportId=${mockReportId}&groupId=${workspaceId}`,
          reportId: mockReportId,
          expiration: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          tier
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Power BI token error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to generate embed token: ' + error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  // Generate Zoom SDK Token
  if (path === '/api/zoom/sdk-token' && request.method === 'POST') {
    try {
      const { userId, meetingNumber, role } = await request.json();
      
      if (!userId || !meetingNumber || !role) {
        return new Response(
          JSON.stringify({ error: 'userId, meetingNumber, and role required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get user tier and verification status
      const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
      const [userResult, verificationResult] = await Promise.all([
        supabase.from('users').select('tier').eq('id', userId).single(),
        supabase.from('verifications').select('verified').eq('user_id', userId).single()
      ]);

      const tier = userResult.data?.tier || 'free';
      const verified = verificationResult.data?.verified || false;

      // Check if user can host meetings
      if (role === 'host' && (tier === 'free' || !verified)) {
        return new Response(
          JSON.stringify({ error: 'Pro tier and identity verification required to host meetings' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Generate Zoom SDK JWT (implement actual JWT signing in production)
      const mockToken = btoa(`zoom-sdk-${userId}-${meetingNumber}-${role}-${Date.now()}`);

      // Log meeting
      await supabase.from('meeting_logs').insert({
        user_id: userId,
        meeting_number: meetingNumber,
        platform: 'zoom',
        role,
        started_at: new Date().toISOString()
      });

      return new Response(
        JSON.stringify({
          token: mockToken,
          meetingNumber,
          userName: userId.substring(0, 16),
          role,
          expiration: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Zoom SDK token error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to generate Zoom token: ' + error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  // Create Zoom Meeting
  if (path === '/api/zoom/create-meeting' && request.method === 'POST') {
    try {
      const { userId, topic, duration } = await request.json();
      
      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'userId required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get user tier
      const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
      const { data: user } = await supabase.from('users').select('tier').eq('id', userId).single();
      const tier = user?.tier || 'free';

      if (tier === 'free') {
        return new Response(
          JSON.stringify({ error: 'Pro or Enterprise tier required to create meetings' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Generate mock meeting (implement actual Zoom API call in production)
      const meetingNumber = Math.floor(100000000 + Math.random() * 900000000).toString();
      const mockToken = btoa(`zoom-host-${userId}-${meetingNumber}-${Date.now()}`);

      // Log meeting creation
      await supabase.from('meeting_logs').insert({
        user_id: userId,
        meeting_number: meetingNumber,
        platform: 'zoom',
        role: 'host',
        started_at: new Date().toISOString(),
        duration_minutes: duration || 60
      });

      return new Response(
        JSON.stringify({
          meetingNumber,
          token: mockToken,
          topic: topic || 'NURDSCODE Collaboration Session',
          duration: duration || 60,
          joinUrl: `https://zoom.us/j/${meetingNumber}`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Create Zoom meeting error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to create meeting: ' + error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  // Create Microsoft Teams Meeting
  if (path === '/api/teams/create-meeting' && request.method === 'POST') {
    try {
      const { userId, subject, startDateTime, endDateTime } = await request.json();
      
      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'userId required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get user tier
      const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
      const { data: user } = await supabase.from('users').select('tier').eq('id', userId).single();
      const tier = user?.tier || 'free';

      if (tier !== 'enterprise') {
        return new Response(
          JSON.stringify({ error: 'Enterprise tier required for Microsoft Teams integration' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Generate mock meeting ID (implement actual Graph API call in production)
      const meetingId = crypto.randomUUID();
      const joinUrl = `https://teams.microsoft.com/l/meetup-join/${meetingId}`;

      // Log meeting creation
      await supabase.from('meeting_logs').insert({
        user_id: userId,
        meeting_number: meetingId,
        platform: 'teams',
        role: 'organizer',
        started_at: startDateTime || new Date().toISOString()
      });

      return new Response(
        JSON.stringify({
          meetingId,
          joinUrl,
          subject: subject || 'NURDSCODE Collaboration Session',
          startDateTime: startDateTime || new Date().toISOString(),
          endDateTime: endDateTime || new Date(Date.now() + 60 * 60 * 1000).toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Create Teams meeting error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to create Teams meeting: ' + error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  // Get Meeting History
  if (path.match(/^\/api\/meetings\/history\/[^/]+$/) && request.method === 'GET') {
    try {
      const userId = path.split('/').pop();
      const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
      
      const { data: meetings, error } = await supabase
        .from('meeting_logs')
        .select('*')
        .eq('user_id', userId)
        .order('started_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      return new Response(
        JSON.stringify({ meetings: meetings || [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Meeting history error:', error);
      return new Response(
        JSON.stringify({ meetings: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  // =====================================================
  // VOICE ENDPOINTS
  // =====================================================

  // Voice Transcribe (Groq Whisper v3 with fallbacks)
  if (path === '/api/voice/transcribe' && request.method === 'POST') {
    try {
      const formData = await request.formData();
      const audioFile = formData.get('audio');
      const language = formData.get('language') || 'en';
      const provider = formData.get('provider') || 'groq';
      const duration = parseInt(formData.get('duration') || '0');

      if (!audioFile) {
        return new Response(
          JSON.stringify({ error: 'Audio file is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Convert to buffer for API call
      const audioBuffer = await audioFile.arrayBuffer();
      const audioBlob = new Blob([audioBuffer], { type: audioFile.type });

      let transcript = '';
      let confidence = 0;
      let cost = 0;
      let usedProvider = provider;

      // Groq Whisper v3 (Primary)
      if (provider === 'groq') {
        try {
          const groqResponse = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${env.GROQ_API_KEY}`
            },
            body: (() => {
              const fd = new FormData();
              fd.append('file', audioBlob, 'audio.webm');
              fd.append('model', 'whisper-large-v3');
              fd.append('language', language);
              fd.append('response_format', 'verbose_json');
              return fd;
            })()
          });

          if (groqResponse.ok) {
            const groqData = await groqResponse.json();
            transcript = groqData.text;
            confidence = groqData.confidence || 0.95;
            
            // Calculate cost: $0.04-$0.111/hour with 10-second minimum
            const billableSeconds = Math.max(duration, 10);
            const hours = billableSeconds / 3600;
            cost = Math.ceil(hours * 4); // $0.04/hour = 4 cents/hour
          } else {
            throw new Error('Groq Whisper failed');
          }
        } catch (groqError) {
          console.error('Groq Whisper error:', groqError);
          // Fallback handled below
        }
      }

      // Fallback to OpenAI Whisper if Groq fails
      if (!transcript && (provider === 'openai' || provider === 'groq')) {
        try {
          const openaiResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${env.OPENAI_API_KEY}`
            },
            body: (() => {
              const fd = new FormData();
              fd.append('file', audioBlob, 'audio.webm');
              fd.append('model', 'whisper-1');
              fd.append('language', language);
              return fd;
            })()
          });

          if (openaiResponse.ok) {
            const openaiData = await openaiResponse.json();
            transcript = openaiData.text;
            confidence = 0.9;
            usedProvider = 'openai';
            
            // OpenAI pricing: $0.006/minute = $0.36/hour = 36 cents/hour
            const billableSeconds = Math.max(duration, 10);
            const hours = billableSeconds / 3600;
            cost = Math.ceil(hours * 36);
          }
        } catch (openaiError) {
          console.error('OpenAI Whisper error:', openaiError);
          throw new Error('All transcription providers failed');
        }
      }

      if (!transcript) {
        return new Response(
          JSON.stringify({ error: 'Transcription failed' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          transcript,
          duration,
          cost, // in cents
          confidence,
          provider: usedProvider
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Voice transcribe error:', error);
      return new Response(
        JSON.stringify({ error: 'Transcription failed: ' + error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  // Voice TTS (Text-to-Speech)
  if (path === '/api/voice/speak' && request.method === 'POST') {
    try {
      const { text, voiceId = 'alloy', personality = 'default' } = await request.json();

      if (!text) {
        return new Response(
          JSON.stringify({ error: 'Text is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // OpenAI TTS (Groq-compatible)
      const ttsResponse = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'tts-1',
          voice: voiceId,
          input: text,
          speed: 1.0
        })
      });

      if (!ttsResponse.ok) {
        throw new Error('TTS generation failed');
      }

      // Get audio buffer
      const audioBuffer = await ttsResponse.arrayBuffer();
      
      // Store in R2 (optional)
      const audioKey = `tts/${Date.now()}-${Math.random().toString(36).substring(7)}.mp3`;
      // await env.ASSETS_BUCKET.put(audioKey, audioBuffer, { httpMetadata: { contentType: 'audio/mpeg' } });

      // Calculate cost: $15/1M chars
      const chars = text.length;
      const cost = Math.ceil((chars / 1000000) * 1500); // cents

      // Estimate duration (rough: ~150 words per minute, ~5 chars per word)
      const words = chars / 5;
      const duration = Math.ceil((words / 150) * 60); // seconds

      // Convert buffer to base64 for direct playback (or return R2 URL)
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
      const audioUrl = `data:audio/mpeg;base64,${base64Audio}`;

      return new Response(
        JSON.stringify({
          audioUrl,
          cost,
          duration
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Voice TTS error:', error);
      return new Response(
        JSON.stringify({ error: 'TTS failed: ' + error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  // Voice NLP Router
  if (path === '/api/voice/route' && request.method === 'POST') {
    try {
      const { transcript } = await request.json();

      if (!transcript) {
        return new Response(
          JSON.stringify({ error: 'Transcript is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Use GPT-4o-mini for intent detection
      const routerResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are a voice command router for ACHEEVY agents. Analyze the user's voice command and extract:
1. intent: one of [create_agent, execute_task, modify_agent, delete_agent, get_info, help, other]
2. confidence: 0.0-1.0 (how confident you are)
3. params: extracted parameters (agent_name, task_description, agent_type, etc.)

Respond ONLY with valid JSON: {"intent": "...", "confidence": 0.9, "params": {...}}`
            },
            {
              role: 'user',
              content: transcript
            }
          ],
          temperature: 0.3,
          max_tokens: 200
        })
      });

      if (!routerResponse.ok) {
        throw new Error('Router failed');
      }

      const routerData = await routerResponse.json();
      const result = JSON.parse(routerData.choices[0].message.content);

      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Voice router error:', error);
      return new Response(
        JSON.stringify({ 
          intent: 'other',
          confidence: 0.0,
          params: {},
          error: error.message
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  // Custom Instructions - Save user profile
  if (path === '/api/custom-instructions' && request.method === 'POST') {
    try {
      const { userId, career_goals, current_projects, interests, company, personality } = await request.json();

      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'User ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
      
      const { data, error } = await supabase
        .from('custom_instructions')
        .upsert({
          user_id: userId,
          career_goals,
          current_projects,
          interests,
          company,
          personality,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Custom instructions error:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  // Daily Insights - RAG-powered recommendations
  if (path === '/api/insights' && request.method === 'GET') {
    try {
      const url = new URL(request.url);
      const userId = url.searchParams.get('userId');

      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'User ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
      
      // Get user's custom instructions for context
      const { data: instructions } = await supabase
        .from('custom_instructions')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Get recent insights (last 7 days)
      const { data: insights, error } = await supabase
        .from('daily_insights')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // If no recent insights, generate new ones using GPT-4o-mini
      if (!insights || insights.length === 0) {
        const context = instructions ? `
          Career Goals: ${instructions.career_goals || 'Not specified'}
          Current Projects: ${instructions.current_projects || 'None'}
          Interests: ${instructions.interests || 'Not specified'}
          Company: ${instructions.company || 'Independent'}
        ` : 'No custom instructions provided';

        const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'Generate 3-5 personalized development insights based on user context. Return as JSON array with: {category, title, description, confidence, reasoning, action}'
              },
              {
                role: 'user',
                content: `User context:\n${context}\n\nGenerate actionable insights.`
              }
            ],
            temperature: 0.7,
            max_tokens: 1000
          })
        });

        const aiData = await aiResponse.json();
        const generatedInsights = JSON.parse(aiData.choices[0].message.content);

        // Store insights
        const { data: stored } = await supabase
          .from('daily_insights')
          .insert(
            generatedInsights.map(insight => ({
              user_id: userId,
              category: insight.category,
              title: insight.title,
              description: insight.description,
              confidence: insight.confidence,
              reasoning: insight.reasoning,
              action: insight.action,
              created_at: new Date().toISOString()
            }))
          )
          .select();

        return new Response(
          JSON.stringify({ insights: stored || generatedInsights }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ insights }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Insights error:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  // Tier credits + usage summary for header token indicator
  if (path === '/api/tier-credits' && request.method === 'GET') {
    try {
      const session = await requireAuth(request, env);
      const userId = session?.claims?.sub;

      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

      const { data: credits, error: creditsError } = await supabase
        .from('tier_credits')
        .select('tier, current_balance_cents, total_spent_cents')
        .eq('user_id', userId)
        .single();

      if (creditsError && creditsError.code !== 'PGRST116') {
        throw creditsError;
      }

      const { data: usage, error: usageError } = await supabase
        .from('usage_ledger')
        .select('total_cost_cents')
        .eq('user_id', userId);

      if (usageError) {
        throw usageError;
      }

      const usageCents = (usage || []).reduce((total, entry) => {
        return total + (entry?.total_cost_cents || 0);
      }, 0);

      return new Response(
        JSON.stringify({
          tier: credits?.tier || 'free',
          balanceCents: credits?.current_balance_cents ?? 0,
          totalSpentCents: credits?.total_spent_cents ?? usageCents,
          usageCents,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Tier credits error:', error);
      return new Response(
        JSON.stringify({ error: error.message || 'Failed to load credits' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  // Collaboration Billing - Get subscription
  if (path === '/api/collaboration/billing' && request.method === 'GET') {
    try {
      const url = new URL(request.url);
      const userId = url.searchParams.get('userId');

      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'User ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
      
      const { data: subscription, error } = await supabase
        .from('collaboration_billing')
        .select('*, collaborators:collaboration_projects(count)')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return new Response(
        JSON.stringify({ subscription: subscription || null }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Billing get error:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  // Collaboration Billing - Create/Update subscription
  if (path === '/api/collaboration/billing' && request.method === 'POST') {
    try {
      const { userId, tier, collaborators } = await request.json();

      if (!userId || !tier) {
        return new Response(
          JSON.stringify({ error: 'User ID and tier are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Calculate discount (0%, 20%, 30%, 40%, 50% for tiers 1-5)
      const discounts = { 1: 0, 2: 20, 3: 30, 4: 40, 5: 50 };
      const discount = discounts[tier] || 0;
      const basePrice = 1; // $1 per collaborator per day
      const dailyRate = basePrice * collaborators * (1 - discount / 100);
      const monthlyRate = dailyRate * 30;

      const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
      
      const { data, error } = await supabase
        .from('collaboration_billing')
        .upsert({
          user_id: userId,
          tier,
          collaborators,
          discount,
          daily_rate: dailyRate,
          monthly_rate: monthlyRate,
          status: 'active',
          billing_cycle_start: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, subscription: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Billing post error:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  // Quote Engine - Cost estimation
  if (path === '/api/quotes/estimate' && request.method === 'POST') {
    try {
      const { agentType, complexity, enableVoice, executionCount, tokenEstimate } = await request.json();

      if (!agentType) {
        return new Response(
          JSON.stringify({ error: 'Agent type is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Base costs per execution
      const baseCosts = {
        code: 0.05,
        data: 0.03,
        workflow: 0.02,
        research: 0.08,
        content: 0.04,
        analytics: 0.06
      };

      const complexityMultipliers = { low: 1, medium: 1.5, high: 2.5 };
      const baseCost = baseCosts[agentType] || 0.05;
      const multiplier = complexityMultipliers[complexity] || 1;
      const voiceCost = enableVoice ? 0.02 : 0;
      const tokenCost = (tokenEstimate || 1000) / 1000 * 0.01;

      const costPerExecution = baseCost * multiplier + voiceCost + tokenCost;
      const totalCost = costPerExecution * (executionCount || 1);

      return new Response(
        JSON.stringify({
          agentType,
          complexity,
          enableVoice,
          executionCount: executionCount || 1,
          tokenEstimate: tokenEstimate || 1000,
          costPerExecution: costPerExecution.toFixed(4),
          totalCost: totalCost.toFixed(2),
          breakdown: {
            base: (baseCost * multiplier).toFixed(4),
            voice: voiceCost.toFixed(4),
            tokens: tokenCost.toFixed(4)
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Quote error:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  // OpenRouter Models - Get available models
  if (path === '/api/models/openrouter' && request.method === 'GET') {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch OpenRouter models');
      }

      const data = await response.json();
      
      return new Response(
        JSON.stringify({ models: data.data || [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('OpenRouter models error:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  // Model Selection - Add model to available list
  if (path === '/api/models/select' && request.method === 'POST') {
    try {
      const { modelId, modelName, provider, contextWindow, costPer1kTokens } = await request.json();

      if (!modelId || !modelName) {
        return new Response(
          JSON.stringify({ error: 'Model ID and name are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
      
      const { data, error } = await supabase
        .from('available_models')
        .insert({
          model_id: modelId,
          model_name: modelName,
          provider: provider || 'openrouter',
          context_window: contextWindow || 8192,
          cost_per_1k_tokens: costPer1kTokens || 0.01,
          is_active: true,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, model: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Model select error:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  // Voice Profiles - Get user's voice profiles
  if (path === '/api/voice/profiles' && request.method === 'GET') {
    try {
      // Prefer Clerk auth; fallback to explicit query param
      let userId = null;
      const session = await getClerkSession(request, env);
      if (session?.claims?.sub) userId = session.claims.sub;
      if (!userId) {
        const url = new URL(request.url);
        userId = url.searchParams.get('userId');
      }

      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

      // voice_profiles is a per-user settings row in migration 0006
      const { data: vp, error } = await supabase
        .from('voice_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      // Adapt response to UI shape (list of custom voices)
      const profiles = [];
      if (vp?.custom_voice_url) {
        profiles.push({
          voice_id: 'custom',
          name: vp.custom_voice_name || 'Custom Voice',
          url: vp.custom_voice_url,
          created_at: vp.custom_voice_uploaded_at || vp.updated_at || vp.created_at
        });
      }

      return new Response(
        JSON.stringify({ profiles }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Voice profiles get error:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  // Voice Profiles - Delete profile (clear custom voice)
  if (path.startsWith('/api/voice/profiles/') && request.method === 'DELETE') {
    try {
      const profileId = path.split('/').pop();
      const session = await getClerkSession(request, env);
      const userId = session?.claims?.sub || null;

      if (!profileId || !userId) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

      if (profileId === 'custom') {
        // Clear custom voice fields on the user's settings row
        const { error } = await supabase
          .from('voice_profiles')
          .update({
            custom_voice_url: null,
            custom_voice_name: null,
            custom_voice_uploaded_at: null,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        // Fallback: attempt delete by id if a row model ever exists
        const { error } = await supabase
          .from('voice_profiles')
          .delete()
          .eq('id', profileId);
        if (error) throw error;
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Voice profile delete error:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  // Voice Profiles - Upload custom voice
  if (path === '/api/voice/upload' && request.method === 'POST') {
    try {
      const session = await getClerkSession(request, env);
      const userId = session?.claims?.sub || null;
      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const contentType = request.headers.get('content-type') || '';
      if (!contentType.includes('multipart/form-data')) {
        return new Response(
          JSON.stringify({ error: 'Expected multipart/form-data' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const formData = await request.formData();
      const file = formData.get('voice');
      const name = (formData.get('name') || 'Custom Voice').toString();
      if (!file || !file.type?.startsWith('audio/')) {
        return new Response(
          JSON.stringify({ error: 'Audio file is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Save to R2 bucket (if bound); otherwise, skip storage and return stub
      const keyExt = file.name?.split('.').pop() || 'mp3';
      const objectKey = `voices/${userId}/${crypto.randomUUID()}.${keyExt}`;

      let publicUrl = null;
      try {
        if (env.ASSETS_BUCKET) {
          const buffer = await file.arrayBuffer();
          await env.ASSETS_BUCKET.put(objectKey, buffer, {
            httpMetadata: { contentType: file.type || 'audio/mpeg' }
          });
          // If using public bucket with custom domain, you can construct the URL; else keep key
          publicUrl = objectKey; // client can request signed URL later if needed
        }
      } catch (r2err) {
        console.warn('R2 upload failed or not configured, continuing without storage:', r2err?.message);
      }

      const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

      // Upsert per-user voice profile settings
      const { data: existing } = await supabase
        .from('voice_profiles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existing?.id) {
        const { error } = await supabase
          .from('voice_profiles')
          .update({
            custom_voice_url: publicUrl,
            custom_voice_name: name,
            custom_voice_uploaded_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('voice_profiles')
          .insert({
            user_id: userId,
            custom_voice_url: publicUrl,
            custom_voice_name: name,
            custom_voice_uploaded_at: new Date().toISOString(),
            selected_voice_id: 'default-natural'
          });
        if (error) throw error;
      }

      return new Response(
        JSON.stringify({ success: true, voiceId: 'custom', url: publicUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Voice upload error:', error);
      return new Response(
        JSON.stringify({ error: error.message || 'Upload failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  // Google Meet Integration - Create meeting
  if (path === '/api/meetings/google-meet' && request.method === 'POST') {
    try {
      const { userId, title, startTime, duration, attendees } = await request.json();

      if (!userId || !title) {
        return new Response(
          JSON.stringify({ error: 'User ID and title are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // This would integrate with Google Calendar API
      // For now, return mock data
      const meetingId = `meet-${Date.now()}`;
      const meetingUrl = `https://meet.google.com/${meetingId}`;

      const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
      
      const { data, error } = await supabase
        .from('meetings')
        .insert({
          user_id: userId,
          platform: 'google_meet',
          meeting_id: meetingId,
          title,
          meeting_url: meetingUrl,
          start_time: startTime || new Date().toISOString(),
          duration: duration || 60,
          attendees: attendees || [],
          status: 'scheduled',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ 
          success: true, 
          meeting: data,
          joinUrl: meetingUrl
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Google Meet error:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  // ============================================
  // APP IDEAS ENGINE ENDPOINTS
  // ============================================

  // Generate weekly ideas (cron job or manual trigger)
  if (path === '/api/admin/generate-ideas' && request.method === 'POST') {
    try {
      // Verify SuperAdmin
      const userId = await verifyAuth(request, env);
      const user = await env.DB.prepare(
        'SELECT role FROM users WHERE id = ?'
      ).bind(userId).first();
      
      if (user?.role !== 'superadmin') {
        return json({ error: 'Unauthorized' }, 403);
      }

      // Generate ideas using Groq or OpenAI
      const ideas = await generateAppIdeas(env);
      
      // Store in database
      for (const idea of ideas) {
        await env.DB.prepare(`
          INSERT INTO app_ideas (
            id, title, description, category, complexity, 
            keywords, generated_at, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          `idea_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          idea.title,
          idea.description,
          idea.category,
          idea.complexity,
          JSON.stringify(idea.keywords),
          Date.now(),
          'available'
        ).run();
      }
      
      return json({ success: true, count: ideas.length });
    } catch (error) {
      return json({ error: error.message }, 500);
    }
  }

  // Get weekly ideas for SuperAdmin
  if (path === '/api/admin/ideas' && request.method === 'GET') {
    try {
      const userId = await verifyAuth(request, env);
      
      // For now, return mock data if no real ideas exist
      const mockIdeas = [
        {
          id: 'idea_1',
          title: 'Slack Clone',
          description: 'Real-time team communication platform with channels, DMs, and file sharing',
          category: 'Communication',
          complexity: 'medium',
          keywords: JSON.stringify(['chat', 'teams', 'collaboration'])
        },
        {
          id: 'idea_2',
          title: 'Stripe Dashboard',
          description: 'Payment analytics dashboard with subscription management and revenue tracking',
          category: 'Fintech',
          complexity: 'hard',
          keywords: JSON.stringify(['payments', 'analytics', 'saas'])
        },
        {
          id: 'idea_3',
          title: 'Notion Workspace',
          description: 'All-in-one workspace for notes, tasks, wikis, and databases',
          category: 'Productivity',
          complexity: 'hard',
          keywords: JSON.stringify(['notes', 'productivity', 'database'])
        },
        {
          id: 'idea_4',
          title: 'Bitdefender Clone',
          description: 'Cybersecurity dashboard with real-time threat detection and system scanning',
          category: 'Security',
          complexity: 'medium',
          keywords: JSON.stringify(['security', 'antivirus', 'protection'])
        },
        {
          id: 'idea_5',
          title: 'Figma Lite',
          description: 'Collaborative design tool for creating UI/UX mockups and prototypes',
          category: 'Design',
          complexity: 'hard',
          keywords: JSON.stringify(['design', 'ui', 'collaboration'])
        }
      ];
      
      return json({ ideas: mockIdeas });
    } catch (error) {
      return json({ error: error.message }, 500);
    }
  }

  // ============================================
  // ACHEEVY INTENT ENDPOINTS
  // ============================================

  // Start ACHEEVY session
  if (path === '/api/acheevy/start-session' && request.method === 'POST') {
    try {
      const userId = await verifyAuth(request, env);
      const { appIdeaId, ideaTitle, ideaDescription, customIntent } = await request.json();
      
      const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const intent = customIntent || `Build a ${ideaTitle}: ${ideaDescription}`;
      
      const session = {
        sessionId,
        userId,
        userIntent: intent,
        conversationHistory: [],
        questions: {
          asked: [],
          responses: {},
          currentQuestion: 0
        },
        status: 'active'
      };
      
      // Store session (in KV or D1)
      await env.KV.put(`session_${sessionId}`, JSON.stringify(session), {
        expirationTtl: 3600 // 1 hour
      });
      
      return json({
        sessionId,
        firstMessage: `Hi! I'm ACHEEVY. I understand you want to build: "${intent}". Let me ask some questions to help me understand your vision better.`,
        firstQuestion: "What's the primary use case or problem this app solves?"
      });
    } catch (error) {
      return json({ error: error.message }, 500);
    }
  }

  // ACHEEVY chat conversation
  if (path === '/api/acheevy/chat' && request.method === 'POST') {
    try {
      const userId = await verifyAuth(request, env);
      const { sessionId, userMessage } = await request.json();
      
      // Get session from KV
      const sessionData = await env.KV.get(`session_${sessionId}`);
      if (!sessionData) {
        return json({ error: 'Session not found' }, 404);
      }
      
      const session = JSON.parse(sessionData);
      
      // Questions sequence
      const questions = [
        "What's the primary use case or problem this app solves?",
        "Who are your target users? (e.g., developers, enterprises, individuals)",
        "What key features are essential for the MVP?",
        "What integrations or APIs does this need? (Stripe, Auth, etc.)",
        "What's the desired design style? (Modern, minimal, playful, enterprise)",
        "Any specific technologies you prefer?",
        "What's your timeline and launch priority?"
      ];
      
      // Store user response
      session.conversationHistory.push({
        role: 'user',
        content: userMessage,
        timestamp: Date.now()
      });
      
      const questionKeys = [
        'primary_use_case',
        'target_users',
        'key_features',
        'integrations',
        'design_style',
        'technologies',
        'timeline'
      ];
      
      session.questions.responses[questionKeys[session.questions.currentQuestion]] = userMessage;
      session.questions.currentQuestion++;
      
      let acheevy_response;
      let prdGenerated = false;
      let prd = null;
      
      if (session.questions.currentQuestion < questions.length) {
        // Ask next question
        acheevy_response = questions[session.questions.currentQuestion];
      } else {
        // Generate PRD
        acheevy_response = "Perfect! I have all the information I need. Let me generate your PRD...";
        prd = await generatePRD(session, env);
        prdGenerated = true;
      }
      
      session.conversationHistory.push({
        role: 'acheevy',
        content: acheevy_response,
        timestamp: Date.now()
      });
      
      // Update session
      await env.KV.put(`session_${sessionId}`, JSON.stringify(session), {
        expirationTtl: 3600
      });
      
      return json({
        sessionId,
        acheevy_response,
        prdGenerated,
        prd
      });
    } catch (error) {
      return json({ error: error.message }, 500);
    }
  }

  // Approve PRD and create project
  if (path === '/api/acheevy/approve-prd' && request.method === 'POST') {
    try {
      const userId = await verifyAuth(request, env);
      const { sessionId } = await request.json();
      
      const projectId = `proj_${Date.now()}`;
      
      // Get session
      const sessionData = await env.KV.get(`session_${sessionId}`);
      const session = JSON.parse(sessionData);
      
      // Create project (store in database)
      // For now, just return success
      
      return json({
        success: true,
        projectId,
        redirectTo: `/editor/${projectId}`
      });
    } catch (error) {
      return json({ error: error.message }, 500);
    }
  }

  // ============================================
  // LIVE BUILD ENDPOINTS
  // ============================================

  // Live build SSE endpoint
  if (path.startsWith('/api/build-live/') && request.method === 'GET') {
    const projectId = path.split('/').pop();
    
    // Use Server-Sent Events for real-time updates
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();
    
    // Simulate build process
    const buildProcess = async () => {
      const agents = [
        'ResearchAng', 'DataAng', 'CodeAng', 'SecurityAng',
        'IntegrationAng', 'UIAng', 'TestAng', 'OptimizeAng',
        'DocAng', 'AccessibilityAng', 'I18nAng', 'CacheAng',
        'MonitorAng', 'BackupAng', 'CDNAng', 'CIAng', 'DeployAng'
      ];
      
      for (let i = 0; i < agents.length; i++) {
        const agent = agents[i];
        
        // Send progress update
        await writer.write(encoder.encode(
          `data: ${JSON.stringify({
            agent,
            status: 'in_progress',
            log: `${agent} is working...`,
            progress: Math.round((i / agents.length) * 100)
          })}\n\n`
        ));
        
        // Simulate work
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Send completion
        await writer.write(encoder.encode(
          `data: ${JSON.stringify({
            agent,
            status: 'completed',
            log: `${agent} completed successfully`,
            progress: Math.round(((i + 1) / agents.length) * 100)
          })}\n\n`
        ));
      }
      
      // Send deployment complete
      await writer.write(encoder.encode(
        `data: ${JSON.stringify({
          status: 'deployed',
          url: `https://${projectId}.nurdscode.app`,
          message: 'App deployed successfully!'
        })}\n\n`
      ));
      
      await writer.close();
    };
    
    // Start build process
    buildProcess();
    
    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  // Helper function to generate PRD
  async function generatePRD(session, env) {
    const responses = session.questions.responses;
    
    // For now, return a mock PRD
    return {
      title: session.userIntent.split(':')[0].replace('Build a ', ''),
      overview: `A comprehensive solution for ${responses.primary_use_case}`,
      goals: [
        'Deliver MVP within timeline',
        'Ensure scalability',
        'Maintain high performance'
      ],
      targetUsers: responses.target_users,
      coreFeatures: [
        { name: 'User Authentication', priority: 'P0' },
        { name: 'Core Functionality', priority: 'P0' },
        { name: 'Admin Dashboard', priority: 'P1' }
      ],
      technicalStack: {
        frontend: ['React', 'Tailwind CSS'],
        backend: ['Cloudflare Workers'],
        database: ['D1'],
        integrations: responses.integrations?.split(',') || []
      },
      designStyle: responses.design_style,
      timeline: responses.timeline
    };
  }

  // Default 404
  return new Response('Not Found', {
    status: 404,
    headers: corsHeaders,
  });
}

// Helper: Detect programming language
function detectLanguageFromCode(code) {
  if (/function\s+\w+|const\s+\w+\s*=|import\s+.*from/.test(code)) return 'javascript';
  if (/def\s+\w+|import\s+\w+|if\s+__name__/.test(code)) return 'python';
  if (/public\s+class|System\.out/.test(code)) return 'java';
  if (/#include|std::|cout/.test(code)) return 'cpp';
  if (/fn\s+main|let\s+mut|impl/.test(code)) return 'rust';
  if (/package\s+main|func\s+main/.test(code)) return 'go';
  if (/<html|<div|<body/.test(code)) return 'html';
  if (/SELECT.*FROM|INSERT\s+INTO/i.test(code)) return 'sql';
  return 'plaintext';
}

export default {
  async fetch(request, env, ctx) {
    return handleRequest(request, env);
  },
};
