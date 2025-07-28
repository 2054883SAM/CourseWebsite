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

export default function MyLearningPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { user, dbUser } = useAuth();
  
  // Use our custom hook to fetch enrolled courses
  const { 
    courses, 
    isLoading, 
    error, 
    totalCount,
    setParams,
    refetch 
  } = useEnrolledCourses({
    limit: 10,
    sortBy: 'enrolledAt',
    sortOrder: 'desc'
  });

  // Debug output
  useEffect(() => {
    console.log('Auth state:', { 
      isAuthenticated: !!user, 
      userId: user?.id,
      dbUserId: dbUser?.id,
      role: dbUser?.role 
    });
    console.log('Enrolled courses:', { 
      isLoading, 
      error, 
      courseCount: courses.length, 
      totalCount,
      courses 
    });
  }, [user, dbUser, courses, isLoading, error, totalCount]);

  return (
    <main className="py-8">
      <Container>
        <div className="flex flex-col space-y-8">
          {/* Header section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Mes formations 
              {!isLoading && totalCount > 0 && (
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 font-normal">
                  ({totalCount})
                </span>
              )}
            </h1>
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
          
          {/* Debug info for development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
              <p className="text-xs font-mono">
                User ID: {user?.id || 'Not authenticated'}<br />
                Course Count: {courses.length}<br />
                Auth Status: {user ? 'Authenticated' : 'Not authenticated'}<br />
                Loading: {isLoading ? 'Yes' : 'No'}<br />
                Error: {error || 'None'}
              </p>
            </div>
          )}
          
          {/* Error message */}
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
              <p className="text-red-700 dark:text-red-400">
                Erreur: {error}
              </p>
            </div>
          )}
          
          {/* Content section */}
          {isLoading ? (
            <LoadingSkeleton viewMode={viewMode} />
          ) : courses.length === 0 ? (
            <EmptyState />
          ) : (
            <div className={`
              ${viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' 
                : 'flex flex-col space-y-4'}
            `}>
              {courses.map((course) => (
                <CourseCard key={course.id} viewMode={viewMode} course={course} />
              ))}
            </div>
          )}
        </div>
      </Container>
    </main>
  );
} 