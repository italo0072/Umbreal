import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { BadgeCheck, CircleUserRound } from 'lucide-react'
import { currentUser, readClient } from '@/lib/supabase/server'
import { Guides } from '@/components/guides'
export const metadata: Metadata = { title: 'Mi perfil', robots: { index: false, follow: false } }
export default async function Dashboard() {
  const user = await currentUser()
  if (!user) redirect('/login')
  const db = await readClient()
  const { data: profile, error } = await db.from('umbral_profiles').select('id, display_name, created_at').eq('id', user.id).maybeSingle()
  const date = new Intl.DateTimeFormat('es-SV', { dateStyle: 'long', timeZone: 'America/El_Salvador' }).format(new Date(user.created_at))
  return <main id="principal" className="shell dashboard"><div className="profile-head">
    <span className="icon-box"><CircleUserRound size={26}/></span>
    <h1>{profile ? `Hola, ${profile.display_name}.` : 'Mi perfil'}</h1><p>Estos son los datos de tu cuenta de Umbral.</p>
  </div><div className="profile-body">
    <h2>Información de cuenta</h2>
    {(error || !profile) && <p className="alert" role="alert">No se pudo cargar el perfil de la base de datos. Volvé a intentar más tarde.</p>}
    <dl>{profile && <><dt>Nombre</dt><dd>{profile.display_name}</dd></>}<dt>Correo electrónico</dt><dd>{user.email}</dd>
    <dt>Verificación</dt><dd><BadgeCheck size={17}/>{user.email_confirmed_at ? 'Correo confirmado' : 'Pendiente de confirmar'}</dd>
    <dt>Fecha de registro</dt><dd>{date}</dd><dt>ID de usuario</dt><dd className="mono">{user.id}</dd></dl>
    <Guides/>
  </div></main>
}
