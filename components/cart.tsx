'use client';

import { useState } from 'react';
import { useShop } from '@/context/shop-context';
import { availableStock, cartQuantity, SHIPPING_THRESHOLD } from '@/lib/commerce';
import { useSectionNavigation } from '@/lib/use-section-navigation';
import { MaisonImage } from './maison-image';
import { CurrencySelect, DemoNote, InlineNotice } from './controls';
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
  const [selectedSize, setSelectedSize] = useState(product.kind === 'bag' ? 'OS' : '');
  const [showError, setShowError] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const name = product.name[state.locale];
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
      <div className="quick-view-price"><span>{money(product.prices[state.currency])}</span><CurrencySelect /></div>
      <p className="product-description">{product.description[state.locale]}</p>
      <p className="color-detail"><span>{t('color')}</span>{product.color[state.locale]}</p>
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
      <details className="product-details" open><summary>{t('material')}<Icon name="plus" width={14} height={14} /></summary><p>{product.material[state.locale]}</p></details>
      <details className="product-details"><summary>{t('careTitle')}<Icon name="plus" width={14} height={14} /></summary><p>{t('careText')}</p></details>
      <p className="fine-print">{t('productNote')}</p>
    </div>
  </div>;
}

export function CartDrawer({ close }: { close: () => void }) {
  const { state, dispatch, t, money, cartSubtotal, itemCount, productById } = useShop();
  const scrollToSection = useSectionNavigation();
  const threshold = SHIPPING_THRESHOLD[state.currency];
  const remainingToFree = Math.max(0, threshold - cartSubtotal);
  if (!state.cart.length) return <div className="cart-empty empty-state"><Icon name="bag" width={42} height={42} /><p className="eyebrow">Maison Goya</p><h2>{t('emptyBag')}</h2><p>{t('emptyBagText')}</p>
    <button type="button" className="button button-gold" onClick={() => { dispatch({ type: 'close' }); requestAnimationFrame(() => scrollToSection('collection')); }}>{t('explore')}<Icon name="arrow-up-right" /></button>
    <InlineNotice />
  </div>;
  return <div className="cart-layout">
    <div className="cart-intro"><h2 className="modal-display-title">{t('orderSummary')}<sup>{itemCount}</sup></h2><CurrencySelect /></div>
    <InlineNotice />
    <div className="shipping-tracker">
      <p><Icon name="truck" width={18} height={18} /><span>{remainingToFree === 0 ? t('shippingUnlocked') : t('shippingRemaining', { amount: money(remainingToFree) })}</span></p>
      <progress max={threshold} value={Math.min(cartSubtotal, threshold)} aria-label={t('shippingProgress')} />
    </div>
    <ul className="cart-items">
      {state.cart.map((line) => {
        const product = productById.get(line.productId)!;
        const name = product.name[state.locale];
        return <li key={`${line.productId}:${line.size}`} className="cart-line" data-cart-line={line.productId}>
          <button type="button" className="cart-thumbnail" aria-label={t('viewProduct', { name })} onClick={() => dispatch({ type: 'open', overlay: { kind: 'quick', productId: product.id } })}>
            <MaisonImage key={product.images?.join()} index={product.image} sources={product.images} alt={name} sizes="112px" className="object-cover" />
          </button>
          <div className="cart-line-copy"><p className="eyebrow">{t(product.badge)}</p><h3>{name}</h3><p className="cart-size">{t('size')}: {line.size === 'OS' ? t('oneSize') : `${product.kind === 'footwear' ? 'EU ' : ''}${line.size}${product.kind === 'belt' ? ' cm' : ''}`}</p>
            <div className="quantity-control" role="group" aria-label={`${t('quantity')} — ${name}`}>
              <button type="button" aria-label={t('decrease')} onClick={() => dispatch({ type: 'quantity', productId: line.productId, size: line.size, quantity: line.quantity - 1 })}><Icon name="minus" width={13} height={13} /></button>
              <output aria-live="polite">{line.quantity}</output>
              <button type="button" aria-label={t('increase')} disabled={line.quantity >= availableStock(line.productId, line.size, state.stockUsed, productById)} onClick={() => dispatch({ type: 'quantity', productId: line.productId, size: line.size, quantity: line.quantity + 1 })}><Icon name="plus" width={13} height={13} /></button>
            </div>
          </div>
          <div className="cart-line-right"><span>{money(product.prices[state.currency] * line.quantity)}</span><button type="button" className="quiet-link" onClick={() => dispatch({ type: 'remove', productId: line.productId, size: line.size })}>{t('remove')}</button></div>
        </li>;
      })}
    </ul>
    <div className="cart-summary"><div className="total-row"><span>{t('subtotal')}</span><strong>{money(cartSubtotal)}</strong></div>
      <p className="fine-print">{t('deliveryNote')}</p>
      <button type="button" className="button button-gold button-full" onClick={() => dispatch({ type: 'open', overlay: { kind: 'checkout' } })}>{t('checkout')}<Icon name="arrow-right" /></button>
      <button type="button" className="text-link centered-link" onClick={() => { close(); scrollToSection('collection'); }}>{t('continueShopping')}</button>
      <DemoNote />
    </div>
  </div>;
}
