import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';

export async function GET(req: NextRequest) {
  // Create Supabase server client
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: () => {
          // no-op: GET route does not need to mutate cookies
        },
      },
    }
  );

  // Get current cookies for debugging
  const availableCookies = req.cookies.getAll().map((c) => c.name);

  // Get session and user details
  const { data: sessionData } = await supabase.auth.getSession();
  const { data: userData } = await supabase.auth.getUser();

  return NextResponse.json({
    authenticated: !!userData.user,
    session: sessionData.session
      ? {
          expires_at: sessionData.session.expires_at,
          user_id: sessionData.session.user.id,
          email: sessionData.session.user.email,
        }
      : null,
    user: userData.user
      ? {
          id: userData.user.id,
          email: userData.user.email,
        }
      : null,
    cookies: availableCookies,
  });
}
