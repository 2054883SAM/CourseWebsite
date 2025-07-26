import { NextRequest, NextResponse } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'

// Extract project reference from Supabase URL for cookie naming
const getProjectRef = () => {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!SUPABASE_URL) return 'default'
  
  const matches = SUPABASE_URL.match(/https:\/\/([a-z0-9-]+)\.supabase\.co/)
  return matches ? matches[1] : 'default'
}

export async function middleware(request: NextRequest) {
  try {
    // Create a response object that we'll modify
    const res = NextResponse.next()
    
    // Get the project reference for cookie naming
    const projectRef = getProjectRef()
    
    // Log existing cookies for debugging
    console.log('Middleware: Cookie names available:', 
      Array.from(request.cookies.getAll().map(c => c.name)))
    
    // Create a Supabase client for the middleware
    // Note: storageKey must be set in cookie config for server components
    const supabase = createMiddlewareClient<Database>({ 
      req: request, 
      res
    })
    
    // Refresh the user's session if it exists
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session) {
      // Log the session information for debugging
      console.log(`Middleware: Active session for user ${session.user.id}`)
    } else {
      console.log('Middleware: No active session')
    }
    
    // Return the modified response with updated auth cookies
    return res
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.next()
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
}
