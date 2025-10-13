-- Add Stripe customer id to users
ALTER TABLE users
ADD COLUMN IF NOT EXISTS customer_id TEXT;

-- Optional index for lookups by customer id
CREATE INDEX IF NOT EXISTS idx_users_customer_id ON users(customer_id);

