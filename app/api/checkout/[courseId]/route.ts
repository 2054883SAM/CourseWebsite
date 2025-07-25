import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { Course } from '@/lib/supabase/types';
import { getPaddleClient } from '@/lib/paddle/client';

// Function to check if a user is already enrolled in a course
async function checkExistingEnrollment(userId: string, courseId: string, supabaseClient: any) {
  const { data: enrollment, error } = await supabaseClient
    .from('enrollments')
    .select('id')
    .filter('user_id', 'eq', userId)
    .filter('course_id', 'eq', courseId)
    .filter('payment_status', 'eq', 'paid')
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is the error code for "no rows found"
    throw new Error(`Error checking enrollment: ${error.message}`);
  }

  return !!enrollment;
}

// Function to get course details
async function getCourseDetails(courseId: string, supabaseClient: any): Promise<Course> {
  const { data, error } = await supabaseClient
    .from('courses')
    .select(`
      id, 
      title, 
      description, 
      thumbnail_url, 
      price, 
      creator_id,
      created_at,
      creator:creator_id (
        id,
        name,
        email,
        role,
        created_at
      )
    `)
    .filter('id', 'eq', courseId)
    .single();

  if (error) {
    throw new Error(`Error fetching course: ${error.message}`);
  }

  if (!data) {
    throw new Error('Course not found');
  }

  return data as Course;
}

// Type for user roles
type UserRole = 'student' | 'creator' | 'admin';
type UserProfile = {
  role: UserRole;
};

// Main API handler for course checkout
export async function POST(
  req: NextRequest,
  context: { params: { courseId: string } }
) {
  try {
    // Properly await and destructure params
    const courseId = context.params.courseId;

    // Log information about request to help debug
    console.log('API: Processing checkout for courseId:', courseId);

    // Initialize Supabase client using the recommended approach for App Router
    const supabase = createServerComponentClient<Database>({ cookies: () => cookies() });

    // Verify user authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    console.log('API: Session error:', sessionError?.message);
    console.log('API: Session found:', !!session);

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log('API: Authenticated user ID:', session.user.id);
    const userId = session.user.id;

    // Fetch the user profile to check role
    const { data, error: userError } = await supabase
      .from('users')
      .select('role')
      .filter('id', 'eq', userId)
      .single();

    if (userError) {
      console.log('API: Error fetching user data:', userError.message);
      return NextResponse.json(
        { error: 'Error fetching user profile' },
        { status: 500 }
      );
    }

    // Type assertion for user profile
    const userProfile = data as UserProfile | null;
    console.log('API: User profile found with role:', userProfile?.role);

    // Check if user role allows enrollment (student or higher roles)
    if (!userProfile || !userProfile.role || (userProfile.role !== 'student' && userProfile.role !== 'creator' && userProfile.role !== 'admin')) {
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

    // Get Paddle API client
    const paddle = getPaddleClient();

    // Create checkout data response
    return NextResponse.json({
      success: true,
      checkoutData: {
        priceId: process.env.NEXT_PUBLIC_PADDLE_COURSE_PRICE_ID, // This should be configured per course in a real app
        title: course.title,
        courseId: course.id,
        price: course.price,
        clientReferenceId: clientReferenceId,
        userId: userId,
        passthrough: JSON.stringify({
          courseId: course.id,
          userId: userId,
          clientReferenceId: clientReferenceId
        }),
        successUrl: `${req.nextUrl.origin}/courses/${courseId}?enrollment=success`,
        cancelUrl: `${req.nextUrl.origin}/courses/${courseId}?enrollment=cancelled`
      },
      paddleConfig: {
        sellerId: paddle.sellerId,
        sandboxMode: paddle.sandboxMode
      }
    });

  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Error creating checkout session' },
      { status: 500 }
    );
  }
} 