import { notFound } from 'next/navigation';
import { CURATED_EDITS } from '@/lib/curated-edits';
import { EditorialEditPage } from '@/components/editorial-edit';
export function generateStaticParams(){return CURATED_EDITS.map(edit=>({slug:edit.slug}));}
export default async function Page({params,searchParams}:{params:Promise<{slug:string}>,searchParams:Promise<{audience?:string}>}){const[{slug},{audience}]=await Promise.all([params,searchParams]);if(!CURATED_EDITS.some(edit=>edit.slug===slug))notFound();return <EditorialEditPage slug={slug} audience={audience==='men'||audience==='women'?audience:undefined}/>;}
