'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { withAuth } from '@/components/auth/withAuth';
import { StudentLayout } from '@/components/layout/StudentLayout';

// Import dashboard components
import DashboardContent from './components/DashboardContent';
import MyLearningContent from '@/app/learning/components/MyLearningContent';
import { Container } from '@/components/layout/Container';

function LearningPage() {
  const searchParams = useSearchParams();
  const pageParam = searchParams.get('page');
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'my-learning'>('dashboard');

  useEffect(() => {
    // Set default to dashboard if no page parameter or invalid parameter
    if (pageParam === 'my-learning') {
      setCurrentPage('my-learning');
    } else {
      setCurrentPage('dashboard');
    }
  }, [pageParam]);

  return (
    <StudentLayout>
      <main className="py-8">
        <Container>
          {currentPage === 'dashboard' && <DashboardContent />}
          {currentPage === 'my-learning' && <MyLearningContent />}
        </Container>
      </main>
    </StudentLayout>
  );
}

export default withAuth(LearningPage, { requireAuth: true });
