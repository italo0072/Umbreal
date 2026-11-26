import 'server-only'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { secureCookie, sessionClient } from './ssr'

// El Proxy persiste las renovaciones antes de renderizar Server Components.
export async function readClient() {
  const jar = await cookies()
  return sessionClient({ getAll: () => jar.getAll(), setAll: () => {} })
}

export async function writeClient() {
  const jar = await cookies()
  return sessionClient({
    getAll: () => jar.getAll(),
    setAll(changes) {
      for (const { name, value, options } of changes) jar.set(name, value, secureCookie(options))
    },
  })
}

export const currentUser = cache(async () => {
  const db = await readClient()
  const { data } = await db.auth.getUser()
  return data.user
})
