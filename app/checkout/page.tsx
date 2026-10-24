import type { Metadata } from 'next';
import { CheckoutPage } from '@/components/storefront-pages';
import { expressPayment } from '@/lib/commerce';
export const metadata: Metadata = { title: 'Checkout — Maison Goya' };
export default async function Page({searchParams}:{searchParams:Promise<{payment?:string}>}) {
  const {payment}=await searchParams;
  return <CheckoutPage initialPayment={expressPayment(payment)??undefined}/>;
}
