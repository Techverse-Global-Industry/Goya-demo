import type { Metadata } from 'next';
import { PersonalizationPage } from '@/components/reference-services';
import { Header } from '@/components/header';
import { Footer } from '@/components/editorial';
import { Overlays } from '@/components/overlays';
import { Toast } from '@/components/controls';
export const metadata: Metadata = { title: 'Personalization — Maison Goya' };
export default function Page() { return <><Header /><PersonalizationPage /><Footer /><Overlays /><Toast /></>; }
