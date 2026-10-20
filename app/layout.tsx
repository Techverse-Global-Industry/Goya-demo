import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { ShopProvider } from '@/context/shop-context';
import { PwaProvider, ConnectionNotice } from '@/components/pwa';
import './globals.css';
import './commerce.css';
import './account.css';
import './maison-design.css';
import './fashion-design.css';
import './mobile-boutique.css';
import './brand-pages.css';

const inter = localFont({ src: '../public/fonts/inter-normal-100-900.woff2', variable: '--font-inter', display: 'swap', weight: '100 900', style: 'normal' });
const playfair = localFont({ src: [
  { path: '../public/fonts/cormorant-normal-300-700.woff2', weight: '300 700', style: 'normal' },
  { path: '../public/fonts/cormorant-italic-300-700.woff2', weight: '300 700', style: 'italic' },
], variable: '--font-playfair', display: 'swap', fallback: ['Georgia', 'serif'] });

export const metadata: Metadata = {
  title: 'Maison Goya — L’Héritage Croisé',
  description: 'European precision. African soul. Discover the Maison Goya collection and Atelier Cotonou in a bilingual demonstration experience.',
  applicationName: 'Maison Goya',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Maison Goya' },
  icons: { apple: '/icons/apple-touch-icon.png' },
  // This is a demonstration storefront, not an authorized live commercial site.
  robots: { index: false, follow: false },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#ffffff', colorScheme: 'light' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${inter.variable} ${playfair.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
    <body suppressHydrationWarning className="bg-obsidian text-ivory antialiased">
      <ShopProvider><PwaProvider>{children}<ConnectionNotice /></PwaProvider></ShopProvider>
    </body>
  </html>;
}
