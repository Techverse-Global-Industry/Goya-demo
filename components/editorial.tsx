'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useShop } from '@/context/shop-context';
import { fashionCopy } from '@/lib/fashion-copy';
import { storefrontCopy } from '@/lib/storefront';
import { LanguageSwitch } from './controls';
import { CampaignMedia } from './campaign-media';
import { Icon } from './icon';
import { NewsletterForm } from './reference-services';
import { InstallPanel } from './pwa';

export { Manifesto } from './manifesto';
export { MaisonStory } from './journal';

export function CraftCampaign() {
  const { state } = useShop();
  const copy = fashionCopy[state.locale];
  return <section className="fashion-campaign fashion-craft" aria-label={copy.craftTitle}>
    <CampaignMedia src="/videos/goya-care-film.mp4" poster="/images/campaign/goya-care-poster.webp" alt={state.locale === 'fr' ? 'Un artisan travaille la finition d’un soulier en cuir.' : 'A craftsman finishes a leather shoe.'} />
    <div className="fashion-campaign-shade" />
    <div className="fashion-campaign-copy"><h2>{copy.craftTitle}</h2><p>{copy.craftBody}</p><Link href="/shoe-care" className="fashion-link">{copy.craftLink}</Link></div>
  </section>;
}

export function Atelier() {
  const { state, dispatch } = useShop();
  const copy = fashionCopy[state.locale];
  return <section id="atelier" className="fashion-care" tabIndex={-1}><span className="fashion-care-monogram" aria-hidden="true">G</span><div><span className="fashion-kicker">ATELIER GOYA</span><h2>{copy.careTitle}</h2><p>{copy.careBody}</p></div><button type="button" className="fashion-link" onClick={() => dispatch({ type: 'open', overlay: { kind: 'booking' } })}>{copy.careCta}<Icon name="arrow-right" /></button></section>;
}

export function Footer() {
  const top = usePathname() === '/login' ? '#account-content' : '#public-content';
  const { state, dispatch, t } = useShop();
  const copy = storefrontCopy[state.locale];
  const info = (topic: 'shipping' | 'care' | 'privacy') => dispatch({ type: 'open', overlay: { kind: 'info', topic } });
  return <footer className="fashion-footer reference-footer">
    <div className="fashion-footer-main"><div className="reference-footer-newsletter"><h2>{copy.newsletter}</h2><NewsletterForm /></div>
      <div className="fashion-footer-column"><h2>{copy.customerCare}</h2><Link href="/customer-service">{copy.contact}</Link><Link href="/shipping-returns">{copy.shipping}</Link><Link href="/shipping-returns#returns">{copy.returns}</Link><Link href="/track-order">{copy.tracking}</Link><Link href="/faq">{copy.faq}</Link></div>
      <div className="fashion-footer-column"><h2>{copy.world}</h2><Link href="/maison">{copy.maison}</Link><Link href="/stores">{copy.stores}</Link><Link href="/personalization">{copy.personalization}</Link><Link href="/shoe-care">{copy.care}</Link><InstallPanel compact /></div>
      <div className="fashion-footer-column"><h2>{copy.legal}</h2><button type="button" onClick={() => info('privacy')}>{t('privacyInfo')}</button><Link href="/shipping-returns">{state.locale === 'fr' ? 'Conditions de démonstration' : 'Demo terms & conditions'}</Link><button type="button" onClick={() => { window.dispatchEvent(new Event('goya:privacy')); }}>{state.locale === 'fr' ? 'Préférences cookies' : 'Cookie preferences'}</button><Link href="/login">{copy.account}</Link></div>
    </div>
    <div className="fashion-footer-preferences"><Link href="/" className="fashion-footer-logo" aria-label="Maison Goya">Goya</Link><button type="button" className="reference-country" onClick={() => dispatch({ type: 'open', overlay: { kind: 'region' } })}><Icon name="globe" width={17} />{t(`country${state.market}`)} / {state.currency}</button><LanguageSwitch /></div>
    <div className="fashion-footer-legal"><span>© {new Date().getFullYear()} Maison Goya</span><span>{copy.demo}</span><a href={top} aria-label={state.locale === 'fr' ? 'Retour en haut' : 'Back to top'}><Icon name="arrow-up-right" width={18} /></a></div>
  </footer>;
}
