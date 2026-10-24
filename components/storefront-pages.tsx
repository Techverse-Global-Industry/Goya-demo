'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useId, useState } from 'react';
import type { ReactNode } from 'react';
import { useShop } from '@/context/shop-context';
import { downloadInvoice } from '@/lib/browser';
import type { CultureStory } from '@/lib/culture-stories';
import { storefrontCopy } from '@/lib/storefront';
import type { Category, Localized, Order, ShoeType } from '@/lib/types';
import type { CatalogEdit } from '@/lib/catalog-edits';
import { GuestOrderLookup, OrdersAndReturns } from './after-sales';
import { Header } from './header';
import { Footer } from './editorial';
import { Overlays } from './overlays';
import { Toast } from './controls';
import { Collection, ProductCard } from './collection';
import { CartDrawer } from './cart';
import { Checkout } from './checkout';
import { Icon } from './icon';
import { OrderJourney } from './order-journey';

const copy = {
  en: {
    wishlistAccount: 'Sign in to keep your favourites across your devices.', wishlistGuest: 'Your guest wishlist is saved on this device.', signIn: 'Sign in / create an account', loading: 'Preparing your Maison…', bag: 'Shopping bag', checkout: 'Checkout', tracking: 'Track your order', trackingIntro: 'Enter your order reference and email to follow a demonstration order, or open the orders already linked to your account.', trackingGuest: 'You can also look up a guest order from another device using its reference and checkout email.', trackingAccount: 'View all my orders', orderSearch: 'Filter these orders', trackingEmpty: 'No orders are available here yet.', trackingEmptyText: 'Once you place a demonstration order, its progress will appear here.', trackingNoMatch: 'No matching order is available in this session.', refresh: 'Refresh progress', refreshing: 'Refreshing…', placed: 'Placed on', order: 'Order', progress: 'Demonstration progress', details: 'Order details', invoice: 'Download demo invoice', care: 'Need help with an order?', demo: 'Demonstration only. Delivery stages and payments are simulated.', readStory: 'Read the story', moreStories: 'Discover the Maison', explore: 'Explore the collection',
  },
  fr: {
    wishlistAccount: 'Connectez-vous pour retrouver vos envies sur tous vos appareils.', wishlistGuest: 'Votre liste d’envies invitée est enregistrée sur cet appareil.', signIn: 'Se connecter / créer un compte', loading: 'Préparation de votre Maison…', bag: 'Panier', checkout: 'Commander', tracking: 'Suivre votre commande', trackingIntro: 'Saisissez la référence et l’adresse e-mail de votre commande de démonstration, ou consultez celles de votre compte.', trackingGuest: 'Retrouvez aussi une commande invitée depuis un autre appareil avec sa référence et son adresse e-mail.', trackingAccount: 'Voir toutes mes commandes', orderSearch: 'Filtrer ces commandes', trackingEmpty: 'Aucune commande disponible pour le moment.', trackingEmptyText: 'Après votre commande de démonstration, sa progression apparaîtra ici.', trackingNoMatch: 'Aucune commande correspondante n’est disponible dans cette session.', refresh: 'Actualiser le suivi', refreshing: 'Actualisation…', placed: 'Commande du', order: 'Commande', progress: 'Progression de démonstration', details: 'Détails de la commande', invoice: 'Télécharger la facture de démonstration', care: 'Une question sur votre commande ?', demo: 'Démonstration uniquement. Livraison et paiements sont simulés.', readStory: 'Lire l’histoire', moreStories: 'Découvrir la Maison', explore: 'Explorer la collection',
  },
} as const;

export function StorefrontShell({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <><Header /><main id="public-content" className={`reference-storefront-page ${className}`}>{children}</main><Footer /><Overlays /><Toast /></>;
}

export function CatalogPage({ category = 'all', style = 'all', edit = 'collection', initialQuery, accessoryType, accessoryAudience, selection, heading, intro }: { category?: Category; style?: ShoeType; edit?: CatalogEdit; initialQuery?: string; accessoryType?:string; accessoryAudience?:'men'|'women'; selection?:readonly string[]; heading?:Localized; intro?:Localized }) {
  const { dispatch } = useShop();
  useEffect(() => {
    if (edit !== 'search') dispatch({ type: 'resetFilters' });
    else if (initialQuery !== undefined) dispatch({ type: 'query', query: initialQuery });
  }, [category, style, edit, initialQuery, accessoryType, accessoryAudience, selection, dispatch]);
  return <StorefrontShell className="reference-storefront-page--catalog"><Collection category={category} style={style} edit={edit} accessoryType={accessoryType} accessoryAudience={accessoryAudience} selection={selection} heading={heading} intro={intro} standalone /></StorefrontShell>;
}

export function WishlistPage() {
  const { state, products } = useShop();
  const c = copy[state.locale];
  const labels = storefrontCopy[state.locale];
  const saved = products.filter(product => product.published !== false && state.wishlist.includes(product.id));
  return <StorefrontShell className="reference-wishlist-page"><header className="reference-public-heading"><h1>{labels.wishlist}{saved.length > 0 && <sup>{saved.length}</sup>}</h1><p>{labels.wishlistIntro}</p>{!state.user && <div className="reference-wishlist-account"><p>{c.wishlistGuest} {c.wishlistAccount}</p><Link href="/login?next=%2Fwishlist">{c.signIn}<Icon name="arrow-right" width={16} /></Link></div>}</header>
    {!state.ready ? <p className="reference-public-loading" role="status">{c.loading}</p> : saved.length ? <div className="reference-plp-grid reference-wishlist-grid">{saved.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}</div> : <div className="reference-public-empty"><Icon name="heart" width={36} height={36} /><h2>{labels.emptyWishlist}</h2><Link href="/collections" className="reference-button">{c.explore}<Icon name="arrow-right" width={17} /></Link></div>}
  </StorefrontShell>;
}

export function BagPage() {
  const { state, dispatch } = useShop();
  const c = copy[state.locale];
  return <StorefrontShell className="reference-bag-page"><header className="reference-public-heading"><h1>{c.bag}</h1></header><div className="reference-bag-content">{!state.ready ? <p className="reference-public-loading" role="status">{c.loading}</p> : <CartDrawer fullPage close={() => dispatch({ type: 'close' })} />}</div></StorefrontShell>;
}

export function CheckoutPage() {
  const { state, dispatch } = useShop();
  return <StorefrontShell className="reference-checkout-page"><header className="reference-public-heading"><h1>{copy[state.locale].checkout}</h1></header><div className="reference-public-checkout"><Checkout fullPage close={() => dispatch({ type: 'close' })} /></div></StorefrontShell>;
}

function TrackedOrder({ order }: { order: Order }) {
  const { state, t, money, productById } = useShop();
  const c = copy[state.locale];
  return <article className="reference-tracked-order"><header><div><p>{c.order}</p><h2>{order.id}</h2><small>{c.placed} <time dateTime={order.createdAt}>{new Intl.DateTimeFormat(state.locale, { dateStyle: 'medium' }).format(new Date(order.createdAt))}</time></small></div><div><strong>{money(order.total, order.currency)}</strong><span>{t(order.status ?? 'confirmed')}</span></div></header><div className="reference-track-journey"><OrderJourney order={order} /></div><p className="reference-track-number"><span>{t('tracking')}</span><strong>{order.tracking ?? t('pickupTracking')}</strong></p><details><summary>{c.details}<Icon name="plus" width={17} /></summary><ul>{order.lines.map(line => <li key={`${line.productId}-${line.size}`}><div><p>{line.product?.name[state.locale] ?? productById.get(line.productId)?.name[state.locale] ?? line.productId}</p><small>{t('size')}: {line.size === 'OS' ? t('oneSize') : line.size} · ×{line.quantity}</small></div><span>{money(line.unitPrice * line.quantity, order.currency)}</span></li>)}</ul><div className="reference-track-totals"><p><span>{t('subtotal')}</span><span>{money(order.subtotal, order.currency)}</span></p><p><span>{t('shipping')}</span><span>{money(order.shipping, order.currency)}</span></p><p><strong>{t('total')}</strong><strong>{money(order.total, order.currency)}</strong></p></div><button type="button" className="reference-text-link" onClick={() => downloadInvoice(order, state.locale)}>{c.invoice}<Icon name="download" width={16} /></button></details></article>;
}

export function TrackOrderPage() {
  const { state, refresh } = useShop();
  const c = copy[state.locale];
  const id = useId();
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const normalized = query.trim().toLocaleLowerCase();
  // The API snapshot already restricts these orders to the current session cookie.
  // Searching this list never requests another customer's order by an arbitrary ID.
  const orders = state.orders.filter(order => !normalized || `${order.id} ${order.tracking ?? ''}`.toLocaleLowerCase().includes(normalized));
  const update = async () => { if (busy) return; setBusy(true); try { await refresh(true); } finally { setBusy(false); } };
  return <StorefrontShell className="reference-track-page"><header className="reference-public-heading"><h1>{c.tracking}</h1><p>{c.trackingIntro}</p>{!state.user && <small>{c.trackingGuest}</small>}{state.user && <Link className="reference-text-link" href="/app/orders">{c.trackingAccount}<Icon name="arrow-right" width={16} /></Link>}</header>
    <section className="reference-track-content" aria-label={c.progress}><GuestOrderLookup />{state.orders.length > 0 && <div className="reference-track-controls"><label htmlFor={id}><Icon name="search" width={18} /><span className="sr-only">{c.orderSearch}</span><input id={id} type="search" placeholder={c.orderSearch} value={query} onChange={event => setQuery(event.target.value)} /></label><button type="button" className="reference-text-link" disabled={busy} onClick={() => void update()}>{busy ? c.refreshing : c.refresh}<Icon name="arrow-right" width={16} /></button></div>}
      {!state.ready ? <p className="reference-public-loading" role="status">{c.loading}</p> : orders.length ? orders.map(order => <TrackedOrder key={order.id} order={order} />) : <div className="reference-public-empty"><Icon name="truck" width={36} height={36} /><h2 role="status">{state.orders.length ? c.trackingNoMatch : c.trackingEmpty}</h2>{!state.orders.length && <><p>{c.trackingEmptyText}</p><Link href="/collections" className="reference-button">{c.explore}<Icon name="arrow-right" width={17} /></Link></>}</div>}
      <p className="reference-tracking-demo">{c.demo}</p><Link className="reference-text-link" href="/customer-service">{c.care}<Icon name="arrow-right" width={16} /></Link>
      <OrdersAndReturns />
    </section>
  </StorefrontShell>;
}

export function CultureStoryPage({ story }: { story: CultureStory }) {
  const { state } = useShop();
  const c = copy[state.locale];
  return <StorefrontShell className="reference-culture-page"><article><header className="brand-maison-opening"><div className="brand-maison-photo"><Image src={story.image} alt={story.alt[state.locale]} fill preload sizes="(min-width:700px) 50vw,100vw" className="object-cover" /></div><div className="brand-maison-copy"><span className="fashion-kicker">{story.kicker[state.locale]}</span><h1>{story.title[state.locale]}</h1><p>{story.intro[state.locale]}</p><a href="#culture-story" className="fashion-link">{c.readStory}<Icon name="arrow-right" width={17} /></a></div></header><section id="culture-story" className="reference-culture-body"><p className="fashion-kicker">MAISON GOYA</p>{story.paragraphs.map((paragraph, index) => <p key={index}>{paragraph[state.locale]}</p>)}{story.source && <a className="reference-story-source reference-text-link" href={story.source.url} target="_blank" rel="noreferrer">{story.source.label[state.locale]}<Icon name="arrow-up-right" width={16} /></a>}<div><Link href="/journal" className="reference-text-link">{c.moreStories}<Icon name="arrow-right" width={16} /></Link><Link href="/collections" className="reference-text-link">{c.explore}<Icon name="arrow-right" width={16} /></Link></div></section></article></StorefrontShell>;
}
