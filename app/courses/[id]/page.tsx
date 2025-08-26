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

      setError('Failed to load course. Please try again.');
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

  if (loading) {
    return <CourseDetailSkeleton />;
  }

  if (error) {
    return (
      <PageLayout>
        <Section className="bg-gray-50 py-12">
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
                Retry
              </button>
            </div>
          </div>
        </Section>
      </PageLayout>
    );
  }

  if (!course) {
    return null; // Router will handle the redirect
  }

  return (
    <PageLayout>
      <Section className="bg-gray-50 pt-6 pb-12">
        <div className="container mx-auto px-4">
          <Breadcrumbs
            items={[
              { label: 'Courses', href: '/courses' },
              { label: course.title, href: `/courses/${course.id}` },
            ]}
          />
          
          <Suspense fallback={<CourseDetailSkeleton />}>
            {/* Course Header */}
            <CourseHeader course={course} />
            
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content - 2/3 width on large screens */}
              <div className="lg:col-span-2">
                {/* Course Overview */}
                <CourseOverview course={course} />
                
                {/* Course Curriculum removed (no sections) */}
                
                {/* Instructor Info */}
                <div className="mt-8">
                  <InstructorInfo creator={course.creator} />
                </div>
              </div>
              
              {/* Sidebar - 1/3 width on large screens */}
              <div className="lg:col-span-1">
                <CourseActions 
                  course={course} 
                  initialEnrollmentStatus={dbUser?.role === 'admin' ? 'enrolled' : (isCheckingEnrollment ? 'processing' : (isEnrolled ? 'enrolled' : 'not-enrolled'))} 
                />
              </div>
            </div>
            
            {/* Related Courses */}
            <div className="mt-12">
              <RelatedCourses 
                courseId={course.id} 
                creatorId={course.creator_id}
                relatedCourses={relatedCourses}
              />
            </div>
          </Suspense>
        </div>
      </Section>
    </PageLayout>
  );
}

// Export the wrapped component with authentication required for enrolled courses
export default withAuth(CourseDetailPage, { requireAuth: false }); 