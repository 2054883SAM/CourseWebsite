'use client';

import { useMemo, useState } from 'react';
import { useEnrolledCourses } from '@/app/my-learning/hooks/useEnrolledCourses';
import CourseCard from '@/app/my-learning/components/CourseCard';
import EmptyState from '@/app/my-learning/components/EmptyState';
import LoadingSkeleton from '@/app/my-learning/components/LoadingSkeleton';
import ViewToggle from '@/app/my-learning/components/ViewToggle';

export default function MyLearningContent() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFilter, setSelectedFilter] = useState<
    'Tous' | 'En cours' | 'Terminés' | 'Non commencés'
  >('Tous');

  // Use our custom hook to fetch enrolled courses
  const { courses, isLoading, error, totalCount, setParams, refetch } = useEnrolledCourses({
    limit: 10,
    sortBy: 'enrolledAt',
    sortOrder: 'desc',
  });

  // Client-side filter based on enrollment progress
  const filteredCourses = useMemo(() => {
    if (!courses?.length) return [];

    // Helper to read progress consistently
    const getProgress = (course: any): number => {
      return Number(course?.enrollment?.progress ?? course?.progress ?? 0);
    };

    switch (selectedFilter) {
      case 'En cours':
        // Assumption: in-progress excludes completed courses
        return courses.filter((c) => {
          const p = getProgress(c);
          return p > 0 && p < 100;
        });
      case 'Terminés':
        return courses.filter((c) => getProgress(c) === 100);
      case 'Non commencés':
        return courses.filter((c) => getProgress(c) === 0);
      case 'Tous':
      default:
        return courses;
    }
  }, [courses, selectedFilter]);

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mes formations</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Suivez votre progression et accédez à tous vos cours
        </p>
      </div>

      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center">
          {!isLoading && totalCount > 0 && (
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
              {totalCount} cours inscrits
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => refetch()}
            className="flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <svg
              className="mr-1 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
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

      {/* Filter section */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtrer par:</span>
        {['Tous', 'En cours', 'Terminés', 'Non commencés'].map((filter) => (
          <button
            key={filter}
            onClick={() => setSelectedFilter(filter as typeof selectedFilter)}
            className={`rounded-full px-4 py-1 text-sm transition-colors ${
              filter === selectedFilter
                ? 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Content section */}
      {isLoading ? (
        <LoadingSkeleton viewMode={viewMode} />
      ) : filteredCourses.length === 0 ? (
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
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} viewMode={viewMode} course={course} />
          ))}
        </div>
      )}

      {/* Pagination controls */}
      {!isLoading && courses.length > 0 && (
        <div className="mt-8 flex items-center justify-center">
          <nav className="flex items-center space-x-2" aria-label="Pagination">
            <button
              className="rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
              disabled
            >
              Précédent
            </button>
            <button className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
              1
            </button>
            <button className="rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700">
              2
            </button>
            <button className="rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700">
              Suivant
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
