import type { Metadata } from 'next';
import { BrandLanding } from '@/components/brand-pages';
export const metadata: Metadata = { title: 'Men’s shoes — Maison Goya' };
export default function Page() { return <BrandLanding audience="men" />; }
