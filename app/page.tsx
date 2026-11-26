import Link from 'next/link'
import { ArrowUpRight, Fingerprint } from 'lucide-react'
import { Poster } from '@/components/poster'
import { currentUser } from '@/lib/supabase/server'
export const metadata = { alternates: { canonical: '/' } }
export default async function Home() {
  const user = await currentUser()
  return <main id="principal" className="shell"><div className="spread"><Poster/>
    <section className="panel"><div className="form-content home">
      <span className="icon-box"><Fingerprint size={26}/></span>
      <h1>Portal de identidad</h1><p className="lead">Tu cuenta de Umbral en un solo lugar. Accedé a tu perfil, verificá tu correo o recuperá tu contraseña.</p>
      <Link className="primary" href={user ? '/dashboard' : '/login'}>{user ? 'Abrir mi perfil' : 'Iniciar sesión'}<ArrowUpRight size={20}/></Link>
      {!user && <div className="form-foot">¿Primera vez en Umbral? <Link href="/registro">Creá tu cuenta</Link></div>}
    </div></section></div></main>
}
