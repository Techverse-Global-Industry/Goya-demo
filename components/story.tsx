'use client';

import { useRef } from 'react';
import { getImageProps } from 'next/image';
import { useShop } from '@/context/shop-context';
import { presentationCopy } from '@/lib/presentation-copy';
import { gsap, useGSAP } from '@/lib/gsap';
import { Icon } from './icon';

export function Story() {
  const { state } = useShop();
  const copy = presentationCopy[state.locale];
  const imageAlt = state.locale === 'fr' ? 'Les mocassins signature Goya, cuir noir et détail tissé, dans la lumière du soleil.' : 'Goya signature black leather loafers with woven details, in warm afternoon light.';
  const { props: { srcSet: desktop } } = getImageProps({ src: '/images/campaign/goya-signature.webp', width: 1920, height: 1080, alt: imageAlt, sizes: '100vw', loading: 'eager' });
  const { props: { srcSet: mobile, ...mobileImage } } = getImageProps({ src: '/images/campaign/goya-signature-mobile.webp', width: 940, height: 1672, alt: imageAlt, sizes: '100vw', loading: 'eager' });
  const root = useRef<HTMLElement>(null);
  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('.campaign-copy > *', { y: 24, opacity: 0, duration: 1.1, stagger: .12, delay: .15, ease: 'power3.out' });
      gsap.fromTo('.campaign-photo', { scale: 1.04 }, { scale: 1, duration: 8, ease: 'power1.out' });
    });
    return () => media.revert();
  }, { scope: root });
  return <section id="story" className="campaign-hero" ref={root} aria-label={copy.chapter}>
    <picture>
      <source media="(min-width: 640px)" srcSet={desktop} sizes="100vw" />
      <source srcSet={mobile} sizes="100vw" />
      {/* Native picture selects the art-directed crop; getImageProps optimizes both sources. */}
      <img {...mobileImage} alt={imageAlt} loading="eager" fetchPriority="high" className="campaign-photo" />
    </picture>
    <div className="campaign-wash" />
    <div className="campaign-copy" key={state.locale}>
      <p className="eyebrow">MAISON GOYA <span aria-hidden="true">/</span> {copy.chapter}</p>
      <h1>{copy.heroTitle}<em>{copy.heroAccent}</em></h1>
      <p className="campaign-description">{copy.heroBody}</p>
      <a href="#collection" className="editorial-link">{copy.discover}<Icon name="arrow-right" width={20} /></a>
    </div>
    <div className="campaign-bottom"><span>01 <i /> {copy.chapter}</span><a href="#maison">{copy.scroll}<Icon name="arrow-down" width={15} /></a><span>COTONOU · PARIS · DAKAR</span></div>
  </section>;
}
