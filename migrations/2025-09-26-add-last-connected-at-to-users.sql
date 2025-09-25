-- Add last_connected_at column to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS last_connected_at TIMESTAMPTZ;

-- Optional: backfill existing rows to NULL (no-op but explicit)
UPDATE public.users SET last_connected_at = last_connected_at WHERE last_connected_at IS NULL;

-- RLS unchanged: updates already allowed for own user by existing policies


