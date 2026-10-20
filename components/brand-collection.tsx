'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useShop } from '@/context/shop-context';
import { presentationCopy } from '@/lib/presentation-copy';
import { MaisonImage } from './maison-image';
import { Icon } from './icon';

export function BrandCollection() {
  const { state, dispatch } = useShop();
  const copy = presentationCopy[state.locale];
  const choose = (filter: 'men' | 'women' | 'accessories') => { dispatch({ type: 'filter', filter }); dispatch({ type: 'query', query: '' }); };
  return <section id="collection" className="brand-collection maison-section" tabIndex={-1}>
    <header className="editorial-section-heading"><div><p className="eyebrow">{copy.collectionEyebrow}</p><h2>{copy.collectionTitle}<span className="heading-period">.</span></h2></div><p>{copy.collectionIntro}</p></header>
    <div className="brand-category-grid">
      <article className="collection-editorial collection-editorial--men"><Link href="/app/shop" onClick={() => choose('men')} aria-label={copy.exploreMen}>
        <div className="collection-editorial-photo"><MaisonImage index={2} alt={copy.menCaption} sizes="(min-width: 700px) 50vw, 100vw" className="collection-campaign-image" /></div>
        <div className="collection-editorial-caption"><span className="eyebrow">01 / MAISON GOYA</span><h3>{copy.forHim}</h3><p>{copy.menCaption}</p><span className="editorial-link">{copy.exploreMen}<Icon name="arrow-right" /></span></div>
      </Link></article>
      <article className="collection-editorial collection-editorial--women"><Link href="/app/shop" onClick={() => choose('women')} aria-label={copy.exploreWomen}>
        <div className="collection-editorial-photo"><Image src="/images/campaign/goya-sculpture.webp" alt={state.locale === 'fr' ? 'Souliers Goya bleu nuit aux lignes sculpturales et détails tissés.' : 'Sculptural midnight-blue Goya heels with woven details.'} fill sizes="(min-width: 700px) 50vw, 100vw" className="collection-campaign-image" /></div>
        <div className="collection-editorial-caption"><span className="eyebrow">02 / MAISON GOYA</span><h3>{copy.forHer}</h3><p>{copy.womenCaption}</p><span className="editorial-link">{copy.exploreWomen}<Icon name="arrow-right" /></span></div>
      </Link></article>
      <article className="objects-editorial"><div className="objects-copy"><p className="eyebrow">{copy.objectsEyebrow}</p><h3>{copy.objectsTitle}<em>{copy.objectsAccent}</em></h3><p>{copy.objectsBody}</p><Link href="/app/shop" onClick={() => choose('accessories')} className="editorial-link">{copy.objectsCta}<Icon name="arrow-right" /></Link></div><Link href="/app/shop" onClick={() => choose('accessories')} className="objects-photo" aria-label={copy.objectsCta}><MaisonImage index={11} alt={copy.objectsCta} sizes="(min-width: 700px) 45vw, 100vw" className="object-contain" /></Link><span className="objects-edition" aria-hidden="true">03 / L’HÉRITAGE CROISÉ</span></article>
    </div>
  </section>;
}
