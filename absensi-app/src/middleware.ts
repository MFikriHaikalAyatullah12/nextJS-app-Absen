import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  console.log('Middleware checking path:', pathname)

  // Halaman yang tidak memerlukan autentikasi
  const publicPaths = ['/', '/register', '/login']
  
  if (publicPaths.includes(pathname)) {
    console.log('Public path, allowing access')
    return NextResponse.next()
  }

  // Skip untuk static files dan API
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
    return NextResponse.next()
  }

  // Cek token untuk halaman yang memerlukan autentikasi
  const token = request.cookies.get('token')?.value
  console.log('Token from cookie:', token ? 'EXISTS' : 'NOT_FOUND')

  // Sementara bypass middleware untuk dashboard agar bisa test redirect
  if (pathname.startsWith('/dashboard')) {
    console.log('Dashboard access - bypassing middleware for testing')
    return NextResponse.next()
  }

  if (!token) {
    console.log('No token, redirecting to login')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Verifikasi token
  const payload = verifyToken(token)
  console.log('Token verification result:', payload ? 'VALID' : 'INVALID')
  
  if (!payload) {
    console.log('Invalid token, redirecting to login')
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('token')
    return response
  }

  console.log('Token valid, allowing access to:', pathname)
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
