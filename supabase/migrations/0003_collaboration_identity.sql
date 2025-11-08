-- =====================================================
-- NURDSCODE COLLABORATION & IDENTITY SCHEMA
-- Version 1.0 | November 2, 2025
-- =====================================================

-- =====================================================
-- 1. IDENTITY VERIFICATION TABLES
-- =====================================================

-- Verifications Table (Shufti Pro Results)
CREATE TABLE IF NOT EXISTS verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  verified BOOLEAN DEFAULT false,
  status TEXT CHECK (status IN ('pending', 'verified', 'declined', 'expired')),
  verification_id TEXT, -- Shufti Pro reference
  verification_type TEXT CHECK (verification_type IN ('seller', 'business', 'moderator')),
  document_type TEXT, -- passport, id_card, driving_license
  document_data JSONB, -- Extracted data from document
  face_match_score DECIMAL(5, 2), -- 0-100
  verification_data JSONB, -- Raw Shufti Pro response
  callback_received_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_verifications_user_id ON verifications(user_id);
CREATE INDEX idx_verifications_status ON verifications(status);

-- Risk Scores Table (Cloudflare Zero Trust)
CREATE TABLE IF NOT EXISTS risk_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  risk_score INT CHECK (risk_score >= 0 AND risk_score <= 100), -- 0-100 (Cloudflare score)
  device_posture TEXT CHECK (device_posture IN ('secure', 'moderate', 'risky', 'unknown')),
  ip_address TEXT,
  user_agent TEXT,
  location JSONB, -- { country, city, lat, lon }
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_risk_scores_user_id ON risk_scores(user_id);
CREATE INDEX idx_risk_scores_timestamp ON risk_scores(timestamp DESC);

-- Trust Profiles Table (Calculated Trust Scores)
CREATE TABLE IF NOT EXISTS trust_profiles (
  user_id TEXT PRIMARY KEY,
  trust_score INT CHECK (trust_score >= 0 AND trust_score <= 100), -- 0-100 calculated
  tier TEXT CHECK (tier IN ('verified_trusted', 'standard_verified', 'unverified', 'restricted')),
  badges JSONB DEFAULT '[]', -- Array of earned badges
  seller_enabled BOOLEAN DEFAULT false,
  marketplace_enabled BOOLEAN DEFAULT false,
  collaboration_enabled BOOLEAN DEFAULT false,
  last_risk_check TIMESTAMPTZ,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trust_profiles_tier ON trust_profiles(tier);
CREATE INDEX idx_trust_profiles_trust_score ON trust_profiles(trust_score DESC);

-- =====================================================
-- 2. COLLABORATION TABLES
-- =====================================================

-- Collaboration Projects Table
CREATE TABLE IF NOT EXISTS collaboration_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_user_id TEXT NOT NULL,
  status TEXT CHECK (status IN ('active', 'paused', 'archived')) DEFAULT 'active',
  visibility TEXT CHECK (visibility IN ('private', 'team', 'public')) DEFAULT 'private',
  settings JSONB DEFAULT '{}', -- Editor settings, permissions, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_collaboration_projects_owner ON collaboration_projects(owner_user_id);
CREATE INDEX idx_collaboration_projects_status ON collaboration_projects(status);

-- Collaboration Members Table
CREATE TABLE IF NOT EXISTS collaboration_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES collaboration_projects(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  role TEXT CHECK (role IN ('owner', 'admin', 'editor', 'viewer')) DEFAULT 'viewer',
  invited_by TEXT,
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ,
  billing_type TEXT CHECK (billing_type IN ('daily', 'monthly', 'free')) DEFAULT 'daily',
  status TEXT CHECK (status IN ('invited', 'active', 'removed', 'left')) DEFAULT 'invited',
  last_active TIMESTAMPTZ,
  UNIQUE(project_id, user_id)
);

CREATE INDEX idx_collaboration_members_project ON collaboration_members(project_id);
CREATE INDEX idx_collaboration_members_user ON collaboration_members(user_id);
CREATE INDEX idx_collaboration_members_status ON collaboration_members(status);

-- Collaboration Sessions Table (for billing & analytics)
CREATE TABLE IF NOT EXISTS collaboration_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES collaboration_projects(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  session_type TEXT CHECK (session_type IN ('edit', 'video', 'screen_share', 'view')) DEFAULT 'edit',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_minutes INT,
  cost_usd DECIMAL(10, 2),
  billable BOOLEAN DEFAULT true,
  metadata JSONB -- Additional session data
);

CREATE INDEX idx_collaboration_sessions_project ON collaboration_sessions(project_id);
CREATE INDEX idx_collaboration_sessions_user ON collaboration_sessions(user_id);
CREATE INDEX idx_collaboration_sessions_started ON collaboration_sessions(started_at DESC);

-- Collaboration Files Table (project assets)
CREATE TABLE IF NOT EXISTS collaboration_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES collaboration_projects(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  filepath TEXT NOT NULL, -- Relative path in project
  content TEXT, -- File content (for code files)
  language TEXT, -- javascript, python, etc.
  size_bytes BIGINT,
  created_by TEXT NOT NULL,
  updated_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, filepath)
);

CREATE INDEX idx_collaboration_files_project ON collaboration_files(project_id);
CREATE INDEX idx_collaboration_files_updated ON collaboration_files(updated_at DESC);

-- Collaboration Chat Messages
CREATE TABLE IF NOT EXISTS collaboration_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES collaboration_projects(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  message TEXT NOT NULL,
  message_type TEXT CHECK (message_type IN ('text', 'code', 'file', 'system')) DEFAULT 'text',
  reply_to UUID REFERENCES collaboration_messages(id),
  metadata JSONB, -- Code snippets, file refs, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_collaboration_messages_project ON collaboration_messages(project_id);
CREATE INDEX idx_collaboration_messages_created ON collaboration_messages(created_at DESC);

-- Collaboration Invitations Table
CREATE TABLE IF NOT EXISTS collaboration_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES collaboration_projects(id) ON DELETE CASCADE,
  inviter_user_id TEXT NOT NULL,
  invitee_email TEXT NOT NULL,
  invitee_user_id TEXT, -- Set when user accepts
  role TEXT CHECK (role IN ('admin', 'editor', 'viewer')) DEFAULT 'viewer',
  billing_type TEXT CHECK (billing_type IN ('daily', 'monthly', 'free')) DEFAULT 'daily',
  token TEXT UNIQUE NOT NULL, -- Unique invite link token
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined', 'expired')) DEFAULT 'pending',
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ
);

CREATE INDEX idx_collaboration_invitations_project ON collaboration_invitations(project_id);
CREATE INDEX idx_collaboration_invitations_token ON collaboration_invitations(token);
CREATE INDEX idx_collaboration_invitations_email ON collaboration_invitations(invitee_email);

-- =====================================================
-- 3. BILLING & SUBSCRIPTION TABLES
-- =====================================================

-- Collaboration Billing Plans
CREATE TABLE IF NOT EXISTS collaboration_billing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  member_count INT NOT NULL,
  monthly_price_usd DECIMAL(10, 2) NOT NULL,
  daily_price_usd DECIMAL(10, 2) DEFAULT 1.00,
  features JSONB DEFAULT '[]',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default pricing tiers
INSERT INTO collaboration_billing_plans (name, member_count, monthly_price_usd, daily_price_usd, features) VALUES
  ('Solo', 1, 17.99, 1.00, '["Basic collaboration", "1 project", "No video calls"]'),
  ('Duo', 2, 13.99, 1.00, '["2 team members", "3 projects", "Video calls", "Screen sharing"]'),
  ('Team', 4, 10.99, 1.00, '["4 team members", "10 projects", "Video calls", "Recording"]'),
  ('Enterprise', 10, 7.99, 1.00, '["10+ team members", "Unlimited projects", "Priority support", "Advanced analytics"]')
ON CONFLICT DO NOTHING;

-- Collaboration Subscriptions
CREATE TABLE IF NOT EXISTS collaboration_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES collaboration_projects(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL, -- Billing owner
  plan_id UUID REFERENCES collaboration_billing_plans(id),
  billing_cycle TEXT CHECK (billing_cycle IN ('daily', 'monthly')) DEFAULT 'monthly',
  status TEXT CHECK (status IN ('active', 'paused', 'cancelled', 'expired')) DEFAULT 'active',
  current_period_start TIMESTAMPTZ DEFAULT NOW(),
  current_period_end TIMESTAMPTZ,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_collaboration_subscriptions_project ON collaboration_subscriptions(project_id);
CREATE INDEX idx_collaboration_subscriptions_user ON collaboration_subscriptions(user_id);
CREATE INDEX idx_collaboration_subscriptions_status ON collaboration_subscriptions(status);

-- Collaboration Invoices
CREATE TABLE IF NOT EXISTS collaboration_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES collaboration_subscriptions(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  amount_usd DECIMAL(10, 2) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'paid', 'failed', 'refunded')) DEFAULT 'pending',
  billing_period_start TIMESTAMPTZ,
  billing_period_end TIMESTAMPTZ,
  stripe_invoice_id TEXT UNIQUE,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_collaboration_invoices_subscription ON collaboration_invoices(subscription_id);
CREATE INDEX idx_collaboration_invoices_user ON collaboration_invoices(user_id);
CREATE INDEX idx_collaboration_invoices_created ON collaboration_invoices(created_at DESC);

-- =====================================================
-- 4. AUDIT & ACTIVITY TABLES
-- =====================================================

-- Verification Audit Log
CREATE TABLE IF NOT EXISTS verification_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  action TEXT NOT NULL, -- initiated, completed, declined, re-verified
  verification_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_verification_audit_user ON verification_audit_log(user_id);
CREATE INDEX idx_verification_audit_created ON verification_audit_log(created_at DESC);

-- Collaboration Activity Log
CREATE TABLE IF NOT EXISTS collaboration_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES collaboration_projects(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL, -- file_created, file_updated, member_added, etc.
  entity_type TEXT, -- file, member, message, etc.
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_collaboration_activity_project ON collaboration_activity_log(project_id);
CREATE INDEX idx_collaboration_activity_created ON collaboration_activity_log(created_at DESC);

-- =====================================================
-- 5. FUNCTIONS & TRIGGERS
-- =====================================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_verifications_updated_at BEFORE UPDATE ON verifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trust_profiles_updated_at BEFORE UPDATE ON trust_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collaboration_projects_updated_at BEFORE UPDATE ON collaboration_projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collaboration_files_updated_at BEFORE UPDATE ON collaboration_files
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collaboration_subscriptions_updated_at BEFORE UPDATE ON collaboration_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function: Calculate trust score
CREATE OR REPLACE FUNCTION calculate_trust_score(p_user_id TEXT)
RETURNS TABLE (
  trust_score INT,
  tier TEXT
) AS $$
DECLARE
  v_verified BOOLEAN;
  v_risk_score INT;
  v_base_score INT;
  v_risk_adjustment INT;
  v_final_score INT;
  v_final_tier TEXT;
BEGIN
  -- Get verification status
  SELECT verified INTO v_verified
  FROM verifications
  WHERE user_id = p_user_id
  LIMIT 1;
  
  -- Get latest risk score
  SELECT risk_scores.risk_score INTO v_risk_score
  FROM risk_scores
  WHERE risk_scores.user_id = p_user_id
  ORDER BY timestamp DESC
  LIMIT 1;
  
  -- Calculate scores
  v_base_score := CASE WHEN COALESCE(v_verified, false) THEN 60 ELSE 0 END;
  v_risk_adjustment := GREATEST(0, 40 - COALESCE(v_risk_score, 50) / 2);
  v_final_score := v_base_score + v_risk_adjustment;
  
  -- Determine tier
  v_final_tier := CASE
    WHEN v_final_score >= 80 THEN 'verified_trusted'
    WHEN v_final_score >= 50 THEN 'standard_verified'
    ELSE 'unverified'
  END;
  
  RETURN QUERY SELECT v_final_score, v_final_tier;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on sensitive tables
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_files ENABLE ROW LEVEL SECURITY;

-- Verifications: Users can only see their own
CREATE POLICY "Users can view own verifications"
  ON verifications FOR SELECT
  USING (user_id = current_setting('app.current_user_id')::TEXT);

-- Trust Profiles: All can view, only system can update
CREATE POLICY "All can view trust profiles"
  ON trust_profiles FOR SELECT
  TO PUBLIC USING (true);

-- Collaboration Projects: Members can view
CREATE POLICY "Members can view projects"
  ON collaboration_projects FOR SELECT
  USING (
    owner_user_id = current_setting('app.current_user_id')::TEXT
    OR
    id IN (
      SELECT project_id FROM collaboration_members
      WHERE user_id = current_setting('app.current_user_id')::TEXT
      AND status = 'active'
    )
  );

-- Collaboration Members: Project members can view
CREATE POLICY "Project members can view members"
  ON collaboration_members FOR SELECT
  USING (
    user_id = current_setting('app.current_user_id')::TEXT
    OR
    project_id IN (
      SELECT project_id FROM collaboration_members AS cm
      WHERE cm.user_id = current_setting('app.current_user_id')::TEXT
      AND cm.status = 'active'
    )
  );

-- Collaboration Files: Project members can view/edit
CREATE POLICY "Project members can view files"
  ON collaboration_files FOR SELECT
  USING (
    project_id IN (
      SELECT project_id FROM collaboration_members
      WHERE user_id = current_setting('app.current_user_id')::TEXT
      AND status = 'active'
    )
  );

-- =====================================================
-- 7. VIEWS FOR COMMON QUERIES
-- =====================================================

-- View: Project members with trust scores
CREATE OR REPLACE VIEW project_members_with_trust AS
SELECT
  cm.project_id,
  cm.user_id,
  cm.role,
  cm.status,
  cm.billing_type,
  tp.trust_score,
  tp.tier,
  v.verified,
  cm.last_active
FROM collaboration_members cm
LEFT JOIN trust_profiles tp ON cm.user_id = tp.user_id
LEFT JOIN verifications v ON cm.user_id = v.user_id;

-- View: Project billing summary
CREATE OR REPLACE VIEW project_billing_summary AS
SELECT
  cp.id AS project_id,
  cp.name AS project_name,
  COUNT(cm.id) AS total_members,
  SUM(CASE WHEN cm.status = 'active' THEN 1 ELSE 0 END) AS active_members,
  cs.billing_cycle,
  bp.monthly_price_usd * COUNT(cm.id) FILTER (WHERE cm.status = 'active' AND cm.billing_type = 'monthly') AS estimated_monthly_cost,
  bp.daily_price_usd * COUNT(cm.id) FILTER (WHERE cm.status = 'active' AND cm.billing_type = 'daily') AS estimated_daily_cost
FROM collaboration_projects cp
LEFT JOIN collaboration_members cm ON cp.id = cm.project_id
LEFT JOIN collaboration_subscriptions cs ON cp.id = cs.project_id
LEFT JOIN collaboration_billing_plans bp ON cs.plan_id = bp.id
GROUP BY cp.id, cp.name, cs.billing_cycle, bp.monthly_price_usd, bp.daily_price_usd;

-- =====================================================
-- END OF SCHEMA
-- =====================================================

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
-- GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
