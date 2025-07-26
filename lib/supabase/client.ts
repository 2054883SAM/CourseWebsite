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
    return fetch
  }

  const orig = fetch.bind(window)
  return (input, init) => {
    // 1) If the tab is visible, skip any timeout entirely
    if (!document.hidden) {
      return orig(input, init)
    }

    // 2) Only when hidden do we enforce a timeout
    return Promise.race([
      orig(input, init),
      new Promise<Response>((_, rej) =>
        setTimeout(() => rej(new Error('Request timed out')), backgroundTimeout)
      ),
    ]) as Promise<Response>
  }
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

// Create different client configs for server and browser environments
const clientOptions = {
  auth: {
    autoRefreshToken: !isServer, // Only refresh token on client-side
    persistSession: !isServer,   // Only persist session on client-side
    detectSessionInUrl: false,
    storageKey: `sb-${projectRef}-auth-token` // Use the correct cookie name format
  },
  // Only add fetch timeout in browser context
  global: isServer ? undefined : {
    fetch: createFetchWithTimeout(),
  },
};

// Create Supabase client with auth configuration
export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  clientOptions
);

// Only run client-side initialization code in browser context
if (!isServer) {
  // 1) Restore in-memory session from localStorage on load
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) {
      supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });
    }
  });

  // 2) Tell your app when things change (SIGN_IN, TOKEN_REFRESHED, SIGN_OUT)
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Supabase auth event:', event);
    // You can dispatch to your React context or state management here
  });

  // 3) Refresh session when tab gains focus
  window.addEventListener('focus', () => {
    supabase.auth.refreshSession().catch(err => {
      console.error('Error refreshing Supabase session on focus:', err);
    });
  });
}

/**
 * Simple wrapper to get the current session. Use this before data fetches if needed.
 * Let the data fetch layer handle any auth errors or retries.
 */
export async function ensureValidSession(): Promise<any> {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}
