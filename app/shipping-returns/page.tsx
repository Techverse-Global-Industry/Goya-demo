import type { Metadata } from 'next';
import { ShippingReturnsPage } from '@/components/reference-services';
import { Header } from '@/components/header';
import { Footer } from '@/components/editorial';
import { Overlays } from '@/components/overlays';
import { Toast } from '@/components/controls';
export const metadata: Metadata = { title: 'Shipping and returns — Maison Goya' };
export default function Page() { return <><Header /><ShippingReturnsPage /><Footer /><Overlays /><Toast /></>; }
