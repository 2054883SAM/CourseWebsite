'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { supabase } from '@/lib/supabase/client';
import { updateLastConnectedAt } from '@/lib/supabase/users';
import { getAbsoluteUrl } from '@/lib/utils/url';

type DbUser = Database['public']['Tables']['users']['Row'];

interface AuthContextType {
  user: User | null;
  dbUser: DbUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  signUp: (
    email: string,
    password: string,
    name: string
  ) => Promise<{ error: Error | null; requiresEmailConfirmation: boolean; email?: string | null }>;
  signInWithProvider: (
    provider: 'google' | 'apple',
    redirectTo?: string
  ) => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  checkPermission: (requiredRole: string) => boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize session from storage
    supabase.auth
      .getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          console.error('Error getting initial session:', error);
          setLoading(false);
          return;
        }

        const initialUser = session?.user ?? null;
        console.log(
          '[AuthContext] Initial session:',
          session ? `User: ${initialUser?.email}` : 'No session'
        );

        setUser(initialUser);

        if (initialUser && session) {
          // Sync server-side cookies on initial load (for SSR/middleware)
          fetch('/api/auth/cookie', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              access_token: session.access_token,
              refresh_token: session.refresh_token,
            }),
            credentials: 'include',
          }).catch((e) => {
            console.warn('Failed to sync cookies on init:', e);
          });

          fetchDbUser(initialUser.id);
        } else {
          setLoading(false);
        }
      })
      .catch((e) => {
        console.error('Session initialization failed:', e);
        setLoading(false);
      });

    // Listen for auth state changes (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AuthContext] Auth event:', event);

      setUser(session?.user ?? null);

      if (session?.user) {
        // Sync cookies with server on sign in or token refresh
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          fetch('/api/auth/cookie', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              access_token: session.access_token,
              refresh_token: session.refresh_token,
            }),
            credentials: 'include',
          }).catch((e) => {
            console.warn('Failed to sync cookies on auth event:', e);
          });
        }

        fetchDbUser(session.user.id);
      } else {
        setDbUser(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchDbUser = async (userId: string) => {
    try {
      const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();

      if (error) throw error;
      setDbUser(data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setDbUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting sign in for:', email);

      // Sign in with credentials - @supabase/ssr handles session storage automatically
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error.message);
        return { error };
      }

      if (data.session) {
        console.log('Sign in successful, session established');

        // Sync cookies with server for SSR/middleware
        await fetch('/api/auth/cookie', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          }),
          credentials: 'include',
        }).catch((e) => {
          console.warn('Failed to sync cookies with server:', e);
        });

        // Update last connected time (non-blocking)
        updateLastConnectedAt().catch(() => {});
      }

      return { error: null };
    } catch (error) {
      console.error('Unexpected error during sign in:', error);
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      console.log('Attempting sign up for:', email);

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: `${window.location.origin}/signin`,
        },
      });

      if (signUpError) throw signUpError;

      const debugInfo = {
        success: !signUpError,
        user: data.user ? `${data.user.email}` : 'Missing',
        session: data.session ? 'Present' : 'Missing (email confirmation may be required)',
      };
      console.log('Sign up response:', debugInfo);

      // Determine if email confirmation is required (no session returned)
      const requiresEmailConfirmation = !data.session;

      // Profile row is now created automatically via DB trigger.
      if (data.user) {
        // If a session exists (no email confirmation required), update last connected
        if (data.session) {
          updateLastConnectedAt();
        }
        return {
          error: null,
          requiresEmailConfirmation,
          email: data.user.email ?? email,
        };
      }

      throw new Error('Signup failed. Please try again.');
    } catch (error) {
      console.error('Error during sign up:', error);
      return { error: error as Error, requiresEmailConfirmation: false };
    }
  };

  const resetPassword = async (email: string): Promise<{ error: Error | null }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        return { error } as { error: Error };
      }
      return { error: null };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return { error: error as Error };
    }
  };

  const signInWithProvider = async (
    provider: 'google' | 'apple',
    redirectTo?: string
  ): Promise<{ error: Error | null }> => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          // Use absolute URL that respects production URL_LINK in prod
          redirectTo: redirectTo ?? getAbsoluteUrl('/'),
          queryParams: { prompt: 'select_account' },
        },
      });

      if (error) throw error;

      // data.url exists for OAuth redirect; Supabase will navigate automatically
      return { error: null };
    } catch (error) {
      console.error('OAuth sign-in error:', error);
      return { error: error as Error };
    }
  };

  // Fonction pour vérifier le rôle
  const checkPermission = (requiredRole: string) => {
    const role = dbUser?.role;
    if (!role) return false;
    if (requiredRole === 'admin') return role === 'admin';
    if (requiredRole === 'teacher') return role === 'admin' || role === 'teacher';
    if (requiredRole === 'student') return true;
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        dbUser,
        loading,
        signIn,
        signOut,
        signUp,
        signInWithProvider,
        resetPassword,
        checkPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
