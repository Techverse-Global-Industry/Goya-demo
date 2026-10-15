import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { ShopProvider } from '@/context/shop-context';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap', style: ['normal', 'italic'] });

export const metadata: Metadata = {
  title: 'Maison Goya — L’Héritage Croisé',
  description: 'European precision. African soul. Discover the Maison Goya collection and Atelier Cotonou in a bilingual demonstration experience.',
  applicationName: 'Maison Goya',
  // This is a demonstration storefront, not an authorized live commercial site.
  robots: { index: false, follow: false },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#0A0A0B', colorScheme: 'dark' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning>
    <body className={`${inter.variable} ${playfair.variable} bg-obsidian text-ivory antialiased`}>
      <ShopProvider>{children}</ShopProvider>
    </body>
  </html>;
}
