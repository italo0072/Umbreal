import { NextResponse, type NextRequest } from 'next/server'
import { secureCookie, sessionClient } from '@/lib/supabase/ssr'
import { supabaseConfig } from '@/lib/supabase/config'
import { siteOrigin } from '@/lib/site'
import type { SetAllCookies } from '@supabase/ssr'

const guestPages = ['/login', '/registro']
export async function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const dev = process.env.NODE_ENV === 'development'
  const api = new URL(supabaseConfig().url).origin
  const policy = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline'", "img-src 'self' data:", "font-src 'self'",
    `connect-src 'self' ${api}${dev ? ' ws: wss:' : ''}`,
    "frame-ancestors 'none'", "base-uri 'none'", "object-src 'none'", "form-action 'self'",
  ].join('; ')
  const pending: Parameters<SetAllCookies>[0] = []
  const cacheHeaders = new Headers({ 'Cache-Control': 'private, no-store' })
  const db = sessionClient({
    getAll: () => request.cookies.getAll(),
    setAll(changes, headers) {
      for (const cookie of changes) {
        request.cookies.set(cookie.name, cookie.value)
        pending.push(cookie)
      }
      for (const [key, value] of Object.entries(headers)) cacheHeaders.set(key, value)
    },
  })
  const { data: { user } } = await db.auth.getUser()
  const path = request.nextUrl.pathname
  const isPrivate = path === '/dashboard' || path.startsWith('/dashboard/')
  const navigation = ['GET', 'HEAD'].includes(request.method)
  let destination: string | undefined
  if (navigation && isPrivate && !user) destination = '/login'
  if (navigation && guestPages.includes(path) && user) destination = '/dashboard'

  const headers = new Headers(request.headers)
  headers.set('Content-Security-Policy', policy)
  const response = destination
    ? NextResponse.redirect(new URL(destination, siteOrigin()))
    : NextResponse.next({ request: { headers } })
  for (const { name, value, options } of pending) response.cookies.set(name, value, secureCookie(options))
  cacheHeaders.forEach((value, key) => response.headers.set(key, value))
  response.headers.set('Content-Security-Policy', policy)
  return response
}
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.svg|robots.txt|sitemap.xml).*)'],
}
