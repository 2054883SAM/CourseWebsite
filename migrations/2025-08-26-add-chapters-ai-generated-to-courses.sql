-- Migration: Add chapters_ai_generated to courses
-- Date: 2025-08-26

BEGIN;

-- 1) Add column (nullable initially for safe backfill)
ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS chapters_ai_generated BOOLEAN;

-- 2) Backfill existing rows to false
UPDATE courses SET chapters_ai_generated = false WHERE chapters_ai_generated IS NULL;

-- 3) Enforce default and not null for future inserts/updates
ALTER TABLE courses
  ALTER COLUMN chapters_ai_generated SET DEFAULT false;

ALTER TABLE courses
  ALTER COLUMN chapters_ai_generated SET NOT NULL;

COMMIT;


