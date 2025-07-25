import { createServerClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

export function createClient(cookieStore: ReadonlyRequestCookies) {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set() {
          throw new Error('Setting cookies not supported in this context');
        },
        remove() {
          throw new Error('Removing cookies not supported in this context');
        },
      },
    }
  );
}
