
-- Create agent_jobs table
CREATE TABLE IF NOT EXISTS agent_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  trace_id TEXT NOT NULL,
  job_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, running, completed, failed
  payload_pointer TEXT, -- Reference to input data (could be storage path or JSON)
  result_pointer TEXT, -- Reference to output data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE agent_jobs ENABLE ROW LEVEL SECURITY;

-- Policies
-- Users can view their own jobs
CREATE POLICY "Users can view own jobs" ON agent_jobs
  FOR SELECT USING (auth.uid() = user_id);

-- Service Role (Agents) has full access (implicit, but explicit policy for specific roles if needed)
-- Note: Service Role bypasses RLS by default.
