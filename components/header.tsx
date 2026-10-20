'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useShop } from '@/context/shop-context';
import { presentationCopy } from '@/lib/presentation-copy';
import { CurrencySelect, LanguageSwitch } from './controls';
import { Icon } from './icon';

export function Header({ workspace = false }: { workspace?: boolean }) {
  const { state, dispatch, t, itemCount } = useShop();
  const pathname = usePathname();
  const copy = presentationCopy[state.locale];
  const onHome = pathname === '/';
  return <>
    <a className="skip-link" href={onHome ? '#collection' : '#account-content'}>{t(onHome ? 'skip' : 'myMaison')}</a>
    <header className={`site-header ${workspace ? 'site-header--app' : ''}`} data-ready={state.ready}>
      <div className="maison-announcement"><span>{copy.invitation}</span><span>COTONOU · PARIS · DAKAR</span></div>
      <div className="maison-navigation">
        <button type="button" className="icon-button mobile-menu-trigger" aria-label={t('menu')} onClick={() => dispatch({ type: 'open', overlay: { kind: 'menu' } })}><Icon name="menu" /></button>
        <nav className="desktop-nav" aria-label={t('menu')}>
          {workspace ? <><Link href="/app/shop" aria-current={pathname === '/app/shop' ? 'page' : undefined}>{t('collection')}</Link><Link href="/app/orders" aria-current={pathname === '/app/orders' ? 'page' : undefined}>{t('myOrders')}</Link><Link href="/app/atelier" aria-current={pathname === '/app/atelier' ? 'page' : undefined}>{copy.care}</Link></> : <><Link href={onHome ? '#collection' : '/#collection'}>{copy.collections}</Link><Link href={onHome ? '#maison' : '/#maison'}>{copy.maison}</Link><Link href={onHome ? '#atelier' : '/#atelier'}>{copy.care}</Link></>}
        </nav>
        <Link className="wordmark" href={workspace ? '/app' : '/'} aria-label="Maison Goya" onClick={() => dispatch({ type: 'close' })}><span>Goya</span><small>MAISON GOYA</small></Link>
        <div className="header-actions">
          {workspace && <div className="header-currency"><CurrencySelect /></div>}
          <div className="header-language"><LanguageSwitch /></div>
          {workspace && <button type="button" className="icon-button" aria-label={t('search')} onClick={() => dispatch({ type: 'open', overlay: { kind: 'search' } })}><Icon name="search" /></button>}
          <Link href={workspace ? '/app/settings' : '/app'} className={`icon-button profile-button ${!workspace ? 'public-signin' : ''} ${state.user ? 'is-member' : ''}`} aria-label={t('account')} onClick={() => dispatch({ type: 'close' })}><Icon name="user" />{!workspace && <span className="public-signin-label">{state.user ? copy.member : t('login')}</span>}{state.user && <span className="member-dot" />}</Link>
          {workspace && <button type="button" className="icon-button cart-trigger" data-cart-trigger aria-label={`${t('cart')} (${itemCount})`} onClick={() => dispatch({ type: 'open', overlay: { kind: 'cart' } })}><Icon name="bag" /><span className="cart-badge" aria-hidden="true">{itemCount}</span></button>}
        </div>
      </div>
    </header>
  </>;
}

export function MobileMenu() {
  const { state, dispatch, t } = useShop();
  const workspace = usePathname().startsWith('/app');
  const copy = presentationCopy[state.locale];
  const close = () => dispatch({ type: 'close' });
  return <div className="mobile-menu">
    <p className="eyebrow">MAISON GOYA / {copy.chapter}</p>
    {workspace ? ([['/app/shop', 'collection'], ['/app/orders', 'myOrders'], ['/app/atelier', 'myAppointments'], ['/app/updates', 'myUpdates'], ['/app/settings', 'myDetails']] as const).map(([href, key], index) => <Link key={href} href={href} onClick={close}><span>0{index + 1}</span>{t(key)}<Icon name="arrow-up-right" /></Link>) : <><Link href="/#collection" onClick={close}><span>01</span>{copy.collections}<Icon name="arrow-up-right" /></Link><Link href="/#maison" onClick={close}><span>02</span>{copy.maison}<Icon name="arrow-up-right" /></Link><Link href="/#atelier" onClick={close}><span>03</span>{copy.care}<Icon name="arrow-up-right" /></Link></>}
    <Link href="/app" onClick={close}><span>MG</span>{copy.member}<Icon name="user" /></Link>
    <div className="mobile-menu-preferences"><LanguageSwitch />{workspace && <CurrencySelect />}</div><p className="muted">{copy.invitation}</p>
  </div>;
}
