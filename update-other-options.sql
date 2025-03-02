-- Update all options with "Other" or "אחר" to allow free text input
UPDATE options
SET allows_free_text = TRUE
WHERE display = 'Other' OR he_value = 'אחר' OR display LIKE '%other%' OR he_value LIKE '%אחר%';

-- Make sure all options have option_key values
UPDATE options
SET option_key = COALESCE(option_key, 'option_' || id)
WHERE option_key IS NULL;

-- Set option_key for "Other" options if not already set
UPDATE options
SET option_key = 
  CASE 
    WHEN display = 'Other' OR he_value = 'אחר' THEN 'Other'
    WHEN display LIKE '%other%' OR he_value LIKE '%אחר%' THEN 'Other_' || id
    ELSE option_key
  END
WHERE display = 'Other' OR he_value = 'אחר' OR display LIKE '%other%' OR he_value LIKE '%אחר%'; 