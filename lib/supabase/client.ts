import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';

// Validate required environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL) throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
if (!SUPABASE_ANON_KEY) throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');

const isProd = process.env.NODE_ENV === 'production';

// Create Supabase browser client using @supabase/ssr
// This properly handles session persistence across tabs and cookies
export const supabase = createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);

// IMPORTANT: @supabase/ssr's createBrowserClient handles all session persistence automatically
// including: localStorage storage, auto-refresh tokens, cross-tab synchronization
// DO NOT add manual session management code here - it will interfere with the built-in handling

if (!isProd && typeof window !== 'undefined') {
  // Optional: Add logging for debugging (safe, non-interfering)
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('[Supabase Auth]', event, session ? `User: ${session.user.email}` : 'No session');
  });
}

/**
 * Simple wrapper to get the current session. Use this before data fetches if needed.
 * Let the data fetch layer handle any auth errors or retries.
 */
export async function ensureValidSession(): Promise<any> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user ? { user } : null;
  } catch {
    return null;
  }
}
