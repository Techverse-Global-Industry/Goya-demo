import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LEGAL_DOCUMENTS } from '@/lib/legal-copy';
import { LegalDocumentPage } from '@/components/legal-pages';

export const metadata:Metadata={title:'Information — Maison Goya'};
export function generateStaticParams(){return LEGAL_DOCUMENTS.map(document=>({topic:document.slug}));}
export default async function Page({params}:{params:Promise<{topic:string}>}){
  const {topic}=await params;if(!LEGAL_DOCUMENTS.some(document=>document.slug===topic))notFound();
  return <LegalDocumentPage topic={topic} />;
}
