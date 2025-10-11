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
      <div className="rounded-xl bg-white/90 backdrop-blur-sm border border-white/20 shadow-lg p-6 dark:bg-gray-800/90 dark:border-gray-700/20">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mes Formations</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Suivez votre progression et accédez à tous vos cours
        </p>
      </div>

      <div className="rounded-xl bg-white/90 backdrop-blur-sm border border-white/20 shadow-lg p-6 dark:bg-gray-800/90 dark:border-gray-700/20">
        {/* Controls section */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center mb-6">
          <div className="flex items-center">
            {!isLoading && totalCount > 0 && (
              <span className="rounded-full bg-gradient-to-r from-orange-100 to-amber-100 px-4 py-2 text-sm font-medium text-orange-800 dark:from-orange-900/30 dark:to-amber-900/30 dark:text-orange-200 border border-orange-200/50 dark:border-orange-800/50">
                <svg className="mr-2 h-4 w-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                {totalCount} cours inscrits
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => refetch()}
              className="flex items-center text-sm text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300 transition-colors duration-300 hover:scale-105 transform"
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

        {/* Filter section */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
            <svg className="mr-2 h-4 w-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filtrer par:
          </span>
          {['Tous', 'En cours', 'Terminés', 'Non commencés'].map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter as typeof selectedFilter)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                filter === selectedFilter
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg hover:from-orange-600 hover:to-amber-600'
                  : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 dark:from-gray-800 dark:to-gray-700 dark:text-gray-300 dark:hover:from-gray-700 dark:hover:to-gray-600 border border-gray-200/50 dark:border-gray-600/50'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-xl border border-red-200/50 bg-gradient-to-r from-red-50 to-pink-50 p-4 dark:border-red-800/50 dark:from-red-900/20 dark:to-pink-900/20 shadow-lg">
          <div className="flex items-center">
            <svg className="mr-2 h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-red-700 dark:text-red-400 font-medium">Erreur: {error}</p>
          </div>
        </div>
      )}

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
              className="rounded-lg bg-white/90 backdrop-blur-sm border border-white/20 px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 dark:bg-gray-800/90 dark:border-gray-700/20 dark:text-gray-400 dark:hover:bg-gray-700 transition-all duration-300 shadow-lg"
              disabled
            >
              Précédent
            </button>
            <button className="rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2 text-sm font-medium text-white hover:from-orange-600 hover:to-amber-600 transition-all duration-300 shadow-lg hover:scale-105 transform">
              1
            </button>
            <button className="rounded-lg bg-white/90 backdrop-blur-sm border border-white/20 px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 dark:bg-gray-800/90 dark:border-gray-700/20 dark:text-gray-400 dark:hover:bg-gray-700 transition-all duration-300 shadow-lg hover:scale-105 transform">
              2
            </button>
            <button className="rounded-lg bg-white/90 backdrop-blur-sm border border-white/20 px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 dark:bg-gray-800/90 dark:border-gray-700/20 dark:text-gray-400 dark:hover:bg-gray-700 transition-all duration-300 shadow-lg hover:scale-105 transform">
              Suivant
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
