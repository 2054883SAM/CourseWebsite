'use client';

import { useAuth } from '@/lib/auth/AuthContext';
import { withAuth } from '@/components/auth/withAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useRouter } from 'next/navigation';
import { useNavigation } from '@/lib/navigation/NavigationContext';
import { useEffect } from 'react';

function MyLearningLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { isNavigating } = useNavigation();
  const router = useRouter();

  // Redirect unauthenticated users to sign in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin?redirect=/my-learning');
    }
  }, [user, loading, router]);

  // Ne pas afficher de loading pendant la navigation
  if (loading && !isNavigating) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}

// Wrap with withAuth HOC to ensure authentication
export default withAuth(MyLearningLayout, { requireAuth: true }); 