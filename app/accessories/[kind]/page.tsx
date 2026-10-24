import { notFound, redirect } from 'next/navigation';
import { CatalogPage } from '@/components/storefront-pages';
import { ACCESSORY_TYPES } from '@/lib/catalog-edits';

export function generateStaticParams() { return ACCESSORY_TYPES.map(kind => ({ kind })); }

export default async function Page({ params, searchParams }: { params: Promise<{ kind: string }>; searchParams: Promise<{ audience?: string | string[] }> }) {
  const [{ kind }, query] = await Promise.all([params, searchParams]);
  const accessoryAudience = query.audience === 'men' || query.audience === 'women' ? query.audience : undefined;
  if (kind === 'bags') redirect(`/accessories/bags-backpacks${accessoryAudience ? `?audience=${accessoryAudience}` : ''}`);
  if (!ACCESSORY_TYPES.some(value => value === kind)) notFound();
  return <CatalogPage category="accessories" accessoryType={kind} accessoryAudience={accessoryAudience} />;
}
