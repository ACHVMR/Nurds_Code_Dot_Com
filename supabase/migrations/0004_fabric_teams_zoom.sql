-- =====================================================
-- Microsoft Fabric + Teams + Zoom Integration Schema
-- =====================================================

-- Add tier column to users table if not exists
ALTER TABLE users ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'enterprise'));

-- Create index on tier for faster queries
CREATE INDEX IF NOT EXISTS idx_users_tier ON users(tier);

-- =====================================================
-- Meeting Logs Table
-- =====================================================
CREATE TABLE IF NOT EXISTS meeting_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    meeting_number TEXT NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('zoom', 'teams')),
    role TEXT NOT NULL CHECK (role IN ('participant', 'host', 'organizer')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    duration_minutes INTEGER,
    participant_count INTEGER DEFAULT 1,
    recording_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for meeting logs
CREATE INDEX IF NOT EXISTS idx_meeting_logs_user_id ON meeting_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_meeting_logs_platform ON meeting_logs(platform);
CREATE INDEX IF NOT EXISTS idx_meeting_logs_started_at ON meeting_logs(started_at DESC);

-- =====================================================
-- Power BI Embed Tokens Table
-- =====================================================
CREATE TABLE IF NOT EXISTS powerbi_embed_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    token TEXT NOT NULL,
    report_id TEXT,
    workspace_id TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for embed tokens
CREATE INDEX IF NOT EXISTS idx_powerbi_tokens_user_id ON powerbi_embed_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_powerbi_tokens_expires_at ON powerbi_embed_tokens(expires_at);

-- Auto-delete expired tokens (cleanup job)
CREATE OR REPLACE FUNCTION cleanup_expired_powerbi_tokens()
RETURNS void AS $$
BEGIN
    DELETE FROM powerbi_embed_tokens WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Fabric Sync Status Table
-- =====================================================
CREATE TABLE IF NOT EXISTS fabric_sync_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sync_type TEXT NOT NULL CHECK (sync_type IN ('analytics_usage', 'analytics_sales', 'analytics_engagement', 'meeting_logs', 'full_sync')),
    last_sync_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'in_progress')),
    records_synced INTEGER DEFAULT 0,
    error_message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for sync status
CREATE INDEX IF NOT EXISTS idx_fabric_sync_type ON fabric_sync_status(sync_type);
CREATE INDEX IF NOT EXISTS idx_fabric_sync_last_sync ON fabric_sync_status(last_sync_at DESC);

-- =====================================================
-- Analytics Views for Fabric Integration
-- =====================================================

-- View: Analytics Usage (Session activity by user/day)
CREATE OR REPLACE VIEW analytics_usage AS
SELECT
    u.id AS user_id,
    u.email,
    u.tier,
    DATE(l.created_at) AS activity_date,
    COUNT(DISTINCT l.id) AS session_count,
    SUM(l.duration_minutes) AS total_duration_minutes,
    MAX(l.created_at) AS last_activity
FROM users u
LEFT JOIN meeting_logs l ON u.id = l.user_id
GROUP BY u.id, u.email, u.tier, DATE(l.created_at);

-- View: Analytics Sales (Revenue by user/month - placeholder for Stripe integration)
CREATE OR REPLACE VIEW analytics_sales AS
SELECT
    u.id AS user_id,
    u.email,
    u.tier,
    DATE_TRUNC('month', u.created_at) AS month,
    CASE 
        WHEN u.tier = 'pro' THEN 29.99
        WHEN u.tier = 'enterprise' THEN 5000.00
        ELSE 0
    END AS monthly_revenue,
    1 AS transaction_count
FROM users u
WHERE u.tier != 'free';

-- View: Analytics Engagement (Activity by project/action/day)
CREATE OR REPLACE VIEW analytics_engagement AS
SELECT
    cp.id AS project_id,
    cp.name AS project_name,
    cp.owner_user_id,
    DATE(cf.updated_at) AS activity_date,
    COUNT(DISTINCT cf.id) AS file_edit_count,
    COUNT(DISTINCT cm.user_id) AS active_members
FROM collaboration_projects cp
LEFT JOIN collaboration_files cf ON cp.id = cf.project_id
LEFT JOIN collaboration_members cm ON cp.id = cm.project_id
WHERE cm.status = 'active'
GROUP BY cp.id, cp.name, cp.owner_user_id, DATE(cf.updated_at);

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE meeting_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE powerbi_embed_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE fabric_sync_status ENABLE ROW LEVEL SECURITY;

-- Meeting logs: Users can only see their own meetings
CREATE POLICY meeting_logs_user_select ON meeting_logs
    FOR SELECT
    USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Meeting logs: Users can insert their own meetings
CREATE POLICY meeting_logs_user_insert ON meeting_logs
    FOR INSERT
    WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Power BI tokens: Users can only see their own tokens
CREATE POLICY powerbi_tokens_user_select ON powerbi_embed_tokens
    FOR SELECT
    USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Fabric sync status: Superadmins only
CREATE POLICY fabric_sync_superadmin_select ON fabric_sync_status
    FOR SELECT
    USING (
        current_setting('request.jwt.claims', true)::json->>'role' = 'superadmin'
        OR current_setting('request.jwt.claims', true)::json->>'email' IN (
            SELECT unnest(string_to_array(current_setting('app.admin_emails', true), ','))
        )
    );

-- =====================================================
-- Grant Permissions
-- =====================================================

-- Grant access to authenticated users
GRANT SELECT, INSERT ON meeting_logs TO authenticated;
GRANT SELECT ON powerbi_embed_tokens TO authenticated;
GRANT SELECT ON analytics_usage TO authenticated;
GRANT SELECT ON analytics_sales TO authenticated;
GRANT SELECT ON analytics_engagement TO authenticated;

-- Grant access to service role for sync operations
GRANT ALL ON meeting_logs TO service_role;
GRANT ALL ON powerbi_embed_tokens TO service_role;
GRANT ALL ON fabric_sync_status TO service_role;

-- =====================================================
-- Comments for Documentation
-- =====================================================

COMMENT ON TABLE meeting_logs IS 'Tracks all Zoom and Teams meeting sessions with user participation details';
COMMENT ON TABLE powerbi_embed_tokens IS 'Stores Power BI embed tokens with expiration for secure dashboard access';
COMMENT ON TABLE fabric_sync_status IS 'Monitors Azure Data Factory sync operations from Supabase to Fabric OneLake';
COMMENT ON VIEW analytics_usage IS 'Session activity metrics for Power BI dashboards (user/tier/day aggregation)';
COMMENT ON VIEW analytics_sales IS 'Revenue and transaction metrics for Power BI dashboards (user/tier/month)';
COMMENT ON VIEW analytics_engagement IS 'Collaboration activity metrics for Power BI dashboards (project/day)';

-- =====================================================
-- Migration Complete
-- =====================================================
