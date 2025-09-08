-- Drop the incorrect index
DROP INDEX IF EXISTS idx_enrollments_status;

-- Recreate the index with the correct column name
CREATE INDEX idx_enrollments_status ON enrollments(status); 