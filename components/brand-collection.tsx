'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { useShop } from '@/context/shop-context';
import { fashionCopy } from '@/lib/fashion-copy';
import { localizedText, translatedCopy } from '@/lib/international';
import { gsap, useGSAP } from '@/lib/gsap';
import type { Category } from '@/lib/types';
import { FeaturedProducts } from './featured-products';

const HOME_COLLECTIONS = [
  { id: 'men-new', href: '/new-arrivals/men', category: 'men', image: '/images/archive/goya-18.jpg', position: 'center', title: { en: 'Men · New in', fr: 'Homme · Nouveautés' }, alt: { en: 'Patterned Goya loafers with blue edging and tassels.', fr: 'Mocassins Goya à motif, liserés bleus et glands.' } },
  { id: 'men-accessories', href: '/accessories?audience=men', category: 'accessories', image: '/images/archive/goya-20.jpg', position: 'center', title: { en: 'Men · Accessories', fr: 'Homme · Accessoires' }, alt: { en: 'A black Goya belt and loafer with coordinated patterned details.', fr: 'Une ceinture et un mocassin Goya noirs aux détails à motif coordonnés.' } },
  { id: 'women-new', href: '/new-arrivals/women', category: 'women', image: '/images/archive/goya-11.jpg', position: 'center', title: { en: 'Women · New in', fr: 'Femme · Nouveautés' }, alt: { en: 'Red Goya slingback shoes.', fr: 'Souliers Goya rouges à bride arrière.' } },
  { id: 'women-accessories', href: '/accessories?audience=women', category: 'accessories', image: '/images/archive/goya-08.jpg', position: 'center', title: { en: 'Women · Accessories', fr: 'Femme · Accessoires' }, alt: { en: 'A Goya patterned bag and matching ankle boots.', fr: 'Un sac Goya à motif et des bottines assorties.' } },
] as const;

export function BrandCollection() {
  const { state, dispatch } = useShop();
  const copy = translatedCopy(fashionCopy[state.locale], state.language);
  const root = useRef<HTMLElement>(null);
  const choose = (filter: Category) => { dispatch({ type: 'resetFilters' }); dispatch({ type: 'filter', filter }); dispatch({ type: 'shoeType', shoeType: 'all' }); };
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
    <div className="fashion-category-grid brand-category-grid">{HOME_COLLECTIONS.map(category => <article key={category.id} className={`fashion-category fashion-category--${category.id}`}><Link href={category.href} onClick={() => choose(category.category)}>
      <Image src={category.image} alt={localizedText(category.alt,state.language)} fill sizes="(min-width: 700px) 25vw, 100vw" style={{ objectPosition: category.position }} />
      <h2><span>{localizedText(category.title,state.language)}</span></h2>
    </Link></article>)}</div>
    <FeaturedProducts />
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
