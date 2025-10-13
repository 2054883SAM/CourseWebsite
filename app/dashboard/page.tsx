'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { withAuth } from '@/components/auth/withAuth';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Container } from '@/components/layout/Container';
import { useAuth } from '@/lib/auth/hooks';
import { getCourses } from '@/lib/supabase';
import type { Course } from '@/lib/supabase/types';
import { CourseGridView } from '@/app/courses/components/CourseGridView';

function DashboardPage() {
  const { user, dbUser, loading } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState<boolean>(true);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchAllCourses = useCallback(async () => {
    try {
      setCoursesLoading(true);
      const list = await getCourses({
        page: 1,
        limit: 1000,
        sort_by: 'created_at',
        sort_order: sortOrder,
      });
      setCourses(list);
      setLoadError(null);
    } catch (e: any) {
      setLoadError(e?.message || 'Impossible de charger les cours.');
      setCourses([]);
    } finally {
      setCoursesLoading(false);
    }
  }, [sortOrder]);

  useEffect(() => {
    fetchAllCourses();
  }, [fetchAllCourses]);

  // Show loading state
  if (loading) {
    return (
      <>
        <AdminLayout>
          <main className="py-8">
            <Container>
              <div className="flex min-h-[400px] items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
              </div>
            </Container>
          </main>
        </AdminLayout>
      </>
    );
  }

  // Redirect if user is not admin
  if (!dbUser || dbUser.role !== 'admin') {
    return (
      <div className="background-beige min-h-screen relative">
        {/* Particules flottantes */}
        <div className="fixed bottom-0 left-0 w-full h-screen overflow-hidden pointer-events-none z-[1]">
          <div className="floating-particles">
            {[...Array(30)].map((_, i) => (
              <div key={i} className="particle" style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}></div>
            ))}
          </div>
        </div>

        <AdminLayout>
          <main className="py-8 relative z-[10]">
            <Container>
              <div className="flex min-h-[400px] items-center justify-center">
                <div className="rounded-xl bg-white p-8 shadow-lg text-center max-w-md">
                  <h1 className="mb-4 text-2xl font-bold text-gray-900">
                    Accès non autorisé
                  </h1>
                  <p className="text-gray-600 mb-6">
                    Cette section est réservée aux administrateurs. Vous n&apos;avez pas les droits
                    nécessaires pour y accéder.
                  </p>
                  <Link
                    href="/"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    Retour à l&apos;accueil
                  </Link>
                </div>
              </div>
            </Container>
          </main>
        </AdminLayout>
      </div>
    );
  }

  return (
    <div className="background-beige min-h-screen relative">
      {/* Particules flottantes */}
      <div className="fixed bottom-0 left-0 w-full h-screen overflow-hidden pointer-events-none z-[1]">
        <div className="floating-particles">
          {[...Array(30)].map((_, i) => (
            <div key={i} className="particle" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}></div>
          ))}
        </div>
      </div>
      
      <AdminLayout>
        <main className="py-8 pt-20 lg:pt-8 relative z-[10]">
          <Container>
            {/* Header Section */}
            <div className="mb-6 sm:mb-8">
              <div className="rounded-xl border border-white/20 bg-white/90 p-4 sm:p-6 shadow-lg backdrop-blur-sm dark:border-gray-700/20 dark:bg-gray-800/90">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
                      Tableau de bord administrateur
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm sm:text-base lg:text-lg">
                      Gérez touts les cours et chaque contenu pédagogique
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => router.push('/create-video')}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 sm:px-6 py-2 sm:py-3 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm sm:text-base"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="xs:hidden">Créer un cours</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Sort Controls */}
              <div className="mt-6 flex flex-col items-center gap-4">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Trier par date :
                </span>
                <div className="inline-flex rounded-xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm shadow-lg dark:border-gray-600 dark:bg-gray-800/80">
                  <button
                    onClick={() => setSortOrder('desc')}
                    className={`rounded-l-lg px-6 py-3 text-sm font-semibold transition-all duration-200 ${
                      sortOrder === 'desc'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-blue-900/20 dark:hover:text-blue-400'
                    }`}
                  >
                    Plus récent
                  </button>
                  <button
                    onClick={() => setSortOrder('asc')}
                    className={`rounded-r-lg border-l-2 border-gray-200 px-6 py-3 text-sm font-semibold transition-all duration-200 dark:border-gray-600 ${
                      sortOrder === 'asc'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-blue-900/20 dark:hover:text-blue-400'
                    }`}
                  >
                    Plus ancien
                  </button>
                </div>
              </div>
            </div>

            {/* Content Section */}
            {coursesLoading ? (
              <div className="flex min-h-[200px] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
              </div>
            ) : loadError ? (
              <div className="rounded-xl bg-white p-6 text-red-700 shadow">
                {loadError}
              </div>
            ) : (
              <CourseGridView
                courses={courses}
                onCourseDeleted={(id) =>
                  setCourses((prev) => prev.filter((c) => (c.id === id ? false : true)))
                }
                onDeleteStart={() => setIsDeleting(true)}
                onDeleteEnd={() => setIsDeleting(false)}
                onDeleteError={() => {
                  /* no-op; handled in child */
                }}
              />
            )}
          </Container>
        </main>
      </AdminLayout>
    </div>
  );
}

export default withAuth(DashboardPage, { requireAuth: true });
