import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const { courseId } = await req.json();

    if (!courseId) {
      return NextResponse.json({ error: 'Missing required field: courseId' }, { status: 400 });
    }

    console.log('API: Creating enrollment record for course:', courseId);
    // Note: payment provider transaction tracking removed from schema

    // Create a Supabase client with the proper route handler
    const supabase = await createRouteHandlerClient();

    // Try to authenticate the user (validated by Supabase Auth server)
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('API: Authentication error:', userError);
      return NextResponse.json(
        { error: 'Authentication required. Please sign in.' },
        { status: 401 }
      );
    }

    // Get the authenticated user ID
    const userId = user.id;

    // Fetch user membership (and role if needed)
    const { data: userRow } = await supabase
      .from('users')
      .select('membership, role')
      .eq('id', userId)
      .single();

    // If membership is free, block enrollment via this endpoint
    // Subscribed members should get an actual enrollment record upon clicking enroll
    if (userRow?.membership === 'free') {
      return NextResponse.json(
        { error: 'Subscription required to enroll', membership: 'free', redirect: '/payment' },
        { status: 403 }
      );
    }

    // For subscribed membership (especially students), proceed to ensure an active enrollment row exists

    // Validate that the course exists to avoid FK violations
    const { data: courseExists, error: courseCheckError } = await supabase
      .from('courses')
      .select('id')
      .eq('id', courseId)
      .single();

    if (courseCheckError || !courseExists) {
      console.error('API: Invalid courseId provided for enrollment:', courseId, courseCheckError);
      return NextResponse.json(
        { error: 'Invalid courseId. Course does not exist.' },
        { status: 400 }
      );
    }

    // Check if enrollment already exists
    const { data: existingEnrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    if (existingEnrollment) {
      console.log('API: Enrollment already exists, ensuring status active');

      // Update existing enrollment with the transaction ID
      const { error: updateError } = await supabase
        .from('enrollments')
        .update({
          status: 'active',
          enrolled_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('course_id', courseId);

      if (updateError) {
        console.error('API: Error updating enrollment:', updateError);
        return NextResponse.json({ error: 'Failed to update enrollment record' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Enrollment updated successfully',
        updated: true,
      });
    }

    // Create a new enrollment record
    const { error: insertError } = await supabase.from('enrollments').insert({
      user_id: userId,
      course_id: courseId,
      status: 'active',
      enrolled_at: new Date().toISOString(),
    });

    if (insertError) {
      // Handle unique constraint violation gracefully (idempotent success)
      const isUniqueViolation =
        insertError.code === '23505' ||
        insertError.message?.includes('enrollments_user_id_course_id_key');

      if (isUniqueViolation) {
        console.log('API: Enrollment already exists (unique violation). Treating as success');
        return NextResponse.json({
          success: true,
          message: 'User already enrolled in this course',
          alreadyEnrolled: true,
        });
      }

      console.error('API: Error creating enrollment:', insertError);
      return NextResponse.json({ error: 'Failed to create enrollment record' }, { status: 500 });
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Enrollment created successfully',
    });
  } catch (error: any) {
    console.error('API: Enrollment creation error:', error);

    // Handle the unique constraint violation as a success case
    // This means the user is already enrolled in the course
    if (error.code === '23505' && error.message?.includes('enrollments_user_id_course_id_key')) {
      console.log('API: User already enrolled in this course, treating as success');
      return NextResponse.json({
        success: true,
        message: 'User already enrolled in this course',
        alreadyEnrolled: true,
      });
    }

    return NextResponse.json(
      { error: error.message || 'Error creating enrollment' },
      { status: 500 }
    );
  }
}
