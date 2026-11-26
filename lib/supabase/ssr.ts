import 'server-only'
import { createServerClient, type CookieOptions, type CookieMethodsServer } from '@supabase/ssr'
import { supabaseConfig } from './config'
import type { Database } from './database'

export function secureCookie(options: CookieOptions) {
  return { ...options, httpOnly: true, secure: true, sameSite: 'lax' as const, path: '/' }
}

export function sessionClient(cookies: CookieMethodsServer) {
  const { url, key } = supabaseConfig()
  return createServerClient<Database>(url, key, {
    cookies,
    cookieOptions: secureCookie({}),
  })
}
