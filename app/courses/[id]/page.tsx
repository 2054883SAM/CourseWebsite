'use client';

import { Suspense, useEffect, useState, use, useCallback } from 'react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { PageLayout } from '@/components/layout/PageLayout';
import { Section } from '@/components/layout/Section';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { CourseHeader } from './components/CourseHeader';
import { CourseOverview } from './components/CourseOverview';
import { InstructorInfo } from './components/InstructorInfo';
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
  const fetchData = useCallback(async (mounted: boolean) => {
    if (!mounted) return;

    try {
      // Get course data
      const courseData = shouldUseMockData()
        ? mockData.mockCourses.find(c => c.id === id)
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
            .filter(c => c.creator_id === courseData.creator_id && c.id !== id)
            .slice(0, 4)
        : await getCourses({
            creator_id: courseData.creator_id,
            limit: 5,
          }).then(courses => courses.filter(c => c.id !== id).slice(0, 4));

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
  }, [id, router]);

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
      <div className="min-h-screen w-full bg-white">
        <div className="w-full py-12">
          <div className="container mx-auto px-4">
            <div className="text-center text-red-600">
              <p>{error}</p>
              <button 
                onClick={() => {
                  setLoading(true);
                  fetchData(true);
                }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Réessayer
              </button>
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
    <div className="min-h-screen w-full bg-gradient-to-br from-sky-50 via-white to-blue-50">
      <div className="w-full pt-6 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
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
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
              {/* Main Content - 2/3 width on large screens */}
              <div className="lg:col-span-2 space-y-12">
                {/* Course Overview */}
                <CourseOverview course={course} />
                
                {/* Course Curriculum removed (no sections) */}
                
                {/* Instructor Info */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-3xl">👨‍🏫</span>
                    <h3 className="text-2xl font-bold text-indigo-700">Ton enseignant</h3>
                  </div>
                  <InstructorInfo creator={course.creator} />
                </div>
              </div>
              
              {/* Sidebar - 1/3 width on large screens */}
              <div className="lg:col-span-1 order-first lg:order-last">
                <CourseActions 
                  course={course} 
                  initialEnrollmentStatus={dbUser?.role === 'admin' ? 'enrolled' : (isCheckingEnrollment ? 'processing' : (isEnrolled ? 'enrolled' : 'not-enrolled'))} 
                />
              </div>
            </div>
            
            {/* Related Courses */}
            <div className="mt-16">
              <div className="bg-gradient-to-r from-green-50 to-teal-50 border-2 border-green-200 rounded-2xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                  <span className="text-3xl">🎪</span>
                  <h3 className="text-2xl font-bold text-green-700">Autres cours qui pourraient te plaire</h3>
                </div>
                <RelatedCourses 
                  courseId={course.id} 
                  creatorId={course.creator_id}
                  relatedCourses={relatedCourses}
                />
              </div>
            </div>
          </Suspense>
        </div>
      </div>
    </div>
  );
}

// Export the wrapped component with authentication required for enrolled courses
export default withAuth(CourseDetailPage, { requireAuth: false }); 