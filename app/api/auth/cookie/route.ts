import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';

export async function POST(req: NextRequest) {
  const res = new NextResponse();

  // Create Supabase server client
  const supabase = createServerClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value,
        set: (name, value, options) => {
          res.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove: (name, options) => {
          res.cookies.delete({
            name,
            ...options,
          });
        },
      },
    }
  );

  // Parse tokens from request body
  const { access_token, refresh_token } = await req.json();

  // Set session server-side (this sets the cookie)
  const { error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  // Return success and forward response with updated cookies
  return res;
}
