import type { Metadata } from 'next';
import { CatalogPage } from '@/components/storefront-pages';
export const metadata: Metadata = { title: 'New arrivals — Maison Goya' };
export default function Page() { return <CatalogPage edit="new" />; }
