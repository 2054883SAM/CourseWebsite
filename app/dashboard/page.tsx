'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { withAuth } from '@/components/auth/withAuth';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Container } from '@/components/layout/Container';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/lib/auth/hooks';

// Import dashboard components
import DashboardContent from './components/DashboardContent';
import UsersContent from './components/UsersContent';
import CoursesContent from './components/CoursesContent';
import ReportsContent from './components/ReportsContent';

function DashboardPage() {
  const searchParams = useSearchParams();
  const pageParam = searchParams.get('page');
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'users' | 'courses' | 'reports'>(
    'dashboard'
  );
  const { user, dbUser, loading } = useAuth();

  useEffect(() => {
    // Set default to dashboard if no page parameter or invalid parameter
    if (pageParam === 'users') {
      setCurrentPage('users');
    } else if (pageParam === 'courses') {
      setCurrentPage('courses');
    } else if (pageParam === 'reports') {
      setCurrentPage('reports');
    } else {
      setCurrentPage('dashboard');
    }
  }, [pageParam]);

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
            {currentPage === 'dashboard' && <DashboardContent />}
            {currentPage === 'users' && <UsersContent />}
            {currentPage === 'courses' && <CoursesContent />}
            {currentPage === 'reports' && <ReportsContent />}
          </Container>
        </main>
      </AdminLayout>
    </>
  );
}

export default withAuth(DashboardPage, { requireAuth: true });
