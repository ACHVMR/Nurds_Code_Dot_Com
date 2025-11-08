-- =====================================================
-- MIGRATION 0007: Deploy Platform Connections
-- =====================================================
-- Created: November 3, 2025
-- Purpose: Track connections between Nurds Code and Deploy platform
-- Repository: https://github.com/ACHVMR/DEPLOY.git
-- =====================================================

CREATE TABLE IF NOT EXISTS deploy_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL, -- Clerk user ID
    project_id UUID NOT NULL, -- Nurds Code project ID
    
    -- Deploy platform details
    deploy_project_id TEXT NOT NULL, -- Deploy platform project ID
    deploy_url TEXT NOT NULL, -- Deploy project URL (e.g., https://deploy.nurdscode.com/project/123)
    deploy_api_key TEXT, -- Encrypted API key for this connection
    deploy_repo_url TEXT DEFAULT 'https://github.com/ACHVMR/DEPLOY.git',
    
    -- Connection metadata
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'disconnected', 'error')),
    last_synced_at TIMESTAMPTZ,
    sync_errors INTEGER DEFAULT 0,
    last_error_message TEXT,
    
    -- Charter tracking (blockchain logging)
    charter_generated BOOLEAN DEFAULT false,
    charter_url TEXT,
    charter_hash TEXT, -- Blockchain hash for immutable record
    charter_generated_at TIMESTAMPTZ,
    
    -- Project metadata from Deploy
    deploy_status TEXT, -- 'pending', 'building', 'deployed', 'failed'
    deploy_live_url TEXT, -- Live deployment URL
    last_build_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(project_id, deploy_project_id)
);

-- Indexes for performance
CREATE INDEX idx_deploy_connections_user_id ON deploy_connections(user_id);
CREATE INDEX idx_deploy_connections_project_id ON deploy_connections(project_id);
CREATE INDEX idx_deploy_connections_status ON deploy_connections(status);
CREATE INDEX idx_deploy_connections_deploy_status ON deploy_connections(deploy_status);
CREATE INDEX idx_deploy_connections_created_at ON deploy_connections(created_at DESC);

-- Enable RLS
ALTER TABLE deploy_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own connections
CREATE POLICY deploy_connections_select_policy ON deploy_connections 
FOR SELECT USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY deploy_connections_insert_policy ON deploy_connections 
FOR INSERT WITH CHECK (user_id = current_setting('app.current_user_id', true));

CREATE POLICY deploy_connections_update_policy ON deploy_connections 
FOR UPDATE USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY deploy_connections_delete_policy ON deploy_connections 
FOR DELETE USING (user_id = current_setting('app.current_user_id', true));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_deploy_connections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_deploy_connections_timestamp
BEFORE UPDATE ON deploy_connections
FOR EACH ROW
EXECUTE FUNCTION update_deploy_connections_updated_at();

-- Comments for documentation
COMMENT ON TABLE deploy_connections IS 'Tracks connections between Nurds Code projects and Deploy platform';
COMMENT ON COLUMN deploy_connections.charter_hash IS 'Blockchain hash for immutable charter record';
COMMENT ON COLUMN deploy_connections.deploy_repo_url IS 'Deploy platform repository: https://github.com/ACHVMR/DEPLOY.git';
