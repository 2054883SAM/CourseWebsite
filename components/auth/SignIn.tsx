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
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
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
      console.error("Error verifying auth status:", e);
      setDebugInfo(`Error checking auth: ${e instanceof Error ? e.message : String(e)}`);
      return false;
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      const redirectTo =
        searchParams.get('redirectTo') ||
        sessionStorage.getItem('redirectAfterLogin') ||
        '/';

      // Verify auth status before redirecting
      verifyAuthStatus().then(isAuthenticated => {
        if (isAuthenticated) {
          console.log("✅ Authentication verified, redirecting to", redirectTo);
          sessionStorage.removeItem('redirectAfterLogin');
          router.replace(redirectTo);
        } else {
          console.error("⚠️ Authentication issue detected in useEffect - not redirecting");
          setError("Authentication issue detected. Please try signing in again.");
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

      console.log("Sign-in attempt completed, verifying authentication...");
      
      // Give Supabase a moment to set up the session
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Verify authentication was successful
      const isAuthenticated = await verifyAuthStatus();
      
      if (!isAuthenticated) {
        throw new Error("Authentication failed. Please try again.");
      }

      // Get redirect destination
      const redirectTo = searchParams.get('redirectTo') || 
                        sessionStorage.getItem('redirectAfterLogin') || 
                        '/';

      // Clean up stored redirect
      sessionStorage.removeItem('redirectAfterLogin');
      
      // Redirect to the appropriate page
      console.log("✅ Authentication verified, redirecting to", redirectTo);
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
    <div className="w-full max-w-md space-y-8">
      <div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link
            href="/signup"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            create a new account
          </Link>
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        <div className="-space-y-px rounded-md shadow-sm">
          <div>
            <label htmlFor="email-address" className="sr-only">
              Email address
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="relative block w-full rounded-t-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
              placeholder="Email address"
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="relative block w-full rounded-b-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
              placeholder="Password"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm">
            <Link
              href="/reset-password"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Forgot your password?
            </Link>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="group relative flex w-full justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </div>

        {debugInfo && (
          <div className="mt-4 p-2 border border-gray-300 rounded bg-gray-50 text-xs font-mono whitespace-pre-wrap">
            <h4 className="font-bold">Debug Information:</h4>
            {debugInfo}
          </div>
        )}

        <div className="mt-4 text-xs text-gray-500">
          <p>If you&apos;re having trouble signing in:</p>
          <button 
            type="button" 
            onClick={() => {
              // Sign out from Supabase first to clean up session
              supabase.auth.signOut().then(() => {
                console.log("Signed out from Supabase");
                
                // Clear localStorage items related to auth
                try {
                  Object.keys(localStorage).forEach(key => {
                    if (key.includes('supabase') || key.includes('sb-')) {
                      localStorage.removeItem(key);
                    }
                  });
                } catch (e) {
                  console.warn('Error clearing localStorage:', e);
                }
                
                setDebugInfo("Signed out and cleared auth data. Please try signing in again.");
                
                // Force reload to completely reset state
                setTimeout(() => window.location.reload(), 500);
              });
            }}
            className="text-primary-600 underline"
          >
            Sign out and clear data
          </button>
          
          <button 
            type="button" 
            onClick={async () => {
              const status = await verifyAuthStatus();
              setDebugInfo(`Auth check results: ${status ? 'Valid session found' : 'No valid session'}\n\nDetailed session info: ${JSON.stringify(await supabase.auth.getSession(), null, 2)}`);
            }}
            className="ml-4 text-primary-600 underline"
          >
            Check current auth status
          </button>
        </div>
      </form>
    </div>
  );
}
