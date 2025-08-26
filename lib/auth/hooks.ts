import { useContext } from 'react';
import { AuthContext } from './AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Generic hook for checking if a user has a specific role
 * Returns loading state for UI handling
 */
export const useIsRole = (role: Role) => {
  const { checkPermission, loading } = useAuth();
  return { hasRole: checkPermission(role), loading };
};

// Convenience hooks for common role checks
export const useIsAdmin = () => useIsRole('admin');
export const useIsCreator = () => useIsRole('teacher');
export const useIsStudent = () => useIsRole('student');

/**
 * Hook for protecting routes based on required role
 * Automatically redirects to home if user lacks permission
 */
export const useRequireRole = (role: Role) => {
  const { checkPermission, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !checkPermission(role)) {
      router.push('/');
    }
  }, [loading, checkPermission, role, router]);

  return { loading };
};

/**
 * Hook that provides all authentication-related actions
 * Handles signup, signin, signout, and password reset
 */
export const useAuthActions = (supabaseClient: SupabaseClient) => {
  const router = useRouter();

  /**
   * Handles user registration with email/password
   * Also creates the user profile with default student role
   */
  const signUp = async (email: string, password: string, name: string) => {
    try {
      // Check for existing user first
      const { data: existingUser } = await supabaseClient
        .from('users')
        .select('email')
        .eq('email', email)
        .single();

      if (existingUser) {
        return { error: new Error('An account with this email already exists. Please sign in instead.') };
      }

      // Create auth user
      const { data, error: signUpError } = await supabaseClient.auth.signUp({
        email,
        password,
        options: { data: { name } }
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        // Create user profile with student role
        const { error: profileError } = await supabaseClient
          .from('users')
          .insert({
            id: data.user.id,
            email,
            name,
            role: 'student'
          });

        if (profileError) throw profileError;

        console.log('User signed up successfully');
        return { error: null };
      }

      throw new Error('Signup failed. Please try again.');
    } catch (err) {
      return { error: handleAuthError(err, 'Failed to sign up') };
    }
  };

  /**
   * Handles user login with email/password
   */
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      return { error: null };
    } catch (err) {
      return { error: handleAuthError(err, 'Failed to sign in') };
    }
  };

  /**
   * Handles user logout and redirects to home
   */
  const signOut = async () => {
    try {
      await supabaseClient.auth.signOut();
      router.push('/');
    } catch (err) {
      console.error('Signout error:', err);
    }
  };

  /**
   * Initiates password reset process
   * Sends reset email with redirect URL
   */
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      if (error) throw error;
      return { error: null };
    } catch (err) {
      return { error: handleAuthError(err, 'Failed to send reset password email') };
    }
  };

  return { signUp, signIn, signOut, resetPassword };
}; 