'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { SupabaseClient, User } from '@supabase/supabase-js';
import { getCurrentUser } from '../supabase/users';
import { AuthContextType, UserWithRole, Role } from './types';
import { checkPermission, getRoleFlags } from './utils';
import { useAuthActions } from './hooks';
import { User as DbUser } from '../supabase/types';

/**
 * Default context value with no-op functions
 * Used when accessing context outside provider
 */
const AuthContext = createContext<AuthContextType>({
  user: null,
  dbUser: null,
  loading: true,
  signOut: async () => {},
  signUp: async () => ({ error: null }),
  signIn: async () => ({ error: null }),
  resetPassword: async () => ({ error: null }),
  isAdmin: false,
  isCreator: false,
  isStudent: false,
  checkPermission: () => false
});

/**
 * Hook to access auth context
 * Throws error if used outside AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Main auth provider component that manages authentication state
 * and provides auth-related functionality to the app
 */
export const AuthProvider = ({
  children,
  supabaseClient,
}: {
  children: React.ReactNode;
  supabaseClient: SupabaseClient;
}) => {
  const [user, setUser] = useState<UserWithRole | null>(null);
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  // Get auth action functions from our custom hook
  const authActions = useAuthActions(supabaseClient);

  /**
   * Fetches additional user data and role from our database
   * Updates both user and dbUser state
   */
  const fetchUserRole = useCallback(async (authUser: User) => {
    try {
      const dbUser = await getCurrentUser();
      if (dbUser && mountedRef.current) {
        setDbUser(dbUser);
        setUser(currentUser => currentUser ? { ...currentUser, role: dbUser.role } : null);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      if (mountedRef.current) {
        setUser(null);
        setDbUser(null);
      }
    }
  }, []);

  /**
   * Updates auth state with the given session
   * Handles both user and dbUser updates
   */
  const handleAuthStateChange = useCallback(async (session: { user: User } | null) => {
    try {
      if (!session?.user) {
        if (mountedRef.current) {
          setUser(null);
          setDbUser(null);
          setLoading(false);
        }
        return;
      }

      // Immediately set user and unblock UI
      const currentUser = { ...session.user } as UserWithRole;
      if (mountedRef.current) {
        setUser(currentUser);
        setLoading(false);
        
        // Fetch role in background
        fetchUserRole(currentUser);
      }
    } catch (error) {
      console.error('Error handling auth state change:', error);
      if (mountedRef.current) {
        setUser(null);
        setDbUser(null);
        setLoading(false);
      }
    }
  }, [fetchUserRole]);

  // Initial session check and auth state listener setup
  useEffect(() => {
    mountedRef.current = true;
    let authSubscription: { unsubscribe: () => void } | null = null;

    const initializeAuth = async () => {
      try {
        // Initial session check
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (mountedRef.current) {
          await handleAuthStateChange(session);
        }

        // Subscribe to auth changes
        const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
          async (_, session) => {
            if (mountedRef.current) {
              await handleAuthStateChange(session);
            }
          }
        );
        
        authSubscription = subscription;
      } catch (error) {
        console.error('Error during auth initialization:', error);
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mountedRef.current = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, [supabaseClient, handleAuthStateChange]);

  // Combine all values and functions for the context
  const value = {
    user,
    dbUser,
    loading,
    ...authActions,
    ...getRoleFlags(user),
    checkPermission: (role: Role) => checkPermission(user, role)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Export all hooks for easy access
export * from './hooks'; 