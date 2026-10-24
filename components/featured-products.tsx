'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useShop } from '@/context/shop-context';
import { belongsToEdit } from '@/lib/catalog-edits';
import { MaisonImage } from './maison-image';
import { Icon } from './icon';

export function FeaturedProducts() {
  const { state, money } = useShop();
  const fr = state.locale === 'fr';
  const products = state.products.filter(product => product.published !== false && belongsToEdit(product, 'featured'));
  const track = useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = useState({ start: true, end: false });
  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const update = () => setBounds(previous => {
      const start = element.scrollLeft < 8;
      const end = element.scrollLeft + element.clientWidth >= element.scrollWidth - 8;
      return previous.start === start && previous.end === end ? previous : { start, end };
    });
    const observer = new ResizeObserver(update);
    observer.observe(element);
    element.addEventListener('scroll', update, { passive: true });
    update();
    return () => { observer.disconnect(); element.removeEventListener('scroll', update); };
  }, [products.length]);
  const move = (direction: number) => {
    const element = track.current;
    if (!element) return;
    const gap = Number.parseFloat(getComputedStyle(element).columnGap) || 0;
    element.scrollBy({ left: direction * ((element.firstElementChild?.clientWidth ?? element.clientWidth) + gap), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1); }
    if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); track.current?.scrollTo({ left: event.key === 'Home' ? 0 : track.current.scrollWidth, behavior: 'instant' }); }
  };
  if (!products.length) return null;
  return <section className="reference-home-featured" aria-labelledby="goya-featured-title" aria-roledescription={fr ? 'carrousel' : 'carousel'}>
    <header className="reference-featured-heading"><h2 id="goya-featured-title">{fr ? 'Les essentiels Goya' : 'The Goya essentials'}</h2><Link href="/collections/featured">{fr ? 'Découvrir la sélection' : 'Discover the selection'}</Link></header>
    <div className="reference-featured-stage">
      <div id="goya-featured-track" className="reference-featured-track" ref={track} tabIndex={0} role="region" aria-label={fr ? 'La sélection signature, à faire défiler' : 'Scroll through the signature selection'} onKeyDown={onKeyDown}>{products.map((product, index) => <article className="reference-featured-product" key={product.id} aria-label={`${index + 1} / ${products.length}`}><Link href={`/product/${encodeURIComponent(product.id)}`}><div className="reference-featured-image"><MaisonImage index={product.image} sources={product.images} alt={product.name[state.locale]} sizes="(min-width: 700px) 25vw, 50vw" /></div><h3><span>{product.name[state.locale]}</span></h3><p>{money(product.prices[state.currency])}</p></Link></article>)}</div>
      <div className="reference-featured-controls"><button type="button" disabled={bounds.start} aria-controls="goya-featured-track" aria-label={fr ? 'Création précédente' : 'Previous creation'} onClick={() => move(-1)}><Icon name="arrow-left" width={21} /></button><button type="button" disabled={bounds.end} aria-controls="goya-featured-track" aria-label={fr ? 'Création suivante' : 'Next creation'} onClick={() => move(1)}><Icon name="arrow-right" width={21} /></button></div>
    </div>
  </section>;
}
