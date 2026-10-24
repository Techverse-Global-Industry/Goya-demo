'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Fragment, useEffect, useId, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useShop } from '@/context/shop-context';
import { availableStock, matchesProduct, normalizeSearch, priceAmount } from '@/lib/commerce';
import { searchScore } from '@/lib/search';
import { localizedText, siteText, translatedCopy } from '@/lib/international';
import { shoeTypeOf } from '@/lib/merchandising';
import { ACCESSORY_LABELS, ACCESSORY_TYPES, CONSTRUCTION_LABELS, SHOE_STYLE_LABELS, accessoryTypeOf, belongsToEdit, matchesAccessoryAudience, stylesFor } from '@/lib/catalog-edits';
import type { CatalogEdit } from '@/lib/catalog-edits';
import { catalogPath, EMPTY_FILTERS, matchesCatalogFilters, storefrontCopy } from '@/lib/storefront';
import type { CatalogFilters, CatalogSort, Category, Localized, Product, ShoeType, SiteLocale } from '@/lib/types';
import { MaisonImage } from './maison-image';
import { Icon } from './icon';

type CollectionProps = { category?: Category; style?: ShoeType; accessoryType?: string; accessoryAudience?: 'men' | 'women'; edit?: CatalogEdit; standalone?: boolean; selection?: readonly string[]; heading?: Localized; intro?: Localized };
type FacetName = keyof CatalogFilters;

function matchesLocalizedQuery(product: Product, query: string, language: SiteLocale) {
  if (matchesProduct(product, query)) return true;
  const style = shoeTypeOf(product);
  const corpus = normalizeSearch([product.name, product.description, product.material, product.color, ...(style ? [SHOE_STYLE_LABELS[style]] : [])].map(value => localizedText(value, language)).join(' '));
  return normalizeSearch(query).split(' ').filter(Boolean).every(term => corpus.includes(term));
}

function alternatePhoto(product: Product): string | undefined {
  const first = product.images?.[0]?.replace(/\.(?:jpe?g|webp|png)(?:\?.*)?$/i, '');
  return product.images?.find(source => source.replace(/\.(?:jpe?g|webp|png)(?:\?.*)?$/i, '') !== first);
}

export function ProductCard({ product, index }: { product: Product; index: number }) {
  const { state, t, money, productById } = useShop();
  const name = localizedText(product.name, state.language);
  const soldOut = Object.keys(product.stock).every(size => availableStock(product.id, size, state.stockUsed, productById) === 0);
  const tag = soldOut ? t('soldOut') : belongsToEdit(product, 'new') ? siteText(state.language, 'New collection', 'Nouvelle collection') : product.badge === 'limited' ? t('limited') : '';
  const alternate = alternatePhoto(product);
  const href = '/product/' + encodeURIComponent(product.id);
  return <article className="product-card reference-product-card" data-product-id={product.id} data-catalog-index={index}>
    <div className="reference-card-visual"><Link href={href} className="reference-card-image" aria-label={t('viewProduct', { name })}>
      <MaisonImage key={product.images?.join() ?? product.image} index={product.image} sources={product.images} alt={name} sizes="(min-width: 1024px) 25vw, 50vw" className="reference-card-photo" />
      {alternate ? <MaisonImage index={product.image} sources={[alternate]} alt="" sizes="(min-width: 1024px) 25vw, 50vw" className="reference-card-campaign" /> : null}
    </Link></div>
    <div className="reference-card-info">{tag ? <span className="reference-card-badge">{tag}</span> : null}<h3><Link href={href}>{name}</Link></h3><p className="reference-card-price">{money(priceAmount(product.prices, state.currency))}</p></div>
  </article>;
}

function SortControl() {
  const { state, dispatch } = useShop();
  const copy = translatedCopy(storefrontCopy[state.locale], state.language);
  const id = useId(); const container = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const options = [{ value: 'recommended', label: copy.recommended }, { value: 'priceAsc', label: copy.priceAsc }, { value: 'priceDesc', label: copy.priceDesc }] as const;
  useEffect(() => { if (!open) return; const outside = (event: PointerEvent) => { if (!container.current?.contains(event.target as Node)) setOpen(false); }; document.addEventListener('pointerdown', outside); return () => document.removeEventListener('pointerdown', outside); }, [open]);
  const select = (sort: CatalogSort) => { dispatch({ type: 'sort', sort }); setOpen(false); container.current?.querySelector<HTMLButtonElement>('[role="combobox"]')?.focus(); };
  const onKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Escape') { event.preventDefault(); setOpen(false); return; }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); setOpen(true); requestAnimationFrame(() => container.current?.querySelector<HTMLElement>('[aria-selected="true"]')?.focus()); }
  };
  return <div className="reference-sort reference-sort-custom" ref={container}><button type="button" role="combobox" aria-label={copy.sortBy} aria-expanded={open} aria-haspopup="listbox" aria-controls={id} onKeyDown={onKey} onClick={() => setOpen(value => !value)}><span>{copy.sortBy}</span><Icon name="chevron" width={12} /></button>{open ? <ul role="listbox" id={id} aria-label={copy.sortBy}>{options.map((option, index) => <li role="option" key={option.value} tabIndex={-1} aria-selected={state.sort === option.value} onClick={() => select(option.value)} onKeyDown={event => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); select(option.value); }
    if (event.key === 'Escape') { event.preventDefault(); setOpen(false); container.current?.querySelector<HTMLButtonElement>('[role="combobox"]')?.focus(); }
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) { event.preventDefault(); const next = event.key === 'Home' ? 0 : event.key === 'End' ? 2 : (index + (event.key === 'ArrowDown' ? 1 : 2)) % 3; container.current?.querySelectorAll<HTMLElement>('[role="option"]')[next]?.focus(); }
  }}>{option.label}</li>)}</ul> : null}</div>;
}

function WishlistRow({ product }: { product: Product }) {
  const { state, dispatch, t, money, remaining } = useShop();
  const [size, setSize] = useState(product.kind === 'footwear' || product.kind === 'belt' ? '' : 'OS');
  const name = localizedText(product.name, state.language);
  useEffect(() => { const select = (event: Event) => { const detail = (event as CustomEvent<{ productId: string; size: string }>).detail; if (detail?.productId === product.id) setSize(detail.size); }; window.addEventListener('goya:size', select); return () => window.removeEventListener('goya:size', select); }, [product.id]);
  const add = () => { if (!size) { dispatch({ type: 'open', overlay: { kind: 'sizes', productId: product.id } }); return; } if (remaining(product.id, size) <= 0) dispatch({ type: 'open', overlay: { kind: 'availability', productId: product.id, size } }); else dispatch({ type: 'add', productId: product.id, size }); };
  return <article className="reference-wishlist-row" data-product-id={product.id}>
    <Link className="reference-wishlist-photo" href={'/product/' + product.id}><MaisonImage index={product.image} sources={product.images} alt={name} sizes="(min-width:1024px) 180px,110px" /></Link>
    <div className="reference-wishlist-copy"><h2><Link href={'/product/' + product.id}>{name}</Link></h2><p>{t('color')}: {localizedText(product.color, state.language)}</p>{size && size !== 'OS' ? <p>{t('size')}: {size}</p> : null}</div><div className="reference-wishlist-footer"><button type="button" className="pdp-add-button" disabled={!state.ready} onClick={add}>{t('addToCart')}</button></div>
    <p className="reference-wishlist-price">{money(priceAmount(product.prices, state.currency))}</p><button type="button" className="reference-wishlist-remove" onClick={() => dispatch({ type: 'wishlist', productId: product.id })}>{t('remove')}<Icon name="close" width={13} /></button>
  </article>;
}

export function WishlistContent() {
  const { state, t } = useShop();
  const products = state.products.filter(product => product.published !== false && state.wishlist.includes(product.id));
  return <section className="reference-exact-wishlist"><header><h1>{siteText(state.language, 'Wishlist', 'Liste de souhaits')}</h1></header><div className="reference-wishlist-list">{products.length ? products.map(product => <WishlistRow key={product.id} product={product} />) : <div className="reference-wishlist-empty"><p>{siteText(state.language, 'Your wishlist is empty.', 'Votre liste de souhaits est vide.')}</p><Link href="/collections">{t('continueShopping')}<Icon name="arrow-right" width={16} /></Link></div>}</div></section>;
}

export function Collection({ category, style, accessoryType, accessoryAudience, edit = 'collection', standalone = false, selection, heading, intro }: CollectionProps = {}) {
  const { state, dispatch, products: catalog, t } = useShop();
  const copy = translatedCopy(storefrontCopy[state.locale], state.language);
  const audience = category ?? state.filter;
  const shoeStyle = style ?? state.shoeType;
  const types = stylesFor(audience);
  const styleName = (value: ShoeType) => value === 'all' ? copy.viewAll : copy[value];
  const stylePath = (value: ShoeType) => audience === 'all' ? value === 'all' ? '/collections' : catalogPath(['heels', 'pumps', 'flats', 'mules', 'sandals', 'boots'].includes(value) ? 'women' : 'men', value) : catalogPath(audience, value);
  const accessoryName = accessoryType && ACCESSORY_LABELS[accessoryType as keyof typeof ACCESSORY_LABELS];
  const accessoryLabel = accessoryName ? localizedText(accessoryName, state.language) : undefined;
  const accessoryPath = (kind?: string) => `/accessories${kind ? `/${kind}` : ''}${accessoryAudience ? `?audience=${accessoryAudience}` : ''}`;
  const familyTitle = (label: string) => audience === 'men' || accessoryAudience === 'men' ? siteText(state.language, "Men's {style}", '{style} homme').replace('{style}', label) : audience === 'women' || accessoryAudience === 'women' ? siteText(state.language, "Women's {style}", '{style} femme').replace('{style}', label) : label;
  const title = heading ? localizedText(heading, state.language) : edit === 'search' ? siteText(state.language, 'Search results', 'Résultats de recherche') : edit === 'gifts' ? audience === 'men' ? copy.forHim : audience === 'women' ? copy.forHer : copy.gifts : edit === 'new' ? familyTitle(copy.newArrivals) : edit === 'featured' ? siteText(state.language, 'The signature selection', 'La sélection signature') : accessoryLabel ? familyTitle(accessoryLabel) : shoeStyle !== 'all' ? familyTitle(styleName(shoeStyle)) : audience === 'men' ? siteText(state.language, "Men's shoes", 'Souliers homme') : audience === 'women' ? siteText(state.language, "Women's shoes", 'Souliers femme') : audience === 'accessories' ? familyTitle(copy.accessories) : siteText(state.language, 'The collection', 'La collection');
  const products = useMemo(() => catalog.filter(product => product.published !== false && (audience === 'all' || product.category === audience) && (shoeStyle === 'all' || shoeTypeOf(product) === shoeStyle) && (!accessoryType || accessoryTypeOf(product) === accessoryType) && matchesAccessoryAudience(product, accessoryAudience) && (!selection || selection.includes(product.id)) && belongsToEdit(product, edit) && matchesLocalizedQuery(product, state.query, state.language) && matchesCatalogFilters(product, state.catalogFilters)).sort((a, b) => state.sort === 'priceAsc' ? priceAmount(a.prices, state.currency) - priceAmount(b.prices, state.currency) : state.sort === 'priceDesc' ? priceAmount(b.prices, state.currency) - priceAmount(a.prices, state.currency) : selection ? selection.indexOf(a.id) - selection.indexOf(b.id) : state.query.trim() ? searchScore(b, state.query) - searchScore(a, state.query) : 0), [catalog, audience, shoeStyle, accessoryType, accessoryAudience, selection, state.query, state.catalogFilters, state.sort, state.currency, state.language, edit]);
  const viewKey = JSON.stringify([audience, shoeStyle, accessoryType, accessoryAudience, selection, state.query, state.catalogFilters, state.sort, state.currency, edit]);
  const [page, setPage] = useState({ key: '', limit: 30 });
  const limit = page.key === viewKey ? page.limit : 30;
  const visible = products.slice(0, limit);
  const filters = state.catalogFilters;
  const filterCount = Object.values(filters).reduce((count, values) => count + (values?.length ?? 0), 0);
  const removeFilter = (facet: FacetName, value: string) => dispatch({ type: 'catalogFilters', filters: { ...filters, [facet]: filters[facet]?.filter(item => item !== value) } });
  const facetLabel = (facet: FacetName, value: string) => facet === 'sizes' ? (value === 'OS' ? t('oneSize') : audience === 'accessories' ? accessoryType === 'belts' ? `${value} cm` : value : `EU ${value}`) : facet === 'genders' ? value === 'men' ? copy.man : value === 'women' ? copy.woman : copy.accessories : facet === 'constructions' ? CONSTRUCTION_LABELS[value] ? localizedText(CONSTRUCTION_LABELS[value], state.language) : value : facet === 'accessoryTypes' ? ACCESSORY_LABELS[value as keyof typeof ACCESSORY_LABELS] ? localizedText(ACCESSORY_LABELS[value as keyof typeof ACCESSORY_LABELS], state.language) : value : value in copy ? copy[value as keyof typeof copy] : value;
  const clear = () => { dispatch({ type: 'catalogFilters', filters: EMPTY_FILTERS }); dispatch({ type: 'query', query: '' }); };
  const editorial = visible.length >= 6 && !state.query && !filterCount;
  const editorialWomen = audience === 'women';
  const editorialImage = shoeStyle === 'sneakers' ? '/images/campaign/goya-sneakers.webp' : editorialWomen ? '/images/campaign/goya-movement-women.webp' : '/images/campaign/goya-movement-men.webp';
  const editorialHref = catalogPath(editorialWomen ? 'women' : 'men', shoeStyle === 'all' ? editorialWomen ? 'heels' : 'loafers' : shoeStyle);
  const editorialTitle = shoeStyle === 'sneakers' ? copy.editSneakers : editorialWomen ? copy.editWomen : copy.editMen;
  return <section id="collection" className={`reference-plp ${standalone ? 'reference-plp--standalone' : ''}`} tabIndex={-1}>
    <div className="reference-plp-heading"><h1>{title}</h1>{types.length > 1 && <nav className="reference-style-rail" aria-label={siteText(state.language, "Shoe styles", "Types de souliers")}>{types.map(value => category !== undefined && standalone ? <Link key={value} href={stylePath(value)} aria-current={shoeStyle === value ? 'page' : undefined}>{styleName(value)}</Link> : <button type="button" key={value} aria-pressed={shoeStyle === value} onClick={() => dispatch({ type: 'shoeType', shoeType: value })}>{styleName(value)}</button>)}</nav>}{audience === 'accessories' && <nav className="reference-style-rail reference-accessory-rail" aria-label={siteText(state.language, "Accessory categories", "Types d’accessoires")}><Link href={accessoryPath()} aria-current={!accessoryType ? 'page' : undefined}>{copy.viewAll}</Link>{ACCESSORY_TYPES.map(value => <Link key={value} href={accessoryPath(value)} aria-current={accessoryType === value ? 'page' : undefined}>{localizedText(ACCESSORY_LABELS[value], state.language)}</Link>)}</nav>}</div>
    {edit === 'search' && <label className="reference-result-search"><Icon name="search" width={20} /><span className="sr-only">{copy.search}</span><input type="search" value={state.query} onChange={event => dispatch({ type: 'query', query: event.target.value })} placeholder={copy.searchPlaceholder} />{state.query && <button type="button" aria-label={t('clearSearch')} onClick={() => dispatch({ type: 'query', query: '' })}><Icon name="close" width={18} /></button>}</label>}
    <div className="reference-plp-toolbar"><p aria-live="polite">{products.length} {copy.products.toLowerCase()}</p><div><SortControl />{filterCount > 0 ? <button type="button" className="reference-toolbar-reset" onClick={clear}>{copy.clearAll}</button> : null}<button type="button" className="reference-filter-trigger" onClick={() => dispatch({ type: 'open', overlay: { kind: 'filters', category: audience, style: shoeStyle, accessoryType, accessoryAudience, edit, selection: selection ? [...selection] : undefined } })}>{copy.filters}{filterCount > 0 && <span>({filterCount})</span>}</button></div></div>
    {(filterCount > 0 || state.query) && <div className="reference-active-filters" aria-label={siteText(state.language, "Active filters", "Filtres actifs")}>{state.query && <button type="button" onClick={() => dispatch({ type: 'query', query: '' })}>“{state.query}”<Icon name="close" width={12} /></button>}{(Object.keys(filters) as FacetName[]).flatMap(facet => (filters[facet] ?? []).map(value => <button type="button" key={`${facet}:${value}`} onClick={() => removeFilter(facet, value)}>{facetLabel(facet, value)}<Icon name="close" width={12} /></button>))}<button type="button" className="reference-clear-filters" onClick={clear}>{copy.clearAll}</button></div>}
    <div key={viewKey} className="reference-plp-grid" id="available-shoes">{visible.map(product => <Fragment key={product.id}><ProductCard product={product} index={catalog.indexOf(product)} />{editorial && visible.indexOf(product) === 1 && <Link href={editorialHref} className="reference-catalog-editorial"><Image src={editorialImage} alt={editorialTitle} fill sizes="(min-width: 900px) 50vw, 100vw" /><div><p>MAISON GOYA</p><h2>{editorialTitle}</h2><span>{copy.discover}<Icon name="arrow-right" width={20} /></span></div></Link>}</Fragment>)}</div>
    {products.length === 0 && <div className="reference-plp-empty"><Icon name="search" width={30} height={30} /><h2>{copy.empty}</h2><p>{copy.emptyBody}</p>{(filterCount > 0 || state.query) ? <button type="button" className="reference-load-more" onClick={clear}>{copy.clearAll}</button> : <Link className="reference-load-more" href="/collections">{copy.viewAll}</Link>}</div>}
    {products.length > 0 ? <div className="reference-plp-pagination">{visible.length < products.length ? <button type="button" className="reference-load-more" onClick={() => setPage({ key: viewKey, limit: limit + 30 })}><span>{copy.loadMore}</span><span>− {visible.length}/{products.length}</span></button> : <p>{visible.length}/{products.length}</p>}{products.length > 30 ? <nav aria-label={siteText(state.language, 'Catalogue pages', 'Pages du catalogue')}>{Array.from({ length: Math.ceil(products.length / 30) }, (_, index) => <button key={index} type="button" aria-current={Math.ceil(visible.length / 30) === index + 1 ? 'page' : undefined} onClick={() => { setPage({ key: viewKey, limit: (index + 1) * 30 }); document.getElementById('available-shoes')?.scrollIntoView(); }}>{index + 1}</button>)}</nav> : null}</div> : null}
    <footer className="reference-plp-description"><nav aria-label={siteText(state.language, "Breadcrumb", "Fil d’Ariane")}><Link href="/">{siteText(state.language, "Home", "Accueil")}</Link><span>/</span><span>{title}</span></nav><h2>{title}</h2><p>{(intro ? localizedText(intro, state.language) : undefined) ?? (edit === 'gifts' ? copy.giftIntro : copy.collectionIntro)}</p><p className="reference-plp-demo">{copy.demo}</p></footer>
  </section>;
}
