-- Create target_audiences table
CREATE TABLE IF NOT EXISTS target_audiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  characteristics TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Set up RLS (Row Level Security)
ALTER TABLE target_audiences ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to select only their own target audiences
CREATE POLICY "Users can view their own target audiences"
  ON target_audiences
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own target audiences
CREATE POLICY "Users can insert their own target audiences"
  ON target_audiences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own target audiences
CREATE POLICY "Users can update their own target audiences"
  ON target_audiences
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own target audiences
CREATE POLICY "Users can delete their own target audiences"
  ON target_audiences
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX target_audiences_user_id_idx ON target_audiences (user_id); 