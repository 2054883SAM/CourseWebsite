-- Sample script to update existing courses with Paddle price IDs
-- In a production environment, you would replace these with actual price IDs from your Paddle dashboard

-- Update course with ID 'course-id-1' to use a specific price ID
UPDATE courses 
SET paddle_price_id = 'pri_01h7zcgj8j0m8fsgpvj21xq46b' 
WHERE id = 'course-id-1';

-- Update course with ID 'course-id-2' to use a different price ID
UPDATE courses 
SET paddle_price_id = 'pri_01h7zcgk8j0m8fsgpvj31xq46c' 
WHERE id = 'course-id-2';

-- Update all premium courses (price > 99.99) with a specific price ID
UPDATE courses 
SET paddle_price_id = 'pri_premium_plan_id' 
WHERE price > 99.99;

-- Update all standard courses (price between 20 and 99.99) with a specific price ID
UPDATE courses 
SET paddle_price_id = 'pri_standard_plan_id' 
WHERE price BETWEEN 20 AND 99.99;

-- Update all budget courses (price < 20) with a specific price ID
UPDATE courses 
SET paddle_price_id = 'pri_budget_plan_id' 
WHERE price < 20;

-- You can also use a case statement to assign different price IDs based on multiple conditions
UPDATE courses
SET paddle_price_id = 
  CASE 
    WHEN price >= 100 THEN 'pri_premium_tier'
    WHEN price >= 50 THEN 'pri_standard_tier'
    WHEN price >= 20 THEN 'pri_basic_tier'
    ELSE 'pri_intro_tier'
  END
WHERE paddle_price_id IS NULL; 