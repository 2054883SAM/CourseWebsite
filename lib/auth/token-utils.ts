import { supabase } from '../supabase/client';

/**
 * Validates the current session token
 * Returns true if the session is valid and not expired
 */
export async function validateToken(): Promise<boolean> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      return false;
    }

    // Check if session is expired
    if (session.expires_at) {
      const expiresAt = typeof session.expires_at === 'number' 
        ? session.expires_at * 1000 // Convert seconds to milliseconds
        : new Date(session.expires_at).getTime();
      
      if (expiresAt < Date.now()) {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
}

/**
 * Attempts to refresh the current session token
 * Returns success status and any error that occurred
 */
export async function refreshToken(): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { data: { session }, error } = await supabase.auth.refreshSession();

    if (error) {
      return { success: false, error };
    }

    if (!session) {
      return { success: false, error: new Error('No session after refresh') };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Token refresh error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Failed to refresh token') 
    };
  }
} 