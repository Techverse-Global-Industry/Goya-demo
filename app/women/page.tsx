import type { Metadata } from 'next';
import { CatalogPage } from '@/components/storefront-pages';
export const metadata: Metadata = { title: 'Women’s shoes — Maison Goya' };
export default function Page() { return <CatalogPage category="women" />; }
