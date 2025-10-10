'use client';

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
  if (typeof window !== 'undefined') {
    window.location.href = '/unauthorized';
  }
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