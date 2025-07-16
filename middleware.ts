import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Role } from '@/lib/auth/types';
import { validateApiAuth } from '@/lib/auth/api-middleware';

// Define route patterns and their required roles
const protectedRoutes = [
  { pattern: '/dashboard', role: 'student' as Role },
  { pattern: '/profile', role: 'student' as Role },
  { pattern: '/video-player', role: 'student' as Role },
  { pattern: '/admin', role: 'admin' as Role },
  { pattern: '/creator', role: 'creator' as Role },
  { pattern: '/courses/create', role: 'creator' as Role },
  { pattern: '/courses/edit', role: 'creator' as Role },
];

// Helper function to check role hierarchy
const checkRoleAccess = (userRole: Role | undefined, requiredRole: Role): boolean => {
  if (!userRole) return false;
  
  switch (requiredRole) {
    case 'admin':
      return userRole === 'admin';
    case 'creator':
      return userRole === 'admin' || userRole === 'creator';
    case 'student':
      return true; // All authenticated users can access student content
    default:
      return false;
  }
};

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const path = req.nextUrl.pathname;

  try {
    // Find matching protected route pattern
    const matchedRoute = protectedRoutes.find(route => 
      path.startsWith(route.pattern)
    );

    // If it's not a protected route, allow access
    if (!matchedRoute) {
      return res;
    }

    // For protected routes, validate authentication
    try {
      const authResult = await validateApiAuth(req);
      if (authResult && checkRoleAccess(authResult.role as Role, matchedRoute.role)) {
        return res;
      }
    } catch (error) {
      // Authentication failed, redirect to signin
      const redirectUrl = path + req.nextUrl.search;
      const signInUrl = new URL('/signin', req.url);
      signInUrl.searchParams.set('redirectTo', redirectUrl);
      return NextResponse.redirect(signInUrl.toString());
    }

    // If we get here, user is authenticated but lacks required role
    const unauthorizedUrl = new URL('/unauthorized', req.url);
    unauthorizedUrl.searchParams.set('requiredRole', matchedRoute.role);
    return NextResponse.redirect(unauthorizedUrl.toString());

  } catch (error) {
    console.error('Middleware error:', error);
    // On error, redirect to sign in as a fallback
    const signInUrl = new URL('/signin', req.url);
    signInUrl.searchParams.set('redirectTo', path);
    return NextResponse.redirect(signInUrl.toString());
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/|api/).*)',
  ],
};
