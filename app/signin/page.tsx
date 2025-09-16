import { SignIn } from '@/components/auth/SignIn';
import { Suspense } from 'react';
import { Metadata } from 'next';
import { Logo } from '@/components/layout/Logo';

export const metadata: Metadata = {
  title: 'Connexion - EduKidz',
  description: 'Connectez-vous à votre compte pour accéder à vos cours',
};

export default function SignInPage() {
  return (
    <div className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 py-12 dark:from-blue-900 dark:to-blue-800 sm:px-6 lg:px-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-80 w-80 animate-pulse rounded-full bg-gradient-to-br from-blue-400/20 to-blue-600/20 blur-3xl"></div>
        <div
          className="absolute -bottom-40 -left-40 h-80 w-80 animate-pulse rounded-full bg-gradient-to-tr from-blue-300/20 to-blue-500/20 blur-3xl"
          style={{ animationDelay: '2s' }}
        ></div>
        <div
          className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 transform animate-pulse rounded-full bg-gradient-to-br from-blue-300/10 to-blue-400/10 blur-3xl"
          style={{ animationDelay: '4s' }}
        ></div>
      </div>

      <div className="relative sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo and header */}
        <div className="animate-fade-in-up mb-8 text-center">
          <div className="mb-6 flex justify-center">
            <Logo className="text-6xl" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
            Bienvenue sur EduKidz
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Connectez-vous à votre compte pour accéder à vos cours
          </p>
        </div>

        {/* Sign in form */}
        <Suspense
          fallback={
            <div
              className="animate-fade-in-up rounded-2xl border border-blue-200/50 bg-white/90 px-6 py-8 shadow-2xl backdrop-blur-sm dark:border-blue-700/50 dark:bg-gray-800/90"
              style={{ animationDelay: '0.2s' }}
            >
              Chargement…
            </div>
          }
        >
          <div
            className="animate-fade-in-up rounded-2xl border border-blue-200/50 bg-white/90 px-6 py-8 shadow-2xl backdrop-blur-sm dark:border-blue-700/50 dark:bg-gray-800/90"
            style={{ animationDelay: '0.2s' }}
          >
            <SignIn />
          </div>
        </Suspense>

        {/* Footer */}
        <div className="animate-fade-in-up mt-8 text-center" style={{ animationDelay: '0.4s' }}>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © 2024 EduKidz. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  );
}
