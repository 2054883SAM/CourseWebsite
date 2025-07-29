import { supabase } from './client';
import { Course, Section, Subtitle, CourseSearchParams } from './types';
import { PostgrestResponse, PostgrestSingleResponse } from '@supabase/supabase-js';

// Helper for handling timeout errors
function handleTimeoutError(error: unknown, action: string): never {
  console.error(`Error while trying to ${action}:`, error);
  if (error instanceof Error && error.message === 'Request timed out') {
    throw new Error(`Taking longer than expected to ${action}. Please check your connection and try again.`);
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
      min_price,
      max_price,
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
 * Fetch a single course by ID with creator information
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

    // Transform the data to match our interfaces
    const course: Course = {
      ...courseData,
      creator: courseData.users,
      section_count: 0, // Default to 0 since sections table doesn't exist
    };

    return course;
  } catch (error) {
    console.error(`Error fetching course with ID ${id}:`, error);
    handleTimeoutError(error, 'load course');
  }
}

/**
 * Fetch course sections - stubbed since sections table doesn't exist
 */
export async function getCourseSections(courseId: string): Promise<Section[]> {
  console.log(`Note: sections table does not exist. Returning empty array for courseId: ${courseId}`);
  return [];
}

/**
 * Fetch subtitles for a section - stubbed since sections table doesn't exist
 */
export async function getSectionSubtitles(sectionId: string): Promise<Subtitle[]> {
  console.log(`Note: subtitles/sections tables do not exist. Returning empty array for sectionId: ${sectionId}`);
  return [];
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
