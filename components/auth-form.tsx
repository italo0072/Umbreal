'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Eye, EyeOff, LoaderCircle } from 'lucide-react'
import { login, signup, verify, requestRecovery, resetPassword, resendSignup } from '@/app/actions'
import type { Mode } from '@/lib/forms'

const actions = { login, registro: signup, verificar: verify, recuperar: requestRecovery, restablecer: resetPassword }
const labels = { login: 'Iniciar sesión', registro: 'Crear cuenta', verificar: 'Verificar correo', recuperar: 'Enviar código', restablecer: 'Guardar contraseña' }

function PasswordField({ confirm = false, existing = false }: { confirm?: boolean; existing?: boolean }) {
  const [visible, setVisible] = useState(false)
  const id = confirm ? 'confirm' : 'password'
  const label = confirm ? 'Confirmar contraseña' : existing ? 'Contraseña' : 'Nueva contraseña'
  return <div className="field">
    <div className="field-head"><label htmlFor={id}>{label}</label>{existing && <Link href="/recuperar">¿La olvidaste?</Link>}</div>
    <div className="password"><input id={id} name={id} type={visible ? 'text' : 'password'} required
      minLength={existing ? 1 : 12} maxLength={existing ? 1024 : 128}
      autoComplete={existing ? 'current-password' : 'new-password'} placeholder={existing ? 'Tu contraseña' : 'Al menos 12 caracteres'} />
      <button type="button" aria-pressed={visible} aria-label={`${visible ? 'Ocultar' : 'Mostrar'} ${label.toLowerCase()}`} onClick={() => setVisible(!visible)}>
        {visible ? <EyeOff size={18}/> : <Eye size={18}/>}
      </button>
    </div>
  </div>
}

export function AuthForm({ mode, email = '' }: { mode: Mode; email?: string }) {
  const [state, action, pending] = useActionState(actions[mode], {})
  const [resendState, resendAction, sending] = useActionState(resendSignup, {})
  const [localError, setLocalError] = useState('')
  const creating = mode === 'registro' || mode === 'restablecer'
  return <form action={action} className="auth-form" onSubmit={event => {
    setLocalError('')
    if (!creating) return
    const form = new FormData(event.currentTarget)
    if (form.get('password') !== form.get('confirm')) {
      event.preventDefault()
      setLocalError('Las contraseñas deben coincidir.')
    }
  }}>
    {mode === 'registro' && <div className="field"><label htmlFor="name">Nombre</label><input id="name" name="name" placeholder="Tu nombre" autoComplete="name" minLength={2} maxLength={60} required /></div>}
    <div className="field"><label htmlFor="email">Correo electrónico</label><input id="email" name="email" type="email" placeholder="nombre@ejemplo.com" autoComplete="email" defaultValue={email} maxLength={254} required /></div>
    {(mode === 'verificar' || mode === 'restablecer') && <div className="field"><label htmlFor="code">Código del correo</label><input id="code" name="code" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6,10}" minLength={6} maxLength={10} required /></div>}
    {(mode === 'login' || creating) && <PasswordField existing={mode === 'login'} />}
    {creating && <PasswordField confirm />}
    {(localError || state.error) && <p className="alert" role="alert">{localError || state.error}</p>}
    <button className="primary" disabled={pending || sending}>{pending ? 'Procesando…' : labels[mode]}{pending ? <LoaderCircle className="spin" size={19}/> : <ArrowRight size={19}/>}</button>
    {mode === 'verificar' && <>
      <button className="resend" formAction={resendAction} formNoValidate disabled={pending || sending}>{sending ? 'Enviando…' : 'Reenviar código de registro'}</button>
      {resendState.error && <p className="alert" role="alert">{resendState.error}</p>}
      {resendState.notice && <p className="success" role="status">{resendState.notice}</p>}
    </>}
  </form>
}
