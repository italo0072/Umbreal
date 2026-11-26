import { AuthPanel } from '@/components/auth-panel'
export const metadata = { title: 'Iniciar sesión', robots: { index: false, follow: false } }
export default async function Login({ searchParams }: { searchParams: Promise<{ clave?: string }> }) {
  const { clave } = await searchParams
  return <AuthPanel mode="login" updated={clave === 'actualizada'}/>
}
