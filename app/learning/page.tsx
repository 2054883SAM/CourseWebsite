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
      
      <StudentLayout>
        <main className="py-8 relative z-[10]">
          <Container>
            {currentPage === 'dashboard' && <DashboardContent />}
            {currentPage === 'my-learning' && <MyLearningContent />}
          </Container>
        </main>
      </StudentLayout>
    </div>
  );
}

export default withAuth(LearningPage, { requireAuth: true });
