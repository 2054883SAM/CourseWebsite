'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { Role } from '@/lib/auth/types';

const roleMessages = {
  admin: 'This page requires administrator privileges.',
  creator: 'This page is only accessible to course creators and administrators.',
  student: 'This page requires a valid student account.',
};

const roleUpgradeMessages = {
  creator: 'Please contact an administrator to request creator privileges.',
  admin: 'Administrator access is restricted. Please contact support if you believe this is an error.',
  student: 'Please sign in or create an account to access this content.',
};

export default function UnauthorizedPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const requiredRole = searchParams.get('requiredRole') as Role;

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Access Denied
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {user ? (
              // User is logged in but lacks required role
              <>
                <p className="mb-4">{roleMessages[requiredRole] || 'You do not have permission to access this page.'}</p>
                <p>{roleUpgradeMessages[requiredRole]}</p>
              </>
            ) : (
              // User is not logged in
              <>
                <p className="mb-4">Please sign in to access this page.</p>
                <p>Don&apos;t have an account? You can sign up for free.</p>
              </>
            )}
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {!user ? (
            <>
              <Link
                href="/signin"
                className="block w-full rounded-md bg-primary-600 px-4 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-center text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50"
              >
                Create Account
              </Link>
            </>
          ) : (
            <Link
              href="/"
              className="block w-full rounded-md bg-primary-600 px-4 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
            >
              Return Home
            </Link>
          )}
        </div>
      </div>
    </div>
  );
} 