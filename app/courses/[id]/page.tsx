'use client';

import { Suspense, useEffect, useState, use, useCallback } from 'react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { PageLayout } from '@/components/layout/PageLayout';
import { Section } from '@/components/layout/Section';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { CourseHeader } from './components/CourseHeader';
import { CourseOverview } from './components/CourseOverview';
import { RelatedCourses } from './components/RelatedCourses';
import { CourseDetailSkeleton } from './components/CourseDetailSkeleton';
import { CourseActions } from './components/CourseActions';
import { getCourseById, getCourses, shouldUseMockData, mockData } from '@/lib/supabase';
import { withAuth } from '@/components/auth/withAuth';
import { useNavigation } from '@/lib/navigation/NavigationContext';
import { Course } from '@/lib/supabase/types';
import { useAuth } from '@/lib/auth/AuthContext';
import { checkEnrollmentStatus } from '@/lib/supabase/enrollments';

type PageParams = {
  id: string;
};

type PageProps = {
  params: Promise<PageParams>;
};

function CourseDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user, dbUser } = useAuth();
  const { isNavigating } = useNavigation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [relatedCourses, setRelatedCourses] = useState<Course[]>([]);
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isCheckingEnrollment, setIsCheckingEnrollment] = useState(false);

  // Add requireAuth constant since we know this page doesn't require auth
  const requireAuth = false;

  // Check enrollment status
  useEffect(() => {
    const checkEnrollment = async () => {
      // Admins have access to all courses without enrollment
      if (dbUser?.role === 'admin') {
        setIsEnrolled(true);
        setIsCheckingEnrollment(false);
        return;
      }

      if (!user?.id || !id) {
        setIsEnrolled(false);
        setIsCheckingEnrollment(false);
        return;
      }

      try {
        setIsCheckingEnrollment(true);
        const { isEnrolled } = await checkEnrollmentStatus(user.id, id);
        setIsEnrolled(isEnrolled);
      } catch (error) {
        console.error('Error checking enrollment:', error);
        setIsEnrolled(false);
      } finally {
        setIsCheckingEnrollment(false);
      }
    };

    checkEnrollment();
  }, [user, id, dbUser]);

  // Memoize the fetch function to prevent unnecessary recreations
  const fetchData = useCallback(
    async (mounted: boolean) => {
      if (!mounted) return;

      try {
        // Get course data
        const courseData = shouldUseMockData()
          ? mockData.mockCourses.find((c) => c.id === id)
          : await getCourseById(id);

        if (!courseData) {
          if (mounted) {
            router.push('/404');
          }
          return;
        }

        if (!mounted) return;
        setCourse(courseData);

        // Get related courses
        const relatedCoursesData = shouldUseMockData()
          ? mockData.mockCourses
              .filter((c) => c.creator_id === courseData.creator_id && c.id !== id)
              .slice(0, 4)
          : await getCourses({
              creator_id: courseData.creator_id,
              limit: 5,
            }).then((courses) => courses.filter((c) => c.id !== id).slice(0, 4));

        if (!mounted) return;
        setRelatedCourses(relatedCoursesData);
        setError(null);
        setLastFetchTime(Date.now());
      } catch (err) {
        console.error('Error fetching course data:', err);
        if (!mounted) return;

        setError('Échec du chargement du cours. Veuillez réessayer.');
        setCourse(null);
        setRelatedCourses([]);
      } finally {
        if (mounted) setLoading(false);
      }
    },
    [id, router]
  );

  useEffect(() => {
    let mounted = true;

    // Function to check if we should fetch based on time elapsed
    const shouldRefetch = () => {
      const timeSinceLastFetch = Date.now() - lastFetchTime;
      // Only refetch if it's been more than 5 minutes or there was an error
      return timeSinceLastFetch > 5 * 60 * 1000 || error !== null;
    };

    // Function to handle visibility change
    const handleVisibilityChange = () => {
      if (!document.hidden && shouldRefetch()) {
        setLoading(true);
        fetchData(true);
      }
    };

    // Initial fetch
    fetchData(mounted);

    // Set up visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      mounted = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchData, lastFetchTime, error]);

  if (loading && !isNavigating) {
    return <CourseDetailSkeleton />;
  }

  if (error) {
    return (
      <div className="background-beige relative min-h-screen w-full overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute left-10 top-20 h-20 w-20 animate-pulse rounded-full bg-gradient-to-br from-red-400/20 to-red-600/15"></div>
        <div
          className="from-amber-400/18 to-amber-600/12 absolute right-20 top-40 h-16 w-16 animate-bounce rounded-full bg-gradient-to-br"
          style={{ animationDelay: '1s' }}
        ></div>

        <div className="relative z-10 w-full py-8 sm:py-12">
          <div className="container mx-auto px-4">
            <div className="relative">
              <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-red-400/20 via-amber-400/20 to-blue-400/20 blur-xl"></div>
              <div className="relative rounded-3xl border-2 border-red-200/50 bg-white/80 p-6 text-center shadow-2xl backdrop-blur-xl sm:p-8">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-red-500 to-red-600 shadow-lg sm:mb-6 sm:h-16 sm:w-16">
                  <span className="text-2xl sm:text-3xl">⚠️</span>
                </div>
                <h2 className="mb-3 bg-gradient-to-r from-red-600 via-red-700 to-red-800 bg-clip-text text-xl font-bold text-transparent sm:mb-4 sm:text-2xl">
                  Erreur de chargement
                </h2>
                <p className="mb-4 text-sm text-red-600 sm:mb-6 sm:text-base">{error}</p>
                <button
                  onClick={() => {
                    setLoading(true);
                    fetchData(true);
                  }}
                  className="rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 text-sm font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg sm:px-6 sm:py-3 sm:text-base"
                >
                  Réessayer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return null; // Router will handle the redirect
  }

  return (
    <div className="background-beige relative min-h-screen w-full overflow-hidden">
      <div className="relative z-10 w-full pb-16 pt-6">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Breadcrumbs
              items={[
                { label: 'Cours', href: '/courses' },
                { label: course.title, href: `/courses/${course.id}` },
              ]}
            />
          </div>

          <Suspense fallback={<CourseDetailSkeleton />}>
            {/* Course Header */}
            <CourseHeader course={course} />

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:items-start lg:gap-12">
              {/* Main Content - 2/3 width on large screens */}
              <div className="space-y-12 lg:col-span-2">
                {/* Course Overview */}
                <div className="relative">
                  <div className="absolute rounded-3xl"></div>
                  <div className="relative rounded-3xl border-2 border-blue-200/50 bg-white p-4 shadow-2xl sm:p-6 lg:p-8">
                    <CourseOverview course={course} />
                  </div>
                </div>

                {/* Instructor Info hidden per request */}
              </div>

              {/* Sidebar - 1/3 width on large screens */}
              <div className="order-first lg:order-last lg:col-span-1 lg:flex lg:h-full lg:flex-col">
                <div className="relative lg:flex-shrink-0">
                  <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-blue-400/20 via-amber-400/20 to-green-400/20 blur-xl"></div>
                  <div className="relative rounded-3xl border-2 border-blue-200/50 bg-white/80 p-4 shadow-2xl backdrop-blur-xl sm:p-6">
                    <CourseActions
                      course={course}
                      initialEnrollmentStatus={
                        dbUser?.role === 'admin'
                          ? 'enrolled'
                          : isCheckingEnrollment
                            ? 'processing'
                            : isEnrolled
                              ? 'enrolled'
                              : 'not-enrolled'
                      }
                    />
                  </div>
                </div>

                {/* Instructor Info hidden per request */}
              </div>
            </div>

            {/* Related Courses */}
            {/* <div className="mt-12 sm:mt-16">
              <div className="relative">
                <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-green-400/20 via-blue-400/20 to-amber-400/20 blur-xl"></div>
                <div className="relative rounded-3xl border-2 border-green-200/50 bg-white/80 p-4 shadow-2xl backdrop-blur-xl sm:p-6 lg:p-8">
                  <div className="mb-6 flex items-center gap-3 sm:mb-8 sm:gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-green-500 to-green-600 shadow-lg sm:h-14 sm:w-14 lg:h-16 lg:w-16">
                      <span className="text-xl sm:text-2xl lg:text-3xl">🎪</span>
                    </div>
                    <h3 className="bg-gradient-to-r from-green-600 via-green-700 to-green-800 bg-clip-text text-xl font-bold text-transparent sm:text-2xl lg:text-3xl">
                      Autres cours qui pourraient te plaire
                    </h3>
                  </div>
                  <RelatedCourses
                    courseId={course.id}
                    creatorId={course.creator_id}
                    relatedCourses={relatedCourses}
                  />
                </div>
              </div>
            </div> */}
          </Suspense>
        </div>
      </div>
    </div>
  );
}

// Export the wrapped component with authentication required for enrolled courses
export default withAuth(CourseDetailPage, { requireAuth: false });
