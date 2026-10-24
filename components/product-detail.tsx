'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { useShop } from '@/context/shop-context';
import { availableStock, cartQuantity } from '@/lib/commerce';
import { shopRequest } from '@/lib/api';
import { imageSources } from '@/lib/assets';
import type { Product } from '@/lib/types';
import { Header } from './header';
import { Footer } from './editorial';
import { Overlays } from './overlays';
import { Toast } from './controls';
import { MaisonImage } from './maison-image';
import { ProductCard } from './collection';
import { Icon } from './icon';
import { rememberFit, savedFit } from './fit-guide';
export { FitFinder, ProductSizeGuide } from './fit-guide';

type GalleryView = { sources: string[]; campaign: boolean; label: string };
type DetailTab = 'details' | 'shipping' | 'care';

function productGallery(product: Product, fr: boolean): GalleryView[] {
  const uploaded = product.images?.length ? product.images : null;
  const grouped = new Map<string, string[]>();
  for (const source of uploaded ?? []) {
    const key = source.replace(/\.(?:jpe?g|webp|png)(?:\?.*)?$/i, '');
    const sources = grouped.get(key) ?? [];
    if (!sources.includes(source)) sources.push(source);
    grouped.set(key, sources);
  }
  const views: GalleryView[] = uploaded ? [...grouped.values()].map((sources, index) => ({ sources, campaign: false, label: `${fr ? 'Vue' : 'View'} ${index + 1}` })) : [{ sources: imageSources(product.image), campaign: false, label: fr ? 'La création' : 'The creation' }];
  const original = imageSources(product.image);
  const unchangedPhoto = !uploaded || uploaded.every(source => original.includes(source));
  if (unchangedPhoto && product.id === 'francesco' && product.image === 3) {
    views.push({ sources: ['/images/campaign/goya-movement-men.webp'], campaign: true, label: fr ? 'La signature Goya en mouvement' : 'The Goya signature in motion' });
    views.push({ sources: ['/images/campaign/goya-signature.webp'], campaign: true, label: fr ? 'L’univers de la création' : 'The world of the creation' });
  } else if (unchangedPhoto && product.id === 'kanvo-oxford' && product.image === 7) {
    views.push({ sources: ['/images/campaign/goya-sneakers.webp'], campaign: true, label: fr ? 'La basket Goya portée' : 'The Goya sneaker, worn' });
  } else if (unchangedPhoto && product.id === 'calfskin-belt' && product.image === 9) {
    views.push({ sources: ['/images/campaign/goya-boots.webp'], campaign: true, label: fr ? 'La bottine Goya en lumière' : 'The Goya boot in the light' });
  }
  return views;
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
  const fr = state.locale === 'fr';
  return <>
    <Header />
    {!state.ready ? <main id="public-content" className="product-page pdp-loading" role="status"><span className="pdp-loading-mark">Goya</span><p>{fr ? 'Chargement de votre création…' : 'Loading your creation…'}</p></main> : product ? <ProductDetailContent key={product.id} product={product} /> : <main id="public-content" className="product-page pdp-not-found"><p className="pdp-overline">MAISON GOYA</p><h1>{fr ? 'Cette création n’est plus disponible.' : 'This creation is no longer available.'}</h1><Link className="pdp-text-link" href="/collections">{fr ? 'Découvrir la collection' : 'Discover the collection'}<Icon name="arrow-right" /></Link></main>}
    <Footer /><Overlays /><Toast />
  </>;
}

function ProductDetailContent({ product }: { product: Product }) {
  const { state, dispatch, t, money, remaining, productById, products } = useShop();
  const fr = state.locale === 'fr';
  const views = productGallery(product, fr);
  const name = product.name[state.locale];
  const gallery = useRef<HTMLDivElement>(null);
  const zoomDialog = useRef<HTMLDialogElement>(null);
  const sizeSelect = useRef<HTMLSelectElement>(null);
  const purchase = useRef<HTMLDivElement>(null);
  const [photo, setPhoto] = useState(0);
  const [zoomPhoto, setZoomPhoto] = useState<number | null>(null);
  const [magnified, setMagnified] = useState(false);
  const oneSize = product.kind !== 'footwear' && product.kind !== 'belt';
  const [selectedSize, setSelectedSize] = useState(() => savedFit(product.id) ?? (oneSize ? 'OS' : ''));
  const [fitSelection, setFitSelection] = useState(() => savedFit(product.id));
  const [sizeError, setSizeError] = useState(false);
  const [tab, setTab] = useState<DetailTab>('details');
  const [sticky, setSticky] = useState(false);
  const [shareMessage, setShareMessage] = useState('');
  const [shareFallback, setShareFallback] = useState('');
  const sizes = Object.keys(product.stock);
  const size = sizes.includes(selectedSize) ? selectedSize : '';
  const count = size ? remaining(product.id, size) : 0;
  const total = size ? availableStock(product.id, size, state.stockUsed, productById) : 0;
  const inBag = size ? cartQuantity(state.cart, product.id, size) : 0;
  const soldOut = sizes.every(value => availableStock(product.id, value, state.stockUsed, productById) === 0);
  const saved = state.wishlist.includes(product.id);
  const colorVariants = product.colorGroup ? products.filter(item => item.published !== false && item.colorGroup === product.colorGroup && item.category === product.category && item.kind === product.kind) : [product];
  const tabNames = { details: fr ? 'Détails du produit' : 'Product details', shipping: fr ? 'Livraison et retours' : 'Shipping and returns', care: fr ? 'Soin et entretien' : 'Care and maintenance' };

  useEffect(() => {
    const applyFit = (event: Event) => {
      const detail = (event as CustomEvent<{ productId: string; size: string }>).detail;
      if (detail?.productId !== product.id || !Object.prototype.hasOwnProperty.call(product.stock, detail.size)) return;
      setSelectedSize(detail.size); setFitSelection(detail.size); setSizeError(false);
    };
    window.addEventListener('goya:fit', applyFit);
    return () => window.removeEventListener('goya:fit', applyFit);
  }, [product.id, product.stock]);

  useEffect(() => {
    const target = purchase.current;
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => setSticky(!entry.isIntersecting && entry.boundingClientRect.top < 0), { threshold: .1 });
    observer.observe(target); return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (zoomPhoto === null) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = overflow; };
  }, [zoomPhoto]);

  const movePhoto = (index: number) => {
    const element = gallery.current;
    if (!element) return;
    const distance = Math.max(0, element.scrollWidth - element.clientWidth);
    element.scrollTo({ left: views.length > 1 ? distance * index / (views.length - 1) : 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    setPhoto(index);
  };
  const openZoom = (index: number) => { setZoomPhoto(index); setMagnified(false); requestAnimationFrame(() => zoomDialog.current?.showModal()); };
  const showAvailability = () => dispatch({ type: 'open', overlay: { kind: 'availability', productId: product.id, size: size || undefined } });
  const add = () => {
    if (soldOut || (size && total === 0)) { showAvailability(); return; }
    if (!size) { setSizeError(true); sizeSelect.current?.focus(); return; }
    if (!count && inBag > 0) { dispatch({ type: 'open', overlay: { kind: 'cart' } }); return; }
    dispatch({ type: 'add', productId: product.id, size });
  };
  const addLabel = soldOut || (size && total === 0) ? (fr ? 'M’avertir' : 'Notify me') : size && !count && inBag ? (fr ? 'Voir mon panier' : 'View my bag') : t('addToCart');
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) { await navigator.share({ title: name, url }); return; }
      await navigator.clipboard.writeText(url); setShareMessage(fr ? 'Lien copié.' : 'Link copied.');
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      setShareFallback(url); setShareMessage(fr ? 'Copiez ce lien pour partager la création.' : 'Copy this link to share the creation.');
    }
  };
  const onTabKey = (event: KeyboardEvent<HTMLButtonElement>, current: DetailTab) => {
    const list: DetailTab[] = ['details', 'shipping', 'care'];
    const direction = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!direction && event.key !== 'Home' && event.key !== 'End') return;
    event.preventDefault();
    const next = event.key === 'Home' ? list[0] : event.key === 'End' ? list[2] : list[(list.indexOf(current) + direction + list.length) % list.length];
    setTab(next); document.getElementById(`pdp-tab-${next}`)?.focus();
  };
  const buyButtons = (compact = false) => <div className={`pdp-buy-buttons ${compact ? 'pdp-buy-buttons--compact' : ''}`}><button type="button" className="pdp-add-button" onClick={add} disabled={!state.ready}>{addLabel}</button><button type="button" className="pdp-wishlist-button" aria-label={fr ? saved ? 'Retirer des favoris' : 'Ajouter aux favoris' : saved ? 'Remove from wishlist' : 'Add to wishlist'} aria-pressed={saved} onClick={() => dispatch({ type: 'wishlist', productId: product.id })}><Icon name="heart" fill={saved ? 'currentColor' : 'none'} width={25} height={25} /></button></div>;

  return <main id="public-content" className="product-page" data-product-detail={product.id}>
    <nav className="pdp-breadcrumbs" aria-label={fr ? 'Fil d’Ariane' : 'Breadcrumb'}><Link href={product.category === 'women' ? '/women' : product.category === 'men' ? '/men' : '/accessories'}>{t(product.category)}</Link><span>/</span><Link href={`/${product.category}`}>{product.kind === 'footwear' ? (fr ? 'Souliers' : 'Shoes') : t('accessories')}</Link><span>/</span><span aria-current="page">{name}</span></nav>
    <section className={`pdp-gallery ${views.length === 1 ? 'pdp-gallery--single' : views.length === 2 ? 'pdp-gallery--pair' : ''}`} aria-label={fr ? 'Galerie du produit' : 'Product gallery'}>
      <div ref={gallery} className="pdp-gallery-rail" onScroll={event => {
        const element = event.currentTarget; const distance = element.scrollWidth - element.clientWidth;
        if (distance <= 0) return;
        const next = Math.min(views.length - 1, Math.max(0, Math.round(element.scrollLeft / distance * (views.length - 1))));
        setPhoto(current => current === next ? current : next);
      }}>
        {views.map((view, index) => <div key={view.sources[0]} className={`pdp-gallery-slide ${view.campaign ? 'pdp-gallery-slide--campaign' : ''}`}><button type="button" className="pdp-photo-trigger" aria-label={`${fr ? 'Agrandir' : 'Enlarge'} ${name} — ${view.label}`} onClick={() => openZoom(index)}><MaisonImage index={product.image} sources={view.sources} alt={`${name} — ${view.label}`} sizes={views.length === 1 ? '100vw' : '(min-width: 800px) 50vw, 100vw'} preload={index === 0} className="pdp-media-photo" /><span className="pdp-photo-zoom"><Icon name="zoom" width={19} /></span></button></div>)}
      </div>
      <a className="pdp-similar-link" href="#pdp-recommendations">{fr ? 'Voir des créations similaires' : 'See similar creations'}</a>
      {views.length > 1 && <><button type="button" className="pdp-gallery-arrow pdp-gallery-arrow--previous" aria-label={fr ? 'Photo précédente' : 'Previous photo'} disabled={photo === 0} onClick={() => movePhoto(photo - 1)}><Icon name="chevron-left" width={26} /></button><button type="button" className="pdp-gallery-arrow pdp-gallery-arrow--next" aria-label={fr ? 'Photo suivante' : 'Next photo'} disabled={photo === views.length - 1} onClick={() => movePhoto(photo + 1)}><Icon name="chevron-right" width={26} /></button><div className="pdp-thumbnails" aria-label={fr ? 'Choisir une photo' : 'Choose a photo'}>{views.map((view, index) => <button type="button" key={view.sources[0]} aria-label={view.label} aria-current={photo === index ? 'true' : undefined} onClick={() => movePhoto(index)}><MaisonImage index={product.image} sources={view.sources} alt="" sizes="60px" className={view.campaign ? 'pdp-thumbnail-cover' : 'pdp-thumbnail-contain'} /></button>)}</div></>}
      <span className="pdp-photo-counter" aria-live="polite">{photo + 1} / {views.length}</span>
    </section>

    <section className="pdp-information" aria-label={name}>
      <div className="pdp-main-information"><p className="pdp-overline">MAISON GOYA · {t(product.badge)}</p><h1>{name}</h1><p className="pdp-price">{money(product.prices[state.currency])}</p><div className="pdp-color"><p><span>{fr ? 'Couleur' : 'Color'}:</span> {product.color[state.locale]}</p><div className="pdp-color-options" aria-label={fr ? 'Couleurs disponibles' : 'Available colours'}>{colorVariants.map(variant => <Link key={variant.id} href={`/product/${variant.id}`} aria-label={`${variant.color[state.locale]}${variant.id === product.id ? fr ? ' — sélectionnée' : ' — selected' : ''}`} aria-current={variant.id === product.id ? 'true' : undefined} className="pdp-color-swatch" onClick={() => { if (size && Object.prototype.hasOwnProperty.call(variant.stock, size)) rememberFit(variant.id, size); }}><span style={{ background: colorSwatch(variant.color.en) }} /></Link>)}</div></div>
        {oneSize ? <p className="pdp-one-size">{t('oneSize')}</p> : <div className="pdp-size-control"><div className="pdp-size-heading"><label htmlFor={`pdp-size-${product.id}`}>{fr ? product.kind === 'footwear' ? 'Pointure' : 'Taille' : 'Size'}{product.kind === 'footwear' && <span>EU</span>}</label>{product.kind === 'footwear' && <button type="button" className="pdp-text-link" onClick={() => dispatch({ type: 'open', overlay: { kind: 'sizeGuide', productId: product.id } })}>{fr ? 'Guide des pointures' : 'Size guide'}</button>}</div><div className="pdp-select-wrap"><select ref={sizeSelect} id={`pdp-size-${product.id}`} value={size} aria-invalid={sizeError || undefined} aria-describedby={sizeError ? 'pdp-size-error' : undefined} onChange={event => { setSelectedSize(event.target.value); setSizeError(false); }}><option value="">{fr ? 'Choisissez votre pointure' : 'Select your size'}</option>{sizes.map(value => <option key={value} value={value}>{product.kind === 'footwear' ? 'EU ' : ''}{value}{product.kind === 'belt' ? ' cm' : ''}{availableStock(product.id, value, state.stockUsed, productById) === 0 ? (fr ? ' — Indisponible' : ' — Unavailable') : ''}</option>)}</select><Icon name="chevron" width={15} /></div>{sizeError && <p id="pdp-size-error" className="pdp-size-error" role="alert">{fr ? 'Sélectionnez une pointure pour continuer.' : 'Select a size to continue.'}</p>}{product.kind === 'footwear' && <button type="button" className="pdp-fit-finder-trigger" onClick={() => dispatch({ type: 'open', overlay: { kind: 'fit', productId: product.id } })}><Icon name="spark" width={15} />{fr ? 'Trouver ma pointure' : 'Find your size'}</button>}{fitSelection && <p className="pdp-recommended-size">{fr ? 'Votre conseil de pointure' : 'Your size recommendation'}: EU {fitSelection}</p>}</div>}
        <p className="pdp-stock" role="status">{size ? count > 0 ? <><span className="pdp-stock-dot" />{count <= 2 ? (fr ? `Plus que ${count} disponible${count > 1 ? 's' : ''}` : `Only ${count} available`) : (fr ? 'Disponible en ligne' : 'Available online')}</> : inBag > 0 ? (fr ? 'Les pièces disponibles sont déjà dans votre panier.' : 'The available pieces are already in your bag.') : (fr ? 'Cette pointure est actuellement indisponible.' : 'This size is currently unavailable.') : (fr ? 'Sélectionnez une pointure pour voir la disponibilité.' : 'Select a size to check availability.')}</p>
        {!oneSize && <button type="button" className="pdp-text-link pdp-availability-link" onClick={showAvailability}>{fr ? 'Vous ne trouvez pas votre pointure ?' : 'Can’t find your size?'}<Icon name="mail" width={15} /></button>}
      </div>
      <div className="pdp-purchase" ref={purchase}>{buyButtons()}<p className="pdp-delivery-note"><Icon name="truck" width={20} />{fr ? 'Livraison calculée lors du paiement' : 'Delivery calculated at checkout'}</p><Link className="pdp-text-link" href="/shipping-returns">{fr ? 'Livraison et retours' : 'Delivery and returns'}</Link><button type="button" className="pdp-share" onClick={() => void share()}><Icon name="share" width={17} />{fr ? 'Partager cette création' : 'Share this creation'}</button>{shareMessage && <p className="pdp-share-message" role="status">{shareMessage}</p>}{shareFallback && <input className="pdp-share-field" aria-label={fr ? 'Lien de la création' : 'Creation link'} value={shareFallback} readOnly onFocus={event => event.target.select()} />}</div>
    </section>

    <section className="pdp-detail-section"><div className="pdp-detail-tabs" role="tablist" aria-label={fr ? 'Informations sur le produit' : 'Product information'}>{(['details', 'shipping', 'care'] as DetailTab[]).map(value => <button key={value} type="button" id={`pdp-tab-${value}`} role="tab" aria-selected={tab === value} aria-controls={`pdp-panel-${value}`} tabIndex={tab === value ? 0 : -1} onClick={() => setTab(value)} onKeyDown={event => onTabKey(event, value)}>{tabNames[value]}</button>)}</div><div id={`pdp-panel-${tab}`} className="pdp-detail-panel" role="tabpanel" aria-labelledby={`pdp-tab-${tab}`} tabIndex={0}>
      {tab === 'details' && <><p>{product.description[state.locale]}</p><p className="pdp-reference">{fr ? 'Référence du produit' : 'Product reference'}: {product.id}</p><ul>{product.material[state.locale].split('·').map(material => <li key={material}>{material.trim()}</li>)}<li>{fr ? 'Couleur' : 'Color'}: {product.color[state.locale]}</li></ul><p className="pdp-demonstration-note">{t('productNote')}</p></>}
      {tab === 'shipping' && <><h2>{fr ? 'Livraison' : 'Delivery'}</h2><p>{fr ? 'Choisissez votre pays et votre mode de livraison lors du paiement. Les frais sont calculés dans votre devise avant la confirmation de la commande.' : 'Choose your country and delivery option at checkout. Charges are calculated in your selected currency before you confirm your order.'}</p><h2>{fr ? 'Retours et accompagnement' : 'Returns and assistance'}</h2><p>{fr ? 'Cette expérience est une démonstration : aucun colis réel n’est expédié. Consultez les informations de la Maison pour découvrir le parcours de livraison et de retour présenté.' : 'This is a demonstration experience: no physical parcel is sent. Explore the Maison’s information pages to see the delivery and returns journey.'}</p><Link className="pdp-text-link" href="/shipping-returns">{fr ? 'En savoir plus' : 'Learn more'}<Icon name="arrow-right" width={16} /></Link></>}
      {tab === 'care' && <><h2>{t('careTitle')}</h2><p>{t('careText')}</p><Link className="pdp-text-link" href="/shoe-care">{fr ? 'Découvrir les soins de l’atelier' : 'Discover atelier shoe care'}<Icon name="arrow-right" width={16} /></Link></>}
    </div></section>

    <Recommendations product={product} products={products} />
    <div className={`pdp-sticky-buy ${sticky ? 'is-visible' : ''}`} aria-hidden={!sticky} inert={!sticky}><div><strong>{name}</strong><span>{money(product.prices[state.currency])} <i /> {product.color[state.locale]}{size && ` · ${product.kind === 'footwear' ? 'EU ' : ''}${size}`}</span></div>{buyButtons(true)}</div>

    <dialog ref={zoomDialog} className="pdp-zoom-dialog" aria-label={fr ? 'Agrandissement du produit' : 'Product image zoom'} onClose={() => { setZoomPhoto(null); setMagnified(false); }} onClick={event => { if (event.target === event.currentTarget) zoomDialog.current?.close(); }}><header className="pdp-zoom-header"><span>{name}</span><button type="button" onClick={() => zoomDialog.current?.close()} aria-label={fr ? 'Fermer l’agrandissement' : 'Close image zoom'}><Icon name="close" width={27} /></button></header><div className="pdp-zoom-window"><button type="button" className={`pdp-zoom-canvas ${magnified ? 'is-magnified' : ''}`} onClick={() => setMagnified(!magnified)} aria-label={fr ? magnified ? 'Réduire l’image' : 'Agrandir davantage' : magnified ? 'Zoom out' : 'Zoom in'}>{zoomPhoto !== null && views[zoomPhoto] && <MaisonImage key={views[zoomPhoto].sources[0]} index={product.image} sources={views[zoomPhoto].sources} alt={`${name} — ${views[zoomPhoto].label}`} sizes="180vw" className="pdp-zoom-photo" />}</button></div><footer className="pdp-zoom-footer"><button type="button" disabled={zoomPhoto === null || zoomPhoto === 0} onClick={() => { setZoomPhoto((zoomPhoto ?? 0) - 1); setMagnified(false); }} aria-label={fr ? 'Photo précédente' : 'Previous photo'}><Icon name="chevron-left" /></button><span>{(zoomPhoto ?? 0) + 1} / {views.length}</span><button type="button" disabled={zoomPhoto === null || zoomPhoto === views.length - 1} onClick={() => { setZoomPhoto((zoomPhoto ?? 0) + 1); setMagnified(false); }} aria-label={fr ? 'Photo suivante' : 'Next photo'}><Icon name="chevron-right" /></button></footer></dialog>
  </main>;
}

function Recommendations({ product, products }: { product: Product; products: Product[] }) {
  const { state } = useShop();
  const fr = state.locale === 'fr';
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
  return <section id="pdp-recommendations" className="pdp-recommendations"><header><h2>{fr ? 'Vous aimerez aussi' : 'You may also like'}</h2><div><button type="button" aria-label={fr ? 'Créations précédentes' : 'Previous creations'} disabled={bounds.start} onClick={() => move(-1)}><Icon name="chevron-left" /></button><button type="button" aria-label={fr ? 'Créations suivantes' : 'Next creations'} disabled={bounds.end} onClick={() => move(1)}><Icon name="chevron-right" /></button></div></header><div className="pdp-recommendation-rail" ref={rail}>{recommendations.map(item => <ProductCard key={item.id} product={item} index={products.indexOf(item)} />)}</div></section>;
}

export function AvailabilityNotice({ productId, size: requestedSize }: { productId: string; size?: string }) {
  const { state, productById, dispatch, refresh, t } = useShop();
  const product = productById.get(productId);
  const fr = state.locale === 'fr';
  const [size, setSize] = useState(requestedSize ?? '');
  const [email, setEmail] = useState(state.user?.email ?? '');
  const [saved, setSaved] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (!product) return <div className="pdp-availability-notice"><h2>{fr ? 'Création indisponible' : 'Creation unavailable'}</h2><Link href="/collections" onClick={() => dispatch({ type: 'close' })}>{fr ? 'Voir la collection' : 'View the collection'}</Link></div>;
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (busy) return; setError(''); setBusy(true);
    try {
      if (!state.user) await shopRequest('guestSession');
      const { request } = await shopRequest<{ request: { id: string } }>('availabilityRequest', { productId, size: size || 'OS', email: email.trim(), locale: state.locale });
      setSaved(request.id); await refresh(true);
    } catch { setError(t('requestFailed')); }
    finally { setBusy(false); }
  };
  return <div className="pdp-availability-notice"><p className="pdp-overline">MAISON GOYA</p><h2>{fr ? 'Une création à retrouver.' : 'A creation to return to.'}</h2><p>{product.name[state.locale]}</p>{saved ? <div className="pdp-availability-success" role="status"><Icon name="check" width={30} height={30} /><h3>{fr ? 'Votre demande de démonstration est enregistrée.' : 'Your demo request is saved.'}</h3><p>{fr ? 'La Maison peut suivre votre demande et vous informer de son évolution dans cette démonstration. Aucun e-mail réel ne sera envoyé.' : 'The Maison can follow your request and update its progress in this demonstration. No real email will be sent.'}</p><p>{fr ? 'Référence' : 'Reference'}: {saved}</p><Link className="pdp-text-link" href="/my-requests" onClick={() => dispatch({ type: 'close' })}>{fr ? 'Suivre ma demande' : 'Follow my request'}<Icon name="arrow-right" width={16} /></Link><button type="button" className="pdp-add-button" onClick={() => dispatch({ type: 'close' })}>{fr ? 'Continuer la découverte' : 'Continue exploring'}</button></div> : <form method="post" onSubmit={submit}><p>{fr ? 'Enregistrez une demande de disponibilité pour cette création et votre pointure.' : 'Save an availability request for this creation and your size.'}</p>{(product.kind === 'footwear' || product.kind === 'belt') && <label><span>{fr ? 'Pointure' : 'Size'}</span><select value={size} onChange={event => setSize(event.target.value)} required><option value="">{fr ? 'Choisissez une pointure' : 'Choose a size'}</option>{Object.keys(product.stock).map(value => <option key={value} value={value}>{product.kind === 'footwear' ? 'EU ' : ''}{value}</option>)}</select></label>}<label><span>{fr ? 'Adresse e-mail' : 'Email address'}</span><input type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} required maxLength={254} /></label><p className="pdp-availability-demo">{fr ? 'Démonstration : utilisez des coordonnées fictives. Aucun e-mail ne sera envoyé.' : 'Demo: use fictitious details. No email will be sent.'}</p>{error && <p role="alert" className="pdp-size-error">{error}</p>}<button type="submit" className="pdp-add-button" disabled={busy || !state.ready}>{busy ? t('saving') : fr ? 'Enregistrer ma demande' : 'Save my request'}</button><Link className="pdp-text-link" href="/legal/privacy" onClick={() => dispatch({ type: 'close' })}>{fr ? 'Confidentialité' : 'Privacy'}</Link></form>}</div>;
}
