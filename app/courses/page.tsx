'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { CourseListView } from './components/CourseListView';
import { CourseGridView } from './components/CourseGridView';
import { ViewToggle } from './components/ViewToggle';
import { CourseListSkeleton } from './components/CourseListSkeleton';
import { CourseGridSkeleton } from './components/CourseGridSkeleton';
import { SearchBar } from './components/SearchBar';
import { getCourses, getCategories, shouldUseMockData, mockData } from '@/lib/supabase';
import { PageLayout } from '@/components/layout/PageLayout';
import { Section } from '@/components/layout/Section';
import { withAuth } from '@/components/auth/withAuth';
import { useNavigation } from '@/lib/navigation/NavigationContext';
import { Course } from '@/lib/supabase/types';
import { CategoryGridView } from './components/CategoryGridView';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

type SearchParams = {
  view?: 'grid' | 'list';
  query?: string;
  creator?: string;
  category?: string;
  min_price?: string;
  max_price?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  page?: string;
};

function CoursesPage() {
  const searchParams = useSearchParams();
  const { isNavigating } = useNavigation();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<{ categorie: string; count: number }[]>([]);
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
  const category = searchParams.get('category') || undefined;
  const sort = searchParams.get('sort') || undefined;
  const order = (searchParams.get('order') as 'asc' | 'desc') || undefined;
  const page = searchParams.get('page') || '1';

  // Determine if we should show categories or courses
  const showCategories = !category && !query && !creator;

  // Memoize the fetch function to prevent unnecessary recreations
  const fetchData = useCallback(
    async (mounted: boolean) => {
      if (!mounted) return;

      try {
        if (showCategories) {
          // Fetch categories with course counts
          const categoriesData = shouldUseMockData()
            ? [
                { categorie: 'Français', count: 2 },
                { categorie: 'Mathématiques', count: 1 },
                { categorie: 'Science et technologie', count: 1 },
                { categorie: 'Géographie et histoire', count: 1 },
              ]
            : await getCategories();

          if (!mounted) return;
          setCategories(categoriesData);
          setCourses([]);
        } else {
          // Fetch courses based on filters
          const coursesData = shouldUseMockData()
            ? mockData.mockCourses.filter((course) => {
                let matches = true;
                if (query) {
                  matches =
                    matches &&
                    (course.title.toLowerCase().includes(query.toLowerCase()) ||
                      course.description.toLowerCase().includes(query.toLowerCase()));
                }
                if (category && course.categorie) {
                  matches = matches && course.categorie === category;
                }
                if (creator) {
                  matches = matches && course.creator_id === creator;
                }
                return matches;
              })
            : await getCourses({
                query,
                creator_id: creator,
                category,
                sort_by: sort as any,
                sort_order: order,
                page: parseInt(page),
                limit: 12,
              });

          if (!mounted) return;
          setCourses(coursesData);
          setCategories([]);
        }

        setError(null);
        setLastFetchTime(Date.now());
      } catch (err) {
        console.error('Error fetching data:', err);
        if (!mounted) return;
        setError('Failed to load data. Please try again.');
        setCourses([]);
        setCategories([]);
      } finally {
        if (mounted) setLoading(false);
      }
    },
    [showCategories, query, creator, category, sort, order, page]
  );

  // Effect for initial load and filter changes
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchData(mounted);
    return () => {
      mounted = false;
    };
  }, [fetchData]);

  // Effect for handling tab visibility changes
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleVisibilityChange = () => {
      if (!document.hidden && Date.now() - lastFetchTime > 5 * 60 * 1000) {
        fetchData(true);
        setLoading(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchData, lastFetchTime]);

  if (loading && !isNavigating) {
    return view === 'grid' ? <CourseGridSkeleton /> : <CourseListSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen w-full bg-white">
        <div className="w-full py-20">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                <svg
                  className="h-8 w-8 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                Erreur de chargement
              </h3>
              <p className="mb-6 text-gray-600 dark:text-gray-400">{error}</p>
              <button
                onClick={() => {
                  setLoading(true);
                  fetchData(true);
                }}
                className="inline-flex items-center rounded-full bg-gradient-to-r from-gray-600 to-gray-800 px-6 py-3 font-semibold text-white shadow-lg hover:from-gray-700 hover:to-gray-900 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2"
              >
                🔄 Réessayer
              </button>
            </div>
          </div>
        </div>
      </div>
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
    <div className="min-h-screen w-full bg-white">
      <div className="w-full py-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-16 text-center">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
              <span className="text-2xl">📚</span>
            </div>
            <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl lg:text-6xl">
              {showCategories
                ? <span className="text-blue-700">Matières Scolaires</span>
                : category
                  ? `Cours de ${category}`
                  : 'Catalogue de Cours'}
            </h1>
            <p className="mx-auto max-w-3xl text-xl text-gray-600 dark:text-gray-300">
              {showCategories
                ? 'Explorez nos matières conformes au programme scolaire québécois'
                : category
                  ? `Découvrez tous nos cours de ${category}`
                  : 'Découvrez notre collection de cours de qualité pour développer vos compétences et atteindre vos objectifs'}
            </p>
          </div>

          {/* Barre de recherche */}
          <div className="relative z-10 mb-12">
            <div className="mx-auto max-w-3xl">
              <SearchBar initialQuery={query} className="w-full" />
            </div>
          </div>

          {/* Statistiques et contrôles */}
          <div className="mb-8 flex flex-col justify-between md:flex-row md:items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <p className="text-gray-600 dark:text-gray-400">
                  {showCategories ? (
                    <>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {categories.length}
                      </span>{' '}
                      matières disponibles
                    </>
                  ) : query ? (
                    <>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {courses.length}
                      </span>{' '}
                      cours trouvé{courses.length !== 1 && 's'} pour{' '}
                      <span className="font-semibold text-gold-600 dark:text-gold-400">
                        &ldquo;{query}&rdquo;
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {courses.length}
                      </span>{' '}
                      cours disponibles
                      {category && (
                        <>
                          {' '}
                          en{' '}
                          <span className="font-semibold text-gold-600 dark:text-gold-400">
                            {category}
                          </span>
                        </>
                      )}
                    </>
                  )}
                </p>
              </div>
            </div>

            {!showCategories && (
              <div className="flex items-center space-x-4">
                <div className="hidden items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 md:flex">
                  <span>Vue :</span>
                </div>
                <ViewToggle currentView={view as 'grid' | 'list'} />
              </div>
            )}
          </div>

          {/* Breadcrumb pour navigation */}
          {category && (
            <div className="mb-8">
              <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Link
                  href="/courses"
                  className="transition-colors hover:text-gold-600 dark:hover:text-gold-400"
                >
                  Matières
                </Link>
                <span>/</span>
                <span className="font-medium text-gray-900 dark:text-white">{category}</span>
              </nav>
            </div>
          )}

          {/* Contenu principal */}
          <div className="relative z-0">
            <Suspense fallback={view === 'grid' ? <CourseGridSkeleton /> : <CourseListSkeleton />}>
              {showCategories ? (
                <CategoryGridView categories={categories} />
              ) : view === 'grid' ? (
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

          {/* Message si aucune donnée trouvée */}
          {!showCategories && courses.length === 0 && !loading && (
            <div className="py-16 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                <span className="text-3xl">🔍</span>
              </div>
              <h3 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
                Aucun cours trouvé
              </h3>
              <p className="mx-auto max-w-md text-gray-600 dark:text-gray-400">
                {query
                  ? `Aucun résultat ne correspond à votre recherche "${query}". Essayez d'autres mots-clés.`
                  : "Essayez d'ajuster vos critères de recherche ou de filtres."}
              </p>
              {query && (
                <button
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.delete('query');
                    window.location.search = params.toString();
                  }}
                  className="mt-6 inline-flex items-center rounded-full bg-gradient-to-r from-gray-600 to-gray-700 px-6 py-3 font-semibold text-white shadow-lg hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2"
                >
                  ✨ Voir tous les cours
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Deletion loading overlay */}
      {isDeleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded-xl bg-white/90 p-6 shadow-xl dark:bg-gray-800/90">
            <LoadingSpinner size="large" color="blue" />
            {/* Spinning bar */}
            <div className="h-2 w-56 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div className="loading-bar h-full rounded-full bg-gradient-to-r from-gray-300 via-gray-500 to-gray-300"></div>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Suppression du cours en cours…
            </p>
            <style jsx>{`
              @keyframes indeterminate {
                0% {
                  transform: translateX(-100%);
                }
                50% {
                  transform: translateX(0%);
                }
                100% {
                  transform: translateX(100%);
                }
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
          <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-2xl dark:bg-gray-800">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <svg
                className="h-8 w-8 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
              Impossible de supprimer le cours
            </h3>
            <p className="mb-3 text-gray-600 dark:text-gray-300">
              {deleteError.status >= 500 || deleteError.status === -1
                ? 'Une erreur serveur est survenue.'
                : 'Une erreur est survenue.'}
            </p>
            <p className="mb-6 text-xs text-gray-500 dark:text-gray-400">
              {deleteError.status > 0 ? `Code ${deleteError.status}` : 'Code inconnu'} ·{' '}
              {deleteError.message}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteError(null)}
                className="rounded-full bg-gray-200 px-5 py-2 text-gray-800 transition hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  setDeleteError(null);
                  setLoading(true);
                  fetchData(true);
                }}
                className="rounded-full bg-gradient-to-r from-gray-600 to-gray-800 px-5 py-2 font-semibold text-white shadow transition hover:from-gray-700 hover:to-gray-900"
              >
                Rafraîchir la liste
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Export the wrapped component - no auth required for course listing
export default withAuth(CoursesPage, { requireAuth: false });
