import type { Metadata } from 'next';
import { CollectionsPage } from '@/components/brand-pages';
export const metadata: Metadata = { title: 'The collections — Maison Goya' };
export default function Page() { return <CollectionsPage />; }
