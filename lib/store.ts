import { PRODUCTS } from './catalog';
import { availableStock, createOrder, readPreferences, remainingStock, sanitizeCart, validateBooking, variantKey } from './commerce';
import type { StockUsed } from './commerce';
import type { TranslationKey } from './i18n';
import type { Booking, BookingDetails, CartLine, Category, Currency, DemoUser, Locale, Order, Overlay, PaymentMethod, ShippingDetails, StoreSnapshot, ShoeType } from './types';

export interface ShopState {
  products: StoreSnapshot['products'];
  announcements: StoreSnapshot['announcements'];
  notifications: StoreSnapshot['notifications'];
  bookedSlots: StoreSnapshot['bookedSlots'];
  connected: boolean;
  pushPublicKey: string | null;
  locale: Locale;
  currency: Currency;
  cart: CartLine[];
  stockUsed: StockUsed;
  user: DemoUser | null;
  orders: Order[];
  bookings: Booking[];
  overlay: Overlay;
  filter: Category;
  shoeType: ShoeType;
  query: string;
  ready: boolean;
  notice: { id: number; key: TranslationKey } | null;
  noticeSerial: number;
}

export const INITIAL_STATE: ShopState = {
  products: [...PRODUCTS], announcements: [], notifications: [], bookedSlots: [], connected: false, pushPublicKey: null,
  locale: 'en', currency: 'EUR', cart: [], stockUsed: {}, user: null,
  orders: [], bookings: [], overlay: null, filter: 'all', shoeType: 'all', query: '',
  ready: false, notice: null, noticeSerial: 0,
};

export type ShopAction =
  | { type: 'sync'; snapshot: StoreSnapshot }
  | { type: 'connection'; connected: boolean }
  | { type: 'orderComplete'; order: Order }
  | { type: 'bookingComplete'; booking: Booking }
  | { type: 'hydrate'; raw: string | null }
  | { type: 'locale'; locale: Locale }
  | { type: 'currency'; currency: Currency }
  | { type: 'open'; overlay: Exclude<Overlay, null> }
  | { type: 'close' }
  | { type: 'filter'; filter: Category }
  | { type: 'shoeType'; shoeType: ShoeType }
  | { type: 'query'; query: string }
  | { type: 'resetFilters' }
  | { type: 'add'; productId: string; size: string }
  | { type: 'quantity'; productId: string; size: string; quantity: number }
  | { type: 'remove'; productId: string; size: string }
  | { type: 'signIn'; user: DemoUser }
  | { type: 'signOut' }
  | { type: 'order'; id: string; createdAt: string; recipient: ShippingDetails; payment: PaymentMethod }
  | { type: 'book'; id: string; details: BookingDetails; now: string }
  | { type: 'notice'; key: TranslationKey }
  | { type: 'dismissNotice' }
  | { type: 'clearPreferences' };

function notify(state: ShopState, key: TranslationKey): ShopState {
  const id = state.noticeSerial + 1;
  return { ...state, noticeSerial: id, notice: { id, key } };
}

export function shopReducer(state: ShopState, action: ShopAction): ShopState {
  const catalog = new Map(state.products.map((product) => [product.id, product]));
  switch (action.type) {
    case 'sync': {
      const catalog = new Map(action.snapshot.products.map((product) => [product.id, product]));
      const cart = state.user?.id === action.snapshot.user?.id ? sanitizeCart(state.cart, {}, catalog) : [];
      return { ...state, ...action.snapshot, cart, stockUsed: {}, connected: true };
    }
    case 'connection': return { ...state, connected: action.connected };
    case 'orderComplete': return { ...state, cart: [], orders: [action.order, ...state.orders.filter((order) => order.id !== action.order.id)], overlay: { kind: 'checkout', orderId: action.order.id }, notice: null };
    case 'bookingComplete': return { ...state, bookings: [...state.bookings.filter((booking) => booking.id !== action.booking.id), action.booking], overlay: { kind: 'booking', bookingId: action.booking.id } };
    case 'hydrate': {
      const prefs = readPreferences(action.raw, catalog);
      return { ...state, ...prefs, cart: sanitizeCart(prefs.cart, state.stockUsed, catalog), ready: true };
    }
    case 'locale': return { ...state, locale: action.locale };
    case 'currency': return { ...state, currency: action.currency };
    case 'open': {
      if (action.overlay.kind === 'quick' && !catalog.has(action.overlay.productId)) return state;
      return { ...state, overlay: action.overlay, notice: null };
    }
    case 'close': return { ...state, overlay: null };
    case 'filter': return { ...state, filter: action.filter, shoeType: 'all' };
    case 'shoeType': return { ...state, shoeType: action.shoeType };
    case 'query': return { ...state, query: action.query.slice(0, 120) };
    case 'resetFilters': return { ...state, filter: 'all', shoeType: 'all', query: '' };
    case 'add': {
      if (!state.ready) return state;
      if (!remainingStock(state.cart, state.stockUsed, action.productId, action.size, catalog)) return notify(state, 'stockLimit');
      const key = variantKey(action.productId, action.size);
      const exists = state.cart.some((line) => variantKey(line.productId, line.size) === key);
      const cart = exists
        ? state.cart.map((line) => variantKey(line.productId, line.size) === key ? { ...line, quantity: line.quantity + 1 } : line)
        : [...state.cart, { productId: action.productId, size: action.size, quantity: 1 }];
      return notify({ ...state, cart, overlay: { kind: 'cart' } }, 'added');
    }
    case 'quantity': {
      if (!Number.isSafeInteger(action.quantity)) return state;
      if (action.quantity <= 0) return shopReducer(state, { type: 'remove', productId: action.productId, size: action.size });
      const max = availableStock(action.productId, action.size, state.stockUsed, catalog);
      const cart = state.cart.map((line) => line.productId === action.productId && line.size === action.size
        ? { ...line, quantity: Math.min(action.quantity, max) } : line).filter((line) => line.quantity > 0);
      return action.quantity > max ? notify({ ...state, cart }, 'stockLimit') : { ...state, cart };
    }
    case 'remove': return notify({ ...state, cart: state.cart.filter((line) => !(line.productId === action.productId && line.size === action.size)) }, 'removed');
    case 'signIn': return notify({ ...state, user: action.user }, 'signedIn');
    case 'signOut': return notify({ ...state, user: null, overlay: null, cart: [], products: [], orders: [], bookings: [], notifications: [] }, 'loggedOut');
    case 'order': {
      // Atomic completion also makes repeated clicks idempotent.
      if (state.overlay?.kind !== 'checkout' || state.overlay.orderId) return state;
      try {
        const order = createOrder({
          id: action.id, createdAt: action.createdAt, cart: state.cart, currency: state.currency,
          recipient: action.recipient, payment: action.payment, customerId: state.user?.id ?? null, stockUsed: state.stockUsed,
        });
        const stockUsed: Record<string, number> = { ...state.stockUsed };
        order.lines.forEach((line) => {
          const key = variantKey(line.productId, line.size);
          stockUsed[key] = (stockUsed[key] ?? 0) + line.quantity;
        });
        return { ...state, cart: [], stockUsed, orders: [order, ...state.orders], overlay: { kind: 'checkout', orderId: order.id }, notice: null };
      } catch {
        return notify({ ...state, cart: sanitizeCart(state.cart, state.stockUsed) }, 'invalidCart');
      }
    }
    case 'book': {
      if (state.overlay?.kind !== 'booking' || state.overlay.bookingId) return state;
      const errors = validateBooking(action.details, state.bookings, new Date(action.now));
      if (Object.keys(errors).length) return notify(state, errors.time ?? errors.date ?? 'required');
      const booking: Booking = {
        ...action.details, name: action.details.name.trim(), email: action.details.email.trim().toLowerCase(),
        id: action.id, customerId: state.user?.id ?? null,
      };
      return { ...state, bookings: [...state.bookings, booking], overlay: { kind: 'booking', bookingId: booking.id }, notice: null };
    }
    case 'notice': return notify(state, action.key);
    case 'dismissNotice': return { ...state, notice: null };
    case 'clearPreferences': return notify({ ...state, locale: 'en', currency: 'EUR', cart: [] }, 'preferencesCleared');
  }
}
