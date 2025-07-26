import { createServerClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

// Extract project reference from Supabase URL for proper cookie naming
const getProjectRef = () => {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!SUPABASE_URL) return 'default';
  
  // Extract the project reference from the URL
  const matches = SUPABASE_URL.match(/https:\/\/([a-z0-9-]+)\.supabase\.co/);
  return matches ? matches[1] : 'default';
};

const projectRef = getProjectRef();

export function createClient(cookieStore: ReadonlyRequestCookies) {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          // Check for the cookie name in the correct format first
          const cookieName = name === 'sb-auth-token' ? 
            `sb-${projectRef}-auth-token` : name;
          
          return cookieStore.get(cookieName)?.value;
        },
        set() {
          throw new Error('Setting cookies not supported in this context');
        },
        remove() {
          throw new Error('Removing cookies not supported in this context');
        },
      },
      // Ensure correct cookie name format for authentication
      auth: {
        storageKey: `sb-${projectRef}-auth-token`
      }
    }
  );
}
