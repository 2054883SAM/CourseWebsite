import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { DBChapter, VideoChapter } from '@/lib/types/vdocipher';
import { convertAndValidateChapters, validateChapterTimings } from '@/lib/utils/chapters';

type Client = SupabaseClient<Database>;

/**
 * Updates chapters for a course
 */
export async function updateCourseChapters(
  supabase: Client,
  courseId: string,
  chapters: VideoChapter[]
): Promise<{ error: Error | null }> {
  try {
    // Validate chapters
    if (!validateChapterTimings(chapters)) {
      return { error: new Error('Invalid chapter timings - chapters must be sequential and non-overlapping') };
    }

    // Convert to DB format
    const dbChapters = chapters.map(chapter => ({
      id: chapter.id,
      title: chapter.title,
      start_time: chapter.startTime,
      duration: chapter.duration,
      description: chapter.description,
      thumbnail_url: chapter.thumbnail
    }));

    // Update in database
    const { error } = await supabase
      .from('courses')
      .update({ chapters: dbChapters })
      .eq('id', courseId);

    if (error) throw error;

    return { error: null };
  } catch (err) {
    console.error('Error updating course chapters:', err);
    return { error: err instanceof Error ? err : new Error('Failed to update chapters') };
  }
}

/**
 * Gets chapters for a course
 */
export async function getChaptersForCourse(
  supabase: Client,
  courseId: string
): Promise<{ chapters: VideoChapter[]; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('chapters')
      .eq('id', courseId)
      .single();

    if (error) throw error;
    if (!data) return { chapters: [], error: null };

    const chapters = convertAndValidateChapters(data.chapters);
    return { chapters, error: null };
  } catch (err) {
    console.error('Error getting course chapters:', err);
    return { chapters: [], error: err instanceof Error ? err : new Error('Failed to get chapters') };
  }
}

/**
 * Deletes all chapters for a course
 */
export async function clearCourseChapters(
  supabase: Client,
  courseId: string
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('courses')
      .update({ chapters: [] })
      .eq('id', courseId);

    if (error) throw error;
    return { error: null };
  } catch (err) {
    console.error('Error clearing course chapters:', err);
    return { error: err instanceof Error ? err : new Error('Failed to clear chapters') };
  }
}