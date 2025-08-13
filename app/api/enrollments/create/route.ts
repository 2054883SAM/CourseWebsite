import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const { courseId, paddleTransactionId } = await req.json();

    if (!courseId || !paddleTransactionId) {
      return NextResponse.json(
        { error: 'Missing required fields: courseId and paddleTransactionId' },
        { status: 400 }
      );
    }

    console.log('API: Creating enrollment record for course:', courseId);
    console.log('API: Paddle transaction ID:', paddleTransactionId);

    // Create a Supabase client with the proper route handler
    const supabase = await createRouteHandlerClient();

    // Try to authenticate the user
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !sessionData.session) {
      console.error('API: Authentication error:', sessionError);
      return NextResponse.json(
        { error: 'Authentication required. Please sign in.' },
        { status: 401 }
      );
    }

    // Get the user ID from the session
    const userId = sessionData.session.user.id;

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
      console.log('API: Enrollment already exists, updating with transaction ID');

      // Update existing enrollment with the transaction ID
      const { error: updateError } = await supabase
        .from('enrollments')
        .update({
          status: 'active',
          paddle_transaction_id: paddleTransactionId,
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
      paddle_transaction_id: paddleTransactionId,
      status: 'active', // Use 'active' instead of 'paid' to match the schema update
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
    if (error.code === '23505' && 
        error.message?.includes('enrollments_user_id_course_id_key')) {
      console.log('API: User already enrolled in this course, treating as success');
      return NextResponse.json({
        success: true,
        message: 'User already enrolled in this course',
        alreadyEnrolled: true
      });
    }
    
    return NextResponse.json(
      { error: error.message || 'Error creating enrollment' },
      { status: 500 }
    );
  }
}
