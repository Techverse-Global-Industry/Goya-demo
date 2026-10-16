import { PRODUCT_BY_ID } from './catalog';
import { formatDate, formatMoney } from './commerce';
import { translate } from './i18n';
import type { TranslationKey } from './i18n';
import type { Locale, Order } from './types';

export function scrollToSection(id: 'story' | 'collection' | 'atelier'): void {
  const element = document.getElementById(id);
  if (!element) return;
  element.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  // The section is programmatically focusable so keyboard navigation continues here.
  element.focus({ preventScroll: true });
}

export function createDemoId(prefix: 'MG' | 'AT'): string {
  return `DEMO-${prefix}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

export function invoiceText(order: Order, locale: Locale): string {
  const t = (key: TranslationKey) => translate(locale, key);
  const money = (amount: number) => formatMoney(amount, order.currency, locale);
  const countryKey = `country${order.recipient.country}` as TranslationKey;
  const lines = order.lines.map((line) => {
    const product = line.product ?? PRODUCT_BY_ID.get(line.productId)!;
    const size = line.size === 'OS' ? t('oneSize') : line.size;
    return `${product.name[locale]} | ${t('size')}: ${size} | ${t('quantity')}: ${line.quantity} | ${money(line.unitPrice * line.quantity)}`;
  });
  return [
    t('invoiceTitle'), t('invoiceDisclaimer'), '',
    `${t('orderNumber')}: ${order.id}`, `${t('date')}: ${formatDate(order.createdAt, locale)}`, '',
    `${t('recipient')}: ${order.recipient.name}`, order.recipient.email,
    order.recipient.address, `${order.recipient.city}, ${t(countryKey)}`, '',
    ...lines, '', `${t('subtotal')}: ${money(order.subtotal)}`,
    `${t('shipping')}: ${money(order.shipping)}`, `${t('total')}: ${money(order.total)}`,
    `${t('payment')}: ${t(order.payment)}`,
    `${t('tracking')}: ${order.tracking ?? t('pickupTracking')}`, '', t('deliveryNote'),
  ].join('\n');
}

export function downloadInvoice(order: Order, locale: Locale): void {
  const blob = new Blob(['\uFEFF', invoiceText(order, locale)], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `maison-goya-${order.id.toLowerCase()}.txt`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
