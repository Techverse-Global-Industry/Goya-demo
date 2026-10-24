import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { rm } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { mutateDatabase, readDatabase, reconcileDemoCatalog, seedDatabase } from '../lib/server/database';
import { accessibleOrder, changeOrderStatus, createAnnouncement, createBooking, createServiceRequest, customerProfile, deleteCustomerAddress, lookupCustomerOrder, ownServiceRequest, placeOrder, processAvailability, requestCustomerReturn, saveCustomerAddress, saveCustomerProfile, saveCustomerWishlist, snapshot, updateReturnStatus, updateServiceRequest, validateProduct } from '../lib/server/shop';
import { beginDemoRecovery, checkPassword, finishDemoRecovery, guestIdentityForToken, hashPassword, issueRecoveryCode, prepareGuestCheckout, provisionAdministrator, updateCredentials, userForToken, tokenHash } from '../lib/server/security';
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

test('customer credential changes reject reserved administrator addresses without changing the account', () => {
  const previousAdminEmail = process.env.ADMIN_EMAIL;
  try {
    process.env.ADMIN_EMAIL = 'owner@example.test';
    const db = seedDatabase();
    const passwordHash = hashPassword('CustomerPassword2026!');
    db.users.push({ ...user, passwordHash });
    const token = 'a'.repeat(64);
    db.sessions.push({ hash: tokenHash(token), userId: user.id, expiresAt: Date.now() + 60000 });
    assert.throws(() => updateCredentials(db, user, { currentPassword: 'CustomerPassword2026!', email: ' OWNER@EXAMPLE.TEST ', newPassword: 'AnotherPassword2026!' }), /unavailable/);
    assert.equal(db.users[0].email, user.email);
    assert.equal(db.users[0].role, 'customer');
    assert.equal(db.users[0].passwordHash, passwordHash);
    assert.equal(userForToken(db, token)?.id, user.id);
    delete process.env.ADMIN_EMAIL;
    assert.throws(() => updateCredentials(db, user, { currentPassword: 'CustomerPassword2026!', email: 'admin@goya.demo' }), /unavailable/);
    assert.equal(db.users[0].email, user.email);
  } finally {
    if (previousAdminEmail === undefined) delete process.env.ADMIN_EMAIL;
    else process.env.ADMIN_EMAIL = previousAdminEmail;
  }
});

test('administrator provisioning revokes a former customer session and recovery proof before promotion', () => {
  const db = seedDatabase();
  const previous = { ...user, email: 'owner@example.test', passwordHash: hashPassword('CustomerPassword2026!') };
  db.users.push(previous, { ...other, email: 'other@example.test', passwordHash: 'unused' });
  const oldToken = 'b'.repeat(64); const unrelatedToken = 'c'.repeat(64);
  db.sessions.push({ hash: tokenHash(oldToken), userId: user.id, expiresAt: Date.now() + 60000 }, { hash: tokenHash(unrelatedToken), userId: other.id, expiresAt: Date.now() + 60000 });
  const recoveryCode = issueRecoveryCode(db, user.id);
  const resetToken = beginDemoRecovery(db, previous.email, recoveryCode)!;
  const adminHash = hashPassword('AdministratorPassword2026!');
  const admin = provisionAdministrator(db, previous.email, adminHash);
  assert.equal(admin.id, user.id);
  assert.equal(admin.role, 'admin');
  assert.equal(db.users[0].passwordHash, adminHash);
  assert.equal(userForToken(db, oldToken), null);
  assert.equal(userForToken(db, unrelatedToken)?.id, other.id);
  assert.equal(db.users[0].recoveryHash, undefined);
  assert.equal(db.users[0].recoveryExpiresAt, undefined);
  assert.equal(beginDemoRecovery(db, previous.email, recoveryCode), null);
  assert.throws(() => finishDemoRecovery(db, resetToken, 'ResetPassword2026!'), /expired/);
  const adminToken = 'd'.repeat(64);
  db.sessions.push({ hash: tokenHash(adminToken), userId: admin.id, expiresAt: Date.now() + 60000 });
  provisionAdministrator(db, previous.email, adminHash);
  assert.equal(userForToken(db, adminToken)?.role, 'admin');
});

test('guest order lookup opens only the exact order matching both reference and email', () => {
  const db = seedDatabase();
  const first = placeOrder(db, user, input());
  placeOrder(db, user, { ...input(), cart: [{ productId: 'francesco', size: '42', quantity: 1 }] });
  const guest = prepareGuestCheckout(db, null);
  const stranger = prepareGuestCheckout(db, null);
  assert.throws(() => lookupCustomerOrder(db, first.id, 'wrong@example.test', guest.identity), /No matching/);
  assert.equal(snapshot(db, 1, null, false, guest.identity).orders.length, 0);
  assert.equal(lookupCustomerOrder(db, first.id.toLowerCase(), user.email.toUpperCase(), guest.identity).id, first.id);
  assert.deepEqual(snapshot(db, 1, null, false, guest.identity).orders.map(value => value.id), [first.id]);
  assert.equal(snapshot(db, 1, null, false, stranger.identity).orders.length, 0);
  assert.equal(userForToken(db, guest.token), null);
  assert.throws(() => accessibleOrder(db, other, stranger.identity, first.id), /not found/);
  assert.equal(accessibleOrder(db, null, guest.identity, first.id).id, first.id);
});

test('returns are owned, quantity-bound, idempotent and restore stock once on receipt', () => {
  const db = seedDatabase(); const order = placeOrder(db, user, input());
  const guest = prepareGuestCheckout(db, null);
  const payload = { orderId: order.id, lines: [{ productId: 'francesco', size: '45', quantity: 1, reason: 'size' }], idempotencyKey: randomUUID(), comment: 'Demo fit request' };
  assert.throws(() => requestCustomerReturn(db, user, null, payload), /delivered/);
  for (const status of ['preparing', 'shipped', 'delivered'] as const) changeOrderStatus(db, order.id, status);
  assert.throws(() => requestCustomerReturn(db, other, guest.identity, payload), /not found/);
  const record = requestCustomerReturn(db, user, null, payload);
  assert.equal(requestCustomerReturn(db, user, null, payload).id, record.id);
  assert.throws(() => requestCustomerReturn(db, user, null, { ...payload, idempotencyKey: randomUUID() }), /already/);
  assert.equal(record.refundAmount, order.lines[0].unitPrice);
  assert.equal(db.products[0].stock['45'], 0);
  assert.throws(() => updateReturnStatus(db, record.id, 'refunded'), /unavailable/);
  updateReturnStatus(db, record.id, 'approved'); updateReturnStatus(db, record.id, 'received'); updateReturnStatus(db, record.id, 'received');
  assert.equal(db.products[0].stock['45'], 1);
  updateReturnStatus(db, record.id, 'refunded'); updateReturnStatus(db, record.id, 'refunded');
  assert.equal(db.products[0].stock['45'], 1);
  assert.deepEqual(record.events.map(value => value.status), ['requested', 'approved', 'received', 'refunded']);
  assert.equal(snapshot(db, 1, other).returns?.length, 0);
  lookupCustomerOrder(db, order.id, user.email, guest.identity);
  assert.equal(snapshot(db, 1, null, false, guest.identity).returns?.[0].id, record.id);
});

test('invalid return lines never create records and rejection releases only its reserved quantity', () => {
  const db = seedDatabase(); const order = placeOrder(db, user, input());
  for (const status of ['preparing', 'shipped', 'delivered'] as const) changeOrderStatus(db, order.id, status);
  const payload = { orderId: order.id, lines: [{ productId: 'francesco', size: '45', quantity: 1, reason: 'style' }] };
  assert.throws(() => requestCustomerReturn(db, user, null, { ...payload, lines: [{ ...payload.lines[0], quantity: 2 }] }), /quantity/);
  assert.throws(() => requestCustomerReturn(db, user, null, { ...payload, lines: [payload.lines[0], payload.lines[0]] }), /Check|Select/);
  const record = requestCustomerReturn(db, user, null, payload); updateReturnStatus(db, record.id, 'rejected');
  assert.equal(db.products[0].stock['45'], 0);
  assert.notEqual(requestCustomerReturn(db, user, null, payload).id, record.id);
});

test('service requests persist privately, bound details and support a real demo status response', () => {
  const db = seedDatabase(); const guest = prepareGuestCheckout(db, null); const stranger = prepareGuestCheckout(db, null);
  const request = createServiceRequest(db, null, guest.identity, { kind: 'care', name: 'Demo Guest', email: 'care@example.test', locale: 'fr', details: { service: 'patina', message: 'Restore the colour' } });
  assert.equal(snapshot(db, 1, null, false, guest.identity).requests?.[0].id, request.id);
  assert.equal(snapshot(db, 1, null, false, stranger.identity).requests?.length, 0);
  assert.throws(() => ownServiceRequest(db, null, stranger.identity, request.id), /not found/);
  assert.equal(ownServiceRequest(db, null, guest.identity, request.id).email, 'care@example.test');
  updateServiceRequest(db, request.id, 'reviewing', 'Nous préparons votre devis de démonstration.');
  assert.equal(request.status, 'reviewing'); assert.ok(request.note?.includes('devis'));
  assert.throws(() => createServiceRequest(db, null, guest.identity, { ...request, details: { message: 'x'.repeat(3001) } }), /shorten/);
  assert.throws(() => createServiceRequest(db, null, guest.identity, { ...request, attachments: [{ name: 'bad.svg', type: 'image/svg+xml', dataUrl: 'data:image/svg+xml;base64,PHN2Zz4=' }] }), /JPEG/);
});

test('restocking resolves availability requests and creates only the requesting account notification', () => {
  const db = seedDatabase(); const product = db.products[0]; product.stock = { ...product.stock, '42': 0 };
  const record = createServiceRequest(db, user, null, { kind: 'availability', name: user.name, email: user.email, locale: 'en', productId: product.id, details: { size: '42' } });
  processAvailability(db, product); assert.equal(record.status, 'received');
  product.stock = { ...product.stock, '42': 2 }; processAvailability(db, product); processAvailability(db, product);
  assert.equal(record.status, 'confirmed'); assert.equal(db.notifications.length, 1); assert.equal(db.notifications[0].userId, user.id);
  assert.equal(snapshot(db, 1, other).requests?.length, 0);
});

test('credential changes require current password, reject duplicate email and revoke old sessions', () => {
  const db = seedDatabase(); db.users.push({ ...user, passwordHash: hashPassword('OriginalDemo2026!') }, { ...other, email: 'taken@example.test', passwordHash: 'unused' });
  db.sessions.push({ hash: tokenHash('old-token'), userId: user.id, expiresAt: Date.now() + 60000 });
  assert.throws(() => updateCredentials(db, user, { currentPassword: 'wrong', email: 'updated@example.test' }), /incorrect/);
  assert.throws(() => updateCredentials(db, user, { currentPassword: 'OriginalDemo2026!', email: 'taken@example.test' }), /unavailable/);
  const result = updateCredentials(db, user, { currentPassword: 'OriginalDemo2026!', email: 'updated@example.test', newPassword: 'UpdatedDemo2026!' });
  assert.equal(result.user.email, 'updated@example.test'); assert.ok(checkPassword('UpdatedDemo2026!', db.users[0].passwordHash));
  assert.equal(userForToken(db, 'old-token'), null); assert.match(result.recoveryCode, /^[a-f0-9]{64}$/);
});

test('recovery requires proof issued after authentication and consumes reset links once', () => {
  const db = seedDatabase(); db.users.push({ ...user, passwordHash: hashPassword('OriginalDemo2026!') });
  const proof = issueRecoveryCode(db, user.id);
  assert.equal(beginDemoRecovery(db, user.email, undefined), null);
  assert.equal(beginDemoRecovery(db, user.email, 'a'.repeat(64)), null);
  assert.equal(beginDemoRecovery(db, other.email + '.wrong', proof), null);
  const token = beginDemoRecovery(db, user.email, proof)!; assert.match(token, /^[a-f0-9]{64}$/);
  assert.ok(!JSON.stringify(db).includes(token));
  db.sessions.push({ hash: tokenHash('existing-session'), userId: user.id, expiresAt: Date.now() + 60000 });
  finishDemoRecovery(db, token, 'RecoveredDemo2026!');
  assert.ok(checkPassword('RecoveredDemo2026!', db.users[0].passwordHash)); assert.equal(userForToken(db, 'existing-session'), null);
  assert.throws(() => finishDemoRecovery(db, token, 'AnotherDemo2026!'), /expired/);
  assert.equal(beginDemoRecovery(db, user.email, proof), null);
});

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

test('metadata edits distinguish omitted fields from explicit clearing and remove irrelevant shoe fields', () => {
  const product = { ...seedDatabase().products[0], style: 'loafers' as const, fit: 'regular' as const, audience: 'men' as const, construction: 'Hand-finished', colorGroup: 'brown', edits: ['new'] as const };
  const existing = { ...product, edits: [...product.edits] };
  const omitted: Record<string, unknown> = { ...existing };
  for (const field of ['style', 'fit', 'audience', 'construction', 'colorGroup', 'edits']) delete omitted[field];
  const preserved = validateProduct(omitted, existing);
  assert.equal(preserved.style, 'loafers'); assert.equal(preserved.fit, 'regular'); assert.equal(preserved.audience, 'men');
  assert.equal(preserved.construction, 'Hand-finished'); assert.equal(preserved.colorGroup, 'brown'); assert.deepEqual(preserved.edits, ['new']);
  const cleared = validateProduct({ ...existing, style: '', fit: '', audience: '', construction: '', colorGroup: '', edits: [] }, existing);
  for (const field of ['style', 'fit', 'audience', 'construction', 'colorGroup'] as const) assert.equal(cleared[field], undefined);
  assert.deepEqual(cleared.edits, []);
  const accessory = validateProduct({ ...existing, kind: 'accessory', stock: { OS: 3 }, accessoryType: 'wallets' }, existing);
  assert.equal(accessory.style, undefined); assert.equal(accessory.fit, undefined); assert.equal(accessory.construction, undefined);
  assert.equal(accessory.accessoryType, 'wallets');
});

test('archive images can be saved while external images and traversal paths are rejected', () => {
  const product = seedDatabase().products.find(value => value.images?.some(image => image.startsWith('/images/archive/')))!;
  assert.ok(product);
  assert.deepEqual(validateProduct({ ...product }).images, product.images);
  for (const image of ['/images/archive/../private.jpg', '/images/./private.jpg', '/images/..', 'https://example.test/product.jpg']) {
    assert.throws(() => validateProduct({ ...product, images: [image] }), /images/);
  }
});

test('catalogue reconciliation adds missing archive products without changing edited archive records', () => {
  const db = seedDatabase();
  const archive = db.products.filter(value => value.images?.some(image => image.startsWith('/images/archive/')));
  assert.ok(archive.length > 1);
  const edited = archive[0]; const missing = archive[1];
  edited.prices = { EUR: 12345, USD: 23456, XOF: 34567 }; edited.stock = { '42': 0 };
  edited.images = ['/api/media/owner-photo.jpg']; edited.published = false; edited.style = 'boots';
  const before = structuredClone(edited);
  db.products = db.products.filter(value => value.id !== missing.id);
  reconcileDemoCatalog(db); reconcileDemoCatalog(db);
  assert.deepEqual(db.products.find(value => value.id === edited.id), before);
  assert.equal(db.products.filter(value => value.id === missing.id).length, 1);
  assert.equal(db.products.find(value => value.id === missing.id)?.published, true);
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
