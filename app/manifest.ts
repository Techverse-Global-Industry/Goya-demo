import type { MetadataRoute } from 'next';
export default function manifest(): MetadataRoute.Manifest {
  return { id: '/', name: 'Maison Goya', short_name: 'Goya', description: 'Your Maison Goya demo boutique. European precision. African soul.', start_url: '/app/shop', scope: '/', display: 'standalone', background_color: '#0a0a0b', theme_color: '#0a0a0b', lang: 'en', categories: ['shopping', 'lifestyle'], icons: [{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' }, { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' }, { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }], shortcuts: [{ name: 'The collection', url: '/app/shop' }, { name: 'Your orders', url: '/app/orders' }] };
}
