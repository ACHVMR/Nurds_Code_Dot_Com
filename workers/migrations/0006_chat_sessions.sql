-- ============================================
-- Chat w/ACHEEVY Session Tables
-- Migration: 0006_chat_sessions.sql
-- ============================================

-- Chat sessions for conversation history
CREATE TABLE IF NOT EXISTS chat_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  mode TEXT NOT NULL CHECK(mode IN ('brainstorm', 'forming', 'agent')),
  agent_level TEXT DEFAULT 'standard' CHECK(agent_level IN ('standard', 'swarm', 'king')),
  message TEXT NOT NULL,
  response TEXT,
  tokens_used INTEGER DEFAULT 0,
  cost REAL DEFAULT 0,
  circuit_box TEXT, -- JSON array of enabled tools
  created_at TEXT DEFAULT (datetime('now'))
);

-- Indexes for chat sessions
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_session ON chat_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created ON chat_sessions(created_at DESC);

-- Task executions for agent mode
CREATE TABLE IF NOT EXISTS task_executions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  manifest TEXT NOT NULL, -- JSON manifest
  agent_level TEXT DEFAULT 'standard' CHECK(agent_level IN ('standard', 'swarm', 'king')),
  is_king_mode INTEGER DEFAULT 0,
  circuit_box TEXT, -- JSON array of enabled tools
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  result TEXT, -- JSON result
  tokens_used INTEGER DEFAULT 0,
  cost REAL DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  completed_at TEXT
);

-- Indexes for task executions
CREATE INDEX IF NOT EXISTS idx_task_executions_user ON task_executions(user_id);
CREATE INDEX IF NOT EXISTS idx_task_executions_status ON task_executions(status);
CREATE INDEX IF NOT EXISTS idx_task_executions_created ON task_executions(created_at DESC);

-- Crown gate results for King Mode executions
CREATE TABLE IF NOT EXISTS crown_gate_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  execution_id TEXT NOT NULL,
  gate_number INTEGER NOT NULL CHECK(gate_number BETWEEN 1 AND 9),
  gate_name TEXT NOT NULL,
  passed INTEGER DEFAULT 0,
  evidence TEXT, -- JSON evidence bundle
  checked_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (execution_id) REFERENCES task_executions(id) ON DELETE CASCADE
);

-- Index for crown gates
CREATE INDEX IF NOT EXISTS idx_crown_gates_execution ON crown_gate_results(execution_id);

-- Proof bundles for completed executions
CREATE TABLE IF NOT EXISTS proof_bundles (
  id TEXT PRIMARY KEY,
  execution_id TEXT NOT NULL,
  tier TEXT DEFAULT 'light' CHECK(tier IN ('light', 'standard', 'full')),
  spec_hash TEXT,
  code_hash TEXT,
  test_results TEXT, -- JSON
  verification_summary TEXT,
  kyb_ledger_entry TEXT, -- JSON
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (execution_id) REFERENCES task_executions(id) ON DELETE CASCADE
);

-- Index for proof bundles
CREATE INDEX IF NOT EXISTS idx_proof_bundles_execution ON proof_bundles(execution_id);
