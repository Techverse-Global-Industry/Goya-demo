import type { Metadata } from 'next';
import { CustomerServicePage } from '@/components/reference-services';
import { Header } from '@/components/header';
import { Footer } from '@/components/editorial';
import { Overlays } from '@/components/overlays';
import { Toast } from '@/components/controls';
export const metadata: Metadata = { title: 'Customer care — Maison Goya' };
export default function Page() { return <><Header /><CustomerServicePage /><Footer /><Overlays /><Toast /></>; }
