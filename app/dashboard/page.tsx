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
      <>
        <AdminLayout>
          <main className="py-8">
            <Container>
              <div className="rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800">
                <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                  Accès non autorisé
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Cette section est réservée aux administrateurs. Vous n&apos;avez pas les droits
                  nécessaires pour y accéder.
                </p>
                <div className="mt-6">
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
      </>
    );
  }

  return (
    <>
      <AdminLayout>
        <main className="py-8">
          <Container>
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Tableau de bord administrateur
                </h1>
                <button
                  onClick={() => router.push('/create-video')}
                  className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Créer la vidéo
                </button>
              </div>

              {/* Sort Controls */}
              <div className="mt-4 flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Trier par date :
                </span>
                <div className="inline-flex rounded-lg border border-gray-300 bg-white shadow-sm dark:border-gray-600 dark:bg-gray-800">
                  <button
                    onClick={() => setSortOrder('desc')}
                    className={`rounded-l-lg px-4 py-2 text-sm font-medium transition-colors ${
                      sortOrder === 'desc'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    Plus récent
                  </button>
                  <button
                    onClick={() => setSortOrder('asc')}
                    className={`rounded-r-lg border-l border-gray-300 px-4 py-2 text-sm font-medium transition-colors dark:border-gray-600 ${
                      sortOrder === 'asc'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    Plus ancien
                  </button>
                </div>
              </div>
            </div>

            {coursesLoading ? (
              <div className="flex min-h-[200px] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
              </div>
            ) : loadError ? (
              <div className="rounded-xl bg-white p-6 text-red-700 shadow dark:bg-gray-800">
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
    </>
  );
}

export default withAuth(DashboardPage, { requireAuth: true });
