-- ============================================
-- Migration: 0008_orchestrator_v2.sql
-- Purpose: v2 orchestration tables (circuit box + task/workflow telemetry)
-- ============================================

-- Circuit Box plug configuration (per user/session)
CREATE TABLE IF NOT EXISTS circuit_plugs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  session_id TEXT,
  plug_id TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 0,
  config TEXT DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT,
  CONSTRAINT valid_plug CHECK (plug_id IN ('elevenlabs', 'twelvelabs', 'sam', 'higgsfield')),
  CONSTRAINT valid_enabled CHECK (enabled IN (0, 1)),
  FOREIGN KEY (session_id) REFERENCES orchestrator_sessions(session_id)
);

-- High-level tasks executed in the v2 workflow (backed by orchestrator sessions)
CREATE TABLE IF NOT EXISTS agent_tasks_v2 (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  mode TEXT NOT NULL,
  agent_level TEXT NOT NULL DEFAULT 'standard',
  task TEXT NOT NULL,
  input TEXT,
  output TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  error TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT,
  FOREIGN KEY (session_id) REFERENCES orchestrator_sessions(session_id),
  CONSTRAINT valid_mode CHECK (mode IN ('brainstorm', 'forming', 'agent', 'edit')),
  CONSTRAINT valid_agent_level CHECK (agent_level IN ('standard', 'swarm', 'king')),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'running', 'success', 'failed'))
);

-- Per-model usage telemetry for each task
CREATE TABLE IF NOT EXISTS model_usage_v2 (
  id TEXT PRIMARY KEY,
  session_id TEXT,
  task_id TEXT,
  model TEXT NOT NULL,
  input_tokens INTEGER,
  output_tokens INTEGER,
  cost_usd REAL,
  latency_ms INTEGER,
  created_at TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES orchestrator_sessions(session_id),
  FOREIGN KEY (task_id) REFERENCES agent_tasks_v2(id)
);

-- Step-level workflow trace for each task
CREATE TABLE IF NOT EXISTS workflow_steps_v2 (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  step_index INTEGER NOT NULL,
  step_type TEXT,
  agent_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  input TEXT,
  output TEXT,
  error TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT,
  FOREIGN KEY (task_id) REFERENCES agent_tasks_v2(id),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'running', 'success', 'failed'))
);

-- KingMode context storage (phase + serialized context)
CREATE TABLE IF NOT EXISTS kingmode_context (
  id TEXT PRIMARY KEY,
  session_id TEXT,
  user_id TEXT NOT NULL,
  phase TEXT NOT NULL,
  context TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT,
  FOREIGN KEY (session_id) REFERENCES orchestrator_sessions(session_id),
  CONSTRAINT valid_phase CHECK (phase IN ('BRAINSTORM', 'FORMING', 'AGENT', 'EDIT'))
);

-- Session artifacts (references to external storage or inline blobs)
CREATE TABLE IF NOT EXISTS session_artifacts (
  id TEXT PRIMARY KEY,
  session_id TEXT,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'json',
  content_ref TEXT,
  content TEXT,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES orchestrator_sessions(session_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_circuit_plugs_user ON circuit_plugs(user_id);
CREATE INDEX IF NOT EXISTS idx_circuit_plugs_session ON circuit_plugs(session_id);
CREATE INDEX IF NOT EXISTS idx_circuit_plugs_plug ON circuit_plugs(plug_id);

CREATE INDEX IF NOT EXISTS idx_agent_tasks_v2_session ON agent_tasks_v2(session_id);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_v2_user ON agent_tasks_v2(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_v2_status ON agent_tasks_v2(status);

CREATE INDEX IF NOT EXISTS idx_model_usage_v2_session ON model_usage_v2(session_id);
CREATE INDEX IF NOT EXISTS idx_model_usage_v2_task ON model_usage_v2(task_id);
CREATE INDEX IF NOT EXISTS idx_model_usage_v2_model ON model_usage_v2(model);

CREATE INDEX IF NOT EXISTS idx_workflow_steps_v2_task ON workflow_steps_v2(task_id);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_v2_status ON workflow_steps_v2(status);

CREATE INDEX IF NOT EXISTS idx_kingmode_context_session ON kingmode_context(session_id);
CREATE INDEX IF NOT EXISTS idx_kingmode_context_user ON kingmode_context(user_id);
CREATE INDEX IF NOT EXISTS idx_session_artifacts_session ON session_artifacts(session_id);
CREATE INDEX IF NOT EXISTS idx_session_artifacts_user ON session_artifacts(user_id);
