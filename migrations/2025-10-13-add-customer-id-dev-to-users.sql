-- Add Stripe customer id for development to users
ALTER TABLE users
ADD COLUMN IF NOT EXISTS customer_id_dev TEXT;

-- Optional index for lookups by dev customer id
CREATE INDEX IF NOT EXISTS idx_users_customer_id_dev ON users(customer_id_dev);


