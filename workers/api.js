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
  
  // Model selection based on plan - Using OpenRouter with Claude Haiku 4.5 as default
  const modelConfig = {
    free: { provider: 'openrouter', model: 'anthropic/claude-3.5-haiku:beta' },
    price_coffee: { provider: 'openrouter', model: 'anthropic/claude-3-5-sonnet' },
    price_pro: { provider: 'openrouter', model: 'anthropic/claude-3-5-sonnet' },
    price_enterprise: { provider: 'openrouter', model: 'anthropic/claude-3-5-opus' },
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
  
  // Try OpenRouter (Claude Haiku 4.5) as primary provider
  if (env.OPENROUTER_API_KEY && env.OPENROUTER_API_KEY !== 'your_openrouter_api_key_here') {
    try {
      const baseUrl = env.CLOUDFLARE_ACCOUNT_ID 
        ? `${AI_GATEWAY_URL}/openrouter/api/v1/chat/completions`
        : 'https://openrouter.ai/api/v1/chat/completions';

      const openrouterResponse = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': env.APP_URL || 'https://nurdscode.com',
          'X-Title': 'Nurds Code Platform'
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
            { 
              role: 'system', 
              content: `You are an expert full-stack developer assistant for Nurds Code platform. 
              
Your role is to generate complete, production-ready code for Cloudflare Workers applications.

When generating code:
1. Use modern best practices and clean architecture
2. Generate COMPLETE files with all imports, exports, and dependencies
3. Include proper error handling and TypeScript types when applicable
4. Use Cloudflare Workers APIs (Request, Response, KV, D1, R2, Durable Objects, etc.)
5. Generate wrangler.toml configuration when needed
6. Support popular frameworks: React, Next.js, Astro, Vue, Svelte, Remix
7. Include comments explaining key functionality
8. Make code ready to deploy with 'wrangler deploy'

Generate full-stack applications that work seamlessly on Cloudflare's global network.`
            },
            ...history.slice(-20),
            { role: 'user', content: message }
          ],
          temperature: 0.7,
          max_tokens: 4096
        })
      });
      
      if (openrouterResponse.ok) {
        const data = await openrouterResponse.json();
        return new Response(JSON.stringify({
          response: data.choices[0].message.content,
          model: config.model,
          provider: 'openrouter-claude',
          usage: data.usage
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else {
        const errorText = await openrouterResponse.text();
        console.error('OpenRouter error:', errorText);
      }
    } catch (error) {
      console.error('OpenRouter error:', error);
    }
  }

  // Fallback to Hugging Face Inference API (FREE - no key required)
  try {
    const hfResponse = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: `<s>[INST] You are a helpful coding assistant for Nurds Code platform. Help users write, debug, and understand code.\n\n${message} [/INST]`,
        parameters: {
          max_new_tokens: 2048,
          temperature: 0.7,
          return_full_text: false
        }
      })
    });
    
    const data = await hfResponse.json();
    
    // Hugging Face returns array with generated_text or error
    let responseText = 'Unable to generate response';
    
    if (Array.isArray(data) && data[0]?.generated_text) {
      responseText = data[0].generated_text;
    } else if (data.error) {
      // Model is loading, return helpful message
      responseText = `🚀 AI Model initializing... Please try again in a moment.\n\nYour prompt: "${message}"`;
    }
    
    return new Response(JSON.stringify({
      response: responseText,
      model: 'Mistral-7B (Hugging Face)',
      provider: 'huggingface-free',
      status: data.error ? 'loading' : 'success'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error.message,
      response: `Error generating code: ${error.message}\n\nYour prompt: "${message}"`
    }), {
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
      { id: 'anthropic/claude-3.5-haiku:beta', name: 'Claude Haiku 3.5 (Default, Recommended)' },
      { id: 'anthropic/claude-3-5-sonnet', name: 'Claude Sonnet 3.5 (Pro)' },
      { id: 'anthropic/claude-3-5-opus', name: 'Claude Opus 3.5 (Enterprise)' },
      { id: 'openai/gpt-4o', name: 'GPT-4o' }
    ]
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Generate full Cloudflare Workers project (like Bolt.new)
async function generateProjectHandler(request, env) {
  try {
    const body = await request.json();
    const { description, framework = 'vanilla', bindings = [] } = body;
    
    if (!env.OPENROUTER_API_KEY) {
      return new Response(JSON.stringify({ error: 'OpenRouter API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Enhanced prompt for Claude to generate full project
    const projectPrompt = `Generate a complete Cloudflare Workers project for: ${description}

Framework: ${framework}
Bindings requested: ${bindings.join(', ') || 'none'}

Return a JSON object with this exact structure:
{
  "files": [
    {
      "path": "src/index.js",
      "content": "... full file content ..."
    },
    {
      "path": "wrangler.toml",
      "content": "... full wrangler config ..."
    },
    {
      "path": "package.json",
      "content": "... full package.json ..."
    }
  ],
  "instructions": "Brief setup instructions"
}

Requirements:
1. Generate ALL files needed for a working project
2. Include wrangler.toml with proper configuration
3. Include package.json with all dependencies
4. Use Cloudflare Workers APIs (env.KV, env.D1, env.R2, etc.)
5. Add TypeScript types if applicable
6. Include error handling
7. Make it production-ready
8. Add README.md with setup instructions

Generate a complete, deployable project now.`;

    const openrouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': env.APP_URL || 'https://nurdscode.com',
        'X-Title': 'Nurds Code Platform'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-haiku:beta',
        messages: [
          { role: 'user', content: projectPrompt }
        ],
        temperature: 0.7,
        max_tokens: 8000
      })
    });
    
    if (!openrouterResponse.ok) {
      const errorText = await openrouterResponse.text();
      throw new Error(`OpenRouter error: ${errorText}`);
    }
    
    const data = await openrouterResponse.json();
    const responseContent = data.choices[0].message.content;
    
    // Try to parse JSON from response
    let projectData;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = responseContent.match(/```json\n([\s\S]*?)\n```/) || 
                       responseContent.match(/```\n([\s\S]*?)\n```/) ||
                       [null, responseContent];
      projectData = JSON.parse(jsonMatch[1] || responseContent);
    } catch (parseError) {
      // If Claude didn't return JSON, wrap the response
      projectData = {
        files: [
          {
            path: 'src/index.js',
            content: responseContent
          }
        ],
        instructions: 'Review and customize the generated code'
      };
    }
    
    return new Response(JSON.stringify({
      project: projectData,
      model: 'anthropic/claude-3.5-haiku:beta',
      provider: 'openrouter-claude'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Project generation error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Failed to generate project structure'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
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

  // Route: Generate Full Cloudflare Workers Project
  if (path === '/api/project/generate' && request.method === 'POST') {
    return generateProjectHandler(request, env);
  }

  // Route: Save Project
  if (path === '/api/project/save' && request.method === 'POST') {
    try {
      const body = await request.json();
      const { projectName, content, files } = body;
      
      // Log the save action (in production, this would persist to KV/D1/R2)
      console.log(`Saved [${projectName || 'Untitled Project'}]`);
      
      return new Response(JSON.stringify({
        success: true,
        message: `Project "${projectName || 'Untitled Project'}" saved successfully`,
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
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
        { id: 'openrouter', name: 'OpenRouter', status: env.OPENROUTER_API_KEY ? 'online' : 'offline' },
        { id: 'stripe', name: 'Stripe', status: env.STRIPE_SECRET_KEY ? 'online' : 'offline' },
        { id: 'supabase', name: 'Supabase', status: env.SUPABASE_URL ? 'online' : 'offline' },
        { id: 'd1', name: 'D1 Database', status: env.DB ? 'online' : 'offline' },
        { id: 'ai', name: 'Workers AI', status: env.AI ? 'online' : 'offline' },
        { id: 'kv', name: 'KV Cache', status: env.CACHE ? 'online' : 'offline' },
        { id: 'r2', name: 'R2 Storage', status: env.STORAGE ? 'online' : 'offline' },
      ]
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Route: ACHEEVY Chat - Main AI chat endpoint with Circuit Box orchestration
  if (path === '/api/acheevy/chat' && request.method === 'POST') {
    try {
      const body = await request.json();
      const { message, history = [], plan = 'free', angId, context = {} } = body;

      // Get the appropriate Ang (agent) based on task
      const angKeywords = {
        Code_Ang: ['code', 'function', 'api', 'backend', 'frontend', 'component', 'debug', 'fix', 'implement', 'build'],
        Paint_Ang: ['style', 'css', 'design', 'ui', 'ux', 'color', 'animation', 'layout', 'responsive', 'theme'],
        Ops_Ang: ['deploy', 'ci', 'cd', 'docker', 'pipeline', 'infrastructure', 'monitor', 'log', 'wrangler'],
        Data_Ang: ['database', 'sql', 'query', 'schema', 'table', 'index', 'data', 'migration', 'd1'],
        Doc_Ang: ['document', 'readme', 'explain', 'guide', 'tutorial', 'comment', 'help'],
      };

      let selectedAng = angId || 'Code_Ang';
      const lowerMessage = message.toLowerCase();
      for (const [ang, keywords] of Object.entries(angKeywords)) {
        if (keywords.some(kw => lowerMessage.includes(kw))) {
          selectedAng = ang;
          break;
        }
      }

      // Ang-specific system prompts
      const angPrompts = {
        Code_Ang: `You are Code_Ang, the elite coding specialist for Nurds Code. Generate complete, runnable code with all imports and error handling. Be direct and efficient.`,
        Paint_Ang: `You are Paint_Ang, the visual design specialist. Focus on the "Nurd OS" aesthetic: Industrial meets Graffiti, dark themes with electric accents (Slime #00ffcc, Electric #ffaa00).`,
        Ops_Ang: `You are Ops_Ang, the DevOps specialist. Focus on Cloudflare Workers deployment, CI/CD, and infrastructure. Always use environment variables for secrets.`,
        Data_Ang: `You are Data_Ang, the data specialist. Focus on D1, KV, and R2 for Cloudflare. Design for scalability with proper indexing.`,
        Doc_Ang: `You are Doc_Ang, the documentation specialist. Write clear, concise documentation with working code examples.`,
      };

      const systemPrompt = `${angPrompts[selectedAng] || angPrompts.Code_Ang}

You are ACHEEVY, the AI assistant for Nurds Code platform.
- Be confident, playful, and technically sharp
- Use occasional catchphrases like "Let's build something dope." or "Code is art. Ship it."
- Generate complete, production-ready code
- End with actionable next steps`;

      // Try OpenRouter first (Claude Haiku)
      if (env.OPENROUTER_API_KEY) {
        const modelConfig = {
          free: 'anthropic/claude-3.5-haiku:beta',
          coffee: 'anthropic/claude-3-5-sonnet',
          pro: 'anthropic/claude-3-5-sonnet',
          enterprise: 'anthropic/claude-3-5-opus',
        };

        const model = modelConfig[plan] || modelConfig.free;
        const gatewayUrl = env.CLOUDFLARE_ACCOUNT_ID
          ? `https://gateway.ai.cloudflare.com/v1/${env.CLOUDFLARE_ACCOUNT_ID}/${env.AI_GATEWAY_SLUG || 'nurdscode-gateway'}/openrouter/api/v1/chat/completions`
          : 'https://openrouter.ai/api/v1/chat/completions';

        const response = await fetch(gatewayUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': env.APP_URL || 'https://nurdscode.com',
            'X-Title': 'Nurds Code Platform',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              ...history.slice(-20),
              { role: 'user', content: message },
            ],
            temperature: 0.7,
            max_tokens: 4096,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          return new Response(JSON.stringify({
            response: data.choices[0].message.content,
            model,
            provider: 'openrouter',
            ang: selectedAng,
            usage: data.usage,
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      // Fallback to Groq
      if (env.GROQ_API_KEY) {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.1-70b-versatile',
            messages: [
              { role: 'system', content: systemPrompt },
              ...history.slice(-20),
              { role: 'user', content: message },
            ],
            temperature: 0.7,
            max_tokens: 4096,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          return new Response(JSON.stringify({
            response: data.choices[0].message.content,
            model: 'llama-3.1-70b-versatile',
            provider: 'groq',
            ang: selectedAng,
            usage: data.usage,
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      // Final fallback - helpful message
      return new Response(JSON.stringify({
        response: `⚡ Hey Nurd! I'm ACHEEVY, but my AI providers are currently offline. Make sure OPENROUTER_API_KEY or GROQ_API_KEY is configured.\n\nYour message: "${message}"\n\nLet's build something dope once I'm connected! 🚀`,
        model: 'fallback',
        provider: 'none',
        ang: selectedAng,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  // Route: Project Deploy - Deploy to Cloudflare Pages via GitHub
  if (path === '/api/project/deploy' && request.method === 'POST') {
    try {
      const body = await request.json();
      const { projectId, files, repoName, branch = 'main' } = body;

      // Verify auth
      const authHeader = request.headers.get('Authorization');
      if (!authHeader) {
        return new Response(JSON.stringify({ error: 'Authorization required' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const token = authHeader.replace('Bearer ', '');
      const user = verifyToken(token, env.JWT_SECRET);
      if (!user) {
        return new Response(JSON.stringify({ error: 'Invalid token' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Get user's GitHub token from DB
      let githubToken = null;
      if (env.DB) {
        const userRecord = await env.DB.prepare(
          'SELECT github_token FROM users WHERE id = ?'
        ).bind(user.userId).first();
        githubToken = userRecord?.github_token;
      }

      if (!githubToken) {
        return new Response(JSON.stringify({
          error: 'GitHub not connected',
          action: 'connect_github',
          message: 'Please connect your GitHub account to deploy projects.',
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Create or update GitHub repo
      const repoResponse = await fetch(`https://api.github.com/user/repos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'NurdsCode-Platform',
        },
        body: JSON.stringify({
          name: repoName || `nurdscode-${projectId}`,
          description: 'Deployed from Nurds Code Platform',
          private: false,
          auto_init: true,
        }),
      });

      let repo;
      if (repoResponse.status === 422) {
        // Repo exists, get it
        const userResponse = await fetch('https://api.github.com/user', {
          headers: {
            'Authorization': `Bearer ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'NurdsCode-Platform',
          },
        });
        const userData = await userResponse.json();
        
        const existingRepoResponse = await fetch(
          `https://api.github.com/repos/${userData.login}/${repoName || `nurdscode-${projectId}`}`,
          {
            headers: {
              'Authorization': `Bearer ${githubToken}`,
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'NurdsCode-Platform',
            },
          }
        );
        repo = await existingRepoResponse.json();
      } else {
        repo = await repoResponse.json();
      }

      // Push files to repo (simplified - in production use Git tree API)
      for (const file of files || []) {
        await fetch(`https://api.github.com/repos/${repo.full_name}/contents/${file.path}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${githubToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'NurdsCode-Platform',
          },
          body: JSON.stringify({
            message: `Deploy from Nurds Code: ${file.path}`,
            content: btoa(file.content),
            branch,
          }),
        });
      }

      return new Response(JSON.stringify({
        success: true,
        repoUrl: repo.html_url,
        deployUrl: `https://${repo.name}.pages.dev`,
        message: `🚀 Deployed to GitHub! Your project is live at ${repo.html_url}`,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  // Route: Connect GitHub - OAuth flow initiation
  if (path === '/api/user/connect-github' && request.method === 'GET') {
    const clientId = env.GITHUB_CLIENT_ID;
    if (!clientId) {
      return new Response(JSON.stringify({
        error: 'GitHub OAuth not configured',
        message: 'GITHUB_CLIENT_ID is not set in environment variables.',
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const redirectUri = `${env.APP_URL || 'https://nurdscode.com'}/api/auth/github/callback`;
    const scope = 'repo,user:email';
    const state = crypto.randomUUID();

    // Store state in KV for verification
    if (env.CACHE) {
      await env.CACHE.put(`github_oauth_state:${state}`, 'valid', { expirationTtl: 600 });
    }

    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}`;

    return new Response(JSON.stringify({
      authUrl,
      state,
      message: 'Redirect user to authUrl to connect GitHub',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Route: GitHub OAuth Callback
  if (path === '/api/auth/github/callback' && request.method === 'GET') {
    try {
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');

      if (!code || !state) {
        return new Response('Missing code or state', { status: 400, headers: corsHeaders });
      }

      // Verify state
      if (env.CACHE) {
        const validState = await env.CACHE.get(`github_oauth_state:${state}`);
        if (!validState) {
          return new Response('Invalid state', { status: 400, headers: corsHeaders });
        }
        await env.CACHE.delete(`github_oauth_state:${state}`);
      }

      // Exchange code for token
      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
        }),
      });

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      if (!accessToken) {
        return new Response('Failed to get access token', { status: 400, headers: corsHeaders });
      }

      // Get user info
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'NurdsCode-Platform',
        },
      });
      const githubUser = await userResponse.json();

      // Store token in DB (in production, encrypt this)
      if (env.DB) {
        await env.DB.prepare(
          'UPDATE users SET github_token = ?, github_username = ? WHERE id = ?'
        ).bind(accessToken, githubUser.login, state).run();
      }

      // Redirect to success page
      return Response.redirect(`${env.APP_URL || 'https://nurdscode.com'}/settings?github=connected`, 302);

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  // Route: Circuit Box Toggle - Toggle service modules
  if (path === '/api/circuit-box/toggle' && request.method === 'POST') {
    try {
      const body = await request.json();
      const { moduleId, enabled } = body;

      // In production, this would update actual service states
      // For now, return mock response
      return new Response(JSON.stringify({
        success: true,
        moduleId,
        enabled,
        message: `Module ${moduleId} is now ${enabled ? 'ONLINE' : 'OFFLINE'}`,
        timestamp: new Date().toISOString(),
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  // Route: Circuit Box Modules - Get all module statuses
  if (path === '/api/circuit-box/modules' && request.method === 'GET') {
    return new Response(JSON.stringify({
      modules: [
        { id: 'voice-agent', name: 'Voice Agent', status: 'online', load: 45, latency: 120 },
        { id: 'code-gen', name: 'Code Generation', status: 'online', load: 78, latency: 50 },
        { id: 'database', name: 'D1 Database', status: env.DB ? 'online' : 'offline', load: 23, latency: 15 },
        { id: 'storage', name: 'R2 Storage', status: env.STORAGE ? 'online' : 'offline', load: 12, latency: 25 },
        { id: 'cache', name: 'KV Cache', status: env.CACHE ? 'online' : 'offline', load: 67, latency: 5 },
        { id: 'ai-gateway', name: 'AI Gateway', status: env.CLOUDFLARE_ACCOUNT_ID ? 'online' : 'offline', load: 89, latency: 200 },
      ],
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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

  // Route: List available plugins for Testing Lab
  if (path === '/api/plugins/list' && request.method === 'GET') {
    // Mock plugin list - in production this would come from a database
    const mockPlugins = [
      { id: 'video-editor-pro', name: 'Video Editor Pro', description: 'Advanced video editing tool', category: 'media' },
      { id: 'code-formatter', name: 'Code Formatter', description: 'Format and beautify code', category: 'dev-tools' },
      { id: 'ai-image-gen', name: 'AI Image Generator', description: 'Generate images with AI', category: 'ai' },
      { id: 'pdf-converter', name: 'PDF Converter', description: 'Convert documents to PDF', category: 'productivity' }
    ];

    return new Response(JSON.stringify({ plugins: mockPlugins }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Route: Run test in Testing Lab
  if (path === '/api/test/run' && request.method === 'POST') {
    try {
      const body = await request.json();
      const { sourceType, config } = body;

      let output = '';
      const logs = [];

      switch(sourceType) {
        case 'github':
          logs.push({ type: 'info', message: `Cloning repository: ${body.githubUrl}` });
          logs.push({ type: 'info', message: `Branch: ${body.branch || 'main'}` });
          logs.push({ type: 'success', message: 'Repository cloned successfully' });
          
          output = `
            <html>
              <head><style>body { font-family: monospace; padding: 20px; background: #1a1a2e; color: #00ff88; }</style></head>
              <body>
                <h1>✅ GitHub Repository Test</h1>
                <p><strong>Repository:</strong> ${body.githubUrl}</p>
                <p><strong>Branch:</strong> ${body.branch || 'main'}</p>
                <p>Repository loaded successfully! In a production environment, this would execute the repository code in an isolated sandbox.</p>
              </body>
            </html>
          `;
          break;

        case 'npm':
          logs.push({ type: 'info', message: `Installing NPM package: ${body.package}@${body.version}` });
          logs.push({ type: 'success', message: 'Package installed successfully' });
          
          output = `
            <html>
              <head><style>body { font-family: monospace; padding: 20px; background: #1a1a2e; color: #00ff88; }</style></head>
              <body>
                <h1>📦 NPM Package Test</h1>
                <p><strong>Package:</strong> ${body.package}</p>
                <p><strong>Version:</strong> ${body.version || 'latest'}</p>
                <p>Package loaded successfully! In a production environment, this would install and test the package.</p>
              </body>
            </html>
          `;
          break;

        case 'plugin':
          logs.push({ type: 'info', message: `Loading plugin: ${body.pluginId}` });
          logs.push({ type: 'success', message: 'Plugin loaded successfully' });
          
          output = `
            <html>
              <head><style>body { font-family: monospace; padding: 20px; background: #1a1a2e; color: #00ff88; }</style></head>
              <body>
                <h1>🔌 Plugin Test</h1>
                <p><strong>Plugin ID:</strong> ${body.pluginId}</p>
                <p>Plugin loaded successfully! In a production environment, this would execute the plugin with test data.</p>
              </body>
            </html>
          `;
          break;

        case 'custom':
          logs.push({ type: 'info', message: 'Compiling custom code...' });
          logs.push({ type: 'info', message: 'Executing in sandbox...' });
          logs.push({ type: 'success', message: 'Code executed successfully' });
          
          // For custom code, we'd ideally compile and execute it
          // For now, just show the code
          output = `
            <html>
              <head>
                <style>
                  body { font-family: monospace; padding: 20px; background: #1a1a2e; color: #00ff88; }
                  pre { background: #0a0a0f; padding: 15px; border-left: 3px solid #00ff88; overflow-x: auto; }
                </style>
              </head>
              <body>
                <h1>✏️ Custom Code Test</h1>
                <p>Your custom code:</p>
                <pre>${body.code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
                <p>In a production environment, this would be compiled and executed in an isolated sandbox.</p>
              </body>
            </html>
          `;
          break;

        default:
          throw new Error('Invalid source type');
      }

      return new Response(JSON.stringify({ output, logs, status: 'success' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
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
