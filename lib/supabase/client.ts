import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Constants for timeout durations
const BACKGROUND_TAB_TIMEOUT = 30000; // 30 seconds for background tab

function createFetchWithTimeout(
  // we only need a background timeout now
  backgroundTimeout = BACKGROUND_TAB_TIMEOUT
): typeof fetch {
  // on server or build, just return the normal fetch
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return fetch;
  }

  const orig = fetch.bind(window);
  return (input, init) => {
    // 1) If the tab is visible, skip any timeout entirely
    if (!document.hidden) {
      return orig(input, init);
    }

    // 2) Only when hidden do we enforce a timeout
    return Promise.race([
      orig(input, init),
      new Promise<Response>((_, rej) =>
        setTimeout(() => rej(new Error('Request timed out')), backgroundTimeout)
      ),
    ]) as Promise<Response>;
  };
}

// Validate required environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL) throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
if (!SUPABASE_ANON_KEY) throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');

// Determine if we're running on the server or client
const isServer = typeof window === 'undefined';

// Extract project reference from URL for proper cookie naming
const getProjectRef = () => {
  if (!SUPABASE_URL) return 'default';
  // Extract the project reference from the URL
  const matches = SUPABASE_URL.match(/https:\/\/([a-z0-9-]+)\.supabase\.co/);
  return matches ? matches[1] : 'default';
};

const projectRef = getProjectRef();
console.log('Supabase project ref for cookies:', projectRef);

// Create client config
const clientOptions = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: `sb-${projectRef}-auth-token`,
    cookieOptions: {
      name: `sb-${projectRef}-auth-token`,
      // Remove domain restriction which might be preventing cookie creation
      // domain: 'localhost',
      path: '/',
      sameSite: 'Lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
  },
};

console.log('Supabase client initialized with cookie config:', {
  cookieName: clientOptions.auth.cookieOptions.name,
  cookiePath: clientOptions.auth.cookieOptions.path,
  detectSessionInUrl: clientOptions.auth.detectSessionInUrl,
  persistSession: clientOptions.auth.persistSession,
});

// Create Supabase client with auth configuration
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, clientOptions);

// Only run client-side initialization code in browser context
if (!isServer) {
  // Do NOT call getUser() eagerly at startup – it throws AuthSessionMissingError when no session exists.
  // Instead, set up listeners and optionally warm up with getSession (which safely returns null when absent).

  // Auth state change events (SIGNED_IN, TOKEN_REFRESHED, SIGNED_OUT, etc.)
  supabase.auth.onAuthStateChange((event, _session) => {
    console.log('Supabase auth event:', event);
  });

  // Warm up session fetch safely (no error thrown if missing)
  supabase.auth.getSession().catch(() => {
    // ignore: no active session on initial load
  });

  // Refresh session when tab gains focus
  window.addEventListener('focus', () => {
    supabase.auth.refreshSession().catch((err) => {
      console.error('Error refreshing Supabase session on focus:', err);
    });
  });
}

/**
 * Simple wrapper to get the current session. Use this before data fetches if needed.
 * Let the data fetch layer handle any auth errors or retries.
 */
export async function ensureValidSession(): Promise<any> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? { user } : null;
}
