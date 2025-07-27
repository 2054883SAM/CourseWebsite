'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { supabase } from '@/lib/supabase/client';

type DbUser = Database['public']['Tables']['users']['Row'];

interface AuthContextType {
  user: User | null;
  dbUser: DbUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  checkPermission: (requiredRole: string) => boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Extract project reference from URL for cookie debugging
    const getProjectRef = () => {
      const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!SUPABASE_URL) return 'default';
      // Extract the project reference from the URL
      const matches = SUPABASE_URL.match(/https:\/\/([a-z0-9-]+)\.supabase\.co/);
      return matches ? matches[1] : 'default';
    };

    const projectRef = getProjectRef();
    const expectedCookieName = `sb-${projectRef}-auth-token`;

    // Debug current cookies at startup
    console.log(
      'Auth cookies at startup:',
      document.cookie
        .split(';')
        .map((c) => c.trim())
        .filter((c) => c.startsWith('sb-') || c.includes('supabase'))
    );

    console.log('Looking for cookie format:', expectedCookieName);

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting initial session:', error);
      }

      console.log(
        'Initial auth session:',
        session ? 'Present' : 'None',
        session ? `(User: ${session.user.email})` : ''
      );

      setUser(session?.user ?? null);
      if (session?.user) {
        fetchDbUser(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state change event:', _event);
      console.log('Session after event:', session ? 'Present' : 'None');

      setUser(session?.user ?? null);
      if (session?.user) {
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

      // Ensure we clear any partial auth state before starting
      await supabase.auth.signOut();

      // Sign in with credentials
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('Sign in response:', {
        success: !error,
        session: data.session ? 'Present' : 'Missing',
        user: data.user ? `${data.user.email}` : 'Missing',
        error: error?.message,
      });

      if (data.session) {
        // Manually ensure the session is stored properly
        // await supabase.auth.setSession({
        //   access_token: data.session.access_token,
        //   refresh_token: data.session.refresh_token,
        // });
        await fetch('/api/auth/cookie', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          }),
          credentials: 'include',
        });

        // Verify cookies after sign in
        console.log(
          'Cookies after sign in:',
          document.cookie
            .split(';')
            .map((c) => c.trim())
            .filter((c) => c.startsWith('sb-') || c.includes('supabase'))
        );
      }

      return { error: error };
    } catch (error) {
      console.error('Unexpected error during sign in:', error);
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      console.log('Sign out completed. Session cleared.');
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
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) throw signUpError;

      console.log('Sign up response:', {
        success: !signUpError,
        user: data.user ? `${data.user.email}` : 'Missing',
        session: data.session ? 'Present' : 'Missing (email confirmation may be required)',
      });

      if (data.user) {
        const { error: profileError } = await supabase.from('users').insert({
          id: data.user.id,
          email,
          name,
          role: 'student',
        });

        if (profileError) throw profileError;
        return { error: null };
      }

      throw new Error('Signup failed. Please try again.');
    } catch (error) {
      console.error('Error during sign up:', error);
      return { error: error as Error };
    }
  };

  // Fonction pour vérifier le rôle
  const checkPermission = (requiredRole: string) => {
    const role = dbUser?.role;
    if (!role) return false;
    if (requiredRole === 'admin') return role === 'admin';
    if (requiredRole === 'creator') return role === 'admin' || role === 'creator';
    if (requiredRole === 'student') return true;
    return false;
  };

  return (
    <AuthContext.Provider
      value={{ user, dbUser, loading, signIn, signOut, signUp, checkPermission }}
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
