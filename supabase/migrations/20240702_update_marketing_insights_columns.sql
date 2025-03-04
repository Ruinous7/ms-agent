-- Update marketing_messages and target_audience columns from TEXT[] to TEXT
ALTER TABLE profiles 
ALTER COLUMN marketing_messages TYPE TEXT,
ALTER COLUMN target_audience TYPE TEXT;

-- Set default values for existing NULL values
UPDATE profiles 
SET marketing_messages = '' 
WHERE marketing_messages IS NULL;

UPDATE profiles 
SET target_audience = '' 
WHERE target_audience IS NULL;

-- Add comment to explain the purpose of these columns
COMMENT ON COLUMN profiles.marketing_messages IS 'AI-generated marketing messages for the business as text';
COMMENT ON COLUMN profiles.target_audience IS 'AI-identified target audience segments for the business as text'; 