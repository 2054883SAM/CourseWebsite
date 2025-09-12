import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Read courseId and sectionId from the URL query params
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const sectionId = searchParams.get('sectionId');

    // Read progress and quiz info from the body
    const { progressPercentage, quizScore, quizPassed } = await request.json();

    if (!courseId || !sectionId || typeof progressPercentage !== 'number') {
      return NextResponse.json(
        { error: 'Missing required fields: courseId, sectionId, progressPercentage' },
        { status: 400 }
      );
    }

    // Create authenticated supabase client
    const supabase = await createRouteHandlerClient();

    // Get the current user (validated)
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('Authentication error:', userError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('User authenticated:', user.id);
    console.log('Progress data:', {
      courseId,
      sectionId,
      progressPercentage,
      quizScore,
      quizPassed,
    });

    // Compute completion strictly based on quiz passing (>=70%)
    const computedQuizPassed =
      quizPassed === true || (typeof quizScore === 'number' && quizScore >= 70);

    // Prepare progress data
    const progressData: any = {
      user_id: user.id,
      course_id: courseId,
      section_id: sectionId,
      progress_percentage: Math.min(100, Math.max(0, progressPercentage)),
      completed: computedQuizPassed, // Only complete when quiz is passed
      last_watched_at: new Date().toISOString(),
    };

    // Add quiz data if provided
    if (typeof quizScore === 'number') {
      progressData.quiz_score = Math.min(100, Math.max(0, quizScore));
      progressData.quiz_passed = computedQuizPassed;
    }

    // Upsert progress data
    const { data, error } = await supabase
      .from('section_progress')
      .upsert(progressData, { onConflict: 'user_id,section_id' })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update progress', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error updating section progress:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const sectionId = searchParams.get('sectionId');

    if (!courseId) {
      return NextResponse.json({ error: 'Missing courseId parameter' }, { status: 400 });
    }

    // Create authenticated supabase client
    const supabase = await createRouteHandlerClient();

    // Get the current user (validated)
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let query = supabase
      .from('section_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('course_id', courseId);

    if (sectionId) {
      query = query.eq('section_id', sectionId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching progress:', error);
      return NextResponse.json(
        { error: 'Failed to fetch progress', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: sectionId ? data[0] || null : data,
    });
  } catch (error) {
    console.error('Error fetching section progress:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
