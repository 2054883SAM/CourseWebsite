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
      <div className="min-h-screen w-full background-beige relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-32 sm:w-48 lg:w-64 h-32 sm:h-48 lg:h-64 bg-amber-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-40 sm:w-60 lg:w-80 h-40 sm:h-60 lg:h-80 bg-yellow-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="w-full py-20 relative z-10">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 shadow-2xl" style={{
                boxShadow: '0 0 30px rgba(239, 68, 68, 0.3), 0 0 60px rgba(239, 68, 68, 0.15)'
              }}>
                <svg
                  className="h-8 w-8 text-red-600"
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
              <h3 className="mb-2 text-xl font-bold text-amber-800" style={{
                textShadow: '0 0 15px rgba(245, 158, 11, 0.3)'
              }}>
                Erreur de chargement
              </h3>
              <p className="mb-6 text-gray-700 font-medium" style={{
                textShadow: '0 0 10px rgba(245, 158, 11, 0.2)'
              }}>{error}</p>
              <button
                onClick={() => {
                  setLoading(true);
                  fetchData(true);
                }}
                className="group relative inline-flex items-center rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 font-semibold text-white shadow-xl hover:shadow-amber-500/25 transition-all duration-300 hover:scale-105 overflow-hidden"
                style={{
                  boxShadow: '0 0 20px rgba(245, 158, 11, 0.4)'
                }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span>🔄</span>
                  <span>Réessayer</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-amber-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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
    <div className="min-h-screen w-full background-beige relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Large floating orbs */}
          <div className="absolute top-1/2 left-1/4 w-32 sm:w-48 lg:w-64 h-32 sm:h-48 lg:h-64 bg-gradient-to-br from-orange-400/25 to-orange-600/15 rounded-full blur-2xl animate-pulse shadow-2xl" style={{
            boxShadow: '0 0 45px rgba(245, 158, 11, 0.3), 0 0 90px rgba(251, 146, 60, 0.2)'
          }}></div>
          <div className="absolute top-3/4 right-1/4 w-40 sm:w-60 lg:w-80 h-40 sm:h-60 lg:h-80 bg-gradient-to-br from-orange-400/25 to-orange-600/15 rounded-full blur-2xl animate-pulse shadow-2xl" style={{
            animationDelay: '2s',
            boxShadow: '0 0 45px rgba(245, 158, 11, 0.3), 0 0 90px rgba(251, 146, 60, 0.2)'
          }}></div>
          <div className="absolute top-1/5 right-2/3 w-24 sm:w-36 lg:w-48 h-24 sm:h-36 lg:h-48 bg-gradient-to-br from-orange-400/25 to-orange-600/15 rounded-full blur-2xl animate-pulse shadow-2xl" style={{
            animationDelay: '1s',
            boxShadow: '0 0 45px rgba(245, 158, 11, 0.3), 0 0 90px rgba(251, 146, 60, 0.2)'
          }}></div>
          <div className="absolute top-1/4 right-1/4 w-24 sm:w-36 lg:w-48 h-24 sm:h-36 lg:h-48 bg-gradient-to-br from-orange-400/25 to-orange-600/15 rounded-full blur-2xl animate-pulse shadow-2xl" style={{
            animationDelay: '1.5s',
            boxShadow: '0 0 45px rgba(245, 158, 11, 0.3), 0 0 90px rgba(251, 146, 60, 0.2)'
          }}></div>
          
          {/* Formes géométriques - PARTIE BASSE DE LA PAGE (beaucoup) */}
          <div className="absolute bottom-1/4 left-1/4 w-5 h-5 bg-gradient-to-br from-yellow-400/50 to-orange-500/35 rounded-full animate-bounce shadow-lg" style={{
            animationDuration: '3.2s', 
            animationDelay: '2.1s',
            boxShadow: '0 0 18px rgba(251, 191, 36, 0.4)'
          }}></div>
          <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-blue-500/70 rounded-full animate-pulse shadow-lg" style={{
            animationDelay: '1.2s',
            boxShadow: '0 0 12px rgba(59, 130, 246, 0.5)'
          }}></div>
          <div className="absolute bottom-2/3 left-3/4 w-4 h-4 border-2 border-amber-400/50 rotate-60 animate-spin shadow-lg" style={{
            animationDuration: '22s', 
            animationDelay: '2.8s',
            boxShadow: '0 0 25px rgba(245, 158, 11, 0.3)'
          }}></div>
          <div className="absolute bottom-1/2 right-1/3 w-3 h-3 bg-yellow-400/60 rounded-full animate-bounce shadow-lg" style={{
            animationDuration: '2.8s', 
            animationDelay: '0.6s',
            boxShadow: '0 0 15px rgba(251, 191, 36, 0.5)'
          }}></div>
          
          
          {/* Formes géométriques - TRÈS BAS DE LA PAGE */}
          <div className="absolute top-1/3 left-1/4 w-3 h-3 bg-amber-400/60 rounded-full animate-bounce shadow-lg" style={{
            animationDuration: '2.2s', 
            animationDelay: '0.9s',
            boxShadow: '0 0 12px rgba(245, 158, 11, 0.5)'
          }}></div>
          <div className="absolute top-3/4 right-1/3 w-4 h-4 border-2 border-blue-400/50 rotate-30 animate-spin shadow-lg" style={{
            animationDuration: '16s', 
            animationDelay: '1.6s',
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)'
          }}></div>
          <div className="absolute bottom-1/3 left-2/4 w-2 h-2 bg-yellow-400/70 rounded-full animate-pulse shadow-lg" style={{
            animationDelay: '2.4s',
            boxShadow: '0 0 10px rgba(251, 191, 36, 0.5)'
          }}></div>
          
          <div className="absolute bottom-1/2 left-1/3 w-5 h-5 bg-amber-400/70 squared-full animate-pulse shadow-lg" style={{
            animationDelay: '1.4s',
            boxShadow: '0 0 12px rgba(245, 158, 11, 0.5)'
          }}></div>
          <div className="absolute bottom-3/4 right-1/4 w-5 h-5 border-2 border-blue-400/50 rotate-75 animate-spin shadow-lg" style={{
            animationDuration: '23s', 
            animationDelay: '2.6s',
            boxShadow: '0 0 28px rgba(59, 130, 246, 0.3)'
          }}></div>
      </div>

      <div className="w-full py-20 relative z-10">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-16 text-center relative">
            {/* Floating decorative elements around header */}
            <div className="absolute top-0 left-1/4 w-3 h-3 bg-blue-400/60 rounded-full animate-bounce shadow-lg" style={{
              animationDuration: '3s', 
              animationDelay: '0.5s',
              boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)'
            }}></div>
            <div className="absolute top-8 right-1/4 w-2 h-2 bg-amber-400/70 rounded-full animate-pulse shadow-lg" style={{
              animationDelay: '1s',
              boxShadow: '0 0 10px rgba(245, 158, 11, 0.5)'
            }}></div>
            <div className="absolute bottom-0 left-1/3 w-4 h-4 border-2 border-blue-300/50 rotate-45 animate-spin shadow-lg" style={{
              animationDuration: '12s',
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)'
            }}></div>
            <div className="absolute bottom-4 right-1/3 w-2.5 h-2.5 bg-gradient-to-br from-amber-300/60 to-yellow-400/45 rounded-full animate-bounce shadow-lg" style={{
              animationDuration: '2.5s', 
              animationDelay: '2s',
              boxShadow: '0 0 12px rgba(245, 158, 11, 0.4)'
            }}></div>
            
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600 shadow-2xl transition-all duration-300 hover:scale-110 hover:rotate-3" style={{
              boxShadow: '0 0 30px rgba(59, 130, 246, 0.4), 0 0 60px rgba(59, 130, 246, 0.2)'
            }}>
              <span className="text-2xl transition-transform duration-300 hover:scale-110" style={{
                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3)) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))'
              }}>📚</span>
            </div>
            <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl lg:text-6xl transition-all duration-500 hover:scale-105" style={{
              textShadow: '0 0 20px rgba(245, 158, 11, 0.3)',
              filter: 'drop-shadow(0 0 10px rgba(245, 158, 11, 0.2))'
            }}>
              {showCategories
                ? <span className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 bg-clip-text text-transparent hover:from-amber-500 hover:to-amber-700 transition-all duration-300">Matières Scolaires</span>
                : category
                  ? <span className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 bg-clip-text text-transparent hover:from-amber-500 hover:to-amber-700 transition-all duration-300">Cours de {category}</span>
                  : <span className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 bg-clip-text text-transparent hover:from-amber-500 hover:to-amber-700 transition-all duration-300">Catalogue de Cours</span>}
            </h1>
            <p className="mx-auto max-w-3xl text-xl text-gray-700 leading-relaxed transition-all duration-300 hover:text-gray-800" style={{
              textShadow: '0 0 15px rgba(245, 158, 11, 0.2)'
            }}>
              {showCategories
                ? 'Explorez nos matières conformes au programme scolaire québécois'
                : category
                  ? `Découvrez tous nos cours de ${category}`
                  : 'Découvrez notre collection de cours de qualité pour développer vos compétences et atteindre vos objectifs'}
            </p>
          </div>

          {/* Barre de recherche */}
          <div className="relative z-10 mb-12">
            <div className="mx-auto max-w-3xl relative">
              {/* Decorative elements around search */}
              <div className="absolute -top-4 -left-4 w-8 h-8 border-2 border-blue-400/30 rotate-45 animate-spin" style={{animationDuration: '15s'}}></div>
              <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-amber-400/20 rounded-full animate-bounce" style={{animationDuration: '2s', animationDelay: '1s'}}></div>
              <div className="absolute top-1/2 -left-8 w-4 h-4 border border-blue-300/40 rotate-12 animate-pulse" style={{animationDelay: '0.5s'}}></div>
              <div className="absolute top-1/2 -right-8 w-5 h-5 bg-gradient-to-br from-amber-300/25 to-yellow-400/20 rounded-full animate-bounce" style={{animationDuration: '3s', animationDelay: '2s'}}></div>
              
              <SearchBar initialQuery={query} className="w-full" />
            </div>
          </div>

          {/* Statistiques et contrôles */}
          <div className="mb-8 flex flex-col justify-between md:flex-row md:items-center">
            <div className="mb-4 md:mb-0">
              <div className="relative inline-flex items-center space-x-3 px-4 py-3 rounded-2xl bg-white/60 backdrop-blur-sm border border-blue-200/50 shadow-lg" style={{
                boxShadow: '0 0 20px rgba(59, 130, 246, 0.1), 0 4px 15px rgba(59, 130, 246, 0.05)'
              }}>
              <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500 animate-pulse shadow-lg" style={{
                    boxShadow: '0 0 10px rgba(59, 130, 246, 0.4)'
                  }}></div>
                  <p className="text-gray-700 font-medium" style={{
                    textShadow: '0 0 10px rgba(245, 158, 11, 0.2)'
                  }}>
                  {showCategories ? (
                    <>
                        <span className="font-bold text-blue-600">
                        {categories.length}
                      </span>{' '}
                      matières disponibles
                    </>
                  ) : query ? (
                    <>
                        <span className="font-bold text-blue-600">
                        {courses.length}
                      </span>{' '}
                      cours trouvé{courses.length !== 1 && 's'} pour{' '}
                        <span className="font-bold text-amber-600">
                        &ldquo;{query}&rdquo;
                      </span>
                    </>
                  ) : (
                    <>
                        <span className="font-bold text-blue-600">
                        {courses.length}
                      </span>{' '}
                      cours disponibles
                      {category && (
                        <>
                          {' '}
                          en{' '}
                            <span className="font-bold text-amber-600">
                            {category}
                          </span>
                        </>
                      )}
                    </>
                  )}
                </p>
                </div>
                {/* Decorative elements */}
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400/40 rounded-full animate-pulse"></div>
                <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-amber-400/40 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
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
              <nav className="flex items-center space-x-2 text-sm text-gray-600">
                <Link
                  href="/courses"
                  className="transition-colors hover:text-amber-600 font-medium"
                >
                  Matières
                </Link>
                <span className="text-amber-500">/</span>
                <span className="font-bold text-amber-800">{category}</span>
              </nav>
            </div>
          )}

          {/* Contenu principal */}
          <div className="relative z-0">
            {/* Formes géométriques autour du contenu */}
            <div className="absolute -top-8 left-1/4 w-3 h-3 bg-blue-400/60 rounded-full animate-bounce shadow-lg" style={{
              animationDuration: '2.8s', 
              animationDelay: '1.3s',
              boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)'
            }}></div>
            <div className="absolute -top-4 right-1/3 w-4 h-4 border-2 border-amber-300/50 rotate-45 animate-spin shadow-lg" style={{
              animationDuration: '17s', 
              animationDelay: '2.1s',
              boxShadow: '0 0 20px rgba(245, 158, 11, 0.3)'
            }}></div>
            <div className="absolute top-1/4 -left-6 w-2 h-2 bg-yellow-400/60 rounded-full animate-pulse shadow-lg" style={{
              animationDelay: '0.8s',
              boxShadow: '0 0 10px rgba(251, 191, 36, 0.5)'
            }}></div>
            <div className="absolute bottom-1/4 -left-0 w-3 h-3 bg-gradient-to-br from-amber-400/50 to-orange-500/35 rounded-full animate-bounce shadow-lg" style={{
              animationDuration: '3.1s', 
              animationDelay: '2.4s',
              boxShadow: '0 0 15px rgba(245, 158, 11, 0.4)'
            }}></div>
            <div className="absolute bottom-1/3 -right-0 w-2 h-2 bg-blue-500/70 rounded-full animate-pulse shadow-lg" style={{
              animationDelay: '1.5s',
              boxShadow: '0 0 12px rgba(59, 130, 246, 0.5)'
            }}></div>
            
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

        </div>
      </div>

      {/* Deletion loading overlay */}
      {isDeleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded-xl bg-amber-50/95 backdrop-blur-sm p-6 shadow-2xl border border-amber-300 relative" style={{
            boxShadow: '0 0 30px rgba(245, 158, 11, 0.3), 0 0 60px rgba(245, 158, 11, 0.15)'
          }}>
            {/* Formes géométriques dans la modale */}
            <div className="absolute -top-2 -left-2 w-3 h-3 bg-blue-400/30 rounded-full animate-bounce" style={{animationDuration: '2.5s', animationDelay: '0.5s'}}></div>
            <div className="absolute -top-2 -right-2 w-2 h-2 bg-amber-400/40 rounded-full animate-pulse" style={{animationDelay: '1.2s'}}></div>
            <div className="absolute -bottom-2 -left-2 w-4 h-4 border border-blue-300/25 rotate-45 animate-spin" style={{animationDuration: '12s', animationDelay: '1.8s'}}></div>
            <div className="absolute -bottom-2 -right-2 w-2.5 h-2.5 bg-yellow-400/30 rounded-full animate-bounce" style={{animationDuration: '3s', animationDelay: '0.8s'}}></div>
            <LoadingSpinner size="large" color="blue" />
            {/* Spinning bar */}
            <div className="h-2 w-56 overflow-hidden rounded-full bg-amber-200">
              <div className="loading-bar h-full rounded-full bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300"></div>
            </div>
            <p className="text-sm text-amber-800 font-medium">
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
          <div className="mx-4 w-full max-w-md rounded-2xl bg-amber-50/95 backdrop-blur-sm p-6 text-center shadow-2xl border border-amber-300 relative" style={{
            boxShadow: '0 0 30px rgba(245, 158, 11, 0.3), 0 0 60px rgba(245, 158, 11, 0.15)'
          }}>
            {/* Formes géométriques dans la modale d'erreur */}
            <div className="absolute -top-3 -left-3 w-4 h-4 border border-blue-400/30 rotate-30 animate-spin" style={{animationDuration: '14s', animationDelay: '1.5s'}}></div>
            <div className="absolute -top-3 -right-3 w-3 h-3 bg-amber-400/25 rounded-full animate-bounce" style={{animationDuration: '2.8s', animationDelay: '0.7s'}}></div>
            <div className="absolute -bottom-3 -left-3 w-2 h-2 bg-yellow-400/35 rounded-full animate-pulse" style={{animationDelay: '1.9s'}}></div>
            <div className="absolute -bottom-3 -right-3 w-3.5 h-3.5 border-2 border-blue-300/25 rotate-60 animate-spin" style={{animationDuration: '16s', animationDelay: '2.2s'}}></div>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 shadow-lg">
              <svg
                className="h-8 w-8 text-red-600"
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
            <h3 className="mb-2 text-xl font-bold text-amber-800" style={{
              textShadow: '0 0 10px rgba(245, 158, 11, 0.2)'
            }}>
              Impossible de supprimer le cours
            </h3>
            <p className="mb-3 text-gray-700 font-medium">
              {deleteError.status >= 500 || deleteError.status === -1
                ? 'Une erreur serveur est survenue.'
                : 'Une erreur est survenue.'}
            </p>
            <p className="mb-6 text-xs text-gray-600">
              {deleteError.status > 0 ? `Code ${deleteError.status}` : 'Code inconnu'} ·{' '}
              {deleteError.message}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteError(null)}
                className="rounded-full bg-amber-200 px-5 py-2 text-amber-800 font-medium transition hover:bg-amber-300 shadow-lg"
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  setDeleteError(null);
                  setLoading(true);
                  fetchData(true);
                }}
                className="rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2 font-semibold text-white shadow-lg transition hover:from-amber-600 hover:to-amber-700 hover:scale-105"
                style={{
                  boxShadow: '0 0 15px rgba(245, 158, 11, 0.3)'
                }}
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
