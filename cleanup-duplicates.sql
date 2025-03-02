-- Identify duplicate questions
WITH duplicate_questions AS (
  SELECT 
    id,
    text,
    he_text,
    stage_id,
    ROW_NUMBER() OVER (PARTITION BY text, he_text, stage_id ORDER BY id) as row_num
  FROM questions
)
SELECT * FROM duplicate_questions WHERE row_num > 1;

-- Identify duplicate options
WITH duplicate_options AS (
  SELECT 
    id,
    question_id,
    display,
    he_value,
    option_set_id,
    ROW_NUMBER() OVER (PARTITION BY question_id, display, he_value ORDER BY id) as row_num
  FROM options
)
SELECT * FROM duplicate_options WHERE row_num > 1;

-- First, identify responses that reference duplicate options
WITH duplicate_options AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (PARTITION BY question_id, display, he_value ORDER BY id) as row_num
  FROM options
)
SELECT r.* 
FROM responses r
JOIN duplicate_options d ON r.option_id = d.id
WHERE d.row_num > 1;

-- Delete responses that reference duplicate options
WITH duplicate_options AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (PARTITION BY question_id, display, he_value ORDER BY id) as row_num
  FROM options
)
DELETE FROM responses
WHERE option_id IN (
  SELECT id FROM duplicate_options WHERE row_num > 1
);

-- Now delete duplicate options
WITH duplicate_options AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (PARTITION BY question_id, display, he_value ORDER BY id) as row_num
  FROM options
)
DELETE FROM options
WHERE id IN (
  SELECT id FROM duplicate_options WHERE row_num > 1
);

-- Identify responses that reference duplicate questions
WITH duplicate_questions AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (PARTITION BY text, he_text, stage_id ORDER BY id) as row_num
  FROM questions
)
SELECT r.* 
FROM responses r
JOIN duplicate_questions d ON r.question_id = d.id
WHERE d.row_num > 1;

-- Delete responses that reference duplicate questions
WITH duplicate_questions AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (PARTITION BY text, he_text, stage_id ORDER BY id) as row_num
  FROM questions
)
DELETE FROM responses
WHERE question_id IN (
  SELECT id FROM duplicate_questions WHERE row_num > 1
);

-- Delete duplicate questions
WITH duplicate_questions AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (PARTITION BY text, he_text, stage_id ORDER BY id) as row_num
  FROM questions
)
DELETE FROM questions
WHERE id IN (
  SELECT id FROM duplicate_questions WHERE row_num > 1
);

-- Clean up orphaned options (options without valid questions)
DELETE FROM options
WHERE question_id NOT IN (SELECT id FROM questions);

-- Clean up orphaned responses (responses without valid questions or options)
DELETE FROM responses
WHERE question_id NOT IN (SELECT id FROM questions)
   OR (option_id IS NOT NULL AND option_id NOT IN (SELECT id FROM options)); 