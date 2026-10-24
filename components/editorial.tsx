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
  const { state, t } = useShop();
  const copy = storefrontCopy[state.locale];
  const fr = state.locale === 'fr';
  const careLinks = [
    ['/customer-service', copy.contact], ['/shipping-returns', copy.shipping], ['/returns', copy.returns],
    ['/repairs', fr ? 'Entretien et réparations' : 'Care and repairs'], ['/book-an-appointment', fr ? 'Prendre rendez-vous' : 'Book an appointment'],
    ['/withdrawal', fr ? 'Demande de rétractation' : 'Withdrawal request'], ['/track-order', copy.tracking], ['/faq', copy.faq],
  ];
  const worldLinks = [
    ['/maison', copy.maison], ['/craftsmanship', fr ? 'Le savoir-faire' : 'Craftsmanship'], ['/collaborations', fr ? 'Collaborations' : 'Collaborations'],
    ['/journal', fr ? 'Le journal' : 'The journal'], ['/careers', fr ? 'Carrières' : 'Careers'], ['/stores', copy.stores], ['/personalization', copy.personalization],
  ];
  const legalLinks = [
    ['/legal/terms-of-use', fr ? 'Conditions d’utilisation' : 'Terms of use'], ['/legal/sale-terms', fr ? 'Conditions de vente' : 'Terms of sale'],
    ['/legal/telephone-sales', fr ? 'Vente à distance assistée' : 'Assisted telephone sales'], ['/legal/privacy', fr ? 'Confidentialité' : 'Privacy information'],
    ['/legal/cookies', fr ? 'Informations sur les cookies' : 'Cookie information'], ['/legal/corporate', fr ? 'Informations de la Maison' : 'Corporate information'],
  ];
  return <footer className="fashion-footer reference-footer">
    <div className="fashion-footer-main"><div className="reference-footer-newsletter"><h2>{copy.newsletter}</h2><NewsletterForm /></div>
      <div className="fashion-footer-column"><h2>{copy.customerCare}</h2>{careLinks.map(([href,label])=><Link href={href} key={href}>{label}</Link>)}</div>
      <div className="fashion-footer-column"><h2>{copy.world}</h2>{worldLinks.map(([href,label])=><Link href={href} key={href}>{label}</Link>)}<InstallPanel compact /></div>
      <div className="fashion-footer-column"><h2>{copy.legal}</h2>{legalLinks.map(([href,label])=><Link href={href} key={href}>{label}</Link>)}<button type="button" onClick={() => { window.dispatchEvent(new Event('goya:privacy')); }}>{fr ? 'Préférences cookies' : 'Cookie preferences'}</button><Link href="/login">{copy.account}</Link></div>
    </div>
    <div className="fashion-footer-preferences"><Link href="/" className="fashion-footer-logo" aria-label="Maison Goya">Goya</Link><Link className="reference-country" href="/countries"><Icon name="globe" width={17} />{t(`country${state.market}`)} / {state.currency}</Link><div className="reference-footer-socials"><a href="https://www.facebook.com/goyaparischaussures/" target="_blank" rel="noreferrer" aria-label="Goya · Facebook"><Icon name="facebook" width={18} /></a><a href="https://www.instagram.com/goyaparis/" target="_blank" rel="noreferrer" aria-label="Goya · Instagram"><Icon name="instagram" width={18} /></a></div><LanguageSwitch /></div>
    <div className="fashion-footer-legal"><span>© {new Date().getFullYear()} Maison Goya</span><span>{copy.demo}</span><a href={top} aria-label={state.locale === 'fr' ? 'Retour en haut' : 'Back to top'}><Icon name="arrow-up-right" width={18} /></a></div>
  </footer>;
}
