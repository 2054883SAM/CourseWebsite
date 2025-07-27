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
          updated_at: new Date().toISOString(),
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (insertError) {
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
    return NextResponse.json(
      { error: error.message || 'Error creating enrollment' },
      { status: 500 }
    );
  }
}
