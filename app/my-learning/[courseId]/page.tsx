'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { getEnrolledCourse } from '@/lib/supabase/learning';
import { getCourseById, getCourseSections } from '@/lib/supabase/courses';
import { getUserCourseProgress, getComprehensiveCourseProgress } from '@/lib/supabase/progress';
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
  const [courseProgress, setCourseProgress] = useState<{
    overallProgress: number;
    timeWatchedMinutes: number;
    totalCourseMinutes: number;
    sectionsCompleted: number;
    totalSections: number;
  }>({
    overallProgress: 0,
    timeWatchedMinutes: 0,
    totalCourseMinutes: 0,
    sectionsCompleted: 0,
    totalSections: 0,
  });
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
        sessionStorage.removeItem(`course_progress_${courseId}`);
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

        // Try to get course and sections data from session storage first
        let cachedCourseData = null;
        let cachedSections = null;
        try {
          const cachedData = sessionStorage.getItem(`course_${courseId}`);
          const cachedSectionsData = sessionStorage.getItem(`course_sections_${courseId}`);

          if (cachedData && cachedSectionsData) {
            cachedCourseData = JSON.parse(cachedData);
            cachedSections = JSON.parse(cachedSectionsData);
            console.log('Using cached course data and sections');
          }
        } catch (e) {
          console.warn('Failed to read from session storage:', e);
          // Continue with API fetch if session storage fails
        }

        // Fetch course data and progress data
        console.log('Fetching course data and progress');

        // Admins can access any course without enrollment
        if (dbUser?.role === 'admin') {
          // Always fetch progress data
          const comprehensiveProgress = await getComprehensiveCourseProgress(user.id, courseId);

          let course = cachedCourseData;
          let courseSections = cachedSections;

          // Only fetch course/sections if not cached
          if (!cachedCourseData || !cachedSections) {
            const [courseData, sectionsData] = await Promise.all([
              getCourseById(courseId),
              getCourseSections(courseId),
            ]);
            course = courseData;
            courseSections = sectionsData;
          }

          if (!course) {
            setError('Course not found');
            setLoading(false);
            return;
          }

          const adminCourseData =
            cachedCourseData ||
            ({
              id: course.id,
              title: course.title,
              description: course.description,
              thumbnail_url: course.thumbnail_url,
              created_at: course.created_at,
              creator_id: course.creator_id,
              section_count: course.section_count,
              creator: course.creator,
            } as any);

          // Cache the result in session storage (only if not already cached)
          if (!cachedCourseData || !cachedSections) {
            try {
              sessionStorage.setItem(`course_${courseId}`, JSON.stringify(adminCourseData));
              sessionStorage.setItem(`course_sections_${courseId}`, JSON.stringify(courseSections));
            } catch (e) {
              console.warn('Failed to cache course data:', e);
            }
          }

          hasFetchedRef.current = true;
          setCourseData(adminCourseData);
          setSections(courseSections);
          setProgress(comprehensiveProgress.sectionProgress);
          setCourseProgress({
            overallProgress: comprehensiveProgress.overallProgress,
            timeWatchedMinutes: comprehensiveProgress.timeWatchedMinutes,
            totalCourseMinutes: comprehensiveProgress.totalCourseMinutes,
            sectionsCompleted: comprehensiveProgress.sectionsCompleted,
            totalSections: comprehensiveProgress.totalSections,
          });
          setLoading(false);
          return;
        }

        // Block access for non-admin users with a free membership
        if (dbUser?.membership === 'free') {
          router.replace(`/payment?courseId=${courseId}`);
          return;
        }

        // For enrolled students, always fetch progress data
        const comprehensiveProgress = await getComprehensiveCourseProgress(user.id, courseId);

        let result = null;
        let courseSections = cachedSections;

        // Only fetch course/enrollment and sections if not cached
        if (!cachedCourseData || !cachedSections) {
          const [enrollmentResult, sectionsData] = await Promise.all([
            getEnrolledCourse(user.id, courseId),
            getCourseSections(courseId),
          ]);
          result = enrollmentResult;
          courseSections = sectionsData;

          if (result.error || !result.data) {
            setError(result.error || 'Course not found');
            // Redirect to unauthorized page if not enrolled (non-admin)
            router.replace('/unauthorized?requiredRole=student');
            return;
          }
        }

        const courseData = cachedCourseData || result?.data;

        // Cache the result in session storage (only if not already cached)
        if (!cachedCourseData || !cachedSections) {
          try {
            sessionStorage.setItem(`course_${courseId}`, JSON.stringify(courseData));
            sessionStorage.setItem(`course_sections_${courseId}`, JSON.stringify(courseSections));
          } catch (e) {
            console.warn('Failed to cache course data:', e);
          }
        }

        // Mark as fetched and update state
        hasFetchedRef.current = true;
        setCourseData(courseData);
        setSections(courseSections);
        setProgress(comprehensiveProgress.sectionProgress);
        setCourseProgress({
          overallProgress: comprehensiveProgress.overallProgress,
          timeWatchedMinutes: comprehensiveProgress.timeWatchedMinutes,
          totalCourseMinutes: comprehensiveProgress.totalCourseMinutes,
          sectionsCompleted: comprehensiveProgress.sectionsCompleted,
          totalSections: comprehensiveProgress.totalSections,
        });
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
      <div className="background-beige flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 sm:text-base">
            Chargement du contenu du cours...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="background-beige flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md rounded-xl border border-red-200/20 bg-red-50/90 p-6 text-center backdrop-blur-sm dark:bg-red-900/20">
          <h2 className="mb-4 text-lg font-semibold text-red-800 dark:text-red-400 sm:text-xl">
            Erreur
          </h2>
          <p className="text-sm text-red-700 dark:text-red-300 sm:text-base">{error}</p>
        </div>
      </div>
    );
  }

  if (!courseData) {
    return null;
  }

  // Render the course overview with sections
  return (
    <div className="background-beige relative min-h-screen overflow-hidden">
      {/* Geometric Flow Pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
            radial-gradient(circle at 20% 20%, rgba(251, 146, 60, 0.6) 0%, transparent 50%),
            radial-gradient(circle at 80% 30%, rgba(245, 158, 11, 0.5) 0%, transparent 50%),
            radial-gradient(circle at 40% 70%, rgba(251, 146, 60, 0.4) 0%, transparent 50%),
            radial-gradient(circle at 70% 80%, rgba(245, 158, 11, 0.3) 0%, transparent 50%),
            linear-gradient(45deg, transparent 0%, rgba(251, 146, 60, 0.2) 50%, transparent 100%),
            linear-gradient(-45deg, transparent 0%, rgba(245, 158, 11, 0.15) 50%, transparent 100%)
          `,
            backgroundSize:
              '400px 400px, 350px 350px, 300px 300px, 250px 250px, 100% 100%, 100% 100%',
            backgroundPosition: '0 0, 100% 0, 50% 100%, 0 100%, 0 0, 0 0',
            backgroundRepeat: 'no-repeat',
          }}
        ></div>

        {/* Formes géométriques flottantes */}
        <div className="animate-pulse-slow absolute left-10 top-10 h-32 w-32 rounded-full bg-gradient-to-br from-orange-300/60 to-amber-300/60 blur-xl"></div>
        <div
          className="animate-float-slow absolute right-20 top-1/3 h-24 w-24 rounded-full bg-gradient-to-br from-amber-300/50 to-orange-300/50 blur-lg"
          style={{ animationDelay: '1s' }}
        ></div>
        <div
          className="animate-pulse-slow absolute bottom-20 left-1/4 h-20 w-20 rounded-full bg-gradient-to-br from-orange-300/40 to-amber-300/40 blur-lg"
          style={{ animationDelay: '2s' }}
        ></div>
        <div
          className="animate-float-slow absolute bottom-1/3 right-1/3 h-28 w-28 rounded-full bg-gradient-to-br from-amber-300/45 to-orange-300/45 blur-xl"
          style={{ animationDelay: '3s' }}
        ></div>

        {/* Lignes géométriques */}
        <div className="absolute left-0 top-1/2 h-px w-full bg-gradient-to-r from-transparent via-orange-300/60 to-transparent"></div>
        <div className="absolute left-1/3 top-0 h-full w-px bg-gradient-to-b from-transparent via-amber-300/50 to-transparent"></div>
        <div className="absolute right-0 top-1/4 h-1/2 w-px bg-gradient-to-b from-transparent via-orange-300/40 to-transparent"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-4 sm:px-6 sm:py-8 lg:px-8">
        {/* Course Header */}
        <div className="mb-6 rounded-xl border border-white/20 bg-white/90 shadow-lg backdrop-blur-sm sm:mb-8">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col items-start space-y-4 sm:flex-row sm:space-x-6 sm:space-y-0">
              {/* Course Thumbnail */}
              {courseData.thumbnail_url && (
                <div className="w-full flex-shrink-0 sm:w-auto">
                  <img
                    src={courseData.thumbnail_url}
                    alt={courseData.title}
                    className="h-32 w-full rounded-xl border border-white/30 object-cover shadow-lg sm:h-28 sm:w-36"
                  />
                </div>
              )}

              {/* Course Info */}
              <div className="w-full min-w-0 flex-1">
                <h1 className="mb-3 text-2xl font-bold leading-tight text-gray-900 dark:text-white sm:text-3xl lg:text-4xl">
                  {courseData.title}
                </h1>

                {courseData.description && (
                  <p className="mb-4 text-base leading-relaxed text-gray-600 dark:text-gray-300 sm:text-lg">
                    {courseData.description}
                  </p>
                )}

                {/* Course Progress */}
                <div className="mb-6">
                  <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Progression du cours
                    </span>
                    <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                      {courseProgress.overallProgress}% terminé
                    </span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-gray-200/50 shadow-inner dark:bg-gray-700/50">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg transition-all duration-500"
                      style={{ width: `${courseProgress.overallProgress}%` }}
                    ></div>
                  </div>
                  <div className="mt-3 flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-400 sm:flex-row sm:items-center sm:justify-between">
                    <span className="flex items-center">
                      <svg
                        className="mr-1 h-4 w-4 flex-shrink-0 text-orange-500"
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
                      <span className="truncate">
                        {courseProgress.timeWatchedMinutes} / {courseProgress.totalCourseMinutes}{' '}
                        minutes
                      </span>
                    </span>
                    <span className="flex items-center">
                      <svg
                        className="mr-1 h-4 w-4 flex-shrink-0 text-amber-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="truncate">
                        {courseProgress.sectionsCompleted} / {courseProgress.totalSections} sections
                      </span>
                    </span>
                  </div>
                </div>

                {/* Course Stats */}
                <div className="flex flex-col gap-3 text-sm text-gray-600 dark:text-gray-400 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
                  <div className="flex items-center">
                    <svg
                      className="mr-2 h-4 w-4 flex-shrink-0 text-blue-500"
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
                    <span className="truncate">
                      {sections.length} section{sections.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <svg
                      className="mr-2 h-4 w-4 flex-shrink-0 text-green-500"
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
                    <span className="truncate">
                      {courseProgress.totalCourseMinutes} minutes total
                    </span>
                  </div>

                  {courseData.creator && (
                    <div className="flex items-center">
                      <svg
                        className="mr-2 h-4 w-4 flex-shrink-0 text-purple-500"
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
                      <span className="truncate">
                        Professeur(e) {courseData.teacher_name || 'Non spécifié'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sections List */}
        <div className="rounded-xl border border-white/20 bg-white/80 p-4 shadow-lg backdrop-blur-sm sm:p-6">
          <h2 className="mb-4 flex items-center text-xl font-bold text-gray-900 dark:text-white sm:mb-6 sm:text-2xl">
            <svg
              className="mr-2 h-5 w-5 flex-shrink-0 text-orange-500 sm:h-6 sm:w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <span className="truncate">Contenu du cours</span>
          </h2>
          <SectionList
            sections={sections}
            courseId={courseId}
            className=""
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
                sessionStorage.removeItem(`course_progress_${courseId}`);
              } catch (e) {
                console.warn('Failed to clear cache:', e);
              }

              // Navigate to specific section player
              router.push(`/my-learning/${courseId}/section/${section.id}`);
            }}
          />
        </div>
      </div>
    </div>
  );
}
