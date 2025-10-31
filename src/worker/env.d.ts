// Cloudflare Worker environment types for Nurds Code platform
// Includes all bindings and environment variables

export interface Env {
  // Supabase
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;

  // Clerk Authentication
  CLERK_FRONTEND_API_URL: string;
  CLERK_BACKEND_API_URL: string;
  CLERK_JWKS_URL: string;
  CLERK_SECRET_KEY?: string;

  // Superadmin RBAC
  ADMIN_ALLOWLIST: string;
  CLERK_ORG_ID_SUPERADMINS?: string;
  CLERK_SUPERADMIN_ROLE: string;

  // AI Gateway
  AI_GATEWAY_ACCOUNT_ID: string;
  AI_GATEWAY_GATEWAY_NAME: string;

  // LLM API Keys
  OPENAI_API_KEY: string;
  ANTHROPIC_API_KEY: string;
  GROQ_API_KEY: string;
  OPENROUTER_API_KEY: string;

  // Voice Configuration
  VOICE_ENABLED: string;
  VOICE_DEFAULT_PROVIDER: string;
  OPENAI_VOICE_MODEL: string;
  OPENAI_TTS_MODEL: string;
  OPENAI_TTS_VOICE: string;

  // Stripe
  STRIPE_PUBLISHABLE_KEY: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;

  // Feature Flags
  ENABLE_GPT5: string;

  // Performance
  MAX_REQUESTS_PER_MINUTE: string;
  RESPONSE_TIMEOUT_MS: string;

  // KV Namespaces
  CACHE: KVNamespace;
  SESSIONS: KVNamespace;

  // Durable Objects
  CHAT_ROOMS: DurableObjectNamespace;

  // R2 Storage
  ASSETS: R2Bucket;

  // Analytics
  ANALYTICS: AnalyticsEngineDataset;

  // Workers AI
  AI: any;
}

export interface ProvisionUserRequest {
  id: string;
  email: string;
  tier: string;
}

export interface CreateAgentRequest {
  userPrefix: string;
  type: 'simple' | 'workflow' | 'custom';
  framework: 'auto' | 'crewai' | 'microsoft' | 'openai' | 'deerflow' | 'boomer_angs';
  config?: Record<string, any>;
}

export interface CircuitBreakerStatus {
  id: string;
  name: string;
  service: string;
  tier: string;
  status: 'on' | 'off' | 'error';
  health_endpoint?: string;
  last_check?: string;
  error_count: number;
}
