'use client';

import { useShop } from '@/context/shop-context';
import { ModalShell } from './modal-shell';
import { CartDrawer, EmptyBagPopover, QuickView } from './cart';
import { Checkout } from './checkout';
import { Auth } from './auth';
import { BookingModal } from './booking';
import { SearchModal } from './search';
import { MobileMenu } from './header';
import { DemoNote, InlineNotice, LanguageOptions } from './controls';
import { siteText } from '@/lib/international';
import { RegionSelector, NewsletterForm } from './reference-services';
import { DemoRecovery } from './account-security';
import { FitFinder, ProductSizeGuide } from './fit-guide';
import { NewsletterPopup } from './promotion';
import { AvailabilityNotice, ProductSizeSelector, ProductInformation } from './product-detail';
import { CatalogFilterDrawer } from './catalog-filters';

export function Overlays() {
  const { state, dispatch, t } = useShop();
  const overlay = state.overlay;
  if (!overlay) return null;
  // A single discriminated union guarantees only one native modal at a time.
  switch (overlay.kind) {
    case 'cart': return state.cart.length ? <ModalShell key="cart" title={t('cart')} drawer chrome={false} className="reference-cart-dialog">{(close) => <CartDrawer close={close} />}</ModalShell> : <EmptyBagPopover close={()=>dispatch({type:'close'})}/>;
    case 'quick': return <ModalShell key={`quick-${overlay.productId}`} title={t('quickView')} wide>{() => <QuickView productId={overlay.productId} />}</ModalShell>;
    case 'checkout': return <ModalShell key="checkout" title={t('checkout')} wide>{(close) => <Checkout close={close} />}</ModalShell>;
    case 'auth': return <ModalShell key="auth" title={t('account')}>{() => <Auth />}</ModalShell>;
    case 'booking': return <ModalShell key="booking" title={t('atelier')}>{(close) => <BookingModal close={close} />}</ModalShell>;
    case 'search': return <ModalShell key="search" title={t('search')} className="reference-search-dialog" chrome={false}>{(close) => <SearchModal close={close} />}</ModalShell>;
    case 'menu': return <ModalShell key="menu" title={t('menu')} drawer chrome={false} className="exact-menu-dialog">{() => <MobileMenu />}</ModalShell>;
    case 'region': return <ModalShell key="region" title={state.locale === 'fr' ? 'Pays et langue' : 'Country and language'}>{close => <RegionSelector onComplete={close} />}</ModalShell>;
    case 'language': return <ModalShell key="language" title={siteText(state.language,'Select a language','Sélectionnez une langue')} drawer className="exact-language-dialog">{close=><LanguageOptions onComplete={close}/>}</ModalShell>;
    case 'recovery': return <ModalShell key="recovery" title={siteText(state.language,'Reset password','Réinitialiser le mot de passe')} drawer className="exact-recovery-dialog">{close => <DemoRecovery onComplete={close} />}</ModalShell>;
    case 'sizes': return <ModalShell key={`sizes-${overlay.productId}`} title={siteText(state.language,'Select your size','Sélectionnez votre pointure')} drawer className="reference-sizes-dialog">{()=><ProductSizeSelector productId={overlay.productId} size={overlay.size}/>}</ModalShell>;
    case 'productInfo': return <ModalShell key={`productInfo-${overlay.productId}-${overlay.section}`} title={siteText(state.language,overlay.section==='details'?'Details':overlay.section==='shipping'?'Shipping and returns':'Care',overlay.section==='details'?'Détails':overlay.section==='shipping'?'Livraison et retours':'Entretien')} drawer className="reference-product-info-dialog">{()=><ProductInformation productId={overlay.productId} section={overlay.section}/>}</ModalShell>;
    case 'sizeGuide': return <ModalShell key={`sizeGuide-${overlay.productId ?? ''}`} title={siteText(state.language,'Size chart','Tableau des pointures')} drawer className="reference-chart-dialog">{() => <ProductSizeGuide productId={overlay.productId} />}</ModalShell>;
    case 'fit': return <ModalShell key={`fit-${overlay.productId}`} title={siteText(state.language,'Find my size','Trouver ma pointure')} drawer className="reference-fit-dialog">{() => <FitFinder productId={overlay.productId} />}</ModalShell>;
    case 'newsletter': return <ModalShell key="newsletter" title={state.locale === 'fr' ? 'Les nouvelles Goya' : 'Goya newsletter'} className="newsletter-dialog" chrome={false}>{close => <NewsletterPopup close={close}><NewsletterForm variant="popup" /></NewsletterPopup>}</ModalShell>;
    case 'availability': return <ModalShell key={`availability-${overlay.productId}:${overlay.size ?? ''}`} title={siteText(state.language,'Notify me','Me prévenir')} drawer chrome={false} className="reference-notify-dialog">{() => <AvailabilityNotice productId={overlay.productId} size={overlay.size} />}</ModalShell>;
    case 'filters': return <ModalShell key="filters" title={siteText(state.language,'Filters','Filtres')} drawer className="reference-filters-dialog">{close => <CatalogFilterDrawer close={close} category={overlay.category} style={overlay.style} accessoryType={overlay.accessoryType} accessoryAudience={overlay.accessoryAudience} edit={overlay.edit} selection={overlay.selection} />}</ModalShell>;
    case 'info': {
      const info = {
        shipping: { title: 'infoShippingTitle', body: 'infoShippingBody', label: 'shippingInfo' },
        care: { title: 'infoCareTitle', body: 'infoCareBody', label: 'careInfo' },
        privacy: { title: 'infoPrivacyTitle', body: 'infoPrivacyBody', label: 'privacyInfo' },
      } as const;
      const content = info[overlay.topic];
      return <ModalShell key={`info-${overlay.topic}`} title={t(content.label)}>{() => <div className="info-modal"><p className="eyebrow">Maison Goya</p><h2 className="modal-display-title">{t(content.title)}</h2><p className="info-body">{t(content.body)}</p>
        {overlay.topic === 'privacy' && <><button type="button" className="button button-outline button-full" onClick={() => dispatch({ type: 'clearPreferences' })}>{t('forgetPreferences')}</button><InlineNotice /></>}
        <DemoNote />
      </div>}</ModalShell>;
    }
  }
}
