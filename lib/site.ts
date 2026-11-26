import 'server-only'

export function siteOrigin() {
  const url = new URL(process.env.APP_URL ?? 'http://localhost:3000')
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
  if (!local && url.protocol !== 'https:') throw new Error('APP_URL requiere HTTPS fuera de localhost.')
  return url.origin
}
