import { notFound } from 'next/navigation';
import { CatalogPage } from '@/components/storefront-pages';

export function generateStaticParams() { return [{ style: 'heels' }, { style: 'boots' }, { style: 'sneakers' }]; }

export default async function Page({ params }: { params: Promise<{ style: string }> }) {
  const { style } = await params;
  if (style !== 'heels' && style !== 'boots' && style !== 'sneakers') notFound();
  return <CatalogPage category="women" style={style} />;
}
