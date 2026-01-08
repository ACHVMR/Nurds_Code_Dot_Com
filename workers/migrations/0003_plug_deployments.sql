-- ============================================
-- Migration 0003: Plug Deployments
-- ============================================
-- Supports Hybrid Plug deployment system
-- Edge/Cloud/Hybrid/Self-Hosted modes

-- Plug deployments table
CREATE TABLE IF NOT EXISTS plug_deployments (
  id TEXT PRIMARY KEY,
  template_id TEXT NOT NULL,
  name TEXT NOT NULL,
  mode TEXT NOT NULL CHECK(mode IN ('edge', 'cloud', 'hybrid', 'self-hosted')),
  config TEXT DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'deploying', 'active', 'paused', 'failed')),
  user_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Plug executions tracking
CREATE TABLE IF NOT EXISTS plug_executions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plug_id TEXT NOT NULL,
  input_size INTEGER DEFAULT 0,
  output_size INTEGER DEFAULT 0,
  latency_ms INTEGER DEFAULT 0,
  cost_usd REAL DEFAULT 0,
  status TEXT DEFAULT 'completed',
  error TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (plug_id) REFERENCES plug_deployments(id)
);

-- Plug templates (for custom templates)
CREATE TABLE IF NOT EXISTS plug_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  agents TEXT NOT NULL, -- JSON array of agent types
  default_model TEXT,
  config TEXT DEFAULT '{}',
  is_public BOOLEAN DEFAULT 0,
  author_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_plug_deployments_user ON plug_deployments(user_id);
CREATE INDEX IF NOT EXISTS idx_plug_deployments_status ON plug_deployments(status);
CREATE INDEX IF NOT EXISTS idx_plug_deployments_mode ON plug_deployments(mode);
CREATE INDEX IF NOT EXISTS idx_plug_executions_plug ON plug_executions(plug_id);
CREATE INDEX IF NOT EXISTS idx_plug_executions_created ON plug_executions(created_at);
CREATE INDEX IF NOT EXISTS idx_plug_templates_public ON plug_templates(is_public);
