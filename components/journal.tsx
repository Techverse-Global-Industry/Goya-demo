'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useShop } from '@/context/shop-context';
import { fashionCopy } from '@/lib/fashion-copy';
import { CULTURE_STORIES } from '@/lib/culture-stories';
import { Icon } from './icon';

export function MaisonStory() {
  const { state } = useShop();
  const copy = fashionCopy[state.locale];
  const fr = state.locale === 'fr';
  const rail = useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = useState({ start: true, end: false });
  useEffect(() => {
    const element = rail.current; if (!element) return;
    const update = () => setBounds(previous => {
      const start = element.scrollLeft < 8;
      const end = element.scrollLeft + element.clientWidth >= element.scrollWidth - 8;
      return previous.start === start && previous.end === end ? previous : { start, end };
    });
    const observer = new ResizeObserver(update); observer.observe(element);
    element.addEventListener('scroll', update, { passive: true }); update();
    return () => { observer.disconnect(); element.removeEventListener('scroll', update); };
  }, []);
  const move = (direction: number) => {
    const element = rail.current; if (!element) return;
    const gap = Number.parseFloat(getComputedStyle(element).columnGap) || 0;
    element.scrollBy({ left: direction * ((element.firstElementChild?.clientWidth ?? element.clientWidth) + gap), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1); }
    if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); rail.current?.scrollTo({ left: event.key === 'Home' ? 0 : rail.current.scrollWidth, behavior: 'instant' }); }
  };
  return <section id="maison" className="reference-home-journal" aria-labelledby="goya-journal-title" aria-roledescription={fr ? 'carrousel' : 'carousel'}>
    <div className="reference-journal-intro"><p className="reference-journal-kicker">L’HÉRITAGE CROISÉ</p><h2 id="goya-journal-title">{copy.journal}</h2><p>{copy.journalBody}</p><div className="reference-journal-controls"><button type="button" disabled={bounds.start} aria-label={copy.previous} onClick={() => move(-1)}><Icon name="arrow-left" width={21} /></button><button type="button" disabled={bounds.end} aria-label={copy.next} onClick={() => move(1)}><Icon name="arrow-right" width={21} /></button></div></div>
    <div className="reference-journal-rail" ref={rail} tabIndex={0} role="region" aria-label={fr ? 'Les histoires de la Maison, à faire défiler' : 'Scroll through stories from the Maison'} onKeyDown={onKeyDown}>{CULTURE_STORIES.map((story, index) => <article className="reference-journal-story" key={story.slug} aria-label={`${index + 1} / ${CULTURE_STORIES.length}`}><Link href={`/culture/${story.slug}`}><div className={`reference-journal-image reference-journal-image--${story.slug}`}><Image src={story.image} alt={story.alt[state.locale]} fill sizes="(min-width: 900px) 29vw, (min-width: 700px) 45vw, 83vw" /></div><p className="reference-journal-story-kicker">{story.kicker[state.locale]}</p><h3>{story.title[state.locale]}</h3><p>{story.intro[state.locale]}</p><span className="reference-journal-link">{copy.read}<Icon name="arrow-right" width={17} /></span></Link></article>)}</div>
  </section>;
}
