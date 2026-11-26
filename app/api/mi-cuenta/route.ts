import { NextResponse } from 'next/server'
import { writeClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export async function GET() {
  const db = await writeClient()
  const { data: { user } } = await db.auth.getUser()
  const headers = { 'Cache-Control': 'private, no-store' }
  if (!user) return NextResponse.json({ error: 'Se requiere iniciar sesión.' }, { status: 401, headers })
  return NextResponse.json({ id: user.id, email: user.email, verified: Boolean(user.email_confirmed_at) }, { headers })
}
