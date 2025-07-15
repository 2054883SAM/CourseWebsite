'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { CourseListView } from './components/CourseListView';
import { CourseGridView } from './components/CourseGridView';
import { ViewToggle } from './components/ViewToggle';
import { CourseListSkeleton } from './components/CourseListSkeleton';
import { CourseGridSkeleton } from './components/CourseGridSkeleton';
import { SearchBar } from './components/SearchBar';
import { getCourses, shouldUseMockData, mockData } from '@/lib/supabase';
import { ensureValidSession, supabase } from '@/lib/supabase/client';
import { PageLayout } from '@/components/layout/PageLayout';
import { Section } from '@/components/layout/Section';
import { withAuth } from '@/components/auth/withAuth';
import { Course } from '@/lib/supabase/types';
import { useSearchParams } from 'next/navigation';

type SearchParams = {
  view?: 'grid' | 'list';
  query?: string;
  creator?: string;
  min_price?: string;
  max_price?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  page?: string;
};

function CoursesPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isVisible, setIsVisible] = useState(!document.hidden);

  const view = searchParams.get('view') || 'grid';
  const query = searchParams.get('query') || '';
  const creator = searchParams.get('creator') || undefined;
  const min_price = searchParams.get('min_price') || undefined;
  const max_price = searchParams.get('max_price') || undefined;
  const sort = searchParams.get('sort') || undefined;
  const order = (searchParams.get('order') as 'asc' | 'desc') || undefined;
  const page = searchParams.get('page') || '1';

  // Memoize the fetch function to prevent unnecessary recreations
  const fetchCourses = useCallback(async (mounted: boolean) => {
    try {
      if (!mounted) return;
      
      setLoading(true);
      setError(null);

      // Wait for session to be validated
      await ensureValidSession();

      if (!mounted) return;

      // Fetch courses based on mock data or real data
      const coursesData = shouldUseMockData()
        ? mockData.mockCourses.filter(course =>
            !query || course.title.toLowerCase().includes(query.toLowerCase()) ||
            course.description.toLowerCase().includes(query.toLowerCase())
          )
        : await getCourses({
            query,
            creator_id: creator,
            min_price: min_price ? parseFloat(min_price) : undefined,
            max_price: max_price ? parseFloat(max_price) : undefined,
            sort_by: sort as any,
            sort_order: order,
            page: parseInt(page),
            limit: 12,
          });

      if (!mounted) return;

      setCourses(coursesData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching courses:', error);
      if (!mounted) return;

      setError('Failed to load courses. Please try again.');
      setCourses([]);
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
  }, [query, creator, min_price, max_price, sort, order, page, retryCount]);

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
      fetchCourses(mounted);
    }

    return () => {
      mounted = false;
    };
  }, [fetchCourses, isVisible]);

  const handleRetry = () => {
    setRetryCount(0); // Reset retry count
    setError(null);
    setLoading(true);
  };

  if (loading) {
    return view === 'grid' ? <CourseGridSkeleton /> : <CourseListSkeleton />;
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

  return (
    <PageLayout>
      <Section className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Course Catalog
          </h1>
          <p className="text-gray-600 mb-6">
            Browse our collection of high-quality courses
          </p>

          {/* Search bar */}
          <div className="mb-8">
            <SearchBar initialQuery={query} className="max-w-2xl" />
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <p className="text-gray-600">
                {query ? (
                  <>
                    Found <span className="font-medium">{courses.length}</span> 
                    {' '}course{courses.length !== 1 && 's'} for 
                    {' '}<span className="font-medium">&ldquo;{query}&rdquo;</span>
                  </>
                ) : (
                  <>Showing {courses.length} courses</>
                )}
              </p>
            </div>
            <ViewToggle currentView={view as 'grid' | 'list'} />
          </div>

          <Suspense fallback={view === 'grid' ? <CourseGridSkeleton /> : <CourseListSkeleton />}>
            {view === 'grid' ? (
              <CourseGridView courses={courses} searchQuery={query} />
            ) : (
              <CourseListView courses={courses} searchQuery={query} />
            )}
          </Suspense>
        </div>
      </Section>
    </PageLayout>
  );
}

// Export the wrapped component - no auth required for course listing
export default withAuth(CoursesPage, { requireAuth: false }); 