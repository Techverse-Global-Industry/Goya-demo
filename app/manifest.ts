import type { MetadataRoute } from 'next';
import { GOYA_BRAND_VERSION } from '@/lib/goya-brand';
export default function manifest(): MetadataRoute.Manifest {
  return { id: '/', name: 'Maison Goya', short_name: 'Goya', description: 'Your Maison Goya demo boutique. European precision. African soul.', start_url: '/collections', scope: '/', display: 'standalone', background_color: '#ffffff', theme_color: '#ffffff', lang: 'en', categories: ['shopping', 'lifestyle'], icons: [{ src: `/icons/icon-192.png?v=${GOYA_BRAND_VERSION}`, sizes: '192x192', type: 'image/png', purpose: 'any' }, { src: `/icons/icon-512.png?v=${GOYA_BRAND_VERSION}`, sizes: '512x512', type: 'image/png', purpose: 'any' }, { src: `/icons/maskable-512.png?v=${GOYA_BRAND_VERSION}`, sizes: '512x512', type: 'image/png', purpose: 'maskable' }], shortcuts: [{ name: 'The collection', url: '/collections' }, { name: 'Your orders', url: '/app/orders' }] };
}
