import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of paths that require authentication
const PROTECTED_PATHS = ['/courses', '/video-player'];

// List of paths that are only accessible to non-authenticated users
const AUTH_PATHS = ['/signin', '/signup', '/reset-password'];

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const path = request.nextUrl.pathname;

  // Check if the path is protected and user is not authenticated
  if (PROTECTED_PATHS.some((protectedPath) => path.startsWith(protectedPath)) && !session) {
    const redirectUrl = new URL('/signin', request.url);
    redirectUrl.searchParams.set('redirect', path);
    return NextResponse.redirect(redirectUrl);
  }

  // Check if the path is for non-authenticated users and user is authenticated
  if (AUTH_PATHS.includes(path) && session) {
    return NextResponse.redirect(new URL('/', request.url));
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
