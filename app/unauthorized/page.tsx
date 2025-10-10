'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { Role } from '@/lib/auth/types';

const roleMessages: Record<Role, string> = {
  admin: 'Cette page nécessite des privilèges d\'administrateur.',
  teacher: 'Cette page n\'est accessible qu\'aux enseignants et administrateurs.',
  student: 'Cette page nécessite un compte étudiant valide.',
};

const roleUpgradeMessages: Record<Role, string> = {
  teacher: 'Veuillez contacter un administrateur pour demander les privilèges d\'enseignant.',
  admin: 'L\'accès administrateur est restreint. Veuillez contacter le support si vous pensez qu\'il s\'agit d\'une erreur.',
  student: 'Veuillez vous connecter ou créer un compte pour accéder à ce contenu.',
};

function UnauthorizedContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const requiredRole = searchParams.get('requiredRole') as Role;

  return (
    <div className="relative flex min-h-screen flex-col justify-center overflow-hidden background-beige py-12 sm:px-6 lg:px-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 border border-amber-300 rounded-full"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 border border-orange-300 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 w-16 h-16 border border-yellow-300 rounded-full"></div>
      </div>
      
      <div className="relative sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="rounded-3xl border-2 border-amber-200/50 bg-white/95 px-8 py-10 shadow-2xl backdrop-blur-sm">
          {/* Header with Icon */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-red-600 shadow-xl">
              <span className="text-3xl">🚫</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Accès Refusé
            </h1>
            <div className="w-16 h-1 bg-gradient-to-r from-red-500 to-red-600 rounded-full mx-auto"></div>
          </div>

          {/* Main Content */}
          <div className="text-center mb-8">
            <p className="text-lg text-gray-700 mb-6">
              {user ? (
                // User is logged in but lacks required role
                <>
                  <span className="font-semibold text-gray-900">
                    {roleMessages[requiredRole] || 'Vous n\'avez pas la permission d\'accéder à cette page.'}
                  </span>
                  <br />
                  <span className="text-gray-600">
                    {roleUpgradeMessages[requiredRole]}
                  </span>
                </>
              ) : (
                // User is not logged in
                <>
                  <span className="font-semibold text-gray-900">
                    Veuillez vous connecter pour accéder à cette page.
                  </span>
                  <br />
                  <span className="text-gray-600">
                    Vous n'avez pas de compte ? Vous pouvez vous inscrire gratuitement.
                  </span>
                </>
              )}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            {!user ? (
              <>
                <Link
                  href="/signin"
                  className="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 font-semibold text-white text-center transition-all duration-200 hover:from-blue-600 hover:to-blue-700 hover:shadow-lg transform hover:scale-105"
                >
                  Se connecter
                </Link>
                <Link
                  href="/signup"
                  className="flex-1 rounded-xl border-2 border-gray-300 px-6 py-3 text-gray-800 text-center font-medium transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 hover:shadow-lg"
                >
                  Créer un compte
                </Link>
              </>
            ) : (
              <Link
                href="/"
                className="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 font-semibold text-white text-center transition-all duration-200 hover:from-blue-600 hover:to-blue-700 hover:shadow-lg transform hover:scale-105"
              >
                Retour à l'accueil
              </Link>
            )}
          </div>

          {/* Help Message */}
          <div className="mt-8 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
            <div className="text-center">
              <span className="text-2xl mb-2 block">💡</span>
              <p className="text-sm font-medium text-amber-800">
                {!user 
                  ? "Créez votre compte pour accéder à tous nos cours et fonctionnalités !"
                  : "Contactez l'administrateur si vous pensez qu'il s'agit d'une erreur."
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UnauthorizedPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">Chargement…</div>}>
      <UnauthorizedContent />
    </Suspense>
  );
}