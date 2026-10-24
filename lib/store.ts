import { PRODUCTS } from './catalog';
import { availableStock, createOrder, CURRENCIES, normalizePromoCode, readPreferences, remainingStock, sanitizeCart, validateBooking, variantKey } from './commerce';
import type { StockUsed } from './commerce';
import type { TranslationKey } from './i18n';
import type { Booking, BookingDetails, CartLine, Category, Currency, DemoUser, Locale, SiteLocale, Order, Overlay, PaymentMethod, ShippingDetails, StoreSnapshot, ShoeType } from './types';
import { contentLocale, INTERNATIONAL_MARKETS, isSiteLocale } from './international';
import type { AccountProfile, CatalogFilters, CatalogSort, Country } from './types';
import { EMPTY_FILTERS } from './storefront';
import type { ReturnRequest, ServiceRequest } from './experience-types';

export interface ShopState {
  products: StoreSnapshot['products'];
  announcements: StoreSnapshot['announcements'];
  notifications: StoreSnapshot['notifications'];
  bookedSlots: StoreSnapshot['bookedSlots'];
  connected: boolean;
  pushPublicKey: string | null;
  locale: Locale;
  language: SiteLocale;
  currency: Currency;
  cart: CartLine[];
  promoCode: string;
  stockUsed: StockUsed;
  user: DemoUser | null;
  orders: Order[];
  bookings: Booking[];
  overlay: Overlay;
  filter: Category;
  shoeType: ShoeType;
  query: string;
  wishlist: string[];
  market: Country;
  sort: CatalogSort;
  catalogFilters: CatalogFilters;
  profile: AccountProfile | null;
  returns: ReturnRequest[];
  requests: ServiceRequest[];
  ready: boolean;
  notice: { id: number; key: TranslationKey } | null;
  noticeSerial: number;
}

export const INITIAL_STATE: ShopState = {
  products: [...PRODUCTS], announcements: [], notifications: [], bookedSlots: [], connected: false, pushPublicKey: null,
  locale: 'en', language: 'en', currency: 'USD', cart: [], promoCode: '', stockUsed: {}, user: null,
  orders: [], bookings: [], overlay: null, filter: 'all', shoeType: 'all', query: '',
  ready: false, notice: null, noticeSerial: 0,
  wishlist: [], market: 'WW', sort: 'recommended', catalogFilters: EMPTY_FILTERS, profile: null, returns: [], requests: [],
};

export type ShopAction =
  | { type: 'sync'; snapshot: StoreSnapshot }
  | { type: 'connection'; connected: boolean }
  | { type: 'orderComplete'; order: Order }
  | { type: 'bookingComplete'; booking: Booking }
  | { type: 'hydrate'; raw: string | null }
  | { type: 'locale'; locale: Locale }
  | { type: 'language'; language: SiteLocale }
  | { type: 'currency'; currency: Currency }
  | { type: 'promo'; code: string }
  | { type: 'open'; overlay: Exclude<Overlay, null> }
  | { type: 'close' }
  | { type: 'filter'; filter: Category }
  | { type: 'shoeType'; shoeType: ShoeType }
  | { type: 'query'; query: string }
  | { type: 'wishlist'; productId: string }
  | { type: 'setWishlist'; productIds: string[] }
  | { type: 'market'; market: Country }
  | { type: 'sort'; sort: CatalogSort }
  | { type: 'catalogFilters'; filters: CatalogFilters }
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
      const switchingAccounts = !!state.user?.id && state.user.id !== action.snapshot.user?.id;
      const cart = switchingAccounts ? [] : sanitizeCart(state.cart, {}, catalog);
      return { ...state, ...action.snapshot, profile: action.snapshot.profile ?? null, returns: action.snapshot.returns ?? [], requests: action.snapshot.requests ?? [], wishlist: switchingAccounts ? [] : state.wishlist.filter(id => catalog.has(id)), cart, promoCode: cart.length && !switchingAccounts ? state.promoCode : '', stockUsed: {}, connected: true };
    }
    case 'connection': return { ...state, connected: action.connected };
    case 'orderComplete': return { ...state, cart: [], promoCode: '', orders: [action.order, ...state.orders.filter((order) => order.id !== action.order.id)], overlay: { kind: 'checkout', orderId: action.order.id }, notice: null };
    case 'bookingComplete': return { ...state, bookings: [...state.bookings.filter((booking) => booking.id !== action.booking.id), action.booking], overlay: { kind: 'booking', bookingId: action.booking.id } };
    case 'hydrate': {
      const prefs = readPreferences(action.raw, catalog);
      let wishlist = state.wishlist;
      let market = state.market;
      let language: SiteLocale = prefs.locale;
      let currency = state.currency;
      let restored = false;
      let promoCode = '';
      try {
        const extra = action.raw && action.raw.length < 100_000 ? JSON.parse(action.raw) : null;
        if (extra?.version === 1) {
          restored = true;
          promoCode = prefs.cart.length ? normalizePromoCode(extra.promoCode) : '';
          const selected = INTERNATIONAL_MARKETS.find(candidate => candidate.code === extra.market);
          if (selected) market = selected.code;
          const marketDefaults = INTERNATIONAL_MARKETS.find(candidate => candidate.code === market)!;
          currency = CURRENCIES.includes(extra.currency as Currency) ? prefs.currency : marketDefaults.currency;
          if (isSiteLocale(extra.language)) language = extra.language;
          else if (extra.locale !== 'en' && extra.locale !== 'fr') language = marketDefaults.language;
          if (Array.isArray(extra.wishlist)) wishlist = [...new Set<string>(extra.wishlist.filter((id: unknown): id is string => typeof id === 'string' && catalog.has(id)))].slice(0, 100);
        }
      } catch { /* Cart and locale use the independently validated preferences above. */ }
      if (!restored) { market = INITIAL_STATE.market; language = INITIAL_STATE.language; currency = INITIAL_STATE.currency; }
      const cart = sanitizeCart(prefs.cart, state.stockUsed, catalog);
      return { ...state, ...prefs, currency, locale: contentLocale(language), language, wishlist, market, cart, promoCode: cart.length ? promoCode : '', ready: true };
    }
    case 'locale': return { ...state, locale: action.locale, language: action.locale };
    case 'language': return { ...state, language: action.language, locale: contentLocale(action.language) };
    case 'currency': return { ...state, currency: action.currency };
    case 'promo': return { ...state, promoCode: state.cart.length ? normalizePromoCode(action.code) : '' };
    case 'open': {
      if (action.overlay.kind === 'quick' && !catalog.has(action.overlay.productId)) return state;
      return { ...state, overlay: action.overlay, notice: null };
    }
    case 'close': return { ...state, overlay: null };
    case 'filter': return { ...state, filter: action.filter, shoeType: 'all' };
    case 'shoeType': return { ...state, shoeType: action.shoeType };
    case 'query': return { ...state, query: action.query.slice(0, 120) };
    case 'wishlist': return catalog.has(action.productId) ? { ...state, wishlist: state.wishlist.includes(action.productId) ? state.wishlist.filter(id => id !== action.productId) : [...state.wishlist, action.productId].slice(0, 100) } : state;
    case 'setWishlist': return { ...state, wishlist: [...new Set(action.productIds.filter(id => catalog.has(id)))].slice(0, 100) };
    case 'market': {
      const selected = INTERNATIONAL_MARKETS.find(candidate => candidate.code === action.market);
      return selected ? { ...state, market: selected.code, currency: selected.currency, language: selected.language, locale: contentLocale(selected.language) } : state;
    }
    case 'sort': return { ...state, sort: action.sort };
    case 'catalogFilters': return { ...state, catalogFilters: action.filters };
    case 'resetFilters': return { ...state, filter: 'all', shoeType: 'all', query: '', catalogFilters: EMPTY_FILTERS, sort: 'recommended' };
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
      const updated = { ...state, cart, promoCode: cart.length ? state.promoCode : '' };
      return action.quantity > max ? notify(updated, 'stockLimit') : updated;
    }
    case 'remove': {
      const cart = state.cart.filter((line) => !(line.productId === action.productId && line.size === action.size));
      return notify({ ...state, cart, promoCode: cart.length ? state.promoCode : '' }, 'removed');
    }
    case 'signIn': {
      const differentOwner = !!state.user && state.user.id !== action.user.id;
      return notify({ ...state, user: action.user, profile: null, orders: [], bookings: [], notifications: [], returns: [], requests: [], ...(differentOwner ? { cart: [], promoCode: '', wishlist: [] } : {}) }, 'signedIn');
    }
    case 'signOut': return notify({ ...state, user: null, profile: null, wishlist: [], overlay: null, cart: [], promoCode: '', orders: [], bookings: [], notifications: [], returns: [], requests: [] }, 'loggedOut');
    case 'order': {
      // Atomic completion also makes repeated clicks idempotent.
      if (state.overlay?.kind !== 'checkout' || state.overlay.orderId) return state;
      try {
        const order = createOrder({
          id: action.id, createdAt: action.createdAt, cart: state.cart, currency: state.currency,
          recipient: action.recipient, payment: action.payment, customerId: state.user?.id ?? null, stockUsed: state.stockUsed, promoCode: state.promoCode,
        });
        const stockUsed: Record<string, number> = { ...state.stockUsed };
        order.lines.forEach((line) => {
          const key = variantKey(line.productId, line.size);
          stockUsed[key] = (stockUsed[key] ?? 0) + line.quantity;
        });
        return { ...state, cart: [], promoCode: '', stockUsed, orders: [order, ...state.orders], overlay: { kind: 'checkout', orderId: order.id }, notice: null };
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
    case 'clearPreferences': return notify({ ...state, locale: 'en', language: 'en', currency: 'USD', cart: [], promoCode: '', wishlist: [], market: 'WW' }, 'preferencesCleared');
  }
}
