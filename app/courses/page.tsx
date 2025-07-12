import { Suspense } from 'react';
import { CourseListView } from './components/CourseListView';
import { CourseGridView } from './components/CourseGridView';
import { ViewToggle } from './components/ViewToggle';
import { CourseListSkeleton } from './components/CourseListSkeleton';
import { CourseGridSkeleton } from './components/CourseGridSkeleton';
import { SearchBar } from './components/SearchBar';
import { getCourses, shouldUseMockData, mockData } from '@/lib/supabase';
import { PageLayout } from '@/components/layout/PageLayout';
import { Section } from '@/components/layout/Section';

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

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function CoursesPage({ searchParams }: PageProps) {
  const {
    view = 'grid',
    query = '',
    creator,
    min_price,
    max_price,
    sort,
    order,
    page,
  } = await searchParams;
  
  // Get courses from Supabase or mock data
  const courses = shouldUseMockData() 
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
        page: page ? parseInt(page) : 1,
        limit: 12,
      });

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
            <ViewToggle currentView={view} />
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