'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { useShop } from '@/context/shop-context';
import { SERVICES } from '@/lib/catalog';
import { gsap, useGSAP } from '@/lib/gsap';
import type { TranslationKey } from '@/lib/i18n';
import { MaisonImage } from './maison-image';
import { Icon } from './icon';

export function Manifesto() {
  const { t } = useShop();
  const root = useRef<HTMLElement>(null);
  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('.manifesto-title span', { opacity: 0.2, y: 18, stagger: 0.2, scrollTrigger: { trigger: root.current, start: 'top 85%', end: 'bottom 65%', scrub: 1 } });
    });
    return () => media.revert();
  }, { scope: root });
  return <section className="manifesto-section section-pad" ref={root}>
    <p className="eyebrow">{t('manifestoEyebrow')}</p>
    <h2 className="manifesto-title"><span>{t('manifestoStart')}</span> <span><em>{t('manifestoAccent')}</em></span> <span>{t('manifestoEnd')}</span></h2>
    <div className="maison-values">
      <span><Icon name="spark" />{t('crafted')}</span><span><Icon name="globe" />{t('heritage')}</span><span><Icon name="shield" />{t('enduring')}</span>
    </div>
  </section>;
}

export function Atelier() {
  const { t } = useShop();
  const root = useRef<HTMLElement>(null);
  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('.atelier-copy > *', { y: 30, opacity: 0, duration: 0.9, stagger: 0.08, ease: 'power2.out', scrollTrigger: { trigger: '.atelier-copy', start: 'top 86%', once: true } });
      gsap.fromTo('.atelier-photo', { scale: 1.14, yPercent: -4 }, { scale: 1.02, yPercent: 4, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 1 } });
    });
    return () => media.revert();
  }, { scope: root });
  return <section id="atelier" className="atelier-section" ref={root} tabIndex={-1}>
    <div className="atelier-image">
      <MaisonImage index={2} alt={t('storyAlt2')} sizes="(min-width: 1000px) 44vw, 100vw" className="atelier-photo" />
      <div className="atelier-image-caption"><span className="eyebrow">Maison Goya</span><p>{t('atelierAddress')}</p><Icon name="arrow-up-right" width={24} height={24} /></div>
      <span className="atelier-stamp" aria-hidden="true">MAISON GOYA<br /><em>MG</em><br />COTONOU</span>
    </div>
    <div className="atelier-copy">
      <p className="eyebrow"><span className="tiny-rule" />{t('atelierEyebrow')}</p>
      <h2 className="display-heading">{t('atelierTitle')}<em>{t('atelierEmphasis')}</em></h2>
      <p className="atelier-intro">{t('atelierIntro')}</p>
      <div className="atelier-services">
        {SERVICES.map((service, index) => <div className="atelier-service" key={service}>
          <span className="service-number">0{index + 1}</span>
          <div><h3>{t(service)}</h3><p>{t(`${service}Description` as TranslationKey)}</p></div>
          <Icon name="plus" width={16} height={16} />
        </div>)}
      </div>
      <Link href="/app/atelier" className="button button-gold">{t('bookService')}<Icon name="arrow-up-right" /></Link>
      <p className="atelier-location-note"><Icon name="pin" width={14} height={14} />{t('atelierLocations')}</p>
    </div>
  </section>;
}

export function Footer() {
  const { dispatch, t } = useShop();
  return <footer className="site-footer section-pad">
    <div className="footer-top"><div><Link className="footer-wordmark" href="/#story">MAISON GOYA<span>.</span></Link><p>{t('footerLine')}</p></div>
      <span className="footer-monogram" aria-hidden="true">MG</span>
    </div>
    <div className="footer-bottom">
      <p suppressHydrationWarning>{t('footerCopyright', { year: new Date().getFullYear() })}</p>
      <nav aria-label={t('maison')}>
        <Link href="/app">{t('myMaison')}</Link>
        <button type="button" onClick={() => dispatch({ type: 'open', overlay: { kind: 'info', topic: 'shipping' } })}>{t('shippingInfo')}</button>
        <button type="button" onClick={() => dispatch({ type: 'open', overlay: { kind: 'info', topic: 'care' } })}>{t('careInfo')}</button>
        <button type="button" onClick={() => dispatch({ type: 'open', overlay: { kind: 'info', topic: 'privacy' } })}>{t('privacyInfo')}</button>
      </nav>
      <span>{t('madeBetween')}</span>
    </div>
  </footer>;
}
