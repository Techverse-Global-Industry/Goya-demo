'use client';
import { CURATED_EDITS } from '@/lib/curated-edits';
import { CatalogPage } from './storefront-pages';
export function EditorialEditPage({slug,audience}:{slug:string;audience?:'men'|'women'}){const edit=CURATED_EDITS.find(edit=>edit.slug===slug)!;return <CatalogPage category={audience} edit="collection" selection={edit.productIds} heading={edit.title} intro={edit.intro}/>;}
