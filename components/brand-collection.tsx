'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { useShop } from '@/context/shop-context';
import { fashionCopy, shoeCategories } from '@/lib/fashion-copy';
import { gsap, useGSAP } from '@/lib/gsap';

export function BrandCollection() {
  const { state, dispatch } = useShop();
  const copy = fashionCopy[state.locale];
  const root = useRef<HTMLElement>(null);
  const choose = (filter: 'men' | 'women', query = '') => { dispatch({ type: 'filter', filter }); dispatch({ type: 'query', query }); };
  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.utils.toArray<HTMLElement>('.fashion-pair-photo').forEach(photo => {
        gsap.fromTo(photo, { yPercent: -3 }, { yPercent: 3, ease: 'none', scrollTrigger: { trigger: photo.parentElement, start: 'top bottom', end: 'bottom top', scrub: 1 } });
      });
    });
    return () => media.revert();
  }, { scope: root });
  return <section id="collection" className="fashion-collection" ref={root} tabIndex={-1} aria-label={copy.new}>
    <div className="fashion-category-grid brand-category-grid">{shoeCategories.map(category => <article key={category.id} className={`fashion-category fashion-category--${category.id}`}><Link href="/app/shop" onClick={() => choose(category.filter, category.query)}>
      <Image src={category.image} alt={category.label[state.locale]} fill sizes={category.id === 'loafers' ? '(min-width: 700px) 60vw, 140vw' : '(min-width: 700px) 25vw, 50vw'} style={{ objectPosition: category.position }} />
      <h2><span>{category.label[state.locale]}</span></h2>
    </Link></article>)}</div>
    <div className="fashion-pair-grid">
      <article className="fashion-pair fashion-pair--men collection-editorial"><Link href="/app/shop" onClick={() => choose('men')} aria-label={copy.shopMen}>
        <div className="fashion-pair-photo"><Image src="/images/campaign/goya-movement-men.webp" alt={state.locale === 'fr' ? 'Mocassins Goya en cuir noir à bride tissée, portés avec un pantalon anthracite.' : 'Goya black leather loafers with woven straps, worn with charcoal tailoring.'} fill sizes="(min-width: 700px) 120vw, 240vw" /></div>
        <div className="fashion-pair-caption"><h2>{copy.menTitle}</h2><span className="fashion-link">{copy.shopMen}</span></div>
      </Link></article>
      <article className="fashion-pair fashion-pair--women collection-editorial"><Link href="/app/shop" onClick={() => choose('women')} aria-label={copy.shopWomen}>
        <div className="fashion-pair-photo"><Image src="/images/campaign/goya-movement-women.webp" alt={state.locale === 'fr' ? 'Souliers Goya bleu nuit aux détails tissés, portés avec une jupe ivoire.' : 'Midnight-blue Goya heels with woven details, worn with an ivory skirt.'} fill sizes="(min-width: 700px) 50vw, 100vw" /></div>
        <div className="fashion-pair-caption"><h2>{copy.womenTitle}</h2><span className="fashion-link">{copy.shopWomen}</span></div>
      </Link></article>
    </div>
  </section>;
}
