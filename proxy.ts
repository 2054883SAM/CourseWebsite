import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/types/supabase';
import { createServerClient } from '@supabase/ssr';

// Next.js 16: Renamed from "middleware" to "proxy"
export async function proxy(request: NextRequest) {
  try {
    // Create a response and supabase client
    const response = NextResponse.next({ request });

    // Create supabase server client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              // Keep the request cookies in sync for the remainder of this proxy execution
              // (recommended by @supabase/ssr docs).
              try {
                request.cookies.set(name, value);
              } catch {
                // ignore: request cookies might be read-only in some contexts
              }
              response.cookies.set({ name, value, ...options });
            });
          },
        },
      }
    );

    // IMPORTANT: Use getSession() in proxy, not getUser()
    // getSession() reads from cookies without making API calls
    // This refreshes the session and updates cookies automatically
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Optional: Add logging for debugging
    if (process.env.NODE_ENV !== 'production' && session) {
      console.log('[Proxy] Session active for:', session.user.email);
    }

    // Return the modified response with updated cookies
    return response;
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (e.g. images, fonts, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
