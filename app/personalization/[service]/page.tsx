import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SERVICE_EXPERIENCES } from '@/lib/service-experiences';
import { PersonalizationExperiencePage } from '@/components/personalization-experience';
import { Header } from '@/components/header';
import { Footer } from '@/components/editorial';
import { Overlays } from '@/components/overlays';
import { Toast } from '@/components/controls';

export const metadata: Metadata = { title: 'Personal atelier experience — Maison Goya' };
export function generateStaticParams() { return SERVICE_EXPERIENCES.map(experience=>({service:experience.slug})); }
export default async function Page({params}:{params:Promise<{service:string}>}) {
  const {service}=await params;
  if(!SERVICE_EXPERIENCES.some(experience=>experience.slug===service))notFound();
  return <><Header /><PersonalizationExperiencePage slug={service} /><Footer /><Overlays /><Toast /></>;
}
