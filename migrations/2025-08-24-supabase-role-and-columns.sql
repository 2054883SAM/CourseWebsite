-- Migration: Rename role 'creator' to 'teacher' and drop legacy columns
-- Date: 2025-08-24

BEGIN;

-- 1) Relax users.role constraint, migrate values, then enforce new constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

UPDATE users
SET role = 'teacher'
WHERE role = 'creator';

ALTER TABLE users
  ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'teacher', 'student'));

-- 2) Drop removed columns from courses and enrollments
ALTER TABLE courses
  DROP COLUMN IF EXISTS price,
  DROP COLUMN IF EXISTS paddle_price_id;

ALTER TABLE enrollments
  DROP COLUMN IF EXISTS paddle_transaction_id;

-- 3) Update policies to reflect 'teacher' role
-- Courses: insert policy
ALTER POLICY "Admins and creators can create courses." ON courses
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = (select auth.uid())
        AND (role = 'admin' OR role = 'teacher')
    )
  );

-- Courses: update policy (USING and WITH CHECK)
ALTER POLICY "Admins can update any course, creators their own." ON courses
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = (select auth.uid())
        AND (role = 'admin' OR (role = 'teacher' AND id = courses.creator_id))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = (select auth.uid())
        AND (role = 'admin' OR (role = 'teacher' AND id = courses.creator_id))
    )
  );

-- Storage policies: update role checks to include 'teacher' instead of 'creator'
ALTER POLICY "Allow creators and admins to upload course thumbnails" ON storage.objects
  WITH CHECK (
    bucket_id = 'course-thumbnails'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
        AND role IN ('admin', 'teacher')
    )
  );

ALTER POLICY "Allow creators and admins to update course thumbnails" ON storage.objects
  USING (
    bucket_id = 'course-thumbnails'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
        AND role IN ('admin', 'teacher')
    )
  )
  WITH CHECK (
    bucket_id = 'course-thumbnails'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
        AND role IN ('admin', 'teacher')
    )
  );

ALTER POLICY "Allow creators and admins to delete course thumbnails" ON storage.objects
  USING (
    bucket_id = 'course-thumbnails'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
        AND role IN ('admin', 'teacher')
    )
  );

COMMIT;


