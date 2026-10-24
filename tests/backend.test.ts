import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { rm } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { mutateDatabase, readDatabase, reconcileDemoCatalog, seedDatabase } from '../lib/server/database';
import { changeOrderStatus, createAnnouncement, createBooking, customerProfile, deleteCustomerAddress, placeOrder, saveCustomerAddress, saveCustomerProfile, saveCustomerWishlist, snapshot, validateProduct } from '../lib/server/shop';
import { checkPassword, guestIdentityForToken, hashPassword, prepareGuestCheckout, userForToken, tokenHash } from '../lib/server/security';
import { matchesProduct } from '../lib/commerce';
import type { DemoUser } from '../lib/types';

const user: DemoUser = { id: 'customer-one', name: 'Demo Shopper', email: 'shopper@example.test', provider: 'email', role: 'customer' };
const other: DemoUser = { ...user, id: 'customer-two' };
const recipient = { name: 'Demo Shopper', email: user.email, address: '12 Demo Street', city: 'Cotonou', country: 'BJ' };
const input = () => ({ idempotencyKey: randomUUID(), cart: [{ productId: 'francesco', size: '45', quantity: 1 }], currency: 'XOF', payment: 'mobile', recipient });
const testFile = path.join(process.cwd(), '.data', `backend-test-${randomUUID()}.json`);
process.env.DATABASE_URL = '';
process.env.DEMO_LOCAL = 'true';
process.env.DEMO_DATA_FILE = testFile;
after(async () => { await rm(testFile, { force: true }); delete process.env.DEMO_DATA_FILE; });

test('backend calculates totals and takes stock using its own prices', () => {
  const db = seedDatabase();
  const order = placeOrder(db, user, { ...input(), total: 1, unitPrice: 1 });
  assert.equal(order.total, 290000);
  assert.equal(order.lines[0].unitPrice, 275000);
  assert.equal(db.products[0].stock['45'], 0);
  assert.equal(order.status, 'confirmed');
  assert.match(order.paymentReference!, /^DEMO-PAY-/);
  assert.equal(db.notifications[0].userId, user.id);
});
test('duplicate checkout reference returns the original order without taking more stock', () => {
  const db = seedDatabase();
  const request = input();
  const order = placeOrder(db, user, request);
  assert.equal(placeOrder(db, user, request).id, order.id);
  assert.equal(db.orders.length, 1);
  assert.equal(db.products[0].stock['45'], 0);
});
test('a second customer cannot buy the final size after it is sold', () => {
  const db = seedDatabase();
  placeOrder(db, user, input());
  assert.throws(() => placeOrder(db, other, input()), /Availability/);
});
test('unpublished products, duplicate variants and invalid payment geography are rejected', () => {
  const db = seedDatabase();
  db.products[0].published = false;
  assert.throws(() => placeOrder(db, user, input()), /Availability/);
  db.products[0].published = true;
  const request = input();
  assert.throws(() => placeOrder(db, user, { ...request, cart: [...request.cart, ...request.cart] }), /Availability/);
  assert.throws(() => placeOrder(db, user, { ...input(), recipient: { ...recipient, country: 'FR' } }), /unavailable/);
});
test('cancelling restores stock once and terminal orders cannot move backwards', () => {
  const db = seedDatabase();
  const order = placeOrder(db, user, input());
  changeOrderStatus(db, order.id, 'cancelled');
  changeOrderStatus(db, order.id, 'cancelled');
  assert.equal(db.products[0].stock['45'], 1);
  assert.throws(() => changeOrderStatus(db, order.id, 'preparing'), /unavailable/);
});
test('fulfillment follows the approved stages and records every event', () => {
  const db = seedDatabase();
  const order = placeOrder(db, user, input());
  assert.throws(() => changeOrderStatus(db, order.id, 'delivered'), /unavailable/);
  for (const status of ['preparing', 'shipped', 'delivered'] as const) changeOrderStatus(db, order.id, status);
  assert.deepEqual(order.events?.map((event) => event.status), ['confirmed', 'preparing', 'shipped', 'delivered']);
  assert.equal(db.products[0].stock['45'], 0);
});
test('orders preserve original product names and prices after catalog edits', () => {
  const db = seedDatabase();
  const order = placeOrder(db, user, input());
  db.products[0].name.en = 'Changed'; db.products[0].prices.XOF = 1;
  assert.equal(order.lines[0].product?.name.en, 'Le Francesco Loafer');
  assert.equal(order.lines[0].unitPrice, 275000);
});
test('customer snapshots never contain other customers orders or credentials', () => {
  const db = seedDatabase();
  placeOrder(db, user, input());
  assert.equal(snapshot(db, 1, other).orders.length, 0);
  assert.equal(snapshot(db, 1, null).notifications.length, 0);
  assert.equal(snapshot(db, 1, user).orders.length, 1);
  assert.ok(!('users' in snapshot(db, 1, user)));
});
test('product validation rejects external image URLs and malformed inventory', () => {
  const product = structuredClone(seedDatabase().products[0]);
  assert.throws(() => validateProduct({ ...product, images: ['https://example.com/photo.jpg'] }), /images/);
  assert.throws(() => validateProduct({ ...product, stock: { '42': -1 } }), /quantities/);
  assert.throws(() => validateProduct({ ...product, prices: { EUR: -1 } }), /price/);
  assert.throws(() => validateProduct({ ...product, name: { en: 'Only English' } }), /French/);
  assert.equal(validateProduct({ ...product }).id, product.id);
});
test('announcements persist bilingual copy and notify customers', () => {
  const db = seedDatabase();
  db.users.push({ ...user, passwordHash: 'unused' }, { ...other, passwordHash: 'unused' });
  createAnnouncement(db, { title: { en: 'New arrivals', fr: 'Nouveautés' }, body: { en: 'Discover our new collection', fr: 'Découvrez notre collection' }, productId: 'francesco' });
  assert.equal(db.announcements.length, 1);
  assert.equal(db.notifications.length, 2);
  assert.equal(db.notifications[0].url, '/app/shop?product=francesco');
});
test('search finds French product terms when the interface is English', () => {
  const product = seedDatabase().products[0];
  assert.equal(matchesProduct(product, 'mocassin noir'), true);
  assert.equal(matchesProduct(product, 'loafer black'), true);
  assert.equal(matchesProduct(product, 'sac rouge'), false);
});
test('password hashes are salted and invalid passwords fail', () => {
  const first = hashPassword('ExampleDemo2026!');
  assert.notEqual(first, hashPassword('ExampleDemo2026!'));
  assert.ok(checkPassword('ExampleDemo2026!', first));
  assert.equal(checkPassword('incorrect-password', first), false);
});
test('session authentication rejects expired or unknown tokens', () => {
  const db = seedDatabase();
  db.users.push({ ...user, passwordHash: 'unused' });
  db.sessions.push({ hash: tokenHash('secret'), userId: user.id, expiresAt: Date.now() + 60000 });
  assert.equal(userForToken(db, 'secret')?.id, user.id);
  assert.equal(userForToken(db, 'unknown'), null);
  db.sessions[0].expiresAt = 0;
  assert.equal(userForToken(db, 'secret'), null);
});
test('concurrent file-backed checkouts allocate the final item exactly once and persist it', async () => {
  const results = await Promise.allSettled([mutateDatabase((db) => placeOrder(db, user, input())), mutateDatabase((db) => placeOrder(db, other, input()))]);
  assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1);
  const { data } = await readDatabase();
  assert.equal(data.orders.length, 1);
  assert.equal(data.products[0].stock['45'], 0);
});

test('public bootstrap exposes published products and announcements, without account data or drafts', () => {
  const db = seedDatabase();
  db.products[0].published = false;
  createAnnouncement(db, { title: { en: 'New collection', fr: 'Nouvelle collection' }, body: { en: 'Discover the collection.', fr: 'Découvrez la collection.' } });
  placeOrder(db, user, { ...input(), cart: [{ productId: 'kanvo-oxford', size: '42', quantity: 1 }] });
  const guest = snapshot(db, 1, null);
  assert.equal(guest.products.length, db.products.length - 1);
  assert.ok(guest.products.every((product) => product.published !== false));
  assert.deepEqual(guest.products[0].stock, db.products[1].stock);
  assert.deepEqual(guest.bookedSlots, []);
  assert.deepEqual(guest.bookings, []);
  assert.deepEqual(guest.orders, []);
  assert.deepEqual(guest.notifications, []);
  assert.equal(guest.user, null);
  assert.equal(guest.announcements.length, 1);
  assert.ok(!('users' in guest));
});

test('guest checkout is isolated, idempotent and does not create an account', () => {
  const db = seedDatabase();
  const guest = prepareGuestCheckout(db, null);
  const request = input();
  const order = placeOrder(db, null, request, guest.identity);
  assert.equal(order.customerId, null);
  assert.equal(order.total, 290000);
  assert.equal(db.users.length, 0);
  assert.equal(db.notifications.length, 0);
  assert.equal(userForToken(db, guest.token), null);
  assert.equal(guestIdentityForToken(db, guest.token), guest.identity);
  assert.deepEqual(prepareGuestCheckout(db, guest.token), guest);
  assert.equal(placeOrder(db, null, request, guest.identity).id, order.id);
  assert.equal(snapshot(db, 1, null, false, guest.identity).orders[0].checkoutReference, request.idempotencyKey);
  assert.equal(db.products[0].stock['45'], 0);
  assert.deepEqual(snapshot(db, 1, null, false, guest.identity).orders.map((value) => value.id), [order.id]);
  assert.deepEqual(snapshot(db, 1, null).orders, []);
  assert.deepEqual(snapshot(db, 1, user).orders, []);
  const stranger = prepareGuestCheckout(db, null);
  assert.deepEqual(snapshot(db, 1, null, false, stranger.identity).orders, []);
  assert.throws(() => placeOrder(db, null, request, stranger.identity), /Availability/);
});

test('guest checkout identities expire and cannot expose or allocate orders without a session', () => {
  const db = seedDatabase();
  const guest = prepareGuestCheckout(db, null);
  placeOrder(db, null, input(), guest.identity);
  db.sessions[0].expiresAt = 0;
  assert.equal(guestIdentityForToken(db, guest.token), null);
  assert.deepEqual(snapshot(db, 1, null, false, guest.identity).orders, []);
  assert.throws(() => placeOrder(db, null, input(), guest.identity), /valid checkout session/);
  assert.throws(() => placeOrder(db, null, input()), /valid checkout session/);
  const replacement = prepareGuestCheckout(db, guest.token);
  assert.notEqual(replacement.identity, guest.identity);
  assert.notEqual(replacement.token, guest.token);
  assert.deepEqual(snapshot(db, 1, null, false, replacement.identity).orders, []);
});

test('guest sessions cannot reuse account tokens or see signed-in customer orders', () => {
  const db = seedDatabase();
  const authToken = 'a'.repeat(64);
  db.users.push({ ...user, passwordHash: 'unused' });
  db.sessions.push({ hash: tokenHash(authToken), userId: user.id, expiresAt: Date.now() + 60000 });
  placeOrder(db, user, input());
  assert.equal(guestIdentityForToken(db, authToken), null);
  const guest = prepareGuestCheckout(db, authToken);
  assert.notEqual(guest.token, authToken);
  assert.equal(userForToken(db, authToken)?.id, user.id);
  assert.deepEqual(snapshot(db, 1, null, false, guest.identity).orders, []);
  assert.deepEqual(snapshot(db, 1, null, true, guest.identity).orders, []);
});

test('concurrent guest checkouts allocate the final item once and preserve only the successful session', async () => {
  await mutateDatabase((db) => { db.products[0].stock = { ...db.products[0].stock, '42': 1 }; });
  const checkout = () => mutateDatabase((db) => {
    const guest = prepareGuestCheckout(db, null);
    return { guest, order: placeOrder(db, null, { ...input(), cart: [{ productId: 'francesco', size: '42', quantity: 1 }] }, guest.identity) };
  });
  const results = await Promise.allSettled([checkout(), checkout()]);
  assert.equal(results.filter((value) => value.status === 'fulfilled').length, 1);
  const { data } = await readDatabase();
  assert.equal(data.products[0].stock['42'], 0);
  assert.equal(data.orders.filter((order) => order.customerId === null && order.lines.some((line) => line.productId === 'francesco' && line.size === '42')).length, 1);
  assert.equal(data.sessions.filter((session) => session.userId.startsWith('guest:')).length, 1);
});

test('archive photo correction preserves sold stock and owner uploads', () => {
  const db = seedDatabase();
  db.products[0].image = 4;
  db.products[0].stock = { ...db.products[0].stock, '42': 0 };
  db.products[1].image = 5;
  db.products[1].name.en = 'L’Artisan Kanvo Oxford';
  db.products[1].images = ['/api/media/owner-photo.jpg'];
  reconcileDemoCatalog(db);
  assert.equal(db.products[0].image, 3);
  assert.equal(db.products[0].stock['42'], 0);
  assert.deepEqual(db.products[1].images, ['/api/media/owner-photo.jpg']);
  assert.equal(db.products[1].name.en, 'L’Artisan Kanvo Oxford');
});

test('legacy accounts receive private profile defaults and partial updates preserve other preferences', () => {
  const db = seedDatabase();
  db.users.push({ ...user, passwordHash: 'unused' });
  assert.deepEqual(customerProfile(db, user), { phone: '', birthDate: '', title: '', preferredLocale: 'en', newsletter: false, addresses: [], wishlist: [] });
  saveCustomerWishlist(db, user, ['francesco']);
  const address = saveCustomerAddress(db, user, { ...recipient, label: 'Home' }).address;
  const profile = saveCustomerProfile(db, user, { phone: '+229 01 00 00 00 00', birthDate: '1994-06-15', title: 'ms', newsletter: true, preferredLocale: 'fr' });
  assert.equal(profile.preferredLocale, 'fr');
  assert.equal(profile.birthDate, '1994-06-15');
  assert.equal(profile.newsletter, true);
  assert.deepEqual(profile.wishlist, ['francesco']);
  assert.equal(profile.addresses[0].id, address.id);
  assert.equal(snapshot(db, 1, null).profile, null);
  assert.equal(db.users[0].name, user.name);
});

test('profile validation rejects impossible dates and invalid preferences without partial writes', () => {
  const db = seedDatabase();
  db.users.push({ ...user, passwordHash: 'unused' });
  for (const update of [{ birthDate: '2025-02-30' }, { birthDate: '9999-01-01' }, { phone: 'not a phone' }, { title: 'admin' }, { preferredLocale: 'es' }, { newsletter: 'yes' }]) {
    assert.throws(() => saveCustomerProfile(db, user, { phone: '+2290100000000', ...update }));
    assert.equal(db.users[0].profile, undefined);
  }
});

test('address books are owned by one account and keep one default after editing or deleting', () => {
  const db = seedDatabase();
  db.users.push({ ...user, passwordHash: 'unused' }, { ...other, passwordHash: 'unused' });
  const first = saveCustomerAddress(db, user, { ...recipient, label: 'Home', postalCode: '75008', phone: '+33 1 23 45 67 89', address2: 'Floor 2', company: 'Demo Studio' }).address;
  const second = saveCustomerAddress(db, user, { ...recipient, label: 'Office', isDefault: true }).address;
  assert.equal(first.isDefault, true);
  assert.deepEqual(customerProfile(db, user)?.addresses.filter((address) => address.isDefault).map((address) => address.id), [second.id]);
  assert.throws(() => saveCustomerAddress(db, other, { ...recipient, id: first.id }), /Address not found/);
  assert.throws(() => deleteCustomerAddress(db, other, first.id), /Address not found/);
  assert.deepEqual(customerProfile(db, other)?.addresses, []);
  const remaining = deleteCustomerAddress(db, user, second.id).addresses;
  assert.equal(remaining.length, 1);
  assert.equal(remaining[0].id, first.id);
  assert.equal(remaining[0].isDefault, true);
  assert.equal(remaining[0].address2, 'Floor 2');
  const updated = saveCustomerAddress(db, user, { ...remaining[0], label: 'Main home', city: 'Paris' }).address;
  assert.equal(updated.id, first.id);
  assert.equal(updated.city, 'Paris');
});

test('wishlists persist only published product IDs in the current account profile', () => {
  const db = seedDatabase();
  db.users.push({ ...user, passwordHash: 'unused' }, { ...other, passwordHash: 'unused' });
  db.products[1].published = false;
  assert.throws(() => saveCustomerWishlist(db, user, ['kanvo-oxford']), /available pieces/);
  assert.throws(() => saveCustomerWishlist(db, user, ['unknown-reference']), /available pieces/);
  assert.throws(() => saveCustomerWishlist(db, user, Array.from({ length: 101 }, () => 'francesco')), /available pieces/);
  assert.deepEqual(saveCustomerWishlist(db, user, ['francesco', 'francesco']).wishlist, ['francesco']);
  assert.deepEqual(customerProfile(db, other)?.wishlist, []);
  db.products[0].published = false;
  assert.deepEqual(customerProfile(db, user)?.wishlist, []);
});

test('shipping snapshots preserve bounded optional delivery fields and reject malformed ones', () => {
  const db = seedDatabase();
  const details = { ...recipient, phone: '+229 01 00 00 00 00', postalCode: ' 75008 ', address2: ' Floor 2 ', company: ' Demo Studio ' };
  const order = placeOrder(db, user, { ...input(), recipient: details });
  assert.equal(order.recipient.phone, details.phone);
  assert.equal(order.recipient.postalCode, '75008');
  assert.equal(order.recipient.address2, 'Floor 2');
  assert.equal(order.recipient.company, 'Demo Studio');
  assert.throws(() => placeOrder(seedDatabase(), user, { ...input(), recipient: { ...recipient, phone: 'call me' } }), /phone number/);
  assert.throws(() => placeOrder(seedDatabase(), user, { ...input(), recipient: { ...recipient, company: 'x'.repeat(161) } }), /delivery details/);
});

test('checkout stores validated billing and complimentary gift details without changing totals', () => {
  const db = seedDatabase();
  const order = placeOrder(db, user, { ...input(), billingRecipient: { ...recipient, name: 'Billing Name', address: '12 Billing Street', postalCode: ' 75008 ' }, gift: { wrap: true, message: ' A special gift. ' } });
  assert.equal(order.billingRecipient?.name, 'Billing Name');
  assert.equal(order.billingRecipient?.postalCode, '75008');
  assert.deepEqual(order.gift, { wrap: true, message: 'A special gift.' });
  assert.equal(order.total, 290000);
  const invalid = seedDatabase();
  const stock = structuredClone(invalid.products[0].stock);
  assert.throws(() => placeOrder(invalid, user, { ...input(), billingRecipient: { ...recipient, address: '' } }), /delivery details/);
  assert.throws(() => placeOrder(invalid, user, { ...input(), gift: { wrap: true, message: 'x'.repeat(301) } }), /300 characters/);
  assert.throws(() => placeOrder(invalid, user, { ...input(), gift: { wrap: 'yes', message: '' } }), /300 characters/);
  assert.deepEqual(invalid.products[0].stock, stock);
  assert.equal(invalid.orders.length, 0);
  assert.deepEqual(placeOrder(seedDatabase(), user, { ...input(), gift: { wrap: false, message: 'Hidden message' } }).gift, { wrap: false, message: '' });
});

test('guest appointments expose only their own details and public occupied-slot projections', () => {
  const db = seedDatabase();
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 2);
  if (date.getUTCDay() === 0) date.setUTCDate(date.getUTCDate() + 1);
  const details = { name: 'Appointment Guest', email: 'appointment@example.test', service: 'polish', location: 'cotonou', date: date.toISOString().slice(0, 10), time: '10:00' };
  const guest = prepareGuestCheckout(db, null);
  const booking = createBooking(db, null, details, guest.identity);
  assert.equal(booking.customerId, null);
  assert.equal(db.users.length, 0);
  const own = snapshot(db, 1, null, false, guest.identity);
  assert.deepEqual(own.bookings.map((value) => value.id), [booking.id]);
  assert.deepEqual(own.orders, []);
  const publicSnapshot = snapshot(db, 1, null);
  assert.deepEqual(publicSnapshot.bookings, []);
  assert.deepEqual(publicSnapshot.bookedSlots, [{ date: details.date, time: details.time, location: details.location }]);
  assert.deepEqual(Object.keys(publicSnapshot.bookedSlots[0]).sort(), ['date', 'location', 'time']);
  const stranger = prepareGuestCheckout(db, null);
  assert.deepEqual(snapshot(db, 1, null, false, stranger.identity).bookings, []);
  assert.deepEqual(snapshot(db, 1, user).bookings, []);
  assert.throws(() => createBooking(db, null, details, stranger.identity), /unavailable/);
  assert.throws(() => createBooking(db, null, { ...details, time: '11:00' }), /valid appointment session/);
  db.sessions.find((session) => session.userId === guest.identity)!.expiresAt = 0;
  assert.deepEqual(snapshot(db, 1, null, false, guest.identity).bookings, []);
  assert.throws(() => createBooking(db, null, { ...details, time: '11:00' }, guest.identity), /valid appointment session/);
});
