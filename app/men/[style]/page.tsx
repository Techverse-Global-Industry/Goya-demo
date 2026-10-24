import { notFound } from 'next/navigation';
import { CatalogPage } from '@/components/storefront-pages';

export function generateStaticParams() { return [{ style: 'loafers' }, { style: 'sneakers' }]; }

export default async function Page({ params }: { params: Promise<{ style: string }> }) {
  const { style } = await params;
  if (style !== 'loafers' && style !== 'sneakers') notFound();
  return <CatalogPage category="men" style={style} />;
}
