import type { MetadataRoute } from 'next';
export default function manifest(): MetadataRoute.Manifest {
  return { id: '/', name: 'Maison Goya', short_name: 'Goya', description: 'Your Maison Goya demo boutique. European precision. African soul.', start_url: '/app/shop', scope: '/', display: 'standalone', background_color: '#f8f6f1', theme_color: '#f8f6f1', lang: 'en', categories: ['shopping', 'lifestyle'], icons: [{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' }, { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' }, { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }], shortcuts: [{ name: 'The collection', url: '/app/shop' }, { name: 'Your orders', url: '/app/orders' }] };
}
