<<<<<<< HEAD
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
=======
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define route patterns and their required roles
const protectedRoutes = [
  { pattern: '/dashboard', role: 'student' },
  { pattern: '/profile', role: 'student' },
  // Supprimé /video-player pour permettre l'accès public
  { pattern: '/admin', role: 'admin' },
  { pattern: '/creator', role: 'creator' },
  { pattern: '/courses/create', role: 'creator' },
  { pattern: '/courses/edit', role: 'creator' },
];

// Helper function to check role hierarchy
const checkRoleAccess = (userRole: string | undefined, requiredRole: string): boolean => {
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
>>>>>>> 37f7e1a1c2f9bc553f93145408e4c5d644d96795

export async function middleware(request: NextRequest) {
  try {
    // Create an unmodified response
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

<<<<<<< HEAD
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) {
            return request.cookies.get(name)?.value
          },
          set(name, value, options) {
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name, options) {
            response.cookies.set({
              name,
              value: '',
              ...options,
              maxAge: 0,
            })
          },
        },
      }
    )

    // This will refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/server-side/nextjs
    await supabase.auth.getUser()

    return response
  } catch (e) {
    console.error('Supabase middleware error:', e)
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
=======
    // If it's not a protected route, allow access
    if (!matchedRoute) {
      return res;
    }

    // For protected routes, validate authentication
    try {
      // Get session using middleware client
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        // Authentication failed, redirect to signin
        const redirectUrl = path + req.nextUrl.search;
        const signInUrl = new URL('/signin', req.url);
        signInUrl.searchParams.set('redirectTo', redirectUrl);
        return NextResponse.redirect(signInUrl.toString());
      }

      // Get user role from database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (userError || !userData) {
        // User not found in database, redirect to signin
        const redirectUrl = path + req.nextUrl.search;
        const signInUrl = new URL('/signin', req.url);
        signInUrl.searchParams.set('redirectTo', redirectUrl);
        return NextResponse.redirect(signInUrl.toString());
      }

      // Check if user has required role
      if (checkRoleAccess(userData.role, matchedRoute.role)) {
        return res;
      }

      // User is authenticated but lacks required role
      const unauthorizedUrl = new URL('/unauthorized', req.url);
      unauthorizedUrl.searchParams.set('requiredRole', matchedRoute.role);
      return NextResponse.redirect(unauthorizedUrl.toString());

    } catch (error) {
      console.error('Middleware authentication error:', error);
      // Authentication failed, redirect to signin
      const redirectUrl = path + req.nextUrl.search;
      const signInUrl = new URL('/signin', req.url);
      signInUrl.searchParams.set('redirectTo', redirectUrl);
      return NextResponse.redirect(signInUrl.toString());
    }

  } catch (error) {
    console.error('Middleware error:', error);
    // On error, redirect to sign in as a fallback
    const signInUrl = new URL('/signin', req.url);
    signInUrl.searchParams.set('redirectTo', path);
    return NextResponse.redirect(signInUrl.toString());
>>>>>>> 37f7e1a1c2f9bc553f93145408e4c5d644d96795
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
