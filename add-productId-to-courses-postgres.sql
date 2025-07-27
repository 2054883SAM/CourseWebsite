-- Add productId column to courses table for storing Paddle product IDs
ALTER TABLE courses ADD product_id TEXT;

-- Create an index for faster lookups by product_id
CREATE INDEX IF NOT EXISTS idx_courses_product_id ON courses(product_id); 