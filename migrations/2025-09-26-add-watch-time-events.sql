-- Track per-user watch time events for analytics and weekly rollups
-- Append-only design with idempotency per user/section/minute bucket

-- Table
CREATE TABLE watch_time_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    occurred_at TIMESTAMPTZ NOT NULL,
    seconds_watched INTEGER NOT NULL CHECK (seconds_watched >= 0 AND seconds_watched <= 3600),
    event_source TEXT NOT NULL DEFAULT 'web' CHECK (event_source IN ('web','ios','android','other')),
    session_id UUID,
    playback_id TEXT,
    occurred_at_bucket TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Idempotency: prevent double-counting per user/section/minute
    UNIQUE (user_id, section_id, occurred_at_bucket)
);

-- Indexes for common query patterns
CREATE INDEX idx_watch_time_events_user_course_time ON watch_time_events(user_id, course_id, occurred_at);
CREATE INDEX idx_watch_time_events_course_time ON watch_time_events(course_id, occurred_at);
CREATE INDEX idx_watch_time_events_occurred_at ON watch_time_events(occurred_at);

-- Enable RLS
ALTER TABLE watch_time_events ENABLE ROW LEVEL SECURITY;

-- Users can view their own events
CREATE POLICY "watch_time_events_select_own"
ON watch_time_events FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own events (must be enrolled and active)
CREATE POLICY "watch_time_events_insert_own"
ON watch_time_events FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.enrollments e
    WHERE e.user_id = auth.uid()
      AND e.course_id = watch_time_events.course_id
      AND e.status = 'active'
  )
);

-- Admins can manage all events
CREATE POLICY "watch_time_events_admin_all"
ON watch_time_events FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND u.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND u.role = 'admin'
  )
);


