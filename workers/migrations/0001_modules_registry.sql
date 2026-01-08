-- ============================================
-- Nurds Code - Cloudflare D1 Module Registry
-- Migration: 0001_modules_registry.sql
-- ============================================

-- 1. Modules Registry (The Catalog)
CREATE TABLE IF NOT EXISTS modules (
  id TEXT PRIMARY KEY,                 -- e.g., 'boomer_ang', 'vibe_ide'
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  version TEXT DEFAULT '1.0.0',
  is_standalone BOOLEAN DEFAULT FALSE, -- Can be deployed separately?
  unlock_cost_credits INTEGER DEFAULT 0,
  min_level_required INTEGER DEFAULT 1,
  route_path TEXT NOT NULL,            -- e.g., '/api/v1/boomer'
  category TEXT DEFAULT 'core',        -- 'core', 'agent', 'tool', 'integration'
  is_active BOOLEAN DEFAULT TRUE,
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- 2. User Entitlements (Who owns what)
CREATE TABLE IF NOT EXISTS user_module_access (
  user_id TEXT NOT NULL,
  module_id TEXT NOT NULL,
  status TEXT DEFAULT 'active',        -- 'active', 'suspended', 'expired'
  unlocked_at INTEGER DEFAULT (strftime('%s', 'now')),
  expires_at INTEGER,                  -- NULL = lifetime
  unlock_method TEXT DEFAULT 'purchase', -- 'purchase', 'progression', 'admin', 'trial'
  PRIMARY KEY (user_id, module_id),
  FOREIGN KEY (module_id) REFERENCES modules(id)
);

-- 3. User Progression (Gamification State)
CREATE TABLE IF NOT EXISTS user_progression (
  user_id TEXT PRIMARY KEY,
  current_level INTEGER DEFAULT 1,
  current_xp INTEGER DEFAULT 0,
  total_hours REAL DEFAULT 0,
  badges TEXT,                         -- JSON string of badge IDs
  credits_balance INTEGER DEFAULT 100, -- Start with 100 free credits
  tier TEXT DEFAULT 'free',            -- 'free', 'starter', 'pro', 'enterprise'
  last_updated INTEGER DEFAULT (strftime('%s', 'now'))
);

-- 4. Module Prerequisites (Dependencies)
CREATE TABLE IF NOT EXISTS module_prerequisites (
  module_id TEXT NOT NULL,
  required_module_id TEXT NOT NULL,
  PRIMARY KEY (module_id, required_module_id),
  FOREIGN KEY (module_id) REFERENCES modules(id),
  FOREIGN KEY (required_module_id) REFERENCES modules(id)
);

-- 5. Module Usage Tracking
CREATE TABLE IF NOT EXISTS module_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  module_id TEXT NOT NULL,
  action TEXT NOT NULL,                -- 'execute', 'view', 'error'
  tokens_used INTEGER DEFAULT 0,
  cost_credits REAL DEFAULT 0,
  latency_ms INTEGER,
  model_used TEXT,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (module_id) REFERENCES modules(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_module_access_user ON user_module_access(user_id);
CREATE INDEX IF NOT EXISTS idx_module_usage_user ON module_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_module_usage_module ON module_usage(module_id);
CREATE INDEX IF NOT EXISTS idx_module_usage_created ON module_usage(created_at);

-- ============================================
-- Seed Data: The 5 Core Plugs + II-Agents
-- ============================================

INSERT OR REPLACE INTO modules (id, name, description, icon_url, route_path, min_level_required, unlock_cost_credits, category, is_standalone) VALUES
-- Core Plugs (User-Facing Tools)
('boomer_ang', 'Boomer_Ang', 'AI Agent Orchestrator - Build and deploy intelligent agents', '/assets/branding/icons/boomer.png', '/api/v1/boomer', 1, 0, 'core', TRUE),
('vibe_ide', 'V.I.B.E. IDE', 'Vibe-driven Code Generation Engine with live preview', '/assets/branding/icons/vibe.png', '/api/v1/vibe', 2, 50, 'core', TRUE),
('circuit_box', 'Circuit Box', 'Analytics Dashboard & Cost Metrics', '/assets/branding/icons/circuit.png', '/api/v1/circuit', 3, 100, 'core', TRUE),
('grounding', 'Grounding Engine', 'RAG & Knowledge Base with semantic search', '/assets/branding/icons/grounding.png', '/api/v1/grounding', 3, 100, 'core', TRUE),
('voice_studio', 'Voice Studio', 'TTS & STT Pipeline with ElevenLabs + Deepgram', '/assets/branding/icons/voice.png', '/api/v1/voice', 4, 150, 'core', TRUE),

-- II-Agent Workers (Backend Services)
('ii_nlu', 'II-NLU Agent', 'Natural Language Understanding & Intent Classification', '/assets/branding/icons/ii-nlu.png', '/api/v1/agents/nlu', 2, 25, 'agent', FALSE),
('ii_codegen', 'II-Codegen Agent', 'Advanced Code Generation with multi-language support', '/assets/branding/icons/ii-codegen.png', '/api/v1/agents/codegen', 2, 50, 'agent', FALSE),
('ii_research', 'II-Research Agent', 'Web research and synthesis', '/assets/branding/icons/ii-research.png', '/api/v1/agents/research', 3, 50, 'agent', FALSE),
('ii_security', 'II-Security Agent', 'Code security analysis and vulnerability scanning', '/assets/branding/icons/ii-security.png', '/api/v1/agents/security', 4, 75, 'agent', FALSE),
('ii_validation', 'II-Validation Agent', 'Code validation and testing', '/assets/branding/icons/ii-validation.png', '/api/v1/agents/validation', 3, 50, 'agent', FALSE),

-- Integration Plugs
('plus1', 'Plus+1 Collaboration', 'Real-time team collaboration and code sharing', '/assets/branding/icons/plus1.png', '/api/v1/plus1', 2, 75, 'integration', TRUE),
('kie_vision', 'Kie.ai Vision', 'Image and video generation', '/assets/branding/icons/kie.png', '/api/v1/kie', 3, 100, 'integration', FALSE);

-- Module Prerequisites
INSERT OR REPLACE INTO module_prerequisites (module_id, required_module_id) VALUES
('vibe_ide', 'boomer_ang'),
('circuit_box', 'boomer_ang'),
('grounding', 'boomer_ang'),
('voice_studio', 'boomer_ang'),
('ii_codegen', 'ii_nlu'),
('ii_research', 'ii_nlu'),
('ii_security', 'ii_codegen'),
('ii_validation', 'ii_codegen');
