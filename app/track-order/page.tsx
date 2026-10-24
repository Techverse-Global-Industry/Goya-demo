import type { Metadata } from 'next';
import { TrackOrderPage } from '@/components/storefront-pages';
export const metadata: Metadata = { title: 'Track your order — Maison Goya' };
export default function Page() { return <TrackOrderPage />; }
