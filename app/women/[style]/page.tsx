import { notFound } from 'next/navigation';
import { CatalogPage } from '@/components/storefront-pages';
import { WOMEN_SHOE_STYLES } from '@/lib/catalog-edits';
import type { ShoeType } from '@/lib/types';

export function generateStaticParams() { return WOMEN_SHOE_STYLES.map(style => ({ style })); }

export default async function Page({ params }: { params: Promise<{ style: string }> }) {
  const { style } = await params;
  if (!WOMEN_SHOE_STYLES.includes(style as Exclude<ShoeType, 'all'>)) notFound();
  return <CatalogPage category="women" style={style as ShoeType} />;
}
