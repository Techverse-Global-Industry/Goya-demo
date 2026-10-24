import type { Metadata } from 'next';
import { StoreFinderPage } from '@/components/store-experience';
import { Header } from '@/components/header';
import { Footer } from '@/components/editorial';
import { Overlays } from '@/components/overlays';
import { Toast } from '@/components/controls';
export const metadata: Metadata = { title: 'Store finder — Maison Goya' };
export default function Page() { return <><Header /><StoreFinderPage /><Footer /><Overlays /><Toast /></>; }
