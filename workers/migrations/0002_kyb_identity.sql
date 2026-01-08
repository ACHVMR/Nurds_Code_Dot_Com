-- ============================================
-- Nurds Code - KYB (Know Your Bot) Tables
-- Migration: 0002_kyb_identity.sql
-- ============================================

-- Flight Recorder (Tamper-Evident Agent Activity Log)
CREATE TABLE IF NOT EXISTS agent_flight_recorder (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  phase TEXT,                          -- FOSTER/DEVELOP/HONE
  action TEXT,                         -- What was done
  iterations INTEGER DEFAULT 0,
  verification TEXT,                   -- JSON: tests passed, coverage, etc.
  metrics TEXT,                        -- JSON: latency, tokens, cost
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Anchor Chains (Blockchain Proof of Quality)
CREATE TABLE IF NOT EXISTS anchor_chains (
  session_id TEXT PRIMARY KEY,
  merkle_root TEXT NOT NULL,
  validations TEXT,                    -- JSON: proof of quality, compliance, etc.
  blockchain_tx TEXT,                  -- Transaction hash if anchored
  chain TEXT,                          -- e.g., 'polygon-mainnet'
  created_at TEXT NOT NULL,
  anchored_at TEXT
);

-- Agent Instances (Runtime Agent State)
CREATE TABLE IF NOT EXISTS agent_instances (
  id TEXT PRIMARY KEY,                 -- Instance ID
  agent_id TEXT NOT NULL,              -- Registry ID (e.g., 'code_ang')
  session_id TEXT NOT NULL,
  status TEXT DEFAULT 'ready',         -- ready/working/complete/error
  progress INTEGER DEFAULT 0,
  current_task TEXT,
  last_activity INTEGER,
  metadata TEXT,                       -- JSON: additional context
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- KingMode Sessions
CREATE TABLE IF NOT EXISTS kingmode_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  phase TEXT DEFAULT 'BRAINSTORM',     -- BRAINSTORM/FORMING/AGENT
  strategy TEXT,                       -- STANDARD/SWARM/KING
  brainstorm_data TEXT,                -- JSON
  forming_data TEXT,                   -- JSON
  execution_data TEXT,                 -- JSON
  gates TEXT,                          -- JSON: completion gates status
  estimated_tokens INTEGER DEFAULT 0,
  skill_level INTEGER DEFAULT 0,
  started_at INTEGER DEFAULT (strftime('%s', 'now')),
  completed_at INTEGER,
  status TEXT DEFAULT 'active'         -- active/completed/abandoned
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_flight_recorder_agent ON agent_flight_recorder(agent_id);
CREATE INDEX IF NOT EXISTS idx_flight_recorder_session ON agent_flight_recorder(session_id);
CREATE INDEX IF NOT EXISTS idx_flight_recorder_timestamp ON agent_flight_recorder(timestamp);
CREATE INDEX IF NOT EXISTS idx_agent_instances_session ON agent_instances(session_id);
CREATE INDEX IF NOT EXISTS idx_kingmode_sessions_user ON kingmode_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_kingmode_sessions_status ON kingmode_sessions(status);
