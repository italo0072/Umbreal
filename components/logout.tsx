'use client'
import { useActionState } from 'react'
import { LogOut } from 'lucide-react'
import { logout } from '@/app/actions'
export function Logout() {
  const [state, action, pending] = useActionState(logout, {})
  return <form className="logout" action={action}>
    <button disabled={pending}><LogOut size={16}/>{pending ? 'Saliendo…' : 'Cerrar sesión'}</button>
    {state.error && <p className="alert" role="alert">{state.error}</p>}
  </form>
}
