-- Add chapters JSONB field to courses table
ALTER TABLE courses
ADD COLUMN chapters JSONB DEFAULT '[]'::jsonb;

-- Create an index for better performance when querying chapters
CREATE INDEX idx_courses_chapters ON courses USING GIN (chapters);

-- Add validation check to ensure chapters array has valid structure
ALTER TABLE courses
ADD CONSTRAINT chapters_validation CHECK (
  chapters IS NULL OR (
    jsonb_typeof(chapters) = 'array' AND
    (
      SELECT bool_and(
        jsonb_typeof(chapter->'id') = 'string' AND
        jsonb_typeof(chapter->'title') = 'string' AND
        jsonb_typeof(chapter->'start_time') = 'number' AND
        (chapter->>'duration' IS NULL OR jsonb_typeof(chapter->'duration') = 'number') AND
        (chapter->>'description' IS NULL OR jsonb_typeof(chapter->'description') = 'string') AND
        (chapter->>'thumbnail_url' IS NULL OR jsonb_typeof(chapter->'thumbnail_url') = 'string')
      )
      FROM jsonb_array_elements(chapters) chapter
    )
  )
);

-- Add validation check to ensure chapters are sequential and non-overlapping
ALTER TABLE courses
ADD CONSTRAINT chapters_sequential CHECK (
  chapters IS NULL OR (
    WITH chapter_times AS (
      SELECT 
        (chapter->>'start_time')::numeric as start_time,
        CASE 
          WHEN chapter->>'duration' IS NOT NULL 
          THEN (chapter->>'start_time')::numeric + (chapter->>'duration')::numeric
          ELSE NULL
        END as end_time,
        row_number() OVER (ORDER BY (chapter->>'start_time')::numeric) as rn
      FROM jsonb_array_elements(chapters) chapter
    ),
    chapter_pairs AS (
      SELECT 
        ct1.start_time as current_start,
        ct1.end_time as current_end,
        ct2.start_time as next_start
      FROM chapter_times ct1
      LEFT JOIN chapter_times ct2 ON ct1.rn = ct2.rn - 1
    )
    SELECT bool_and(
      -- Ensure start times are sequential
      (next_start IS NULL OR current_start < next_start) AND
      -- Ensure no overlap when duration is present
      (current_end IS NULL OR next_start IS NULL OR current_end <= next_start)
    )
    FROM chapter_pairs
  )
);