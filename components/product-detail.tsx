'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { useShop } from '@/context/shop-context';
import { availableStock, cartQuantity, priceAmount } from '@/lib/commerce';
import { localizedText, siteText } from '@/lib/international';
import { shoeTypeOf } from '@/lib/merchandising';
import { SHOE_STYLE_LABELS } from '@/lib/catalog-edits';
import { shopRequest } from '@/lib/api';
import { imageSources } from '@/lib/assets';
import type { Product, SiteLocale } from '@/lib/types';
import { Header } from './header';
import { Footer } from './editorial';
import { Overlays } from './overlays';
import { Toast } from './controls';
import { MaisonImage } from './maison-image';
import { ProductCard } from './collection';
import { Icon } from './icon';
import { GoyaWordmark } from './goya-wordmark';
import { rememberFit, savedFit, savedFitIsRecommended } from './fit-guide';
export { FitFinder, ProductSizeGuide } from './fit-guide';

type GalleryView = { sources: string[]; campaign: boolean; label: string };
type DetailTab = 'details' | 'shipping' | 'care';

function productGallery(product: Product, language: SiteLocale): GalleryView[] {
  const uploaded = product.images?.length ? product.images : null;
  const grouped = new Map<string, string[]>();
  for (const source of uploaded ?? []) {
    const key = source.replace(/\.(?:jpe?g|webp|png)(?:\?.*)?$/i, '');
    const sources = grouped.get(key) ?? [];
    if (!sources.includes(source)) sources.push(source);
    grouped.set(key, sources);
  }
  return uploaded ? [...grouped.values()].map((sources, index) => ({ sources, campaign: false, label: siteText(language, 'View', 'Vue') + ' ' + (index + 1) })) : [{ sources: imageSources(product.image), campaign: false, label: siteText(language, 'The creation', 'La création') }];
}

function colorSwatch(color: string): string {
  const value = color.toLowerCase();
  if (value.includes('black')) return '#202020';
  if (value.includes('red')) return '#a92e30';
  if (value.includes('blue') || value.includes('navy')) return '#253c59';
  if (value.includes('green')) return '#a0af91';
  if (value.includes('cream')) return '#e7ddcb';
  if (value.includes('white')) return '#eeece5';
  if (value.includes('brown')) return '#73503d';
  if (value.includes('purple') || value.includes('lavender')) return '#9981b2';
  if (value.includes('yellow')) return '#d7af3b';
  if (value.includes('pink')) return '#c98f9e';
  if (value.includes('grey') || value.includes('gray')) return '#9a9a98';
  if (value.includes('orange')) return '#c8743a';
  return 'linear-gradient(135deg,#cdb95d 0 25%,#75939d 25% 50%,#aa5b48 50% 75%,#d9d2bc 75%)';
}

export function ProductDetail({ productId }: { productId: string }) {
  const { state, productById } = useShop();
  const product = productById.get(productId);
  return <>
    <Header />
    {!state.ready ? <main id="public-content" className="product-page pdp-loading" role="status"><span className="pdp-loading-mark"><GoyaWordmark /></span><p>{siteText(state.language, "Loading your creation…", "Chargement de votre création…")}</p></main> : product ? <ProductDetailContent key={product.id} product={product} /> : <main id="public-content" className="product-page pdp-not-found"><p className="pdp-overline">MAISON GOYA</p><h1>{siteText(state.language, "This creation is no longer available.", "Cette création n’est plus disponible.")}</h1><Link className="pdp-text-link" href="/collections">{siteText(state.language, "Discover the collection", "Découvrir la collection")}<Icon name="arrow-right" /></Link></main>}
    <Footer /><Overlays /><Toast />
  </>;
}

function ProductDetailContent({ product }: { product: Product }) {
  const { state, dispatch, t, money, remaining, productById, products } = useShop();
  const text = (en: string, fr: string) => siteText(state.language, en, fr);
  const views = productGallery(product, state.language);
  const style = shoeTypeOf(product);
  const styleLabel = style ? localizedText(SHOE_STYLE_LABELS[style], state.language) : t('accessories');
  const name = localizedText(product.name, state.language);
  const gallery = useRef<HTMLDivElement>(null);
  const zoomDialog = useRef<HTMLDialogElement>(null);
  const sizeSelect = useRef<HTMLButtonElement>(null);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const [visiblePhotos, setVisiblePhotos] = useState<number[]>([0]);
  const purchase = useRef<HTMLDivElement>(null);
  const [photo, setPhoto] = useState(0);
  const [zoomPhoto, setZoomPhoto] = useState<number | null>(null);
  const [magnified, setMagnified] = useState(false);
  const oneSize = product.kind !== 'footwear' && product.kind !== 'belt';
  const [selectedSize, setSelectedSize] = useState(() => savedFit(product.id) ?? (oneSize ? 'OS' : ''));
  const [fitSelection, setFitSelection] = useState(() => savedFitIsRecommended(product.id) ? savedFit(product.id) : null);
  const [sizeError, setSizeError] = useState(false);
  const [tab, setTab] = useState<DetailTab>('details');
  const [sticky, setSticky] = useState(false);

  const sizes = Object.keys(product.stock);
  const size = sizes.includes(selectedSize) ? selectedSize : '';
  const count = size ? remaining(product.id, size) : 0;
  const total = size ? availableStock(product.id, size, state.stockUsed, productById) : 0;
  const inBag = size ? cartQuantity(state.cart, product.id, size) : 0;
  const soldOut = sizes.every(value => availableStock(product.id, value, state.stockUsed, productById) === 0);
  const saved = state.wishlist.includes(product.id);
  const colorVariants = product.colorGroup ? products.filter(item => item.published !== false && item.colorGroup === product.colorGroup && item.category === product.category && item.kind === product.kind) : [product];
  const tabNames = { details: text('Product details', 'Détails du produit'), shipping: text('Shipping and returns', 'Livraison et retours'), care: text('Care and maintenance', 'Soin et entretien') };

  useEffect(() => {
    const applyFit = (event: Event) => {
      const detail = (event as CustomEvent<{ productId: string; size: string }>).detail;
      if (detail?.productId !== product.id || !Object.prototype.hasOwnProperty.call(product.stock, detail.size)) return;
      setSelectedSize(detail.size); setFitSelection(detail.size); setSizeError(false);
    };
    const applySize = (event: Event) => { const detail = (event as CustomEvent<{ productId: string; size: string }>).detail; if (detail?.productId === product.id && Object.hasOwn(product.stock, detail.size)) { setSelectedSize(detail.size); setFitSelection(null); setSizeError(false); rememberFit(product.id, detail.size, 'manual'); } };
    window.addEventListener('goya:fit', applyFit); window.addEventListener('goya:size', applySize);
    return () => { window.removeEventListener('goya:fit', applyFit); window.removeEventListener('goya:size', applySize); };
  }, [product.id, product.stock]);

  useEffect(() => {
    const target = purchase.current?.querySelector('button');
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => setSticky(entry.intersectionRatio < .5 && entry.boundingClientRect.top > 0), { threshold: [0, .5, 1] });
    observer.observe(target); return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (zoomPhoto === null) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = overflow; };
  }, [zoomPhoto]);

  const updateGallery = useCallback(() => {
    const element = gallery.current; if (!element) return;
    const vertical = matchMedia('(max-width:1023px)').matches;
    const extent = vertical ? element.clientHeight : element.clientWidth;
    const offset = vertical ? element.scrollTop : element.scrollLeft;
    const children = Array.from(element.children) as HTMLElement[];
    const firstOffset = vertical ? children[0]?.offsetTop ?? 0 : children[0]?.offsetLeft ?? 0;
    const visible = children.flatMap((child, index) => { const start = (vertical ? child.offsetTop : child.offsetLeft) - firstOffset; const size = vertical ? child.offsetHeight : child.offsetWidth; return Math.max(0, Math.min(start + size, offset + extent) - Math.max(start, offset)) / size >= .5 ? [index] : []; });
    setVisiblePhotos(previous => previous.join() === visible.join() ? previous : visible);
    const nearest = Math.max(0, Math.min(views.length - 1, Math.round(offset / (vertical ? children[0]?.offsetHeight || 1 : children[0]?.offsetWidth || 1))));
    setPhoto(nearest);
  }, [views.length]);
  useEffect(() => { const element = gallery.current; if (!element) return; const observer = new ResizeObserver(updateGallery); observer.observe(element); updateGallery(); return () => observer.disconnect(); }, [updateGallery]);
  const movePhoto = (index: number) => {
    const element = gallery.current; if (!element) return;
    const child = element.children[index] as HTMLElement | undefined; const first = element.children[0] as HTMLElement | undefined;
    if (!child || !first) return;
    element.scrollTo({ left: matchMedia('(min-width:1024px)').matches ? child.offsetLeft - first.offsetLeft : 0, top: matchMedia('(max-width:1023px)').matches ? child.offsetTop - first.offsetTop : 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    setPhoto(index);
  };
  const openZoom = (index: number) => { setZoomPhoto(index); setMagnified(false); requestAnimationFrame(() => zoomDialog.current?.showModal()); };
  const showAvailability = () => dispatch({ type: 'open', overlay: { kind: 'availability', productId: product.id, size: size || undefined } });
  const add = () => {
    if (soldOut || (size && total === 0)) { showAvailability(); return; }
    if (!size) { setSizeError(true); dispatch({ type: 'open', overlay: { kind: 'sizes', productId: product.id } }); return; }
    if (!count && inBag > 0) { dispatch({ type: 'open', overlay: { kind: 'cart' } }); return; }
    dispatch({ type: 'add', productId: product.id, size });
  };
  const addLabel = soldOut || (size && total === 0) ? (siteText(state.language, "Notify me", "M’avertir")) : size && !count && inBag ? (siteText(state.language, "View my bag", "Voir mon panier")) : t('addToCart');
  const onTabKey = (event: KeyboardEvent<HTMLButtonElement>, current: DetailTab) => {
    const list: DetailTab[] = ['details', 'shipping', 'care'];
    const direction = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!direction && event.key !== 'Home' && event.key !== 'End') return;
    event.preventDefault();
    const next = event.key === 'Home' ? list[0] : event.key === 'End' ? list[2] : list[(list.indexOf(current) + direction + list.length) % list.length];
    setTab(next); document.getElementById(`pdp-tab-${next}`)?.focus();
  };
  const buyButtons = (compact = false) => <div className={`pdp-buy-buttons ${compact ? 'pdp-buy-buttons--compact' : ''}`}><button type="button" className="pdp-add-button" onClick={add} disabled={!state.ready}>{addLabel}</button><button type="button" className="pdp-wishlist-button" aria-label={saved ? text('Remove from wishlist', 'Retirer de la liste de souhaits') : text('Add to wishlist', 'Ajouter à la liste de souhaits')} aria-pressed={saved} onClick={() => dispatch({ type: 'wishlist', productId: product.id })}><Icon name="heart" fill={saved ? 'currentColor' : 'none'} width={25} height={25} /></button></div>;

  return <main id="public-content" className="product-page" data-product-detail={product.id}>
    <div className="pdp-gallery-shell"><nav className="pdp-breadcrumbs" aria-label={text('Breadcrumb', 'Fil d’Ariane')}><Link href={product.category === 'women' ? '/women' : product.category === 'men' ? '/men' : '/accessories'}>{t(product.category)}</Link><span>/</span><Link href={'/' + product.category}>{product.kind === 'footwear' ? text('Shoes', 'Souliers') : t('accessories')}</Link><span>/</span><span aria-current="page">{styleLabel}</span></nav>
    <section className={'pdp-gallery' + (views.length === 1 ? ' pdp-gallery--single' : '')} aria-label={text('Product gallery', 'Galerie du produit')}>
      <div ref={gallery} className="pdp-gallery-rail" onScroll={updateGallery} onPointerDown={event => { if (event.pointerType === 'mouse' && matchMedia('(min-width:1024px)').matches) drag.current = { x: event.clientX, left: event.currentTarget.scrollLeft, moved: false }; }} onPointerMove={event => { const current = drag.current; if (!current) return; const dx = event.clientX - current.x; if (Math.abs(dx) > 5) { current.moved = true; suppressClick.current = true; event.currentTarget.classList.add('is-dragging'); event.currentTarget.setPointerCapture(event.pointerId); } if (current.moved) event.currentTarget.scrollLeft = current.left - dx; }} onPointerUp={event => { drag.current = null; event.currentTarget.classList.remove('is-dragging'); if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); setTimeout(() => { suppressClick.current = false; }, 0); }} onPointerCancel={event => { drag.current = null; event.currentTarget.classList.remove('is-dragging'); }} onClickCapture={event => { if (suppressClick.current) { event.preventDefault(); event.stopPropagation(); } }}>
        {views.map((view, index) => <div key={view.sources[0]} className={'pdp-gallery-slide' + (view.campaign ? ' pdp-gallery-slide--campaign' : '')}><button type="button" className="pdp-photo-trigger" aria-label={text('Enlarge', 'Agrandir') + ' ' + name + ' — ' + view.label} onDragStart={event => event.preventDefault()} onClick={() => openZoom(index)}><MaisonImage index={product.image} sources={view.sources} alt={name + ' — ' + view.label} sizes="(min-width:1024px) 42vw,100vw" preload={index === 0} className="pdp-media-photo" /></button></div>)}
      </div>
      <a className="pdp-similar-link" href="#pdp-recommendations">{text('See similar products', 'Voir des produits similaires')}</a>
      {views.length > 1 ? <div className="pdp-thumbnails" aria-label={text('Choose a photo', 'Choisir une photo')}>{views.map((view, index) => <button type="button" key={view.sources[0]} className={visiblePhotos.includes(index) ? 'is-visible' : ''} aria-label={view.label} aria-current={photo === index ? 'true' : undefined} onClick={() => movePhoto(index)}><MaisonImage index={product.image} sources={view.sources} alt="" sizes="48px" className={view.campaign ? 'pdp-thumbnail-cover' : 'pdp-thumbnail-contain'} /></button>)}</div> : null}
      <span className="pdp-photo-counter" aria-live="polite">{photo + 1}/{views.length}</span>{views.length > 1 ? <div className="pdp-mobile-scrollbar" aria-hidden="true"><span style={{ height: (100 / views.length) + '%', top: (photo / views.length * 100) + '%' }} /></div> : null}
    </section></div>

    <div className="pdp-content-shell"><section className="pdp-information" aria-label={name}>
      <div className="pdp-main-information"><p className="pdp-overline">MAISON GOYA</p><h1>{name}</h1><p className="pdp-price">{money(priceAmount(product.prices, state.currency))}</p>
        <div className="pdp-color"><p><span>{t('color')}:</span> {localizedText(product.color, state.language)}</p><div className="pdp-color-options" aria-label={text('Available colours', 'Couleurs disponibles')}>{colorVariants.map(variant => <Link key={variant.id} href={'/product/' + variant.id} aria-label={localizedText(variant.color, state.language)} aria-current={variant.id === product.id ? 'true' : undefined} className="pdp-color-swatch" onClick={() => { if (size && Object.hasOwn(variant.stock, size)) rememberFit(variant.id, size, fitSelection ? 'fit' : 'manual'); }}><span style={{ background: colorSwatch(variant.color.en) }} /></Link>)}</div></div>
        {oneSize ? <p className="pdp-one-size">{t('oneSize')}</p> : <div className="pdp-size-control"><div className="pdp-size-row"><button ref={sizeSelect} type="button" id={'pdp-size-' + product.id} className="pdp-size-select" aria-haspopup="dialog" aria-describedby={sizeError ? 'pdp-size-error-' + product.id : undefined} onClick={() => dispatch({ type: 'open', overlay: { kind: 'sizes', productId: product.id, size: size || undefined } })}><span>{fitSelection ? <Icon name="spark" width={15} /> : null}{t('size')}{size ? ': ' + size + (product.kind === 'belt' ? ' cm' : '') : ''}</span><Icon name="chevron" width={15} /></button>{product.kind === 'footwear' ? <button type="button" className="pdp-fit-finder-trigger" onClick={() => dispatch({ type: 'open', overlay: { kind: 'fit', productId: product.id } })}><Icon name="spark" width={17} /><span>{text('Find your size', 'Trouver votre pointure')}</span></button> : null}</div>{sizeError ? <p id={'pdp-size-error-' + product.id} className="pdp-size-error" role="alert">{t('selectSize')}</p> : null}</div>}
        <p className="pdp-stock sr-only" role="status">{size ? count > 0 ? t('inStock', { count }) : t('soldOut') : t('selectSize')}</p>
      </div>
      <div className="pdp-purchase" ref={purchase}>{buyButtons()}<Link className="pdp-delivery-note" href="/shipping-returns"><Icon name="truck" width={20} />{text('Shipping and returns', 'Livraison et retours')}</Link></div>
    </section>

    <section className="pdp-detail-section"><div className="pdp-detail-tabs" role="tablist" aria-label={text('Product information', 'Informations sur le produit')}>{(['details', 'shipping', 'care'] as DetailTab[]).map(value => <button key={value} type="button" id={'pdp-tab-' + value} role="tab" aria-selected={tab === value} aria-controls={'pdp-panel-' + value} tabIndex={tab === value ? 0 : -1} onClick={() => setTab(value)} onKeyDown={event => onTabKey(event, value)}>{tabNames[value]}</button>)}</div><div id={'pdp-panel-' + tab} className={'pdp-detail-panel pdp-detail-panel--' + tab} role="tabpanel" aria-labelledby={'pdp-tab-' + tab}><ProductInformationBody product={product} section={tab} /></div></section>
    <div className="pdp-mobile-details">{(['details', 'shipping', 'care'] as DetailTab[]).map(section => <button type="button" key={section} onClick={() => dispatch({ type: 'open', overlay: { kind: 'productInfo', productId: product.id, section } })}>{tabNames[section]}<Icon name="chevron-right" width={15} /></button>)}</div>

    </div><Recommendations product={product} products={products} />
    <button type="button" className={'pdp-sticky-buy' + (sticky ? ' is-visible' : '')} aria-hidden={!sticky} inert={!sticky} onClick={() => { add(); purchase.current?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center' }); }}><span className="pdp-mini-name">{name}</span><span className="pdp-mini-price">{money(priceAmount(product.prices, state.currency))}</span><span className="pdp-mini-icon"><Icon name="bag" width={18} /></span></button>

    <dialog ref={zoomDialog} className="pdp-zoom-dialog" aria-label={siteText(state.language, "Product image zoom", "Agrandissement du produit")} onKeyDown={event => { if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); setZoomPhoto(current => Math.min(views.length - 1, Math.max(0, (current ?? 0) + (event.key === 'ArrowRight' ? 1 : -1)))); setMagnified(false); } }} onClose={() => { setZoomPhoto(null); setMagnified(false); }} onClick={event => { if (event.target === event.currentTarget) zoomDialog.current?.close(); }}><header className="pdp-zoom-header"><span>{text('Click to zoom', 'Cliquer pour agrandir')}</span><button type="button" onClick={() => zoomDialog.current?.close()} aria-label={siteText(state.language, "Close image zoom", "Fermer l’agrandissement")}><Icon name="close" width={27} /></button></header><div className="pdp-zoom-window"><button type="button" className={`pdp-zoom-canvas ${magnified ? 'is-magnified' : ''}`} onClick={() => setMagnified(!magnified)} aria-label={magnified ? text('Zoom out', 'Réduire l’image') : text('Zoom in', 'Agrandir davantage')}>{zoomPhoto !== null && views[zoomPhoto] && <MaisonImage key={views[zoomPhoto].sources[0]} index={product.image} sources={views[zoomPhoto].sources} alt={`${name} — ${views[zoomPhoto].label}`} sizes="180vw" className="pdp-zoom-photo" />}</button></div><footer className="pdp-zoom-footer"><button type="button" disabled={zoomPhoto === null || zoomPhoto === 0} onClick={() => { setZoomPhoto((zoomPhoto ?? 0) - 1); setMagnified(false); }} aria-label={siteText(state.language, "Previous photo", "Photo précédente")}><Icon name="chevron-left" /></button><span>{(zoomPhoto ?? 0) + 1} / {views.length}</span><button type="button" disabled={zoomPhoto === null || zoomPhoto === views.length - 1} onClick={() => { setZoomPhoto((zoomPhoto ?? 0) + 1); setMagnified(false); }} aria-label={siteText(state.language, "Next photo", "Photo suivante")}><Icon name="chevron-right" /></button></footer></dialog>
  </main>;
}

function Recommendations({ product, products }: { product: Product; products: Product[] }) {
  const { state } = useShop();
  const rail = useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = useState({ start: true, end: false });
  const recommendations = [...products].filter(item => item.id !== product.id && item.published !== false && (!product.colorGroup || item.colorGroup !== product.colorGroup)).sort((a, b) => Number(b.category === product.category) - Number(a.category === product.category)).slice(0, 8);
  useEffect(() => {
    const element = rail.current; if (!element) return;
    const update = () => setBounds({ start: element.scrollLeft < 8, end: element.scrollLeft + element.clientWidth >= element.scrollWidth - 8 });
    const observer = new ResizeObserver(update); observer.observe(element); element.addEventListener('scroll', update, { passive: true }); update();
    return () => { observer.disconnect(); element.removeEventListener('scroll', update); };
  }, []);
  if (!recommendations.length) return null;
  const move = (direction: number) => { const element = rail.current; if (element) element.scrollBy({ left: direction * element.clientWidth, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); };
  return <section id="pdp-recommendations" className="pdp-recommendations"><header><h2>{siteText(state.language, "You may also like", "Vous aimerez aussi")}</h2><div><button type="button" aria-label={siteText(state.language, "Previous creations", "Créations précédentes")} disabled={bounds.start} onClick={() => move(-1)}><Icon name="chevron-left" /></button><button type="button" aria-label={siteText(state.language, "Next creations", "Créations suivantes")} disabled={bounds.end} onClick={() => move(1)}><Icon name="chevron-right" /></button></div></header><div className="pdp-recommendation-rail" ref={rail}>{recommendations.map(item => <ProductCard key={item.id} product={item} index={products.indexOf(item)} />)}</div></section>;
}


function ProductInformationBody({ product, section }: { product: Product; section: DetailTab }) {
  const { state, t } = useShop(); const text = (en: string, fr: string) => siteText(state.language, en, fr);
  return section === 'details' ? <><div className="pdp-description-copy"><h2>{text('Description', 'Description')}</h2><p>{localizedText(product.description, state.language)}</p><p className="pdp-reference">{text('Product ID', 'Référence du produit')}: {product.id}</p></div><div className="pdp-specifications"><h2>{text('Product details', 'Détails du produit')}</h2><ul>{localizedText(product.material, state.language).split('·').map(value => <li key={value}>{value.trim()}</li>)}<li>{t('color')}: {localizedText(product.color, state.language)}</li></ul></div></> : section === 'shipping' ? <div><h2>{text('Shipping and returns', 'Livraison et retours')}</h2><p>{text('Choose your country and delivery option at checkout. Charges are calculated in your selected currency before you confirm your order.', 'Choisissez votre pays et votre mode de livraison lors du paiement. Les frais sont calculés dans votre devise avant la confirmation de la commande.')}</p><p>{text('Demonstration experience. No real parcel is shipped.', 'Expérience de démonstration. Aucun colis réel n’est expédié.')}</p><Link href="/shipping-returns" className="pdp-text-link">{text('Learn more', 'En savoir plus')}<Icon name="arrow-right" width={16} /></Link></div> : <div><h2>{t('careTitle')}</h2><p>{t('careText')}</p><Link href="/shoe-care" className="pdp-text-link">{text('Discover shoe care', 'Découvrir l’entretien')}<Icon name="arrow-right" width={16} /></Link></div>;
}

export function ProductInformation({ productId, section }: { productId: string; section: DetailTab }) {
  const { productById } = useShop(); const product = productById.get(productId);
  return product ? <div className="pdp-mobile-information"><ProductInformationBody product={product} section={section} /></div> : null;
}

export function ProductSizeSelector({ productId, size }: { productId: string; size?: string }) {
  const { state, productById, dispatch, remaining, t } = useShop(); const product = productById.get(productId);
  if (!product) return null;
  const text = (en: string, fr: string) => siteText(state.language, en, fr);
  const select = (value: string) => { rememberFit(productId, value, 'manual'); window.dispatchEvent(new CustomEvent('goya:size', { detail: { productId, size: value } })); dispatch({ type: 'close' }); };
  return <div className="pdp-size-drawer"><ul>{Object.keys(product.stock).map(value => { const available = remaining(productId, value) > 0; return <li key={value}><button type="button" aria-current={size === value ? 'true' : undefined} className={available ? '' : 'is-unavailable'} onClick={() => available ? select(value) : dispatch({ type: 'open', overlay: { kind: 'availability', productId, size: value } })}><span>{value === 'OS' ? t('oneSize') : value}{savedFitIsRecommended(productId) && savedFit(productId) === value ? <Icon name="spark" width={15} /> : null}</span>{available ? null : <span>{text('Notify me', 'M’avertir')}<Icon name="mail" width={19} /></span>}</button></li>; })}</ul>{product.kind === 'footwear' ? <button type="button" className="pdp-size-drawer-guide" onClick={() => dispatch({ type: 'open', overlay: { kind: 'sizeGuide', productId } })}>{text('Size guide', 'Guide des pointures')}</button> : null}</div>;
}

export function AvailabilityNotice({ productId, size: requestedSize }: { productId: string; size?: string }) {
  const { state, productById, dispatch, refresh, t } = useShop();
  const product = productById.get(productId);
  const [email, setEmail] = useState(state.user?.email ?? '');
  const [firstName, setFirstName] = useState(state.user?.name.split(' ')[0] ?? '');
  const [lastName, setLastName] = useState(state.user?.name.split(' ').slice(1).join(' ') ?? '');
  const [newsletter, setNewsletter] = useState(false);
  const [saved, setSaved] = useState(''); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const submitting = useRef(false);
  if (!product) return null;
  const text = (en: string, fr: string) => siteText(state.language, en, fr);
  const size = requestedSize ?? Object.keys(product.stock).find(value => product.stock[value] <= 0) ?? Object.keys(product.stock)[0];
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (submitting.current) return; submitting.current = true; setBusy(true); setError('');
    try { if (!state.user) await shopRequest('guestSession'); const { request } = await shopRequest<{ request: { id: string } }>('availabilityRequest', { productId, size, email: email.trim(), name: (firstName + ' ' + lastName).trim(), firstName: firstName.trim(), lastName: lastName.trim(), newsletter, locale: state.locale }); setSaved(request.id); await refresh(true); }
    catch { setError(text('We could not save your request. Please try again.', 'Votre demande n’a pas pu être enregistrée. Veuillez réessayer.')); } finally { submitting.current = false; setBusy(false); }
  };
  return <div className="pdp-availability-notice exact-notify-form"><button type="button" className="pdp-notify-back" onClick={() => dispatch({ type: 'open', overlay: { kind: 'sizes', productId, size } })}><Icon name="chevron-left" width={13} />{text('Return to sizes', 'Retour aux pointures')}</button>{saved ? <div className="pdp-availability-success" role="status"><h2>{text('Your demo request is saved.', 'Votre demande de démonstration est enregistrée.')}</h2><p>{saved}</p><p>{text('Follow its progress in your service requests. No real email is sent.', 'Suivez son évolution dans vos demandes de service. Aucun e-mail réel n’est envoyé.')}</p><Link className="pdp-text-link" href="/my-requests" onClick={() => dispatch({ type: 'close' })}>{text('Follow my request', 'Suivre ma demande')}<Icon name="arrow-right" width={16} /></Link></div> : <form onSubmit={submit} method="post"><p>{text('This size is currently unavailable. Enter your details to save a demonstration availability request.', 'Cette pointure est actuellement indisponible. Saisissez vos coordonnées pour enregistrer une demande de disponibilité de démonstration.')} <strong>{t('size')}: {size}</strong></p><label><span>{text('First Name', 'Prénom')} *</span><input name="firstName" value={firstName} onChange={event => setFirstName(event.target.value)} autoComplete="given-name" required maxLength={50} placeholder={text('First name', 'Prénom')} /></label><label><span>{text('Last Name', 'Nom')} *</span><input name="lastName" value={lastName} onChange={event => setLastName(event.target.value)} autoComplete="family-name" required maxLength={50} placeholder={text('Last name', 'Nom')} /></label><label><span>{text('Email', 'E-mail')} *</span><input name="email" type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" required maxLength={254} placeholder={text('Email', 'E-mail')} /></label><label className="pdp-notify-consent"><input type="checkbox" checked={newsletter} onChange={event => setNewsletter(event.target.checked)} /><span>{text('Stay in touch with Goya. Save my newsletter preference for this demonstration.', 'Gardez le contact avec Goya. Enregistrez ma préférence de newsletter pour cette démonstration.')} <Link href="/legal/privacy">{t('privacyInfo')}</Link></span></label><p className="pdp-notify-privacy">{text('Goya saves these demonstration details to follow your request.', 'Goya enregistre ces coordonnées de démonstration pour suivre votre demande.')} <Link href="/legal/privacy">{t('privacyInfo')}</Link></p>{error ? <p role="alert" className="pdp-size-error">{error}</p> : null}<button type="submit" className="pdp-add-button" disabled={busy || !state.ready}>{busy ? t('saving') : text('Notify me', 'M’avertir')}</button></form>}</div>;
}
