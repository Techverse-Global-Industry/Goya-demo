'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { useShop } from '@/context/shop-context';
import { fashionCopy, shoeCategories } from '@/lib/fashion-copy';
import { gsap, useGSAP } from '@/lib/gsap';
import { catalogPath } from '@/lib/storefront';
import type { ShoeType } from '@/lib/types';

export function BrandCollection() {
  const { state, dispatch } = useShop();
  const copy = fashionCopy[state.locale];
  const root = useRef<HTMLElement>(null);
  const choose = (filter: 'men' | 'women', shoeType: ShoeType = 'all') => { dispatch({ type: 'resetFilters' }); dispatch({ type: 'filter', filter }); dispatch({ type: 'shoeType', shoeType }); };
  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('.fashion-category', { y: 32, opacity: 0, duration: .9, stagger: .09, ease: 'power2.out', scrollTrigger: { trigger: '.fashion-category-grid', start: 'top 88%', once: true } });
      gsap.utils.toArray<HTMLElement>('.fashion-pair--women .fashion-pair-photo').forEach(photo => {
        gsap.fromTo(photo, { yPercent: -3 }, { yPercent: 3, ease: 'none', scrollTrigger: { trigger: photo.parentElement, start: 'top bottom', end: 'bottom top', scrub: 1 } });
      });
      gsap.utils.toArray<HTMLElement>('.fashion-pair-caption').forEach(caption => {
        gsap.from(caption, { y: 24, opacity: 0, duration: 1, ease: 'power2.out', scrollTrigger: { trigger: caption, start: 'top 88%', once: true } });
      });
    });
    return () => media.revert();
  }, { scope: root });
  return <section id="collection" className="fashion-collection reference-home-collection" ref={root} tabIndex={-1} aria-label={copy.new}>
    <div className="fashion-category-grid brand-category-grid">{shoeCategories.map(category => <article key={category.id} className={`fashion-category fashion-category--${category.id}`}><Link href={catalogPath(category.filter, category.id)} onClick={() => choose(category.filter, category.id)}>
      <Image src={category.image} alt={category.label[state.locale]} fill sizes="(min-width: 700px) 25vw, 100vw" style={{ objectPosition: category.position }} />
      <h2><span>{category.label[state.locale]}</span></h2>
    </Link></article>)}</div>
    <div className="fashion-pair-grid">
      <article className="fashion-pair fashion-pair--men collection-editorial"><Link href="/men" onClick={() => choose('men')} aria-label={copy.shopMen}>
        <div className="fashion-pair-photo"><Image src="/images/img2.jpg" alt={state.locale === 'fr' ? 'Une silhouette Goya en costume gris et souliers bordeaux.' : 'A Goya silhouette in grey tailoring and burgundy shoes.'} fill sizes="(min-width: 700px) 50vw, 100vw" /></div>
        <div className="fashion-pair-caption"><h2>{copy.menTitle}</h2><span className="fashion-link">{copy.shopMen}</span></div>
      </Link></article>
      <article className="fashion-pair fashion-pair--women collection-editorial"><Link href="/women" onClick={() => choose('women')} aria-label={copy.shopWomen}>
        <div className="fashion-pair-photo"><Image src="/images/campaign/goya-sculpture.webp" alt={state.locale === 'fr' ? 'Souliers Goya bleu nuit à talon sculptural et détails tissés, sur une pierre dorée.' : 'Midnight-blue Goya heels with sculptural lines and woven details on golden stone.'} fill sizes="(min-width: 700px) 50vw, 100vw" /></div>
        <div className="fashion-pair-caption"><h2>{copy.womenTitle}</h2><span className="fashion-link">{copy.shopWomen}</span></div>
      </Link></article>
    </div>
  </section>;
}
