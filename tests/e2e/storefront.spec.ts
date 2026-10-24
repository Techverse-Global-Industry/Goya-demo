import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import type { CartQuote, Currency } from '../../lib/types';
import { formatMoney } from '../../lib/commerce';
import { changeLanguage, openShoppingBag, seedPrivacy } from './navigation';
import { chooseListboxOption, openSizeChart, openWishlist, selectProductSize } from './catalog-navigation';

const origin = 'http://127.0.0.1:3100';

async function addFrancesco(page: Page) {
  await page.goto('/product/francesco');
  await expect(page.locator('[data-product-detail="francesco"]')).toBeVisible();
  await selectProductSize(page, 'francesco', '42');
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

test('product and bag preserve the selected size across language changes', async ({ page }) => {
  await changeLanguage(page, 'Français');
  await expect(page.locator('[data-product-id="francesco"] h3')).toHaveText('Le Mocassin Francesco');
  await page.locator('[data-product-id="francesco"] .reference-card-image').click();
  await expect(page).toHaveURL(/\/product\/francesco$/);
  await selectProductSize(page, 'francesco', '42');
  await changeLanguage(page, 'English');
  await expect(page.locator('#pdp-size-francesco')).toContainText('42');
  await page.locator('.pdp-purchase').getByRole('button', { name: 'Add to bag', exact: true }).click();
  const bag = page.getByRole('dialog');
  await expect(bag).toHaveAccessibleName('Shopping bag');
  await expect(bag.locator('.exact-bag-product-copy')).toContainText('Size: EU 42');
  await page.keyboard.press('Escape');
  await changeLanguage(page, 'Français');
  await page.locator('[data-cart-trigger]').click();
  await expect(bag).toHaveAccessibleName('Panier');
  await expect(bag.locator('.exact-bag-product-copy')).toContainText('42');
  await page.keyboard.press('Escape');
  await changeLanguage(page, 'English');
  await page.locator('[data-cart-trigger]').click();
  await expect(bag).toHaveAccessibleName('Shopping bag');
});

test('anonymous bag quantities, currency and variant survive a reload', async ({ page }) => {
  await page.goto('/countries');
  await page.locator('.exact-country-search input').fill('Benin');
  await page.getByRole('option', { name: 'Benin', exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
  // Country navigation updates the URL before the public shell has mounted.
  await expect(page.locator('.site-header:visible')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('.exact-footer-country > button')).toBeVisible();
  await changeLanguage(page, 'English');
  await addFrancesco(page);
  await page.getByRole('button', { name: 'Increase quantity', exact: true }).click();
  await expect(page.locator('.exact-bag-quantity output')).toHaveText('2');
  await page.reload();
  await expect(page.locator('.site-header:visible [data-cart-trigger]')).toHaveAccessibleName('Shopping bag (2)');
  await openShoppingBag(page);
  await expect(page.locator('.exact-bag-quantity output')).toHaveText('2');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('maison-goya:v1')!).currency)).toBe('XOF');
  expect((await (await page.request.get('/api/shop')).json()).user).toBeNull();
});

test('bag quantity cannot exceed the shared published variant stock', async ({ page }) => {
  await addFrancesco(page);
  const increase = page.getByRole('button', { name: 'Increase quantity', exact: true });
  for (let i = 0; i < 4; i++) await increase.click();
  await expect(page.locator('.exact-bag-quantity output')).toHaveText('5');
  await expect(increase).toBeDisabled();
});

test('bag promo codes use server quotes, persist, remove cleanly and open demo express checkout', async ({ page }) => {
  await addFrancesco(page);
  await page.keyboard.press('Escape');
  await page.goto('/bag');
  const promo = page.locator('.exact-bag-promo');
  await promo.getByRole('button', { name: 'Promo code', exact: true }).click();
  const input = promo.getByLabel('Enter your promo code', { exact: true });
  await input.fill('INVALID');
  await promo.getByRole('button', { name: 'Apply', exact: true }).click();
  await expect(promo.getByRole('alert')).toHaveText('This promo code is not valid.');
  await expect(page.locator('.exact-bag-discount')).toHaveCount(0);
  await input.fill('goya10');
  await promo.getByRole('button', { name: 'Apply', exact: true }).click();
  await expect(promo.getByRole('status')).toContainText('Promo code applied.');
  await expect(input).toHaveValue('GOYA10');
  const currency = await page.evaluate(() => JSON.parse(localStorage.getItem('maison-goya:v1')!).currency) as Currency;
  const quoteResponse = await page.request.post('/api/shop', { headers: { origin }, data: { action: 'cartQuote', cart: [{ productId: 'francesco', size: '42', quantity: 1 }], currency, promoCode: 'GOYA10' } });
  expect(quoteResponse.ok()).toBe(true);
  const { quote } = await quoteResponse.json() as { quote: CartQuote };
  expect(quote.discount).toBeGreaterThan(0);
  await expect(page.locator('.exact-bag-discount')).toContainText('−' + formatMoney(quote.discount, currency, 'en'));
  await expect(page.locator('.exact-bag-grand-total strong')).toHaveText(formatMoney(quote.total, currency, 'en'));
  await page.reload();
  await expect(promo.getByLabel('Enter your promo code', { exact: true })).toHaveValue('GOYA10');
  await expect(page.locator('.exact-bag-grand-total strong')).toHaveText(formatMoney(quote.total, currency, 'en'));
  await promo.getByRole('button', { name: 'Remove promo code', exact: true }).click();
  await expect(promo.getByRole('status')).toHaveText('Promo code removed.');
  await expect(page.locator('.exact-bag-discount')).toHaveCount(0);
  const fullPriceResponse = await page.request.post('/api/shop', { headers: { origin }, data: { action: 'cartQuote', cart: [{ productId: 'francesco', size: '42', quantity: 1 }], currency } });
  expect(fullPriceResponse.ok()).toBe(true);
  const fullPrice = await fullPriceResponse.json() as { quote: CartQuote };
  await expect(page.locator('.exact-bag-grand-total strong')).toHaveText(formatMoney(fullPrice.quote.total, currency, 'en'));
  for (const [payment, provider] of [['paypal', 'PayPal'], ['apple', 'Apple Pay']]) {
    await page.locator('.exact-bag-express').getByRole('link', { name: `Continue with ${provider} (demo)`, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/checkout\\?payment=${payment}$`));
    await expect(page.locator('.checkout-express-notice')).toContainText(provider);
    await page.goto('/bag');
  }
  expect((await (await page.request.get('/api/shop')).json()).orders).toEqual([]);
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
  await page.getByLabel('Filter these orders', { exact: true }).fill('DEMO-MG-NOT-MINE');
  await expect(page.getByRole('status')).toContainText('No matching order is available in this session.');
  await page.getByLabel('Filter these orders', { exact: true }).fill(orderId);
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
  // Empty bags are a nonmodal source-style popover; populated bags trap focus.
  await openShoppingBag(page);
  await expect(page.locator('.exact-minicart-empty')).toHaveText('Your bag is empty');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(page.locator('.site-header:visible [data-cart-trigger]')).toBeFocused();
  await addFrancesco(page);
  for (let i = 0; i < 14; i++) {
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => !!document.activeElement?.closest('dialog[open]'))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  // This bag was opened by the PDP purchase button, which receives focus back.
  await expect(page.locator('.pdp-purchase .pdp-add-button')).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('');
  await openShoppingBag(page);
  await page.getByRole('dialog').getByRole('link', { name: 'Continue exploring', exact: true }).click();
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
  await chooseListboxOption(page, 'Sort by', 'Price — low to high');
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
  while (!await page.locator('[data-product-id="francesco"]').count()) {
    const previousCount = await page.locator('.reference-plp-grid .product-card').count();
    await page.getByRole('button', { name: /^Load more/ }).click();
    await expect.poll(() => page.locator('.reference-plp-grid .product-card').count()).toBeGreaterThan(previousCount);
  }
  await expect(page.locator('[data-product-id="francesco"]')).toBeVisible();
  await expect(page.locator('.reference-toolbar-reset')).toBeVisible();
  const filteredIds = await page.locator('.product-card').evaluateAll(cards => cards.map(card => card.getAttribute('data-product-id')));
  expect(filteredIds.length).toBeGreaterThan(0);
  for (const id of filteredIds) expect(snapshot.products.find((product: { id: string }) => product.id === id).color.en.toLowerCase()).toContain('black');
  await page.getByRole('button', { name: 'Clear all', exact: true }).click();
  await page.goto('/women/boots');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText("Women's Ankle boots");
  await expect(page.locator('[data-product-id="calfskin-belt"]')).toBeVisible();
  await expect(page.locator('[data-product-id="francesco"]')).toHaveCount(0);
});

test('category navigation opens the correct shoe family on desktop and mobile', async ({ page, isMobile }) => {
  if (isMobile) {
    await page.locator('.mobile-menu-trigger').click();
    const menu = page.locator('.exact-mobile-menu');
    await menu.getByRole('button', { name: /— Man$/ }).click();
    await menu.getByRole('button', { name: /— Shoes$/ }).click();
    await expect(menu.getByRole('link', { name: 'Loafers', exact: true })).toHaveAttribute('href', '/men/loafers');
    await menu.locator('.reference-mobile-back').click();
    await expect(menu.getByRole('button', { name: /— Accessories$/ })).toBeVisible();
    await menu.getByRole('button', { name: /— Shoes$/ }).click();
    await menu.getByRole('link', { name: 'Loafers', exact: true }).click();
  } else {
    await page.locator('.reference-desktop-nav a[href="/men"]').hover();
    await page.locator('#reference-mega-menu .reference-mega-columns').getByRole('link', { name: 'Loafers', exact: true }).click();
  }
  await expect(page).toHaveURL(/\/men\/loafers$/);
  await expect(page.locator('[data-product-id="francesco"]')).toBeVisible();
  await expect(page.locator('[data-product-id="cobalt-lace-up"]')).toHaveCount(0);
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('public product gallery, size guide, wishlist and move-from-bag stay available as a guest', async ({ page }) => {
  await page.goto('/product/francesco');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Le Francesco Loafer');
  await page.locator('.pdp-gallery').getByRole('button', { name: /^Enlarge / }).first().click();
  await expect(page.getByRole('dialog', { name: 'Product image zoom', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Close image zoom', exact: true }).click();
  await openSizeChart(page, 'francesco');
  await page.keyboard.press('Escape');
  const heart = page.locator('.pdp-purchase').getByRole('button', { name: 'Add to wishlist', exact: true });
  await heart.click();
  await expect(page.locator('.pdp-purchase .pdp-wishlist-button')).toHaveAttribute('aria-pressed', 'true');
  await openWishlist(page);
  await expect(page.locator('[data-product-id="francesco"]')).toBeVisible();
  await page.reload();
  await expect(page.locator('[data-product-id="francesco"]')).toBeVisible();
  await addFrancesco(page);
  await page.getByRole('dialog').getByRole('button', { name: 'Remove', exact: true }).click();
  await page.getByRole('button', { name: 'Move to wishlist', exact: true }).click();
  await expect(page.locator('.exact-minicart-empty')).toBeVisible();
  await page.keyboard.press('Escape');
  await openWishlist(page);
  await expect(page.locator('[data-product-id="francesco"]')).toHaveCount(1);
  expect((await (await page.request.get('/api/shop')).json()).user).toBeNull();
});

test('guest shoe-care appointment confirms bilingually and keeps personal details in its own cookie', async ({ page, browser }) => {
  test.setTimeout(120000);
  await page.goto('/personalization/caring');
  await page.locator('.experience-service-hero a[href^="/book-an-appointment"]').click();
  await page.locator('.consultation-landing a[href*="mode=boutique"]').click();
  const boutiques = page.locator('.exact-booking-boutiques');
  await boutiques.getByRole('button', { name: /Cotonou/ }).click();
  await boutiques.getByRole('button', { name: 'Continue', exact: true }).click();
  const service = page.locator('.exact-booking-service');
  await expect(service.getByRole('combobox', { name: 'Service requested *', exact: true })).toHaveValue('care');
  await service.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.locator('.exact-calendar-days button:not([disabled])').first().click();
  const continueDate = page.locator('.exact-booking-date').getByRole('button', { name: 'Continue', exact: true });
  await expect(continueDate).toBeDisabled();
  const slot = page.locator('.exact-booking-slot:not([disabled])').first();
  const time = (await slot.textContent())!.trim();
  await slot.click();
  await continueDate.click();
  const email = `appointment-${crypto.randomUUID()}@example.test`;
  const contact = page.locator('.exact-booking-contact');
  await contact.getByRole('button', { name: 'Confirm my demo request', exact: true }).click();
  expect(await contact.evaluate(form => (form as HTMLFormElement).checkValidity())).toBe(false);
  await contact.getByRole('combobox', { name: 'Title *', exact: true }).selectOption('mr');
  await contact.getByRole('textbox', { name: 'First name *', exact: true }).fill('Appointment');
  await contact.getByRole('textbox', { name: 'Last name *', exact: true }).fill('Guest');
  await contact.getByRole('textbox', { name: 'Email *', exact: true }).fill(email);
  await contact.getByRole('textbox', { name: 'Mobile phone number *', exact: true }).fill('+229 01 00 00 00 00');
  await contact.getByRole('combobox', { name: 'Country *', exact: true }).selectOption('BJ');
  await contact.getByRole('checkbox').check();
  const saved = page.waitForResponse(response => {
    if (!response.url().endsWith('/api/shop') || response.request().method() !== 'POST') return false;
    const payload = response.request().postDataJSON();
    return payload?.action === 'serviceRequest' && payload.request?.kind === 'consultation';
  });
  await contact.getByRole('button', { name: 'Confirm my demo request', exact: true }).click();
  expect((await saved).ok()).toBe(true);
  const receipt = page.locator('.experience-receipt');
  await expect(receipt.getByRole('heading', { name: 'Your request is received.', exact: true })).toBeVisible();
  const own = await (await page.request.get('/api/shop')).json();
  expect(own.user).toBeNull();
  expect(own.requests).toHaveLength(1);
  const request = own.requests[0];
  expect(request).toMatchObject({ kind: 'consultation', email, customerId: null, details: { mode: 'boutique', topic: 'care', location: 'cotonou', time } });
  expect(request.details.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  await changeLanguage(page, 'Français');
  await expect(receipt.getByRole('heading', { name: 'Votre demande est reçue.', exact: true })).toBeVisible();
  await expect(receipt).toContainText(request.id);
  expect((await page.context().cookies()).find(cookie => cookie.name === 'mg_guest')).toMatchObject({ httpOnly: true, sameSite: 'Lax' });
  const stranger = await browser.newContext();
  try {
    const snapshot = await (await stranger.request.get(`${origin}/api/shop`)).json();
    expect(snapshot.bookings).toEqual([]);
    expect(snapshot.requests).toEqual([]);
    expect(JSON.stringify(snapshot)).not.toContain(email);
    expect(snapshot.bookedSlots).toContainEqual({ date: request.details.date, time, location: request.details.location });
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
  await expect(page).toHaveURL(/\/new-arrivals\/men$/);
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
