import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { rm } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { mutateDatabase, readDatabase, reconcileDemoCatalog, seedDatabase } from '../lib/server/database';
import { changeOrderStatus, createAnnouncement, placeOrder, snapshot, validateProduct } from '../lib/server/shop';
import { checkPassword, hashPassword, userForToken, tokenHash } from '../lib/server/security';
import { matchesProduct } from '../lib/commerce';
import type { DemoUser } from '../lib/types';

const user: DemoUser = { id: 'customer-one', name: 'Demo Shopper', email: 'shopper@example.test', provider: 'email', role: 'customer' };
const other: DemoUser = { ...user, id: 'customer-two' };
const recipient = { name: 'Demo Shopper', email: user.email, address: '12 Demo Street', city: 'Cotonou', country: 'BJ' };
const input = () => ({ idempotencyKey: randomUUID(), cart: [{ productId: 'francesco', size: '45', quantity: 1 }], currency: 'XOF', payment: 'mobile', recipient });
const testFile = path.join(process.cwd(), '.data', `backend-test-${randomUUID()}.json`);
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

test('signed-out bootstrap exposes no catalog, bookings, orders or announcements', () => {
  const db = seedDatabase();
  const guest = snapshot(db, 1, null);
  assert.deepEqual(guest.products, []);
  assert.deepEqual(guest.bookedSlots, []);
  assert.deepEqual(guest.orders, []);
  assert.deepEqual(guest.announcements, []);
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
