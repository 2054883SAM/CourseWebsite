'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { getEnrolledCourse } from '@/lib/supabase/learning';
import { getCourseById, getCourseSections } from '@/lib/supabase/courses';
import { getUserCourseProgress } from '@/lib/supabase/progress';
import { Section } from '@/lib/supabase/types';
import SectionList from '@/components/courses/SectionList';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function CourseOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const { user, dbUser, loading: authLoading } = useAuth();
  const [courseData, setCourseData] = useState<any>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);

  const courseId = params.courseId as string;

  // Add focus event listener to refresh data when returning to page
  useEffect(() => {
    const handleFocus = () => {
      // Reset the fetch flag to allow fresh data when returning from section player
      hasFetchedRef.current = false;
      // Clear cached data to force fresh fetch
      try {
        sessionStorage.removeItem(`course_${courseId}`);
        sessionStorage.removeItem(`course_sections_${courseId}`);
      } catch (e) {
        console.warn('Failed to clear cache on focus:', e);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [courseId]);

  useEffect(() => {
    // Prevent fetching course data multiple times
    if (hasFetchedRef.current || courseData) return;

    async function fetchCourse() {
      // Wait for auth to be ready
      if (authLoading) return;

      // Redirect if not authenticated
      if (!user) {
        router.replace('/unauthorized?requiredRole=student');
        return;
      }

      try {
        setLoading(true);

        // Try to get data from session storage first
        try {
          const cachedData = sessionStorage.getItem(`course_${courseId}`);
          const cachedSections = sessionStorage.getItem(`course_sections_${courseId}`);

          if (cachedData && cachedSections) {
            const parsedData = JSON.parse(cachedData);
            const parsedSections = JSON.parse(cachedSections);
            console.log('Using cached course data and sections');
            setCourseData(parsedData);
            setSections(parsedSections);
            hasFetchedRef.current = true;
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn('Failed to read from session storage:', e);
          // Continue with API fetch if session storage fails
        }

        // If no cached data, fetch from API
        console.log('Fetching course data and sections from API');

        // Admins can access any course without enrollment
        if (dbUser?.role === 'admin') {
          const [course, courseSections, userProgress] = await Promise.all([
            getCourseById(courseId),
            getCourseSections(courseId),
            getUserCourseProgress(user.id, courseId),
          ]);

          if (!course) {
            setError('Course not found');
            setLoading(false);
            return;
          }

          const adminCourseData = {
            id: course.id,
            title: course.title,
            description: course.description,
            thumbnail_url: course.thumbnail_url,
            created_at: course.created_at,
            creator_id: course.creator_id,
            section_count: course.section_count,
            creator: course.creator,
          } as any;

          // Cache the result in session storage
          try {
            sessionStorage.setItem(`course_${courseId}`, JSON.stringify(adminCourseData));
            sessionStorage.setItem(`course_sections_${courseId}`, JSON.stringify(courseSections));
          } catch (e) {
            console.warn('Failed to cache course data:', e);
          }

          hasFetchedRef.current = true;
          setCourseData(adminCourseData);
          setSections(courseSections);
          setProgress(userProgress);
          setLoading(false);
          return;
        }

        const [result, courseSections, userProgress] = await Promise.all([
          getEnrolledCourse(user.id, courseId),
          getCourseSections(courseId),
          getUserCourseProgress(user.id, courseId),
        ]);

        if (result.error || !result.data) {
          setError(result.error || 'Course not found');
          // Redirect to unauthorized page if not enrolled (non-admin)
          router.replace('/unauthorized?requiredRole=student');
          return;
        }

        // Cache the result in session storage
        try {
          sessionStorage.setItem(`course_${courseId}`, JSON.stringify(result.data));
          sessionStorage.setItem(`course_sections_${courseId}`, JSON.stringify(courseSections));
        } catch (e) {
          console.warn('Failed to cache course data:', e);
        }

        // Mark as fetched and update state
        hasFetchedRef.current = true;
        setCourseData(result.data);
        setSections(courseSections);
        setProgress(userProgress);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchCourse();
  }, [courseId, user, dbUser, authLoading, router, courseData]);

  if (loading || authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your course content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="max-w-md rounded-lg bg-red-50 p-6 text-center dark:bg-red-900/20">
          <h2 className="mb-4 text-xl font-semibold text-red-800 dark:text-red-400">Error</h2>
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  if (!courseData) {
    return null;
  }

  // Render the course overview with sections
  return (
    <div className="min-h-screen bg-gray-50 py-8 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Course Header */}
        <div className="mb-8 rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="p-8">
            <div className="flex items-start space-x-6">
              {/* Course Thumbnail */}
              {courseData.thumbnail_url && (
                <div className="flex-shrink-0">
                  <img
                    src={courseData.thumbnail_url}
                    alt={courseData.title}
                    className="h-24 w-32 rounded-lg border border-gray-200 object-cover dark:border-gray-700"
                  />
                </div>
              )}

              {/* Course Info */}
              <div className="min-w-0 flex-1">
                <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {courseData.title}
                </h1>

                {courseData.description && (
                  <p className="mb-4 text-lg text-gray-600 dark:text-gray-300">
                    {courseData.description}
                  </p>
                )}

                {/* Course Stats */}
                <div className="flex flex-wrap items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <svg
                      className="mr-1 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    {sections.length} section{sections.length !== 1 ? 's' : ''}
                  </div>

                  <div className="flex items-center">
                    <svg
                      className="mr-1 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {Math.round(
                      sections.reduce((total, section) => total + (section.duration || 0), 0)
                    )}{' '}
                    minutes total
                  </div>

                  {courseData.creator && (
                    <div className="flex items-center">
                      <svg
                        className="mr-1 h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      By {courseData.creator.name}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sections List */}
        <SectionList
          sections={sections}
          courseId={courseId}
          className="shadow-sm"
          progress={progress.map((p) => ({
            sectionId: p.section_id,
            completed: p.completed,
            progressPercentage: p.progress_percentage,
            lastWatchedAt: p.last_watched_at,
            quizScore: p.quiz_score,
            quizPassed: p.quiz_passed,
          }))}
          onSectionClick={(section) => {
            // Clear cached data before navigation to ensure fresh data on return
            try {
              sessionStorage.removeItem(`course_${courseId}`);
              sessionStorage.removeItem(`course_sections_${courseId}`);
            } catch (e) {
              console.warn('Failed to clear cache:', e);
            }

            // Navigate to specific section player
            router.push(`/my-learning/${courseId}/section/${section.id}`);
          }}
        />
      </div>
    </div>
  );
}
