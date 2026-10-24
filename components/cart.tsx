'use client';

import { useEffect, useId, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { useShop } from '@/context/shop-context';
import { availableStock, cartQuantity, isPaymentAvailable, priceAmount, SHIPPING_THRESHOLD } from '@/lib/commerce';
import { localizedText, siteText, translatedCopy } from '@/lib/international';
import { RequestError } from '@/lib/api';
import { promoCopy } from '@/lib/promo-copy';
import { MaisonImage } from './maison-image';
import { CurrencySelect } from './controls';
import { Icon } from './icon';

export function QuickView({ productId }: { productId: string }) {
  const { t, productById } = useShop();
  const product = productById.get(productId);
  if (!product) return <div className="empty-state"><h2>{t('noResults')}</h2><p>{t('invalidCart')}</p></div>;
  return <QuickViewProduct key={product.id} product={product} />;
}

function QuickViewProduct({ product }: { product: import('@/lib/types').Product }) {
  const { state, dispatch, t, money, remaining, productById } = useShop();
  const productId = product.id;
  const [selectedSize, setSelectedSize] = useState(product.kind !== 'footwear' && product.kind !== 'belt' ? 'OS' : '');
  const [showError, setShowError] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const name = localizedText(product.name, state.language);
  const count = selectedSize ? remaining(productId, selectedSize) : 0;
  const inBag = selectedSize ? cartQuantity(state.cart, productId, selectedSize) : 0;
  const add = () => {
    if (!selectedSize) { setShowError(true); document.getElementById(`size-${productId}`)?.focus(); return; }
    dispatch({ type: 'add', productId, size: selectedSize });
  };
  return <div className="quick-view-layout">
    <div className="quick-view-image"><MaisonImage key={`${product.images?.join()}-${imageIndex}`} index={product.image} sources={product.images?.[imageIndex] ? [product.images[imageIndex]] : undefined} alt={name} sizes="(min-width: 800px) 45vw, 100vw" className="quick-view-photo" /><span className="product-badge">{t(product.badge)}</span>{(product.images?.length ?? 0) > 1 && <div className="photo-switcher">{product.images!.map((_, index) => <button key={index} type="button" aria-label={`${t('photo')} ${index + 1}`} aria-pressed={index === imageIndex} onClick={() => setImageIndex(index)}>{index + 1}</button>)}</div>}</div>
    <div className="quick-view-copy">
      <p className="eyebrow">{t(product.category)} · Maison Goya</p>
      <h2 className="modal-display-title">{name}</h2>
      <div className="quick-view-price"><span>{money(priceAmount(product.prices, state.currency))}</span><CurrencySelect /></div>
      <p className="product-description">{localizedText(product.description, state.language)}</p>
      <p className="color-detail"><span>{t('color')}</span>{localizedText(product.color, state.language)}</p>
      <fieldset className="size-fieldset" id={`size-${productId}`} tabIndex={-1} aria-describedby={showError ? 'quick-size-error' : undefined}>
        <legend>{t('chooseSize')}<span>{product.kind === 'footwear' ? t('sizeEU') : product.kind === 'belt' ? t('sizeCM') : t('oneSize')}</span></legend>
        <div className="size-grid">
          {Object.keys(product.stock).map((size) => {
            const available = remaining(productId, size);
            const total = availableStock(productId, size, state.stockUsed, productById);
            return <label key={size} className={`size-option ${selectedSize === size ? 'is-selected' : ''} ${!available ? 'is-unavailable' : ''}`}>
              <input type="radio" className="sr-only" name={`variant-${productId}`} value={size} checked={selectedSize === size} disabled={!available}
                onChange={() => { setSelectedSize(size); setShowError(false); }}
                aria-label={`${size === 'OS' ? t('oneSize') : size}${!available ? ` — ${t(total ? 'reserved' : 'soldOut')}` : ''}`} />
              <span>{size === 'OS' ? t('oneSize') : size}</span>
            </label>;
          })}
        </div>
      </fieldset>
      {showError && <p id="quick-size-error" className="field-error" role="alert">{t('selectSize')}</p>}
      <div className="stock-indicator" aria-live="polite">
        {selectedSize && <><span className={`stock-dot ${count === 0 ? 'is-empty' : ''}`} />{t(count ? 'inStock' : 'soldOut', { count })}{inBag > 0 && <span className="muted"> · {t('reserved')}: {inBag}</span>}</>}
      </div>
      <button type="button" className="button button-gold button-full" onClick={add} disabled={!state.ready || (!!selectedSize && count === 0)}>{t('addToCart')}<Icon name="bag" /></button>
      <details className="product-details" open><summary>{t('material')}<Icon name="plus" width={14} height={14} /></summary><p>{localizedText(product.material, state.language)}</p></details>
      <details className="product-details"><summary>{t('careTitle')}<Icon name="plus" width={14} height={14} /></summary><p>{t('careText')}</p></details>
      <p className="fine-print">{t('productNote')}</p>
    </div>
  </div>;
}

function CartPromotion() {
  const { state, applyPromo, removePromo } = useShop();
  const copy = translatedCopy(promoCopy[state.locale], state.language);
  const text = (en: string, fr: string) => siteText(state.language, en, fr);
  const id = useId(); const input = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(Boolean(state.promoCode));
  const [value, setValue] = useState(state.promoCode);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<'applied' | 'removed' | ''>('');
  const [error, setError] = useState('');
  const submitting = useRef(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (submitting.current) return;
    submitting.current = true; setBusy(true); setError(''); setFeedback('');
    try { await applyPromo(value); setFeedback('applied'); }
    catch (failure) { setError(failure instanceof RequestError && failure.code === 'invalidPromo' ? text('This promo code is not valid.', 'Ce code promotionnel n’est pas valide.') : failure instanceof RequestError && failure.code === 'stockChanged' ? copy.stockChanged : copy.failed); }
    finally { submitting.current = false; setBusy(false); }
  };
  const remove = () => { removePromo(); setValue(''); setError(''); setFeedback('removed'); requestAnimationFrame(() => input.current?.focus()); };
  return <section className="exact-bag-promo">
    <button type="button" className="exact-bag-promo-trigger" aria-expanded={open} aria-controls={id + '-body'} onClick={() => setOpen(current => !current)}><span>{text('Promo code', 'Code promotionnel')}</span><Icon name={open ? 'minus' : 'plus'} width={12} height={12}/></button>
    <div id={id + '-body'} hidden={!open}>
      <form onSubmit={submit} className="exact-bag-promo-form" aria-busy={busy}>
        <div className="exact-bag-promo-fields"><label htmlFor={id + '-input'} className="sr-only">{text('Enter your promo code', 'Saisissez votre code promotionnel')}</label><input id={id + '-input'} ref={input} name="promoCode" autoComplete="off" autoCapitalize="characters" spellCheck={false} value={state.promoCode || value} readOnly={Boolean(state.promoCode)} disabled={busy} maxLength={30} placeholder={text('Enter your promo code', 'Saisissez votre code promotionnel')} aria-invalid={Boolean(error)} aria-describedby={error || feedback || state.promoCode ? id + '-feedback' : id + '-hint'} onChange={event => { setValue(event.target.value); setError(''); setFeedback(''); }}/>{state.promoCode ? <button className="exact-bag-button is-outline" type="button" onClick={remove} aria-label={text('Remove promo code', 'Supprimer le code promotionnel')}>{text('Remove promo code', 'Supprimer le code promotionnel')}</button> : <button className="exact-bag-button" type="submit" disabled={busy || !value.trim()}>{busy ? text('Checking your code…', 'Vérification de votre code…') : text('Apply', 'Appliquer')}</button>}</div>
        <p className="exact-bag-promo-hint" id={id + '-hint'}>{text('Demo code', 'Code de démonstration')}: <code translate="no">GOYA10</code> · {text('10% off products', '10 % de réduction sur les articles')}</p>
        {error ? <p className="exact-bag-promo-feedback is-error" id={id + '-feedback'} role="alert">{error}</p> : feedback || state.promoCode ? <p className="exact-bag-promo-feedback" id={id + '-feedback'} role="status">{feedback === 'removed' ? text('Promo code removed.', 'Le code promotionnel a été supprimé.') : text('Promo code applied.', 'Code promotionnel appliqué.')}{state.promoCode ? <> <code translate="no">{state.promoCode}</code></> : null}</p> : null}
      </form>
    </div>
  </section>;
}

function ExpressDemoPayments({ close }: { close: () => void }) {
  const { state } = useShop();
  const providers = (['paypal', 'apple'] as const).filter(provider => isPaymentAvailable(provider, state.market === 'WW' ? 'FR' : state.market));
  if (!providers.length) return null;
  const label = siteText(state.language, 'Express checkout (demo)', 'Paiement express (démonstration)');
  return <div className="exact-bag-express"><p>{label}</p><div className="exact-bag-express-row" role="group" aria-label={label}>{providers.map(provider => { const name = provider === 'apple' ? 'Apple Pay' : 'PayPal'; return <Link key={provider} href={'/checkout?payment=' + provider} className={'exact-bag-wallet exact-bag-wallet--' + provider} onClick={close} aria-label={siteText(state.language, 'Continue with {provider} (demo)', 'Continuer avec {provider} (démonstration)').replace('{provider}', name)}><span translate="no" lang="en">{name}</span></Link>; })}</div></div>;
}

export function CartDrawer({ close, fullPage = false }: { close: () => void; fullPage?: boolean }) {
  const { state, dispatch, t, money, cartQuote, itemCount, productById } = useShop();
  const [savedItem, setSavedItem] = useState('');
  const [removingItem, setRemovingItem] = useState('');
  const c = translatedCopy(state.locale === 'fr' ? { save: 'Déplacer vers ma liste de souhaits', saved: 'Ajouté à votre liste de souhaits', wishlist: 'Voir ma liste de souhaits', bag: 'Voir mon panier', color: 'Couleur' } : { save: 'Move to wishlist', saved: 'Saved to your wishlist', wishlist: 'View my wishlist', bag: 'View my bag', color: 'Colour' }, state.language);
  const threshold = SHIPPING_THRESHOLD[state.currency];
  const remainingToFree = Math.max(0, threshold - cartQuote.subtotal);
  if (!state.ready) return <div className="checkout-loading" role="status">{siteText(state.language, 'Preparing your bag…', 'Préparation de votre panier…')}</div>;
  if (!state.cart.length) return <div className="exact-bag-empty"><h2>{t('emptyBag')}</h2><p>{t('emptyBagText')}</p><Link href="/collections" className="exact-bag-button" onClick={close}>{t('continueShopping')}</Link>{savedItem && <p role="status">{c.saved}: {savedItem}. <Link href="/wishlist" onClick={close}>{c.wishlist}</Link></p>}</div>;
  return <div className={`exact-bag${fullPage ? ' exact-bag-page' : ' exact-minibag'}`}>
    {!fullPage && <header className="exact-bag-header"><h2>{siteText(state.language, 'Shopping bag', 'Panier')} <span>({itemCount})</span></h2><button type="button" data-close-modal aria-label={t('close')} onClick={close}><Icon name="close" /></button></header>}
    <div className="exact-bag-products">
    {fullPage && <p className="exact-bag-item-count">{siteText(state.language, '{count} items', '{count} articles').replace('{count}', String(itemCount))}</p>}
    {savedItem && <p className="exact-bag-notice" role="status">{c.saved}: {savedItem}. <Link href="/wishlist" onClick={close}>{c.wishlist}</Link></p>}
    <ul className="exact-bag-items">
      {state.cart.map((line) => {
        const product = productById.get(line.productId);
        if (!product) return null;
        const name = localizedText(product.name, state.language);
        const key = `${line.productId}:${line.size}`;
        const remove = () => { dispatch({ type: 'remove', productId: line.productId, size: line.size }); setRemovingItem(''); };
        return <li key={key} data-cart-line={line.productId}>
          <div className="exact-bag-product"><Link href={`/product/${product.id}`} onClick={close} className="exact-bag-photo"><MaisonImage key={product.images?.join()} index={product.image} sources={product.images} alt={name} sizes="120px" className="object-cover" /></Link>
          <div className="exact-bag-product-copy"><h3><Link href={`/product/${product.id}`} onClick={close}>{name}</Link></h3><p>{c.color}: {localizedText(product.color, state.language)}</p><p>{t('size')}: {line.size === 'OS' ? t('oneSize') : `${product.kind === 'footwear' ? 'EU ' : ''}${line.size}${product.kind === 'belt' ? ' cm' : ''}`}</p>
            <div className="exact-bag-price-quantity"><div className="exact-bag-quantity" role="group" aria-label={`${t('quantity')} — ${name}`}><span>{siteText(state.language, 'Qty', 'Qté')}</span><button type="button" aria-label={t('decrease')} onClick={() => { if (line.quantity === 1) setRemovingItem(key); else dispatch({ type: 'quantity', productId: line.productId, size: line.size, quantity: line.quantity - 1 }); }}><Icon name="minus" width={12} height={12} /></button><output aria-live="polite">{line.quantity}</output><button type="button" aria-label={t('increase')} disabled={line.quantity >= availableStock(line.productId, line.size, state.stockUsed, productById)} onClick={() => dispatch({ type: 'quantity', productId: line.productId, size: line.size, quantity: line.quantity + 1 })}><Icon name="plus" width={12} height={12} /></button></div><span>{money(priceAmount(product.prices, state.currency) * line.quantity)}</span></div>
            <button type="button" className="exact-bag-remove" aria-expanded={removingItem === key} onClick={() => setRemovingItem(removingItem === key ? '' : key)}>{t('remove')}<Icon name="close" width={12} height={12}/></button>
          </div></div>
          {removingItem === key && <div className="exact-bag-remove-confirm"><p>{siteText(state.language, 'Remove this item from your bag?', 'Retirer cet article de votre panier ?')}</p><div><button type="button" className="exact-bag-button is-outline" onClick={() => { if (!state.wishlist.includes(product.id)) dispatch({ type: 'wishlist', productId: product.id }); remove(); setSavedItem(name); }}>{c.save}</button><button type="button" className="exact-bag-button" onClick={remove}>{t('remove')}</button></div><button type="button" className="exact-bag-text-link" onClick={() => setRemovingItem('')}>{siteText(state.language, 'Cancel', 'Annuler')}</button></div>}
        </li>;
      })}
    </ul>
    </div>
    <aside className="exact-bag-summary">
      {fullPage && <h2>{t('orderSummary')}</h2>}
      <div className="exact-bag-totals"><div className="exact-bag-total"><span>{t('subtotal')}</span><span>{money(cartQuote.originalSubtotal)}</span></div>{cartQuote.discount > 0 && <div className="exact-bag-total exact-bag-discount"><span>{siteText(state.language, 'Discount', 'Réduction')} <code translate="no">{cartQuote.promoCode}</code></span><span>−{money(cartQuote.discount)}</span></div>}<div className="exact-bag-total"><span>{t('shipping')}</span><span>{money(cartQuote.shipping)}</span></div><div className="exact-bag-total exact-bag-grand-total"><span>{t('total')}</span><strong>{money(cartQuote.total)}</strong></div></div>
      {fullPage && <><p className="exact-bag-delivery">{t('deliveryNote')}</p><p className="exact-bag-shipping"><Icon name="truck" width={25} height={25}/>{remainingToFree === 0 ? t('shippingUnlocked') : t('shippingRemaining', { amount: money(remainingToFree) })}</p></>}
      {fullPage && <CartPromotion/>}
      <div className="exact-bag-buttons"><Link href="/checkout" className="exact-bag-button" onClick={close}>{t('checkout')}</Link><ExpressDemoPayments close={close}/>{!fullPage && <Link href="/bag" className="exact-bag-button is-outline" onClick={close}>{c.bag}</Link>}<Link href="/collections" className="exact-bag-text-link" onClick={close}>{t('continueShopping')}</Link></div>
      <p className="exact-bag-demo">{siteText(state.language, 'Demonstration only. No real payment or delivery.', 'Démonstration uniquement. Aucun paiement ni livraison réels.')}</p>
      {fullPage && <div className="exact-bag-help"><details><summary>{siteText(state.language, 'Shipping and returns', 'Livraison et retours')}<Icon name="plus" width={14}/></summary><p>{t('deliveryNote')}</p><Link href="/shipping-returns" onClick={close}>{siteText(state.language, 'Discover more', 'En savoir plus')}</Link></details><details><summary>{siteText(state.language, 'Customer care', 'Service client')}<Icon name="plus" width={14}/></summary><Link href="/customer-service" onClick={close}>{siteText(state.language, 'Contact us', 'Contactez-nous')}</Link></details></div>}
    </aside>
  </div>;
}


export function EmptyBagPopover({ close }: { close: () => void }) {
  const { state } = useShop();
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const outside = (event: PointerEvent) => { const target = event.target as Element; if (!panel.current?.contains(target) && !target.closest('[data-cart-trigger]')) close(); };
    const keyboard = (event: KeyboardEvent) => { if (event.key === 'Escape') { event.preventDefault(); close(); previous?.focus({ preventScroll: true }); } };
    document.addEventListener('pointerdown', outside); document.addEventListener('keydown', keyboard);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', keyboard); if (document.activeElement === document.body && previous?.isConnected) previous.focus({ preventScroll: true }); };
  }, [close]);
  return <div className="exact-minicart-empty" ref={panel} role="status">{siteText(state.language, 'Your bag is empty', 'Votre panier est vide')}</div>;
}
