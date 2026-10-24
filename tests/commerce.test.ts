import test from 'node:test';
import assert from 'node:assert/strict';
import { PRODUCT_IMAGES, STORY_IMAGES, imageSources } from '../lib/assets';
import { PRODUCTS } from '../lib/catalog';
import { addDays, availableStock, bookingDateRange, createOrder, formatDate, formatMoney, isPaymentAvailable, isTimeAvailable, localDateTime, matchesProduct, normalizeSearch, readPreferences, remainingStock, sanitizeCart, shippingCost, subtotal, validateBooking, validateShipping } from '../lib/commerce';
import { invoiceText } from '../lib/browser';
import { INITIAL_STATE, shopReducer } from '../lib/store';
import { shoeTypeOf } from '../lib/merchandising';
import { productColors } from '../lib/storefront';
import type { Booking, BookingDetails, CartLine, ShippingDetails, StoreSnapshot } from '../lib/types';

const shipping: ShippingDetails = { name: 'Demo Guest', email: 'guest@example.test', address: '12 Demo Avenue', city: 'Cotonou', country: 'BJ' };
const cart: CartLine[] = [{ productId: 'francesco', size: '42', quantity: 1 }];
const now = new Date('2026-10-15T08:00:00.000Z');
const booking: BookingDetails = { name: 'Demo Guest', email: 'guest@example.test', service: 'polish', location: 'cotonou', date: '2026-10-16', time: '10:00' };
const savedBooking: Booking = { ...booking, id: 'DEMO-AT-TEST0001', customerId: null };
const orderOptions = { id: 'DEMO-MG-TEST0001', createdAt: now.toISOString(), cart, currency: 'EUR' as const, recipient: shipping, payment: 'card' as const, customerId: null };
const hydrated = () => shopReducer(INITIAL_STATE, { type: 'hydrate', raw: null });

test('shoe navigation separates loafers, sneakers, heels and boots without treating bags as shoes', () => {
  assert.deepEqual(PRODUCTS.map(shoeTypeOf), ['loafers', 'sneakers', 'heels', 'heels', 'boots', 'loafers', 'heels', null]);
});

test('bilingual search recognises the displayed shoe-style suggestions', () => {
  for (const query of ['Heels & pumps', 'Talons & escarpins', 'Ankle boots', 'Bottines', 'Loafers', 'Mocassins', 'Sneakers', 'Baskets']) {
    assert.ok(PRODUCTS.some(product => matchesProduct(product, query)), query);
  }
});

test('multicolour accents do not make a black shoe match the natural colour filter', () => {
  const colors = productColors(PRODUCTS.find(product => product.id === 'francesco')!);
  assert.ok(colors.includes('black'));
  assert.ok(colors.includes('multicolor'));
  assert.ok(!colors.includes('natural'));
});

test('changing the collection clears its previous shoe style and reset clears the presentation filters', () => {
  const selected = shopReducer(INITIAL_STATE, { type: 'shoeType', shoeType: 'loafers' });
  assert.equal(shopReducer(selected, { type: 'filter', filter: 'women' }).shoeType, 'all');
  assert.equal(shopReducer(selected, { type: 'resetFilters' }).shoeType, 'all');
});

test('exact narrative and catalog image assignments', () => {
  assert.deepEqual(STORY_IMAGES, [1, 2, 3, 4]);
  assert.deepEqual(PRODUCT_IMAGES, [3, 7, 6, 5, 9, 10, 8, 11]);
  assert.deepEqual(PRODUCTS.map((product) => product.image), [...PRODUCT_IMAGES]);
  assert.equal(PRODUCTS.length, 8);
});

test('routing matches supplied WebP slots and preserves JPEG alternatives', () => {
  for (const i of [1, 2, 5, 6, 7, 8, 9, 10]) assert.equal(imageSources(i)[0], `/images/img${i}.jpg`);
  for (const i of [3, 4, 11]) assert.deepEqual(imageSources(i), [`/images/img${i}.webp`, `/images/img${i}.jpg`]);
  for (const i of [1, 2, 5, 6, 7, 8, 9, 10]) assert.equal(imageSources(i).length, 1);
  assert.throws(() => imageSources(0), RangeError);
  assert.throws(() => imageSources(12), RangeError);
  assert.throws(() => imageSources(2.1), RangeError);
});

test('all prices are positive integers in their currency minor units', () => {
  for (const product of PRODUCTS) for (const value of Object.values(product.prices)) assert.ok(Number.isSafeInteger(value) && value > 0);
});

test('footwear uses all eight EU sizes; bags use one size; belts use centimetres', () => {
  for (const product of PRODUCTS) {
    if (product.kind === 'footwear') assert.deepEqual(Object.keys(product.stock), ['39','40','41','42','43','44','45','46']);
    if (product.kind === 'bag') assert.deepEqual(Object.keys(product.stock), ['OS']);
    if (product.kind === 'belt') assert.deepEqual(Object.keys(product.stock), ['85','90','95','100','105']);
  }
});

test('cart sanitizer merges variants and caps stock', () => {
  assert.deepEqual(sanitizeCart([...cart, { ...cart[0], quantity: 99 }]), [{ ...cart[0], quantity: 5 }]);
});

test('cart sanitizer rejects malformed and unknown entries', () => {
  assert.deepEqual(sanitizeCart([null, 'wrong', {}, { productId: 'x', size: '42', quantity: 1 }, { ...cart[0], size: 'OS' }, { ...cart[0], quantity: -2 }, { ...cart[0], quantity: 1.2 }, { ...cart[0], quantity: NaN }, { ...cart[0], quantity: Infinity }]), []);
  assert.deepEqual(sanitizeCart({ cart }), []);
});

test('prototype keys never become purchasable sizes', () => {
  assert.equal(availableStock('francesco', 'toString'), 0);
  assert.equal(availableStock('francesco', '__proto__'), 0);
  assert.deepEqual(sanitizeCart([{ productId: 'francesco', size: 'constructor', quantity: 1 }]), []);
});

test('stock uses completed sales and current bag quantities independently', () => {
  assert.equal(availableStock('francesco', '42', { 'francesco:42': 2 }), 3);
  assert.equal(remainingStock(cart, { 'francesco:42': 2 }, 'francesco', '42'), 2);
  assert.equal(availableStock('francesco', '42', { 'francesco:42': 900 }), 0);
});

test('preferences handle unavailable, corrupted, outdated and oversized storage', () => {
  const expected = { locale: 'en', currency: 'EUR', cart: [] };
  for (const value of [null, '', 'broken', 'null', '[]', '{"version":2}', 'x'.repeat(100001)]) assert.deepEqual(readPreferences(value), expected);
});

test('restored preferences validate locale, currency, and cart', () => {
  assert.deepEqual(readPreferences(JSON.stringify({ version: 1, locale: 'fr', currency: 'XOF', cart })), { locale: 'fr', currency: 'XOF', cart });
  assert.equal(readPreferences(JSON.stringify({ version: 1, locale: 'xx', currency: 'ZZZ' })).currency, 'EUR');
});

test('money formatting respects minor units and zero-decimal XOF', () => {
  assert.equal(formatMoney(42000, 'EUR', 'en'), '€420');
  assert.equal(formatMoney(45500, 'USD', 'en'), '$455');
  assert.equal(formatMoney(275000, 'XOF', 'en').replace(/\D/g, ''), '275000');
  assert.match(formatMoney(42050, 'EUR', 'fr'), /420,50/);
  assert.throws(() => formatMoney(NaN, 'EUR', 'en'), TypeError);
});

test('subtotal uses selected price book, not a currency conversion', () => {
  assert.equal(subtotal(cart, 'EUR'), 42000);
  assert.equal(subtotal(cart, 'USD'), 45500);
  assert.equal(subtotal(cart, 'XOF'), 275000);
});

test('shipping thresholds, empty bags and boutique pickup', () => {
  assert.equal(shippingCost(42000, 'EUR'), 2000);
  assert.equal(shippingCost(60000, 'EUR'), 0);
  assert.equal(shippingCost(65000, 'USD'), 0);
  assert.equal(shippingCost(394999, 'XOF'), 15000);
  assert.equal(shippingCost(395000, 'XOF'), 0);
  assert.equal(shippingCost(0, 'USD'), 0);
  assert.equal(shippingCost(42000, 'EUR', 'pickup'), 0);
});

test('country-specific payment availability', () => {
  assert.equal(isPaymentAvailable('mobile', 'BJ'), true);
  assert.equal(isPaymentAvailable('mobile', 'SN'), true);
  assert.equal(isPaymentAvailable('mobile', 'FR'), false);
  assert.equal(isPaymentAvailable('pickup', 'BJ'), true);
  assert.equal(isPaymentAvailable('pickup', 'SN'), false);
  assert.equal(isPaymentAvailable('apple', 'GB'), true);
  assert.equal(isPaymentAvailable('card', 'US'), true);
});

test('shipping validation returns translation keys, not captured English messages', () => {
  assert.deepEqual(validateShipping(shipping), {});
  const errors = validateShipping({ ...shipping, name: '', email: 'bad', address: 'x', city: 'x' });
  assert.deepEqual(errors, { name: 'invalidName', email: 'invalidEmail', address: 'invalidAddress', city: 'invalidCity' });
});

test('orders capture immutable monetary snapshots and explicitly simulated tracking', () => {
  const order = createOrder(orderOptions);
  assert.equal(order.total, 44000);
  assert.equal(order.lines[0].unitPrice, 42000);
  assert.equal(order.tracking, 'SIM-TEST0001');
  assert.notEqual(order.lines[0], cart[0]);
  assert.notEqual(order.recipient, shipping);
});

test('pickup orders have no carrier tracking or delivery fee', () => {
  const order = createOrder({ ...orderOptions, payment: 'pickup' });
  assert.equal(order.tracking, null);
  assert.equal(order.shipping, 0);
});

test('empty, malformed, oversold, or incompatible orders cannot complete', () => {
  assert.throws(() => createOrder({ ...orderOptions, cart: [] }));
  assert.throws(() => createOrder({ ...orderOptions, cart: [{ ...cart[0], quantity: 6 }] }));
  assert.throws(() => createOrder({ ...orderOptions, stockUsed: { 'francesco:42': 5 } }));
  assert.throws(() => createOrder({ ...orderOptions, payment: 'mobile', recipient: { ...shipping, country: 'FR' } }));
  assert.throws(() => createOrder({ ...orderOptions, id: 'REAL-ORDER' }));
  assert.throws(() => createOrder({ ...orderOptions, createdAt: 'yesterday' }));
});

test('invoice is localized and never represents a fiscal document or receipt', () => {
  const order = createOrder(orderOptions);
  const english = invoiceText(order, 'en');
  const french = invoiceText(order, 'fr');
  assert.match(english, /NOT A TAX INVOICE/);
  assert.match(french, /NI FACTURE FISCALE/);
  assert.match(english, /DEMO-MG-TEST0001/);
  assert.match(french, /Le Mocassin Francesco/);
});

test('search folds accents and case', () => {
  assert.equal(normalizeSearch('  DÉCONTRACTÉ '), 'decontracte');
});

test('local dates and times are boutique-specific', () => {
  assert.deepEqual(localDateTime(now, 'Africa/Porto-Novo'), { date: '2026-10-15', time: '09:00' });
  assert.deepEqual(localDateTime(now, 'Africa/Dakar'), { date: '2026-10-15', time: '08:00' });
  assert.deepEqual(localDateTime(now, 'Europe/Paris'), { date: '2026-10-15', time: '10:00' });
});

test('date ranges span 90 calendar days without date-only timezone drift', () => {
  const range = bookingDateRange('cotonou', now);
  assert.equal(range.min, '2026-10-15');
  assert.equal(range.max, addDays('2026-10-15', 90));
  assert.match(formatDate('2026-10-16', 'en', true), /16 October 2026/);
});

test('valid future booking is accepted', () => assert.deepEqual(validateBooking(booking, [], now), {}));

test('past, impossible, Sunday and out-of-range dates are rejected', () => {
  assert.equal(validateBooking({ ...booking, date: '2026-10-14' }, [], now).date, 'invalidDate');
  assert.equal(validateBooking({ ...booking, date: '2026-11-31' }, [], now).date, 'invalidDate');
  assert.equal(validateBooking({ ...booking, date: '2026-10-18' }, [], now).date, 'sundayClosed');
  assert.equal(validateBooking({ ...booking, date: '2027-10-16' }, [], now).date, 'invalidDate');
});

test('same-day elapsed times and duplicate local slots are rejected', () => {
  assert.equal(isTimeAvailable({ ...booking, date: '2026-10-15', time: '10:00' }, [], new Date('2026-10-15T10:00:00Z')), false);
  assert.equal(validateBooking(booking, [savedBooking], now).time, 'slotTaken');
  assert.equal(isTimeAvailable({ ...booking, location: 'dakar' }, [savedBooking], now), true);
});

test('cart actions remain inert until hydration completes', () => {
  assert.equal(shopReducer(INITIAL_STATE, { type: 'add', productId: 'francesco', size: '42' }), INITIAL_STATE);
});

test('cart additions merge, open the drawer and stop at stock', () => {
  let state = hydrated();
  for (let i = 0; i < 10; i++) state = shopReducer(state, { type: 'add', productId: 'francesco', size: '42' });
  assert.equal(state.cart[0].quantity, 5);
  assert.equal(state.overlay?.kind, 'cart');
  assert.equal(state.notice?.key, 'stockLimit');
});

test('quantity updates clamp and zero removes the line', () => {
  let state = shopReducer(hydrated(), { type: 'add', productId: 'francesco', size: '42' });
  state = shopReducer(state, { type: 'quantity', productId: 'francesco', size: '42', quantity: 100 });
  assert.equal(state.cart[0].quantity, 5);
  state = shopReducer(state, { type: 'quantity', productId: 'francesco', size: '42', quantity: 0 });
  assert.deepEqual(state.cart, []);
});

test('locale and currency changes preserve the current cart and overlay', () => {
  const before = shopReducer(hydrated(), { type: 'add', productId: 'francesco', size: '42' });
  const after = shopReducer(shopReducer(before, { type: 'locale', locale: 'fr' }), { type: 'currency', currency: 'XOF' });
  assert.deepEqual(after.cart, before.cart);
  assert.deepEqual(after.overlay, before.overlay);
});

test('completion is atomic: clear bag, allocate stock, add history, show confirmation', () => {
  let state = shopReducer(hydrated(), { type: 'add', productId: 'francesco', size: '42' });
  state = shopReducer(state, { type: 'signIn', user: { id: 'demo-google', name: 'Alex', email: 'guest.google@example.test', provider: 'google' } });
  state = shopReducer(state, { type: 'open', overlay: { kind: 'checkout' } });
  const action = { type: 'order' as const, id: 'DEMO-MG-TEST0001', createdAt: now.toISOString(), recipient: shipping, payment: 'card' as const };
  state = shopReducer(state, action);
  assert.equal(state.cart.length, 0);
  assert.equal(state.stockUsed['francesco:42'], 1);
  assert.equal(state.orders.length, 1);
  assert.equal(state.orders[0].customerId, 'demo-google');
  assert.deepEqual(state.overlay, { kind: 'checkout', orderId: 'DEMO-MG-TEST0001' });
  assert.equal(shopReducer(state, { ...action, id: 'DEMO-MG-TEST0002' }), state);
});

test('restored carts are clamped against sales already completed in the tab', () => {
  const state = { ...hydrated(), stockUsed: { 'francesco:42': 4 } };
  const restored = shopReducer(state, { type: 'hydrate', raw: JSON.stringify({ version: 1, cart: [{ ...cart[0], quantity: 4 }] }) });
  assert.equal(restored.cart[0].quantity, 1);
});

test('unknown quick-view products cannot open a broken modal', () => {
  const state = hydrated();
  assert.equal(shopReducer(state, { type: 'open', overlay: { kind: 'quick', productId: 'not-a-product' } }), state);
});

test('atelier completion is atomic and prevents duplicate slot allocation', () => {
  let state = shopReducer(hydrated(), { type: 'open', overlay: { kind: 'booking' } });
  const action = { type: 'book' as const, id: 'DEMO-AT-TEST0001', details: booking, now: now.toISOString() };
  state = shopReducer(state, action);
  assert.equal(state.bookings.length, 1);
  assert.equal(shopReducer(state, action), state);
  state = shopReducer(state, { type: 'open', overlay: { kind: 'booking' } });
  state = shopReducer(state, { ...action, id: 'DEMO-AT-TEST0002' });
  assert.equal(state.bookings.length, 1);
  assert.equal(state.notice?.key, 'slotTaken');
});

test('sign out removes the simulated user and closes the overlay', () => {
  let state = shopReducer(hydrated(), { type: 'signIn', user: { id: 'demo-google', name: 'Alex', email: 'guest@example.test', provider: 'google' } });
  state = shopReducer(state, { type: 'signOut' });
  assert.equal(state.user, null);
  assert.equal(state.overlay, null);
});

test('guest bag and wishlist survive sign-in while switching customers clears owned preferences', () => {
  const guest = { ...hydrated(), cart, wishlist: ['francesco'] };
  const user = { id: 'first', name: 'First Guest', email: 'first@example.test', provider: 'email' as const };
  const signedIn = shopReducer(guest, { type: 'signIn', user });
  assert.deepEqual(signedIn.cart, cart);
  assert.deepEqual(signedIn.wishlist, ['francesco']);
  const switched = shopReducer(signedIn, { type: 'signIn', user: { ...user, id: 'second' } });
  assert.deepEqual(switched.cart, []);
  assert.deepEqual(switched.wishlist, []);
  assert.equal(switched.profile, null);
});

test('expired account synchronization clears owned preferences but guest refresh preserves them', () => {
  const snapshot: StoreSnapshot = { products: [...PRODUCTS], user: null, orders: [], bookings: [], bookedSlots: [], announcements: [], notifications: [], revision: 1, pushPublicKey: null };
  const guest = { ...hydrated(), cart, wishlist: ['francesco'] };
  assert.deepEqual(shopReducer(guest, { type: 'sync', snapshot }).cart, cart);
  assert.deepEqual(shopReducer(guest, { type: 'sync', snapshot }).wishlist, ['francesco']);
  const account = { ...guest, user: { id: 'first', name: 'First Guest', email: 'first@example.test', provider: 'email' as const } };
  const expired = shopReducer(account, { type: 'sync', snapshot });
  assert.deepEqual(expired.cart, []);
  assert.deepEqual(expired.wishlist, []);
});

test('a published-catalog update removes archived favourites while retaining available ones', () => {
  const state = { ...hydrated(), wishlist: ['francesco', 'kanvo-oxford'] };
  const snapshot: StoreSnapshot = { products: PRODUCTS.filter(product => product.id !== 'francesco'), user: null, orders: [], bookings: [], bookedSlots: [], announcements: [], notifications: [], revision: 2, pushPublicKey: null };
  assert.deepEqual(shopReducer(state, { type: 'sync', snapshot }).wishlist, ['kanvo-oxford']);
});
