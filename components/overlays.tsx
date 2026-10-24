'use client';

import { useShop } from '@/context/shop-context';
import { ModalShell } from './modal-shell';
import { CartDrawer, QuickView } from './cart';
import { Checkout } from './checkout';
import { Auth } from './auth';
import { BookingModal } from './booking';
import { SearchModal } from './search';
import { MobileMenu } from './header';
import { DemoNote, InlineNotice } from './controls';
import { RegionSelector, DemoPasswordRecovery, SizeGuide } from './reference-services';
import { AvailabilityNotice } from './product-detail';
import { CatalogFilterDrawer } from './catalog-filters';

export function Overlays() {
  const { state, dispatch, t } = useShop();
  const overlay = state.overlay;
  if (!overlay) return null;
  // A single discriminated union guarantees only one native modal at a time.
  switch (overlay.kind) {
    case 'cart': return <ModalShell key="cart" title={t('cart')} drawer>{(close) => <CartDrawer close={close} />}</ModalShell>;
    case 'quick': return <ModalShell key={`quick-${overlay.productId}`} title={t('quickView')} wide>{() => <QuickView productId={overlay.productId} />}</ModalShell>;
    case 'checkout': return <ModalShell key="checkout" title={t('checkout')} wide>{(close) => <Checkout close={close} />}</ModalShell>;
    case 'auth': return <ModalShell key="auth" title={t('account')}>{() => <Auth />}</ModalShell>;
    case 'booking': return <ModalShell key="booking" title={t('atelier')}>{(close) => <BookingModal close={close} />}</ModalShell>;
    case 'search': return <ModalShell key="search" title={t('search')} className="reference-search-dialog" chrome={false}>{(close) => <SearchModal close={close} />}</ModalShell>;
    case 'menu': return <ModalShell key="menu" title={t('menu')} drawer>{() => <MobileMenu />}</ModalShell>;
    case 'region': return <ModalShell key="region" title={state.locale === 'fr' ? 'Pays et langue' : 'Country and language'}>{close => <RegionSelector onComplete={close} />}</ModalShell>;
    case 'recovery': return <ModalShell key="recovery" title={state.locale === 'fr' ? 'Mot de passe oublié' : 'Forgotten password'}>{close => <DemoPasswordRecovery onComplete={close} />}</ModalShell>;
    case 'sizeGuide': return <ModalShell key="sizeGuide" title={state.locale === 'fr' ? 'Guide des pointures' : 'Size guide'} wide>{() => <SizeGuide />}</ModalShell>;
    case 'availability': return <ModalShell key={`availability-${overlay.productId}:${overlay.size ?? ''}`} title={state.locale === 'fr' ? 'Disponibilité' : 'Availability'}>{() => <AvailabilityNotice productId={overlay.productId} size={overlay.size} />}</ModalShell>;
    case 'filters': return <ModalShell key="filters" title={state.locale === 'fr' ? 'Filtres' : 'Filters'} drawer>{close => <CatalogFilterDrawer close={close} category={overlay.category} style={overlay.style} />}</ModalShell>;
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
