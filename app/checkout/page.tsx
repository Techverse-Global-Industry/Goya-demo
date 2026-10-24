import type { Metadata } from 'next';
import { CheckoutPage } from '@/components/storefront-pages';
export const metadata: Metadata = { title: 'Checkout — Maison Goya' };
export default function Page() { return <CheckoutPage />; }
