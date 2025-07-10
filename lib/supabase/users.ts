import { supabase } from './client';
import { User, Enrollment } from './types';

/**
 * Get current authenticated user profile
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    // First get the authenticated user from Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!authData?.user) return null;

    // Then get the user profile from our users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userError) throw userError;
    return userData as User;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
}

/**
 * Get a user by ID
 */
export async function getUserById(id: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as User;
  } catch (error) {
    console.error(`Error fetching user with ID ${id}:`, error);
    return null;
  }
}

/**
 * Get all course creators (users with 'creator' role)
 */
export async function getCourseCreators(): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'creator');

    if (error) throw error;
    return data as User[];
  } catch (error) {
    console.error('Error fetching course creators:', error);
    throw error;
  }
}

/**
 * Enroll a user in a course
 */
export async function enrollUserInCourse(userId: string, courseId: string): Promise<Enrollment> {
  try {
    // Check if the user is already enrolled
    const { data: existingEnrollment, error: checkError } = await supabase
      .from('enrollments')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .maybeSingle();

    if (checkError) throw checkError;

    // If already enrolled, return existing enrollment
    if (existingEnrollment) {
      return existingEnrollment as Enrollment;
    }

    // If not enrolled, create new enrollment
    const { data, error } = await supabase
      .from('enrollments')
      .insert([
        {
          user_id: userId,
          course_id: courseId,
          enrolled_at: new Date().toISOString(),
          payment_status: 'pending' // Will be updated to 'paid' after payment processing
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data as Enrollment;
  } catch (error) {
    console.error(`Error enrolling user ${userId} in course ${courseId}:`, error);
    throw error;
  }
}

/**
 * Get all enrollments for a user
 */
export async function getUserEnrollments(userId: string): Promise<Enrollment[]> {
  try {
    const { data, error } = await supabase
      .from('enrollments')
      .select('*, courses(*)')
      .eq('user_id', userId)
      .eq('payment_status', 'paid');

    if (error) throw error;
    return data as Enrollment[];
  } catch (error) {
    console.error(`Error fetching enrollments for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Update enrollment payment status
 */
export async function updateEnrollmentStatus(
  enrollmentId: string, 
  status: 'paid' | 'pending'
): Promise<Enrollment> {
  try {
    const { data, error } = await supabase
      .from('enrollments')
      .update({ payment_status: status })
      .eq('id', enrollmentId)
      .select()
      .single();

    if (error) throw error;
    return data as Enrollment;
  } catch (error) {
    console.error(`Error updating enrollment ${enrollmentId}:`, error);
    throw error;
  }
} 