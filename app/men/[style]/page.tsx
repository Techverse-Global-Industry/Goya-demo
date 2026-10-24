import { notFound } from 'next/navigation';
import { CatalogPage } from '@/components/storefront-pages';
import { MEN_SHOE_STYLES } from '@/lib/catalog-edits';
import type { ShoeType } from '@/lib/types';

export function generateStaticParams() { return [...MEN_SHOE_STYLES, 'shoes'].map(style => ({ style })); }

export default async function Page({ params }: { params: Promise<{ style: string }> }) {
  const { style } = await params;
  if (style === 'shoes') return <CatalogPage category="men" departmentView="shoes" />;
  if (!MEN_SHOE_STYLES.includes(style as Exclude<ShoeType, 'all'>)) notFound();
  return <CatalogPage category="men" style={style as ShoeType} />;
}
