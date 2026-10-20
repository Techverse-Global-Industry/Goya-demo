'use client';

import Link from 'next/link';
import { useShop } from '@/context/shop-context';
import { SERVICES } from '@/lib/catalog';
import { presentationCopy } from '@/lib/presentation-copy';
import type { TranslationKey } from '@/lib/i18n';
import { MaisonImage } from './maison-image';
import { Icon } from './icon';

export function Manifesto() {
  const { state } = useShop();
  const copy = presentationCopy[state.locale];
  return <section className="maison-manifesto maison-section"><p className="eyebrow">{copy.signature}</p><span className="manifesto-symbol" aria-hidden="true">G</span><h2>{copy.statement}<em>{copy.statementAccent}</em></h2><p className="manifesto-description">{copy.statementBody}</p><span className="manifesto-rule" aria-hidden="true" /></section>;
}

export function MaisonStory() {
  const { state } = useShop();
  const copy = presentationCopy[state.locale];
  return <section id="maison" className="maison-story maison-section" tabIndex={-1}><div className="maison-story-image"><MaisonImage index={1} alt={copy.carePhoto} sizes="(min-width: 900px) 48vw, 100vw" className="object-cover" /><div className="maison-story-image-note"><span>{copy.craftDetail}</span><span>01—MG</span></div></div><div className="maison-story-copy"><p className="eyebrow">{copy.maisonEyebrow}</p><h2>{copy.maisonTitle}<em>{copy.maisonAccent}</em></h2><p>{copy.maisonBody}</p><p>{copy.maisonSecond}</p><a href="#atelier" className="editorial-link">{copy.maisonLink}<Icon name="arrow-right" /></a><span className="maison-story-signature" aria-hidden="true">Goya</span></div></section>;
}

export function Atelier() {
  const { state, t } = useShop();
  const copy = presentationCopy[state.locale];
  return <section id="atelier" className="atelier-editorial maison-section" tabIndex={-1}>
    <div className="atelier-editorial-intro"><p className="eyebrow">{copy.careEyebrow}</p><h2>{copy.careTitle}<em>{copy.careAccent}</em></h2><p>{copy.careBody}</p><Link href="/app/atelier" className="editorial-link">{copy.careCta}<Icon name="arrow-right" /></Link><p className="atelier-locations"><Icon name="pin" width={14} />{t('atelierLocations')}</p></div>
    <div className="atelier-service-list">{SERVICES.map((service, index) => <details key={service} className="atelier-service-detail"><summary><span className="service-number">0{index + 1}</span><h3>{t(service)}</h3><Icon name="plus" width={20} /></summary><p>{t(`${service}Description` as TranslationKey)}</p><Link href="/app/atelier" className="text-link">{copy.careCta}<Icon name="arrow-up-right" width={14} /></Link></details>)}</div>
    <div className="atelier-endnote"><span>{copy.craftCaption}</span><span>MAISON GOYA / COTONOU</span></div>
  </section>;
}

export function Footer() {
  const { state, dispatch, t } = useShop();
  const copy = presentationCopy[state.locale];
  const info = (topic: 'shipping' | 'care' | 'privacy') => dispatch({ type: 'open', overlay: { kind: 'info', topic } });
  return <footer className="maison-footer">
    <div className="footer-invitation"><p className="eyebrow">{copy.chapter}</p><h2>{copy.footerTitle}<em>{copy.footerAccent}</em></h2><p>{copy.footerBody}</p><Link href="/app/shop" className="editorial-link">{copy.enter}<Icon name="arrow-up-right" /></Link></div>
    <div className="maison-footer-links"><div><p className="eyebrow">{copy.explore}</p><a href="#collection">{copy.collections}</a><a href="#maison">{copy.maison}</a><a href="#atelier">{copy.care}</a></div><div><p className="eyebrow">{copy.service}</p><button type="button" onClick={() => info('shipping')}>{t('shippingInfo')}</button><button type="button" onClick={() => info('care')}>{t('careInfo')}</button><button type="button" onClick={() => info('privacy')}>{t('privacyInfo')}</button></div><div><p className="eyebrow">{copy.connect}</p><Link href="/app">{copy.member}</Link><Link href="/app/orders">{t('myOrders')}</Link><Link href="/app/atelier">{t('myAppointments')}</Link></div><div className="footer-origin"><span className="footer-seal" aria-hidden="true">G</span><p>{copy.invitation}</p><span>COTONOU · PARIS · DAKAR</span></div></div>
    <div className="footer-grand-wordmark" aria-hidden="true">Goya</div><div className="maison-footer-bottom"><span>© {new Date().getFullYear()} Maison Goya</span><span>{copy.footerNote}</span><a href="#story" aria-label={state.locale === 'fr' ? 'Retour en haut' : 'Back to top'}><Icon name="arrow-up-right" width={20} /></a></div>
  </footer>;
}
