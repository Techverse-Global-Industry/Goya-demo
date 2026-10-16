'use client';

import { useShop } from '@/context/shop-context';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { scrollToSection } from '@/lib/browser';
import { CurrencySelect, LanguageSwitch } from './controls';
import { Icon } from './icon';

export function Header({ workspace = false }: { workspace?: boolean }) {
  const { state, dispatch, t, itemCount } = useShop();
  const onStorefront = usePathname() === '/';
  return <>
    <a className="skip-link" href={onStorefront ? '#collection' : '#account-content'}>{t(onStorefront ? 'skip' : 'myMaison')}</a>
    <header className="site-header backdrop-blur-md">
      <Link className="wordmark" href={workspace ? '/app' : onStorefront ? '#story' : '/#story'} onClick={(event) => { if (!workspace && onStorefront) { event.preventDefault(); scrollToSection('story'); } }} aria-label="Maison Goya">
        <span>MAISON GOYA<span className="wordmark-dot">.</span></span>
        <small>{t('madeBetween')}</small>
      </Link>
      <nav className="desktop-nav" aria-label={t('menu')}>
        {workspace ? <><Link href="/app/shop">{t('collection')}</Link><Link href="/app/orders">{t('myOrders')}</Link><Link href="/app/atelier">{t('atelier')}</Link></> : (['story', 'collection', 'atelier'] as const).map((id) => <Link key={id} href={onStorefront ? `#${id}` : `/#${id}`} onClick={(event) => { if (onStorefront) { event.preventDefault(); scrollToSection(id); } }}>{t(id)}</Link>)}
      </nav>
      <div className="header-actions">
        {workspace && <div className="header-currency"><CurrencySelect /></div>}
        <div className="header-language"><LanguageSwitch /></div>
        <span className="header-divider" aria-hidden="true" />
        {workspace && <button type="button" className="icon-button" aria-label={t('search')} onClick={() => dispatch({ type: 'open', overlay: { kind: 'search' } })}><Icon name="search" /></button>}
        <Link href={workspace ? "/app/settings" : "/app"} className={`icon-button profile-button ${!workspace ? 'public-signin' : ''} ${state.user ? 'is-member' : ''}`} aria-label={t('account')} onClick={() => dispatch({ type: 'close' })}>
          <Icon name="user" />{!workspace && <span className="public-signin-label">{t(state.user ? 'myMaison' : 'login')}</span>}{state.user && <span className="member-dot" />}{state.notifications.some((notice) => !notice.read) && <span className="account-unread" aria-hidden="true">{state.notifications.filter((notice) => !notice.read).length}</span>}
        </Link>
        {workspace && <button type="button" className="icon-button cart-trigger" data-cart-trigger aria-label={`${t('cart')} (${itemCount})`} onClick={() => dispatch({ type: 'open', overlay: { kind: 'cart' } })}>
          <Icon name="bag" /><span className="cart-badge" aria-hidden="true">{itemCount}</span>
        </button>}
        <button type="button" className="icon-button mobile-menu-trigger" aria-label={t('menu')} onClick={() => dispatch({ type: 'open', overlay: { kind: 'menu' } })}><Icon name="menu" /></button>
      </div>
    </header>
  </>;
}

export function MobileMenu() {
  const { dispatch, t } = useShop();
  const pathname = usePathname();
  const onStorefront = pathname === '/';
  const workspace = pathname.startsWith('/app');
  return <div className="mobile-menu">
    <p className="eyebrow">{t('maison')}</p>
    {!workspace && (['story', 'collection', 'atelier'] as const).map((id, index) => <Link key={id} href={onStorefront ? `#${id}` : `/#${id}`} onClick={(event) => {
      dispatch({ type: 'close' }); if (onStorefront) { event.preventDefault(); requestAnimationFrame(() => scrollToSection(id)); }
    }}><span>0{index + 1}</span>{t(id)}<Icon name="arrow-up-right" /></Link>)}
    {workspace && ([['/app/shop', 'collection'], ['/app/orders', 'myOrders'], ['/app/atelier', 'myAppointments'], ['/app/updates', 'myUpdates'], ['/app/settings', 'myDetails']] as const).map(([href, key]) => <Link key={href} href={href} onClick={() => dispatch({ type: 'close' })}>{t(key)}<Icon name="arrow-right" /></Link>)}
    <Link href="/app" onClick={() => dispatch({ type: 'close' })}><span>04</span>{t('myMaison')}<Icon name="user" /></Link>
    <div className="mobile-menu-preferences"><LanguageSwitch /><CurrencySelect /></div>
    <p className="muted">{t('madeBetween')}</p>
  </div>;
}
