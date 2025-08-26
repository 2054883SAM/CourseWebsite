-- Migration: Add membership column to users
-- Date: 2025-08-25

BEGIN;

-- Add column with default and constraint
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS membership TEXT NOT NULL DEFAULT 'free';

-- Ensure only allowed values
ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_membership_check;

ALTER TABLE users
  ADD CONSTRAINT users_membership_check CHECK (membership IN ('free', 'subscribed'));

-- Optional: backfill nulls to default if any existed before NOT NULL applied (defensive)
UPDATE users SET membership = 'free' WHERE membership IS NULL;

COMMIT;


