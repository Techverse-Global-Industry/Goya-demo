import type { Metadata } from 'next';
import { PersonalizationHub } from '@/components/personalization-experience';
import { Header } from '@/components/header';
import { Footer } from '@/components/editorial';
import { Overlays } from '@/components/overlays';
import { Toast } from '@/components/controls';
export const metadata: Metadata = { title: 'Personalization — Maison Goya' };
export default function Page() { return <><Header /><PersonalizationHub /><Footer /><Overlays /><Toast /></>; }
