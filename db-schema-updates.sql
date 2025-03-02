-- Add question_type and max_selections to questions table
ALTER TABLE questions 
ADD COLUMN question_type TEXT NOT NULL DEFAULT 'single_select' CHECK (question_type IN ('single_select', 'multi_select', 'free_text')),
ADD COLUMN max_selections INTEGER DEFAULT 1,
ADD COLUMN option_set_name TEXT;

-- Add free_text_value to options table to support "Other" options with text input
ALTER TABLE options
ADD COLUMN allows_free_text BOOLEAN DEFAULT FALSE,
ADD COLUMN option_key TEXT; -- For storing keys like 'BusinessStage.StartingOut'

-- Add free_text_response to responses table
ALTER TABLE responses
ADD COLUMN free_text_response TEXT;

-- Add question_category to questions table to group questions by stage
ALTER TABLE questions
ADD COLUMN category TEXT;

-- Create a new table for question stages
CREATE TABLE IF NOT EXISTS question_stages (
  id SERIAL PRIMARY KEY,
  step_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key to questions table to link to stages
ALTER TABLE questions
ADD COLUMN stage_id INTEGER REFERENCES question_stages(id);

-- Create a new table for option sets
CREATE TABLE IF NOT EXISTS option_sets (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key to options table to link to option sets
ALTER TABLE options
ADD COLUMN option_set_id INTEGER REFERENCES option_sets(id); 