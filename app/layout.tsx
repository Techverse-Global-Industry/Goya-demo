import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { ShopProvider } from '@/context/shop-context';
import { PwaProvider, ConnectionNotice } from '@/components/pwa';
import './globals.css';
import './commerce.css';
import './account.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap', style: ['normal', 'italic'] });

export const metadata: Metadata = {
  title: 'Maison Goya — L’Héritage Croisé',
  description: 'European precision. African soul. Discover the Maison Goya collection and Atelier Cotonou in a bilingual demonstration experience.',
  applicationName: 'Maison Goya',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Maison Goya' },
  icons: { apple: '/icons/apple-touch-icon.png' },
  // This is a demonstration storefront, not an authorized live commercial site.
  robots: { index: false, follow: false },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#0A0A0B', colorScheme: 'dark' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
    <body suppressHydrationWarning className="bg-obsidian text-ivory antialiased">
      <ShopProvider><PwaProvider>{children}<ConnectionNotice /></PwaProvider></ShopProvider>
    </body>
  </html>;
}
