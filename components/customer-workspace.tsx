'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useShop } from '@/context/shop-context';
import { useRouter } from 'next/navigation';
import { Collection } from '@/components/collection';
import { Header } from '@/components/header';

import { Overlays } from '@/components/overlays';
import { CurrencySelect, LanguageSwitch, Toast } from '@/components/controls';
import { Icon } from '@/components/icon';
import type { IconName } from '@/components/icon';
import { MaisonImage } from '@/components/maison-image';
import { DeviceSettings } from '@/components/pwa';
import { OrderJourney } from '@/components/order-journey';
import { downloadInvoice } from '@/lib/browser';
import { formatDate } from '@/lib/commerce';
import { shopRequest } from '@/lib/api';
import type { DemoUser, Order } from '@/lib/types';

export type Section = 'collection' | 'accountOverview' | 'myOrders' | 'myAppointments' | 'myUpdates' | 'myDetails';
export const customerPaths: Record<Section, string> = { collection: '/app/shop', accountOverview: '/app', myOrders: '/app/orders', myAppointments: '/app/atelier', myUpdates: '/app/updates', myDetails: '/app/settings' };
const sections: { id: Section; icon: IconName }[] = [
  { id: 'collection', icon: 'bag' },
  { id: 'accountOverview', icon: 'store' },
  { id: 'myOrders', icon: 'package' },
  { id: 'myAppointments', icon: 'calendar' },
  { id: 'myUpdates', icon: 'spark' },
  { id: 'myDetails', icon: 'user' },
];

export default function CustomerWorkspace({ section }: { section: Section }) {
  const router = useRouter();
  const setSection = (next: Section) => router.push(customerPaths[next]);
  const { state, t, dispatch, refresh } = useShop();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const user = state.user;
  const userId = user?.id;
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [userId, section]);
  useEffect(() => { if (state.ready && !user) router.replace(`/login?next=${encodeURIComponent(customerPaths[section])}`); }, [state.ready, user, router, section]);
  const orders = state.orders.filter((order) => order.customerId === user?.id);
  const bookings = state.bookings.filter((booking) => booking.customerId === user?.id);
  const unread = state.notifications.filter((notice) => !notice.read).length;
  const activeOrders = orders.filter((order) => !['delivered', 'cancelled'].includes(order.status ?? 'confirmed'));
  const firstName = user?.name.split(' ')[0] ?? '';

  const logout = async () => {
    setBusy(true); setError('');
    try { await shopRequest('logout'); dispatch({ type: 'signOut' }); await refresh(true); router.replace('/login'); }
    catch { setError(t('requestFailed')); }
    finally { setBusy(false); }
  };

  return <>
    <Header workspace />
    <main id="account-content" className="customer-account" tabIndex={-1}>
      {!state.ready || !user ? <div className="account-loading" role="status"><span className="account-loading-mark">MG</span><p>{t('accountLoading')}</p></div> : <div className="account-wrap">
        <div className="account-breadcrumb"><Link href="/app">Maison Goya</Link><span>/</span><span>{t('myMaison')}</span></div>
        <div className="account-grid">
          <aside className="account-sidebar">
            <div className="account-identity"><div className="account-avatar">{user.name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}</div><div><strong>{user.name}</strong><span>{t('accountMember')}</span></div></div>
            <nav aria-label={t('accountMobileNav')}>{sections.map(({ id, icon }) => <button type="button" key={id} onClick={() => { setSection(id); setError(''); }} aria-current={section === id ? 'page' : undefined}><Icon name={icon} width={18} /><span>{t(id)}</span>{id === 'myUpdates' && unread > 0 && <span className="account-nav-count">{unread}</span>}<Icon name="arrow-right" className="account-nav-arrow" width={15} /></button>)}</nav>
            <div className="account-sidebar-end">{user.role === 'admin' && <Link href="/admin" className="account-admin-link">{t('admin')}<Icon name="arrow-up-right" width={16} /></Link>}<button type="button" onClick={logout} disabled={busy}><Icon name="logout" width={17} />{t('logout')}</button><small>{t('demoLabel')} · Maison Goya</small></div>
          </aside>
          <div className="account-content">
            {error && <p className="account-feedback is-error" role="alert">{error}</p>}
            {section === 'collection' && <Collection />}
            {section === 'accountOverview' && <>
              <header className="account-hero"><div className="account-hero-copy"><p className="eyebrow">{t('myMaison')}</p><h1>{t('accountGreeting', { name: firstName })}</h1><p>{t('accountIntro')}</p><Link href="/app/shop" className="text-link">{t('accountShopLink')}<Icon name="arrow-up-right" /></Link></div><span className="account-hero-monogram" aria-hidden="true">MG</span><span className="account-hero-orbit" aria-hidden="true" /></header>
              <div className="account-stat-grid">{[{ label: 'ordersCount' as const, count: orders.length, icon: 'bag' as const, target: 'myOrders' as const }, { label: 'onTheWayCount' as const, count: activeOrders.length, icon: 'truck' as const, target: 'myOrders' as const }, { label: 'unreadCount' as const, count: unread, icon: 'spark' as const, target: 'myUpdates' as const }].map((stat) => <button type="button" key={stat.label} onClick={() => setSection(stat.target)}><Icon name={stat.icon} width={21} /><strong>{String(stat.count).padStart(2, '0')}</strong><span>{t(stat.label)}</span><Icon name="arrow-up-right" className="account-stat-arrow" width={15} /></button>)}</div>
              <section className="account-section"><div className="account-section-heading"><h2>{t('accountLatest')}</h2>{orders.length > 0 && <button type="button" className="text-link" onClick={() => setSection('myOrders')}>{t('viewOrders')}<Icon name="arrow-right" width={15} /></button>}</div>{orders.length ? <CustomerOrder key={orders[0].id} order={orders[0]} /> : <AccountEmpty icon="bag" title="accountEmptyTitle" body="accountEmptyBody" />}</section>
              <div className="account-bottom-grid"><section className="account-atelier-card"><p className="eyebrow">{t('atelier')}</p><h2>{t('accountAtelier')}</h2><p>{t('accountAtelierBody')}</p><button type="button" className="text-link" onClick={() => setSection('myAppointments')}>{t('bookService')}<Icon name="arrow-up-right" width={16} /></button><Icon name="spark" className="account-atelier-watermark" width={100} height={100} /></section><DeviceSettings /></div>
            </>}
            {section === 'myOrders' && <><AccountHeading title="myOrders" body="accountOrdersIntro" />{orders.length ? <div className="account-orders-list">{orders.map((order) => <CustomerOrder key={order.id} order={order} />)}</div> : <AccountEmpty icon="bag" title="accountEmptyTitle" body="accountEmptyBody" />}</>}
            {section === 'myAppointments' && <><AccountHeading title="myAppointments" body="accountAppointmentsIntro" /><button className="button button-gold appointment-new" onClick={() => dispatch({ type: 'open', overlay: { kind: 'booking' } })}>{t('bookService')}<Icon name="plus" /></button>{bookings.length ? <div className="account-bookings">{bookings.map((booking) => <article key={booking.id}><div className="account-booking-icon"><Icon name="calendar" width={26} height={26} /></div><div><p className="eyebrow">{t(booking.location)}</p><h2>{t(booking.service)}</h2><p>{formatDate(booking.date, state.locale, true)} · {booking.time}</p><small>{booking.id}</small></div><span className="mini-badge">{t('demoLabel')}</span></article>)}</div> : <AccountEmpty icon="calendar" title="accountEmptyAppointments" body="accountEmptyAppointmentsBody" action={() => dispatch({ type: 'open', overlay: { kind: 'booking' } })} />}</>}
            {section === 'myUpdates' && <><AccountHeading title="myUpdates" body="accountUpdatesIntro" />{unread > 0 && <button type="button" className="text-link account-mark-read" disabled={busy} onClick={async () => { setBusy(true); try { await shopRequest('readNotifications'); await refresh(true); } catch { setError(t('requestFailed')); } finally { setBusy(false); } }}>{t('markRead')}<Icon name="check" width={16} /></button>}{state.notifications.length ? <div className="account-updates">{state.notifications.map((notice) => <article key={notice.id} className={notice.read ? '' : 'is-unread'}><span className="account-update-symbol"><Icon name="spark" width={19} /></span><div><h2>{notice.title[state.locale]}</h2><p>{notice.body[state.locale]}</p>{notice.url && <Link className="text-link account-notice-link" href={notice.url.includes('product=') ? notice.url : '/app/orders'}>{t(notice.url.includes('product=') ? 'quickView' : 'viewOrders')}<Icon name="arrow-right" width={14} /></Link>}<time dateTime={notice.createdAt}>{formatDate(notice.createdAt, state.locale)}</time></div>{!notice.read && <span className="account-unread-dot" aria-label={t('unreadCount')} />}</article>)}</div> : <AccountEmpty icon="spark" title="accountEmptyUpdates" body="accountEmptyUpdatesBody" />}<DeviceSettings /></>}
            {section === 'myDetails' && <><AccountHeading title="myDetails" body="accountDetailsIntro" /><CustomerDetails key={user.id} user={user} /><section className="account-preferences"><div><p className="eyebrow">{t('accountPreferences')}</p><p>{t('accountPreferencesBody')}</p></div><div className="account-preference-controls"><div><span>{t('language')}</span><LanguageSwitch /></div><div><span>{t('currency')}</span><CurrencySelect /></div></div></section></>}
          </div>
        </div>
      </div>}
    </main>
    <footer className="customer-app-footer">Maison Goya · {t('demoLabel')}</footer><Overlays /><Toast />
  </>;
}

function AccountHeading({ title, body }: { title: Section; body: 'accountOrdersIntro' | 'accountAppointmentsIntro' | 'accountUpdatesIntro' | 'accountDetailsIntro' }) {
  const { t } = useShop();
  return <header className="account-page-heading"><p className="eyebrow">{t('myMaison')}</p><h1>{t(title)}</h1><p>{t(body)}</p></header>;
}

function AccountEmpty({ icon, title, body, action }: { icon: IconName; title: 'accountEmptyTitle' | 'accountEmptyAppointments' | 'accountEmptyUpdates'; body: 'accountEmptyBody' | 'accountEmptyAppointmentsBody' | 'accountEmptyUpdatesBody'; action?: () => void }) {
  const { t } = useShop();
  return <div className="account-empty"><div className="account-empty-symbol"><Icon name={icon} width={28} height={28} /></div><h2>{t(title)}</h2><p>{t(body)}</p>{action ? <button type="button" className="button button-gold" onClick={action}>{t('bookService')}<Icon name="arrow-up-right" /></button> : <Link href="/app/shop" className="button button-gold">{t('shopNow')}<Icon name="arrow-up-right" /></Link>}</div>;
}

function CustomerOrder({ order, initialExpanded = false }: { order: Order; initialExpanded?: boolean }) {
  const { t, state, money, productById } = useShop();
  const [expanded, setExpanded] = useState(initialExpanded);
  const firstProduct = order.lines[0]?.product ?? productById.get(order.lines[0]?.productId);
  const count = order.lines.reduce((count, line) => count + line.quantity, 0);
  return <article className="customer-order" data-order-id={order.id}>
    <div className="customer-order-summary"><div className="customer-order-thumbnail">{firstProduct && <MaisonImage index={firstProduct.image} sources={firstProduct.images} alt={firstProduct.name[state.locale]} sizes="80px" className="object-cover" />}</div><div className="customer-order-label"><p className="eyebrow">{order.id}</p><h3>{firstProduct?.name[state.locale]}</h3><p>{t(count === 1 ? 'accountOrderItem' : 'accountOrderItems', { count })} · {formatDate(order.createdAt, state.locale)}</p></div><div className="customer-order-price"><strong>{money(order.total, order.currency)}</strong><span className={`status-label status-${order.status ?? 'confirmed'}`}>{t(order.status ?? 'confirmed')}</span></div></div>
    <div className="customer-order-track"><OrderJourney order={order} /></div>
    <button type="button" className="customer-order-expand" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}><span>{t(expanded ? 'accountHideOrder' : 'accountViewOrder')}</span><Icon name={expanded ? 'minus' : 'plus'} width={17} /></button>
    {expanded && <div className="customer-order-details"><ul className="compact-lines">{order.lines.map((line) => <li key={`${line.productId}:${line.size}`}><span>{line.product?.name[state.locale] ?? productById.get(line.productId)?.name[state.locale] ?? line.productId}<small>{t('size')}: {line.size === 'OS' ? t('oneSize') : line.size} · ×{line.quantity}</small></span><span>{money(line.unitPrice * line.quantity, order.currency)}</span></li>)}</ul><div className="customer-order-totals"><span>{t('shipping')}: {money(order.shipping, order.currency)}</span><strong>{t('total')}: {money(order.total, order.currency)}</strong></div><div className="customer-order-info"><div><p className="eyebrow">{t('accountShipping')}</p><p>{order.recipient.name}<br />{order.recipient.address}<br />{order.recipient.city} · {t(`country${order.recipient.country}`)}</p></div><div><p className="eyebrow">{t('accountPayment')}</p><p>{t(order.payment)}<br /><span>{t(order.payment === 'pickup' ? 'pickupDemo' : 'paidDemo')}</span></p>{order.paymentReference && <small>{order.paymentReference}</small>}</div></div><button type="button" className="text-link" onClick={() => downloadInvoice(order, state.locale)}>{t('invoice')}<Icon name="download" width={16} /></button></div>}
  </article>;
}

function CustomerDetails({ user }: { user: DemoUser }) {
  const { t, refresh, dispatch } = useShop();
  const [name, setName] = useState(user.name);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  return <form className="account-details-form" onSubmit={async (event) => { event.preventDefault(); setBusy(true); setMessage(''); try { const { user: savedUser } = await shopRequest<{ user: DemoUser }>('profile', { name }); dispatch({ type: 'signIn', user: savedUser }); await refresh(true); setMessage(t('saved')); setError(false); } catch { setMessage(t('requestFailed')); setError(true); } finally { setBusy(false); } }}><h2>{t('accountProfile')}</h2><label className="field"><span>{t('name')}</span><input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} required minLength={2} maxLength={100} /></label><label className="field"><span>{t('email')}</span><input type="email" value={user.email} readOnly aria-describedby="account-email-note" /><small id="account-email-note">{t('emailReadOnly')}</small></label>{message && <p className={`account-feedback ${error ? 'is-error' : ''}`} role={error ? 'alert' : 'status'}>{message}</p>}<button type="submit" className="button button-gold" disabled={busy || name.trim() === user.name}>{t(busy ? 'saving' : 'saveDetails')}<Icon name="check" width={17} /></button></form>;
}
