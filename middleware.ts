import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow login page, static files and API routes
  if (
    pathname === '/login' ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.includes('favicon')
  ) {
    return NextResponse.next()
  }

  // Check for Supabase session cookie
  const hasSession = req.cookies.getAll().some(
    c => c.name.includes('auth-token') || c.name.includes('sb-') 
  )

  if (!hasSession) {
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = '/login'
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
