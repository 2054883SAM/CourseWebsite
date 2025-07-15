import { User } from '@supabase/supabase-js';
import { User as DbUser } from '../supabase/types';

/**
 * Available user roles in the system
 * - admin: Full system access
 * - creator: Can create and manage courses
 * - student: Can access and enroll in courses
 */
export type Role = 'admin' | 'creator' | 'student';

/**
 * Extends Supabase User type with our custom role
 */
export type UserWithRole = User & {
  role?: Role;
};

/**
 * Main authentication context type that defines
 * all available auth-related state and functions
 */
export type AuthContextType = {
  user: UserWithRole | null;
  dbUser: DbUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  isAdmin: boolean;
  isCreator: boolean;
  isStudent: boolean;
  checkPermission: (requiredRole: Role) => boolean;
}; 