-- Migration: Add membership column to users (free | subscribed)
-- Date: 2025-08-25

BEGIN;

-- 1) Add column with temporary relaxed constraint to allow existing rows
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS membership TEXT;

-- 2) Backfill nulls to default 'free'
UPDATE users SET membership = 'free' WHERE membership IS NULL;

-- 3) Enforce allowed values with CHECK constraint and NOT NULL
ALTER TABLE users
  ADD CONSTRAINT users_membership_check CHECK (membership IN ('free', 'subscribed'));

ALTER TABLE users
  ALTER COLUMN membership SET NOT NULL;

-- 4) Optional: set DEFAULT for future inserts
ALTER TABLE users
  ALTER COLUMN membership SET DEFAULT 'free';

COMMIT;


