'use client';

import { Suspense, useEffect, useState, use, useCallback } from 'react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { PageLayout } from '@/components/layout/PageLayout';
import { Section } from '@/components/layout/Section';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { CourseHeader } from './components/CourseHeader';
import { CourseOverview } from './components/CourseOverview';
import { CourseCurriculum } from './components/CourseCurriculum';
import { InstructorInfo } from './components/InstructorInfo';
import { RelatedCourses } from './components/RelatedCourses';
import { CourseDetailSkeleton } from './components/CourseDetailSkeleton';
import { CourseActions } from './components/CourseActions';
import { getCourseById, getCourseSections, getCourses, shouldUseMockData, mockData } from '@/lib/supabase';
import { ensureValidSession, supabase } from '@/lib/supabase/client';
import { withAuth } from '@/components/auth/withAuth';
import { Course, Section as CourseSection } from '@/lib/supabase/types';

type PageParams = {
  id: string;
};

type PageProps = {
  params: Promise<PageParams>;
};

function CourseDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [relatedCourses, setRelatedCourses] = useState<Course[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const [isVisible, setIsVisible] = useState(!document.hidden);

  // Memoize the fetch function to prevent unnecessary recreations
  const fetchData = useCallback(async (mounted: boolean) => {
    try {
      if (!mounted) return;

      setLoading(true);
      setError(null);

      // Wait for session to be validated
      await ensureValidSession();

      if (!mounted) return;

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

      // Get sections data
      const sectionsData = shouldUseMockData()
        ? mockData.mockSections.filter(s => s.course_id === id)
        : await getCourseSections(id);

      if (!mounted) return;

      // Sort sections by order
      const sortedSections = [...sectionsData].sort((a, b) => a.order - b.order);
      setSections(sortedSections);

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
      setLoading(false);
    } catch (error) {
      console.error('Error fetching course data:', error);
      if (!mounted) return;

      setError('Failed to load course. Please try again.');
      setCourse(null);
      setSections([]);
      setRelatedCourses([]);
      setLoading(false);

      // Retry logic for transient errors
      if (retryCount < 3) {
        setTimeout(() => {
          if (mounted) {
            setRetryCount(prev => prev + 1);
          }
        }, 2000); // Wait 2 seconds before retrying
      }
    }
  }, [id, router, retryCount]);

  // Handle visibility changes
  useEffect(() => {
    function handleVisibilityChange() {
      const isNowVisible = !document.hidden;
      setIsVisible(isNowVisible);
      
      // If becoming visible and we have an error or are loading, retry the fetch
      if (isNowVisible && (error || loading)) {
        setRetryCount(0); // Reset retry count
        setError(null);
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [error, loading]);

  // Handle auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async () => {
      if (isVisible) {
        setRetryCount(0); // Reset retry count
        setError(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isVisible]);

  // Main data fetching effect
  useEffect(() => {
    let mounted = true;

    if (isVisible) {
      fetchData(mounted);
    }

    return () => {
      mounted = false;
    };
  }, [fetchData, isVisible]);

  const handleRetry = () => {
    setRetryCount(0); // Reset retry count
    setError(null);
    setLoading(true);
  };

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
                onClick={handleRetry}
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
                
                {/* Course Curriculum */}
                <div className="mt-8">
                  <CourseCurriculum sections={sections} />
                </div>
                
                {/* Instructor Info */}
                <div className="mt-8">
                  <InstructorInfo creator={course.creator} />
                </div>
              </div>
              
              {/* Sidebar - 1/3 width on large screens */}
              <div className="lg:col-span-1">
                <CourseActions course={course} sections={sections} />
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