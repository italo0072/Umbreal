import type { Metadata } from 'next'
import Link from 'next/link'
import { LockKeyhole } from 'lucide-react'
import '@fontsource-variable/dm-sans/wght.css'
import './globals.css'
import { currentUser } from '@/lib/supabase/server'
import { Logout } from '@/components/logout'
import { siteOrigin } from '@/lib/site'

export const dynamic = 'force-dynamic'
export async function generateMetadata(): Promise<Metadata> {
  return { metadataBase: new URL(siteOrigin()), title: { default: 'Umbral | Portal de identidad', template: '%s | Umbral' },
    description: 'Accedé a tu cuenta de Umbral, verificá tu correo y administrá tu acceso al portal.' }
}
export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await currentUser()
  return <html lang="es-SV"><body>
    <a className="skip" href="#principal">Saltar al contenido</a>
    <header className="top"><div className="bar">
      <Link href="/" className="brand" aria-label="Umbral, inicio"><span className="logo" aria-hidden="true"/><span>umbral<span className="dot">.</span></span></Link>
      <nav aria-label="Navegación principal">{user ? <><Link href="/dashboard">Mi perfil</Link><Logout/></> : <><Link href="/login">Iniciar sesión</Link><Link className="nav-action" href="/registro">Crear cuenta</Link></>}</nav>
    </div></header>
    {children}
    <footer><span>Umbral <b>/</b> Portal de identidad</span><span><LockKeyhole size={13}/> Acceso seguro</span></footer>
  </body></html>
}
