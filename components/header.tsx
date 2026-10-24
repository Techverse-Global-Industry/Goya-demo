'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useShop } from '@/context/shop-context';
import { catalogPath, storefrontCopy } from '@/lib/storefront';
import { Icon } from './icon';

type Menu = 'new' | 'men' | 'women' | 'accessories' | 'gifts' | 'personalization' | 'culture';

export function Header({ workspace = false }: { workspace?: boolean }) {
  const { state, dispatch, t, itemCount } = useShop();
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
    <header ref={header} className={`site-header reference-header ${home && !scrolled && !menu ? 'reference-header--over-film' : ''} ${home && !scrolled ? 'reference-header--searchbar' : ''}`} data-ready={state.ready} onMouseLeave={() => setMenu(null)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setMenu(null); }} onKeyDown={event => { if (event.key === 'Escape') { header.current?.querySelector<HTMLElement>('[aria-expanded="true"]')?.focus(); setMenu(null); setAccountTip(false); } }}>
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
  const audiences = menu === 'men' || menu === 'women' ? [menu] as const : ['men', 'women'] as const;
  return <div className="reference-mega-inner">
    <div className="reference-mega-columns">
      {menu === 'accessories' ? <div><Link href="/accessories" className="reference-mega-title" onClick={close}>{copy.accessories}</Link><Link href="/accessories" onClick={close}>{state.locale === 'fr' ? 'Sacs' : 'Bags'}</Link><Link href="/gifts/accessories" onClick={close}>{copy.gifts}</Link><Link href="/accessories" onClick={close}>{copy.viewAll}</Link></div> : menu === 'culture' ? <div><Link href="/maison" onClick={close}>{copy.maison}</Link><Link href="/culture/l-heritage-croise" onClick={close}>{copy.signature}</Link><Link href="/culture/le-geste-du-soin" onClick={close}>{copy.craft}</Link><Link href="/shoe-care" onClick={close}>{copy.care}</Link><Link href="/stores" onClick={close}>{copy.stores}</Link></div> : menu === 'personalization' ? <div><Link href="/personalization" onClick={close}>{copy.personalization}</Link><Link href="/personalization" onClick={close}>{state.locale === 'fr' ? 'Votre signature personnelle' : 'Your personal signature'}</Link><Link href="/shoe-care" onClick={close}>{copy.appointment}</Link></div> : audiences.map(audience => <div key={audience}>
        <Link href={menu === 'gifts' ? `/gifts/${audience}` : menu === 'new' ? `/new-arrivals/${audience}` : catalogPath(audience)} className="reference-mega-title" onClick={close}>{menu === 'gifts' ? audience === 'men' ? copy.forHim : copy.forHer : menu === 'new' ? `${audience === 'men' ? copy.man : copy.woman} — ${copy.newArrivals}` : copy.shoes}</Link>
        {(audience === 'men' ? ['loafers', 'sneakers'] : ['heels', 'boots']).map(style => <Link key={style} href={catalogPath(audience, style)} onClick={close}>{copy[style as 'loafers' | 'sneakers' | 'heels' | 'boots']}</Link>)}
        <Link href={catalogPath(audience)} onClick={close}>{copy.viewAll}</Link>
      </div>)}
      {!['culture', 'personalization', 'accessories'].includes(menu) && <div><Link href="/accessories" className="reference-mega-title" onClick={close}>{copy.accessories}</Link><Link href="/gifts" onClick={close}>{copy.gifts}</Link><Link href="/personalization" onClick={close}>{copy.personalization}</Link><Link href="/shoe-care" onClick={close}>{copy.care}</Link></div>}
    </div>
    <div className="reference-mega-images">{(menu === 'men' ? [{ src: '/images/campaign/goya-movement-men.webp', label: copy.loafers, href: '/men/loafers' }, { src: '/images/campaign/goya-sneakers.webp', label: copy.sneakers, href: '/men/sneakers' }] : menu === 'culture' || menu === 'personalization' ? [{ src: '/images/img1.jpg', label: copy.craft, href: '/maison' }, { src: '/images/campaign/goya-movement-men.webp', label: copy.signature, href: '/personalization' }] : [{ src: '/images/campaign/goya-movement-women.webp', label: copy.heels, href: '/women/heels' }, { src: '/images/campaign/goya-boots.webp', label: copy.boots, href: '/women/boots' }]).map(image => <Link key={image.label} href={image.href} onClick={close}><div><Image src={image.src} alt={image.label} fill sizes="25vw" className="object-cover" /></div><span>{image.label}</span></Link>)}</div>
  </div>;
}

export function MobileMenu() {
  const { state, dispatch, t } = useShop(); const copy = storefrontCopy[state.locale];
  const [active, setActive] = useState<Menu | null>(null);
  const close = () => dispatch({ type: 'close' });
  const items: { id: Menu; label: string; href: string }[] = [{ id: 'new', label: copy.newArrivals, href: '/new-arrivals' }, { id: 'men', label: copy.man, href: '/men' }, { id: 'women', label: copy.woman, href: '/women' }, { id: 'accessories', label: copy.accessories, href: '/accessories' }, { id: 'gifts', label: copy.gifts, href: '/gifts' }, { id: 'personalization', label: copy.personalization, href: '/personalization' }, { id: 'culture', label: copy.culture, href: '/maison' }];
  return <div className="reference-mobile-menu">
    {active ? <><button type="button" className="reference-mobile-back" onClick={() => setActive(null)}><Icon name="arrow-left" />{items.find(item => item.id === active)?.label}</button><Link href={items.find(item => item.id === active)!.href} onClick={close}>{copy.viewAll}</Link><MegaMenu menu={active} close={close} /></> : <>
      <nav aria-label={t('menu')}>{items.map(item => <div key={item.id}><Link href={item.href} onClick={close}>{item.label}</Link><button type="button" aria-label={`${copy.viewAll} — ${item.label}`} onClick={() => setActive(item.id)}><Icon name="chevron-right" /></button></div>)}</nav>
      <div className="reference-mobile-utilities"><Link href="/wishlist" onClick={close}><Icon name="heart" />{copy.wishlist}</Link><Link href={state.user ? '/app' : '/login'} onClick={close}><Icon name="user" />{state.user ? copy.account : copy.signIn}</Link><Link href="/customer-service" onClick={close}>{copy.customerCare}</Link><Link href="/stores" onClick={close}>{copy.stores}</Link><button type="button" onClick={() => dispatch({ type: 'open', overlay: { kind: 'region' } })}><Icon name="globe" />{state.locale === 'fr' ? 'Français' : 'English'} / {state.currency}</button></div>
    </>}
  </div>;
}
