'use client';

import { usePathname } from 'next/navigation';
import { useShop } from '@/context/shop-context';
import { ModalShell } from './modal-shell';
import { CartDrawer, QuickView } from './cart';
import { Checkout } from './checkout';
import { Auth } from './auth';
import { BookingModal } from './booking';
import { SearchModal } from './search';
import { MobileMenu } from './header';
import { DemoNote, InlineNotice } from './controls';

export function Overlays() {
  const { state, dispatch, t } = useShop();
  const pathname = usePathname();
  const overlay = state.overlay;
  if (!overlay) return null;
  if (!['info', 'menu'].includes(overlay.kind) && (!pathname.startsWith('/app') || state.user?.role !== 'customer')) return null;
  // A single discriminated union guarantees only one native modal at a time.
  switch (overlay.kind) {
    case 'cart': return <ModalShell key="cart" title={t('cart')} drawer>{(close) => <CartDrawer close={close} />}</ModalShell>;
    case 'quick': return <ModalShell key={`quick-${overlay.productId}`} title={t('quickView')} wide>{() => <QuickView productId={overlay.productId} />}</ModalShell>;
    case 'checkout': return <ModalShell key="checkout" title={t('checkout')} wide>{(close) => <Checkout close={close} />}</ModalShell>;
    case 'auth': return <ModalShell key="auth" title={t('account')}>{() => <Auth />}</ModalShell>;
    case 'booking': return <ModalShell key="booking" title={t('atelier')}>{(close) => <BookingModal close={close} />}</ModalShell>;
    case 'search': return <ModalShell key="search" title={t('search')}>{() => <SearchModal />}</ModalShell>;
    case 'menu': return <ModalShell key="menu" title={t('menu')} drawer>{() => <MobileMenu />}</ModalShell>;
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
