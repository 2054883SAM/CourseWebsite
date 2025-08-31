import { supabase } from './client';

export interface SectionProgress {
  id?: string;
  user_id: string;
  course_id: string;
  section_id: string;
  progress_percentage: number; // 0-100
  completed: boolean;
  last_watched_at: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Get progress for all sections in a course for a user
 */
export async function getUserCourseProgress(userId: string, courseId: string): Promise<SectionProgress[]> {
  try {
    const { data, error } = await supabase
      .from('section_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user course progress:', error);
    return [];
  }
}

/**
 * Get progress for a specific section for a user
 */
export async function getUserSectionProgress(userId: string, sectionId: string): Promise<SectionProgress | null> {
  try {
    const { data, error } = await supabase
      .from('section_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('section_id', sectionId)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user section progress:', error);
    return null;
  }
}

/**
 * Update or create progress for a section
 */
export async function updateSectionProgress(
  userId: string,
  courseId: string,
  sectionId: string,
  progressPercentage: number,
  completed: boolean = false
): Promise<SectionProgress | null> {
  try {
    console.log('updateSectionProgress called with:', { userId, courseId, sectionId, progressPercentage, completed });
    
    // Check if user is authenticated
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      console.error('Authentication error:', sessionError);
      throw new Error('User not authenticated');
    }
    
    console.log('User is authenticated:', session.user.id);
    
    // Ensure the userId matches the authenticated user
    if (session.user.id !== userId) {
      console.error('User ID mismatch:', { sessionUserId: session.user.id, passedUserId: userId });
      throw new Error('User ID mismatch');
    }
    
    const progressData = {
      user_id: session.user.id, // Use the authenticated user ID
      course_id: courseId,
      section_id: sectionId,
      progress_percentage: Math.min(100, Math.max(0, progressPercentage)),
      completed: completed || progressPercentage >= 95, // Auto-complete at 95%
      last_watched_at: new Date().toISOString(),
    };

    console.log('Attempting to upsert progress data:', progressData);
    
    const { data, error } = await supabase
      .from('section_progress')
      .upsert(progressData)
      .select()
      .single();

    if (error) {
      console.error('Supabase upsert error:', error);
      throw error;
    }
    
    console.log('Progress updated successfully:', data);
    return data;
  } catch (error) {
    console.error('Error updating section progress:', error);
    return null;
  }
}

/**
 * Mark section as completed
 */
export async function completeSectionProgress(
  userId: string,
  courseId: string,
  sectionId: string
): Promise<SectionProgress | null> {
  return updateSectionProgress(userId, courseId, sectionId, 100, true);
}

/**
 * Get overall course completion percentage for a user
 */
export async function getCourseCompletionPercentage(userId: string, courseId: string): Promise<number> {
  try {
    // Get total sections in course
    const { count: totalSections } = await supabase
      .from('sections')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', courseId);

    if (!totalSections || totalSections === 0) return 0;

    // Get completed sections
    const { count: completedSections } = await supabase
      .from('section_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .eq('completed', true);

    return Math.round(((completedSections || 0) / totalSections) * 100);
  } catch (error) {
    console.error('Error calculating course completion:', error);
    return 0;
  }
}

/**
 * Reset progress for a section (for retaking)
 */
export async function resetSectionProgress(userId: string, sectionId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('section_progress')
      .delete()
      .eq('user_id', userId)
      .eq('section_id', sectionId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error resetting section progress:', error);
    return false;
  }
}
