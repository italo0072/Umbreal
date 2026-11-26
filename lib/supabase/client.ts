'use client'
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database'
import { supabaseConfig } from './config'

// Solo PostgREST público. accessToken deshabilita el subsistema Auth del SDK.
export function publicClient() {
  const { url, key } = supabaseConfig()
  return createClient<Database>(url, key, { accessToken: async () => null })
}
