import { supabase } from './client';
import { Course, Section, Subtitle, CourseSearchParams } from './types';

/**
 * Fetch all courses with optional filtering
 */
export async function getCourses(params?: CourseSearchParams): Promise<Course[]> {
  try {
    const {
      query = '',
      creator_id,
      min_price,
      max_price,
      sort_by = 'created_at',
      sort_order = 'desc',
      page = 1,
      limit = 10
    } = params || {};

    // Calculate the offset based on page and limit
    const offset = (page - 1) * limit;

    // Start building the query
    let queryBuilder = supabase
      .from('courses')
      .select('*, users!creator_id(name, photo_url)');

    // Apply filters if provided
    if (query) {
      queryBuilder = queryBuilder.ilike('title', `%${query}%`);
    }

    if (creator_id) {
      queryBuilder = queryBuilder.eq('creator_id', creator_id);
    }

    if (min_price !== undefined) {
      queryBuilder = queryBuilder.gte('price', min_price);
    }

    if (max_price !== undefined) {
      queryBuilder = queryBuilder.lte('price', max_price);
    }

    // Apply sorting, pagination
    queryBuilder = queryBuilder
      .order(sort_by, { ascending: sort_order === 'asc' })
      .range(offset, offset + limit - 1);

    // Execute the query
    const { data, error } = await queryBuilder;

    if (error) throw error;

    // Transform the data to match our Course interface
    const courses = data.map(course => ({
      ...course,
      creator: course.users,
    })) as Course[];

    return courses;
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
}

/**
 * Fetch a single course by ID with sections
 */
export async function getCourseById(id: string): Promise<Course | null> {
  try {
    // Fetch the course with creator info
    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .select('*, users!creator_id(id, name, email, photo_url, role)')
      .eq('id', id)
      .single();

    if (courseError) throw courseError;
    if (!courseData) return null;

    // Fetch the sections for this course
    const { data: sectionsData, error: sectionsError } = await supabase
      .from('sections')
      .select('*')
      .eq('course_id', id)
      .order('order', { ascending: true });

    if (sectionsError) throw sectionsError;

    // Transform the data to match our interfaces
    const course: Course = {
      ...courseData,
      creator: courseData.users,
      section_count: sectionsData?.length || 0,
    };

    return course;
  } catch (error) {
    console.error(`Error fetching course with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Fetch course sections
 */
export async function getCourseSections(courseId: string): Promise<Section[]> {
  try {
    const { data, error } = await supabase
      .from('sections')
      .select('*')
      .eq('course_id', courseId)
      .order('order', { ascending: true });

    if (error) throw error;
    return data as Section[];
  } catch (error) {
    console.error(`Error fetching sections for course ${courseId}:`, error);
    throw error;
  }
}

/**
 * Fetch subtitles for a section
 */
export async function getSectionSubtitles(sectionId: string): Promise<Subtitle[]> {
  try {
    const { data, error } = await supabase
      .from('subtitles')
      .select('*')
      .eq('section_id', sectionId);

    if (error) throw error;
    return data as Subtitle[];
  } catch (error) {
    console.error(`Error fetching subtitles for section ${sectionId}:`, error);
    throw error;
  }
}

/**
 * Check if a user is enrolled in a course
 */
export async function isUserEnrolled(userId: string, courseId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .eq('payment_status', 'paid')
      .maybeSingle();

    if (error) throw error;
    return !!data;
  } catch (error) {
    console.error(`Error checking enrollment for user ${userId} in course ${courseId}:`, error);
    throw error;
  }
} 