'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { useShop } from '@/context/shop-context';
import { useRouter } from 'next/navigation';
import { Collection, WishlistContent } from '@/components/collection';
import { Header } from '@/components/header';
import { Footer } from '@/components/editorial';
import { Overlays } from '@/components/overlays';
import { Toast } from '@/components/controls';
import { Icon } from '@/components/icon';
import type { IconName } from '@/components/icon';
import { MaisonImage } from '@/components/maison-image';
import { GoyaWordmark } from '@/components/goya-wordmark';
import { DeviceSettings } from '@/components/pwa';
import { AddressBook } from '@/components/account-preferences';
import { AccountProfile } from '@/components/account-profile';
import { CustomerRequests, OrdersAndReturns } from '@/components/after-sales';
import { OrderJourney } from '@/components/order-journey';
import { OrderPromotion } from './order-promotion';
import { downloadInvoice } from '@/lib/browser';
import { formatDate } from '@/lib/commerce';
import { localizedText, marketName } from '@/lib/international';
import { accountReferenceCopy } from '@/lib/account-reference-copy';
import { shopRequest } from '@/lib/api';
import type { Order } from '@/lib/types';

export type Section = 'collection' | 'accountOverview' | 'myOrders' | 'myAppointments' | 'myUpdates' | 'myDetails' | 'addresses' | 'wishlist';
export const customerPaths: Record<Section, string> = { collection: '/app/shop', accountOverview: '/app', myOrders: '/app/orders', myAppointments: '/app/atelier', myUpdates: '/app/updates', myDetails: '/app/settings', addresses: '/app/addresses', wishlist: '/app/wishlist' };

export default function CustomerWorkspace({ section }: { section: Section }) {
  const router = useRouter();
  const { state, t, dispatch, refresh } = useShop();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const user = state.user;
  const userId = user?.id;
  const c = accountReferenceCopy[state.language];
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [userId, section]);
  useEffect(() => { if (state.ready && !user) router.replace('/login?next=' + encodeURIComponent(customerPaths[section])); }, [state.ready, user, router, section]);
  const orders = state.orders.filter((order) => order.customerId === user?.id);
  const bookings = state.bookings.filter((booking) => booking.customerId === user?.id);
  const unread = state.notifications.filter((notice) => !notice.read).length;
  const firstName = user?.name.split(' ')[0] ?? '';
  const headings: Record<Section, string> = { collection: c.collection, accountOverview: c.area, myOrders: c.orders, myAppointments: c.appointments, myUpdates: c.updates, myDetails: c.personal, addresses: c.addresses, wishlist: c.wishlist };
  const navigation: { section: Section; label: string }[] = [
    { section: 'accountOverview', label: c.summary }, { section: 'myOrders', label: c.orders },
    { section: 'myDetails', label: c.personal }, { section: 'addresses', label: c.addresses }, { section: 'wishlist', label: c.wishlist },
  ];

  const logout = async () => {
    setBusy(true); setError('');
    try { await shopRequest('logout'); dispatch({ type: 'signOut' }); await refresh(true); router.replace('/login'); }
    catch { setError(t('requestFailed')); }
    finally { setBusy(false); }
  };

  return <>
    <Header workspace />
    <main id="account-content" className="exact-personal-account" tabIndex={-1}>
      {!state.ready || !user ? <div className="account-loading" role="status"><span className="account-loading-mark"><GoyaWordmark /></span><p>{t('accountLoading')}</p></div> : <div id="public-content" className="exact-personal-wrap">
        <header className="exact-personal-heading">
          {section === 'accountOverview' && <p>{c.welcome} <span translate="no" data-personal-data="">{firstName}</span></p>}
          <h1>{headings[section]}</h1>
        </header>
        <div className="exact-personal-grid">
          <aside className="exact-personal-sidebar">
            <nav aria-label={c.accountNav}>{navigation.map(item => <Link key={item.section} href={customerPaths[item.section]} aria-current={section === item.section ? 'page' : undefined}>{item.label}</Link>)}</nav>
            <button className="exact-personal-logout" type="button" onClick={logout} disabled={busy}>{c.logout}</button>
          </aside>
          <div className={'exact-personal-content' + (section === 'accountOverview' ? ' exact-personal-content--summary' : '')} data-account-section={section}>
            {error && <p className="account-feedback is-error" role="alert">{error}</p>}
            {section === 'collection' && <Collection />}
            {section === 'accountOverview' && <div className="exact-personal-summary">
              <SummaryCard href="/app/orders" title={c.orders} intro={c.orderIntro} />
              <SummaryCard href="/app/settings" title={c.personal} intro={c.personalIntro}><p className="exact-personal-email" translate="no" data-personal-data=""><Icon name="mail" width={13} />{user.email}</p></SummaryCard>
              <SummaryCard href="/app/addresses" title={c.addresses} intro={c.addressIntro} />
              <SummaryCard href="/app/wishlist" title={c.wishlist} intro={c.wishlistIntro} />
            </div>}
            {section === 'myOrders' && <>
              {orders.length ? <div className="account-orders-list">{orders.map((order) => <CustomerOrder key={order.id} order={order} />)}</div> : <div className="exact-personal-no-orders"><p>{c.noOrders}</p><Link className="reference-button" href="/collections">{c.shopping}</Link></div>}
              <OrdersAndReturns />
              <section className="exact-personal-services"><h2>{c.services}</h2><nav aria-label={c.services}><Link href="/app/atelier">{c.appointments}<Icon name="chevron-right" width={13} /></Link><Link href="/app/updates">{c.updates}{unread > 0 && <span>({unread})</span>}<Icon name="chevron-right" width={13} /></Link><Link href="/my-requests">{c.requests}<Icon name="chevron-right" width={13} /></Link></nav></section>
            </>}
            {section === 'myAppointments' && <>
              <button className="button button-gold appointment-new" onClick={() => dispatch({ type: 'open', overlay: { kind: 'booking' } })}>{t('bookService')}<Icon name="plus" /></button>
              {bookings.length ? <div className="account-bookings">{bookings.map((booking) => <article key={booking.id}><div className="account-booking-icon"><Icon name="calendar" width={26} height={26} /></div><div><p className="eyebrow">{t(booking.location)}</p><h2>{t(booking.service)}</h2><p>{formatDate(booking.date, state.language, true)} · {booking.time}</p><small>{booking.id}</small></div><span className="mini-badge">{t('demoLabel')}</span></article>)}</div> : <AccountEmpty icon="calendar" title="accountEmptyAppointments" body="accountEmptyAppointmentsBody" action={() => dispatch({ type: 'open', overlay: { kind: 'booking' } })} />}
            </>}
            {section === 'myUpdates' && <>
              {unread > 0 && <button type="button" className="text-link account-mark-read" disabled={busy} onClick={async () => { setBusy(true); try { await shopRequest('readNotifications'); await refresh(true); } catch { setError(t('requestFailed')); } finally { setBusy(false); } }}>{t('markRead')}<Icon name="check" width={16} /></button>}
              {state.notifications.length ? <div className="account-updates">{state.notifications.map((notice) => <article key={notice.id} className={notice.read ? '' : 'is-unread'}><span className="account-update-symbol"><Icon name="spark" width={19} /></span><div><h2>{localizedText(notice.title,state.language)}</h2><p>{localizedText(notice.body,state.language)}</p>{notice.url && <Link className="text-link account-notice-link" href={notice.url.includes('product=') ? notice.url : '/app/orders'}>{t(notice.url.includes('product=') ? 'quickView' : 'viewOrders')}<Icon name="arrow-right" width={14} /></Link>}<time dateTime={notice.createdAt}>{formatDate(notice.createdAt, state.language)}</time></div>{!notice.read && <span className="account-unread-dot" aria-label={t('unreadCount')} />}</article>)}</div> : <AccountEmpty icon="spark" title="accountEmptyUpdates" body="accountEmptyUpdatesBody" />}
              <CustomerRequests /><DeviceSettings />
            </>}
            {section === 'myDetails' && <AccountProfile key={user.id} user={user} />}
            {section === 'addresses' && <AddressBook />}
            {section === 'wishlist' && <WishlistContent showHeading={false} />}
          </div>
        </div>
      </div>}
    </main>
    <Footer /><Overlays /><Toast />
  </>;
}

function SummaryCard({ href, title, intro, children }: { href: string; title: string; intro: string; children?: ReactNode }) {
  return <Link href={href} className="exact-personal-summary-card"><div className="exact-personal-card-heading"><h2>{title}</h2><Icon name="chevron-right" width={13} /></div><p>{intro}</p>{children}</Link>;
}

function AccountEmpty({ icon, title, body, action }: { icon: IconName; title: 'accountEmptyTitle' | 'accountEmptyAppointments' | 'accountEmptyUpdates'; body: 'accountEmptyBody' | 'accountEmptyAppointmentsBody' | 'accountEmptyUpdatesBody'; action?: () => void }) {
  const { t } = useShop();
  return <div className="account-empty"><div className="account-empty-symbol"><Icon name={icon} width={28} height={28} /></div><h2>{t(title)}</h2><p>{t(body)}</p>{action ? <button type="button" className="button button-gold" onClick={action}>{t('bookService')}<Icon name="arrow-up-right" /></button> : <Link href="/collections" className="button button-gold">{t('shopNow')}<Icon name="arrow-up-right" /></Link>}</div>;
}

function CustomerOrder({ order, initialExpanded = false }: { order: Order; initialExpanded?: boolean }) {
  const { t, state, money, productById } = useShop();
  const [expanded, setExpanded] = useState(initialExpanded);
  const firstProduct = order.lines[0]?.product ?? productById.get(order.lines[0]?.productId);
  const count = order.lines.reduce((count, line) => count + line.quantity, 0);
  return <article className="customer-order" data-order-id={order.id}>
    <div className="customer-order-summary"><div className="customer-order-thumbnail">{firstProduct && <MaisonImage index={firstProduct.image} sources={firstProduct.images} alt={firstProduct.name[state.locale]} sizes="80px" className="object-cover" />}</div><div className="customer-order-label"><p className="eyebrow">{order.id}</p><h3>{firstProduct?.name[state.locale]}</h3><p>{t(count === 1 ? 'accountOrderItem' : 'accountOrderItems', { count })} · {formatDate(order.createdAt, state.language)}</p></div><div className="customer-order-price"><strong>{money(order.total, order.currency)}</strong><span className={`status-label status-${order.status ?? 'confirmed'}`}>{t(order.status ?? 'confirmed')}</span></div></div>
    <div className="customer-order-track"><OrderJourney order={order} /></div>
    <button type="button" className="customer-order-expand" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}><span>{t(expanded ? 'accountHideOrder' : 'accountViewOrder')}</span><Icon name={expanded ? 'minus' : 'plus'} width={17} /></button>
    {expanded && <div className="customer-order-details"><ul className="compact-lines">{order.lines.map((line) => <li key={`${line.productId}:${line.size}`}><span>{line.product?.name[state.locale] ?? productById.get(line.productId)?.name[state.locale] ?? line.productId}<small>{t('size')}: {line.size === 'OS' ? t('oneSize') : line.size} · ×{line.quantity}</small></span><span>{money(line.unitPrice * line.quantity, order.currency)}</span></li>)}</ul><div className="customer-order-totals"><span>{t('shipping')}: {money(order.shipping, order.currency)}</span><strong>{t('total')}: {money(order.total, order.currency)}</strong></div><OrderPromotion order={order}/><div className="customer-order-info"><div><p className="eyebrow">{t('accountShipping')}</p><p translate="no" data-personal-data="">{order.recipient.name}<br />{order.recipient.address}<br />{order.recipient.city} · {marketName(order.recipient.country, state.language)}</p></div><div><p className="eyebrow">{t('accountPayment')}</p><p>{t(order.payment)}<br /><span>{t(order.payment === 'pickup' ? 'pickupDemo' : 'paidDemo')}</span></p>{order.paymentReference && <small>{order.paymentReference}</small>}</div></div><button type="button" className="text-link" onClick={() => downloadInvoice(order, state.language)}>{t('invoice')}<Icon name="download" width={16} /></button></div>}
  </article>;
}
