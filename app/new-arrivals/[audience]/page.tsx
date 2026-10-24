import { notFound } from 'next/navigation';
import { CatalogPage } from '@/components/storefront-pages';

export function generateStaticParams() { return [{ audience: 'men' }, { audience: 'women' }, { audience: 'accessories' }]; }

export default async function Page({ params }: { params: Promise<{ audience: string }> }) {
  const { audience } = await params;
  if (audience !== 'men' && audience !== 'women' && audience !== 'accessories') notFound();
  return <CatalogPage category={audience} edit="new" />;
}
