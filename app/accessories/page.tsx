import type { Metadata } from 'next';
import { CatalogPage } from '@/components/storefront-pages';
export const metadata: Metadata = { title: 'Accessories — Maison Goya' };
export default async function Page({ searchParams }: { searchParams: Promise<{ audience?: string }> }) {
  const { audience } = await searchParams;
  return <CatalogPage category="accessories" accessoryAudience={audience === 'men' || audience === 'women' ? audience : undefined} />;
}
