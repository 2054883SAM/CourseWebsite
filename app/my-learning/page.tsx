'use client';

import { useState, useEffect } from 'react';
import { Container } from '@/components/layout/Container';
import CourseCard from './components/CourseCard';
import EmptyState from './components/EmptyState';
import LoadingSkeleton from './components/LoadingSkeleton';
import ViewToggle from './components/ViewToggle';
import { useEnrolledCourses } from './hooks/useEnrolledCourses';
import { EnrolledCourse } from '@/lib/supabase/learning';
import { useAuth } from '@/lib/auth/AuthContext';

import { withAuth } from '@/components/auth/withAuth';
import { StudentLayout } from '@/components/layout/StudentLayout';

function MyLearningPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { user, dbUser } = useAuth();

  // Use our custom hook to fetch enrolled courses
  const { courses, isLoading, error, totalCount, setParams, refetch } = useEnrolledCourses({
    limit: 10,
    sortBy: 'enrolledAt',
    sortOrder: 'desc',
  });

  return (
    <StudentLayout>
      <main className="py-8">
        <Container>
          <div className="flex flex-col space-y-8">
            {/* Header section */}
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center">
                {!isLoading && totalCount > 0 && (
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {totalCount} cours
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => refetch()}
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Actualiser
                </button>
                <ViewToggle currentView={viewMode} onViewChange={setViewMode} />
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                <p className="text-red-700 dark:text-red-400">Erreur: {error}</p>
              </div>
            )}

            {/* Content section */}
            {isLoading ? (
              <LoadingSkeleton viewMode={viewMode} />
            ) : courses.length === 0 ? (
              <EmptyState />
            ) : (
              <div
                className={`
              ${
                viewMode === 'grid'
                  ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'
                  : 'flex flex-col space-y-4'
              }
            `}
              >
                {courses.map((course) => (
                  <CourseCard key={course.id} viewMode={viewMode} course={course} />
                ))}
              </div>
            )}
          </div>
        </Container>
      </main>
    </StudentLayout>
  );
}

export default withAuth(MyLearningPage, { requireAuth: true });
