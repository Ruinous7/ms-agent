-- Function to add new columns to questions table
CREATE OR REPLACE FUNCTION add_question_columns()
RETURNS void AS $$
BEGIN
  -- Check if columns already exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'questions' AND column_name = 'question_type'
  ) THEN
    ALTER TABLE questions 
    ADD COLUMN question_type TEXT NOT NULL DEFAULT 'single_select' CHECK (question_type IN ('single_select', 'multi_select', 'free_text'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'questions' AND column_name = 'max_selections'
  ) THEN
    ALTER TABLE questions 
    ADD COLUMN max_selections INTEGER DEFAULT 1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'questions' AND column_name = 'option_set_name'
  ) THEN
    ALTER TABLE questions 
    ADD COLUMN option_set_name TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'questions' AND column_name = 'category'
  ) THEN
    ALTER TABLE questions 
    ADD COLUMN category TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'questions' AND column_name = 'stage_id'
  ) THEN
    ALTER TABLE questions 
    ADD COLUMN stage_id INTEGER;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to add new columns to options table
CREATE OR REPLACE FUNCTION add_option_columns()
RETURNS void AS $$
BEGIN
  -- Check if columns already exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'options' AND column_name = 'allows_free_text'
  ) THEN
    ALTER TABLE options 
    ADD COLUMN allows_free_text BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'options' AND column_name = 'option_key'
  ) THEN
    ALTER TABLE options 
    ADD COLUMN option_key TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'options' AND column_name = 'option_set_id'
  ) THEN
    ALTER TABLE options 
    ADD COLUMN option_set_id INTEGER;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to add new columns to responses table
CREATE OR REPLACE FUNCTION add_response_columns()
RETURNS void AS $$
BEGIN
  -- Check if columns already exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'responses' AND column_name = 'free_text_response'
  ) THEN
    ALTER TABLE responses 
    ADD COLUMN free_text_response TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to create question_stages table
CREATE OR REPLACE FUNCTION create_question_stages_table()
RETURNS void AS $$
BEGIN
  -- Check if table already exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'question_stages'
  ) THEN
    CREATE TABLE question_stages (
      id SERIAL PRIMARY KEY,
      step_number INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Add foreign key constraint to questions table
    ALTER TABLE questions
    ADD CONSTRAINT fk_questions_stage
    FOREIGN KEY (stage_id) REFERENCES question_stages(id);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to create option_sets table
CREATE OR REPLACE FUNCTION create_option_sets_table()
RETURNS void AS $$
BEGIN
  -- Check if table already exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'option_sets'
  ) THEN
    CREATE TABLE option_sets (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Add foreign key constraint to options table
    ALTER TABLE options
    ADD CONSTRAINT fk_options_option_set
    FOREIGN KEY (option_set_id) REFERENCES option_sets(id);
  END IF;
END;
$$ LANGUAGE plpgsql; 