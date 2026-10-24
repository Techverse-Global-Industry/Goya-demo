'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useShop } from '@/context/shop-context';
import { localizedText, marketName, MARKET_CODES, translatedCopy } from '@/lib/international';

import { PAYMENT_METHODS } from '@/lib/catalog';
import { expressPayment, isPaymentAvailable, quoteCart, shippingCost, validateShipping } from '@/lib/commerce';
import type { FieldErrors } from '@/lib/commerce';
import type { Country, Order, PaymentMethod, ShippingDetails } from '@/lib/types';
import type { TranslationKey } from '@/lib/i18n';
import { downloadInvoice } from '@/lib/browser';
import { RequestError, shopRequest } from '@/lib/api';
import { gsap, useGSAP } from '@/lib/gsap';
import { DemoNote, InlineNotice, SelectField, TextField } from './controls';
import { MaisonImage } from './maison-image';
import { Icon } from './icon';
import type { IconName } from './icon';
import { Auth } from './auth';
import { DemoPayment } from './demo-payment';
import { OrderJourney } from './order-journey';
import { promoCopy } from '@/lib/promo-copy';

const PAYMENT_ICONS: Record<PaymentMethod, IconName> = { card: 'card', apple: 'phone', paypal: 'shield', klarna: 'card', scalapay: 'card', mobile: 'phone', pickup: 'store' };
const CHECKOUT_SESSION = 'maison.checkout.session';
type CheckoutSession = { owner: string | null; confirmedId?: string; pending?: { key: string; startedAt: string } };
const copy = {
  en: {
    welcome: 'How would you like to check out?', guest: 'Continue as a guest', guestText: 'Place your order without creating an account.', account: 'I have a Goya account', accountText: 'Sign in to use your saved addresses and keep your orders together.', signIn: 'Sign in', backChoice: 'Back to checkout options', signedIn: 'Signed in as', savedAddress: 'Choose a saved address', newAddress: 'Enter another address', default: 'Default', phone: 'Phone number (optional)', postalCode: 'Postal code (optional)', address2: 'Apartment, floor or building (optional)', company: 'Company (optional)', sameBilling: 'Use my delivery address for billing', billingTitle: 'Billing address', giftTitle: 'Make it a gift', giftWrap: 'Add complimentary Goya gift packaging', giftDescription: 'Your selection will be presented in our signature packaging.', giftMessage: 'Gift message (optional)', giftPlaceholder: 'A few words for someone special…', giftIncluded: 'Complimentary gift packaging', billingReview: 'Billing', deliveryReview: 'Deliver to', edit: 'Edit', invalidPhone: 'Enter a valid phone number using digits, spaces and + ( ) . - only.', track: 'Track this order', confirmationEmail: 'Your order is saved in this browser. Keep your order number for your reference.', loading: 'Preparing your checkout…', noCharge: 'This is a demonstration. No payment will be charged.',
  },
  fr: {
    welcome: 'Comment souhaitez-vous commander ?', guest: 'Continuer en tant qu’invité', guestText: 'Passez votre commande sans créer de compte.', account: 'J’ai un compte Goya', accountText: 'Connectez-vous pour retrouver vos adresses et réunir vos commandes.', signIn: 'Se connecter', backChoice: 'Retour aux options de commande', signedIn: 'Connecté avec', savedAddress: 'Choisir une adresse enregistrée', newAddress: 'Saisir une autre adresse', default: 'Par défaut', phone: 'Téléphone (facultatif)', postalCode: 'Code postal (facultatif)', address2: 'Appartement, étage ou bâtiment (facultatif)', company: 'Entreprise (facultatif)', sameBilling: 'Utiliser mon adresse de livraison pour la facturation', billingTitle: 'Adresse de facturation', giftTitle: 'Offrir un cadeau', giftWrap: 'Ajouter un emballage cadeau Goya offert', giftDescription: 'Votre sélection sera présentée dans notre emballage signature.', giftMessage: 'Message cadeau (facultatif)', giftPlaceholder: 'Quelques mots pour une personne qui vous est chère…', giftIncluded: 'Emballage cadeau offert', billingReview: 'Facturation', deliveryReview: 'Livrer à', edit: 'Modifier', invalidPhone: 'Saisissez un numéro de téléphone avec des chiffres, des espaces et les signes + ( ) . - uniquement.', track: 'Suivre cette commande', confirmationEmail: 'Votre commande est enregistrée dans ce navigateur. Conservez son numéro comme référence.', loading: 'Préparation de votre commande…', noCharge: 'Ceci est une démonstration. Aucun paiement ne sera prélevé.',
  },
} as const;

function readCheckoutSession(owner: string | null): CheckoutSession {
  try {
    const stored: unknown = JSON.parse(window.sessionStorage.getItem(CHECKOUT_SESSION) ?? 'null');
    if (stored && typeof stored === 'object' && !Array.isArray(stored)) {
      const value = stored as Record<string, unknown>;
      if (value.owner === owner) {
        const session: CheckoutSession = { owner };
        if (typeof value.confirmedId === 'string' && /^DEMO-MG-[A-Z0-9-]{4,60}$/.test(value.confirmedId)) session.confirmedId = value.confirmedId;
        if (value.pending && typeof value.pending === 'object' && !Array.isArray(value.pending)) {
          const pending = value.pending as Record<string, unknown>;
          if (typeof pending.key === 'string' && /^[a-zA-Z0-9-]{8,80}$/.test(pending.key) && typeof pending.startedAt === 'string' && Number.isFinite(Date.parse(pending.startedAt))) session.pending = { key: pending.key, startedAt: pending.startedAt };
        }
        return session;
      }
    }
  } catch { /* Checkout also works when browser storage is unavailable. */ }
  return { owner };
}
function rememberCheckout(value: CheckoutSession) {
  try { window.sessionStorage.setItem(CHECKOUT_SESSION, JSON.stringify(value)); } catch { /* The server cookie still scopes order access. */ }
}

function OrderSummary({ order, payment, gift }: { order?: Order; payment?: PaymentMethod; gift?: boolean }) {
  const { state, t, money, productById } = useShop();
  const c = translatedCopy(copy[state.locale],state.language);
  const promo = translatedCopy(promoCopy[state.locale],state.language);
  const currency = order?.currency ?? state.currency;
  const quote = quoteCart(state.cart, state.currency, productById, state.promoCode, payment);
  const lines = order?.lines ?? quote.lines;
  const amount = order?.subtotal ?? quote.subtotal;
  const originalSubtotal = order?.originalSubtotal ?? quote.originalSubtotal;
  const discount = order ? order.discount ?? 0 : quote.discount;
  const promoCode = order ? order.promoCode : quote.promoCode;
  const delivery = order?.shipping ?? shippingCost(amount, currency, payment);
  return <aside className="order-summary">
    <h3>{t('orderSummary')}</h3>
    <ul>{lines.map((line) => {
      const product = line.product ?? productById.get(line.productId);
      if (!product) return null;
      return <li key={`${line.productId}:${line.size}`}>
        <div className="summary-thumbnail"><MaisonImage index={product.image} sources={product.images} alt={localizedText(product.name,state.language)} sizes="90px" className="object-cover" /></div>
        <div><p>{localizedText(product.name,state.language)}</p><small>{line.size === 'OS' ? t('oneSize') : `${t('size')} ${line.size}`} · ×{line.quantity}</small></div>
        <span>{money(line.unitPrice * line.quantity, currency)}</span>
      </li>;
    })}</ul>
    {(order?.gift?.wrap ?? gift) && <p className="checkout-gift-summary"><Icon name="check" width={15} />{c.giftIncluded}</p>}
    <div className="summary-prices">
      <div><span>{t('subtotal')}</span><span>{money(discount ? originalSubtotal : amount, currency)}</span></div>
      {!!discount && <div className="checkout-promotion"><span>{promo.discount} <span translate="no">({promoCode})</span></span><span>−{money(discount,currency)}</span></div>}
      <div><span>{t('shipping')}</span><span>{delivery ? money(delivery, currency) : t('complimentary')}</span></div>
      <div className="grand-total"><span>{t('total')}</span><strong>{money(order?.total ?? amount + delivery, currency)}</strong></div>
    </div>
    <p className="fine-print">{t('deliveryNote')}</p>
    <p className="checkout-security"><Icon name="shield" width={16} /><span>{c.noCharge}</span></p>
  </aside>;
}

function AddressFields({ prefix, value, errors, update }: { prefix: string; value: ShippingDetails; errors: FieldErrors<ShippingDetails>; update: <K extends keyof ShippingDetails>(key: K, value: ShippingDetails[K]) => void }) {
  const { state, t } = useShop();
  const c = translatedCopy(copy[state.locale],state.language);
  const autofill = prefix === 'billing' ? 'billing' : 'shipping';
  return <div className="checkout-address-fields">
    <TextField id={`${prefix}-name`} label={t('name')} name={`${prefix}-name`} autoComplete={`${autofill} name`} required maxLength={100} value={value.name} onChange={(event) => update('name', event.target.value)} error={errors.name} data-initial-focus />
    <TextField id={`${prefix}-email`} label={t('email')} name={`${prefix}-email`} type="email" autoComplete="email" required maxLength={254} value={value.email} onChange={(event) => update('email', event.target.value)} error={errors.email} />
    <TextField id={`${prefix}-phone`} label={c.phone} name={`${prefix}-phone`} type="tel" autoComplete={`${autofill} tel`} maxLength={40} value={value.phone ?? ''} onChange={(event) => update('phone', event.target.value)} />
    <TextField id={`${prefix}-company`} label={c.company} name={`${prefix}-company`} autoComplete="organization" maxLength={160} value={value.company ?? ''} onChange={(event) => update('company', event.target.value)} />
    <TextField id={`${prefix}-address`} label={t('address')} name={`${prefix}-address`} autoComplete={`${autofill} address-line1`} required maxLength={240} value={value.address} onChange={(event) => update('address', event.target.value)} error={errors.address} />
    <TextField id={`${prefix}-address2`} label={c.address2} name={`${prefix}-address2`} autoComplete={`${autofill} address-line2`} maxLength={240} value={value.address2 ?? ''} onChange={(event) => update('address2', event.target.value)} />
    <div className="form-row"><TextField id={`${prefix}-postalCode`} label={c.postalCode} name={`${prefix}-postalCode`} autoComplete={`${autofill} postal-code`} maxLength={24} value={value.postalCode ?? ''} onChange={(event) => update('postalCode', event.target.value)} /><TextField id={`${prefix}-city`} label={t('city')} name={`${prefix}-city`} autoComplete={`${autofill} address-level2`} required maxLength={100} value={value.city} onChange={(event) => update('city', event.target.value)} error={errors.city} /></div>
    <SelectField id={`${prefix}-country`} label={t('country')} name={`${prefix}-country`} autoComplete={`${autofill} country`} value={value.country} onChange={(event) => update('country', event.target.value as Country)} error={errors.country}>{value.country==='WW'&&<option value="WW" disabled>{t('country')}</option>}{MARKET_CODES.map((country) => <option key={country} value={country}>{marketName(country,state.language)}</option>)}</SelectField>
  </div>;
}

export function Checkout({ close, fullPage = false, initialPayment }: { close: () => void; fullPage?: boolean; initialPayment?: PaymentMethod }) {
  const { state } = useShop();
  if (!state.ready) return <div className="checkout-loading" role="status">{translatedCopy(copy[state.locale],state.language).loading}</div>;
  return <CheckoutFlow key={state.user?.id ?? 'guest'} close={close} fullPage={fullPage} initialPayment={initialPayment} />;
}

function CheckoutFlow({ close, fullPage, initialPayment }: { close: () => void; fullPage: boolean; initialPayment?: PaymentMethod }) {
  const { state, dispatch, t, refresh, cartQuote } = useShop();
  const c = translatedCopy(copy[state.locale],state.language);
  const promo = translatedCopy(promoCopy[state.locale],state.language);
  const express = expressPayment(initialPayment);
  const root = useRef<HTMLDivElement>(null);
  const defaultAddress = state.profile?.addresses.find((address) => address.isDefault) ?? state.profile?.addresses[0];
  const initialAddress: ShippingDetails = defaultAddress ?? { name: state.user?.name ?? '', email: state.user?.email ?? '', address: '', city: '', country: state.market, phone: state.profile?.phone ?? '' };
  const [mode, setMode] = useState<'choice' | 'login' | 'guest'>(state.user ? 'guest' : 'choice');
  const [view, setView] = useState<1 | 2>(1);
  const [shipping, setShipping] = useState<ShippingDetails>(initialAddress);
  const [selectedAddress, setSelectedAddress] = useState(defaultAddress?.id ?? '');
  const [sameBilling, setSameBilling] = useState(true);
  const [billing, setBilling] = useState<ShippingDetails>({ name: initialAddress.name, email: initialAddress.email, address: '', city: '', country: initialAddress.country });
  const [errors, setErrors] = useState<FieldErrors<ShippingDetails>>({});
  const [billingErrors, setBillingErrors] = useState<FieldErrors<ShippingDetails>>({});
  const [gift, setGift] = useState({ wrap: false, message: '' });
  const [payment, setPayment] = useState<PaymentMethod>(express && (initialAddress.country === 'WW' || isPaymentAvailable(express,initialAddress.country)) ? express : 'card');
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [session, setSession] = useState(() => readCheckoutSession(state.user?.id ?? null));
  const checkoutKey = useRef<string | null>(session.pending?.key ?? null);
  const submitting = useRef(false);
  const overlayOrderId = state.overlay?.kind === 'checkout' ? state.overlay.orderId : undefined;
  const recoveredOrder = session.pending ? state.orders.find((order) => order.checkoutReference === session.pending!.key) : undefined;
  const orderId = overlayOrderId ?? (!state.cart.length ? session.confirmedId : undefined);
  const order = state.orders.find((value) => value.id === orderId) ?? recoveredOrder;
  const step = order ? 3 : view;

  useEffect(() => {
    if (!recoveredOrder) return;
    rememberCheckout({ owner: state.user?.id ?? null, confirmedId: recoveredOrder.id });
    dispatch({ type: 'orderComplete', order: recoveredOrder });
    if (fullPage) dispatch({ type: 'close' });
  }, [recoveredOrder, dispatch, fullPage, state.user?.id]);

  useGSAP(() => {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) gsap.fromTo('.checkout-step', { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' });
    const frame = requestAnimationFrame(() => { if (step > 1) root.current?.querySelector<HTMLElement>('[data-step-heading]')?.focus({ preventScroll: true }); });
    return () => cancelAnimationFrame(frame);
  }, { scope: root, dependencies: [step, mode], revertOnUpdate: true });

  const update = <K extends keyof ShippingDetails>(key: K, value: ShippingDetails[K]) => {
    setShipping((current) => ({ ...current, [key]: value })); setSelectedAddress('');
    setErrors((current) => ({ ...current, [key]: undefined })); setError('');
    if (key === 'country' && !isPaymentAvailable(payment, value as Country)) setPayment('card');
  };
  const updateBilling = <K extends keyof ShippingDetails>(key: K, value: ShippingDetails[K]) => { setBilling((current) => ({ ...current, [key]: value })); setBillingErrors((current) => ({ ...current, [key]: undefined })); setError(''); };
  const next = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError('');
    const validation = validateShipping(shipping);
    const billingValidation = sameBilling ? {} : validateShipping(billing);
    setErrors(validation); setBillingErrors(billingValidation);
    const firstError = Object.keys(validation)[0] ?? Object.keys(billingValidation)[0];
    if (firstError) { document.getElementById(`${Object.keys(validation).length ? 'shipping' : 'billing'}-${firstError}`)?.focus(); return; }
    const addresses: [string, ShippingDetails][] = [['shipping', shipping]];
    if (!sameBilling) addresses.push(['billing', billing]);
    for (const [prefix, details] of addresses) {
      if (details.phone && !/^[+()\d\s.-]*$/.test(details.phone)) { setError(c.invalidPhone); document.getElementById(`${prefix}-phone`)?.focus(); return; }
    }
    setView(2);
  };
  const completeOrder = async () => {
    if (submitting.current || !isPaymentAvailable(payment, shipping.country)) return;
    submitting.current = true; setBusy(true); setError('');
    checkoutKey.current ??= crypto.randomUUID();
    const pending = session.pending ?? { key: checkoutKey.current, startedAt: new Date().toISOString() };
    const attempt: CheckoutSession = { owner: state.user?.id ?? null, pending };
    setSession(attempt); rememberCheckout(attempt);
    try {
      if (!state.user) await shopRequest('guestSession');
      const { order } = await shopRequest<{ order: Order }>('order', { cart: state.cart, currency: state.currency, promoCode: state.promoCode, recipient: shipping, billingRecipient: sameBilling ? shipping : billing, gift: { wrap: gift.wrap, message: gift.wrap ? gift.message.trim() : '' }, payment, idempotencyKey: checkoutKey.current });
      const completed = { owner: state.user?.id ?? null, confirmedId: order.id };
      setSession(completed); rememberCheckout(completed);
      dispatch({ type: 'orderComplete', order });
      if (fullPage) dispatch({ type: 'close' });
      await refresh(true);
    } catch (failure) {
      setError(failure instanceof RequestError && failure.code === 'invalidPromo' ? promo.invalid.replace('{code}','GOYA10') : t(failure instanceof RequestError && failure.code === 'stockChanged' ? 'stockChanged' : 'requestFailed'));
      await refresh(true);
    } finally { submitting.current = false; setBusy(false); }
  };
  const placeOrder = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setError(''); if (payment === 'pickup') void completeOrder(); else setPaymentOpen(true); };
  const [expressBefore,expressAfter] = promo.express.split('{provider}');
  const expressNotice = express && payment === express ? <p className="checkout-express-notice reference-demo-note" role="status">{expressBefore}<span translate="no">{express === 'apple' ? 'Apple Pay' : 'PayPal'}</span>{expressAfter}</p> : null;

  if (!order && state.cart.length === 0) return <div className="checkout-empty empty-state"><Icon name="bag" width={36} height={36} /><h2>{t('emptyCheckout')}</h2><Link href="/collections" className="button button-gold" onClick={close}>{t('continueShopping')}</Link></div>;

  if (!state.user && mode !== 'guest' && !order) return <div className="checkout-entry" ref={root}>
    {expressNotice}
    {mode === 'login' ? <><button type="button" className="checkout-back-link" onClick={() => setMode('choice')}><Icon name="arrow-left" width={16} />{c.backChoice}</button><Auth checkout onSuccess={() => setMode('guest')} /></> : <><p className="eyebrow">Maison Goya</p><h2>{c.welcome}</h2><div className="checkout-choice-grid"><section><Icon name="user" width={27} height={27} /><h3>{c.account}</h3><p>{c.accountText}</p><button type="button" className="button button-outline button-full" onClick={() => setMode('login')}>{c.signIn}<Icon name="arrow-right" /></button></section><section><Icon name="bag" width={27} height={27} /><h3>{c.guest}</h3><p>{c.guestText}</p><button type="button" className="button button-gold button-full" onClick={() => setMode('guest')}>{c.guest}<Icon name="arrow-right" /></button></section></div><DemoNote variant="paymentDemo" /></>}
  </div>;

  return <div className={`checkout-root checkout-reference${fullPage ? ' checkout-reference-page' : ''}`} ref={root}>
    {!order && expressNotice}
    <ol className="checkout-steps" aria-label={t('checkout')}>{(['checkoutStep1', 'checkoutStep2', 'checkoutStep3'] as const).map((key, index) => <li key={key} aria-current={step === index + 1 ? 'step' : undefined} className={step >= index + 1 ? 'is-reached' : ''}><span>{step > index + 1 ? <Icon name="check" width={12} height={12} /> : `0${index + 1}`}</span>{t(key)}</li>)}</ol>
    <div className="checkout-step" key={step}>
      {order ? <div className="confirmation">
        <div className="confirmation-mark"><Icon name="check" width={30} height={30} /></div><p className="eyebrow">{t('demoLabel')} · Maison Goya</p><h2 className="modal-display-title" tabIndex={-1} data-step-heading>{t('orderConfirmed')}</h2><p className="confirmation-intro">{t('orderConfirmedText')}</p>{!state.user && <p className="confirmation-guest-note">{c.confirmationEmail}</p>}
        <div className="confirmation-references"><div><span>{t('orderNumber')}</span><strong>{order.id}</strong></div><div><span>{t('tracking')}</span><strong>{order.tracking ?? t('pickupTracking')}</strong></div></div>
        <OrderSummary order={order} /><OrderJourney order={order} />
        {order.paymentReference && <p className="payment-reference">{t('demoPaymentReference')}: {order.paymentReference}</p>}
        {order.gift?.wrap && order.gift.message && <blockquote className="confirmation-gift-message" translate="no" data-personal-data="">{order.gift.message}</blockquote>}
        <div className="confirmation-actions"><button type="button" className="button button-outline" onClick={() => downloadInvoice(order, state.language)}>{t('invoice')}<Icon name="download" /></button><Link href={state.user ? '/app/orders' : '/track-order'} className="button button-gold" onClick={close}>{state.user ? t('viewOrders') : c.track}<Icon name="arrow-up-right" /></Link></div><DemoNote variant="paymentDemo" />
      </div> : <div className="checkout-layout"><div className="checkout-main">
        <p className="eyebrow">{t('checkoutEyebrow')}</p><h2 className="modal-display-title" tabIndex={-1} data-step-heading>{t(view === 1 ? 'shippingTitle' : 'paymentTitle')}</h2><p className="modal-intro">{t(view === 1 ? 'shippingDescription' : 'paymentDescription')}</p>
        {state.user && <p className="checkout-signed-in">{c.signedIn} <strong>{state.user.email}</strong></p>}
        {error && <p className="field-error checkout-error" role="alert">{error}</p>}
        {view === 1 ? <form noValidate onSubmit={next} className="shipping-form">
          {!!state.profile?.addresses.length && <SelectField id="checkout-saved-address" label={c.savedAddress} value={selectedAddress} onChange={(event) => { const address = state.profile?.addresses.find((item) => item.id === event.target.value); setSelectedAddress(event.target.value); if (address) { setShipping({ ...address }); setErrors({}); if (!isPaymentAvailable(payment, address.country)) setPayment('card'); } }}><option value="">{c.newAddress}</option>{state.profile.addresses.map((address) => <option key={address.id} value={address.id} translate="no">{address.label || address.address}{address.isDefault ? ` · ${c.default}` : ''}</option>)}</SelectField>}
          <AddressFields prefix="shipping" value={shipping} errors={errors} update={update} />
          <label className="checkout-checkbox"><input type="checkbox" checked={sameBilling} onChange={(event) => { setSameBilling(event.target.checked); setBillingErrors({}); }} /><span>{c.sameBilling}</span></label>
          {!sameBilling && <section className="checkout-billing"><h3>{c.billingTitle}</h3><AddressFields prefix="billing" value={billing} errors={billingErrors} update={updateBilling} /></section>}
          <section className="checkout-gift"><h3>{c.giftTitle}</h3><label className="checkout-checkbox"><input type="checkbox" checked={gift.wrap} onChange={(event) => setGift((current) => ({ ...current, wrap: event.target.checked }))} /><span>{c.giftWrap}<small>{c.giftDescription}</small></span></label>{gift.wrap && <label className="field checkout-gift-message"><span>{c.giftMessage}</span><textarea maxLength={300} rows={3} value={gift.message} placeholder={c.giftPlaceholder} onChange={(event) => setGift((current) => ({ ...current, message: event.target.value }))} /><small>{gift.message.length}/300</small></label>}</section>
          <button type="submit" className="button button-gold button-full">{t('next')}<Icon name="arrow-right" /></button>
        </form> : paymentOpen ? <DemoPayment method={payment} country={shipping.country} total={cartQuote.subtotal + shippingCost(cartQuote.subtotal, state.currency, payment)} busy={busy} onApprove={() => void completeOrder()} onBack={() => setPaymentOpen(false)} /> : <form onSubmit={placeOrder}>
          <div className="checkout-address-review"><div><h3>{c.deliveryReview}</h3><p translate="no">{shipping.name}<br />{shipping.address}{shipping.address2 ? <><br />{shipping.address2}</> : null}<br />{[shipping.postalCode, shipping.city].filter(Boolean).join(' ')} · {marketName(shipping.country,state.language)}</p></div><button type="button" onClick={() => setView(1)}>{c.edit}</button>{!sameBilling && <div><h3>{c.billingReview}</h3><p translate="no">{billing.name}<br />{billing.address}<br />{[billing.postalCode, billing.city].filter(Boolean).join(' ')} · {marketName(billing.country,state.language)}</p></div>}</div>
          <fieldset className="payment-options"><legend className="sr-only">{t('payment')}</legend>{PAYMENT_METHODS.map((method) => { const available = isPaymentAvailable(method, shipping.country); return <label key={method} className={`payment-option ${payment === method ? 'is-selected' : ''} ${!available ? 'is-disabled' : ''}`}><input type="radio" name="payment" value={method} checked={payment === method} disabled={!available} onChange={() => setPayment(method)} /><Icon name={PAYMENT_ICONS[method]} width={24} height={24} /><span><strong>{t(method)}</strong><small>{t(!available ? method === 'mobile' ? 'paymentUnavailable' : 'pickupUnavailable' : `${method}Detail` as TranslationKey)}</small></span></label>; })}</fieldset>
          <DemoNote variant="paymentDemo" /><InlineNotice /><button type="submit" className="button button-gold button-full" disabled={busy || !state.cart.length || !isPaymentAvailable(payment, shipping.country)}>{t(busy ? 'saving' : 'placeOrder')}<Icon name="shield" /></button><button type="button" className="text-link centered-link" onClick={() => setView(1)}>{t('back')}</button>
        </form>}
      </div><OrderSummary payment={payment} gift={gift.wrap} /></div>}
    </div>
  </div>;
}
