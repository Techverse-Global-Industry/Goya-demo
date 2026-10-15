'use client';

import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useShop } from '@/context/shop-context';
import { COUNTRIES, PAYMENT_METHODS, PRODUCT_BY_ID } from '@/lib/catalog';
import { isPaymentAvailable, shippingCost, validateShipping } from '@/lib/commerce';
import type { FieldErrors } from '@/lib/commerce';
import type { Country, Order, PaymentMethod, ShippingDetails } from '@/lib/types';
import type { TranslationKey } from '@/lib/i18n';
import { createDemoId, downloadInvoice } from '@/lib/browser';
import { gsap, useGSAP } from '@/lib/gsap';
import { DemoNote, InlineNotice, SelectField, TextField } from './controls';
import { MaisonImage } from './maison-image';
import { Icon } from './icon';
import type { IconName } from './icon';

const PAYMENT_ICONS: Record<PaymentMethod, IconName> = { card: 'card', apple: 'phone', mobile: 'phone', pickup: 'store' };

function OrderSummary({ order, payment }: { order?: Order; payment?: PaymentMethod }) {
  const { state, t, money, cartSubtotal } = useShop();
  const currency = order?.currency ?? state.currency;
  const lines = order?.lines ?? state.cart.map((line) => ({ ...line, unitPrice: PRODUCT_BY_ID.get(line.productId)!.prices[currency] }));
  const amount = order?.subtotal ?? cartSubtotal;
  const delivery = order?.shipping ?? shippingCost(amount, currency, payment);
  return <aside className="order-summary">
    <h3 className="eyebrow">{t('orderSummary')}</h3>
    <ul>{lines.map((line) => {
      const product = PRODUCT_BY_ID.get(line.productId)!;
      return <li key={`${line.productId}:${line.size}`}>
        <div className="summary-thumbnail"><MaisonImage index={product.image} alt={product.name[state.locale]} sizes="64px" className="object-cover" /></div>
        <div><p>{product.name[state.locale]}</p><small>{line.size === 'OS' ? t('oneSize') : `${t('size')} ${line.size}`} · ×{line.quantity}</small></div>
        <span>{money(line.unitPrice * line.quantity, currency)}</span>
      </li>;
    })}</ul>
    <div className="summary-prices">
      <div><span>{t('subtotal')}</span><span>{money(amount, currency)}</span></div>
      <div><span>{t('shipping')}</span><span>{delivery ? money(delivery, currency) : t('complimentary')}</span></div>
      <div className="grand-total"><span>{t('total')}</span><strong>{money(order?.total ?? amount + delivery, currency)}</strong></div>
    </div>
    <p className="fine-print">{t('deliveryNote')}</p>
  </aside>;
}

export function Checkout({ close }: { close: () => void }) {
  const { state, dispatch, t } = useShop();
  const root = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<1 | 2>(1);
  const [shipping, setShipping] = useState<ShippingDetails>({ name: state.user?.name ?? '', email: state.user?.email ?? '', address: '', city: '', country: 'BJ' });
  const [errors, setErrors] = useState<FieldErrors<ShippingDetails>>({});
  const [payment, setPayment] = useState<PaymentMethod>('card');
  const orderId = state.overlay?.kind === 'checkout' ? state.overlay.orderId : undefined;
  const order = state.orders.find((value) => value.id === orderId);
  const step = order ? 3 : view;

  useGSAP(() => {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.fromTo('.checkout-step', { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' });
    }
    const frame = requestAnimationFrame(() => { if (step > 1) root.current?.querySelector<HTMLElement>('[data-step-heading]')?.focus({ preventScroll: true }); });
    return () => cancelAnimationFrame(frame);
  }, { scope: root, dependencies: [step], revertOnUpdate: true });

  const update = <K extends keyof ShippingDetails>(key: K, value: ShippingDetails[K]) => {
    setShipping((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    if (key === 'country' && !isPaymentAvailable(payment, value as Country)) setPayment('card');
  };
  const next = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validateShipping(shipping);
    setErrors(validation);
    const firstError = Object.keys(validation)[0];
    if (firstError) { document.getElementById(`shipping-${firstError}`)?.focus(); return; }
    setView(2);
  };
  const placeOrder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isPaymentAvailable(payment, shipping.country)) return;
    dispatch({ type: 'order', id: createDemoId('MG'), createdAt: new Date().toISOString(), recipient: shipping, payment });
  };

  if (!order && state.cart.length === 0) return <div className="empty-state"><Icon name="bag" width={36} height={36} /><h2>{t('emptyCheckout')}</h2><button type="button" className="button button-gold" onClick={close}>{t('continueShopping')}</button></div>;

  return <div className="checkout-root" ref={root}>
    <ol className="checkout-steps" aria-label={t('checkout')}>
      {(['checkoutStep1', 'checkoutStep2', 'checkoutStep3'] as const).map((key, index) => <li key={key} aria-current={step === index + 1 ? 'step' : undefined} className={step >= index + 1 ? 'is-reached' : ''}><span>{step > index + 1 ? <Icon name="check" width={12} height={12} /> : `0${index + 1}`}</span>{t(key)}</li>)}
    </ol>
    <div className="checkout-step" key={step}>
      {order ? <div className="confirmation">
        <div className="confirmation-mark"><Icon name="check" width={30} height={30} /></div>
        <p className="eyebrow">{t('demoLabel')} · Maison Goya</p>
        <h2 className="modal-display-title" tabIndex={-1} data-step-heading>{t('orderConfirmed')}</h2>
        <p className="confirmation-intro">{t('orderConfirmedText')}</p>
        <div className="confirmation-references"><div><span>{t('orderNumber')}</span><strong>{order.id}</strong></div><div><span>{t('tracking')}</span><strong>{order.tracking ?? t('pickupTracking')}</strong></div></div>
        <OrderSummary order={order} />
        <div className="confirmation-actions"><button type="button" className="button button-outline" onClick={() => downloadInvoice(order, state.locale)}>{t('invoice')}<Icon name="download" /></button><button type="button" className="button button-gold" onClick={close}>{t('returnToMaison')}<Icon name="arrow-up-right" /></button></div>
        <DemoNote variant="paymentDemo" />
      </div> : <div className="checkout-layout">
        <div className="checkout-main">
          <p className="eyebrow">{t('checkoutEyebrow')}</p>
          <h2 className="modal-display-title" tabIndex={-1} data-step-heading>{t(view === 1 ? 'shippingTitle' : 'paymentTitle')}</h2>
          <p className="modal-intro">{t(view === 1 ? 'shippingDescription' : 'paymentDescription')}</p>
          {view === 1 ? <form noValidate onSubmit={next} className="shipping-form">
            <TextField id="shipping-name" label={t('name')} name="name" autoComplete="name" required maxLength={100} value={shipping.name} onChange={(event) => update('name', event.target.value)} error={errors.name} data-initial-focus />
            <TextField id="shipping-email" label={t('email')} name="email" type="email" autoComplete="email" required maxLength={254} value={shipping.email} onChange={(event) => update('email', event.target.value)} error={errors.email} />
            <TextField id="shipping-address" label={t('address')} name="address" autoComplete="street-address" required maxLength={240} value={shipping.address} onChange={(event) => update('address', event.target.value)} error={errors.address} />
            <div className="form-row">
              <TextField id="shipping-city" label={t('city')} name="city" autoComplete="address-level2" required maxLength={100} value={shipping.city} onChange={(event) => update('city', event.target.value)} error={errors.city} />
              <SelectField id="shipping-country" label={t('country')} name="country" autoComplete="country" value={shipping.country} onChange={(event) => update('country', event.target.value as Country)} error={errors.country}>
                {COUNTRIES.map((country) => <option key={country} value={country}>{t(`country${country}` as TranslationKey)}</option>)}
              </SelectField>
            </div>
            <button type="submit" className="button button-gold button-full">{t('next')}<Icon name="arrow-right" /></button>
          </form> : <form onSubmit={placeOrder}>
            <fieldset className="payment-options"><legend className="sr-only">{t('payment')}</legend>
              {PAYMENT_METHODS.map((method) => {
                const available = isPaymentAvailable(method, shipping.country);
                return <label key={method} className={`payment-option ${payment === method ? 'is-selected' : ''} ${!available ? 'is-disabled' : ''}`}>
                  <input type="radio" name="payment" value={method} checked={payment === method} disabled={!available} onChange={() => setPayment(method)} />
                  <Icon name={PAYMENT_ICONS[method]} width={24} height={24} />
                  <span><strong>{t(method)}</strong><small>{t(!available ? method === 'mobile' ? 'paymentUnavailable' : 'pickupUnavailable' : `${method}Detail` as TranslationKey)}</small></span>
                </label>;
              })}
            </fieldset>
            <DemoNote variant="paymentDemo" /><InlineNotice />
            <button type="submit" className="button button-gold button-full" disabled={!state.cart.length || !isPaymentAvailable(payment, shipping.country)}>{t('placeOrder')}<Icon name="shield" /></button>
            <button type="button" className="text-link centered-link" onClick={() => setView(1)}>{t('back')}</button>
          </form>}
        </div>
        <OrderSummary payment={payment} />
      </div>}
    </div>
  </div>;
}
