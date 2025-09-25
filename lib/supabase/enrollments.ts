// Reusable helpers for enrollment-related updates

type SupabaseClientLike = any;

/**
 * Touch the enrollment by updating its last_accessed_at to the provided time or now.
 */
export async function touchEnrollmentLastAccessed(
  supabase: SupabaseClientLike,
  userId: string,
  courseId: string,
  at?: Date | string
): Promise<void> {
  const when = at instanceof Date ? at.toISOString() : (at ?? new Date().toISOString());
  const { error } = await supabase
    .from('enrollments')
    .update({ last_accessed_at: when })
    .eq('user_id', userId)
    .eq('course_id', courseId);
  if (error) {
    console.error('Error touching enrollment last_accessed_at:', error);
  }
}

import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';

/**
 * Check if a user is enrolled in a specific course
 * @param userId The user ID to check enrollment for
 * @param courseId The course ID to check enrollment for
 * @returns Boolean indicating enrollment status and enrollment data if enrolled
 */
export async function checkEnrollmentStatus(userId?: string, courseId?: string) {
  if (!userId || !courseId) {
    return { isEnrolled: false, enrollment: null };
  }

  try {
    const supabase = createBrowserClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase
      .from('enrollments')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .eq('status', 'active')
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is the error for no rows returned
      console.error('Error checking enrollment status:', error);
      throw error;
    }

    return {
      isEnrolled: !!data,
      enrollment: data,
    };
  } catch (error) {
    console.error('Failed to check enrollment:', error);
    return { isEnrolled: false, enrollment: null };
  }
}

/**
 * Verify if a user is eligible to enroll in a course
 */
export async function verifyEnrollmentEligibility(
  userId?: string,
  userRole?: string,
  courseId?: string
) {
  // If user has active subscription (membership=subscribed), allow free enrollment
  try {
    if (userId) {
      const supabase = createBrowserClient<Database>(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!
      );
      const { data: u } = await supabase
        .from('users')
        .select('membership')
        .eq('id', userId)
        .single();
      if (u?.membership === 'subscribed') {
        return {
          status: 'not-enrolled',
          message: 'Subscription active: click to enroll for free',
          canEnroll: true,
        } as const;
      }
    }
  } catch (e) {
    // Non-fatal; continue to normal checks
  }
  // No user ID means not authenticated
  if (!userId) {
    return {
      status: 'not-enrolled',
      message: 'Please log in to enroll in this course',
      canEnroll: false,
    };
  }

  // If no role, the user doesn't have proper permission
  if (!userRole) {
    return {
      status: 'not-enrolled',
      message: 'Your account does not have permission to enroll in courses',
      canEnroll: false,
    };
  }

  // Check if user has appropriate role
  if (userRole !== 'admin' && userRole !== 'teacher' && userRole !== 'student') {
    return {
      status: 'not-enrolled',
      message: 'Your account type cannot enroll in courses',
      canEnroll: false,
    };
  }

  // If user explicitly has free membership, direct them to subscribe
  try {
    if (userId) {
      const supabase = createBrowserClient<Database>(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!
      );
      const { data: u } = await supabase
        .from('users')
        .select('membership')
        .eq('id', userId)
        .single();
      if (u?.membership === 'free') {
        return {
          status: 'not-enrolled',
          message: 'Subscribe to get access to all courses',
          canEnroll: false,
        } as const;
      }
    }
  } catch {}

  // Check if the user is already enrolled
  try {
    const { isEnrolled } = await checkEnrollmentStatus(userId, courseId);

    if (isEnrolled) {
      return {
        status: 'enrolled',
        message: 'You are enrolled in this course',
        canEnroll: false,
      };
    }

    // User can enroll
    return {
      status: 'not-enrolled',
      message: 'Click to enroll in this course',
      canEnroll: true,
    };
  } catch (error) {
    console.error('Error verifying enrollment eligibility:', error);
    return {
      status: 'not-enrolled',
      message: 'An error occurred. Please try again.',
      canEnroll: true,
    };
  }
}
