import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/video-player',
  // Add other protected routes here
];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Refresh session if it exists
  const { data: { session }, error } = await supabase.auth.getSession();

  // Check if trying to access protected route
  const isProtectedRoute = protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route));

  if (isProtectedRoute && !session) {
    // Store the URL they were trying to access
    const redirectUrl = req.nextUrl.pathname + req.nextUrl.search;
    const searchParams = new URLSearchParams();
    searchParams.set('redirectTo', redirectUrl);

    // Redirect to sign in page with return URL
    const signInUrl = new URL('/signin', req.url);
    signInUrl.search = searchParams.toString();
    return NextResponse.redirect(signInUrl);
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
