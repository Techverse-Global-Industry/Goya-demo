'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useShop } from '@/context/shop-context';
import { fashionCopy } from '@/lib/fashion-copy';
import { LANGUAGE_NAMES, marketName, translatedCopy } from '@/lib/international';
import { shellCopy } from '@/lib/shell-copy';
import { CampaignMedia } from './campaign-media';
import { Icon } from './icon';
import { NewsletterForm } from './reference-services';
import { InstallPanel } from './pwa';

export { Manifesto } from './manifesto';
export { MaisonStory } from './journal';

export function CraftCampaign() {
  const { state } = useShop();
  const copy = translatedCopy(fashionCopy[state.locale], state.language);
  return <section className="fashion-campaign fashion-craft" aria-label={copy.craftTitle}>
    <CampaignMedia src="/videos/goya-care-film.mp4" poster="/images/campaign/goya-care-poster.webp" alt={state.locale === 'fr' ? 'Un artisan travaille la finition d’un soulier en cuir.' : 'A craftsman finishes a leather shoe.'} />
    <div className="fashion-campaign-shade" />
    <div className="fashion-campaign-copy"><h2>{copy.craftTitle}</h2><p>{copy.craftBody}</p><Link href="/shoe-care" className="fashion-link">{copy.craftLink}</Link></div>
  </section>;
}

export function Atelier() {
  const { state, dispatch } = useShop();
  const copy = translatedCopy(fashionCopy[state.locale], state.language);
  return <section id="atelier" className="fashion-care" tabIndex={-1}><span className="fashion-care-monogram" aria-hidden="true">G</span><div><span className="fashion-kicker">ATELIER GOYA</span><h2>{copy.careTitle}</h2><p>{copy.careBody}</p></div><button type="button" className="fashion-link" onClick={() => dispatch({ type: 'open', overlay: { kind: 'booking' } })}>{copy.careCta}<Icon name="arrow-right" /></button></section>;
}

export function Footer() {
  const top = usePathname() === '/login' ? '#account-content' : '#public-content';
  const { state, dispatch } = useShop();
  const c = translatedCopy(shellCopy[state.locale], state.language);
  const groups = [
    { title:c.customer, links:[['/faq',c.faq],['/customer-service',c.contact],['/faq?category=shipping',c.shipping],['/track-order',c.track],['/faq?category=returns',c.returns],['/repairs',c.repairs],['/book-an-appointment',c.appointment],['/returns',c.withdrawal]] },
    { title:c.world, links:[['/collaborations',c.collaboration],['/stores',c.stores],['/maison',c.heritage],['/personalization',c.one],['/careers',c.careers]] },
    { title:c.legal, links:[['/legal/corporate',c.corporate],['/legal/terms-of-use',c.use],['/legal/sale-terms',c.sale],['/legal/telephone-sales',c.telephone],['/legal/privacy',c.privacy],['/legal/cookies',c.cookies]] },
  ];
  return <footer id="footer" className="fashion-footer reference-footer exact-footer">
    <div className="exact-footer-main"><div className="exact-footer-newsletter"><h2>{c.newsletter}</h2><NewsletterForm /></div><div className="exact-footer-navigation">{groups.map(group=><div className="exact-footer-group" key={group.title}><div className="exact-footer-desktop"><h2>{group.title}</h2><ul>{group.links.map(([href,label])=><li key={href}><Link href={href}>{label}</Link></li>)}</ul></div><details className="exact-footer-mobile"><summary>{group.title}<Icon name="plus" width={10}/></summary><ul>{group.links.map(([href,label])=><li key={href}><Link href={href}>{label}</Link></li>)}</ul></details></div>)}</div></div>
    <div className="exact-footer-bottom"><div className="exact-footer-socials"><h2>{c.follow}</h2><a href="https://www.facebook.com/goyaparischaussures/" target="_blank" rel="noreferrer" aria-label="Goya · Facebook"><Icon name="facebook" width={16}/></a><a href="https://www.instagram.com/goyaparis/" target="_blank" rel="noreferrer" aria-label="Goya · Instagram"><Icon name="instagram" width={16}/></a></div><div className="fashion-footer-preferences exact-footer-country"><button type="button" onClick={()=>dispatch({type:'open',overlay:{kind:'language'}})}>{c.language}: <span translate="no">{LANGUAGE_NAMES[state.language]}</span><Icon name="chevron-right" width={20}/></button><Link href="/countries">{c.country}: {marketName(state.market,state.language)}<Icon name="chevron-right" width={20}/></Link></div><div className="exact-footer-install"><InstallPanel compact/></div></div>
    <div className="exact-footer-note"><p>© {new Date().getFullYear()} Maison Goya — {c.rights} <span>{c.demo}</span></p><a href={top} aria-label={state.locale==='fr'?'Retour en haut':'Back to top'}><Icon name="arrow-up-right" width={16}/></a></div>
  </footer>;
}
