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

const DefaultUnauthorized = () => (
  <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
    <div className="text-center">
      <h2 className="mb-4 text-2xl font-bold">Access Denied</h2>
      <p className="mb-6 text-gray-600">You need to be signed in to access this page.</p>
      <a
        href="/signin"
        className="inline-flex h-10 items-center justify-center rounded-md bg-primary-600 px-4 font-medium text-white transition-colors hover:bg-primary-700"
      >
        Sign In
      </a>
    </div>
  </div>
);

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