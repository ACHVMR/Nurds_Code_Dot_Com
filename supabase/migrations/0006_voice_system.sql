-- =====================================================
-- MIGRATION 0006: Voice-First Platform System
-- =====================================================
-- Created: 2025
-- Purpose: Voice infrastructure, Nextel phone UI, Plus One pricing, context engineering
-- Dependencies: 0005_ii_agent_system.sql

-- =====================================================
-- 1. VOICE PROFILES TABLE
-- =====================================================
-- Stores user voice settings, custom voice uploads, and voice personality preferences

CREATE TABLE IF NOT EXISTS voice_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL UNIQUE, -- Clerk user ID
    
    -- Voice preferences
    selected_voice_id TEXT NOT NULL DEFAULT 'default-natural', -- Preset or custom voice ID
    voice_speed DECIMAL(3,2) DEFAULT 1.0 CHECK (voice_speed BETWEEN 0.5 AND 2.0),
    voice_pitch DECIMAL(3,2) DEFAULT 1.0 CHECK (voice_pitch BETWEEN 0.5 AND 2.0),
    
    -- Custom voice upload
    custom_voice_url TEXT, -- CloudFlare R2 storage URL
    custom_voice_name TEXT,
    custom_voice_uploaded_at TIMESTAMPTZ,
    
    -- Voice input settings
    voice_input_enabled BOOLEAN DEFAULT true,
    auto_transcribe BOOLEAN DEFAULT true, -- Auto-start transcription
    chirp_sounds_enabled BOOLEAN DEFAULT true, -- Nextel chirp sounds
    
    -- Voice output settings
    voice_output_enabled BOOLEAN DEFAULT true, -- Speak responses
    auto_play_responses BOOLEAN DEFAULT true, -- Auto-play or manual trigger
    response_format TEXT DEFAULT 'voice_first' CHECK (response_format IN ('voice_first', 'text_first', 'both')),
    
    -- Cost tracking
    total_voice_input_seconds INTEGER DEFAULT 0,
    total_voice_output_seconds INTEGER DEFAULT 0,
    total_voice_cost_cents INTEGER DEFAULT 0, -- In cents
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_voice_profiles_user_id ON voice_profiles(user_id);
CREATE INDEX idx_voice_profiles_custom_voice ON voice_profiles(custom_voice_url) WHERE custom_voice_url IS NOT NULL;

-- =====================================================
-- 2. VOICE CONVERSATIONS TABLE
-- =====================================================
-- Stores all voice interactions for RAG context and conversation history

CREATE TABLE IF NOT EXISTS voice_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL, -- Clerk user ID
    session_id UUID NOT NULL, -- Groups related conversations
    
    -- Voice input
    audio_input_url TEXT, -- CloudFlare R2 storage (if saved)
    transcript TEXT NOT NULL,
    language TEXT DEFAULT 'en',
    confidence DECIMAL(5,4), -- 0.0000-1.0000 ASR confidence
    
    -- Voice routing
    detected_intent TEXT, -- create_agent, execute_task, modify_agent, etc.
    intent_confidence DECIMAL(5,4),
    routed_to_agent_id UUID, -- References agents table from 0005
    
    -- Voice output
    response_text TEXT,
    audio_output_url TEXT, -- CloudFlare R2 storage (if generated)
    voice_id TEXT, -- Which voice was used
    
    -- Cost tracking
    input_duration_seconds INTEGER,
    output_duration_seconds INTEGER,
    input_cost_cents INTEGER,
    output_cost_cents INTEGER,
    total_cost_cents INTEGER,
    
    -- Metadata
    asr_provider TEXT DEFAULT 'groq', -- groq, deepgram, elevenlabs, openai
    tts_provider TEXT DEFAULT 'openai', -- openai, groq-compatible, etc.
    nlp_router_model TEXT, -- gpt-4o-mini, gpt-4.1-nano, etc.
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_voice_conversations_user_id ON voice_conversations(user_id);
CREATE INDEX idx_voice_conversations_session_id ON voice_conversations(session_id);
CREATE INDEX idx_voice_conversations_created_at ON voice_conversations(created_at DESC);
CREATE INDEX idx_voice_conversations_agent_id ON voice_conversations(routed_to_agent_id) WHERE routed_to_agent_id IS NOT NULL;

-- =====================================================
-- 3. CUSTOM INSTRUCTIONS TABLE
-- =====================================================
-- Stores user profile for context engineering and personalized recommendations

CREATE TABLE IF NOT EXISTS custom_instructions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL UNIQUE, -- Clerk user ID
    
    -- Career context
    career_goals TEXT, -- "Become a senior full-stack engineer", "Launch my startup", etc.
    current_role TEXT, -- "Junior Developer", "Tech Lead", "Founder", etc.
    years_experience INTEGER,
    tech_stack TEXT[], -- Array of technologies: ["React", "Node.js", "PostgreSQL"]
    
    -- Project context
    current_projects TEXT[], -- Array of project descriptions
    project_types TEXT[], -- ["web app", "mobile app", "API", "data pipeline"]
    industry TEXT, -- "FinTech", "HealthTech", "E-commerce", etc.
    
    -- Personal preferences
    interests TEXT[], -- ["AI/ML", "DevOps", "UI/UX", "Blockchain"]
    learning_goals TEXT[], -- ["Learn TypeScript", "Master Docker", "Build SaaS"]
    preferred_languages TEXT[], -- ["JavaScript", "Python", "Go"]
    
    -- Company context
    company_type TEXT, -- "startup", "enterprise", "agency", "freelance"
    company_size TEXT, -- "1-10", "11-50", "51-200", "201-1000", "1000+"
    team_size INTEGER,
    
    -- Personality & style
    communication_style TEXT DEFAULT 'professional', -- professional, casual, technical, concise
    code_style TEXT DEFAULT 'idiomatic', -- idiomatic, verbose, minimal, commented
    preferred_tone TEXT DEFAULT 'helpful', -- helpful, direct, encouraging, analytical
    
    -- RAG vector embedding (for semantic search)
    embedding vector(1536), -- OpenAI text-embedding-3-small dimension
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_custom_instructions_user_id ON custom_instructions(user_id);
CREATE INDEX idx_custom_instructions_embedding ON custom_instructions USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- =====================================================
-- 4. DAILY INSIGHTS TABLE
-- =====================================================
-- Stores personalized daily build suggestions based on user profile + RAG

CREATE TABLE IF NOT EXISTS daily_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL, -- Clerk user ID
    insight_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Insight content
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    suggestion_type TEXT NOT NULL, -- project_idea, learning_resource, tool_recommendation, optimization_tip
    
    -- Actionable details
    action_url TEXT, -- Link to resource, tutorial, tool, etc.
    action_label TEXT, -- "Start Building", "Learn More", "Try Now"
    estimated_time_minutes INTEGER, -- How long to implement
    
    -- Relevance scoring
    relevance_score DECIMAL(5,4), -- 0.0000-1.0000 based on user profile match
    personalization_factors TEXT[], -- ["matches career_goals", "aligns with tech_stack", "related to recent projects"]
    
    -- Interaction tracking
    viewed BOOLEAN DEFAULT false,
    clicked BOOLEAN DEFAULT false,
    dismissed BOOLEAN DEFAULT false,
    completed BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    viewed_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    dismissed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

CREATE INDEX idx_daily_insights_user_id ON daily_insights(user_id);
CREATE INDEX idx_daily_insights_date ON daily_insights(insight_date DESC);
CREATE INDEX idx_daily_insights_viewed ON daily_insights(user_id, viewed) WHERE viewed = false;
CREATE UNIQUE INDEX idx_daily_insights_user_date_type ON daily_insights(user_id, insight_date, suggestion_type);

-- =====================================================
-- 5. USAGE LEDGER TABLE
-- =====================================================
-- Tracks all AI/voice costs per user per task for transparency and billing

CREATE TABLE IF NOT EXISTS usage_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL, -- Clerk user ID
    transaction_type TEXT NOT NULL, -- llm_request, voice_input, voice_output, ocr_processing
    
    -- Cost breakdown
    provider TEXT NOT NULL, -- groq, openai, deepgram, elevenlabs, deepseek
    model TEXT, -- llama-4-scout, gpt-4o-mini, whisper-v3, etc.
    
    -- Usage metrics
    input_tokens INTEGER,
    output_tokens INTEGER,
    total_tokens INTEGER,
    duration_seconds INTEGER, -- For voice
    
    -- Pricing
    input_cost_per_token DECIMAL(12,10), -- Cost per token (e.g., 0.0000001100 for $0.11/1M)
    output_cost_per_token DECIMAL(12,10),
    fixed_cost_cents INTEGER, -- For fixed-price services
    total_cost_cents INTEGER NOT NULL, -- Final cost in cents
    
    -- Context
    task_id UUID, -- References agent_tasks from 0005
    agent_id UUID, -- References agents from 0005
    boomer_ang_id UUID, -- References boomer_angs (created later)
    session_id UUID, -- Groups related operations
    
    -- Quote & approval
    quote_id UUID, -- References quotes table (created later)
    pre_approved BOOLEAN DEFAULT false, -- User approved quote before execution
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_usage_ledger_user_id ON usage_ledger(user_id);
CREATE INDEX idx_usage_ledger_created_at ON usage_ledger(created_at DESC);
CREATE INDEX idx_usage_ledger_transaction_type ON usage_ledger(transaction_type);
CREATE INDEX idx_usage_ledger_task_id ON usage_ledger(task_id) WHERE task_id IS NOT NULL;
CREATE INDEX idx_usage_ledger_session_id ON usage_ledger(session_id) WHERE session_id IS NOT NULL;

-- =====================================================
-- 6. TIER CREDITS TABLE
-- =====================================================
-- Tracks user tier credits (tokens) and spending limits

CREATE TABLE IF NOT EXISTS tier_credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL UNIQUE, -- Clerk user ID
    
    -- Current tier
    tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'buy_me_a_coffee', 'lite', 'medium', 'heavy', 'superior')),
    
    -- Credit balances (in cents)
    current_balance_cents INTEGER DEFAULT 0,
    total_spent_cents INTEGER DEFAULT 0,
    total_deposited_cents INTEGER DEFAULT 0,
    
    -- Tier limits (free tier enforced)
    max_projects INTEGER DEFAULT 2, -- Free tier = 2 projects
    current_projects_count INTEGER DEFAULT 0,
    models_allowed TEXT[] DEFAULT ARRAY['groq'], -- Free tier = GROQ only
    
    -- Features enabled
    voice_enabled BOOLEAN DEFAULT true,
    ocr_enabled BOOLEAN DEFAULT false, -- Free tier = no OCR
    collaboration_enabled BOOLEAN DEFAULT false, -- Free tier = no collaboration
    analytics_enabled BOOLEAN DEFAULT false, -- Free tier = no analytics
    
    -- Subscription details
    subscription_id TEXT, -- Stripe subscription ID (if applicable)
    subscription_status TEXT, -- active, canceled, past_due, trialing
    subscription_period_start TIMESTAMPTZ,
    subscription_period_end TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tier_credits_user_id ON tier_credits(user_id);
CREATE INDEX idx_tier_credits_tier ON tier_credits(tier);
CREATE INDEX idx_tier_credits_subscription_id ON tier_credits(subscription_id) WHERE subscription_id IS NOT NULL;

-- =====================================================
-- 7. BOOMER_ANGS TABLE
-- =====================================================
-- User-created ACHEEVY agents (Boomer_Angs from House of Ang)

CREATE TABLE IF NOT EXISTS boomer_angs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL, -- Clerk user ID (owner)
    
    -- Agent identity (House of Ang naming ceremony)
    name TEXT NOT NULL, -- User-chosen name
    ceremonial_name TEXT NOT NULL, -- Generated: "{Name} of House Ang"
    agent_type TEXT NOT NULL, -- code, data, workflow, monitor (from II-Agent types)
    
    -- Configuration
    description TEXT,
    personality TEXT DEFAULT 'helpful', -- helpful, direct, technical, friendly
    capabilities TEXT[], -- Array of II-Agent capabilities
    
    -- Voice creation (VOICE FIRST)
    created_via_voice BOOLEAN DEFAULT false,
    creation_transcript TEXT, -- Original voice command that created agent
    
    -- Triggers
    voice_triggers TEXT[], -- Voice command phrases
    webhook_url TEXT, -- Webhook endpoint (optional)
    schedule_cron TEXT, -- Cron expression (optional)
    file_upload_triggers TEXT[], -- File types that trigger agent
    
    -- Model routing (super admin only sees this)
    primary_model TEXT DEFAULT 'llama-4-scout', -- Groq model
    fallback_models TEXT[], -- Fallback chain
    orchestrated_by_ii_agent BOOLEAN DEFAULT true, -- II-Agent orchestrates backend
    
    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
    execution_count INTEGER DEFAULT 0,
    last_executed_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_boomer_angs_user_id ON boomer_angs(user_id);
CREATE INDEX idx_boomer_angs_status ON boomer_angs(status);
CREATE INDEX idx_boomer_angs_created_at ON boomer_angs(created_at DESC);

-- =====================================================
-- 8. QUOTES TABLE
-- =====================================================
-- Pre-execution cost quotes shown to users before tasks run

CREATE TABLE IF NOT EXISTS quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL, -- Clerk user ID
    boomer_ang_id UUID, -- References boomer_angs
    
    -- Quote breakdown
    llm_cost_cents INTEGER DEFAULT 0,
    voice_input_cost_cents INTEGER DEFAULT 0,
    voice_output_cost_cents INTEGER DEFAULT 0,
    ocr_cost_cents INTEGER DEFAULT 0,
    total_cost_cents INTEGER NOT NULL,
    
    -- Estimated usage
    estimated_input_tokens INTEGER,
    estimated_output_tokens INTEGER,
    estimated_voice_duration_seconds INTEGER,
    
    -- Models to be used
    models TEXT[], -- ["llama-4-scout", "whisper-v3", "gpt-4o-mini"]
    
    -- User approval
    approved BOOLEAN DEFAULT false,
    approved_at TIMESTAMPTZ,
    declined BOOLEAN DEFAULT false,
    declined_at TIMESTAMPTZ,
    
    -- Expiration
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '5 minutes'),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quotes_user_id ON quotes(user_id);
CREATE INDEX idx_quotes_boomer_ang_id ON quotes(boomer_ang_id) WHERE boomer_ang_id IS NOT NULL;
CREATE INDEX idx_quotes_approved ON quotes(approved) WHERE approved = true;
CREATE INDEX idx_quotes_expires_at ON quotes(expires_at) WHERE expires_at > NOW();

-- =====================================================
-- 9. COLLABORATION BILLING TABLE
-- =====================================================
-- Tracks Plus One pricing charges (daily + subscription)

CREATE TABLE IF NOT EXISTS collaboration_billing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL, -- References collaboration_projects from 0004
    user_id TEXT NOT NULL, -- Project owner (who pays)
    
    -- Collaborators
    collaborator_user_id TEXT NOT NULL, -- Added collaborator
    added_at TIMESTAMPTZ DEFAULT NOW(),
    removed_at TIMESTAMPTZ, -- If removed
    
    -- Pricing type
    billing_type TEXT NOT NULL CHECK (billing_type IN ('daily', 'subscription')),
    
    -- Daily pricing
    daily_rate_cents INTEGER DEFAULT 100, -- $1.00/day
    days_active INTEGER DEFAULT 0,
    
    -- Subscription pricing
    subscription_tier TEXT, -- 1_member, 2_members, 4_members, 5_members
    monthly_rate_cents INTEGER, -- $1799, $1399, $1099, $799 per member
    discount_percentage INTEGER, -- 0%, 22%, 39%, 56%
    
    -- Charges
    total_charged_cents INTEGER DEFAULT 0,
    last_charged_at TIMESTAMPTZ,
    next_charge_at TIMESTAMPTZ, -- For daily billing
    
    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'removed')),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_collaboration_billing_project_id ON collaboration_billing(project_id);
CREATE INDEX idx_collaboration_billing_user_id ON collaboration_billing(user_id);
CREATE INDEX idx_collaboration_billing_collaborator_id ON collaboration_billing(collaborator_user_id);
CREATE INDEX idx_collaboration_billing_status ON collaboration_billing(status) WHERE status = 'active';
CREATE INDEX idx_collaboration_billing_next_charge ON collaboration_billing(next_charge_at) WHERE next_charge_at IS NOT NULL;

-- =====================================================
-- 10. CONTEXT ENGINEERING MESSAGES TABLE
-- =====================================================
-- Stores ticker messages for context engineering UI

CREATE TABLE IF NOT EXISTS context_engineering_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Message content
    message_text TEXT NOT NULL,
    message_type TEXT NOT NULL CHECK (message_type IN ('context_window', 'terminology', 'motivation', 'tip')),
    
    -- Targeting
    tier_restriction TEXT[], -- ['free', 'lite', 'medium'] - which tiers see this
    user_profile_match TEXT[], -- ['career_goals', 'interests'] - personalization factors
    
    -- Display settings
    priority INTEGER DEFAULT 1, -- Higher = shows more often
    active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_context_messages_type ON context_engineering_messages(message_type);
CREATE INDEX idx_context_messages_active ON context_engineering_messages(active) WHERE active = true;

-- =====================================================
-- 11. SEED DATA: Context Engineering Messages
-- =====================================================

INSERT INTO context_engineering_messages (message_text, message_type, priority) VALUES
('You''re not just vibe coding, you''re context engineering', 'context_window', 10),
('Your context is your competitive advantage', 'context_window', 8),
('Engineering context at scale', 'context_window', 7),
('Building with context, shipping with confidence', 'context_window', 6),
('From prompt to production: context matters', 'context_window', 5),

('Full-Stack Development', 'terminology', 5),
('Software Architecture', 'terminology', 5),
('API Design', 'terminology', 5),
('Database Optimization', 'terminology', 5),
('DevOps Pipeline', 'terminology', 5),
('Cloud Infrastructure', 'terminology', 5),
('Microservices', 'terminology', 5),
('CI/CD Automation', 'terminology', 5),
('System Design', 'terminology', 5),
('Code Review', 'terminology', 5),

('Ship faster with AI assistance', 'motivation', 3),
('Your code, supercharged', 'motivation', 3),
('Context-aware development', 'motivation', 3),
('Build like a pro', 'motivation', 3),

('Quote before execution = no surprises', 'tip', 2),
('Voice first, type second', 'tip', 2),
('Toggle voice to manage costs', 'tip', 2)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 12. FUNCTIONS: Auto-update timestamps
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables with updated_at
CREATE TRIGGER update_voice_profiles_updated_at BEFORE UPDATE ON voice_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_custom_instructions_updated_at BEFORE UPDATE ON custom_instructions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tier_credits_updated_at BEFORE UPDATE ON tier_credits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_boomer_angs_updated_at BEFORE UPDATE ON boomer_angs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_collaboration_billing_updated_at BEFORE UPDATE ON collaboration_billing FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 13. FUNCTIONS: Daily Billing Cron Job Support
-- =====================================================

CREATE OR REPLACE FUNCTION charge_daily_collaborations()
RETURNS INTEGER AS $$
DECLARE
    charge_count INTEGER := 0;
BEGIN
    -- Charge all active daily collaborations
    UPDATE collaboration_billing
    SET 
        days_active = days_active + 1,
        total_charged_cents = total_charged_cents + daily_rate_cents,
        last_charged_at = NOW(),
        next_charge_at = NOW() + INTERVAL '1 day'
    WHERE 
        billing_type = 'daily'
        AND status = 'active'
        AND (next_charge_at IS NULL OR next_charge_at <= NOW());
    
    GET DIAGNOSTICS charge_count = ROW_COUNT;
    RETURN charge_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 14. FUNCTIONS: Generate Daily Insights
-- =====================================================

CREATE OR REPLACE FUNCTION generate_daily_insights(target_user_id TEXT)
RETURNS INTEGER AS $$
DECLARE
    user_instructions RECORD;
    insight_count INTEGER := 0;
BEGIN
    -- Get user's custom instructions
    SELECT * INTO user_instructions FROM custom_instructions WHERE user_id = target_user_id;
    
    IF NOT FOUND THEN
        RETURN 0; -- No custom instructions yet
    END IF;
    
    -- Example: Generate project idea based on user's tech stack
    IF array_length(user_instructions.tech_stack, 1) > 0 THEN
        INSERT INTO daily_insights (user_id, title, description, suggestion_type, relevance_score, personalization_factors)
        VALUES (
            target_user_id,
            'Build with ' || user_instructions.tech_stack[1],
            'Try building a project using ' || user_instructions.tech_stack[1] || ' to level up your skills.',
            'project_idea',
            0.85,
            ARRAY['matches tech_stack']
        )
        ON CONFLICT (user_id, insight_date, suggestion_type) DO NOTHING;
        
        insight_count := insight_count + 1;
    END IF;
    
    RETURN insight_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 15. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE voice_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_instructions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE tier_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE boomer_angs ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE context_engineering_messages ENABLE ROW LEVEL SECURITY;

-- Voice profiles: Users see only their own
CREATE POLICY voice_profiles_policy ON voice_profiles FOR ALL USING (user_id = current_setting('app.current_user_id', true));

-- Voice conversations: Users see only their own
CREATE POLICY voice_conversations_policy ON voice_conversations FOR ALL USING (user_id = current_setting('app.current_user_id', true));

-- Custom instructions: Users see only their own
CREATE POLICY custom_instructions_policy ON custom_instructions FOR ALL USING (user_id = current_setting('app.current_user_id', true));

-- Daily insights: Users see only their own
CREATE POLICY daily_insights_policy ON daily_insights FOR ALL USING (user_id = current_setting('app.current_user_id', true));

-- Usage ledger: Users see only their own
CREATE POLICY usage_ledger_policy ON usage_ledger FOR ALL USING (user_id = current_setting('app.current_user_id', true));

-- Tier credits: Users see only their own
CREATE POLICY tier_credits_policy ON tier_credits FOR ALL USING (user_id = current_setting('app.current_user_id', true));

-- Boomer_angs: Users see only their own
CREATE POLICY boomer_angs_policy ON boomer_angs FOR ALL USING (user_id = current_setting('app.current_user_id', true));

-- Quotes: Users see only their own
CREATE POLICY quotes_policy ON quotes FOR ALL USING (user_id = current_setting('app.current_user_id', true));

-- Collaboration billing: Users see projects they own OR are collaborators on
CREATE POLICY collaboration_billing_policy ON collaboration_billing FOR ALL 
USING (
    user_id = current_setting('app.current_user_id', true) 
    OR collaborator_user_id = current_setting('app.current_user_id', true)
);

-- Context engineering messages: Everyone can read (public)
CREATE POLICY context_messages_read_policy ON context_engineering_messages FOR SELECT USING (active = true);
CREATE POLICY context_messages_admin_policy ON context_engineering_messages FOR ALL USING (current_setting('app.user_role', true) = 'admin');

-- =====================================================
-- 16. VIEWS: User Dashboard Summary
-- =====================================================

CREATE OR REPLACE VIEW user_dashboard_summary AS
SELECT 
    tc.user_id,
    tc.tier,
    tc.current_balance_cents,
    tc.total_spent_cents,
    tc.current_projects_count,
    tc.max_projects,
    vp.voice_input_enabled,
    vp.voice_output_enabled,
    vp.total_voice_cost_cents,
    COUNT(DISTINCT ba.id) as total_boomer_angs,
    COUNT(DISTINCT vc.id) FILTER (WHERE vc.created_at > NOW() - INTERVAL '24 hours') as voice_conversations_today,
    COUNT(DISTINCT di.id) FILTER (WHERE di.viewed = false) as unread_insights
FROM tier_credits tc
LEFT JOIN voice_profiles vp ON tc.user_id = vp.user_id
LEFT JOIN boomer_angs ba ON tc.user_id = ba.user_id
LEFT JOIN voice_conversations vc ON tc.user_id = vc.user_id
LEFT JOIN daily_insights di ON tc.user_id = di.user_id
GROUP BY tc.user_id, tc.tier, tc.current_balance_cents, tc.total_spent_cents, 
         tc.current_projects_count, tc.max_projects, vp.voice_input_enabled, 
         vp.voice_output_enabled, vp.total_voice_cost_cents;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Next steps:
-- 1. Apply this migration: psql < 0006_voice_system.sql
-- 2. Verify tables created: \dt
-- 3. Check RLS policies: \ddp
-- 4. Seed test data if needed
-- =====================================================
