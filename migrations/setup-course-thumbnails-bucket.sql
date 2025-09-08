-- setup-course-thumbnails-bucket.sql
-- Create and configure the course-thumbnails storage bucket

-- 1. Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-thumbnails', 'course-thumbnails', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Ensure RLS is enabled on storage objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow creators and admins to upload course thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Allow teachers and admins to upload course thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to course thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Allow creators and admins to update course thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Allow teachers and admins to update course thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Allow creators and admins to delete course thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Allow teachers and admins to delete course thumbnails" ON storage.objects;

-- 4. Policy INSERT - Allow authenticated creators and admins to upload course thumbnails
CREATE POLICY "Allow teachers and admins to upload course thumbnails" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'course-thumbnails' 
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'teacher')
  )
);

-- 5. Policy SELECT - Allow public read access to course thumbnails
CREATE POLICY "Allow public read access to course thumbnails" ON storage.objects
FOR SELECT USING (bucket_id = 'course-thumbnails');

-- 6. Policy UPDATE - Allow creators and admins to update course thumbnails
CREATE POLICY "Allow teachers and admins to update course thumbnails" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'course-thumbnails' 
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'teacher')
  )
) WITH CHECK (
  bucket_id = 'course-thumbnails' 
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'teacher')
  )
);

-- 7. Policy DELETE - Allow creators and admins to delete course thumbnails
CREATE POLICY "Allow teachers and admins to delete course thumbnails" ON storage.objects
FOR DELETE USING (
  bucket_id = 'course-thumbnails' 
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'teacher')
  )
);
