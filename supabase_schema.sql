-- ============================================
-- Nurds Code - Supabase Multi-Tenant Schema
-- Replaces D1 with PostgreSQL + RLS
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'TeIWA78XcogczgfZ5sWcJ5Lv7xrEv2WXYwhUxbjbIoo6hV4EEWq012vA4YdzT+3YeEV946MPbV0XEVDz27BGXQ==';

-- ============================================
-- 1. TENANTS TABLE (Multi-tenant isolation)
-- ============================================
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('free', 'coffee', 'pro', 'enterprise')),
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Tenant indexes
CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_stripe ON tenants(stripe_customer_id);
CREATE INDEX idx_tenants_tier ON tenants(tier);

-- ============================================
-- 2. USERS TABLE (Tenant scoped)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- User indexes
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================
-- 3. SUBSCRIPTIONS TABLE (Stripe integration)
-- ============================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  customer_id TEXT NOT NULL,
  subscription_id TEXT UNIQUE,
  price_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Subscription indexes
CREATE INDEX idx_subscriptions_tenant ON subscriptions(tenant_id);
CREATE INDEX idx_subscriptions_customer ON subscriptions(customer_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_subscription ON subscriptions(subscription_id);

-- ============================================
-- 4. PROJECTS TABLE (User workspaces)
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  code TEXT,
  language TEXT DEFAULT 'javascript',
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'team', 'public')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Project indexes
CREATE INDEX idx_projects_tenant ON projects(tenant_id);
CREATE INDEX idx_projects_user ON projects(user_id);
CREATE INDEX idx_projects_visibility ON projects(visibility);
CREATE INDEX idx_projects_language ON projects(language);

-- ============================================
-- 5. CHAT_HISTORY TABLE (AI assistant conversations)
-- ============================================
CREATE TABLE IF NOT EXISTS chat_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  model TEXT,
  tokens_used INTEGER,
  plan TEXT CHECK (plan IN ('free', 'coffee', 'pro', 'enterprise')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Chat history indexes
CREATE INDEX idx_chat_tenant ON chat_history(tenant_id);
CREATE INDEX idx_chat_user ON chat_history(user_id);
CREATE INDEX idx_chat_session ON chat_history(session_id);
CREATE INDEX idx_chat_created ON chat_history(created_at DESC);

-- ============================================
-- 6. API_USAGE TABLE (Rate limiting & analytics)
-- ============================================
CREATE TABLE IF NOT EXISTS api_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER,
  response_time_ms INTEGER,
  tokens_used INTEGER,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- API usage indexes
CREATE INDEX idx_api_usage_tenant ON api_usage(tenant_id);
CREATE INDEX idx_api_usage_user ON api_usage(user_id);
CREATE INDEX idx_api_usage_endpoint ON api_usage(endpoint);
CREATE INDEX idx_api_usage_date ON api_usage(date DESC);

-- ============================================
-- 7. PLUGS TABLE (VibeSDK integrations)
-- ============================================
CREATE TABLE IF NOT EXISTS plugs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('free', 'coffee', 'pro', 'enterprise')),
  schema_name TEXT,
  config JSONB DEFAULT '{}'::jsonb,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plug indexes
CREATE INDEX idx_plugs_tenant ON plugs(tenant_id);
CREATE INDEX idx_plugs_owner ON plugs(owner_id);
CREATE INDEX idx_plugs_tier ON plugs(tier);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE plugs ENABLE ROW LEVEL SECURITY;

-- Tenant isolation policy (users can only see their tenant's data)
CREATE POLICY tenant_isolation_users ON users
  FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY tenant_isolation_subscriptions ON subscriptions
  FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY tenant_isolation_projects ON projects
  FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
    OR visibility = 'public'
  );

CREATE POLICY tenant_isolation_chat_history ON chat_history
  FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY tenant_isolation_api_usage ON api_usage
  FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY tenant_isolation_plugs ON plugs
  FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Updated timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update trigger to tables
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plugs_updated_at BEFORE UPDATE ON plugs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- REALTIME SUBSCRIPTIONS (Supabase feature)
-- ============================================

-- Enable realtime for chat history
ALTER PUBLICATION supabase_realtime ADD TABLE chat_history;

-- Enable realtime for projects (collaborative editing)
ALTER PUBLICATION supabase_realtime ADD TABLE projects;

-- ============================================
-- INITIAL DATA / SEED
-- ============================================

-- Create default tenant for initial setup
INSERT INTO tenants (id, name, slug, tier, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Nurds Code Default',
  'default',
  'free',
  NOW()
) ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- VIEWS FOR ANALYTICS
-- ============================================

-- Daily API usage summary
CREATE OR REPLACE VIEW daily_api_usage AS
SELECT
  tenant_id,
  date,
  endpoint,
  COUNT(*) as request_count,
  AVG(response_time_ms) as avg_response_time,
  SUM(tokens_used) as total_tokens
FROM api_usage
GROUP BY tenant_id, date, endpoint;

-- Active subscriptions view
CREATE OR REPLACE VIEW active_subscriptions AS
SELECT
  s.*,
  t.name as tenant_name,
  t.tier as current_tier
FROM subscriptions s
JOIN tenants t ON s.tenant_id = t.id
WHERE s.status = 'active';

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant usage to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant usage to service role (for server-side operations)
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- ============================================
-- COMMENTS (Documentation)
-- ============================================

COMMENT ON TABLE tenants IS 'Multi-tenant organizations with tier-based access';
COMMENT ON TABLE users IS 'User accounts scoped to tenants';
COMMENT ON TABLE subscriptions IS 'Stripe subscription management';
COMMENT ON TABLE projects IS 'User code projects and workspaces';
COMMENT ON TABLE chat_history IS 'AI assistant conversation logs';
COMMENT ON TABLE api_usage IS 'API request tracking and rate limiting';
COMMENT ON TABLE plugs IS 'VibeSDK integration configurations';

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Nurds Code Supabase schema created successfully!';
  RAISE NOTICE '📊 Tables: tenants, users, subscriptions, projects, chat_history, api_usage, plugs';
  RAISE NOTICE '🔒 Row Level Security enabled on all tables';
  RAISE NOTICE '🚀 Ready for multi-tenant production deployment';
END $$;
