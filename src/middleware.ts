import { NextResponse, type NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const protectedRoutes = ['/dashboard', '/module', '/lesson', '/exam', '/praktijk', '/mentorship']
    if (protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route))) {
      const redirectUrl = new URL('/login', req.url)
      redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/module/:path*', '/lesson/:path*', '/exam/:path*', '/praktijk/:path*', '/mentorship/:path*'],
}

