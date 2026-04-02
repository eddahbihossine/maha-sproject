import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export async function updateSession(request: NextRequest) {
  const protectedPaths = [
    '/owner',
    '/admin',
    '/messages',
    '/profile',
    '/settings',
    '/bookings',
    '/favorites',
  ]

  const pathname = request.nextUrl.pathname
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path))

  // Avoid Supabase network calls for public routes.
  // This prevents noisy startup logs in dev when Supabase isn't reachable.
  if (!isProtectedPath) {
    return NextResponse.next({ request })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If env vars are missing in the deployment, never hard-crash middleware.
  // Treat the user as unauthenticated for protected routes.
  if (!supabaseUrl || !supabaseAnonKey) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  let supabase:
    | ReturnType<typeof createServerClient>
    | null = null
  try {
    supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
      auth: {
        // Avoid refresh-token loops in Edge/middleware when Supabase is unreachable.
        // The client can still read the existing session; it just won't attempt to refresh.
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    })
  } catch {
    supabase = null
  }

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  let user: Awaited<ReturnType<typeof supabase.auth.getUser>>['data']['user'] = null
  try {
    if (!supabase) {
      throw new Error('Supabase client not available')
    }

    const {
      data: { user: loadedUser },
    } = await supabase.auth.getUser()
    user = loadedUser
  } catch {
    // If Supabase is unreachable in dev, treat as unauthenticated.
    user = null
  }

  // Redirect to login if accessing protected route without authentication
  if (isProtectedPath && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }

  // Role-based access control
  if (user) {
    const userRole = user.user_metadata?.role || 'student'

    // Admin routes - only accessible by admins
    if (pathname.startsWith('/admin') && userRole !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }

    // Owner routes - only accessible by owners
    if (pathname.startsWith('/owner') && userRole !== 'owner') {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}
