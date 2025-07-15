'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { CourseListView } from './components/CourseListView';
import { CourseGridView } from './components/CourseGridView';
import { ViewToggle } from './components/ViewToggle';
import { CourseListSkeleton } from './components/CourseListSkeleton';
import { CourseGridSkeleton } from './components/CourseGridSkeleton';
import { SearchBar } from './components/SearchBar';
import { getCourses, shouldUseMockData, mockData } from '@/lib/supabase';
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
  const [lastFetchTime, setLastFetchTime] = useState(0);

  // Add requireAuth constant since we know this page doesn't require auth
  const requireAuth = false;

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
    if (!mounted) return;
    

    try {
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
      setError(null);
      setLastFetchTime(Date.now());
    } catch (err) {
      console.error('Error fetching courses:', err);
      if (!mounted) return;
      setError('Failed to load courses. Please try again.');
      setCourses([]);
    } finally {
      if (mounted) setLoading(false);
    }
  }, [query, creator, min_price, max_price, sort, order, page]);

  // Effect for initial load and filter changes
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchCourses(mounted);
    return () => { mounted = false; };
  }, [fetchCourses]);

  // Effect for handling tab visibility changes
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleVisibilityChange = () => {
      if (!document.hidden && Date.now() - lastFetchTime > 5 * 60 * 1000) {
        fetchCourses(true);
        setLoading(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchCourses, lastFetchTime]);

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
                onClick={() => {
                  setLoading(true);
                  fetchCourses(true);
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