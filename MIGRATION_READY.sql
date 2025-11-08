-- BOOMER_ANG DATABASE SCHEMA
-- AI Agent (Boomer_Ang) system with marketplace, sandbox, and user customization

-- =====================================================================
-- 1. BOOMER_ANGS TABLE
-- =====================================================================
CREATE TABLE boomer_angs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Info
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  
  -- Categorization
  category VARCHAR(100) NOT NULL DEFAULT 'General',
  effectiveness_level VARCHAR(50) NOT NULL DEFAULT 'Basic',
  
  -- Features & Tags
  features JSONB DEFAULT '[]'::jsonb,
  tags JSONB DEFAULT '[]'::jsonb,
  
  -- Configuration
  config JSONB DEFAULT '{}'::jsonb,
  
  -- Ownership
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_premade BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  
  -- Marketplace
  price DECIMAL(10, 2) DEFAULT 0,
  rent_price DECIMAL(10, 2) DEFAULT 0,
  
  -- Stats
  success_rate DECIMAL(5, 2) DEFAULT 0,
  total_runs INTEGER DEFAULT 0,
  tokens_per_run INTEGER DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  
  -- Status
  status VARCHAR(50) DEFAULT 'stopped',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_effectiveness CHECK (effectiveness_level IN ('Basic', 'Advanced', 'Premium', 'Enterprise')),
  CONSTRAINT valid_status CHECK (status IN ('stopped', 'running', 'paused', 'error')),
  CONSTRAINT valid_rating CHECK (rating >= 0 AND rating <= 5),
  CONSTRAINT valid_price CHECK (price >= 0),
  CONSTRAINT valid_rent_price CHECK (rent_price >= 0)
);

CREATE INDEX idx_boomer_angs_creator ON boomer_angs(creator_id);
CREATE INDEX idx_boomer_angs_category ON boomer_angs(category);
CREATE INDEX idx_boomer_angs_public ON boomer_angs(is_public) WHERE is_public = true;
CREATE INDEX idx_boomer_angs_premade ON boomer_angs(is_premade) WHERE is_premade = true;
CREATE INDEX idx_boomer_angs_rating ON boomer_angs(rating DESC);
CREATE INDEX idx_boomer_angs_created ON boomer_angs(created_at DESC);

-- =====================================================================
-- 2. USER_BOOMER_ANGS (Ownership & Rentals)
-- =====================================================================
CREATE TABLE user_boomer_angs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  boomer_ang_id UUID NOT NULL REFERENCES boomer_angs(id) ON DELETE CASCADE,
  
  -- Ownership Type
  ownership_type VARCHAR(50) NOT NULL,
  
  -- Rental Info
  rental_start TIMESTAMP WITH TIME ZONE,
  rental_end TIMESTAMP WITH TIME ZONE,
  rental_active BOOLEAN DEFAULT false,
  
  -- Purchase Info
  purchase_price DECIMAL(10, 2),
  purchased_at TIMESTAMP WITH TIME ZONE,
  
  -- User Customization
  custom_name VARCHAR(255),
  custom_config JSONB,
  
  -- Favorites
  is_favorite BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_user_boomerang UNIQUE(user_id, boomer_ang_id),
  CONSTRAINT valid_ownership CHECK (ownership_type IN ('owned', 'rented', 'sandbox'))
);

CREATE INDEX idx_user_boomer_angs_user ON user_boomer_angs(user_id);
CREATE INDEX idx_user_boomer_angs_boomer ON user_boomer_angs(boomer_ang_id);
CREATE INDEX idx_user_boomer_angs_active_rentals ON user_boomer_angs(user_id, rental_active) WHERE rental_active = true;
CREATE INDEX idx_user_boomer_angs_favorites ON user_boomer_angs(user_id, is_favorite) WHERE is_favorite = true;

-- =====================================================================
-- 3. BOOMER_ANG_RUNS (Execution History)
-- =====================================================================
CREATE TABLE boomer_ang_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  boomer_ang_id UUID NOT NULL REFERENCES boomer_angs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Run Details
  input_text TEXT,
  output_text TEXT,
  tokens_used INTEGER DEFAULT 0,
  
  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  error_message TEXT,
  
  -- Performance
  duration_ms INTEGER,
  success BOOLEAN,
  
  -- Context
  environment VARCHAR(50) DEFAULT 'production',
  
  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  CONSTRAINT valid_run_status CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  CONSTRAINT valid_environment CHECK (environment IN ('production', 'sandbox'))
);

CREATE INDEX idx_runs_boomer_ang ON boomer_ang_runs(boomer_ang_id, completed_at DESC);
CREATE INDEX idx_runs_user ON boomer_ang_runs(user_id, started_at DESC);
CREATE INDEX idx_runs_status ON boomer_ang_runs(status) WHERE status IN ('pending', 'running');

-- =====================================================================
-- 4. BOOMER_ANG_RATINGS (User Reviews)
-- =====================================================================
CREATE TABLE boomer_ang_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  boomer_ang_id UUID NOT NULL REFERENCES boomer_angs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Rating
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_user_rating UNIQUE(user_id, boomer_ang_id)
);

CREATE INDEX idx_ratings_boomer_ang ON boomer_ang_ratings(boomer_ang_id);
CREATE INDEX idx_ratings_user ON boomer_ang_ratings(user_id);

-- =====================================================================
-- 5. MARKETPLACE_TRANSACTIONS
-- =====================================================================
CREATE TABLE marketplace_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Parties
  buyer_id UUID NOT NULL REFERENCES auth.users(id),
  seller_id UUID NOT NULL REFERENCES auth.users(id),
  boomer_ang_id UUID NOT NULL REFERENCES boomer_angs(id),
  
  -- Transaction Type
  transaction_type VARCHAR(50) NOT NULL,
  
  -- Pricing
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  
  -- Payment
  payment_method VARCHAR(50),
  payment_id VARCHAR(255),
  payment_status VARCHAR(50) DEFAULT 'pending',
  
  -- Rental Details
  rental_period_days INTEGER,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  CONSTRAINT valid_transaction_type CHECK (transaction_type IN ('purchase', 'rental_start', 'rental_end')),
  CONSTRAINT valid_payment_status CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded'))
);

CREATE INDEX idx_transactions_buyer ON marketplace_transactions(buyer_id, created_at DESC);
CREATE INDEX idx_transactions_seller ON marketplace_transactions(seller_id, created_at DESC);
CREATE INDEX idx_transactions_boomer_ang ON marketplace_transactions(boomer_ang_id);
CREATE INDEX idx_transactions_payment ON marketplace_transactions(payment_id);

-- =====================================================================
-- 6. SANDBOX_SESSIONS
-- =====================================================================
CREATE TABLE sandbox_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  boomer_ang_id UUID NOT NULL REFERENCES boomer_angs(id) ON DELETE CASCADE,
  
  -- Session Info
  session_name VARCHAR(255),
  description TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Limits
  max_runs INTEGER DEFAULT 100,
  runs_used INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  last_used_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  CONSTRAINT valid_runs CHECK (runs_used <= max_runs)
);

CREATE INDEX idx_sandbox_user ON sandbox_sessions(user_id, is_active) WHERE is_active = true;
CREATE INDEX idx_sandbox_boomer_ang ON sandbox_sessions(boomer_ang_id);
CREATE INDEX idx_sandbox_expires ON sandbox_sessions(expires_at) WHERE is_active = true;

-- =====================================================================
-- TRIGGERS
-- =====================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_boomer_angs_updated_at BEFORE UPDATE ON boomer_angs
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_boomer_angs_updated_at BEFORE UPDATE ON user_boomer_angs
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ratings_updated_at BEFORE UPDATE ON boomer_ang_ratings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION update_boomer_ang_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE boomer_angs
  SET 
    rating = (
      SELECT AVG(rating)::DECIMAL(3,2)
      FROM boomer_ang_ratings
      WHERE boomer_ang_id = NEW.boomer_ang_id
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM boomer_ang_ratings
      WHERE boomer_ang_id = NEW.boomer_ang_id
    )
  WHERE id = NEW.boomer_ang_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rating_on_insert AFTER INSERT ON boomer_ang_ratings
FOR EACH ROW EXECUTE FUNCTION update_boomer_ang_rating();

CREATE TRIGGER update_rating_on_update AFTER UPDATE ON boomer_ang_ratings
FOR EACH ROW EXECUTE FUNCTION update_boomer_ang_rating();

CREATE OR REPLACE FUNCTION increment_run_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE boomer_angs
    SET total_runs = total_runs + 1
    WHERE id = NEW.boomer_ang_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_run_count_trigger AFTER UPDATE ON boomer_ang_runs
FOR EACH ROW EXECUTE FUNCTION increment_run_count();

CREATE OR REPLACE FUNCTION expire_rentals()
RETURNS void AS $$
BEGIN
  UPDATE user_boomer_angs
  SET rental_active = false
  WHERE rental_active = true
    AND rental_end < NOW();
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION expire_sandbox_sessions()
RETURNS void AS $$
BEGIN
  UPDATE sandbox_sessions
  SET is_active = false
  WHERE is_active = true
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================================

ALTER TABLE boomer_angs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_boomer_angs ENABLE ROW LEVEL SECURITY;
ALTER TABLE boomer_ang_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE boomer_ang_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sandbox_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public boomer_angs are viewable by everyone"
  ON boomer_angs FOR SELECT
  USING (is_public = true OR is_premade = true);

CREATE POLICY "Users can view their own boomer_angs"
  ON boomer_angs FOR SELECT
  USING (auth.uid() = creator_id);

CREATE POLICY "Users can create their own boomer_angs"
  ON boomer_angs FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update their own boomer_angs"
  ON boomer_angs FOR UPDATE
  USING (auth.uid() = creator_id);

CREATE POLICY "Users can delete their own boomer_angs"
  ON boomer_angs FOR DELETE
  USING (auth.uid() = creator_id);

CREATE POLICY "Users can view their own agent ownership"
  ON user_boomer_angs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add agents to their collection"
  ON user_boomer_angs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agent settings"
  ON user_boomer_angs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can remove agents from their collection"
  ON user_boomer_angs FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own runs"
  ON boomer_ang_runs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create runs"
  ON boomer_ang_runs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Ratings are viewable by everyone"
  ON boomer_ang_ratings FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own ratings"
  ON boomer_ang_ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings"
  ON boomer_ang_ratings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own transactions"
  ON marketplace_transactions FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Users can create transactions"
  ON marketplace_transactions FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Users can view their own sandbox sessions"
  ON sandbox_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create sandbox sessions"
  ON sandbox_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sandbox sessions"
  ON sandbox_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================================

CREATE VIEW marketplace_listings AS
SELECT 
  ba.*,
  u.email as creator_email,
  (SELECT COUNT(*) FROM user_boomer_angs WHERE boomer_ang_id = ba.id AND ownership_type = 'owned') as total_purchases,
  (SELECT COUNT(*) FROM user_boomer_angs WHERE boomer_ang_id = ba.id AND ownership_type = 'rented' AND rental_active = true) as active_rentals
FROM boomer_angs ba
LEFT JOIN auth.users u ON ba.creator_id = u.id
WHERE ba.is_public = true;

CREATE VIEW user_agent_collection AS
SELECT 
  uba.*,
  ba.name,
  ba.description,
  ba.image_url,
  ba.category,
  ba.effectiveness_level,
  ba.features,
  ba.tags,
  ba.config,
  ba.success_rate,
  ba.total_runs,
  ba.tokens_per_run,
  ba.rating,
  ba.is_premade,
  ba.status
FROM user_boomer_angs uba
JOIN boomer_angs ba ON uba.boomer_ang_id = ba.id;

-- =====================================================================
-- SEED DATA: PREMADE BOOMER_ANGS
-- =====================================================================

INSERT INTO boomer_angs (name, description, image_url, category, effectiveness_level, features, tags, is_premade, is_public, config) VALUES
(
  'Code Review Expert',
  'Advanced AI Boomer_Ang specialized in code reviews. Analyzes code quality, identifies bugs, suggests improvements, and ensures best practices across multiple programming languages.',
  NULL,
  'Coding Assistant',
  'Advanced',
  '["Multi-language support", "Security analysis", "Performance optimization", "Best practice enforcement", "Detailed feedback"]'::jsonb,
  '["code-review", "quality", "security", "performance"]'::jsonb,
  true,
  true,
  '{"model": "gpt-4", "temperature": 0.3, "maxTokens": 3000, "systemPrompt": "You are an expert code reviewer. Analyze code for quality, security, and best practices."}'::jsonb
),
(
  'IDE Code Assistant',
  'Advanced coding companion that integrates with your IDE/CLI/Editor. Provides real-time code suggestions, refactoring, debugging assistance, and documentation generation. Works seamlessly with VS Code, terminal, and coding environments.',
  NULL,
  'Coding Assistant',
  'Premium',
  '["IDE integration", "Real-time suggestions", "Code refactoring", "Debug assistance", "Auto-documentation", "Multi-language support", "Terminal commands", "Git integration"]'::jsonb,
  '["ide", "coding", "development", "editor", "cli", "vscode"]'::jsonb,
  true,
  true,
  '{"model": "gpt-4", "temperature": 0.2, "maxTokens": 4000, "systemPrompt": "You are an expert coding assistant integrated with IDEs. Provide context-aware code suggestions, refactoring, and debugging help."}'::jsonb
),
(
  'Deep Research Boomer_Ang',
  'Enterprise-level research Boomer_Ang that conducts comprehensive multi-source analysis. Synthesizes complex information, generates detailed reports with citations, performs comparative analysis, and identifies trends across academic, technical, and business domains.',
  NULL,
  'Research',
  'Enterprise',
  '["Multi-source synthesis", "Academic citations", "Trend analysis", "Comparative research", "Report generation", "Fact verification", "Bibliography management", "Visual data presentation"]'::jsonb,
  '["research", "academic", "deep-analysis", "enterprise", "reports"]'::jsonb,
  true,
  true,
  '{"model": "gpt-4", "temperature": 0.1, "maxTokens": 8000, "systemPrompt": "You are an enterprise research specialist. Conduct deep, multi-source analysis with rigorous citations and comprehensive reporting."}'::jsonb
),
(
  'App Creation Assistant',
  'Advanced application builder that guides you through full-stack app development. Generates architecture diagrams, database schemas, API endpoints, frontend components, and deployment configurations. Supports React, Node.js, Python, and more.',
  NULL,
  'Coding Assistant',
  'Premium',
  '["Full-stack development", "Architecture design", "Database schema", "API generation", "Frontend scaffolding", "Deployment configs", "Testing suite", "Documentation"]'::jsonb,
  '["app-development", "full-stack", "architecture", "deployment"]'::jsonb,
  true,
  true,
  '{"model": "gpt-4", "temperature": 0.3, "maxTokens": 5000, "systemPrompt": "You are an expert full-stack developer. Guide users through complete application development from architecture to deployment."}'::jsonb
),
(
  'Course Creator',
  'Educational content specialist that designs comprehensive courses, lessons, and learning materials. Creates structured curricula, interactive exercises, assessments, and multimedia content for online education and training programs.',
  NULL,
  'Education',
  'Advanced',
  '["Curriculum design", "Lesson planning", "Interactive exercises", "Assessment creation", "Video script writing", "Quiz generation", "Learning path optimization", "Progress tracking"]'::jsonb,
  '["education", "courses", "teaching", "learning", "curriculum"]'::jsonb,
  true,
  true,
  '{"model": "gpt-4", "temperature": 0.5, "maxTokens": 4000, "systemPrompt": "You are an expert instructional designer. Create engaging, structured educational content with clear learning objectives."}'::jsonb
),
(
  'Data Analysis Pro',
  'Powerful data analysis Boomer_Ang that processes datasets, generates insights, creates visualizations, and provides statistical analysis with clear explanations.',
  NULL,
  'Data Analysis',
  'Premium',
  '["Statistical analysis", "Data visualization", "Pattern recognition", "Report generation", "CSV/JSON support"]'::jsonb,
  '["data", "analytics", "statistics", "insights"]'::jsonb,
  true,
  true,
  '{"model": "gpt-4", "temperature": 0.4, "maxTokens": 4000, "systemPrompt": "You are a data analysis expert. Help users understand their data through analysis and visualization."}'::jsonb
),
(
  'Content Creator AI',
  'Creative writing assistant for blogs, social media, marketing copy, and SEO-optimized content. Adapts tone and style to your brand voice.',
  NULL,
  'Content Creation',
  'Advanced',
  '["SEO optimization", "Multiple formats", "Tone adaptation", "Grammar checking", "Keyword integration"]'::jsonb,
  '["content", "writing", "marketing", "seo"]'::jsonb,
  true,
  true,
  '{"model": "gpt-4", "temperature": 0.7, "maxTokens": 2000, "systemPrompt": "You are a professional content creator. Write engaging, SEO-optimized content in various styles."}'::jsonb
),
(
  'Customer Support Bot',
  'Intelligent customer support Boomer_Ang that handles inquiries, provides solutions, escalates issues, and maintains professional communication 24/7.',
  NULL,
  'Customer Support',
  'Basic',
  '["24/7 availability", "Multi-language", "Issue tracking", "Knowledge base", "Escalation handling"]'::jsonb,
  '["support", "customer-service", "chatbot"]'::jsonb,
  true,
  true,
  '{"model": "gpt-3.5-turbo", "temperature": 0.5, "maxTokens": 1500, "systemPrompt": "You are a helpful customer support agent. Be professional, empathetic, and solution-oriented."}'::jsonb
);
