'use client';

import { useShop } from '@/context/shop-context';
import { scrollToSection } from '@/lib/browser';
import { CurrencySelect, LanguageSwitch } from './controls';
import { Icon } from './icon';

export function Header() {
  const { state, dispatch, t, itemCount } = useShop();
  return <>
    <a className="skip-link" href="#collection" onClick={(event) => { event.preventDefault(); scrollToSection('collection'); }}>{t('skip')}</a>
    <header className="site-header backdrop-blur-md">
      <a className="wordmark" href="#story" onClick={(event) => { event.preventDefault(); scrollToSection('story'); }} aria-label="Maison Goya">
        <span>MAISON GOYA<span className="wordmark-dot">.</span></span>
        <small>{t('madeBetween')}</small>
      </a>
      <nav className="desktop-nav" aria-label={t('menu')}>
        {(['story', 'collection', 'atelier'] as const).map((id) => <a key={id} href={`#${id}`} onClick={(event) => { event.preventDefault(); scrollToSection(id); }}>{t(id)}</a>)}
      </nav>
      <div className="header-actions">
        <div className="header-currency"><CurrencySelect /></div>
        <div className="header-language"><LanguageSwitch /></div>
        <span className="header-divider" aria-hidden="true" />
        <button type="button" className="icon-button" aria-label={t('search')} onClick={() => dispatch({ type: 'open', overlay: { kind: 'search' } })}><Icon name="search" /></button>
        <button type="button" className={`icon-button profile-button ${state.user ? 'is-member' : ''}`} aria-label={t('account')} onClick={() => dispatch({ type: 'open', overlay: { kind: 'auth' } })}>
          <Icon name="user" />{state.user && <span className="member-dot" />}
        </button>
        <button type="button" className="icon-button cart-trigger" data-cart-trigger aria-label={`${t('cart')} (${itemCount})`} onClick={() => dispatch({ type: 'open', overlay: { kind: 'cart' } })}>
          <Icon name="bag" /><span className="cart-badge" aria-hidden="true">{itemCount}</span>
        </button>
        <button type="button" className="icon-button mobile-menu-trigger" aria-label={t('menu')} onClick={() => dispatch({ type: 'open', overlay: { kind: 'menu' } })}><Icon name="menu" /></button>
      </div>
    </header>
  </>;
}

export function MobileMenu() {
  const { dispatch, t } = useShop();
  return <div className="mobile-menu">
    <p className="eyebrow">{t('maison')}</p>
    {(['story', 'collection', 'atelier'] as const).map((id, index) => <a key={id} href={`#${id}`} onClick={(event) => {
      event.preventDefault(); dispatch({ type: 'close' }); requestAnimationFrame(() => scrollToSection(id));
    }}><span>0{index + 1}</span>{t(id)}<Icon name="arrow-up-right" /></a>)}
    <div className="mobile-menu-preferences"><LanguageSwitch /><CurrencySelect /></div>
    <p className="muted">{t('madeBetween')}</p>
  </div>;
}
