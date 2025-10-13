'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { withAuth } from '@/components/auth/withAuth';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { useAuth } from '@/lib/auth/AuthContext';

// Import dashboard components
import DashboardContent from './components/DashboardContent';
import MyLearningContent from '@/app/learning/components/MyLearningContent';
import { Container } from '@/components/layout/Container';

function LearningPage() {
  const { dbUser } = useAuth();
  const searchParams = useSearchParams();
  const pageParam = searchParams.get('page');
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'my-learning'>('dashboard');
  const membershipCheckedRef = useRef(false);

  useEffect(() => {
    // Set default to dashboard if no page parameter or invalid parameter
    if (pageParam === 'my-learning') {
      setCurrentPage('my-learning');
    } else {
      setCurrentPage('dashboard');
    }
  }, [pageParam]);

  // On mount, verify Stripe membership status once for student subscribers
  useEffect(() => {
    if (membershipCheckedRef.current) return;
    membershipCheckedRef.current = true;

    if (dbUser?.role === 'student') {
      fetch('/api/stripe/check-membership', { method: 'POST', keepalive: true }).catch(() => {});
    }
  }, [dbUser?.role, dbUser?.membership]);

  return (
    <div className="background-beige relative min-h-screen">
      {/* Particules flottantes */}
      <div className="pointer-events-none fixed bottom-0 left-0 z-[1] h-screen w-full overflow-hidden">
        <div className="floating-particles">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            ></div>
          ))}
        </div>
      </div>

      <StudentLayout>
        <main className="relative z-[10] py-8">
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
