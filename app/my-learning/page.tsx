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
      <div className="background-beige min-h-screen relative overflow-hidden">
        {/* Gradient animé en arrière-plan */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-amber-300/40 via-amber-200/30 to-orange-400/40 animate-gradient-shift"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-amber-400/35 to-orange-400/35 rounded-full blur-3xl animate-float-slow"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-amber-400/35 to-orange-400/35 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-amber-300/30 to-orange-300/30 rounded-full blur-2xl animate-pulse-slow"></div>
        </div>
        
        <main className="py-8 relative z-10">
          <Container>
          <div className="flex flex-col space-y-8">
            {/* Header section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Mes Formations</h1>
                    {!isLoading && totalCount > 0 && (
                      <p className="text-sm font-medium text-gray-600 mt-1">
                        {totalCount} {totalCount === 1 ? 'cours' : 'cours'} en cours
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => refetch()}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all duration-200 hover:shadow-md"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Actualiser
                  </button>
                  <ViewToggle currentView={viewMode} onViewChange={setViewMode} />
                </div>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-red-200 p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-red-700 font-medium">Erreur: {error}</p>
                </div>
              </div>
            )}

            {/* Content section */}
            {isLoading ? (
              <LoadingSkeleton viewMode={viewMode} />
            ) : courses.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
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
              </div>
            )}
          </div>
          </Container>
        </main>
      </div>
    </StudentLayout>
  );
}

export default withAuth(MyLearningPage, { requireAuth: true });
