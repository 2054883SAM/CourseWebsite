import { Role, UserWithRole } from './types';

/**
 * Checks if a user has the required role permission
 * Implements role hierarchy: admin > creator > student
 */
export const checkPermission = (user: UserWithRole | null, requiredRole: Role): boolean => {
  if (!user?.role) return false;
  
  switch (requiredRole) {
    case 'admin':
      return user.role === 'admin';
    case 'creator':
      // Admins can do everything creators can
      return user.role === 'admin' || user.role === 'creator';
    case 'student':
      // All authenticated users can access student content
      return true;
    default:
      return false;
  }
};

/**
 * Returns boolean flags for each role based on the user's current role
 * Used to simplify role checks in components
 */
export const getRoleFlags = (user: UserWithRole | null) => ({
  isAdmin: user?.role === 'admin',
  isCreator: user?.role === 'admin' || user?.role === 'creator',
  isStudent: !!user?.role,
});

/**
 * Standardizes error handling for auth operations
 * Converts various error types to user-friendly messages
 */
export const handleAuthError = (err: unknown, defaultMessage: string): Error => {
  console.error(`Auth error: ${defaultMessage}`, err);
  
  if (err instanceof Error) {
    // Handle specific Supabase error messages
    if (err.message.includes('violates foreign key constraint')) {
      return new Error('An account with this email already exists. Please sign in instead.');
    }
    return err;
  }
  
  return new Error(defaultMessage);
}; 