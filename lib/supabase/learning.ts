import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
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
      count: 0 
    };
  }

  try {
    console.log(`Fetching enrollments for user: ${userId}`);
    const supabase = createClientComponentClient<Database>();
    
    // Set up default params
    const {
      limit = 50,
      offset = 0,
      sortBy = 'enrolledAt',
      sortOrder = 'desc',
      status = 'active'
    } = params;

    console.log(`Query params: limit=${limit}, offset=${offset}, sortBy=${sortBy}, sortOrder=${sortOrder}, status=${status}`);

    // First, check if both status and payment_status fields exist
    // There appears to be a discrepancy in the database schema
    console.log(`Checking enrollment schema for user ${userId}`);

    // Check the specific enrollment mentioned by user
    const { data: specificEnrollment } = await supabase
      .from('enrollments')
      .select('*')
      .eq('id', 'b59557ec-3df2-45f6-8184-05284dea5dcf')
      .maybeSingle();
      
    console.log('Found specific enrollment:', specificEnrollment);
    
    // Build the query without status filter first to check all enrollments
    let query = supabase
      .from('enrollments')
      .select(`
        id,
        user_id,
        course_id,
        enrolled_at,
        status,
        courses:course_id (
          id,
          title,
          description,
          thumbnail_url,
          price,
          created_at,
          creator_id
        )
      `, { count: 'exact' })
      .eq('user_id', userId);

    // Add pagination
    query = query.range(offset, offset + limit - 1);

    // Add sorting
    let orderBy: string;
    switch (sortBy) {
      case 'title':
        orderBy = 'courses.title';
        break;
      case 'progress':
        // Default sorting for now since progress is calculated client-side
        orderBy = 'enrolled_at';
        break;
      case 'lastAccessed':
        // Default sorting for now since lastAccessed is calculated client-side
        orderBy = 'enrolled_at';
        break;
      case 'enrolledAt':
      default:
        orderBy = 'enrolled_at';
        break;
    }
    
    // Execute query without status filter first
    const { data: allData, error: allError, count: allCount } = await query.order(orderBy, { ascending: sortOrder === 'asc' });
    
    console.log(`Query without status filter returned ${allData?.length || 0} enrollment(s)`, allData);
    
    if (allError) {
      console.error('Error fetching all enrolled courses:', allError);
    }
    
    // Now try with status filter if needed and if previous query returned results
    let data = allData;
    let error = allError;
    let count = allCount;
    
    // Only apply status filter if not 'all' and we have data to filter
    if (status !== 'all' && allData && allData.length > 0) {
      // Check if the 'status' field exists in the data
      const hasStatusField = allData[0].hasOwnProperty('status');
      const fieldToUse = hasStatusField ? 'status' : 'payment_status';
      
      console.log(`Using ${fieldToUse} field for status filtering`);
      
      // Filter the results in memory since we already have all enrollments
      data = allData.filter(enrollment => {
        if (fieldToUse === 'status') {
          return enrollment.status === status;
        } else {
          // Use bracket notation with type assertion for 'payment_status'
          return (enrollment as any)['payment_status'] === status;
        }
      });
      count = data.length;
      
      console.log(`After filtering for ${fieldToUse}=${status}, got ${data.length} enrollments`);
    }

    if (error) {
      console.error('Error fetching enrolled courses:', error);
      return { data: [], error: error.message, count: 0 };
    }

    // Check if data is empty
    if (!data || data.length === 0) {
      console.log('No enrollments found for user after filtering');
      return { data: [], error: null, count: 0 };
    }

    // Get progress for each course
    const enrolledCourses = await Promise.all(
      data.map(async (enrollment) => {
        // Check if courses data is present
        if (!enrollment.courses) {
          console.error(`Missing course data for enrollment ${enrollment.id}, trying to fetch course separately`);
          // Try to fetch course data separately
          try {
            const { data: courseData } = await supabase
              .from('courses')
              .select('*')
              .eq('id', enrollment.course_id)
              .single();
              
            console.log(`Fetched course ${enrollment.course_id} separately:`, courseData);
            
            if (!courseData) {
              console.error(`Course ${enrollment.course_id} not found`);
              return null;
            }
            
            // Use the fetched course data
            const course = courseData as unknown as Course;
            return {
              ...course,
              progress: 0,
              lastAccessedAt: undefined,
              enrollment: {
                id: enrollment.id,
                status: enrollment.status as 'active' | 'refunded' | 'disputed',
                enrolled_at: enrollment.enrolled_at
              }
            };
          } catch (err) {
            console.error(`Failed to fetch course ${enrollment.course_id}:`, err);
            return null;
          }
        }

        const course = enrollment.courses as unknown as Course;
        console.log(`Processing course: ${course.id} - ${course.title}`);
        
        // Get progress from local storage (will be replaced with DB query when implemented)
        let progress = 0;
        let lastAccessedAt = undefined;
        
        try {
          // For now, simulate progress from local storage
          // This would be replaced with a DB query in a real implementation
          if (typeof window !== 'undefined') {
            const storageKey = `course-progress-${course.id}`;
            const savedData = localStorage.getItem(storageKey);
            
            if (savedData) {
              const progressData = JSON.parse(savedData);
              progress = progressData.progress || 0;
              lastAccessedAt = progressData.lastUpdated;
            }
          }
        } catch (err) {
          console.error('Error getting course progress:', err);
        }

        // Create enhanced course object with progress info
        return {
          ...course,
          progress,
          lastAccessedAt,
          enrollment: {
            id: enrollment.id,
            status: enrollment.status as 'active' | 'refunded' | 'disputed',
            enrolled_at: enrollment.enrolled_at
          }
        };
      })
    );

    // Filter out any null entries (from enrollments with missing course data)
    const validCourses = enrolledCourses.filter(course => course !== null) as EnrolledCourse[];
    
    console.log(`Returning ${validCourses.length} processed course(s)`);
    
    return { 
      data: validCourses, 
      error: null,
      count: count || 0 
    };
  } catch (err) {
    console.error('Failed to get enrolled courses:', err);
    return { 
      data: [], 
      error: 'Failed to fetch enrolled courses', 
      count: 0 
    };
  }
}

/**
 * Get course progress data for a specific course
 * @param userId User ID
 * @param courseId Course ID
 * @returns Progress percentage and last accessed date
 */
export async function getCourseProgress(
  userId: string,
  courseId: string
): Promise<{ progress: number; lastAccessedAt?: string }> {
  try {
    // For now, we'll use localStorage, but this would be replaced with
    // a database query in a real implementation
    if (typeof window !== 'undefined') {
      const storageKey = `course-progress-${courseId}`;
      const savedData = localStorage.getItem(storageKey);
      
      if (savedData) {
        const progressData = JSON.parse(savedData);
        return {
          progress: progressData.progress || 0,
          lastAccessedAt: progressData.lastUpdated
        };
      }
    }
    
    return { progress: 0 };
  } catch (err) {
    console.error('Failed to get course progress:', err);
    return { progress: 0 };
  }
}

/**
 * Update course progress
 * @param userId User ID
 * @param courseId Course ID
 * @param progress Progress percentage (0-100)
 */
export async function updateCourseProgress(
  userId: string,
  courseId: string,
  progress: number
): Promise<void> {
  try {
    // For now, we'll use localStorage, but this would be replaced with
    // a database update in a real implementation
    if (typeof window !== 'undefined') {
      const storageKey = `course-progress-${courseId}`;
      const progressData = {
        progress: Math.min(100, Math.max(0, progress)),
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem(storageKey, JSON.stringify(progressData));
    }
  } catch (err) {
    console.error('Failed to update course progress:', err);
  }
} 