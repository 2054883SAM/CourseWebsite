-- Move course progress storage to enrollments.progress and drop courses_progress

-- 1) Add progress column to enrollments (idempotent)
ALTER TABLE public.enrollments
  ADD COLUMN IF NOT EXISTS progress numeric;

-- Initialize missing values to 0 and enforce default
ALTER TABLE public.enrollments
  ALTER COLUMN progress SET DEFAULT 0;

UPDATE public.enrollments
SET progress = COALESCE(progress, 0)
WHERE progress IS NULL;

-- Add range constraint for 0..100 if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'enrollments_progress_range'
      AND conrelid = 'public.enrollments'::regclass
  ) THEN
    ALTER TABLE public.enrollments
      ADD CONSTRAINT enrollments_progress_range CHECK (progress >= 0 AND progress <= 100);
  END IF;
END $$;

-- Make column NOT NULL now that defaults/backfill are applied
ALTER TABLE public.enrollments
  ALTER COLUMN progress SET NOT NULL;

-- 2) Backfill existing progress from courses_progress when present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'courses_progress'
  ) THEN
    UPDATE public.enrollments e
    SET progress = LEAST(100, GREATEST(0, COALESCE(cp.progress, 0)))
    FROM public.courses_progress cp
    WHERE cp.user_id = e.user_id
      AND cp.course_id = e.course_id;
  END IF;
END $$;

-- 3) Ensure RLS policy exists so students can update their own enrollment rows (to write progress)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'enrollments'
      AND policyname = 'Students can update their own enrollments.'
  ) THEN
    CREATE POLICY "Students can update their own enrollments."
      ON public.enrollments
      FOR UPDATE
      TO authenticated
      USING ((auth.uid() = user_id))
      WITH CHECK ((auth.uid() = user_id));
  END IF;
END $$;

-- 4) Drop the legacy courses_progress table (policies and indexes will drop with CASCADE)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'courses_progress'
  ) THEN
    DROP TABLE public.courses_progress CASCADE;
  END IF;
END $$;


