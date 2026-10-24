'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useShop } from '@/context/shop-context';
import { storefrontCopy } from '@/lib/storefront';
import { navigationGroups } from '@/lib/navigation';
import type { MainMenu } from '@/lib/navigation';
import { SHIPPING_THRESHOLD } from '@/lib/commerce';
import { Icon } from './icon';

type Menu = MainMenu;

export function Header({ workspace = false }: { workspace?: boolean }) {
  const { state, dispatch, t, itemCount, money } = useShop();
  const pathname = usePathname();
  const copy = storefrontCopy[state.locale];
  const home = pathname === '/';
  const header = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState<Menu | null>(null);
  const [hint, setHint] = useState(0);
  const [accountTip, setAccountTip] = useState(false);
  const suggestions = [copy.editMen, copy.editWomen, copy.editSneakers];
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 40);
    update(); window.addEventListener('scroll', update, { passive: true });
    const timer = window.setInterval(() => setHint(value => (value + 1) % 3), 4500);
    return () => { window.removeEventListener('scroll', update); window.clearInterval(timer); };
  }, []);
  const open = (kind: 'search' | 'cart' | 'menu') => { setMenu(null); setAccountTip(false); dispatch({ type: 'open', overlay: { kind } }); };
  const links: { id: Menu; name: string; href: string }[] = [
    { id: 'new', name: copy.newArrivals, href: '/new-arrivals' }, { id: 'men', name: copy.man, href: '/men' }, { id: 'women', name: copy.woman, href: '/women' },
    { id: 'accessories', name: copy.accessories, href: '/accessories' }, { id: 'gifts', name: copy.gifts, href: '/gifts' }, { id: 'personalization', name: copy.personalization, href: '/personalization' }, { id: 'culture', name: copy.culture, href: '/maison' },
  ];
  const close = () => { setMenu(null); dispatch({ type: 'close' }); };
  return <>
    <a className="skip-link" href={workspace || pathname === '/login' ? '#account-content' : '#public-content'}>{t('skip')}</a>
    <header ref={header} className={`site-header reference-header ${scrolled ? 'reference-header--compact' : ''} ${home && !scrolled && !menu ? 'reference-header--over-film' : ''} ${home && !scrolled ? 'reference-header--searchbar' : ''}`} data-ready={state.ready} data-menu-open={!!menu} onMouseLeave={() => setMenu(null)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setMenu(null); }} onKeyDown={event => { if (event.key === 'Escape') { header.current?.querySelector<HTMLElement>('[aria-expanded="true"]')?.focus(); setMenu(null); setAccountTip(false); } }}>
      {!scrolled && <Link href="/shipping-returns" className="reference-promotion">{state.locale === 'fr' ? `LIVRAISON OFFERTE DÈS ${money(SHIPPING_THRESHOLD[state.currency])} · RETOURS ACCOMPAGNÉS` : `COMPLIMENTARY SHIPPING OVER ${money(SHIPPING_THRESHOLD[state.currency])} · RETURNS WITH CARE`}</Link>}
      <div className="reference-navigation">
        <Link className="wordmark" href="/" aria-label="Maison Goya" onClick={close}><span>Goya</span></Link>
        <nav className="reference-desktop-nav" aria-label={t('menu')}>
          {links.map(link => <div className="reference-nav-item" key={link.id} onMouseEnter={() => setMenu(link.id)}>
            <Link href={link.href} aria-current={pathname === link.href ? 'page' : undefined} onClick={() => setMenu(null)}>{link.name}</Link>
            <button type="button" aria-label={`${copy.viewAll} — ${link.name}`} aria-expanded={menu === link.id} aria-controls="reference-mega-menu" onClick={() => setMenu(value => value === link.id ? null : link.id)}><Icon name="chevron" width={10} /></button>
          </div>)}
        </nav>
        <div className="header-actions">
          <button className="icon-button reference-search-trigger" type="button" aria-label={t('search')} onClick={() => open('search')}><Icon name="search-spark" /></button>
          <Link className="icon-button reference-wishlist-trigger" href="/wishlist" aria-label={`${copy.wishlist}${state.wishlist.length ? ` (${state.wishlist.length})` : ''}`} onClick={close}><Icon name="heart" />{state.wishlist.length > 0 && <span className="reference-action-count">{state.wishlist.length}</span>}</Link>
          <div className="reference-account-action" onMouseEnter={() => setAccountTip(true)} onMouseLeave={() => setAccountTip(false)} onFocus={() => setAccountTip(true)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setAccountTip(false); }}>
            <Link className="icon-button profile-button" href={state.user ? '/app' : '/login'} aria-label={t('account')} onClick={close}><Icon name="user" /></Link>
            {accountTip && !state.user && <div className="reference-account-tooltip"><span><Link href="/login">{copy.signIn}</Link> {state.locale === 'fr' ? 'ou' : 'or'} <Link href="/login?mode=register">{copy.register.toLowerCase()}</Link> {state.locale === 'fr' ? 'pour une expérience personnalisée' : 'for a personalised experience'}</span><button type="button" aria-label={t('close')} onClick={() => setAccountTip(false)}><Icon name="close" width={14} /></button></div>}
          </div>
          <button type="button" className="icon-button cart-trigger" data-cart-trigger aria-label={`${t('cart')} (${itemCount})`} onClick={() => open('cart')}><Icon name="bag" />{itemCount > 0 && <span className="reference-action-count">{itemCount}</span>}</button>
          <button type="button" className="icon-button mobile-menu-trigger" aria-label={t('menu')} onClick={() => open('menu')}><Icon name="menu" /></button>
        </div>
      </div>
      {home && !scrolled && <button type="button" className="reference-inline-search" aria-label={t('search')} onClick={() => open('search')}><Icon name="search-spark" width={25} /><span key={`${state.locale}-${hint}`}>{suggestions[hint]}<i aria-hidden="true" /></span></button>}
      {menu && <div id="reference-mega-menu" className="reference-mega-menu"><MegaMenu menu={menu} close={() => setMenu(null)} /></div>}
    </header>
  </>;
}

function MegaMenu({ menu, close }: { menu: Menu; close: () => void }) {
  const { state } = useShop(); const copy = storefrontCopy[state.locale];
  const groups = navigationGroups(menu, state.locale);
  const campaigns = menu === 'men' ? [{ src: '/images/campaign/goya-movement-men.webp', label: copy.loafers, href: '/men/loafers' }, { src: '/images/campaign/goya-sneakers.webp', label: copy.sneakers, href: '/men/sneakers' }]
    : menu === 'accessories' ? [{ src: '/images/archive/goya-20.jpg', label: copy.man, href: '/accessories?audience=men' }, { src: '/images/archive/goya-08.jpg', label: copy.woman, href: '/accessories?audience=women' }]
    : menu === 'culture' || menu === 'personalization' ? [{ src: '/images/img1.jpg', label: copy.craft, href: '/craftsmanship' }, { src: '/images/campaign/goya-movement-men.webp', label: copy.signature, href: '/personalization' }]
    : menu === 'gifts' ? [{ src: '/images/archive/goya-18.jpg', label: copy.forHim, href: '/gifts/men' }, { src: '/images/archive/goya-21.jpg', label: copy.forHer, href: '/gifts/women' }]
    : menu === 'new' ? [{ src: '/images/archive/goya-07.jpg', label: copy.man, href: '/new-arrivals/men' }, { src: '/images/archive/goya-11.jpg', label: copy.woman, href: '/new-arrivals/women' }]
    : [{ src: '/images/campaign/goya-movement-women.webp', label: copy.heels, href: '/women/heels' }, { src: '/images/campaign/goya-boots.webp', label: copy.boots, href: '/women/boots' }];
  return <div className="reference-mega-inner">
    <div className="reference-mega-columns">
      {groups.map(group => <div key={group.title}><Link href={group.href} className="reference-mega-title" onClick={close}>{group.title}</Link>{group.items.map(item => <Link key={`${item.href}-${item.label}`} href={item.href} onClick={close}>{item.label}</Link>)}<Link href={group.href} onClick={close}>{copy.viewAll}</Link></div>)}
    </div>
    <div className="reference-mega-images">{campaigns.map(image => <Link key={image.label} href={image.href} onClick={close}><div><Image src={image.src} alt={image.label} fill sizes="25vw" className="object-cover" /></div><span>{image.label}</span></Link>)}</div>
  </div>;
}

export function MobileMenu() {
  const { state, dispatch, t } = useShop(); const copy = storefrontCopy[state.locale];
  const [active, setActive] = useState<Menu | null>(null);
  const [groupIndex, setGroupIndex] = useState<number | null>(null);
  const close = () => dispatch({ type: 'close' });
  const items: { id: Menu; label: string; href: string }[] = [{ id: 'new', label: copy.newArrivals, href: '/new-arrivals' }, { id: 'men', label: copy.man, href: '/men' }, { id: 'women', label: copy.woman, href: '/women' }, { id: 'accessories', label: copy.accessories, href: '/accessories' }, { id: 'gifts', label: copy.gifts, href: '/gifts' }, { id: 'personalization', label: copy.personalization, href: '/personalization' }, { id: 'culture', label: copy.culture, href: '/maison' }];
  const groups = active ? navigationGroups(active, state.locale) : [];
  const selected = groupIndex === null ? null : groups[groupIndex];
  return <div className="reference-mobile-menu">
    {active ? <><button type="button" className="reference-mobile-back" onClick={() => { if (groupIndex !== null && groups.length > 1) setGroupIndex(null); else { setActive(null); setGroupIndex(null); } }}><Icon name="arrow-left" />{selected?.title ?? items.find(item => item.id === active)?.label}</button><nav aria-label={items.find(item => item.id === active)?.label}>{selected ? <><div><Link href={selected.href} onClick={close}>{copy.viewAll}</Link></div>{selected.items.map(item => <div key={item.href}><Link href={item.href} onClick={close}>{item.label}</Link><Icon name="arrow-up-right" width={15} /></div>)}</> : groups.map((group,index) => <div key={group.title}><Link href={group.href} onClick={close}>{group.title}</Link><button type="button" aria-label={`${copy.viewAll} — ${group.title}`} onClick={() => setGroupIndex(index)}><Icon name="chevron-right" /></button></div>)}</nav></> : <>
      <nav aria-label={t('menu')}>{items.map(item => <div key={item.id}><Link href={item.href} onClick={close}>{item.label}</Link><button type="button" aria-label={`${copy.viewAll} — ${item.label}`} onClick={() => { setActive(item.id); setGroupIndex(navigationGroups(item.id,state.locale).length === 1 ? 0 : null); }}><Icon name="chevron-right" /></button></div>)}</nav>
      <div className="reference-mobile-utilities"><Link href="/wishlist" onClick={close}><Icon name="heart" />{copy.wishlist}</Link><Link href={state.user ? '/app' : '/login'} onClick={close}><Icon name="user" />{state.user ? copy.account : copy.signIn}</Link><Link href="/customer-service" onClick={close}>{copy.customerCare}</Link><Link href="/stores" onClick={close}>{copy.stores}</Link><button type="button" onClick={() => dispatch({ type: 'open', overlay: { kind: 'region' } })}><Icon name="globe" />{state.locale === 'fr' ? 'Français' : 'English'} / {state.currency}</button></div>
    </>}
  </div>;
}
