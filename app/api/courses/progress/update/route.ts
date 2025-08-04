import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { userId, courseId, progress } = await request.json();

    // Validate input
    if (!userId || !courseId || progress === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate progress range
    if (progress < 0 || progress > 100) {
      return NextResponse.json({ error: 'Progress must be between 0 and 100' }, { status: 400 });
    }

    // Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the user is updating their own progress
    if (user.id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if a progress record already exists
    const { data: existingProgress, error: selectError } = await supabase
      .from('courses_progress')
      .select()
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      // PGRST116 is "no rows returned"
      console.error('Error checking existing progress:', selectError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    let result;
    if (existingProgress) {
      // Update existing progress
      result = await supabase
        .from('courses_progress')
        .update({
          progress,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('course_id', courseId);
    } else {
      // Insert new progress record
      result = await supabase.from('courses_progress').insert({
        user_id: userId,
        course_id: courseId,
        progress,
      });
    }

    if (result.error) {
      console.error('Error updating progress:', result.error);
      return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in progress update route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
