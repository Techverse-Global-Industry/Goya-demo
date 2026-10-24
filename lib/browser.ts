import { PRODUCT_BY_ID } from './catalog';
import { formatDate, formatMoney } from './commerce';
import { translate } from './i18n';
import { localizedText, marketName, translatedCopy } from './international';
import { promoCopy } from './promo-copy';
import type { TranslationKey } from './i18n';
import type { Order, SiteLocale } from './types';

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

export function invoiceText(order: Order, language: SiteLocale): string {
  const t = (key: TranslationKey) => translate(language, key);
  const money = (amount: number) => formatMoney(amount, order.currency, language);
  const promo = translatedCopy(promoCopy[language === 'fr' ? 'fr' : 'en'],language);
  const lines = order.lines.map((line) => {
    const product = line.product ?? PRODUCT_BY_ID.get(line.productId);
    const size = line.size === 'OS' ? t('oneSize') : line.size;
    return `${product ? localizedText(product.name, language) : line.productId} | ${t('size')}: ${size} | ${t('quantity')}: ${line.quantity} | ${money(line.unitPrice * line.quantity)}`;
  });
  return [
    t('invoiceTitle'), t('invoiceDisclaimer'), '',
    `${t('orderNumber')}: ${order.id}`, `${t('date')}: ${formatDate(order.createdAt, language)}`, '',
    `${t('recipient')}: ${order.recipient.name}`, order.recipient.email,
    order.recipient.address, `${order.recipient.city}, ${marketName(order.recipient.country, language)}`, '',
    ...lines, '',
    ...(order.discount ? [`${t('subtotal')}: ${money(order.originalSubtotal ?? order.subtotal + order.discount)}`, `${promo.discount} (${order.promoCode ?? ''}): −${money(order.discount)}`] : [`${t('subtotal')}: ${money(order.subtotal)}`]),
    `${t('shipping')}: ${money(order.shipping)}`, `${t('total')}: ${money(order.total)}`,
    `${t('payment')}: ${t(order.payment)}`,
    `${t('tracking')}: ${order.tracking ?? t('pickupTracking')}`, '', t('deliveryNote'),
  ].join('\n');
}

export function downloadInvoice(order: Order, language: SiteLocale): void {
  const blob = new Blob(['\uFEFF', invoiceText(order, language)], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `maison-goya-${order.id.toLowerCase()}.txt`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
