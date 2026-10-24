import type { Metadata } from 'next';
import { WishlistPage } from '@/components/storefront-pages';
export const metadata: Metadata = { title: 'Wishlist — Maison Goya' };
export default function Page() { return <WishlistPage />; }
