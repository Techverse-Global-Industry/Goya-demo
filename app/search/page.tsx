import type { Metadata } from 'next';
import { CatalogPage } from '@/components/storefront-pages';
export const metadata: Metadata = { title: 'Search — Maison Goya' };

export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const { q } = await searchParams;
  return <CatalogPage edit="search" initialQuery={typeof q === 'string' ? q.slice(0, 200) : undefined} />;
}
