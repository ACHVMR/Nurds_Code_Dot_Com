-- KingMode v2.0: Enhanced Orchestrator Tables
-- Modes: brainstorm | nurdout | agent | edit
-- Light Core (Cloudflare D1) + Heavy Swarm (GCP Cloud Run)

-- Circuit Box: Per-user plug toggles
CREATE TABLE IF NOT EXISTS circuit_plugs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  plug_name TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 0,
  config TEXT,
  updated_at INTEGER DEFAULT (strftime('%s', 'now')),
  UNIQUE(user_id, plug_name)
);

CREATE INDEX IF NOT EXISTS idx_plugs_user ON circuit_plugs(user_id);
CREATE INDEX IF NOT EXISTS idx_plugs_enabled ON circuit_plugs(enabled);

-- Agent Tasks: Track II-Agent swarm coordination
CREATE TABLE IF NOT EXISTS agent_tasks_v2 (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  task_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('pending', 'running', 'completed', 'failed')),
  input TEXT,
  output TEXT,
  started_at INTEGER,
  completed_at INTEGER,
  cloud_run_url TEXT,
  error TEXT,
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_tasks_v2_session ON agent_tasks_v2(session_id);
CREATE INDEX IF NOT EXISTS idx_tasks_v2_status ON agent_tasks_v2(status);
CREATE INDEX IF NOT EXISTS idx_tasks_v2_agent ON agent_tasks_v2(agent_name);

-- Model Usage: Cost tracking and analytics
CREATE TABLE IF NOT EXISTS model_usage_v2 (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  model_name TEXT NOT NULL,
  provider TEXT NOT NULL,
  mode TEXT NOT NULL,
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  latency_ms INTEGER,
  cost_cents INTEGER DEFAULT 0,
  cached INTEGER DEFAULT 0,
  timestamp INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_usage_v2_session ON model_usage_v2(session_id);
CREATE INDEX IF NOT EXISTS idx_usage_v2_model ON model_usage_v2(model_name);
CREATE INDEX IF NOT EXISTS idx_usage_v2_timestamp ON model_usage_v2(timestamp);

-- Workflow Steps: ORACLE Framework tracking
CREATE TABLE IF NOT EXISTS workflow_steps_v2 (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  step_number INTEGER NOT NULL,
  step_name TEXT NOT NULL,
  mode TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('pending', 'active', 'completed', 'skipped', 'failed')),
  artifacts TEXT,
  reasoning TEXT,
  started_at INTEGER,
  completed_at INTEGER,
  UNIQUE(session_id, step_number)
);

CREATE INDEX IF NOT EXISTS idx_steps_v2_session ON workflow_steps_v2(session_id);
CREATE INDEX IF NOT EXISTS idx_steps_v2_status ON workflow_steps_v2(status);

-- KingMode Context: Project memory and vibe
CREATE TABLE IF NOT EXISTS kingmode_context (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  project_name TEXT NOT NULL,
  vibe_description TEXT,
  tech_stack TEXT,
  goals TEXT,
  constraints TEXT,
  memory_context TEXT,
  symbioism_graph_id TEXT,
  updated_at INTEGER DEFAULT (strftime('%s', 'now')),
  UNIQUE(user_id, project_name)
);

CREATE INDEX IF NOT EXISTS idx_context_user ON kingmode_context(user_id);
CREATE INDEX IF NOT EXISTS idx_context_updated ON kingmode_context(updated_at);

-- Session Artifacts: Generated code, designs, research
CREATE TABLE IF NOT EXISTS session_artifacts (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  artifact_type TEXT NOT NULL,
  name TEXT NOT NULL,
  content TEXT,
  metadata TEXT,
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_artifacts_session ON session_artifacts(session_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_type ON session_artifacts(artifact_type);
