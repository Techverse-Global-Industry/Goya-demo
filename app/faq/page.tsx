import type { Metadata } from 'next';
import { FaqPage } from '@/components/reference-services';
import { Header } from '@/components/header';
import { Footer } from '@/components/editorial';
import { Overlays } from '@/components/overlays';
import { Toast } from '@/components/controls';
export const metadata: Metadata = { title: 'Frequently asked questions — Maison Goya' };
export default function Page() { return <><Header /><FaqPage /><Footer /><Overlays /><Toast /></>; }
