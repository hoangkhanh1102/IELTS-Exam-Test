import { auth } from '@/auth'
import { NextResponse } from 'next/server'

const PUBLIC = ['/login', '/register', '/api/auth', '/api/register']

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl
  const isPublic = PUBLIC.some((p) => pathname.startsWith(p))
  if (!req.auth && !isPublic) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|assets).*)'],
}
