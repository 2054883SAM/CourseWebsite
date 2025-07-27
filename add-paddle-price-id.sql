-- Add the paddle_price_id field to the courses table
ALTER TABLE courses 
ADD paddle_price_id TEXT;

-- Add index for better performance when querying by paddle_price_id
CREATE INDEX idx_courses_paddle_price_id ON courses(paddle_price_id); 