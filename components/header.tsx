'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useShop } from '@/context/shop-context';
import { fashionCopy, shoeCategories } from '@/lib/fashion-copy';
import { presentationCopy } from '@/lib/presentation-copy';
import type { Category } from '@/lib/types';
import { CurrencySelect, LanguageSwitch } from './controls';
import { Icon } from './icon';

export function Header({ workspace = false }: { workspace?: boolean }) {
  const { state, dispatch, t, itemCount } = useShop();
  const pathname = usePathname();
  const copy = fashionCopy[state.locale];
  const onHome = pathname === '/';
  const header = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState<'men' | 'women' | null>(null);
  useEffect(() => {
    if (!onHome) return;
    const update = () => setScrolled(window.scrollY > 35);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [onHome]);
  const choose = (filter: Category, query = '') => { dispatch({ type: 'filter', filter }); dispatch({ type: 'query', query }); setMenu(null); };
  const anchor = (id: string) => onHome ? `#${id}` : `/#${id}`;
  return <>
    <a className="skip-link" href={onHome ? '#collection' : '#account-content'}>{t(onHome ? 'skip' : 'myMaison')}</a>
    <header ref={header} className={`site-header fashion-header ${workspace ? 'site-header--app' : ''} ${onHome && !scrolled && !menu ? 'fashion-header--over-film' : ''}`} data-ready={state.ready} onMouseLeave={() => setMenu(null)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setMenu(null); }} onKeyDown={event => { if (event.key === 'Escape' && menu) { header.current?.querySelector<HTMLButtonElement>('[aria-expanded="true"]')?.focus(); setMenu(null); } }}>
      <div className="fashion-navigation">
        <Link className="wordmark" href={workspace ? '/app' : '/'} aria-label="Maison Goya" onClick={() => { setMenu(null); dispatch({ type: 'close' }); }}><span>Goya</span></Link>
        <nav className="desktop-nav" aria-label={t('menu')}>
          {workspace ? <><Link href="/app/shop" aria-current={pathname === '/app/shop' ? 'page' : undefined}>{t('collection')}</Link><Link href="/app/orders" aria-current={pathname === '/app/orders' ? 'page' : undefined}>{t('myOrders')}</Link><Link href="/app/atelier" aria-current={pathname === '/app/atelier' ? 'page' : undefined}>{copy.care}</Link></> : <>
            <Link href={anchor('collection')} onMouseEnter={() => setMenu(null)}>{copy.new}</Link>
            {(['men', 'women'] as const).map(category => <button type="button" key={category} aria-expanded={menu === category} aria-controls="collection-menu" onMouseEnter={() => setMenu(category)} onClick={() => setMenu(category)}>{copy[category]}</button>)}
            <Link href="/app/shop" onMouseEnter={() => setMenu(null)} onClick={() => choose('accessories')}>{copy.accessories}</Link>
            <Link href={anchor('maison')} onMouseEnter={() => setMenu(null)}>{copy.maison}</Link>
            <Link href={anchor('atelier')} onMouseEnter={() => setMenu(null)}>{copy.care}</Link>
          </>}
        </nav>
        <div className="header-actions">
          {workspace && <div className="header-currency"><CurrencySelect /></div>}
          <div className="header-language"><LanguageSwitch /></div>
          {workspace ? <button type="button" className="icon-button" aria-label={t('search')} onClick={() => dispatch({ type: 'open', overlay: { kind: 'search' } })}><Icon name="search" /></button> : <Link href="/app/shop" className="icon-button" aria-label={t('search')} onClick={() => choose('all')}><Icon name="search" /></Link>}
          <Link href={workspace ? '/app/settings' : '/app'} className={`icon-button profile-button ${state.user ? 'is-member' : ''}`} aria-label={t('account')} onClick={() => dispatch({ type: 'close' })}><Icon name="user" />{state.user && <span className="member-dot" />}</Link>
          {workspace && <button type="button" className="icon-button cart-trigger" data-cart-trigger aria-label={`${t('cart')} (${itemCount})`} onClick={() => dispatch({ type: 'open', overlay: { kind: 'cart' } })}><Icon name="bag" /><span className="cart-badge" aria-hidden="true">{itemCount}</span></button>}
          <button type="button" className="icon-button mobile-menu-trigger" aria-label={t('menu')} onClick={() => dispatch({ type: 'open', overlay: { kind: 'menu' } })}><Icon name="menu" /></button>
        </div>
      </div>
      {!workspace && <div id="collection-menu" className="fashion-mega-menu" hidden={!menu}>
        {menu && <><div className="mega-intro"><span className="fashion-kicker">MAISON GOYA</span><h2>{copy[menu]}</h2><Link href="/app/shop" className="fashion-link" onClick={() => choose(menu)}>{copy.all}</Link></div><div className="mega-categories">{shoeCategories.filter(category => category.filter === menu).map(category => <Link key={category.id} href="/app/shop" onClick={() => choose(category.filter, category.query)}><div><Image src={category.image} alt="" fill sizes="25vw" style={{ objectPosition: category.position }} /></div><span>{category.label[state.locale]}</span></Link>)}</div></>}
      </div>}
    </header>
  </>;
}

export function MobileMenu() {
  const { state, dispatch, t } = useShop();
  const workspace = usePathname().startsWith('/app');
  const copy = fashionCopy[state.locale];
  const close = () => dispatch({ type: 'close' });
  const choose = (filter: Category) => { dispatch({ type: 'filter', filter }); dispatch({ type: 'query', query: '' }); close(); };
  return <div className="mobile-menu fashion-mobile-menu">
    <p className="fashion-kicker">MAISON GOYA</p>
    {workspace ? ([['/app/shop', 'collection'], ['/app/orders', 'myOrders'], ['/app/atelier', 'myAppointments'], ['/app/updates', 'myUpdates'], ['/app/settings', 'myDetails']] as const).map(([href, key]) => <Link key={href} href={href} onClick={close}>{t(key)}<Icon name="arrow-right" /></Link>) : <>
      <Link href="/#collection" onClick={close}>{copy.new}<Icon name="arrow-right" /></Link>
      {(['men', 'women', 'accessories'] as const).map(filter => <Link key={filter} href="/app/shop" onClick={() => choose(filter)}>{copy[filter]}<Icon name="arrow-right" /></Link>)}
      <Link href="/#maison" onClick={close}>{copy.maison}<Icon name="arrow-right" /></Link>
      <Link href="/#atelier" onClick={close}>{copy.care}<Icon name="arrow-right" /></Link>
    </>}
    <Link href="/app" onClick={close}>{presentationCopy[state.locale].member}<Icon name="user" /></Link>
    <div className="mobile-menu-preferences"><LanguageSwitch />{workspace && <CurrencySelect />}</div>
    <p className="muted">{presentationCopy[state.locale].invitation}</p>
  </div>;
}
