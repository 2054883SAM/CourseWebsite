import { createRouteHandlerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Calculate course progress based on section progress (time-based)
 */
async function calculateCourseProgress(
  supabase: any,
  userId: string,
  courseId: string
): Promise<number> {
  try {
    // Get all sections for the course with their durations
    const { data: sections, error: sectionsError } = await supabase
      .from('sections')
      .select('id, duration')
      .eq('course_id', courseId)
      .order('section_number');

    if (sectionsError) {
      console.error('Error fetching sections for course progress:', sectionsError);
      return 0;
    }

    // Get all section progress for the user in this course
    const { data: sectionProgress, error: progressError } = await supabase
      .from('section_progress')
      .select('section_id, progress_percentage')
      .eq('user_id', userId)
      .eq('course_id', courseId);

    if (progressError) {
      console.error('Error fetching section progress for course progress:', progressError);
      return 0;
    }

    const courseSections = sections || [];
    const userProgress = sectionProgress || [];

    // Calculate total course duration
    const totalCourseMinutes = courseSections.reduce(
      (total, section) => total + (section.duration || 0),
      0
    );

    if (totalCourseMinutes === 0) return 0;

    // Calculate time watched based on progress percentage
    let timeWatchedMinutes = 0;
    courseSections.forEach((section) => {
      const sectionProgressData = userProgress.find((p) => p.section_id === section.id);
      if (sectionProgressData && sectionProgressData.progress_percentage > 0) {
        const sectionTimeWatched =
          (section.duration * sectionProgressData.progress_percentage) / 100;
        timeWatchedMinutes += sectionTimeWatched;
      }
    });

    // Calculate overall progress as percentage of time watched
    return Math.round((timeWatchedMinutes / totalCourseMinutes) * 100);
  } catch (error) {
    console.error('Error calculating course progress:', error);
    return 0;
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createRouteHandlerClient();
    const { userId, courseId, progress: manualProgress } = await request.json();

    // Validate input
    if (!userId || !courseId) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, courseId' },
        { status: 400 }
      );
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

    // Calculate course progress based on section progress (time-based)
    // If manualProgress is provided, use it; otherwise calculate from sections
    let calculatedProgress: number;
    if (manualProgress !== undefined) {
      // Validate manual progress range
      if (manualProgress < 0 || manualProgress > 100) {
        return NextResponse.json({ error: 'Progress must be between 0 and 100' }, { status: 400 });
      }
      calculatedProgress = manualProgress;
    } else {
      calculatedProgress = await calculateCourseProgress(supabase, userId, courseId);
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
          progress: Math.min(100, Math.max(0, calculatedProgress)),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('course_id', courseId);
    } else {
      // Insert new progress record
      result = await supabase.from('courses_progress').insert({
        user_id: userId,
        course_id: courseId,
        progress: Math.min(100, Math.max(0, calculatedProgress)),
      });
    }

    if (result.error) {
      console.error('Error updating progress:', result.error);
      return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      progress: Math.min(100, Math.max(0, calculatedProgress)),
    });
  } catch (error) {
    console.error('Error in progress update route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
