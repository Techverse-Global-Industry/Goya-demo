'use client';
import { useShop } from '@/context/shop-context';
import { CURATED_EDITS } from '@/lib/curated-edits';
import { CatalogPage } from './storefront-pages';
export function EditorialEditPage({slug}:{slug:string}){const{state}=useShop();const edit=CURATED_EDITS.find(edit=>edit.slug===slug)!;return <CatalogPage edit="collection" selection={edit.productIds} heading={edit.title} intro={edit.intro} key={`${slug}-${state.locale}`} />;}
