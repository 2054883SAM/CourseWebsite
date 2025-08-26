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
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

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

  // Deletion lifecycle state
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<{ status: number; message: string } | null>(null);

  // Add requireAuth constant since we know this page doesn't require auth
  const requireAuth = false;

  const view = searchParams.get('view') || 'grid';
  const query = searchParams.get('query') || '';
  const creator = searchParams.get('creator') || undefined;
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
          // price-based filters removed
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
  }, [query, creator, sort, order, page]);

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
        <Section className="bg-gradient-gray py-20">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Erreur de chargement
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {error}
              </p>
              <button
                onClick={() => {
                  setLoading(true);
                  fetchCourses(true);
                }}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-800 text-white font-semibold rounded-full shadow-lg hover:from-gray-700 hover:to-gray-900 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105"
              >
                🔄 Réessayer
              </button>
            </div>
          </div>
        </Section>
      </PageLayout>
    );
  }

  const handleCourseDeleted = (deletedId: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== deletedId));
  };

  const handleDeleteStart = () => {
    setDeleteError(null);
    setIsDeleting(true);
  };

  const handleDeleteEnd = () => {
    setIsDeleting(false);
  };

  const handleDeleteError = (status: number, message: string) => {
    setIsDeleting(false);
    setDeleteError({ status, message });
  };

  return (
    <PageLayout>
      <Section className="bg-gradient-gray py-20">
        <div className="container mx-auto px-4">
          {/* Header avec animations */}
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 mb-6">
              <span className="text-2xl">📚</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 bg-gradient-to-r from-gray-900 via-gold-600 to-gray-800 bg-clip-text text-transparent dark:from-white dark:via-gold-400 dark:to-gray-300">
              Catalogue de Cours
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Découvrez notre collection de cours de qualité pour développer vos compétences et atteindre vos objectifs
            </p>
          </div>

          {/* Barre de recherche améliorée */}
          <div className="mb-12 animate-fade-in-up relative z-10" style={{ animationDelay: '0.2s' }}>
            <div className="max-w-3xl mx-auto">
              <SearchBar initialQuery={query} className="w-full" />
            </div>
          </div>

          {/* Statistiques et contrôles */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="mb-4 md:mb-0">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-gray-600 dark:text-gray-400">
                  {query ? (
                    <>
                      <span className="font-semibold text-gray-900 dark:text-white">{courses.length}</span>
                      {' '}cours trouvé{courses.length !== 1 && 's'} pour
                      {' '}<span className="font-semibold text-gold-600 dark:text-gold-400">&ldquo;{query}&rdquo;</span>
                    </>
                  ) : (
                    <>
                      <span className="font-semibold text-gray-900 dark:text-white">{courses.length}</span> cours disponibles
                    </>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <span>Vue :</span>
              </div>
              <ViewToggle currentView={view as 'grid' | 'list'} />
            </div>
          </div>

          {/* Contenu principal */}
          <div className="animate-fade-in-up relative z-0" style={{ animationDelay: '0.6s' }}>
            <Suspense fallback={view === 'grid' ? <CourseGridSkeleton /> : <CourseListSkeleton />}>
              {view === 'grid' ? (
                <CourseGridView 
                  courses={courses} 
                  searchQuery={query} 
                  onCourseDeleted={handleCourseDeleted}
                  onDeleteStart={handleDeleteStart}
                  onDeleteEnd={handleDeleteEnd}
                  onDeleteError={handleDeleteError}
                />
              ) : (
                <CourseListView 
                  courses={courses} 
                  searchQuery={query} 
                  onCourseDeleted={handleCourseDeleted}
                  onDeleteStart={handleDeleteStart}
                  onDeleteEnd={handleDeleteEnd}
                  onDeleteError={handleDeleteError}
                />
              )}
            </Suspense>
          </div>

          {/* Message si aucun cours trouvé */}
          {courses.length === 0 && !loading && (
            <div className="text-center py-16 animate-fade-in-up">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 mb-6">
                <span className="text-3xl">🔍</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Aucun cours trouvé
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                {query ? 
                  `Aucun résultat ne correspond à votre recherche "${query}". Essayez d'autres mots-clés.` : 
                  'Essayez d\'ajuster vos critères de recherche ou de filtres.'
                }
              </p>
              {query && (
                <button
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.delete('query');
                    window.location.search = params.toString();
                  }}
                  className="mt-6 inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold rounded-full shadow-lg hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105"
                >
                  ✨ Voir tous les cours
                </button>
              )}
            </div>
          )}
        </div>
      </Section>

      {/* Deletion loading overlay */}
      {isDeleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 p-6 rounded-xl bg-white/90 dark:bg-gray-800/90 shadow-xl">
            <LoadingSpinner size="large" color="blue" />
            {/* Spinning bar */}
            <div className="w-56 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-gray-300 via-gray-500 to-gray-300 loading-bar"></div>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">Suppression du cours en cours…</p>
            <style jsx>{`
              @keyframes indeterminate {
                0% { transform: translateX(-100%); }
                50% { transform: translateX(0%); }
                100% { transform: translateX(100%); }
              }
              .loading-bar {
                width: 40%;
                animation: indeterminate 1.1s ease-in-out infinite;
              }
            `}</style>
          </div>
        </div>
      )}

      {/* Deletion error friendly modal */}
      {deleteError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="max-w-md w-full mx-4 rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-2xl text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
              <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Impossible de supprimer le cours</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-3">
              {deleteError.status >= 500 || deleteError.status === -1 ? 'Une erreur serveur est survenue.' : 'Une erreur est survenue.'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
              {deleteError.status > 0 ? `Code ${deleteError.status}` : 'Code inconnu'} · {deleteError.message}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteError(null)}
                className="px-5 py-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  setDeleteError(null);
                  setLoading(true);
                  fetchCourses(true);
                }}
                className="px-5 py-2 rounded-full bg-gradient-to-r from-gray-600 to-gray-800 text-white font-semibold shadow hover:from-gray-700 hover:to-gray-900 transition"
              >
                Rafraîchir la liste
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}

// Export the wrapped component - no auth required for course listing
export default withAuth(CoursesPage, { requireAuth: false }); 