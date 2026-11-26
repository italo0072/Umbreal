import Link from 'next/link'
import { cookies } from 'next/headers'
import { ArrowLeft, KeyRound, MailCheck, RotateCcw, UserRoundPlus } from 'lucide-react'
import { Poster } from './poster'
import { AuthForm } from './auth-form'
import type { Mode } from '@/lib/forms'

const pages = {
  login: { title: 'Iniciar sesión', lead: 'Ingresá tus credenciales para acceder a tu perfil.', Icon: KeyRound },
  registro: { title: 'Crear cuenta', lead: 'Registrate con tu correo para abrir tu espacio personal.', Icon: UserRoundPlus },
  verificar: { title: 'Verificá tu correo', lead: 'Si el registro procede, recibirás un código por correo. Ingresalo para activar tu cuenta.', Icon: MailCheck },
  recuperar: { title: 'Recuperá tu acceso', lead: 'Ingresá el correo de tu cuenta para solicitar un código de recuperación.', Icon: RotateCcw },
  restablecer: { title: 'Nueva contraseña', lead: 'Si el correo está registrado, recibirás un código. Usalo para elegir una nueva contraseña.', Icon: KeyRound },
}
export async function AuthPanel({ mode, updated = false }: { mode: Mode; updated?: boolean }) {
  const { title, lead, Icon } = pages[mode]
  const email = ['verificar', 'restablecer'].includes(mode) ? (await cookies()).get('umbral-email')?.value : undefined
  return <main id="principal" className="shell"><div className="spread"><Poster/><section className="panel">
    <div className="form-content"><span className="icon-box"><Icon size={24}/></span>
    <h1>{title}</h1><p className="lead">{lead}</p>
    {updated && <p className="success" role="status">Contraseña actualizada. Ya podés iniciar sesión.</p>}
    <AuthForm mode={mode} email={email}/>
    <div className="form-foot">{mode === 'login' ? <>¿Primera vez en Umbral? <Link href="/registro">Creá tu cuenta</Link></> :
      <Link href="/login"><ArrowLeft size={14}/> Volver al inicio de sesión</Link>}</div>
    {mode === 'login' && <Link className="subtle" href="/verificar">Ya tengo un código de registro</Link>}
    {mode === 'restablecer' && <Link className="subtle" href="/recuperar">Solicitar otro código</Link>}
    </div>
  </section></div></main>
}
