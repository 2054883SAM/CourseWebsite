import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Create Supabase client
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);

// Track the last visibility state
let wasHidden = false;

// Track if we're currently refreshing the session
let isRefreshingSession = false;

// Track the last session validation time
let lastValidationTime = 0;
const VALIDATION_INTERVAL = 30000; // 30 seconds

/**
 * Handle visibility change events globally
 */
if (typeof window !== 'undefined') {
  document.addEventListener('visibilitychange', async () => {
    const isHidden = document.hidden;
    
    // Only handle tab becoming visible after being hidden
    if (wasHidden && !isHidden) {
      await refreshSessionIfNeeded();
    }
    
    wasHidden = isHidden;
  });
}

/**
 * Refresh session if needed
 */
async function refreshSessionIfNeeded() {
  if (isRefreshingSession) return null;
  
  try {
    isRefreshingSession = true;
    
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;

    if (!session) return null;

    // Check if session is expired or close to expiring (within 5 minutes)
    const expiresAt = session?.expires_at ? new Date(session.expires_at * 1000) : null;
    const isExpiredOrClose = expiresAt ? expiresAt <= new Date(Date.now() + 5 * 60 * 1000) : false;

    if (isExpiredOrClose) {
      const { data: { session: newSession }, error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        // If refresh fails, sign out to clear invalid state
        await supabase.auth.signOut();
        return null;
      }
      return newSession;
    }

    return session;
  } catch (error) {
    console.error('Error refreshing session:', error);
    return null;
  } finally {
    isRefreshingSession = false;
  }
}

/**
 * Ensures the Supabase client has a valid session before making data fetches
 */
export async function ensureValidSession(retryCount = 0): Promise<any> {
  try {
    // Check if we've validated recently
    const now = Date.now();
    if (now - lastValidationTime < VALIDATION_INTERVAL) {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    }

    // If the tab was previously hidden, ensure session is refreshed
    if (wasHidden) {
      const refreshedSession = await refreshSessionIfNeeded();
      wasHidden = false; // Reset the flag
      lastValidationTime = now;
      return refreshedSession;
    }

    // Get current session
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;

    // No session is fine for public data
    if (!session) {
      lastValidationTime = now;
      return null;
    }

    // Check if session needs refresh
    const expiresAt = session?.expires_at ? new Date(session.expires_at * 1000) : null;
    const isExpiredOrClose = expiresAt ? expiresAt <= new Date(Date.now() + 5 * 60 * 1000) : false;

    if (isExpiredOrClose) {
      const refreshedSession = await refreshSessionIfNeeded();
      lastValidationTime = now;
      return refreshedSession;
    }

    lastValidationTime = now;
    return session;
  } catch (error) {
    console.error('Error ensuring valid session:', error);
    
    // Retry up to 3 times with exponential backoff
    if (retryCount < 3) {
      const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
      await new Promise(resolve => setTimeout(resolve, delay));
      return ensureValidSession(retryCount + 1);
    }
    
    return null;
  }
}
