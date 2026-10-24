import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { changeLanguage, seedPrivacy } from './navigation';

const origin = 'http://127.0.0.1:3100';

async function addFrancesco(page: Page) {
  await page.goto('/product/francesco');
  await expect(page.locator('[data-product-detail="francesco"]')).toBeVisible();
  await page.locator('#pdp-size-francesco').selectOption('42');
  await page.locator('.pdp-purchase').getByRole('button', { name: 'Add to bag', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Shopping bag', exact: true })).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await seedPrivacy(page);
  const headers = { origin };
  const login = await page.request.post('/api/shop', { headers, data: { action: 'login', email: 'admin@goya.demo', password: 'MaisonDemo2026!' } });
  expect(login.ok()).toBe(true);
  const snapshot = await (await page.request.get('/api/shop?admin=1')).json();
  const product = snapshot.products.find((product: { id: string }) => product.id === 'francesco');
  const update = await page.request.post('/api/shop', { headers, data: { action: 'saveProduct', product: { ...product, published: true, stock: { ...product.stock, '42': 5 } }, expectedUpdatedAt: product.updatedAt ?? null } });
  expect(update.ok()).toBe(true);
  await page.request.post('/api/shop', { headers, data: { action: 'logout' } });
  await page.goto('/collections');
  await expect(page.locator('[data-product-id="francesco"]')).toBeVisible();
  expect((await (await page.request.get('/api/shop')).json()).user).toBeNull();
});

test('public product and open bag translate without losing the selected size', async ({ page }) => {
  await changeLanguage(page, 'Français');
  await expect(page.locator('[data-product-id="francesco"] h3')).toHaveText('Le Mocassin Francesco');
  await page.locator('[data-product-id="francesco"] .reference-card-image').click();
  await expect(page).toHaveURL(/\/product\/francesco$/);
  await page.locator('#pdp-size-francesco').selectOption('42');
  await changeLanguage(page, 'English');
  await expect(page.locator('#pdp-size-francesco')).toHaveValue('42');
  await page.locator('.pdp-purchase').getByRole('button', { name: 'Add to bag', exact: true }).click();
  const bag = page.getByRole('dialog');
  await expect(bag).toHaveAccessibleName('Shopping bag');
  await expect(bag.locator('.cart-size')).toContainText('42');
  await bag.getByRole('button', { name: 'Français', exact: true }).click();
  await expect(bag).toHaveAccessibleName('Panier');
  await expect(bag.locator('.cart-size')).toContainText('42');
  await bag.getByRole('button', { name: 'English', exact: true }).click();
  await expect(bag).toHaveAccessibleName('Shopping bag');
});

test('anonymous bag quantities, currency and variant survive a reload', async ({ page }) => {
  await addFrancesco(page);
  await page.getByRole('button', { name: 'Increase quantity', exact: true }).click();
  await expect(page.locator('.quantity-control output')).toHaveText('2');
  await page.getByRole('dialog').getByLabel('Currency', { exact: true }).selectOption('XOF');
  await page.reload();
  await expect(page.locator('[data-cart-trigger]')).toHaveAccessibleName('Shopping bag (2)');
  await page.locator('[data-cart-trigger]').click();
  await expect(page.locator('.quantity-control output')).toHaveText('2');
  await expect(page.getByRole('dialog').getByLabel('Currency', { exact: true })).toHaveValue('XOF');
  expect((await (await page.request.get('/api/shop')).json()).user).toBeNull();
});

test('bag quantity cannot exceed the shared published variant stock', async ({ page }) => {
  await addFrancesco(page);
  const increase = page.getByRole('button', { name: 'Increase quantity', exact: true });
  for (let i = 0; i < 4; i++) await increase.click();
  await expect(page.locator('.quantity-control output')).toHaveText('5');
  await expect(increase).toBeDisabled();
});

test('guest checkout saves billing and gift details, confirms once and restricts tracking to its cookie', async ({ page, browser, isMobile }) => {
  test.setTimeout(120000);
  const actions: string[] = [];
  page.on('request', request => {
    if (request.method() === 'POST' && new URL(request.url()).pathname === '/api/shop') {
      try { actions.push(request.postDataJSON().action); } catch { /* Ignore non-JSON requests. */ }
    }
  });
  await addFrancesco(page);
  await page.getByRole('dialog').getByRole('link', { name: 'Boutique checkout', exact: true }).click();
  await expect(page).toHaveURL(/\/checkout$/);
  await page.getByRole('button', { name: 'Continue as a guest', exact: true }).click();
  const checkout = page.locator('.checkout-reference');
  await checkout.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.locator('#shipping-email')).toHaveAttribute('aria-invalid', 'true');
  await page.locator('#shipping-name').fill('Demo Guest');
  await page.locator('#shipping-email').fill('guest@example.test');
  await page.locator('#shipping-address').fill('12 Demo Avenue');
  await page.locator('#shipping-address2').fill('Floor 2');
  await page.locator('#shipping-postalCode').fill('75008');
  await page.locator('#shipping-phone').fill('+229 01 00 00 00 00');
  await page.locator('#shipping-city').fill('Cotonou');
  await page.locator('#shipping-country').selectOption('FR');
  await checkout.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(checkout.getByRole('radio', { name: /Mobile Money/ })).toBeDisabled();
  await checkout.getByRole('button', { name: 'Back', exact: true }).click();
  await page.locator('#shipping-country').selectOption('BJ');
  await checkout.getByLabel('Use my delivery address for billing', { exact: true }).uncheck();
  await page.locator('#billing-name').fill('Billing Guest');
  await page.locator('#billing-email').fill('billing@example.test');
  await page.locator('#billing-address').fill('24 Billing Street');
  await page.locator('#billing-city').fill('Paris');
  await page.locator('#billing-country').selectOption('FR');
  await checkout.getByLabel('Add complimentary Goya gift packaging', { exact: false }).check();
  await checkout.getByLabel('Gift message (optional)', { exact: false }).fill('A beautiful step forward.');
  await expect(checkout.locator('.checkout-gift-message textarea')).toHaveAttribute('maxlength', '300');
  await checkout.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(checkout.locator('.checkout-address-review')).toContainText('24 Billing Street');
  await checkout.getByRole('radio', { name: /Mobile Money/ }).check();
  await checkout.getByRole('button', { name: 'Confirm demo order', exact: true }).click();
  await expect(checkout.locator('input[autocomplete="cc-number"]')).toHaveCount(0);
  await checkout.getByLabel('Demo mobile number', { exact: true }).fill('0100000000');
  await checkout.getByRole('button', { name: 'Send demo payment request', exact: true }).click();
  await checkout.getByRole('button', { name: 'Approve demo payment', exact: true }).click();
  await expect(checkout.getByRole('heading', { name: 'A beautiful choice.', exact: true })).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(actions.indexOf('guestSession')).toBeGreaterThanOrEqual(0);
  expect(actions.indexOf('guestSession')).toBeLessThan(actions.indexOf('order'));
  const orderId = (await checkout.locator('.confirmation-references strong').first().textContent())!;
  const snapshot = await (await page.request.get('/api/shop')).json();
  expect(snapshot.user).toBeNull();
  expect(snapshot.orders).toHaveLength(1);
  const order = snapshot.orders[0];
  expect(order.id).toBe(orderId);
  expect(order.customerId).toBeNull();
  expect(order.billingRecipient.address).toBe('24 Billing Street');
  expect(order.recipient.address2).toBe('Floor 2');
  expect(order.gift).toEqual({ wrap: true, message: 'A beautiful step forward.' });
  const beforeStock = snapshot.products.find((product: { id: string }) => product.id === 'francesco').stock['42'];
  const repeated = await page.request.post('/api/shop', { headers: { origin }, data: { action: 'order', cart: [{ productId: 'francesco', size: '42', quantity: 1 }], currency: order.currency, payment: order.payment, recipient: order.recipient, idempotencyKey: order.checkoutReference } });
  expect(repeated.ok()).toBe(true);
  expect((await repeated.json()).order.id).toBe(orderId);
  const repeatedSnapshot = await (await page.request.get('/api/shop')).json();
  expect(repeatedSnapshot.orders).toHaveLength(1);
  expect(repeatedSnapshot.products.find((product: { id: string }) => product.id === 'francesco').stock['42']).toBe(beforeStock);
  const download = page.waitForEvent('download');
  await checkout.getByRole('button', { name: 'Download demo invoice', exact: true }).click();
  expect((await download).suggestedFilename()).toContain(orderId.toLowerCase());
  await page.reload();
  await expect(page.locator('.confirmation-references')).toContainText(orderId);
  await page.getByRole('link', { name: 'Track this order', exact: true }).click();
  await expect(page).toHaveURL(/\/track-order$/);
  await expect(page.locator('.reference-tracked-order')).toContainText(orderId);
  await page.getByLabel('Order or tracking number', { exact: true }).fill('DEMO-MG-NOT-MINE');
  await expect(page.getByRole('status')).toContainText('No matching order is available in this session.');
  await page.getByLabel('Order or tracking number', { exact: true }).fill(orderId);
  await expect(page.locator('.reference-tracked-order')).toContainText(orderId);
  await page.screenshot({ path: `test-results/guest-tracking-${isMobile ? 'mobile' : 'desktop'}.png`, fullPage: true });
  const cookies = await page.context().cookies();
  expect(cookies.find(cookie => cookie.name === 'mg_guest')).toMatchObject({ httpOnly: true, sameSite: 'Lax' });
  const stranger = await browser.newContext({ viewport: isMobile ? { width: 393, height: 851 } : { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  try {
    await seedPrivacy(stranger);
    const strangerPage = await stranger.newPage();
    await strangerPage.goto(`${origin}/track-order?orderId=${encodeURIComponent(orderId)}`);
    await expect(strangerPage.locator('.reference-public-empty')).toContainText('No orders are available here yet.');
    await expect(strangerPage.locator('.reference-tracked-order')).toHaveCount(0);
    const strangerSnapshot = await (await stranger.request.get(`${origin}/api/shop?orderId=${encodeURIComponent(orderId)}`)).json();
    expect(strangerSnapshot.orders).toEqual([]);
    expect(strangerSnapshot.user).toBeNull();
    expect(strangerSnapshot.notifications).toEqual([]);
  } finally { await stranger.close(); }
});

test('bag focus trapping, Escape and public continuation work without an account', async ({ page }) => {
  await page.locator('[data-cart-trigger]').click();
  for (let i = 0; i < 14; i++) {
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => !!document.activeElement?.closest('dialog[open]'))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('[data-cart-trigger]')).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('');
  await page.locator('[data-cart-trigger]').click();
  await page.getByRole('dialog').getByRole('link', { name: 'Explore the collection', exact: true }).click();
  await expect(page).toHaveURL(/\/collections$/);
});

test('public search ignores accents and filters, sorting and shoe-category routes work', async ({ page }) => {
  await page.locator('.reference-search-trigger').click();
  await page.locator('#maison-search').fill('decontracte');
  await expect(page.locator('.reference-search-results li').first()).toBeVisible();
  const unaccented = await page.locator('.reference-search-results h3').allTextContents();
  await page.locator('#maison-search').fill('DÉCONTRACTÉ');
  await expect(page.locator('.reference-search-results h3')).toHaveText(unaccented);
  await page.keyboard.press('Escape');
  await page.getByLabel('Sort by', { exact: true }).selectOption('priceAsc');
  const snapshot = await (await page.request.get('/api/shop')).json();
  const ids = await page.locator('.product-card').evaluateAll(cards => cards.map(card => card.getAttribute('data-product-id')));
  const prices = ids.map(id => snapshot.products.find((product: { id: string }) => product.id === id).prices.EUR);
  expect(prices).toEqual([...prices].sort((a, b) => a - b));
  await page.getByRole('button', { name: 'Filters', exact: true }).click();
  const filters = page.getByRole('dialog', { name: 'Filters', exact: true });
  await filters.locator('.reference-filter-group').filter({ has: page.locator('summary', { hasText: /^Colour/ }) }).locator('summary').click();
  await filters.getByRole('checkbox', { name: 'Black', exact: true }).check();
  await filters.getByRole('button', { name: /^Show \d+ results?$/ }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('[data-product-id="francesco"]')).toBeVisible();
  await expect(page.locator('.reference-active-filters')).toContainText('Black');
  const filteredIds = await page.locator('.product-card').evaluateAll(cards => cards.map(card => card.getAttribute('data-product-id')));
  expect(filteredIds.length).toBeGreaterThan(0);
  for (const id of filteredIds) expect(snapshot.products.find((product: { id: string }) => product.id === id).color.en.toLowerCase()).toContain('black');
  await page.getByRole('button', { name: 'Clear all', exact: true }).click();
  await page.goto('/women/boots');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ankle boots for women');
  await expect(page.locator('[data-product-id="calfskin-belt"]')).toBeVisible();
  await expect(page.locator('[data-product-id="francesco"]')).toHaveCount(0);
});

test('public product gallery, size guide, wishlist and move-from-bag stay available as a guest', async ({ page }) => {
  await page.goto('/product/francesco');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Le Francesco Loafer');
  await page.locator('.pdp-gallery').getByRole('button', { name: /^Enlarge / }).first().click();
  await expect(page.getByRole('dialog', { name: 'Product image zoom', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Close image zoom', exact: true }).click();
  await page.getByRole('button', { name: 'Size guide', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Size guide', exact: true }).getByRole('table')).toBeVisible();
  await page.keyboard.press('Escape');
  const heart = page.locator('.pdp-purchase').getByRole('button', { name: 'Add to wishlist', exact: true });
  await heart.click();
  await expect(page.locator('.pdp-purchase .pdp-wishlist-button')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('.reference-wishlist-trigger').click();
  await expect(page).toHaveURL(/\/wishlist$/);
  await expect(page.locator('[data-product-id="francesco"]')).toBeVisible();
  await page.reload();
  await expect(page.locator('[data-product-id="francesco"]')).toBeVisible();
  await addFrancesco(page);
  await page.getByRole('button', { name: 'Move to wishlist', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('heading', { name: 'Your next chapter awaits.', exact: true })).toBeVisible();
  await page.getByRole('dialog').getByRole('link', { name: 'View my wishlist', exact: true }).click();
  await expect(page.locator('[data-product-id="francesco"]')).toHaveCount(1);
  expect((await (await page.request.get('/api/shop')).json()).user).toBeNull();
});

test('guest shoe-care appointment confirms bilingually and keeps personal details in its own cookie', async ({ page, browser }) => {
  await page.goto('/shoe-care');
  await page.getByRole('button', { name: 'Book a shoe-care service', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Atelier Cotonou', exact: true });
  await dialog.getByRole('button', { name: 'Confirm demo appointment', exact: true }).click();
  await expect(page.locator('#atelier-date')).toHaveAttribute('aria-invalid', 'true');
  const email = `appointment-${crypto.randomUUID()}@example.test`;
  await dialog.getByLabel('Full name', { exact: true }).fill('Appointment Guest');
  await dialog.getByLabel('Email address', { exact: true }).fill(email);
  const min = await page.locator('#atelier-date').getAttribute('min');
  let time = '';
  for (let offset = 2; offset < 20 && !time; offset++) {
    const date = new Date(`${min}T12:00:00Z`);
    date.setUTCDate(date.getUTCDate() + offset);
    if (date.getUTCDay() === 0) continue;
    await page.locator('#atelier-date').fill(date.toISOString().slice(0, 10));
    time = await page.locator('#atelier-time').evaluate(element => Array.from((element as HTMLSelectElement).options).find(option => option.value && !option.disabled)?.value ?? '');
  }
  expect(time).not.toBe('');
  await page.locator('#atelier-time').selectOption(time);
  await dialog.getByRole('button', { name: 'Confirm demo appointment', exact: true }).click();
  await expect(dialog.getByRole('heading', { name: 'A moment, reserved.', exact: true })).toBeVisible();
  const own = await (await page.request.get('/api/shop')).json();
  expect(own.user).toBeNull();
  expect(own.bookings).toHaveLength(1);
  expect(own.bookings[0].email).toBe(email);
  expect(own.bookings[0].customerId).toBeNull();
  await dialog.getByRole('button', { name: 'Français', exact: true }).click();
  await expect(dialog.getByRole('heading', { name: 'Un instant, réservé.', exact: true })).toBeVisible();
  await expect(dialog.locator('.booking-summary')).toContainText(own.bookings[0].id);
  const stranger = await browser.newContext();
  try {
    const snapshot = await (await stranger.request.get(`${origin}/api/shop`)).json();
    expect(snapshot.bookings).toEqual([]);
    expect(JSON.stringify(snapshot)).not.toContain(email);
    expect(snapshot.bookedSlots).toContainEqual({ date: own.bookings[0].date, time, location: own.bookings[0].location });
    for (const slot of snapshot.bookedSlots) expect(Object.keys(slot).sort()).toEqual(['date', 'location', 'time']);
  } finally { await stranger.close(); }
});

test('reduced motion keeps campaign media and category navigation accessible', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.campaign-hero')).toBeVisible();
  await page.locator('.campaign-copy a').click();
  await expect(page.locator('.brand-category-grid')).toBeInViewport();
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
  await page.locator('.brand-category-grid a').first().click();
  await expect(page).toHaveURL(/\/men\/loafers$/);
  await expect(page.locator('.product-card').first()).toBeVisible();
});

test.describe('desktop campaign animation', () => {
  test.use({ reducedMotion: 'no-preference', viewport: { width: 1440, height: 1000 } });
  test('language changes preserve scrolling and campaign category links', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Campaign motion is verified on the desktop project.');
    await page.goto('/');
    await expect(page.locator('.campaign-hero')).toBeVisible();
    for (let i = 0; i < 2; i++) { await changeLanguage(page, 'Français'); await changeLanguage(page, 'English'); }
    await expect(page.locator('.pin-spacer')).toHaveCount(0);
    await page.locator('.campaign-copy a').click();
    await expect(page.locator('.brand-category-grid')).toBeInViewport();
  });
});
