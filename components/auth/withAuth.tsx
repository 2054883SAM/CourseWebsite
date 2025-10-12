'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useNavigation } from '@/lib/navigation/NavigationContext';
import { Role } from '@/lib/auth/types';

interface WithAuthProps {
  requiredRole?: Role;
  requireAuth?: boolean;
  loadingComponent?: React.ReactNode;
  unauthorizedComponent?: React.ReactNode;
}

const DefaultLoading = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="text-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
);

const DefaultUnauthorized = () => {
  const { user } = useAuth();
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // If no user (e.g., after sign out on a protected page), go home
    // If user exists but lacks permissions, show the unauthorized page
    window.location.href = user ? '/unauthorized' : '/';
  }, [user]);
  return null;
};

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  {
    requiredRole,
    requireAuth = true,
    loadingComponent = <DefaultLoading />,
    unauthorizedComponent = <DefaultUnauthorized />,
  }: WithAuthProps = {}
) {
  return function WithAuthComponent(props: P) {
    const { user, loading, checkPermission } = useAuth();
    const { isNavigating } = useNavigation();

    if (loading && !isNavigating) {
      return loadingComponent;
    }

    if (requireAuth && !user) {
      return unauthorizedComponent;
    }

    if (requiredRole && !checkPermission(requiredRole)) {
      return unauthorizedComponent;
    }

    return <WrappedComponent {...props} />;
  };
}
