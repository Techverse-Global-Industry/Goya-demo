'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useShop } from '@/context/shop-context';
import { fashionCopy } from '@/lib/fashion-copy';
import { LanguageSwitch } from './controls';
import { CampaignMedia } from './campaign-media';
import { MaisonImage } from './maison-image';
import { Icon } from './icon';

export function CraftCampaign() {
  const { state } = useShop();
  const copy = fashionCopy[state.locale];
  return <section className="fashion-campaign fashion-craft" aria-label={copy.craftTitle}>
    <CampaignMedia src="/videos/goya-craft.mp4" poster="/images/campaign/goya-craft-poster.webp" alt={state.locale === 'fr' ? 'Un artisan travaille la finition d’un soulier en cuir.' : 'A craftsman finishes a leather shoe.'} />
    <div className="fashion-campaign-shade" />
    <div className="fashion-campaign-copy"><h2>{copy.craftTitle}</h2><p>{copy.craftBody}</p><a href="#maison" className="fashion-link">{copy.craftLink}</a></div>
  </section>;
}

export function Manifesto() {
  const { state } = useShop();
  const copy = fashionCopy[state.locale];
  return <section id="goya-spirit" className="fashion-statement"><h2>{copy.statement}</h2><p>{copy.statementBody}</p></section>;
}

export function MaisonStory() {
  const { state, dispatch } = useShop();
  const copy = fashionCopy[state.locale];
  const rail = useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = useState({ start: true, end: false });
  useEffect(() => {
    const element = rail.current;
    if (!element) return;
    const update = () => setBounds({ start: element.scrollLeft < 8, end: element.scrollLeft + element.clientWidth >= element.scrollWidth - 8 });
    const observer = new ResizeObserver(update);
    observer.observe(element);
    element.addEventListener('scroll', update, { passive: true });
    update();
    return () => { observer.disconnect(); element.removeEventListener('scroll', update); };
  }, []);
  const move = (direction: number) => { const element = rail.current; if (element) element.scrollBy({ left: direction * ((element.firstElementChild?.clientWidth ?? element.clientWidth) + 20), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); };
  return <section id="maison" className="fashion-journal" tabIndex={-1}>
    <div className="fashion-journal-intro"><span className="fashion-kicker">L’HÉRITAGE CROISÉ</span><h2>{copy.journal}</h2><p>{copy.journalBody}</p><div className="fashion-rail-controls"><button type="button" disabled={bounds.start} aria-label={copy.previous} onClick={() => move(-1)}><Icon name="arrow-right" /></button><button type="button" disabled={bounds.end} aria-label={copy.next} onClick={() => move(1)}><Icon name="arrow-right" /></button></div></div>
    <div className="fashion-journal-rail" ref={rail} tabIndex={0} role="region" aria-label={copy.journal}>
      <article className="fashion-story-card"><a href="#atelier"><div className="fashion-story-image"><MaisonImage index={1} alt={copy.storyCraft} sizes="(min-width: 900px) 30vw, 80vw" className="object-cover" /></div><h3>{copy.storyCraft}</h3><p>{copy.storyCraftBody}</p><span className="fashion-link">{copy.read}</span></a></article>
      <article className="fashion-story-card"><a href="#goya-spirit"><div className="fashion-story-image"><MaisonImage index={2} alt={copy.storyCulture} sizes="(min-width: 900px) 30vw, 80vw" className="object-cover" /></div><h3>{copy.storyCulture}</h3><p>{copy.storyCultureBody}</p><span className="fashion-link">{copy.read}</span></a></article>
      <article className="fashion-story-card"><Link href="/app/shop" onClick={() => { dispatch({ type: 'filter', filter: 'all' }); dispatch({ type: 'query', query: '' }); }}><div className="fashion-story-image"><Image src="/images/campaign/goya-sneakers.webp" alt={copy.storyDetails} fill sizes="(min-width: 900px) 30vw, 80vw" /></div><h3>{copy.storyDetails}</h3><p>{copy.storyDetailsBody}</p><span className="fashion-link">{copy.read}</span></Link></article>
    </div>
  </section>;
}

export function Atelier() {
  const { state } = useShop();
  const copy = fashionCopy[state.locale];
  return <section id="atelier" className="fashion-care" tabIndex={-1}><span className="fashion-care-monogram" aria-hidden="true">G</span><div><span className="fashion-kicker">ATELIER GOYA</span><h2>{copy.careTitle}</h2><p>{copy.careBody}</p></div><Link href="/app/atelier" className="fashion-link">{copy.careCta}<Icon name="arrow-right" /></Link></section>;
}

export function Footer() {
  const { state, dispatch, t } = useShop();
  const copy = fashionCopy[state.locale];
  const info = (topic: 'shipping' | 'care' | 'privacy') => dispatch({ type: 'open', overlay: { kind: 'info', topic } });
  return <footer className="fashion-footer">
    <div className="fashion-footer-main"><div className="fashion-footer-invite"><h2>{copy.footerHeading}</h2><p>{copy.footerBody}</p><Link href="/login?mode=register" className="fashion-link">{copy.create}<Icon name="arrow-right" /></Link></div>
      <div className="fashion-footer-column"><h2>{copy.customer}</h2><button type="button" onClick={() => info('shipping')}>{t('shippingInfo')}</button><button type="button" onClick={() => info('care')}>{t('careInfo')}</button><button type="button" onClick={() => info('privacy')}>{t('privacyInfo')}</button></div>
      <div className="fashion-footer-column"><h2>{copy.account}</h2><Link href="/app">{t('myMaison')}</Link><Link href="/app/orders">{t('myOrders')}</Link><Link href="/app/atelier">{t('myAppointments')}</Link></div>
      <div className="fashion-footer-column"><h2>{copy.explore}</h2><a href="#collection">{copy.new}</a><a href="#maison">{copy.maison}</a><a href="#atelier">{copy.care}</a></div>
    </div>
    <div className="fashion-footer-preferences"><Link href="/" className="fashion-footer-logo" aria-label="Maison Goya">Goya</Link><span>{copy.country}</span><LanguageSwitch /></div>
    <div className="fashion-footer-legal"><span>© {new Date().getFullYear()} Maison Goya</span><span>{copy.footerNote}</span><a href="#story" aria-label={state.locale === 'fr' ? 'Retour en haut' : 'Back to top'}><Icon name="arrow-up-right" width={18} /></a></div>
  </footer>;
}
