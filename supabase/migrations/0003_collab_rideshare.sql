-- ================================================
-- COLLABORATION SCHEMA EXTENSION (Rideshare Model)
-- ================================================
-- Add to existing Supabase schema for collaboration features
-- Run after 0001_init.sql and 0002_policies.sql

-- ================================================
-- COLLAB_SESSIONS TABLE
-- ================================================
-- Tracks active collaboration sessions with payment details
CREATE TABLE IF NOT EXISTS collab_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  host_id TEXT NOT NULL,
  session_name VARCHAR(255),
  session_token TEXT UNIQUE NOT NULL,
  video_room_url TEXT,
  yjs_doc_id TEXT UNIQUE NOT NULL,
  active_participants INTEGER DEFAULT 1,
  max_participants INTEGER DEFAULT 5,
  
  -- Pricing model: 'host_pays', 'split_equally', 'custom_split'
  pricing_model VARCHAR(50) DEFAULT 'host_pays',
  cost_per_collaborator DECIMAL(10,2) DEFAULT 1.00,
  
  -- Session timing
  session_start TIMESTAMP DEFAULT NOW(),
  session_end TIMESTAMP,
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'paused', 'ended'
  
  -- Metadata: editor settings, theme, language
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_collab_sessions_host ON collab_sessions(host_id);
CREATE INDEX idx_collab_sessions_token ON collab_sessions(session_token);
CREATE INDEX idx_collab_sessions_status ON collab_sessions(status);
CREATE INDEX idx_collab_sessions_tenant ON collab_sessions(tenant_id);

-- Automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_collab_session_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_collab_session_timestamp
BEFORE UPDATE ON collab_sessions
FOR EACH ROW
EXECUTE FUNCTION update_collab_session_timestamp();

-- ================================================
-- COLLAB_PARTICIPANTS TABLE
-- ================================================
-- Tracks users in each session with payment status
CREATE TABLE IF NOT EXISTS collab_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES collab_sessions(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name VARCHAR(255),
  
  -- Role: 'host', 'collaborator', 'viewer'
  role VARCHAR(50) DEFAULT 'collaborator',
  
  -- Presence tracking
  joined_at TIMESTAMP DEFAULT NOW(),
  left_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  last_activity TIMESTAMP DEFAULT NOW(),
  
  -- Cursor position for real-time tracking
  cursor_position JSONB DEFAULT '{"line": 0, "column": 0}',
  
  -- Payment details
  payment_share DECIMAL(10,2) DEFAULT 1.00,
  payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid', 'refunded'
  
  metadata JSONB DEFAULT '{}'
);

-- Indexes
CREATE INDEX idx_collab_participants_session ON collab_participants(session_id);
CREATE INDEX idx_collab_participants_user ON collab_participants(user_id);
CREATE INDEX idx_collab_participants_active ON collab_participants(is_active);
CREATE INDEX idx_collab_participants_status ON collab_participants(payment_status);

-- ================================================
-- COLLAB_PAYMENTS TABLE
-- ================================================
-- Tracks all payments for collaboration sessions
CREATE TABLE IF NOT EXISTS collab_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES collab_sessions(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  
  -- Payment type: 'daily', 'prepay_7', 'prepay_30', 'bundle'
  payment_type VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  days_purchased INTEGER DEFAULT 1,
  
  -- Payment timing
  payment_date TIMESTAMP DEFAULT NOW(),
  valid_from TIMESTAMP DEFAULT NOW(),
  valid_until TIMESTAMP,
  
  -- Stripe integration
  stripe_payment_id TEXT,
  stripe_payment_intent_id TEXT,
  
  -- Status: 'pending', 'completed', 'refunded', 'failed'
  status VARCHAR(50) DEFAULT 'pending',
  
  metadata JSONB DEFAULT '{}'
);

-- Indexes
CREATE INDEX idx_collab_payments_session ON collab_payments(session_id);
CREATE INDEX idx_collab_payments_user ON collab_payments(user_id);
CREATE INDEX idx_collab_payments_status ON collab_payments(status);
CREATE INDEX idx_collab_payments_date ON collab_payments(payment_date DESC);

-- Auto-calculate valid_until based on payment type
CREATE OR REPLACE FUNCTION calculate_valid_until()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_type = 'daily' THEN
    NEW.valid_until = NEW.valid_from + INTERVAL '1 day';
  ELSIF NEW.payment_type = 'prepay_7' THEN
    NEW.valid_until = NEW.valid_from + INTERVAL '7 days';
  ELSIF NEW.payment_type = 'prepay_30' THEN
    NEW.valid_until = NEW.valid_from + INTERVAL '30 days';
  ELSIF NEW.payment_type = 'bundle' THEN
    NEW.valid_until = NEW.valid_from + INTERVAL '30 days';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_valid_until
BEFORE INSERT OR UPDATE ON collab_payments
FOR EACH ROW
EXECUTE FUNCTION calculate_valid_until();

-- ================================================
-- BREAKAWAY_ROOMS TABLE
-- ================================================
-- Sub-sessions within main collaboration session
CREATE TABLE IF NOT EXISTS breakaway_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_session_id UUID REFERENCES collab_sessions(id) ON DELETE CASCADE,
  room_name VARCHAR(255),
  room_token TEXT UNIQUE NOT NULL,
  yjs_doc_id TEXT UNIQUE NOT NULL,
  video_room_url TEXT,
  
  -- Participant tracking
  participants INTEGER DEFAULT 0,
  created_by TEXT NOT NULL,
  
  -- Room lifecycle
  created_at TIMESTAMP DEFAULT NOW(),
  merged_at TIMESTAMP,
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'merged', 'abandoned'
  
  metadata JSONB DEFAULT '{}'
);

-- Indexes
CREATE INDEX idx_breakaway_rooms_parent ON breakaway_rooms(parent_session_id);
CREATE INDEX idx_breakaway_rooms_status ON breakaway_rooms(status);
CREATE INDEX idx_breakaway_rooms_token ON breakaway_rooms(room_token);

-- ================================================
-- SESSION ACTIVITY LOG TABLE
-- ================================================
-- Tracks all actions in collaboration sessions (for playback)
CREATE TABLE IF NOT EXISTS collab_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES collab_sessions(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  
  -- Activity type: 'code_edit', 'cursor_move', 'chat_message', 'file_upload', 'breakaway_create', 'breakaway_merge'
  activity_type VARCHAR(50) NOT NULL,
  
  -- Activity details (flexible JSON for different activity types)
  details JSONB NOT NULL,
  
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_collab_activity_session ON collab_activity_log(session_id);
CREATE INDEX idx_collab_activity_timestamp ON collab_activity_log(timestamp DESC);
CREATE INDEX idx_collab_activity_type ON collab_activity_log(activity_type);

-- ================================================
-- VIEWS FOR ANALYTICS
-- ================================================

-- Active sessions with participant count
CREATE OR REPLACE VIEW active_collab_sessions AS
SELECT 
  cs.id,
  cs.session_name,
  cs.host_id,
  cs.pricing_model,
  cs.cost_per_collaborator,
  cs.active_participants,
  cs.session_start,
  COUNT(DISTINCT cp.user_id) as total_participants,
  SUM(CASE WHEN cp.payment_status = 'paid' THEN 1 ELSE 0 END) as paid_participants,
  cs.metadata
FROM collab_sessions cs
LEFT JOIN collab_participants cp ON cs.id = cp.session_id AND cp.is_active = true
WHERE cs.status = 'active'
GROUP BY cs.id;

-- Daily revenue from collaboration
CREATE OR REPLACE VIEW collab_revenue_by_day AS
SELECT 
  DATE(payment_date) as date,
  COUNT(*) as total_payments,
  SUM(amount) as total_revenue,
  payment_type,
  COUNT(DISTINCT user_id) as unique_payers
FROM collab_payments
WHERE status = 'completed'
GROUP BY DATE(payment_date), payment_type
ORDER BY date DESC;

-- User collaboration stats
CREATE OR REPLACE VIEW user_collab_stats AS
SELECT 
  cp.user_id,
  COUNT(DISTINCT cp.session_id) as sessions_joined,
  SUM(CASE WHEN cp.role = 'host' THEN 1 ELSE 0 END) as sessions_hosted,
  SUM(CASE WHEN cp.payment_status = 'paid' THEN 1 ELSE 0 END) as paid_sessions,
  SUM(COALESCE(pay.amount, 0)) as total_spent
FROM collab_participants cp
LEFT JOIN collab_payments pay ON cp.session_id = pay.session_id AND cp.user_id = pay.user_id
GROUP BY cp.user_id;

-- ================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ================================================

-- Enable RLS on all tables
ALTER TABLE collab_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE collab_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE collab_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE breakaway_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE collab_activity_log ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view sessions they're part of
CREATE POLICY "Users can view their own collab sessions"
ON collab_sessions FOR SELECT
USING (
  host_id = current_setting('request.jwt.claims', true)::json->>'sub'
  OR EXISTS (
    SELECT 1 FROM collab_participants
    WHERE session_id = collab_sessions.id
    AND user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  )
);

-- Policy: Only host can update session
CREATE POLICY "Host can update their session"
ON collab_sessions FOR UPDATE
USING (host_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Policy: Users can create sessions
CREATE POLICY "Users can create sessions"
ON collab_sessions FOR INSERT
WITH CHECK (host_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Policy: Users can view participants in their sessions
CREATE POLICY "Users can view participants in their sessions"
ON collab_participants FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM collab_sessions
    WHERE id = collab_participants.session_id
    AND (
      host_id = current_setting('request.jwt.claims', true)::json->>'sub'
      OR EXISTS (
        SELECT 1 FROM collab_participants cp2
        WHERE cp2.session_id = collab_sessions.id
        AND cp2.user_id = current_setting('request.jwt.claims', true)::json->>'sub'
      )
    )
  )
);

-- Policy: Users can update their own participant record
CREATE POLICY "Users can update their own participant record"
ON collab_participants FOR UPDATE
USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Policy: Users can view their own payments
CREATE POLICY "Users can view their own payments"
ON collab_payments FOR SELECT
USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Policy: Users can view activity in their sessions
CREATE POLICY "Users can view activity in their sessions"
ON collab_activity_log FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM collab_sessions
    WHERE id = collab_activity_log.session_id
    AND (
      host_id = current_setting('request.jwt.claims', true)::json->>'sub'
      OR EXISTS (
        SELECT 1 FROM collab_participants
        WHERE session_id = collab_sessions.id
        AND user_id = current_setting('request.jwt.claims', true)::json->>'sub'
      )
    )
  )
);

-- ================================================
-- FUNCTIONS FOR BUSINESS LOGIC
-- ================================================

-- Calculate total cost for a session
CREATE OR REPLACE FUNCTION calculate_session_cost(
  p_session_id UUID,
  p_days INTEGER DEFAULT 1
)
RETURNS DECIMAL(10,2) AS $$
DECLARE
  v_cost_per_collaborator DECIMAL(10,2);
  v_participant_count INTEGER;
  v_total_cost DECIMAL(10,2);
BEGIN
  -- Get cost per collaborator and participant count
  SELECT cost_per_collaborator, active_participants - 1
  INTO v_cost_per_collaborator, v_participant_count
  FROM collab_sessions
  WHERE id = p_session_id;
  
  -- Calculate total cost (-1 because host doesn't pay)
  v_total_cost := v_cost_per_collaborator * v_participant_count * p_days;
  
  RETURN v_total_cost;
END;
$$ LANGUAGE plpgsql;

-- Check if user has valid payment for session
CREATE OR REPLACE FUNCTION user_has_valid_payment(
  p_session_id UUID,
  p_user_id TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_valid BOOLEAN;
BEGIN
  -- Check if user is host (no payment needed)
  SELECT EXISTS(
    SELECT 1 FROM collab_sessions
    WHERE id = p_session_id
    AND host_id = p_user_id
  ) INTO v_valid;
  
  IF v_valid THEN
    RETURN true;
  END IF;
  
  -- Check if user has active payment
  SELECT EXISTS(
    SELECT 1 FROM collab_payments
    WHERE session_id = p_session_id
    AND user_id = p_user_id
    AND status = 'completed'
    AND valid_until > NOW()
  ) INTO v_valid;
  
  RETURN v_valid;
END;
$$ LANGUAGE plpgsql;

-- Mark session as ended and calculate final costs
CREATE OR REPLACE FUNCTION end_collab_session(
  p_session_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
  v_total_cost DECIMAL(10,2);
  v_duration INTERVAL;
BEGIN
  -- Update session status
  UPDATE collab_sessions
  SET status = 'ended',
      session_end = NOW(),
      updated_at = NOW()
  WHERE id = p_session_id;
  
  -- Mark all participants as inactive
  UPDATE collab_participants
  SET is_active = false,
      left_at = NOW()
  WHERE session_id = p_session_id
  AND is_active = true;
  
  -- Calculate session duration and total cost
  SELECT 
    session_end - session_start,
    calculate_session_cost(p_session_id, CEIL(EXTRACT(EPOCH FROM (session_end - session_start)) / 86400)::INTEGER)
  INTO v_duration, v_total_cost
  FROM collab_sessions
  WHERE id = p_session_id;
  
  -- Return summary
  v_result := jsonb_build_object(
    'session_id', p_session_id,
    'duration', EXTRACT(EPOCH FROM v_duration),
    'total_cost', v_total_cost,
    'ended_at', NOW()
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- SAMPLE DATA (for testing)
-- ================================================

-- Uncomment to insert test data:
/*
-- Insert test session
INSERT INTO collab_sessions (host_id, session_name, session_token, yjs_doc_id, pricing_model, cost_per_collaborator)
VALUES ('user_abc123', 'React Dashboard Project', 'test-session-token-xyz', 'yjs-doc-abc123', 'host_pays', 1.00);

-- Insert test participants
INSERT INTO collab_participants (session_id, user_id, user_name, role, payment_status)
VALUES 
  ((SELECT id FROM collab_sessions WHERE session_token = 'test-session-token-xyz'), 'user_abc123', 'John Doe', 'host', 'paid'),
  ((SELECT id FROM collab_sessions WHERE session_token = 'test-session-token-xyz'), 'user_def456', 'Jane Smith', 'collaborator', 'pending');

-- Insert test payment
INSERT INTO collab_payments (session_id, user_id, payment_type, amount, status)
VALUES 
  ((SELECT id FROM collab_sessions WHERE session_token = 'test-session-token-xyz'), 'user_def456', 'daily', 1.00, 'completed');
*/

-- ================================================
-- COMPLETION MESSAGE
-- ================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Collaboration schema extension completed successfully!';
  RAISE NOTICE '📊 Tables created: collab_sessions, collab_participants, collab_payments, breakaway_rooms, collab_activity_log';
  RAISE NOTICE '🔐 RLS policies enabled for all tables';
  RAISE NOTICE '⚡ Functions created: calculate_session_cost, user_has_valid_payment, end_collab_session';
  RAISE NOTICE '📈 Views created: active_collab_sessions, collab_revenue_by_day, user_collab_stats';
END $$;
