'use server'

import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import type { AuthError } from '@supabase/supabase-js'
import { writeClient } from '@/lib/supabase/server'
import { recoveryClient } from '@/lib/supabase/recovery'
import { siteOrigin } from '@/lib/site'
import { secureCookie } from '@/lib/supabase/ssr'
import { validCode, validEmail, validName, validPassword, sameOrigin } from '@/lib/validation'
import type { Feedback } from '@/lib/forms'

const forbidden = { error: 'La solicitud no corresponde a este sitio. Volvé a abrir la página.' }
const emailError = { error: 'Ingresá un correo válido.' }
const passwordError = { error: 'La contraseña debe tener entre 12 y 128 caracteres.' }
const codeError = { error: 'Revisá el código y el correo. Si el código venció, solicitá uno nuevo.' }

function field(data: FormData, key: string) {
  const value = data.get(key)
  return typeof value === 'string' ? value : ''
}
function emailOf(data: FormData) { return field(data, 'email').trim().toLowerCase() }
async function trusted() { return sameOrigin((await headers()).get('origin'), siteOrigin()) }
function failure(error: AuthError, fallback: string): Feedback {
  if (error.status === 429) return { error: 'Demasiados intentos. Esperá unos minutos antes de volver a intentar.' }
  if (error.status === 0 || (error.status && error.status >= 500)) return { error: 'El servicio no está disponible. Volvé a intentar en unos minutos.' }
  return { error: fallback }
}
async function rememberEmail(email: string) {
  const jar = await cookies()
  jar.set('umbral-email', email, secureCookie({ maxAge: 600 }))
}
async function forgetEmail() {
  const jar = await cookies()
  jar.set('umbral-email', '', secureCookie({ maxAge: 0 }))
}
function newPassword(data: FormData) {
  const password = field(data, 'password')
  if (!validPassword(password)) return passwordError
  if (password !== field(data, 'confirm')) return { error: 'Las contraseñas deben coincidir.' }
  return null
}

export async function login(_: Feedback, data: FormData): Promise<Feedback> {
  if (!await trusted()) return forbidden
  const email = emailOf(data)
  const password = field(data, 'password')
  if (!validEmail(email) || !password || password.length > 1024) return { error: 'Revisá el correo y la contraseña.' }
  const db = await writeClient()
  const { error } = await db.auth.signInWithPassword({ email, password })
  if (error) return failure(error, 'Revisá tus credenciales y confirmá tu correo antes de entrar.')
  await forgetEmail()
  redirect('/dashboard')
}

export async function signup(_: Feedback, data: FormData): Promise<Feedback> {
  if (!await trusted()) return forbidden
  const email = emailOf(data)
  const name = field(data, 'name').trim()
  if (!validName(name)) return { error: 'Escribí un nombre de entre 2 y 60 caracteres.' }
  if (!validEmail(email)) return emailError
  const invalid = newPassword(data)
  if (invalid) return invalid
  const db = await writeClient()
  const { data: result, error } = await db.auth.signUp({
    email, password: field(data, 'password'), options: { data: { display_name: name } },
  })
  if (error && error.code !== 'user_already_exists') return failure(error, 'No se pudo crear la cuenta. Revisá los datos y los requisitos de contraseña.')
  if (result.session) redirect('/dashboard')
  await rememberEmail(email)
  redirect('/verificar')
}

export async function verify(_: Feedback, data: FormData): Promise<Feedback> {
  if (!await trusted()) return forbidden
  const email = emailOf(data)
  const token = field(data, 'code').trim()
  if (!validEmail(email) || !validCode(token)) return codeError
  const db = await writeClient()
  const { error } = await db.auth.verifyOtp({ type: 'signup', email, token })
  if (error) return failure(error, codeError.error)
  await forgetEmail()
  redirect('/dashboard')
}

export async function resendSignup(_: Feedback, data: FormData): Promise<Feedback> {
  if (!await trusted()) return forbidden
  const email = emailOf(data)
  if (!validEmail(email)) return emailError
  const db = await writeClient()
  const { error } = await db.auth.resend({ type: 'signup', email })
  if (error && (error.status === 429 || !error.status || error.status >= 500)) return failure(error, 'No se pudo reenviar el código.')
  return { notice: 'Si tu cuenta está pendiente de verificación, recibirás otro código.' }
}

export async function requestRecovery(_: Feedback, data: FormData): Promise<Feedback> {
  if (!await trusted()) return forbidden
  const email = emailOf(data)
  if (!validEmail(email)) return emailError
  const { error } = await recoveryClient().auth.resetPasswordForEmail(email)
  if (error && (error.status === 429 || !error.status || error.status >= 500)) return failure(error, 'No se pudo enviar el correo. Intentá de nuevo.')
  await rememberEmail(email)
  redirect('/restablecer')
}

export async function resetPassword(_: Feedback, data: FormData): Promise<Feedback> {
  if (!await trusted()) return forbidden
  const email = emailOf(data)
  const token = field(data, 'code').trim()
  if (!validEmail(email) || !validCode(token)) return codeError
  const invalid = newPassword(data)
  if (invalid) return invalid
  const db = recoveryClient()
  const check = await db.auth.verifyOtp({ type: 'recovery', email, token })
  if (check.error || !check.data.session) return check.error ? failure(check.error, codeError.error) : codeError
  const { error } = await db.auth.updateUser({ password: field(data, 'password') })
  await db.auth.signOut({ scope: 'local' })
  if (error) return failure(error, 'No se pudo guardar esa contraseña. Solicitá otro código y elegí una contraseña diferente.')
  await forgetEmail()
  redirect('/login?clave=actualizada')
}

export async function logout(): Promise<Feedback> {
  if (!await trusted()) return forbidden
  const db = await writeClient()
  const { error } = await db.auth.signOut({ scope: 'local' })
  if (error) return failure(error, 'No se pudo cerrar tu sesión. Volvé a intentar.')
  await forgetEmail()
  redirect('/login')
}
