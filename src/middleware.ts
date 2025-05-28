import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Only run auth middleware for admin routes
  if (!req.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  // Allow access to login page
  if (req.nextUrl.pathname === '/admin/login') {
    return NextResponse.next()
  }

  // For now, just redirect to login for all admin routes
  // Full auth implementation will be added later
  const redirectUrl = req.nextUrl.clone()
  redirectUrl.pathname = '/admin/login'
  return NextResponse.redirect(redirectUrl)
}

export const config = {
  matcher: ['/admin/:path*']
}