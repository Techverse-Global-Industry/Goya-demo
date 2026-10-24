import type { Metadata } from 'next';
import { ProductDetail } from '@/components/product-detail';

export const metadata: Metadata = { title: 'The creation — Maison Goya' };

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProductDetail productId={id} />;
}
