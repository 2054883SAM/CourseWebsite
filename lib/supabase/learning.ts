import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';
import { Course, Enrollment } from './types';
import { convertAndValidateChapters, normalizeChaptersToVideo } from '@/lib/utils/chapters';
import { VideoChapter } from '@/lib/types/vdocipher';

/**
 * Course with additional learning progress data
 */
export interface EnrolledCourse extends Course {
  progress: number;
  lastAccessedAt?: string;
  enrollment: {
    id: string;
    status: 'active' | 'refunded' | 'disputed';
    enrolled_at: string;
  };
  playbackId?: string;
  chapters?: VideoChapter[];
}

// Interface for the nested course data in the Supabase query response
interface CourseData {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  created_at: string;
  creator_id: string;
  playback_id?: string;
  chapters?: unknown;
}

// Interface for the enrollment data with nested course
interface EnrollmentWithCourse {
  id: string;
  status: 'active' | 'refunded' | 'disputed';
  enrolled_at: string;
  course: CourseData;
}

/**
 * Query parameters for fetching enrolled courses
 */
export interface EnrolledCoursesParams {
  limit?: number;
  offset?: number;
  sortBy?: 'title' | 'progress' | 'lastAccessed' | 'enrolledAt';
  sortOrder?: 'asc' | 'desc';
  status?: 'active' | 'refunded' | 'disputed' | 'all';
}

/**
 * Get all courses a user is enrolled in with progress information
 * @param userId User ID to get enrollments for
 * @param params Query parameters for filtering and sorting
 * @returns Array of courses with progress information
 */
export async function getEnrolledCourses(
  userId: string | undefined,
  params: EnrolledCoursesParams = {}
): Promise<{
  data: EnrolledCourse[];
  error: string | null;
  count: number;
}> {
  if (!userId) {
    console.log('No user ID provided');
    return {
      data: [],
      error: 'User not authenticated',
      count: 0,
    };
  }

  try {
    console.log(`Fetching enrollments for user: ${userId}`);

    // ← use the server‑side helper and pass in Next's cookies
    const supabase = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Set up default params
    const {
      limit = 50,
      offset = 0,
      sortBy = 'enrolledAt',
      sortOrder = 'desc',
      status = 'all',
    } = params;

    console.log(
      `Query params: limit=${limit}, offset=${offset}, sortBy=${sortBy}, sortOrder=${sortOrder}, status=${status}`
    );

    // Determine order by field
    let orderBy: string;
    switch (sortBy) {
      case 'title':
        orderBy = 'course.title';
        break;
      default:
        orderBy = 'enrolled_at';
        break;
    }

    // Build the base query
    let query = supabase
      .from('enrollments')
      .select(
        `
        id,
        status,
        enrolled_at,
        course:course_id (
          id,
          title,
          description,
          thumbnail_url,
          created_at,
          creator_id,
          playback_id
        )
        `,
        { count: 'exact' }
      )
      .eq('user_id', userId);

    // Apply status filter only if not 'all'
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    // Execute the query
    const { data, error, count } = await query
      .order(orderBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Supabase error:', error);
      return { data: [], error: error.message, count: 0 };
    }
    if (!data?.length) {
      console.log('No enrollments found for user:', userId);
      return { data: [], error: null, count: count ?? 0 };
    }

    // Build a map of persisted progress per course for this user
    let courseIdToProgress: Record<string, { progress: number; updated_at?: string }> = {};
    try {
      const courseIds = data
        .map((row: any) => (Array.isArray(row.course) ? row.course[0]?.id : row.course?.id))
        .filter(Boolean);
      if (courseIds.length > 0) {
        const { data: progressRows, error: progressError } = await supabase
          .from('courses_progress')
          .select('course_id, progress, updated_at')
          .eq('user_id', userId)
          .in('course_id', courseIds as string[]);

        if (!progressError && progressRows) {
          courseIdToProgress = progressRows.reduce(
            (acc: Record<string, { progress: number; updated_at?: string }>, row: any) => {
              acc[row.course_id] = {
                progress: Number(row.progress ?? 0),
                updated_at: row.updated_at,
              };
              return acc;
            },
            {}
          );
        }
      }
    } catch (e) {
      console.warn('Could not fetch persistent course progress:', e);
    }

    // Map into your EnrolledCourse shape
    const enrolledCourses: EnrolledCourse[] = data.map((row: any) => {
      // Cast the row data to our expected structure
      const enrollment = {
        id: row.id,
        status: row.status,
        enrolled_at: row.enrolled_at,
      };

      // Make sure we correctly handle the course data
      const rawCourseData = Array.isArray(row.course) ? row.course[0] : row.course;
      // Explicitly cast to CourseData to satisfy TypeScript
      const courseData: CourseData = {
        id: rawCourseData.id,
        title: rawCourseData.title,
        description: rawCourseData.description,
        thumbnail_url: rawCourseData.thumbnail_url,
        created_at: rawCourseData.created_at,
        creator_id: rawCourseData.creator_id,
        playback_id: rawCourseData.playback_id,
      };

      // Prefer persisted DB progress; fallback to localStorage
      let progress = courseIdToProgress[courseData.id]?.progress ?? 0;
      let lastAccessedAt: string | undefined = courseIdToProgress[courseData.id]?.updated_at;
      if (progress === 0 || lastAccessedAt === undefined) {
        try {
          if (typeof window !== 'undefined') {
            const key = `course-progress-${courseData.id}`;
            const saved = localStorage.getItem(key);
            if (saved) {
              const obj = JSON.parse(saved);
              progress = obj.progress ?? progress;
              lastAccessedAt = lastAccessedAt ?? obj.lastUpdated;
            }
          }
        } catch (e) {
          console.warn('Could not read local progress:', e);
        }
      }

      // Create the enrolled course object with the correct types
      const enrolledCourse: EnrolledCourse = {
        id: courseData.id,
        title: courseData.title,
        description: courseData.description,
        thumbnail_url: courseData.thumbnail_url,
        created_at: courseData.created_at,
        creator_id: courseData.creator_id,
        progress: progress,
        lastAccessedAt: lastAccessedAt,
        playbackId: courseData.playback_id,
        enrollment: enrollment,
      };

      return enrolledCourse;
    });

    console.log(`Returning ${enrolledCourses.length} enrolled course(s)`);
    return { data: enrolledCourses, error: null, count: count ?? 0 };
  } catch (err) {
    console.error('Failed to get enrolled courses:', err);
    return {
      data: [],
      error: 'Failed to fetch enrolled courses',
      count: 0,
    };
  }
}

/**
 * Get a single enrolled course by courseId
 * @param userId User ID to check enrollment for
 * @param courseId Course ID to fetch
 * @returns The enrolled course with progress information or null if not enrolled
 */
export async function getEnrolledCourse(
  userId: string | undefined,
  courseId: string
): Promise<{
  data: EnrolledCourse | null;
  error: string | null;
}> {
  if (!userId) {
    console.log('No user ID provided');
    return {
      data: null,
      error: 'User not authenticated',
    };
  }

  if (!courseId) {
    console.log('No course ID provided');
    return {
      data: null,
      error: 'Course ID is required',
    };
  }

  try {
    console.log(`Fetching enrollment for user: ${userId} and course: ${courseId}`);

    const supabase = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Query for the specific course enrollment
    const { data, error } = await supabase
      .from('enrollments')
      .select(
        `
        id,
        status,
        enrolled_at,
        course:course_id (
          id,
          title,
          description,
          thumbnail_url,
          created_at,
          creator_id,
          playback_id,
          chapters
        )
      `
      )
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .eq('status', 'active')
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return { data: null, error: error.message };
    }

    if (!data) {
      console.log('No enrollment found for user:', userId, 'and course:', courseId);
      return { data: null, error: 'Not enrolled in this course' };
    }

    // Extract the course data from the response (Supabase may return it as an array)
    const courseData = (Array.isArray(data.course) ? data.course[0] : data.course) as CourseData;

    // Fetch persisted progress, fallback to localStorage
    let progress = 0;
    let lastAccessedAt: string | undefined;
    try {
      const { data: progressRow, error: progressError } = await supabase
        .from('courses_progress')
        .select('progress, updated_at')
        .eq('user_id', userId)
        .eq('course_id', courseData.id)
        .maybeSingle();

      if (!progressError && progressRow) {
        progress = Number(progressRow.progress ?? 0);
        lastAccessedAt = progressRow.updated_at ?? undefined;
      }
    } catch (e) {
      console.warn('Could not fetch persisted progress:', e);
    }
    if (lastAccessedAt === undefined) {
      try {
        if (typeof window !== 'undefined') {
          const key = `course-progress-${courseData.id}`;
          const saved = localStorage.getItem(key);
          if (saved) {
            const obj = JSON.parse(saved);
            progress = obj.progress ?? progress;
            lastAccessedAt = obj.lastUpdated ?? lastAccessedAt;
          }
        }
      } catch (e) {
        console.warn('Could not read local progress:', e);
      }
    }

    // Preserve last accessed timestamp from DB if available; otherwise update local storage now
    const now = new Date().toISOString();
    if (!lastAccessedAt) {
      try {
        if (typeof window !== 'undefined') {
          const key = `course-progress-${courseData.id}`;
          localStorage.setItem(
            key,
            JSON.stringify({
              progress: progress,
              lastUpdated: now,
            })
          );
          lastAccessedAt = now;
        }
      } catch (e) {
        console.warn('Could not update last accessed timestamp:', e);
      }
    }

    // Create the enrolled course object with the correct types
    const enrolledCourse: EnrolledCourse = {
      id: courseData.id,
      title: courseData.title,
      description: courseData.description,
      thumbnail_url: courseData.thumbnail_url,
      created_at: courseData.created_at,
      creator_id: courseData.creator_id,
      progress: progress,
      lastAccessedAt: lastAccessedAt ?? now,
      // Normalize chapters JSONB -> VideoChapter[] safely
      chapters: normalizeChaptersToVideo((courseData as any).chapters),
      enrollment: {
        id: data.id,
        status: data.status,
        enrolled_at: data.enrolled_at,
      },
      playbackId: courseData.playback_id,
    };

    return { data: enrolledCourse, error: null };
  } catch (err) {
    console.error('Failed to get enrolled course:', err);
    return {
      data: null,
      error: 'Failed to fetch enrolled course',
    };
  }
}
