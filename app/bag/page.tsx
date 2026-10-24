import type { Metadata } from 'next';
import { BagPage } from '@/components/storefront-pages';
export const metadata: Metadata = { title: 'Shopping bag — Maison Goya' };
export default function Page() { return <BagPage />; }
