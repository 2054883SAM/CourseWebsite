'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { supabase } from '@/lib/supabase/client';

export function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const { signIn, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Helper function to check authentication status
  const verifyAuthStatus = async () => {
    try {
      // Get current session from Supabase
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Error getting auth session:', sessionError);
      }

      // Check if we have a valid session with required data
      const isValid = !!(session?.user?.id && session?.access_token);

      // Debug information
      const debugMessage = `
Auth Status:
- Session present: ${!!session}
- User ID: ${session?.user?.id || 'none'}
- Access token present: ${!!session?.access_token}
- Session valid: ${isValid}
`;
      console.log(debugMessage);
      setDebugInfo(debugMessage);

      return isValid;
    } catch (e) {
      console.error('Error verifying auth status:', e);
      setDebugInfo(`Error checking auth: ${e instanceof Error ? e.message : String(e)}`);
      return false;
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      const redirectTo =
        searchParams.get('redirectTo') || sessionStorage.getItem('redirectAfterLogin') || '/';

      // Verify auth status before redirecting
      verifyAuthStatus().then((isAuthenticated) => {
        if (isAuthenticated) {
          console.log('✅ Authentication verified, redirecting to', redirectTo);
          sessionStorage.removeItem('redirectAfterLogin');
          router.replace(redirectTo);
        } else {
          console.error('⚠️ Authentication issue detected in useEffect - not redirecting');
          setError('Authentication issue detected. Please try signing in again.');
        }
      });
    }
  }, [user, authLoading, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setDebugInfo(null);

    try {
      // Sign in using AuthContext
      const { error: signInError } = await signIn(email, password);
      if (signInError) throw signInError;

      console.log('Sign-in attempt completed, verifying authentication...');

      // Give Supabase a moment to set up the session
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Verify authentication was successful
      const isAuthenticated = await verifyAuthStatus();

      if (!isAuthenticated) {
        throw new Error('Authentication failed. Please try again.');
      }

      // Get redirect destination
      const redirectTo =
        searchParams.get('redirectTo') || sessionStorage.getItem('redirectAfterLogin') || '/';

      // Clean up stored redirect
      sessionStorage.removeItem('redirectAfterLogin');

      // Redirect to the appropriate page
      console.log('✅ Authentication verified, redirecting to', redirectTo);
      router.push(redirectTo);
    } catch (err) {
      console.error('Sign in error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign in');

      // Try to get latest auth status for debugging
      verifyAuthStatus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Se connecter
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Ou{' '}
          <Link 
            href="/signup" 
            className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 transition-colors duration-200 hover:underline"
          >
            créer un nouveau compte
          </Link>
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 animate-fade-in-up">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-red-700 dark:text-red-200">{error}</span>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Adresse email
            </label>
            <div className="relative">
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="votre@email.com"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
            </div>
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Votre mot de passe"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Link
            href="/reset-password"
            className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 transition-colors duration-200 hover:underline"
          >
            Mot de passe oublié ?
          </Link>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connexion en cours...
              </div>
            ) : (
              'Se connecter'
            )}
          </button>
        </div>

        {debugInfo && (
          <div className="mt-4 p-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Informations de débogage :</h4>
            <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{debugInfo}</pre>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Si vous rencontrez des problèmes de connexion :
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={() => {
                // Sign out from Supabase first to clean up session
                supabase.auth.signOut().then(() => {
                  console.log('Signed out from Supabase');

                  // Clear localStorage items related to auth
                  try {
                    Object.keys(localStorage).forEach((key) => {
                      if (key.includes('supabase') || key.includes('sb-')) {
                        localStorage.removeItem(key);
                      }
                    });
                  } catch (e) {
                    console.warn('Error clearing localStorage:', e);
                  }

                  setDebugInfo('Déconnexion effectuée et données d\'authentification effacées. Veuillez réessayer de vous connecter.');

                  // Force reload to completely reset state
                  setTimeout(() => window.location.reload(), 500);
                });
              }}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors duration-200 hover:underline"
            >
              Se déconnecter et effacer les données
            </button>

            <button
              type="button"
              onClick={async () => {
                const status = await verifyAuthStatus();
                setDebugInfo(
                  `Résultats de la vérification d'authentification : ${status ? 'Session valide trouvée' : 'Aucune session valide'}\n\nInformations détaillées de la session : ${JSON.stringify(await supabase.auth.getSession(), null, 2)}`
                );
              }}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors duration-200 hover:underline"
            >
              Vérifier le statut d'authentification
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
