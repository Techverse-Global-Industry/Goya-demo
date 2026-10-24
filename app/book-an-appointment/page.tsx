import type { Metadata } from 'next';
import { AppointmentsPage } from '@/components/consultation';
import { Header } from '@/components/header';
import { Footer } from '@/components/editorial';
import { Overlays } from '@/components/overlays';
import { Toast } from '@/components/controls';

export const metadata: Metadata = {title:'Appointments — Maison Goya'};
export default async function Page({searchParams}:{searchParams:Promise<{mode?:string;location?:string}>}) {
  const {mode,location}=await searchParams;
  const initialMode=mode==='online'||mode==='boutique'?mode:undefined;
  const initialLocation=location==='paris'||location==='dakar'?location:'cotonou';
  return <><Header /><AppointmentsPage initialMode={initialMode} initialLocation={initialLocation} /><Footer /><Overlays /><Toast /></>;
}
