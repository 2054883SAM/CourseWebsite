-- Add questions JSONB column to sections with an empty array default
ALTER TABLE sections
ADD COLUMN IF NOT EXISTS questions JSONB DEFAULT '[]'::jsonb;


