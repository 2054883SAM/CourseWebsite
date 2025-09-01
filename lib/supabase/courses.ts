import { supabase } from './client';
import { Course, Section, Subtitle, CourseSearchParams } from './types';
import { PostgrestResponse, PostgrestSingleResponse } from '@supabase/supabase-js';

// Helper for handling timeout errors
function handleTimeoutError(error: unknown, action: string): never {
  console.error(`Error while trying to ${action}:`, error);
  if (error instanceof Error && error.message === 'Request timed out') {
    throw new Error(
      `Taking longer than expected to ${action}. Please check your connection and try again.`
    );
  }
  throw error;
}

/**
 * Fetch all courses with optional filtering
 */
export async function getCourses(params?: CourseSearchParams): Promise<Course[]> {
  try {
    const {
      query = '',
      creator_id,
      sort_by = 'created_at',
      sort_order = 'desc',
      page = 1,
      limit = 10,
    } = params || {};

    // Calculate the offset based on page and limit
    const offset = (page - 1) * limit;

    // Start building the query
    let queryBuilder = supabase.from('courses').select('*, users!creator_id(name, photo_url, bio)');

    // Apply filters if provided
    if (query) {
      queryBuilder = queryBuilder.ilike('title', `%${query}%`);
    }

    if (creator_id) {
      queryBuilder = queryBuilder.eq('creator_id', creator_id);
    }

    // Price fields removed from schema; skip price filters

    // Apply sorting, pagination
    queryBuilder = queryBuilder
      .order(sort_by, { ascending: sort_order === 'asc' })
      .range(offset, offset + limit - 1);

    // Execute the query
    const response = await queryBuilder;
    const { data, error } = response;

    if (error) throw error;
    if (!data) return [];

    // Transform the data to match our Course interface
    const courses = data.map((course: any) => ({
      ...course,
      creator: course.users,
    })) as Course[];

    return courses;
  } catch (error) {
    handleTimeoutError(error, 'load courses');
  }
}

/**
 * Fetch a single course by ID with creator information and section count
 */
export async function getCourseById(id: string): Promise<Course | null> {
  try {
    // Fetch the course with creator info
    const courseResponse = await supabase
      .from('courses')
      .select('*, users!creator_id(id, name, email, photo_url, role, bio)')
      .eq('id', id)
      .single();

    const { data: courseData, error: courseError } = courseResponse;

    if (courseError) throw courseError;
    if (!courseData) return null;

    // Get section count
    const { count: sectionCount } = await supabase
      .from('sections')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', id);

    // Transform the data to match our interfaces
    const course: Course = {
      ...courseData,
      creator: courseData.users,
      section_count: sectionCount || 0,
    };

    return course;
  } catch (error) {
    console.error(`Error fetching course with ID ${id}:`, error);
    handleTimeoutError(error, 'load course');
  }
}

/**
 * Fetch course sections with chapters and progress tracking
 */
export async function getCourseSections(courseId: string): Promise<Section[]> {
  try {
    const { data: sectionsData, error } = await supabase
      .from('sections')
      .select('*')
      .eq('course_id', courseId)
      .order('section_number', { ascending: true });

    if (error) throw error;
    if (!sectionsData) return [];

    // Transform the data to match our Section interface
    const sections: Section[] = sectionsData.map((section: any) => ({
      id: section.id,
      course_id: section.course_id,
      section_number: section.section_number,
      title: section.title,
      duration: section.duration,
      playback_id: section.playback_id,
      chapters: section.chapters
        ? Array.isArray(section.chapters)
          ? section.chapters
          : JSON.parse(section.chapters)
        : [],
      questions: section.questions
        ? Array.isArray(section.questions)
          ? section.questions
          : JSON.parse(section.questions)
        : [],
      created_at: section.created_at,
    }));

    return sections;
  } catch (error) {
    console.error(`Error fetching sections for course ${courseId}:`, error);
    handleTimeoutError(error, 'load course sections');
  }
}

/**
 * Fetch a specific section by ID
 */
export async function getSectionById(sectionId: string): Promise<Section | null> {
  try {
    const { data: sectionData, error } = await supabase
      .from('sections')
      .select('*')
      .eq('id', sectionId)
      .single();

    if (error) throw error;
    if (!sectionData) return null;

    // Transform the data to match our Section interface
    const section: Section = {
      id: sectionData.id,
      course_id: sectionData.course_id,
      section_number: sectionData.section_number,
      title: sectionData.title,
      duration: sectionData.duration,
      playback_id: sectionData.playback_id,
      chapters: sectionData.chapters
        ? Array.isArray(sectionData.chapters)
          ? sectionData.chapters
          : JSON.parse(sectionData.chapters)
        : [],
      questions: sectionData.questions
        ? Array.isArray(sectionData.questions)
          ? sectionData.questions
          : JSON.parse(sectionData.questions)
        : [],
      created_at: sectionData.created_at,
    };

    return section;
  } catch (error) {
    console.error(`Error fetching section with ID ${sectionId}:`, error);
    handleTimeoutError(error, 'load section');
  }
}

/**
 * Fetch subtitles for a section
 */
export async function getSectionSubtitles(sectionId: string): Promise<Subtitle[]> {
  try {
    // Note: Assuming there's a subtitles table in the future
    // For now, return empty array as subtitles are handled via storage
    console.log(`Subtitles are handled via Supabase storage for sectionId: ${sectionId}`);
    return [];
  } catch (error) {
    console.error(`Error fetching subtitles for section ${sectionId}:`, error);
    return [];
  }
}

/**
 * Check if a user is enrolled in a course
 */
export async function isUserEnrolled(userId: string, courseId: string): Promise<boolean> {
  try {
    const response = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .eq('payment_status', 'paid')
      .maybeSingle();

    const { data, error } = response;

    if (error) throw error;
    return !!data;
  } catch (error) {
    console.error(`Error checking enrollment for user ${userId} in course ${courseId}:`, error);
    handleTimeoutError(error, 'check enrollment status');
  }
}
