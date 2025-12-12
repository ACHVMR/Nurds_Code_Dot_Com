
-- Create artifacts table
CREATE TABLE IF NOT EXISTS artifacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_provider TEXT DEFAULT 'supabase', -- supabase, r2, gcs
  storage_path TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE artifacts ENABLE ROW LEVEL SECURITY;

-- Policies
-- Users can view own artifacts
CREATE POLICY "Users can view own artifacts" ON artifacts
  FOR SELECT USING (auth.uid() = user_id);
