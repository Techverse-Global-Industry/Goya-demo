'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useShop } from '@/context/shop-context';
import type { Order, OrderStatus, Product, StoreSnapshot } from '@/lib/types';
import { RequestError, shopRequest } from '@/lib/api';
import { formatDate, matchesProduct } from '@/lib/commerce';
import { Auth } from '@/components/auth';
import { LanguageSwitch } from '@/components/controls';
import { Icon } from '@/components/icon';
import type { IconName } from '@/components/icon';
import { MaisonImage } from '@/components/maison-image';
import { ProductEditor } from '@/components/admin/product-editor';
import { AnnouncementEditor } from '@/components/admin/announcement-editor';
import { OrderJourney } from '@/components/order-journey';
import { ExperienceConsole } from '@/components/admin/experience-console';

type Tab = 'overview' | 'products' | 'orders' | 'experience' | 'announcements';
const tabs: { id: Tab; icon: IconName }[] = [{ id: 'overview', icon: 'store' }, { id: 'products', icon: 'bag' }, { id: 'orders', icon: 'package' }, { id: 'experience', icon: 'mail' }, { id: 'announcements', icon: 'spark' }];

export default function AdminPage() {
  const { state, t, money, refresh } = useShop();
  const [data, setData] = useState<StoreSnapshot | null>(null);
  const [tab, setTab] = useState<Tab>('overview');
  const [editing, setEditing] = useState<Product | 'new' | null>(null);
  const [query, setQuery] = useState('');
  const [orderFilter, setOrderFilter] = useState('all');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const isAdmin = state.user?.role === 'admin';
  const tabName = (value: Tab) => value === 'experience' ? (state.locale === 'fr' ? 'Service client' : 'Customer service') : t(value);

  const load = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const response = await fetch('/api/shop?admin=1', { cache: 'no-store' });
      if (!response.ok) throw new Error('Unavailable');
      setData(await response.json());
    } catch { setError(t('requestFailed')); }
  }, [isAdmin, t]);
  useEffect(() => {
    const tick = () => { if (document.visibilityState === 'visible') void load(); };
    void load();
    const timer = window.setInterval(tick, 10000);
    window.addEventListener('maison:refresh', tick);
    window.addEventListener('focus', tick);
    return () => { clearInterval(timer); window.removeEventListener('maison:refresh', tick); window.removeEventListener('focus', tick); };
  }, [load]);

  const action = async (action: string, body: Record<string, unknown>) => {
    setBusy(true); setError(''); setNotice('');
    try { await shopRequest(action, body); await Promise.all([load(), refresh()]); setNotice(t('saved')); }
    catch (error) { setError(error instanceof RequestError ? error.message : t('requestFailed')); throw error; }
    finally { setBusy(false); }
  };
  const changeTab = (tab: Tab) => { setTab(tab); setEditing(null); setError(''); setNotice(''); void load(); };

  if (!isAdmin) return <main className="admin-login"><Link className="wordmark" href="/"><span>MAISON GOYA<span className="wordmark-dot">.</span></span></Link><div className="admin-login-card"><div className="admin-login-top"><span className="eyebrow">{t('admin')}</span><LanguageSwitch /></div><Auth admin />{state.user && <p className="field-error">{state.locale === 'fr' ? 'Connectez-vous avec un compte administrateur.' : 'Sign in with an administrator account to open this workspace.'}</p>}</div><Link className="text-link" href="/">{state.locale === 'fr' ? 'Site de la marque' : 'Brand website'}<Icon name="arrow-up-right" /></Link></main>;

  const products = data?.products ?? [];
  const orders = data?.orders ?? [];
  const filteredProducts = products.filter((product) => matchesProduct(product, query));
  const filteredOrders = orders.filter((order) => orderFilter === 'all' || order.status === orderFilter);
  return <div className="admin-app">
    <aside className="admin-sidebar"><Link className="wordmark" href="/"><span>MAISON GOYA<span className="wordmark-dot">.</span></span><small>{t('admin')}</small></Link>
      <nav aria-label={t('admin')}>{tabs.map(({ id, icon }) => <button type="button" key={id} aria-current={tab === id ? 'page' : undefined} onClick={() => changeTab(id)}><Icon name={icon} /><span>{tabName(id)}</span>{id === 'orders' && orders.filter((order) => order.status === 'confirmed').length > 0 && <span className="admin-nav-count">{orders.filter((order) => order.status === 'confirmed').length}</span>}</button>)}</nav>
      <div className="admin-sidebar-bottom"><span className="mini-badge">{t('demoWorkspace')}</span><Link className="text-link" href="/">{state.locale === 'fr' ? 'Site de la marque' : 'Brand website'}<Icon name="arrow-up-right" /></Link><button className="quiet-link" onClick={async () => { try { await shopRequest('logout'); setData(null); await refresh(); } catch { setError(t('requestFailed')); } }}>{t('logout')}</button></div>
    </aside>
    <main className="admin-main">
      <header className="admin-topbar"><span className="eyebrow">Maison Goya / {tabName(tab)}</span><div><span className={`connection-dot ${state.connected ? 'is-live' : ''}`} aria-hidden="true" /><span className="admin-live-label">{state.connected ? t('refreshed') : t('loading')}</span><LanguageSwitch /></div></header>
      <div className="admin-content">
        <div className="admin-page-heading"><div><p className="eyebrow">{t('demoWorkspace')}</p><h1>{editing ? t(editing === 'new' ? 'addProduct' : 'editProduct') : tabName(tab)}</h1><p>{t(tab === 'announcements' ? 'announcementIntro' : 'adminIntro')}</p></div>{tab === 'products' && !editing && <button className="button button-gold" onClick={() => setEditing('new')}>{t('addProduct')}<Icon name="plus" /></button>}</div>
        {error && <p className="admin-alert is-error" role="alert">{error}</p>}{notice && <p className="admin-alert" role="status"><Icon name="check" width={16} />{notice}</p>}
        {!data ? <p className="admin-empty">{t('loading')}</p> : <>
          {tab === 'overview' && <>
            <div className="admin-stats">{[{ label: 'totalOrders' as const, value: orders.length, icon: 'package' as const }, { label: 'activeOrders' as const, value: orders.filter((order) => ['confirmed', 'preparing'].includes(order.status ?? '')).length, icon: 'truck' as const }, { label: 'publishedProducts' as const, value: products.filter((product) => product.published !== false).length, icon: 'bag' as const }, { label: 'lowStock' as const, value: products.filter((product) => product.published !== false).flatMap((product) => Object.values(product.stock)).filter((stock) => stock <= 2).length, icon: 'spark' as const }].map((stat) => <div className="admin-stat" key={stat.label}><Icon name={stat.icon} /><span>{t(stat.label)}</span><strong>{stat.value.toString().padStart(2, '0')}</strong></div>)}</div>
            <section className="admin-panel"><div className="admin-panel-heading"><h2>{t('recentOrders')}</h2><button className="text-link" onClick={() => changeTab('orders')}>{t('allOrders')}<Icon name="arrow-right" /></button></div>{!orders.length ? <div className="admin-empty"><Icon name="package" width={36} height={36} /><p>{t('noOrdersAdmin')}</p></div> : orders.slice(0, 5).map((order) => <button key={order.id} className="admin-recent-order" onClick={() => changeTab('orders')}><span><strong>{order.id}</strong><small>{order.recipient.name}</small></span><span className={`status-label status-${order.status}`}>{t(order.status ?? 'confirmed')}</span><strong>{money(order.total, order.currency)}</strong><Icon name="arrow-up-right" width={16} /></button>)}</section>
            <section className="admin-featured"><div><p className="eyebrow">{t('collection')}</p><h2>{t('manageProducts')}</h2><p>{t('stockHint')}</p><button className="button button-outline" onClick={() => changeTab('products')}>{t('products')}<Icon name="arrow-right" /></button></div><span className="admin-featured-monogram" aria-hidden="true">MG</span></section>
            {data.bookings.length > 0 && <section className="admin-panel"><div className="admin-panel-heading"><h2>{t('yourAppointments')}</h2></div>{data.bookings.slice(-5).reverse().map((booking) => <div className="admin-recent-order" key={booking.id}><span><strong>{booking.name}</strong><small>{booking.email}</small></span><span>{t(booking.service)} · {t(booking.location)}</span><span>{booking.date} · {booking.time}</span></div>)}</section>}
          </>}
          {tab === 'products' && (editing ? <ProductEditor key={editing === 'new' ? 'new' : editing.id} product={editing === 'new' ? undefined : editing} onSave={async (product, expectedUpdatedAt) => { await action('saveProduct', { product, expectedUpdatedAt }); setEditing(null); }} onCancel={() => setEditing(null)} busy={busy} /> : <>
            <label className="admin-search"><Icon name="search" /><input type="search" aria-label={t('searchProducts')} placeholder={t('searchProducts')} value={query} onChange={(event) => setQuery(event.target.value)} /></label>
            <div className="admin-products">{filteredProducts.map((product) => <article className="admin-product" key={product.id}><div className="admin-product-image"><MaisonImage key={product.images?.join()} index={product.image} sources={product.images} alt={product.name[state.locale]} sizes="(max-width: 639px) 42vw, 24vw" className="object-cover" /><span className={`admin-publish-badge ${product.published === false ? 'is-draft' : ''}`}>{t(product.published === false ? 'draft' : 'published')}</span></div><div className="admin-product-copy"><p className="eyebrow">{t(product.category)}</p><h2>{product.name[state.locale]}</h2><div><span>{money(product.prices[state.currency])}</span><span>{Object.values(product.stock).reduce((a, b) => a + b, 0)} {t('stock').toLowerCase()}</span></div><button className="button button-outline button-full" onClick={() => { setEditing(structuredClone(product)); setNotice(''); }}>{t('edit')}<Icon name="arrow-right" /></button></div></article>)}</div>{!filteredProducts.length && <p className="admin-empty">{t('noResults')}</p>}
          </>)}
          {tab === 'orders' && <><div className="admin-order-filters" role="group" aria-label={t('orderStatus')}>{(['all', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'] as const).map((status) => <button key={status} aria-pressed={orderFilter === status} onClick={() => setOrderFilter(status)}>{t(status)}</button>)}</div><div className="admin-orders">{filteredOrders.map((order) => <AdminOrder key={order.id} order={order} busy={busy} onStatus={async (status) => { await action('orderStatus', { orderId: order.id, status }); }} />)}{!filteredOrders.length && <div className="admin-empty"><Icon name="package" width={36} height={36} /><p>{t('noOrdersAdmin')}</p></div>}</div></>}
          {tab === 'experience' && <ExperienceConsole data={data} busy={busy} onAction={action} />}
          {tab === 'announcements' && <><AnnouncementEditor products={products} busy={busy} onPublish={async (body) => { await action('announce', body); }} /><div className="admin-announcements">{data.announcements.map((announcement) => <article className="admin-panel" key={announcement.id}><p className="eyebrow">{formatDate(announcement.createdAt, state.locale)}</p><h2>{announcement.title[state.locale]}</h2><p>{announcement.body[state.locale]}</p><button className="quiet-link" disabled={busy} onClick={() => void action('deleteAnnouncement', { id: announcement.id }).catch(() => undefined)}>{t('removeAnnouncement')}</button></article>)}</div></>}
        </>}
        <footer className="admin-footer">{t('demoOnly')}</footer>
      </div>
    </main>
  </div>;
}

function AdminOrder({ order, busy, onStatus }: { order: Order; busy: boolean; onStatus: (status: OrderStatus) => Promise<void> }) {
  const { t, money, state } = useShop();
  const [expanded, setExpanded] = useState(false);
  const [next, setNext] = useState<OrderStatus | ''>('');
  const status = order.status ?? 'confirmed';
  const options: Record<OrderStatus, OrderStatus[]> = { confirmed: ['preparing', 'cancelled'], preparing: ['shipped', 'cancelled'], shipped: ['delivered'], delivered: [], cancelled: [] };
  return <article className="admin-order"><button className="admin-order-summary" onClick={() => setExpanded(!expanded)} aria-expanded={expanded}><span><strong>{order.id}</strong><small>{formatDate(order.createdAt, state.locale)} · {order.recipient.name}</small></span><span className={`status-label status-${status}`}>{t(status)}</span><strong>{money(order.total, order.currency)}</strong><Icon name="chevron" width={18} /></button>{expanded && <div className="admin-order-body"><OrderJourney order={order} /><div className="admin-order-columns"><div><h3 className="eyebrow">{t('items')}</h3><ul className="compact-lines">{order.lines.map((line) => <li key={`${line.productId}:${line.size}`}><span>{line.product?.name[state.locale] ?? line.productId}<small>{t('size')}: {line.size} · ×{line.quantity}</small></span><span>{money(line.unitPrice * line.quantity, order.currency)}</span></li>)}</ul><p className="fine-print">{t('shipping')}: {money(order.shipping, order.currency)} · {t(order.payment)}</p><p className="fine-print">{order.paymentReference}</p></div><div><h3 className="eyebrow">{t('deliveryDetails')}</h3><p>{order.recipient.name}<br />{order.recipient.email}<br />{order.recipient.address}<br />{order.recipient.city} · {order.recipient.country}</p></div></div>{options[status].length > 0 && <form className="admin-status-form" onSubmit={async (event) => { event.preventDefault(); if (next) { try { await onStatus(next); setNext(''); } catch { /* parent displays error */ } } }}><label className="field"><span>{t('orderStatus')}</span><select aria-label={t('orderStatus')} value={next} required onChange={(event) => setNext(event.target.value as OrderStatus)}><option value="">{t('updateStatus')}</option>{options[status].map((status) => <option key={status} value={status}>{t(status)}</option>)}</select></label><button className="button button-gold" disabled={busy || !next}>{t(busy ? 'saving' : 'updateStatus')}</button></form>}</div>}</article>;
}
