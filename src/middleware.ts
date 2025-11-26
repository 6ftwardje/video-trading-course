import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return res
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          res.cookies.set(name, value, options)
        })
      },
    },
  })

  // Allow auth callback route to proceed without redirect
  // The callback page will handle session validation and student sync
  if (req.nextUrl.pathname === '/auth/callback') {
    // Refresh the session to handle code exchange from email confirmation
    await supabase.auth.getSession()
    return res
  }

  // Try getSession() first (reads from cookies, no server request)
  // Only use getUser() if we need to validate the token
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    const protectedRoutes = ['/dashboard', '/module', '/lesson', '/exam', '/praktijk', '/mentorship', '/course-material']
    if (protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route))) {
      const redirectUrl = new URL('/login', req.url)
      redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/module/:path*', '/lesson/:path*', '/exam/:path*', '/praktijk/:path*', '/mentorship/:path*', '/course-material/:path*', '/auth/callback'],
}

