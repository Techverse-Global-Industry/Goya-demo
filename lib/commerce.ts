import { COUNTRIES, LOCATION_TIMEZONES, LOCATIONS, PAYMENT_METHODS, PRODUCT_BY_ID, SERVICES, TIME_SLOTS } from './catalog';
import type { AtelierLocation, Booking, BookingDetails, CartLine, Country, Currency, Locale, Order, PaymentMethod, PriceBook, ShippingDetails } from './types';
import type { TranslationKey } from './i18n';

export const SHIPPING_THRESHOLD: PriceBook = { EUR: 60000, USD: 65000, XOF: 395000 };
export const SHIPPING_FEE: PriceBook = { EUR: 2000, USD: 2500, XOF: 15000 };
export const STORAGE_KEY = 'maison-goya:v1';
export const CURRENCIES: readonly Currency[] = ['EUR', 'USD', 'XOF'];
export type StockUsed = Readonly<Record<string, number>>;
export type FieldErrors<T> = Partial<Record<keyof T, TranslationKey>>;

export function formatMoney(minorUnits: number, currency: Currency, locale: Locale): string {
  if (!Number.isSafeInteger(minorUnits)) throw new TypeError('Money must be expressed in integer minor units.');
  return new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
    style: 'currency', currency,
    minimumFractionDigits: currency === 'XOF' || minorUnits % 100 === 0 ? 0 : 2,
    maximumFractionDigits: currency === 'XOF' ? 0 : 2,
  }).format(minorUnits / (currency === 'XOF' ? 1 : 100));
}

export function variantKey(productId: string, size: string): string {
  return `${productId}:${size}`;
}

export function availableStock(productId: string, size: string, used: StockUsed = {}): number {
  const product = PRODUCT_BY_ID.get(productId);
  if (!product || !Object.prototype.hasOwnProperty.call(product.stock, size)) return 0;
  const total = product.stock[size];
  const consumed = used[variantKey(productId, size)] ?? 0;
  return Math.max(0, total - (Number.isSafeInteger(consumed) && consumed > 0 ? consumed : 0));
}

export function cartQuantity(cart: readonly CartLine[], productId: string, size: string): number {
  return cart.find((line) => line.productId === productId && line.size === size)?.quantity ?? 0;
}

export function remainingStock(cart: readonly CartLine[], used: StockUsed, productId: string, size: string): number {
  return Math.max(0, availableStock(productId, size, used) - cartQuantity(cart, productId, size));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Treat local storage as untrusted. Unknown IDs, variants, negative values and NaN never reach state. */
export function sanitizeCart(raw: unknown, used: StockUsed = {}): CartLine[] {
  if (!Array.isArray(raw)) return [];
  const merged = new Map<string, CartLine>();
  for (const value of raw.slice(0, 128)) {
    if (!isRecord(value)) continue;
    const { productId, size, quantity } = value;
    if (typeof productId !== 'string' || typeof size !== 'string' || !Number.isSafeInteger(quantity)) continue;
    const amount = quantity as number;
    if (amount < 1) continue;
    const limit = availableStock(productId, size, used);
    if (!limit) continue;
    const key = variantKey(productId, size);
    const existing = merged.get(key)?.quantity ?? 0;
    merged.set(key, { productId, size, quantity: Math.min(existing + amount, limit) });
  }
  return [...merged.values()];
}

export function readPreferences(raw: string | null): { locale: Locale; currency: Currency; cart: CartLine[] } {
  const defaults = { locale: 'en' as Locale, currency: 'EUR' as Currency, cart: [] as CartLine[] };
  if (!raw || raw.length > 100_000) return defaults;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || parsed.version !== 1) return defaults;
    return {
      locale: parsed.locale === 'fr' ? 'fr' : 'en',
      currency: CURRENCIES.includes(parsed.currency as Currency) ? parsed.currency as Currency : 'EUR',
      cart: sanitizeCart(parsed.cart),
    };
  } catch {
    return defaults;
  }
}

export function subtotal(cart: readonly CartLine[], currency: Currency): number {
  return cart.reduce((sum, line) => sum + (PRODUCT_BY_ID.get(line.productId)?.prices[currency] ?? 0) * line.quantity, 0);
}

export function shippingCost(amount: number, currency: Currency, payment?: PaymentMethod): number {
  if (amount === 0 || payment === 'pickup' || amount >= SHIPPING_THRESHOLD[currency]) return 0;
  return SHIPPING_FEE[currency];
}

export function isPaymentAvailable(payment: PaymentMethod, country: Country): boolean {
  if (!PAYMENT_METHODS.includes(payment) || !COUNTRIES.includes(country)) return false;
  if (payment === 'mobile') return country === 'BJ' || country === 'SN';
  if (payment === 'pickup') return country === 'BJ';
  return true;
}

export function validEmail(email: string): boolean {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function validateShipping(value: ShippingDetails): FieldErrors<ShippingDetails> {
  const errors: FieldErrors<ShippingDetails> = {};
  if (value.name.trim().length < 2 || value.name.length > 100) errors.name = 'invalidName';
  if (!validEmail(value.email)) errors.email = 'invalidEmail';
  if (value.address.trim().length < 5 || value.address.length > 240) errors.address = 'invalidAddress';
  if (value.city.trim().length < 2 || value.city.length > 100) errors.city = 'invalidCity';
  if (!COUNTRIES.includes(value.country)) errors.country = 'invalidCountry';
  return errors;
}

export function createOrder(options: {
  id: string;
  createdAt: string;
  cart: readonly CartLine[];
  currency: Currency;
  recipient: ShippingDetails;
  payment: PaymentMethod;
  customerId: string | null;
  stockUsed?: StockUsed;
}): Order {
  const { id, createdAt, cart, currency, recipient, payment, customerId, stockUsed = {} } = options;
  if (!/^DEMO-MG-[A-Z0-9-]+$/.test(id)) throw new Error('A demonstration order ID is required.');
  if (!Number.isFinite(Date.parse(createdAt))) throw new Error('Invalid order timestamp.');
  if (Object.keys(validateShipping(recipient)).length) throw new Error('Invalid shipping details.');
  if (!CURRENCIES.includes(currency) || !isPaymentAvailable(payment, recipient.country)) throw new Error('Unavailable payment or currency.');
  const normalized = sanitizeCart(cart, stockUsed);
  if (!normalized.length || JSON.stringify(normalized) !== JSON.stringify(cart)) throw new Error('Invalid cart or insufficient stock.');
  const amount = subtotal(normalized, currency);
  const delivery = shippingCost(amount, currency, payment);
  return {
    id,
    tracking: payment === 'pickup' ? null : `SIM-${id.replace('DEMO-MG-', '')}`,
    createdAt, customerId, currency,
    lines: normalized.map((line) => ({ ...line, unitPrice: PRODUCT_BY_ID.get(line.productId)!.prices[currency] })),
    subtotal: amount, shipping: delivery, total: amount + delivery, payment,
    recipient: {
      name: recipient.name.trim(), email: recipient.email.trim().toLowerCase(),
      address: recipient.address.trim(), city: recipient.city.trim(), country: recipient.country,
    },
  };
}

export function normalizeSearch(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

export function localDateTime(now: Date, timeZone: string): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(now);
  const read = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? '';
  return { date: `${read('year')}-${read('month')}-${read('day')}`, time: `${read('hour')}:${read('minute')}` };
}

export function addDays(date: string, days: number): string {
  const value = new Date(`${date}T12:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

export function bookingDateRange(location: AtelierLocation, now = new Date()): { min: string; max: string } {
  const { date } = localDateTime(now, LOCATION_TIMEZONES[location]);
  return { min: date, max: addDays(date, 90) };
}

function isCalendarDate(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const timestamp = Date.parse(`${date}T12:00:00.000Z`);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === date;
}

export function isTimeAvailable(details: Pick<BookingDetails, 'date' | 'time' | 'location'>, bookings: readonly Booking[], now = new Date()): boolean {
  if (!LOCATIONS.includes(details.location) || !TIME_SLOTS.some((time) => time === details.time)) return false;
  const localNow = localDateTime(now, LOCATION_TIMEZONES[details.location]);
  if (details.date < localNow.date || (details.date === localNow.date && details.time <= localNow.time)) return false;
  return !bookings.some((booking) => booking.location === details.location && booking.date === details.date && booking.time === details.time);
}

export function validateBooking(value: BookingDetails, bookings: readonly Booking[] = [], now = new Date()): FieldErrors<BookingDetails> {
  const errors: FieldErrors<BookingDetails> = {};
  if (value.name.trim().length < 2 || value.name.length > 100) errors.name = 'invalidName';
  if (!validEmail(value.email)) errors.email = 'invalidEmail';
  if (!SERVICES.includes(value.service)) errors.service = 'required';
  if (!LOCATIONS.includes(value.location)) {
    errors.location = 'required';
    return errors;
  }
  const range = bookingDateRange(value.location, now);
  if (!isCalendarDate(value.date) || value.date < range.min || value.date > range.max) errors.date = 'invalidDate';
  else if (new Date(`${value.date}T12:00:00Z`).getUTCDay() === 0) errors.date = 'sundayClosed';
  if (!isTimeAvailable(value, bookings, now)) {
    errors.time = bookings.some((booking) => booking.location === value.location && booking.date === value.date && booking.time === value.time) ? 'slotTaken' : 'invalidTime';
  }
  return errors;
}

/** Format date-only bookings without silently shifting them into a different day. */
export function formatDate(value: string, locale: Locale, dateOnly = false): string {
  return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
    ...(dateOnly ? { timeZone: 'UTC' } : {}),
  }).format(new Date(dateOnly ? `${value}T12:00:00.000Z` : value));
}
