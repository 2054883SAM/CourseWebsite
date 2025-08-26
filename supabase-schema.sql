-- Create tables first
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    role TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
    membership TEXT NOT NULL DEFAULT 'free' CHECK (membership IN ('free', 'subscribed')),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    thumbnail_url TEXT,
    thumbnail_description TEXT,
    creator_id UUID REFERENCES users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    is_featured BOOLEAN DEFAULT false,
    -- Nouveaux champs pour les informations du cours
    ce_que_vous_allez_apprendre TEXT,
    prerequis TEXT,
    public_cible TEXT,
    duree_estimee TEXT,
    niveau_difficulte TEXT CHECK (niveau_difficulte IN ('debutant', 'intermediaire', 'avance')),
    playback_id TEXT,
    duration NUMERIC,
    chapters JSONB DEFAULT '[]'::jsonb
);

CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('active', 'refunded', 'disputed')),
  UNIQUE (user_id, course_id)
);

-- Create indexes for better performance
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_courses_creator_id ON courses(creator_id);
CREATE INDEX idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX idx_enrollments_status ON enrollments(status);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- Users table policies
-- Everyone can read basic user info
CREATE POLICY "Users are viewable by everyone."
ON users FOR SELECT
TO authenticated, anon
USING (true);

-- Allow users to create their initial profile during signup
CREATE POLICY "Users can create their initial profile."
ON users FOR INSERT
TO authenticated, anon
WITH CHECK (
    -- Ensure the ID matches the authenticated user or allow during signup
    (auth.uid() IS NULL AND role = 'student') OR 
    (auth.uid() = id AND role = 'student')
);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile."
ON users FOR UPDATE
TO authenticated
USING ((select auth.uid()) = id)
WITH CHECK ((select auth.uid()) = id);

-- Only admins can delete users
CREATE POLICY "Only admins can delete users."
ON users FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE id = (select auth.uid())
        AND role = 'admin'
    )
);

-- Courses table policies
-- Everyone can view published courses
CREATE POLICY "Courses are viewable by everyone."
ON courses FOR SELECT
TO authenticated, anon
USING (true);

-- Admins and teachers can create courses
CREATE POLICY "Admins and teachers can create courses."
ON courses FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM users
        WHERE id = (select auth.uid())
        AND (role = 'admin' OR role = 'teacher')
    )
);

-- Admins can update any course, teachers can update their own courses
CREATE POLICY "Admins can update any course, teachers their own."
ON courses FOR UPDATE
TO authenticated
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

-- Only admins can delete courses
CREATE POLICY "Only admins can delete courses."
ON courses FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE id = (select auth.uid())
        AND role = 'admin'
    )
);

-- Enrollments table policies
-- Users can view their own enrollments, admins can view all
CREATE POLICY "Users can view their own enrollments, admins can view all."
ON enrollments FOR SELECT
TO authenticated
USING (
    (select auth.uid()) = user_id 
    OR EXISTS (
        SELECT 1 FROM users
        WHERE id = (select auth.uid())
        AND role = 'admin'
    )
);

-- Students can create their own enrollments
CREATE POLICY "Students can create their own enrollments."
ON enrollments FOR INSERT
TO authenticated
WITH CHECK (
    (select auth.uid()) = user_id 
    AND EXISTS (
        SELECT 1 FROM users
        WHERE id = (select auth.uid())
        AND role = 'student'
    )
);

-- Only admins can update enrollments
CREATE POLICY "Only admins can update enrollments."
ON enrollments FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE id = (select auth.uid())
        AND role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM users
        WHERE id = (select auth.uid())
        AND role = 'admin'
    )
);

-- Only admins can delete enrollments
CREATE POLICY "Only admins can delete enrollments."
ON enrollments FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE id = (select auth.uid())
        AND role = 'admin'
    )
); 

-- Students can delete their own enrollments
CREATE POLICY "Students can delete their own enrollments."
ON enrollments FOR DELETE
TO authenticated
USING (
    (select auth.uid()) = user_id 
    AND EXISTS (
        SELECT 1 FROM users
        WHERE id = (select auth.uid())
        AND role = 'student'
    )
);

-- Create courses_progress table
CREATE TABLE courses_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    progress NUMERIC NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_id, course_id)
);

-- Create index for better performance
CREATE INDEX idx_courses_progress_user_id ON courses_progress(user_id);
CREATE INDEX idx_courses_progress_course_id ON courses_progress(course_id);

-- Enable RLS on courses_progress
ALTER TABLE courses_progress ENABLE ROW LEVEL SECURITY;

-- Policies for courses_progress (use unique names per action)
-- Users can view their own progress
CREATE POLICY "courses_progress_select_own"
ON courses_progress FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own progress
CREATE POLICY "courses_progress_insert_own"
ON courses_progress FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.enrollments e
    WHERE e.user_id = auth.uid()
      AND e.course_id = courses_progress.course_id
      AND e.status = 'active'
  )
);

-- Users can update their own progress
CREATE POLICY "courses_progress_update_own"
ON courses_progress FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.enrollments e
    WHERE e.user_id = auth.uid()
      AND e.course_id = courses_progress.course_id
      AND e.status = 'active'
  )
)
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.enrollments e
    WHERE e.user_id = auth.uid()
      AND e.course_id = courses_progress.course_id
      AND e.status = 'active'
  )
);

-- Admins can manage all progress records
CREATE POLICY "courses_progress_admin_all"
ON courses_progress FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()
        AND role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()
        AND role = 'admin'
    )
);

-- Row Level Security
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- Policies: students can view their own enrollments, admins can view all
CREATE POLICY "Users can view their own enrollments" 
  ON enrollments FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all enrollments" 
  ON enrollments FOR ALL 
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Storage bucket for course thumbnails
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-thumbnails', 'course-thumbnails', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Ensure RLS is enabled on storage objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow teachers and admins to upload course thumbnails
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

-- Allow public read access to course thumbnails
CREATE POLICY "Allow public read access to course thumbnails" ON storage.objects
FOR SELECT USING (bucket_id = 'course-thumbnails');

-- Allow teachers and admins to update course thumbnails
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

-- Allow teachers and admins to delete course thumbnails
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