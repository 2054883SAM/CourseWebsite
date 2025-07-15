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
  const refreshingRef = useRef(false);
  const mountedRef = useRef(true);
  const lastRefreshTime = useRef(0);
  const REFRESH_INTERVAL = 30000; // 30 seconds

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

      const currentUser = { ...session.user } as UserWithRole;
      if (mountedRef.current) {
        setUser(currentUser);
        await fetchUserRole(currentUser);
      }
    } catch (error) {
      console.error('Error handling auth state change:', error);
      if (mountedRef.current) {
        setUser(null);
        setDbUser(null);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [fetchUserRole]);

  /**
   * Refreshes the session and updates state
   * Also ensures Supabase client is ready for data fetching
   */
  const refreshSession = useCallback(async (force = false) => {
    const now = Date.now();
    if (!force && now - lastRefreshTime.current < REFRESH_INTERVAL) {
      return;
    }
    
    if (refreshingRef.current) return;
    
    try {
      refreshingRef.current = true;
      
      // Force a new session refresh
      const { data: { session }, error } = await supabaseClient.auth.getSession();
      
      if (error) {
        console.error('Error refreshing session:', error);
        if (mountedRef.current) {
          setUser(null);
          setDbUser(null);
        }
        return;
      }

      if (session?.user) {
        // Ensure the client has the latest session
        await supabaseClient.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token
        });
        
        await handleAuthStateChange(session);
        lastRefreshTime.current = now;
      } else {
        if (mountedRef.current) {
          setUser(null);
          setDbUser(null);
        }
      }
    } catch (error) {
      console.error('Error during session refresh:', error);
      if (mountedRef.current) {
        setUser(null);
        setDbUser(null);
      }
    } finally {
      refreshingRef.current = false;
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [supabaseClient, handleAuthStateChange]);

  // Handle visibility change with proper session refresh
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let wasHidden = document.hidden;

    const handleVisibilityChange = async () => {
      const isNowVisible = !document.hidden;
      
      // Only handle tab becoming visible after being hidden
      if (wasHidden && isNowVisible) {
        // Clear any pending refresh
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
        // Add a small delay before refreshing to prevent rapid refreshes
        timeoutId = setTimeout(async () => {
          if (mountedRef.current) {
            await refreshSession(true); // Force refresh when coming back to tab
          }
        }, 100);
      }
      
      wasHidden = document.hidden;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [refreshSession]);

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