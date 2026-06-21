import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const PUBLIC = ['/login', '/register', '/api/auth', '/api/register']
      const isPublic = PUBLIC.some((p) => nextUrl.pathname.startsWith(p))
      if (isPublic) return true
      return isLoggedIn
    },
    jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    session({ session, token }) {
      if (token && session.user) session.user.id = token.id as string
      return session
    },
  },
  providers: [],
} satisfies NextAuthConfig
