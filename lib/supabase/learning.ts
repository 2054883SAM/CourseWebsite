import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';
import { Course, Enrollment } from './types';

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
          price,
          created_at,
          creator_id
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

    // Map into your EnrolledCourse shape…
    const enrolledCourses: EnrolledCourse[] = data.map((row: any) => {
      let progress = 0;
      let lastAccessedAt: string | undefined;
      try {
        if (typeof window !== 'undefined') {
          const key = `course-progress-${row.course.id}`;
          const saved = localStorage.getItem(key);
          if (saved) {
            const obj = JSON.parse(saved);
            progress = obj.progress ?? 0;
            lastAccessedAt = obj.lastUpdated;
          }
        }
      } catch (e) {
        console.warn('Could not read progress:', e);
      }

      return {
        ...(row.course as Course),
        progress,
        lastAccessedAt,
        enrollment: {
          id: row.id,
          status: row.status,
          enrolled_at: row.enrolled_at,
        },
      };
    });

    // Client‑side sorting for progress/lastAccessed (if needed)…

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
