-- Add missing columns to boomer_angs table
ALTER TABLE boomer_angs ADD COLUMN IF NOT EXISTS is_premade BOOLEAN DEFAULT false;
ALTER TABLE boomer_angs ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;
ALTER TABLE boomer_angs ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE boomer_angs ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'General';
ALTER TABLE boomer_angs ADD COLUMN IF NOT EXISTS effectiveness_level VARCHAR(50) DEFAULT 'Basic';
ALTER TABLE boomer_angs ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb;
ALTER TABLE boomer_angs ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb;
ALTER TABLE boomer_angs ADD COLUMN IF NOT EXISTS config JSONB DEFAULT '{}'::jsonb;
ALTER TABLE boomer_angs ADD COLUMN IF NOT EXISTS creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE boomer_angs ADD COLUMN IF NOT EXISTS price DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE boomer_angs ADD COLUMN IF NOT EXISTS rent_price DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE boomer_angs ADD COLUMN IF NOT EXISTS success_rate DECIMAL(5, 2) DEFAULT 0;
ALTER TABLE boomer_angs ADD COLUMN IF NOT EXISTS total_runs INTEGER DEFAULT 0;
ALTER TABLE boomer_angs ADD COLUMN IF NOT EXISTS tokens_per_run INTEGER DEFAULT 0;
ALTER TABLE boomer_angs ADD COLUMN IF NOT EXISTS rating DECIMAL(3, 2) DEFAULT 0;
ALTER TABLE boomer_angs ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0;
ALTER TABLE boomer_angs ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'stopped';
ALTER TABLE boomer_angs ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE boomer_angs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add constraints
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'valid_effectiveness') THEN
    ALTER TABLE boomer_angs ADD CONSTRAINT valid_effectiveness CHECK (effectiveness_level IN ('Basic', 'Advanced', 'Premium', 'Enterprise'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'valid_status') THEN
    ALTER TABLE boomer_angs ADD CONSTRAINT valid_status CHECK (status IN ('stopped', 'running', 'paused', 'error'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'valid_rating') THEN
    ALTER TABLE boomer_angs ADD CONSTRAINT valid_rating CHECK (rating >= 0 AND rating <= 5);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'valid_price') THEN
    ALTER TABLE boomer_angs ADD CONSTRAINT valid_price CHECK (price >= 0);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'valid_rent_price') THEN
    ALTER TABLE boomer_angs ADD CONSTRAINT valid_rent_price CHECK (rent_price >= 0);
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_boomer_angs_creator ON boomer_angs(creator_id);
CREATE INDEX IF NOT EXISTS idx_boomer_angs_category ON boomer_angs(category);
CREATE INDEX IF NOT EXISTS idx_boomer_angs_public ON boomer_angs(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_boomer_angs_premade ON boomer_angs(is_premade) WHERE is_premade = true;
CREATE INDEX IF NOT EXISTS idx_boomer_angs_rating ON boomer_angs(rating DESC);
CREATE INDEX IF NOT EXISTS idx_boomer_angs_created ON boomer_angs(created_at DESC);

-- Now insert the 8 premade Boomer_Angs
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
)
ON CONFLICT DO NOTHING;
