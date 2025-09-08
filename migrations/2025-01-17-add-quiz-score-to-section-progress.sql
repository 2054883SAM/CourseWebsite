-- Add quiz_score field to section_progress table
-- This tracks the quiz score separately from video progress
-- quiz_score: 0-100 score, NULL if quiz not attempted/completed
-- quiz_passed: true if score >= 70%, false if score < 70%, NULL if not attempted

ALTER TABLE section_progress 
ADD COLUMN quiz_score NUMERIC CHECK (quiz_score >= 0 AND quiz_score <= 100),
ADD COLUMN quiz_passed BOOLEAN DEFAULT NULL;

-- Create index for quiz tracking
CREATE INDEX idx_section_progress_quiz_passed ON section_progress(quiz_passed);

-- Update existing records where completed=true to also have quiz_passed=true
-- This ensures backward compatibility for existing completed sections
UPDATE section_progress 
SET quiz_passed = true 
WHERE completed = true AND quiz_passed IS NULL;
