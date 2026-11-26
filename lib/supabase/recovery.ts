import 'server-only'
import { createClient } from '@supabase/supabase-js'
import { supabaseConfig } from './config'
import type { Database } from './database'

// Un cliente por intento. La sesión del código de recuperación vive solo en esta petición.
export function recoveryClient() {
  const { url, key } = supabaseConfig()
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
}
