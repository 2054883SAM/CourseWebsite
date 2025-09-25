-- Migration: Add last_accessed_at column to enrollments
-- Purpose: Track the most recent time a user accessed a course enrollment

-- Adds the column if it does not already exist
ALTER TABLE public.enrollments
  ADD COLUMN IF NOT EXISTS last_accessed_at timestamptz;

-- Optional backfill (disabled by default):
-- UPDATE public.enrollments SET last_accessed_at = NOW() WHERE last_accessed_at IS NULL;

-- Note: RLS policies should already allow updating this column when updating own enrollment rows.

