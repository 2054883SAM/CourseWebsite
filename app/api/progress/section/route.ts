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
    console.log('Progress data (incoming):', {
      courseId,
      sectionId,
      progressPercentage,
      quizScore,
      quizPassed,
    });

    // Normalize and throttle progress updates to every 5% and only-once at 100%
    const nowIso = new Date().toISOString();
    const hasQuizUpdate = typeof quizScore === 'number' || typeof quizPassed === 'boolean';
    const normalizedProgress = Math.min(100, Math.max(0, Math.round(progressPercentage)));
    const isHundred = normalizedProgress >= 98 || normalizedProgress === 100;
    const bucketedProgress = isHundred ? 100 : Math.floor(normalizedProgress / 5) * 5; // 0,5,10,...,95

    // Compute completion strictly based on quiz passing (>=70%)
    const computedQuizPassed =
      quizPassed === true || (typeof quizScore === 'number' && quizScore >= 70);

    // Fetch existing progress to decide whether we need to write
    const { data: existing, error: fetchError } = await supabase
      .from('section_progress')
      .select(
        'user_id, course_id, section_id, progress_percentage, quiz_score, quiz_passed, completed'
      )
      .eq('user_id', user.id)
      .eq('section_id', sectionId)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // Non "not found" error
      console.error('Error fetching existing progress:', fetchError.message);
      return NextResponse.json(
        { error: 'Failed to fetch existing progress', details: fetchError.message },
        { status: 500 }
      );
    }

    const existingProgress = existing?.progress_percentage ?? null;
    const existingQuizScore =
      typeof existing?.quiz_score === 'number' ? existing?.quiz_score : null;
    const existingQuizPassed =
      typeof existing?.quiz_passed === 'boolean' ? existing?.quiz_passed : null;

    // Determine if we should update progress
    let shouldUpdateProgress = false;
    if (bucketedProgress === 100) {
      // Only write 100% once unless we also need to update quiz fields
      shouldUpdateProgress = existingProgress == null || existingProgress < 100;
    } else if (bucketedProgress >= 5) {
      // Only write in 5% increments and only if increasing
      shouldUpdateProgress = existingProgress == null || bucketedProgress > existingProgress;
    } else {
      // 0%: don't store unless there is no existing row yet
      shouldUpdateProgress = existing == null && bucketedProgress === 0;
    }

    // Determine if we should update quiz fields
    let shouldUpdateQuiz = false;
    if (hasQuizUpdate) {
      const incomingScore =
        typeof quizScore === 'number' ? Math.min(100, Math.max(0, quizScore)) : null;
      const incomingPassed = computedQuizPassed;
      shouldUpdateQuiz =
        (incomingScore != null && incomingScore !== existingQuizScore) ||
        (incomingPassed !== null && incomingPassed !== existingQuizPassed);
    }

    // If nothing to update, return existing as success
    if (existing && !shouldUpdateProgress && !shouldUpdateQuiz) {
      return NextResponse.json({ success: true, data: existing });
    }

    if (!existing) {
      // No row yet: insert when we have a valid reason
      if (!shouldUpdateProgress && !shouldUpdateQuiz) {
        return NextResponse.json({ success: true, data: null });
      }
      const insertData: any = {
        user_id: user.id,
        course_id: courseId,
        section_id: sectionId,
        progress_percentage: shouldUpdateProgress ? bucketedProgress : 0,
        completed: hasQuizUpdate ? computedQuizPassed : false,
        last_watched_at: nowIso,
      };
      if (hasQuizUpdate) {
        insertData.quiz_score = Math.min(100, Math.max(0, quizScore));
        insertData.quiz_passed = computedQuizPassed;
      }
      const { data: inserted, error: insertError } = await supabase
        .from('section_progress')
        .insert(insertData)
        .select()
        .single();
      if (insertError) {
        return NextResponse.json(
          { error: 'Failed to insert progress', details: insertError.message },
          { status: 500 }
        );
      }
      return NextResponse.json({ success: true, data: inserted });
    }

    // Existing row: update only necessary fields
    const updates: any = { last_watched_at: nowIso };
    if (shouldUpdateProgress) {
      updates.progress_percentage = bucketedProgress;
    }
    if (shouldUpdateQuiz) {
      updates.quiz_score =
        typeof quizScore === 'number' ? Math.min(100, Math.max(0, quizScore)) : existingQuizScore;
      updates.quiz_passed = computedQuizPassed;
      updates.completed = computedQuizPassed;
    }

    // If no effective updates, return
    if (Object.keys(updates).length === 1) {
      return NextResponse.json({ success: true, data: existing });
    }

    const { data: updated, error: updateError } = await supabase
      .from('section_progress')
      .update(updates)
      .eq('user_id', user.id)
      .eq('section_id', sectionId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update progress', details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
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
