'use client';

import { useRef } from 'react';
import { useShop } from '@/context/shop-context';
import { fashionCopy } from '@/lib/fashion-copy';
import { gsap, useGSAP } from '@/lib/gsap';
import { CampaignMedia } from './campaign-media';

export function Story() {
  const { state } = useShop();
  const copy = fashionCopy[state.locale];
  const root = useRef<HTMLElement>(null);
  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('.campaign-copy > *', { y: 18, opacity: 0, duration: 1, stagger: .12, delay: .2, ease: 'power3.out' });
    });
    return () => media.revert();
  }, { scope: root });
  return <section id="story" className="fashion-campaign campaign-hero" ref={root} aria-label={copy.hero}>
    <CampaignMedia src="/videos/goya-campaign.mp4" poster="/images/campaign/goya-movement-men.webp" alt={state.locale === 'fr' ? 'Mocassins Goya noirs à bride tissée, portés sur des marches en béton.' : 'Goya black loafers with woven straps, worn on concrete steps.'} posterSizes="(min-width: 700px) 100vw, 240vw" posterPosition="35% center" priority />
    <div className="fashion-campaign-shade" />
    <div className="fashion-campaign-copy campaign-copy">
      <h1>{copy.hero}</h1>
      <p>{copy.heroBody}</p>
      <a href="#collection" className="fashion-link">{copy.discover}</a>
    </div>
    <span className="campaign-edition">MAISON GOYA — L’HÉRITAGE CROISÉ</span>
  </section>;
}
