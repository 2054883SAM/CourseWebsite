# Course Progress Integration Documentation

## Overview

The course progress tracking system has been updated to automatically calculate and store course-level progress based on section progress. This ensures that the overall course progress accurately reflects the time-based completion of individual sections.

## How It Works

### 1. Section Progress Update

When a user's section progress is updated via `/api/progress/section`, the system:

- Updates or creates the section progress record
- Automatically calculates and updates the overall course progress
- Stores the calculated progress in the `enrollments.progress` column

### 2. Course Progress Calculation

The course progress is calculated using a **time-based method**:

```typescript
// Formula: (sum of minutes watched) / (total course minutes) * 100
const overallProgress = (timeWatchedMinutes / totalCourseMinutes) * 100;

// Where timeWatchedMinutes is calculated as:
courseSections.forEach((section) => {
  const sectionProgress = userProgress.find((p) => p.section_id === section.id);
  if (sectionProgress && sectionProgress.progress_percentage > 0) {
    const sectionTimeWatched = (section.duration * sectionProgress.progress_percentage) / 100;
    timeWatchedMinutes += sectionTimeWatched;
  }
});
```

### 3. Example Calculation

If a course has 3 sections:

- Section 1: 10 minutes, 100% complete = 10 minutes watched
- Section 2: 15 minutes, 50% complete = 7.5 minutes watched
- Section 3: 20 minutes, 0% complete = 0 minutes watched

**Total course progress**: (10 + 7.5 + 0) / (10 + 15 + 20) = 17.5 / 45 = **39%**

## API Endpoints

### Section Progress Update

- **Endpoint**: `POST /api/progress/section?courseId={id}&sectionId={id}`
- **Body**: `{ progressPercentage: number, quizScore?: number, quizPassed?: boolean }`
- **Behavior**: Updates section progress AND automatically updates course progress

### Course Progress Update

- **Endpoint**: `POST /api/courses/progress/update`
- **Body**: `{ userId: string, courseId: string, progress?: number }`
- **Behavior**:
  - If `progress` is provided, uses that value
  - If `progress` is omitted, calculates from section progress
  - Uses the same time-based calculation method

## Benefits

1. **Automatic Synchronization**: Course progress is always up-to-date with section progress
2. **Time-Based Accuracy**: Progress reflects actual time spent watching content
3. **Consistent Calculation**: Both APIs use the same calculation method
4. **Real-Time Updates**: Progress is updated immediately when sections are completed

## Database Schema

### enrollments.progress

Course progress is stored directly on the user's enrollment row as a numeric percentage (0..100).

### section_progress Table

```sql
CREATE TABLE section_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    progress_percentage NUMERIC NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    completed BOOLEAN NOT NULL DEFAULT false,
    quiz_score NUMERIC CHECK (quiz_score >= 0 AND quiz_score <= 100),
    quiz_passed BOOLEAN,
    last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_id, section_id)
);
```

## Frontend Integration

The frontend (e.g., `/my-learning/[courseId]/page.tsx`) uses `getComprehensiveCourseProgress()` which:

- Calculates progress using the same time-based method
- Displays accurate progress information
- Shows time watched vs total course time
- Shows sections completed vs total sections

This ensures consistency between the stored course progress and the displayed progress.
