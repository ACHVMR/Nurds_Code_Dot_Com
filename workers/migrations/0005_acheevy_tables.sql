-- ============================================
-- ACHEEVY II-Agent Tables Migration
-- ============================================
-- Run with: npx wrangler d1 execute nurdscode-db --file=workers/migrations/0005_acheevy_tables.sql --remote

-- Agent Configurations (per-user customization)
CREATE TABLE IF NOT EXISTS agent_configs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    agent_id TEXT NOT NULL,
    model TEXT,
    enabled INTEGER DEFAULT 1,
    custom_prompt TEXT,
    timeout INTEGER DEFAULT 30000,
    memory_limit INTEGER DEFAULT 512,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, agent_id)
);

CREATE INDEX IF NOT EXISTS idx_agent_configs_user ON agent_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_configs_agent ON agent_configs(agent_id);

-- KingMode Execution History
CREATE TABLE IF NOT EXISTS kingmode_executions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    task TEXT NOT NULL,
    strategy TEXT NOT NULL DEFAULT 'STANDARD',
    status TEXT NOT NULL DEFAULT 'pending',
    result TEXT,
    error TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    completed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_kingmode_user ON kingmode_executions(user_id);
CREATE INDEX IF NOT EXISTS idx_kingmode_status ON kingmode_executions(status);

-- Workflow Executions
CREATE TABLE IF NOT EXISTS workflow_executions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    agents TEXT NOT NULL,
    task TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    result TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    completed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_workflow_user ON workflow_executions(user_id);

-- Workflow Templates (saved pipelines)
CREATE TABLE IF NOT EXISTS workflow_templates (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    agents TEXT NOT NULL,
    is_public INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_templates_user ON workflow_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_templates_public ON workflow_templates(is_public);

-- Agent Metrics (usage tracking)
CREATE TABLE IF NOT EXISTS agent_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    agent_id TEXT NOT NULL,
    tokens_used INTEGER DEFAULT 0,
    latency_ms INTEGER DEFAULT 0,
    success INTEGER DEFAULT 1,
    execution_id TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_metrics_user ON agent_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_metrics_agent ON agent_metrics(agent_id);
CREATE INDEX IF NOT EXISTS idx_metrics_created ON agent_metrics(created_at);
