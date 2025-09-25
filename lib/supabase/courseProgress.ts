// Shared utilities for computing and updating time-weighted course progress

type SupabaseClientLike = any;

/**
 * Calculate course progress as a time-weighted percentage based on section progress.
 *
 * Formula:
 *   courseProgress = (sum over sections: duration(section) * progress(section)) / totalCourseDuration
 *   where progress(section) is in [0,100] and duration in minutes
 */
export async function calculateTimeWeightedCourseProgress(
  supabase: SupabaseClientLike,
  userId: string,
  courseId: string
): Promise<number> {
  try {
    const { data: sections, error: sectionsError } = await supabase
      .from('sections')
      .select('id, duration')
      .eq('course_id', courseId)
      .order('section_number');

    if (sectionsError) {
      console.error('Error fetching sections for course progress:', sectionsError);
      return 0;
    }

    const { data: sectionProgress, error: progressError } = await supabase
      .from('section_progress')
      .select('section_id, progress_percentage')
      .eq('user_id', userId)
      .eq('course_id', courseId);

    if (progressError) {
      console.error('Error fetching section progress for course progress:', progressError);
      return 0;
    }

    const courseSections = Array.isArray(sections) ? sections : [];
    const userProgress = Array.isArray(sectionProgress) ? sectionProgress : [];

    const totalCourseMinutes = courseSections.reduce(
      (total: number, section: any) => total + (section?.duration ?? 0),
      0
    );

    if (totalCourseMinutes <= 0) return 0;

    let timeWatchedMinutes = 0;
    courseSections.forEach((section: any) => {
      const match = userProgress.find((p: any) => p.section_id === section.id);
      const percent = Math.min(100, Math.max(0, match?.progress_percentage ?? 0));
      const duration = section?.duration ?? 0;
      timeWatchedMinutes += (duration * percent) / 100;
    });

    return Math.round((timeWatchedMinutes / totalCourseMinutes) * 100);
  } catch (error) {
    console.error('Error calculating course progress:', error);
    return 0;
  }
}

/**
 * Calculate and persist the computed course progress to the enrollments table.
 * Returns the computed progress.
 */
export async function updateEnrollmentProgressFromSections(
  supabase: SupabaseClientLike,
  userId: string,
  courseId: string
): Promise<number> {
  const overallProgress = await calculateTimeWeightedCourseProgress(supabase, userId, courseId);
  const clamped = Math.min(100, Math.max(0, overallProgress));
  const { error } = await supabase
    .from('enrollments')
    .update({ progress: clamped, last_accessed_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('course_id', courseId);
  if (error) {
    console.error('Error updating enrollment progress:', error);
  } else {
    console.log(`Enrollment progress updated: ${clamped}% for course ${courseId}`);
  }
  return clamped;
}
