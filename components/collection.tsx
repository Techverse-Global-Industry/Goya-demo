'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Fragment, useMemo, useState } from 'react';
import { useShop } from '@/context/shop-context';
import { availableStock, matchesProduct } from '@/lib/commerce';
import { imageSources } from '@/lib/assets';
import { shoeTypeOf } from '@/lib/merchandising';
import { catalogPath, EMPTY_FILTERS, matchesCatalogFilters, storefrontCopy } from '@/lib/storefront';
import type { CatalogFilters, CatalogSort, Category, Product, ShoeType } from '@/lib/types';
import { MaisonImage } from './maison-image';
import { Icon } from './icon';

type CollectionProps = { category?: Category; style?: ShoeType; edit?: 'collection' | 'new' | 'gifts' | 'search'; standalone?: boolean };
type FacetName = keyof CatalogFilters;

function campaignFor(product: Product): string | null {
  const original = imageSources(product.image);
  if (product.images?.some(source => !original.includes(source))) return null;
  if (product.id === 'francesco' && product.image === 3) return '/images/campaign/goya-movement-men.webp';
  if (product.id === 'kanvo-oxford' && product.image === 7) return '/images/campaign/goya-sneakers.webp';
  if (product.id === 'calfskin-belt' && product.image === 9) return '/images/campaign/goya-boots.webp';
  return null;
}

export function ProductCard({ product, index }: { product: Product; index: number }) {
  const { state, dispatch, t, money, remaining, productById } = useShop();
  const copy = storefrontCopy[state.locale];
  const fr = state.locale === 'fr';
  const name = product.name[state.locale];
  const sizes = Object.keys(product.stock);
  const soldOut = sizes.every(size => availableStock(product.id, size, state.stockUsed, productById) === 0);
  const saved = state.wishlist.includes(product.id);
  const [quickOpen, setQuickOpen] = useState(false);
  const campaign = campaignFor(product);
  const href = `/product/${encodeURIComponent(product.id)}`;
  return <article className={`product-card reference-product-card ${quickOpen ? 'reference-product-card--quick' : ''}`} data-product-id={product.id} data-catalog-index={index}>
    <div className="reference-card-visual">
      <Link href={href} className="reference-card-image" aria-label={t('viewProduct', { name })}><MaisonImage key={product.images?.join() ?? product.image} index={product.image} sources={product.images} alt={name} sizes="(min-width: 900px) 25vw, 50vw" className="reference-card-photo" />{campaign && <MaisonImage index={product.image} sources={[campaign]} alt="" sizes="(min-width: 900px) 25vw, 50vw" className="reference-card-campaign" />}</Link>
      <span className="reference-card-badge">{soldOut ? t('soldOut') : t(product.badge)}</span>
      <button type="button" className="reference-card-heart" aria-label={`${saved ? copy.saved : copy.save} — ${name}`} aria-pressed={saved} onClick={() => dispatch({ type: 'wishlist', productId: product.id })}><Icon name="heart" width={22} height={22} fill={saved ? 'currentColor' : 'none'} /></button>
      <button type="button" className="reference-card-quick-toggle" aria-expanded={quickOpen} aria-controls={`quick-sizes-${product.id}`} onClick={() => setQuickOpen(value => !value)}>{fr ? 'Achat rapide' : 'Quick shop'}<Icon name={quickOpen ? 'minus' : 'plus'} width={13} /></button>
      <div id={`quick-sizes-${product.id}`} className="reference-card-quick"><button type="button" className="reference-card-quick-close" aria-label={fr ? 'Fermer l’achat rapide' : 'Close quick shop'} onClick={() => setQuickOpen(false)}><Icon name="close" width={17} /></button><p>{soldOut ? (fr ? 'Retrouver cette création' : 'Return to this creation') : product.kind === 'footwear' ? (fr ? 'Choisissez votre pointure · EU' : 'Select your size · EU') : t('addToCart')}</p>{soldOut ? <button type="button" className="reference-card-notify" onClick={() => dispatch({ type: 'open', overlay: { kind: 'availability', productId: product.id } })}>{fr ? 'M’avertir' : 'Notify me'}<Icon name="mail" width={15} /></button> : <div className="reference-card-sizes">{sizes.map(size => <button type="button" key={size} disabled={!state.ready || remaining(product.id, size) <= 0} aria-label={`${size === 'OS' ? t('oneSize') : `${product.kind === 'footwear' ? 'EU ' : ''}${size}`} — ${t('addToCart')} — ${name}`} onClick={() => dispatch({ type: 'add', productId: product.id, size })}>{size === 'OS' ? t('oneSize') : size}</button>)}</div>}<Link href={href}>{fr ? 'Voir la création' : 'View the creation'}<Icon name="arrow-right" width={14} /></Link></div>
    </div>
    <div className="reference-card-info"><h3><Link href={href}>{name}</Link></h3><p className="reference-card-price">{money(product.prices[state.currency])}</p><span className="sr-only">{product.color[state.locale]}</span></div>
  </article>;
}

export function Collection({ category, style, edit = 'collection', standalone = false }: CollectionProps = {}) {
  const { state, dispatch, products: catalog, t } = useShop();
  const fr = state.locale === 'fr';
  const copy = storefrontCopy[state.locale];
  const audience = category ?? state.filter;
  const shoeStyle = style ?? state.shoeType;
  const types: ShoeType[] = audience === 'accessories' ? ['all'] : audience === 'men' ? ['all', 'loafers', 'sneakers'] : audience === 'women' ? ['all', 'heels', 'boots', 'sneakers'] : ['all', 'loafers', 'sneakers', 'heels', 'boots'];
  const styleName = (value: ShoeType) => value === 'all' ? copy.viewAll : copy[value];
  const stylePath = (value: ShoeType) => audience === 'all' ? value === 'all' ? '/collections' : catalogPath(value === 'heels' || value === 'boots' ? 'women' : 'men', value) : catalogPath(audience, value);
  const title = edit === 'search' ? (fr ? 'Résultats de recherche' : 'Search results') : edit === 'gifts' ? copy.gifts : edit === 'new' ? copy.newArrivals : shoeStyle !== 'all' ? `${styleName(shoeStyle)}${audience === 'men' ? (fr ? ' homme' : ' for men') : audience === 'women' ? (fr ? ' femme' : ' for women') : ''}` : audience === 'men' ? (fr ? 'Souliers homme' : 'Men’s shoes') : audience === 'women' ? (fr ? 'Souliers femme' : 'Women’s shoes') : audience === 'accessories' ? copy.accessories : (fr ? 'La collection' : 'The collection');
  const products = useMemo(() => catalog.filter(product => product.published !== false && (audience === 'all' || product.category === audience) && (shoeStyle === 'all' || shoeTypeOf(product) === shoeStyle) && matchesProduct(product, state.query) && matchesCatalogFilters(product, state.catalogFilters)).sort((a, b) => state.sort === 'priceAsc' ? a.prices[state.currency] - b.prices[state.currency] : state.sort === 'priceDesc' ? b.prices[state.currency] - a.prices[state.currency] : edit === 'new' ? (b.updatedAt ?? '').localeCompare(a.updatedAt ?? '') : 0), [catalog, audience, shoeStyle, state.query, state.catalogFilters, state.sort, state.currency, edit]);
  const viewKey = JSON.stringify([audience, shoeStyle, state.query, state.catalogFilters, state.sort, state.currency, edit]);
  const [page, setPage] = useState({ key: '', limit: 12 });
  const limit = page.key === viewKey ? page.limit : 12;
  const visible = products.slice(0, limit);
  const filters = state.catalogFilters;
  const filterCount = Object.values(filters).reduce((count, values) => count + (values?.length ?? 0), 0);
  const removeFilter = (facet: FacetName, value: string) => dispatch({ type: 'catalogFilters', filters: { ...filters, [facet]: filters[facet]?.filter(item => item !== value) } });
  const facetLabel = (facet: FacetName, value: string) => facet === 'sizes' ? (value === 'OS' ? t('oneSize') : `EU ${value}`) : facet === 'genders' ? value === 'men' ? copy.man : value === 'women' ? copy.woman : copy.accessories : value in copy ? copy[value as keyof typeof copy] : value;
  const clear = () => { dispatch({ type: 'catalogFilters', filters: EMPTY_FILTERS }); dispatch({ type: 'query', query: '' }); };
  const editorial = visible.length >= 6 && !state.query && !filterCount;
  const editorialWomen = audience === 'women';
  const editorialImage = shoeStyle === 'sneakers' ? '/images/campaign/goya-sneakers.webp' : editorialWomen ? '/images/campaign/goya-movement-women.webp' : '/images/campaign/goya-movement-men.webp';
  const editorialHref = catalogPath(editorialWomen ? 'women' : 'men', shoeStyle === 'all' ? editorialWomen ? 'heels' : 'loafers' : shoeStyle);
  const editorialTitle = shoeStyle === 'sneakers' ? copy.editSneakers : editorialWomen ? copy.editWomen : copy.editMen;
  return <section id="collection" className={`reference-plp ${standalone ? 'reference-plp--standalone' : ''}`} tabIndex={-1}>
    <div className="reference-plp-heading"><h1>{title}</h1>{types.length > 1 && <nav className="reference-style-rail" aria-label={fr ? 'Types de souliers' : 'Shoe styles'}>{types.map(value => category !== undefined && standalone ? <Link key={value} href={stylePath(value)} aria-current={shoeStyle === value ? 'page' : undefined}>{styleName(value)}</Link> : <button type="button" key={value} aria-pressed={shoeStyle === value} onClick={() => dispatch({ type: 'shoeType', shoeType: value })}>{styleName(value)}</button>)}</nav>}</div>
    {edit === 'search' && <label className="reference-result-search"><Icon name="search" width={20} /><span className="sr-only">{copy.search}</span><input type="search" value={state.query} onChange={event => dispatch({ type: 'query', query: event.target.value })} placeholder={copy.searchPlaceholder} />{state.query && <button type="button" aria-label={t('clearSearch')} onClick={() => dispatch({ type: 'query', query: '' })}><Icon name="close" width={18} /></button>}</label>}
    <div className="reference-plp-toolbar"><p aria-live="polite">{products.length} {copy.products.toLowerCase()}</p><div><label className="reference-sort"><span>{copy.sortBy}</span><select value={state.sort} aria-label={copy.sortBy} onChange={event => dispatch({ type: 'sort', sort: event.target.value as CatalogSort })}><option value="recommended">{copy.recommended}</option><option value="priceAsc">{copy.priceAsc}</option><option value="priceDesc">{copy.priceDesc}</option></select><Icon name="chevron" width={12} /></label><button type="button" className="reference-filter-trigger" onClick={() => dispatch({ type: 'open', overlay: { kind: 'filters', category: audience, style: shoeStyle } })}>{copy.filters}{filterCount > 0 && <span>({filterCount})</span>}<Icon name="filter" width={18} /></button></div></div>
    {(filterCount > 0 || state.query) && <div className="reference-active-filters" aria-label={fr ? 'Filtres actifs' : 'Active filters'}>{state.query && <button type="button" onClick={() => dispatch({ type: 'query', query: '' })}>“{state.query}”<Icon name="close" width={12} /></button>}{(Object.keys(filters) as FacetName[]).flatMap(facet => (filters[facet] ?? []).map(value => <button type="button" key={`${facet}:${value}`} onClick={() => removeFilter(facet, value)}>{facetLabel(facet, value)}<Icon name="close" width={12} /></button>))}<button type="button" className="reference-clear-filters" onClick={clear}>{copy.clearAll}</button></div>}
    <div key={viewKey} className="reference-plp-grid" id="available-shoes">{visible.map(product => <Fragment key={product.id}><ProductCard product={product} index={catalog.indexOf(product)} />{editorial && visible.indexOf(product) === 1 && <Link href={editorialHref} className="reference-catalog-editorial"><Image src={editorialImage} alt={editorialTitle} fill sizes="(min-width: 900px) 50vw, 100vw" /><div><p>MAISON GOYA</p><h2>{editorialTitle}</h2><span>{copy.discover}<Icon name="arrow-right" width={20} /></span></div></Link>}</Fragment>)}</div>
    {products.length === 0 && <div className="reference-plp-empty"><Icon name="search" width={30} height={30} /><h2>{copy.empty}</h2><p>{copy.emptyBody}</p>{(filterCount > 0 || state.query) ? <button type="button" className="reference-load-more" onClick={clear}>{copy.clearAll}</button> : <Link className="reference-load-more" href="/collections">{copy.viewAll}</Link>}</div>}
    {products.length > 0 && <div className="reference-plp-pagination"><p>{copy.viewed} {visible.length} {copy.of} {products.length}</p><div className="reference-plp-progress"><span style={{ width: `${Math.min(100, visible.length / products.length * 100)}%` }} /></div>{visible.length < products.length && <button type="button" className="reference-load-more" onClick={() => setPage({ key: viewKey, limit: limit + 12 })}>{copy.loadMore}</button>}</div>}
    <footer className="reference-plp-description"><nav aria-label={fr ? 'Fil d’Ariane' : 'Breadcrumb'}><Link href="/">{fr ? 'Accueil' : 'Home'}</Link><span>/</span><span>{title}</span></nav><h2>{title}</h2><p>{edit === 'gifts' ? copy.giftIntro : copy.collectionIntro}</p><p className="reference-plp-demo">{copy.demo}</p></footer>
  </section>;
}
