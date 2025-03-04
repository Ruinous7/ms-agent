-- Add marketing_messages and target_audience columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS marketing_messages TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS target_audience TEXT[] DEFAULT '{}';

-- Add comment to explain the purpose of these columns
COMMENT ON COLUMN profiles.marketing_messages IS 'AI-generated marketing messages for the business';
COMMENT ON COLUMN profiles.target_audience IS 'AI-identified target audience segments for the business'; 