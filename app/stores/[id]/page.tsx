import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { StoreDetailPage } from '@/components/store-experience';
import { GOYA_STORES } from '@/lib/service-experiences';
import { Header } from '@/components/header';
import { Footer } from '@/components/editorial';
import { Overlays } from '@/components/overlays';
import { Toast } from '@/components/controls';

export const metadata: Metadata = {title:'Boutique details — Maison Goya'};
export function generateStaticParams(){return GOYA_STORES.map(store=>({id:store.id}));}
export default async function Page({params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  if(!GOYA_STORES.some(store=>store.id===id))notFound();
  return <><Header /><StoreDetailPage storeId={id} /><Footer /><Overlays /><Toast /></>;
}
