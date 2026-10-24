import type { Metadata } from 'next';
import { StoresPage } from '@/components/reference-services';
import { Header } from '@/components/header';
import { Footer } from '@/components/editorial';
import { Overlays } from '@/components/overlays';
import { Toast } from '@/components/controls';
export const metadata: Metadata = { title: 'Store finder — Maison Goya' };
export default function Page() { return <><Header /><StoresPage /><Footer /><Overlays /><Toast /></>; }
