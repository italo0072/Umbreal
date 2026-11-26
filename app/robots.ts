import type { MetadataRoute } from 'next'
import { siteOrigin } from '@/lib/site'
export const dynamic = 'force-dynamic'
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: '*', allow: '/', disallow: ['/dashboard','/api/','/login','/registro','/verificar','/recuperar','/restablecer'] }, sitemap: siteOrigin() + '/sitemap.xml' }
}
