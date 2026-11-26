import type { MetadataRoute } from 'next'
import { siteOrigin } from '@/lib/site'
export const dynamic = 'force-dynamic'
export default function sitemap(): MetadataRoute.Sitemap { return [{ url: siteOrigin() + '/' }] }
