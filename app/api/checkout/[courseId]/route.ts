import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/types/supabase';
import { Course } from '@/lib/supabase/types';
import { createRouteHandlerClient } from '@/lib/supabase/server';

// Function to check if a user is already enrolled in a course
async function checkExistingEnrollment(userId: string, courseId: string, supabaseClient: any) {
  const { data: enrollment, error } = await supabaseClient
    .from('enrollments')
    .select('id')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .eq('status', 'active') // Updated to match new schema field name
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 is the error code for "no rows found"
    throw new Error(`Error checking enrollment: ${error.message}`);
  }

  return !!enrollment;
}

// Function to get course details
async function getCourseDetails(courseId: string, supabaseClient: any): Promise<Course> {
  const { data, error } = await supabaseClient
    .from('courses')
    .select(
      `
      id, 
      title, 
      description, 
      thumbnail_url, 
      creator_id,
      created_at,
      creator:creator_id (
        id,
        name,
        email,
        role,
        created_at
      )
    `
    )
    .eq('id', courseId)
    .single();

  if (error) {
    throw new Error(`Error fetching course: ${error.message}`);
  }

  if (!data) {
    throw new Error('Course not found');
  }

  return data as Course;
}

// Main API handler for course checkout
export async function POST(req: NextRequest, context: { params: { courseId: string } }) {
  try {
    // Get the courseId from the params
    const { courseId } = await context.params;

    // Log information about request to help debug
    console.log('API: Processing checkout for courseId:', courseId);

    // Create a Supabase client with the proper route handler
    const supabase = await createRouteHandlerClient();

    // Try to authenticate the user
    try {
      // Debug request headers
      console.log('API: Request headers:', {
        cookie: req.headers.has('cookie') ? 'Present' : 'Missing',
        authorization: req.headers.has('authorization') ? 'Present' : 'Missing',
      });

      // Get the authenticated user (validated by Supabase Auth server)
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error('API: Authentication error:', error);
        return NextResponse.json(
          { error: 'Authentication error: ' + error.message, authRequired: true },
          { status: 401 }
        );
      }

      if (!user) {
        console.error('API: No active session found');
        return NextResponse.json(
          { error: 'Authentication required. Please sign in.', authRequired: true },
          { status: 401 }
        );
      }

      // Get the authenticated user ID
      const userId = user.id;
      console.log('API: Authenticated user ID:', userId);

      // Get the user data including role
      const { data: userRow, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('API: Error fetching user data:', userError);
        return NextResponse.json({ error: 'Error fetching user data' }, { status: 500 });
      }

      const role = userRow?.role;
      console.log('API: User role:', role);

      // Check if user role allows enrollment (student or higher roles)
      if (!role || (role !== 'student' && role !== 'teacher' && role !== 'admin')) {
        return NextResponse.json(
          { error: 'Your account does not have permission to enroll in courses' },
          { status: 403 }
        );
      }

      // Check if user is already enrolled
      const isEnrolled = await checkExistingEnrollment(userId, courseId, supabase);
      if (isEnrolled) {
        return NextResponse.json(
          { error: 'You are already enrolled in this course', alreadyEnrolled: true },
          { status: 409 } // 409 Conflict
        );
      }

      // Get course details
      const course = await getCourseDetails(courseId, supabase);

      // Generate a unique client reference ID for this purchase (to prevent duplicate charges)
      const clientReferenceId = `${userId}_${courseId}_${Date.now()}`;

      // Paddle removed: simply indicate that server-side is ready
      return NextResponse.json({ success: true });
    } catch (authError: any) {
      console.error('Authentication error:', authError);

      // Check if it's a session expired error
      if (
        authError.message?.includes('Session expired') ||
        authError.message?.includes('sign in again')
      ) {
        return NextResponse.json(
          { error: 'Your session has expired. Please sign in again.', sessionExpired: true },
          { status: 401 }
        );
      }

      // Default auth error
      return NextResponse.json(
        { error: 'Authentication required. Please sign in.', authRequired: true },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Error creating checkout session' },
      { status: 500 }
    );
  } finally {
  }
}
