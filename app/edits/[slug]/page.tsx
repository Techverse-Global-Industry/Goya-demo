import { notFound } from 'next/navigation';
import { CURATED_EDITS } from '@/lib/curated-edits';
import { EditorialEditPage } from '@/components/editorial-edit';
export function generateStaticParams(){return CURATED_EDITS.map(edit=>({slug:edit.slug}));}
export default async function Page({params}:{params:Promise<{slug:string}>}){const{slug}=await params;if(!CURATED_EDITS.some(edit=>edit.slug===slug))notFound();return <EditorialEditPage slug={slug}/>;}
