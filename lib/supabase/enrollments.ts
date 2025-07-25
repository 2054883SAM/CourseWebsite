import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { Course } from './types';

/**
 * Check if a user is enrolled in a specific course
 * @param userId User ID to check enrollment for
 * @param courseId Course ID to check enrollment for
 * @returns Boolean indicating whether the user is enrolled
 */
export async function checkEnrollmentStatus(userId: string, courseId: string): Promise<boolean> {
  try {
    const supabase = createClientComponentClient<Database>();
    const { data, error } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .eq('status', 'active')
      .maybeSingle();

    if (error) {
      console.error('Error checking enrollment status:', error);
      return false;
    }

    // If data exists, user is enrolled
    return !!data;
  } catch (err) {
    console.error('Failed to verify enrollment status:', err);
    return false;
  }
}

/**
 * Get all courses a user is enrolled in
 * @param userId User ID to get enrollments for
 * @returns Array of courses the user is enrolled in
 */
export async function getUserEnrollments(userId: string): Promise<Course[]> {
  try {
    const supabase = createClientComponentClient<Database>();
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        course_id,
        status,
        courses:course_id (
          id, 
          title, 
          description,
          thumbnail_url,
          price,
          created_at,
          updated_at
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active');

    if (error) {
      console.error('Error fetching user enrollments:', error);
      return [];
    }

    // Extract and return course objects
    return data
      .filter(enrollment => enrollment.courses)
      .map(enrollment => enrollment.courses as Course);
  } catch (err) {
    console.error('Failed to get user enrollments:', err);
    return [];
  }
}

/**
 * Verify if user can enroll in a course
 * Checks authentication, role permissions, and existing enrollment
 * @param userId User ID attempting to enroll
 * @param userRole User role (admin, creator, student)
 * @param courseId Course ID to enroll in
 * @returns Object with verification result and message
 */
export async function verifyEnrollmentEligibility(
  userId: string | undefined,
  userRole: string | undefined,
  courseId: string
): Promise<{ canEnroll: boolean; status: string; message: string }> {
  // Check if user is authenticated
  if (!userId) {
    return {
      canEnroll: false,
      status: 'unauthenticated',
      message: 'You need to sign in to enroll in this course'
    };
  }

  // Check if user has appropriate role
  if (!userRole || (userRole !== 'admin' && userRole !== 'creator' && userRole !== 'student')) {
    return {
      canEnroll: false,
      status: 'unauthorized',
      message: 'Your account does not have permission to enroll in courses'
    };
  }

  // Check if user is already enrolled
  const isEnrolled = await checkEnrollmentStatus(userId, courseId);
  if (isEnrolled) {
    return {
      canEnroll: false,
      status: 'enrolled',
      message: "You're already enrolled in this course"
    };
  }

  // All checks passed, user can enroll
  return {
    canEnroll: true,
    status: 'eligible',
    message: 'You can enroll in this course'
  };
} 