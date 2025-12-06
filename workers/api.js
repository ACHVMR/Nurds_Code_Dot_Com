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

// LLM Chat Handler - Tier-aware routing
async function chatHandler(request, env) {
  const body = await request.json();
  const { message, plan = 'free', history = [] } = body;
  
  // Model selection based on plan
  const modelConfig = {
    free: { provider: 'groq', model: 'llama-3.1-8b-instant' },
    price_coffee: { provider: 'groq', model: 'llama-3.1-70b-versatile' },
    price_pro: { provider: 'openai', model: 'gpt-4o-mini' },
    price_enterprise: { provider: 'anthropic', model: 'claude-3-sonnet-20240229' },
  };
  
  const config = modelConfig[plan] || modelConfig.free;
  
  // Cloudflare AI Gateway Configuration
  const CLOUDFLARE_ACCOUNT_ID = env.CLOUDFLARE_ACCOUNT_ID || 'your_account_id';
  const GATEWAY_SLUG = env.AI_GATEWAY_SLUG || 'nurdscode-gateway';
  const AI_GATEWAY_URL = `https://gateway.ai.cloudflare.com/v1/${CLOUDFLARE_ACCOUNT_ID}/${GATEWAY_SLUG}`;
  
  // Check if ACHEEVY orchestrator is configured
  if (env.AGENT_CORE_URL) {
    try {
      const proxyResponse = await fetch(`${env.AGENT_CORE_URL}/agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(env.AGENT_CORE_AUTH ? { 'Authorization': `Bearer ${env.AGENT_CORE_AUTH}` } : {})
        },
        body: JSON.stringify({
          message,
          history,
          plan,
          context: { model: config.model, provider: config.provider }
        })
      });
      
      if (proxyResponse.ok) {
        const data = await proxyResponse.json();
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    } catch (error) {
      console.error('ACHEEVY proxy error, falling back to local:', error);
    }
  }
  
  // Fallback to local GROQ handling (via AI Gateway if configured)
  try {
    const baseUrl = env.CLOUDFLARE_ACCOUNT_ID 
      ? `${AI_GATEWAY_URL}/groq/openai/v1/chat/completions`
      : 'https://api.groq.com/openai/v1/chat/completions';

    const groqResponse = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: 'You are a helpful coding assistant for Nurds Code platform. Help users write, debug, and understand code.' },
          ...history.slice(-20),
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 2048
      })
    });
    
    const data = await groqResponse.json();
    return new Response(JSON.stringify({
      message: data.choices?.[0]?.message?.content || 'No response generated',
      model: config.model,
      provider: config.provider
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Voice endpoints
async function voiceTranscribe(request, env) {
  const formData = await request.formData();
  const audioFile = formData.get('audio');
  const provider = formData.get('provider') || 'openai'; // openai, deepgram
  
  if (!audioFile) {
    return new Response(JSON.stringify({ error: 'No audio file provided' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  try {
    if (provider === 'openai') {
      const whisperFormData = new FormData();
      whisperFormData.append('file', audioFile);
      whisperFormData.append('model', 'whisper-1');
      
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.OPENAI_API_KEY}`
        },
        body: whisperFormData
      });
      
      const data = await response.json();
      return new Response(JSON.stringify({ text: data.text, provider: 'openai' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Deepgram fallback
    if (provider === 'deepgram' && env.DEEPGRAM_API_KEY) {
      const audioBuffer = await audioFile.arrayBuffer();
      const response = await fetch('https://api.deepgram.com/v1/listen?model=nova-2', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${env.DEEPGRAM_API_KEY}`,
          'Content-Type': audioFile.type
        },
        body: audioBuffer
      });
      
      const data = await response.json();
      return new Response(JSON.stringify({
        text: data.results?.channels?.[0]?.alternatives?.[0]?.transcript || '',
        provider: 'deepgram'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ error: 'Provider not configured' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function voiceVoices(request, env) {
  const url = new URL(request.url);
  const provider = url.searchParams.get('provider') || 'openai';
  
  const voices = {
    openai: [
      { id: 'alloy', name: 'Alloy', preview: 'Neutral and balanced' },
      { id: 'echo', name: 'Echo', preview: 'Warm and natural' },
      { id: 'fable', name: 'Fable', preview: 'Expressive and dynamic' },
      { id: 'onyx', name: 'Onyx', preview: 'Deep and authoritative' },
      { id: 'nova', name: 'Nova', preview: 'Friendly and upbeat' },
      { id: 'shimmer', name: 'Shimmer', preview: 'Clear and pleasant' },
    ],
    elevenlabs: [
      { id: 'rachel', name: 'Rachel', preview: 'American female' },
      { id: 'domi', name: 'Domi', preview: 'American female, young' },
      { id: 'bella', name: 'Bella', preview: 'American female, soft' },
      { id: 'josh', name: 'Josh', preview: 'American male, young' },
      { id: 'arnold', name: 'Arnold', preview: 'American male, deep' },
    ]
  };
  
  return new Response(JSON.stringify({
    provider,
    voices: voices[provider] || voices.openai
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// V.I.B.E. Engine Handlers
async function vibeGenerateHandler(request, env) {
  const body = await request.json();
  const { prompt, language = 'javascript', context = '', model = 'llama-3.1-70b-versatile' } = body;

  // Cloudflare AI Gateway Configuration
  const CLOUDFLARE_ACCOUNT_ID = env.CLOUDFLARE_ACCOUNT_ID;
  const GATEWAY_SLUG = env.AI_GATEWAY_SLUG || 'nurdscode-gateway';
  const AI_GATEWAY_URL = CLOUDFLARE_ACCOUNT_ID 
    ? `https://gateway.ai.cloudflare.com/v1/${CLOUDFLARE_ACCOUNT_ID}/${GATEWAY_SLUG}`
    : null;

  try {
    const baseUrl = AI_GATEWAY_URL 
      ? `${AI_GATEWAY_URL}/groq/openai/v1/chat/completions`
      : 'https://api.groq.com/openai/v1/chat/completions';

    const systemPrompt = `You are the V.I.B.E. (Vibrant Imagination Build Environment) Engine.
Your goal is to generate high-quality, executable ${language} code based on the user's request.
Return ONLY the code, no markdown fencing, no explanation unless specifically asked in the prompt.
If context is provided, use it to align your code style and dependencies.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(context ? [{ role: 'system', content: `Context:\n${context}` }] : []),
      { role: 'user', content: prompt }
    ];

    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.2, // Lower temperature for more deterministic code
        max_tokens: 4096
      })
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '// No code generated';

    return new Response(JSON.stringify({
      code: content,
      model: model,
      usage: data.usage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function vibeModelsHandler(request, env) {
  return new Response(JSON.stringify({
    models: [
      { id: 'llama-3.1-70b-versatile', name: 'Llama 3.1 70B (Recommended)' },
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B (Fast)' },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B' },
      { id: 'gemma-7b-it', name: 'Gemma 7B' }
    ]
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
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

  // Route: Health check
  if (path === '/api/health' && request.method === 'GET') {
    return new Response(JSON.stringify({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      services: {
        stripe: !!env.STRIPE_SECRET_KEY,
        groq: !!env.GROQ_API_KEY,
        openai: !!env.OPENAI_API_KEY,
        supabase: !!env.SUPABASE_URL
      }
    }), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }

  // Route: Chat (LLM)
  if (path === '/api/chat' && request.method === 'POST') {
    return chatHandler(request, env);
  }

  // Route: Voice transcription
  if (path === '/api/voice/transcribe' && request.method === 'POST') {
    return voiceTranscribe(request, env);
  }

  // Route: Voice voice list
  if (path === '/api/voice/voices' && request.method === 'GET') {
    return voiceVoices(request, env);
  }

  // Route: V.I.B.E. Engine - Generate Code
  if (path === '/api/vibe/generate' && request.method === 'POST') {
    return vibeGenerateHandler(request, env);
  }

  // Route: V.I.B.E. Engine - List Models
  if (path === '/api/vibe/models' && request.method === 'GET') {
    return vibeModelsHandler(request, env);
  }

  // Route: Create checkout session
  if (path === '/api/create-checkout-session' && request.method === 'POST') {
    try {
      const body = await request.json();
      const { priceId, email } = body;

      // Mock mode if Stripe key is not configured
      if (!env.STRIPE_SECRET_KEY || env.STRIPE_SECRET_KEY === '') {
        console.log('Stripe not configured, using mock flow');
        const mockSessionId = `mock_session_${Date.now()}`;
        return new Response(
          JSON.stringify({ 
            url: `${url.origin}/success?session_id=${mockSessionId}&mock=true&plan=${priceId}` 
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

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
      
      // Return a more specific error if it's a Stripe error
      const errorMessage = error.type === 'StripeInvalidRequestError' 
        ? `Invalid Price ID: ${error.message}` 
        : error.message;

      return new Response(
        JSON.stringify({ error: errorMessage }),
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
          if (env.DB) {
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
          }

          break;
        }
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted': {
          const subscription = event.data.object;
          
          // Update subscription status in D1 database
          if (env.DB) {
            await env.DB.prepare(
              'UPDATE subscriptions SET status = ?, updated_at = ? WHERE subscription_id = ?'
            )
              .bind(
                subscription.status,
                new Date().toISOString(),
                subscription.id
              )
              .run();
          }

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

      if (env.DB) {
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
      }

      return new Response(
        JSON.stringify({}),
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

  // Route: Circuit Box status (Admin)
  if (path === '/api/admin/circuit-box' && request.method === 'GET') {
    return new Response(JSON.stringify({
      services: [
        { id: 'groq', name: 'GROQ LLM', status: env.GROQ_API_KEY ? 'online' : 'offline' },
        { id: 'openai', name: 'OpenAI', status: env.OPENAI_API_KEY ? 'online' : 'offline' },
        { id: 'stripe', name: 'Stripe', status: env.STRIPE_SECRET_KEY ? 'online' : 'offline' },
        { id: 'supabase', name: 'Supabase', status: env.SUPABASE_URL ? 'online' : 'offline' },
        { id: 'd1', name: 'D1 Database', status: env.DB ? 'online' : 'offline' },
      ]
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Route: Create Agent (Buildsmith P.O. Handoff)
  if (path === '/api/agent/create' && request.method === 'POST') {
    return new Promise(async (resolve) => {
      try {
        const body = await request.json();
        const { name, type, framework, collaborators } = body;
        
        // Simulate Buildsmith construction delay
        await new Promise(r => setTimeout(r, 1500));

        resolve(new Response(JSON.stringify({
          success: true,
          agentId: `ang_${Date.now()}`,
          status: 'deployed',
          message: `Bamaram! ${name} has been forged by Buildsmith.`,
          deployment_url: `https://${name.toLowerCase().replace('_', '-')}.nurdscode.com`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }));
      } catch (e) {
        resolve(new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders }));
      }
    });
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
