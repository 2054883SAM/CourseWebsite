-- Create tables first
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    role TEXT NOT NULL CHECK (role IN ('admin', 'creator', 'student')),
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
    price NUMERIC NOT NULL,
    creator_id UUID REFERENCES users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    is_featured BOOLEAN DEFAULT false,
    -- Nouveaux champs pour les informations du cours
    ce_que_vous_allez_apprendre TEXT,
    prerequis TEXT,
    public_cible TEXT,
    duree_estimee TEXT,
    niveau_difficulte TEXT CHECK (niveau_difficulte IN ('debutant', 'intermediaire', 'avance'))
);

CREATE TABLE sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    playback_id TEXT,
    duration NUMERIC,
    UNIQUE(course_id, "order")
);

CREATE TABLE subtitles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID REFERENCES sections(id) ON DELETE CASCADE NOT NULL,
    language_code TEXT NOT NULL,
    subtitle_url TEXT NOT NULL,
    UNIQUE(section_id, language_code)
);

CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    payment_status TEXT NOT NULL CHECK (payment_status IN ('paid', 'pending')),
    UNIQUE(user_id, course_id)
);

-- Create indexes for better performance
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_courses_creator_id ON courses(creator_id);
CREATE INDEX idx_sections_course_id ON sections(course_id);
CREATE INDEX idx_sections_order ON sections(course_id, "order");
CREATE INDEX idx_subtitles_section_id ON subtitles(section_id);
CREATE INDEX idx_subtitles_language ON subtitles(section_id, language_code);
CREATE INDEX idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX idx_enrollments_status ON enrollments(payment_status);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtitles ENABLE ROW LEVEL SECURITY;
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

-- Admins and creators can create courses
CREATE POLICY "Admins and creators can create courses."
ON courses FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM users
        WHERE id = (select auth.uid())
        AND (role = 'admin' OR role = 'creator')
    )
);

-- Admins can update any course, creators can update their own courses
CREATE POLICY "Admins can update any course, creators their own."
ON courses FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE id = (select auth.uid())
        AND (role = 'admin' OR (role = 'creator' AND id = courses.creator_id))
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM users
        WHERE id = (select auth.uid())
        AND (role = 'admin' OR (role = 'creator' AND id = courses.creator_id))
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

-- Sections table policies
-- Enrolled students, creators of the course, and admins can view sections
CREATE POLICY "Sections are viewable by enrolled students, course creators, and admins."
ON sections FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users u
        LEFT JOIN enrollments e ON e.user_id = u.id AND e.course_id = sections.course_id
        WHERE u.id = (select auth.uid())
        AND (
            u.role = 'admin' 
            OR (u.role = 'creator' AND u.id = (SELECT creator_id FROM courses WHERE id = sections.course_id))
            OR (u.role = 'student' AND e.payment_status = 'paid')
        )
    )
);

-- Only admins can create sections
CREATE POLICY "Only admins can create sections."
ON sections FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM users
        WHERE id = (select auth.uid())
        AND role = 'admin'
    )
);

-- Only admins can update sections
CREATE POLICY "Only admins can update sections."
ON sections FOR UPDATE
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

-- Only admins can delete sections
CREATE POLICY "Only admins can delete sections."
ON sections FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE id = (select auth.uid())
        AND role = 'admin'
    )
);

-- Subtitles table policies
-- Enrolled students, creators of the course, and admins can view subtitles
CREATE POLICY "Subtitles are viewable by enrolled students, course creators, and admins."
ON subtitles FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users u
        LEFT JOIN enrollments e ON e.user_id = u.id 
        LEFT JOIN sections s ON s.id = subtitles.section_id
        WHERE u.id = (select auth.uid())
        AND (
            u.role = 'admin'
            OR (u.role = 'creator' AND u.id = (SELECT creator_id FROM courses WHERE id = s.course_id))
            OR (u.role = 'student' AND e.payment_status = 'paid' AND e.course_id = s.course_id)
        )
    )
);

-- Only admins can create subtitles
CREATE POLICY "Only admins can create subtitles."
ON subtitles FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM users
        WHERE id = (select auth.uid())
        AND role = 'admin'
    )
);

-- Only admins can update subtitles
CREATE POLICY "Only admins can update subtitles."
ON subtitles FOR UPDATE
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

-- Only admins can delete subtitles
CREATE POLICY "Only admins can delete subtitles."
ON subtitles FOR DELETE
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