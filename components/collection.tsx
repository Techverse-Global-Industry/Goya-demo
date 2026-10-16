'use client';

import { useMemo, useRef } from 'react';
import { useShop } from '@/context/shop-context';
import { matchesProduct } from '@/lib/commerce';
import type { Category, Product } from '@/lib/types';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';
import { MaisonImage } from './maison-image';
import { CurrencySelect } from './controls';
import { Icon } from './icon';

export function ProductCard({ product, index }: { product: Product; index: number }) {
  const { state, dispatch, t, money, remaining } = useShop();
  const name = product.name[state.locale];
  const isSoldOut = Object.keys(product.stock).every((size) => remaining(product.id, size) === 0);
  const quickView = () => dispatch({ type: 'open', overlay: { kind: 'quick', productId: product.id } });
  const add = () => {
    if (product.kind === 'bag') dispatch({ type: 'add', productId: product.id, size: 'OS' });
    else quickView();
  };
  return <article className="product-card" data-product-id={product.id}>
    <div className="product-visual">
      <button type="button" className="product-image-button" aria-label={t('viewProduct', { name })} onClick={quickView}>
        <MaisonImage key={product.images?.join()} index={product.image} sources={product.images} alt={name} sizes="(min-width: 1400px) 25vw, (min-width: 900px) 33vw, (min-width: 540px) 50vw, 100vw" className="product-photo" />
      </button>
      <span className="product-badge">{t(product.badge)}</span>
      <span className="product-index" aria-hidden="true">N° {String(index + 1).padStart(2, '0')}</span>
      <button type="button" className="quick-view-button" onClick={quickView}>{t('quickView')}<Icon name="plus" width={15} height={15} /></button>
    </div>
    <div className="product-info">
      <div className="product-category"><span>{t(product.category)}</span><span>{product.color[state.locale]}</span></div>
      <h3><button type="button" onClick={quickView}>{name}</button></h3>
      <div className="product-bottom"><span className="product-price">{money(product.prices[state.currency])}</span>
        <button type="button" className="product-add" onClick={add} disabled={isSoldOut || !state.ready}>
          {t(isSoldOut ? 'soldOut' : 'addToCart')}<Icon name="plus" width={14} height={14} />
        </button>
      </div>
    </div>
  </article>;
}

export function Collection() {
  const { state, dispatch, t, products: catalog } = useShop();
  const root = useRef<HTMLElement>(null);
  const products = useMemo(() => {
    return catalog.filter((product) => (state.filter === 'all' || product.category === state.filter) && matchesProduct(product, state.query));
  }, [state.filter, state.query, catalog]);

  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('.collection-heading > *', { y: 30, opacity: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: '.collection-heading', start: 'top 88%', once: true } });
    });
    return () => media.revert();
  }, { scope: root });

  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      if (!root.current?.querySelector('.product-card')) return;
      gsap.fromTo('.product-card', { y: 36, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.065, ease: 'power2.out', scrollTrigger: { trigger: '.product-grid', start: 'top 92%', once: true } });
    });
    const frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => { cancelAnimationFrame(frame); media.revert(); };
  }, { scope: root, dependencies: [state.filter, state.query, state.locale], revertOnUpdate: true });

  return <section id="collection" className="collection-section section-pad" ref={root} tabIndex={-1}>
    <div className="collection-heading">
      <p className="eyebrow"><span className="tiny-rule" />{t('collectionEyebrow')}</p>
      <div className="section-heading-row"><h2 className="display-heading">{t('collectionTitle')}<em>{t('collectionEmphasis')}</em></h2>
        <div className="section-intro"><p>{t('collectionIntro')}</p><span className="edition-label">Maison Goya · {t('collectionSeason')}</span></div>
      </div>
    </div>
    {state.announcements[0] && <div className="arrival-banner"><span className="eyebrow">{t('newArrivals')}</span><div><strong>{state.announcements[0].title[state.locale]}</strong><p>{state.announcements[0].body[state.locale]}</p></div>{state.announcements[0].productId && <button className="text-link" onClick={() => dispatch({ type: 'open', overlay: { kind: 'quick', productId: state.announcements[0].productId! } })}>{t('quickView')}<Icon name="arrow-right" /></button>}</div>}
    <label className="workspace-search"><Icon name="search" /><span className="sr-only">{t('search')}</span><input type="search" value={state.query} onChange={(event) => dispatch({ type: 'query', query: event.target.value })} placeholder={state.locale === 'fr' ? 'Rechercher en français ou en anglais?' : 'Search in English or French?'} /></label>
    <div className="collection-toolbar">
      <div className="category-filters" role="group" aria-label={t('collection')}>
        {(['all', 'men', 'women', 'accessories'] as Category[]).map((category) => <button type="button" key={category} aria-pressed={state.filter === category} onClick={() => dispatch({ type: 'filter', filter: category })}>{t(category)}</button>)}
      </div>
      <div className="catalog-controls"><span className="collection-count" role="status">{t('collectionCount', { count: products.length })}</span><CurrencySelect /></div>
    </div>
    {state.query && <div className="active-search"><span>{t('search')}: “{state.query}”</span><button type="button" onClick={() => dispatch({ type: 'query', query: '' })} aria-label={t('clearSearch')}><Icon name="close" width={14} height={14} /></button></div>}
    <div className="product-grid">
      {products.map((product) => <ProductCard key={product.id} product={product} index={catalog.indexOf(product)} />)}
    </div>
    {products.length === 0 && <div className="empty-state"><Icon name="search" width={30} height={30} /><h3>{t('noResults')}</h3><p>{t('noResultsText')}</p><button type="button" className="button button-outline" onClick={() => dispatch({ type: 'resetFilters' })}>{t('clearFilters')}</button></div>}
    <p className="catalog-disclaimer">{t('productNote')}</p>
    <div className="collection-signoff"><span /><span className="serif">MG</span><span /></div>
  </section>;
}
