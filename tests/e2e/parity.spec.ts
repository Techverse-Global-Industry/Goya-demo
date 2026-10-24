import { expect, test } from '@playwright/test';
import type { BrowserContext, Page } from '@playwright/test';
import type { Product } from '../../lib/types';
import type { ServiceRequest } from '../../lib/experience-types';
import { changeLanguage, registerCustomer, seedPrivacy } from './navigation';
import { chooseListboxOption, openSizeChart } from './catalog-navigation';

const origin = 'http://127.0.0.1:3100';
const headers = { origin };

async function signInAdmin(context: BrowserContext) {
  await seedPrivacy(context);
  const result = await context.request.post(`${origin}/api/shop`, { headers, data: { action: 'login', email: 'admin@goya.demo', password: 'MaisonDemo2026!' } });
  expect(result.ok()).toBe(true);
}

async function visibleProductIds(page: Page) {
  await expect(page.locator('.reference-plp-toolbar')).toBeVisible();
  await expect(page.locator('.reference-plp-grid .product-card').first()).toBeVisible();
  return page.locator('.reference-plp-grid .product-card').evaluateAll(cards => cards.map(card => card.getAttribute('data-product-id')));
}

test.beforeEach(async ({ page }) => { await seedPrivacy(page); });

test('homepage keeps the four reference destinations, a real product carousel and thirteen bilingual stories', async ({ page, isMobile }) => {
  await page.goto('/');
  await expect(page.locator('header[data-ready="true"]')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const collections = page.locator('.brand-category-grid a');
  await expect(collections).toHaveCount(4);
  expect(await collections.evaluateAll(links => links.map(link => link.getAttribute('href')))).toEqual(['/new-arrivals/men', '/accessories?audience=men', '/new-arrivals/women', '/accessories?audience=women']);
  const snapshot = await (await page.request.get('/api/shop')).json();
  const featured = page.locator('.reference-featured-product');
  await expect(featured.first()).toBeVisible();
  for (const href of await featured.locator('a').evaluateAll(links => links.map(link => link.getAttribute('href')))) {
    expect(snapshot.products.some((product: Product) => href === `/product/${product.id}` && product.published !== false)).toBe(true);
  }
  const productTrack = page.locator('#goya-featured-track');
  await productTrack.scrollIntoViewIfNeeded();
  const cardsPerView = await productTrack.evaluate(track => track.clientWidth / (track.firstElementChild as HTMLElement).offsetWidth);
  expect(cardsPerView).toBeGreaterThan(isMobile ? 1.8 : 3.8);
  expect(cardsPerView).toBeLessThan(isMobile ? 2.5 : 4.7);
  const stories = page.locator('.reference-journal-story');
  await expect(stories).toHaveCount(13);
  const storyDestinations = await stories.locator('a').evaluateAll(links => links.map(link => link.getAttribute('href')));
  expect(new Set(storyDestinations).size).toBe(13);
  for (const destination of storyDestinations) expect(destination).toMatch(/^\/culture\/[^/]+$/);
  await expect(page.locator('#goya-journal-title')).toHaveText('Goya anthology');
  const storyTrack = page.locator('#goya-journal-rail');
  await storyTrack.scrollIntoViewIfNeeded();
  await storyTrack.focus();
  await page.keyboard.press('End');
  await expect(page.locator('.reference-journal-controls').getByRole('button', { name: 'Next story', exact: true })).toBeDisabled();
  await page.keyboard.press('Home');
  await expect(page.locator('.reference-journal-controls').getByRole('button', { name: 'Previous story', exact: true })).toBeDisabled();
  await changeLanguage(page, 'Français');
  await expect(page.locator('#goya-journal-title')).toHaveText('Anthologie Goya');
  await expect(collections.first()).toContainText('Homme · Nouveautés');
  await page.goto('/culture/une-rencontre-creative');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Goya × Funkè');
  await expect(page.locator('.exact-encounter-page')).toContainText('2020');
  await expect(page.getByRole('link', { name: 'Le projet de 2020 — MC&CO', exact: true })).toHaveAttribute('href', 'https://www.mcandco.agency/fr/work/funke/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('curated collections, accessory audiences and construction filters show the corresponding creations', async ({ page }) => {
  await page.goto('/new-arrivals/men');
  const newMen = await visibleProductIds(page);
  expect(newMen).toContain('mosaic-tassel-blue');
  expect(newMen).not.toContain('mosaic-tassel-red');
  await page.goto('/gifts/men');
  const gifts = await visibleProductIds(page);
  expect(gifts).toContain('mosaic-tassel-red');
  expect(gifts).not.toContain('mosaic-tassel-blue');
  await page.goto('/accessories?audience=men');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText("Men's Accessories");
  expect(await visibleProductIds(page)).toContain('mosaic-belt');
  expect(await visibleProductIds(page)).not.toContain('archive-crossbody');
  await page.goto('/accessories/bags-backpacks?audience=women');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText("Women's Bags & backpacks");
  const bags = await visibleProductIds(page);
  expect(bags).toContain('archive-crossbody');
  expect(bags).not.toContain('mosaic-belt');
  await page.reload();
  expect(await visibleProductIds(page)).toEqual(bags);
  await page.goto('/men/lace-ups');
  expect(await visibleProductIds(page)).toContain('cobalt-lace-up');
  await page.getByRole('button', { name: 'Filters', exact: true }).click();
  const drawer = page.getByRole('dialog');
  await drawer.locator('summary').filter({ hasText: 'Construction' }).click();
  await drawer.getByLabel('Not specified', { exact: true }).check();
  await drawer.getByRole('button', { name: /^Show \d+ results?$/ }).click();
  await expect(page.locator('.reference-toolbar-reset')).toBeVisible();
  expect(await visibleProductIds(page)).toContain('cobalt-lace-up');
  await page.goto('/women/sandals');
  expect(await visibleProductIds(page)).toContain('mosaic-sandal');
  await page.goto('/accessories/hats?audience=women');
  await expect(page.locator('.reference-plp-empty')).toBeVisible();
  await expect(page.locator('.reference-accessory-rail a').first()).toHaveAttribute('href', '/accessories?audience=women');
});

test('conversion guide and fit answers select a real size, then colour navigation keeps it on a separate SKU', async ({ page }) => {
  await page.goto('/product/mosaic-tassel-red');
  await expect(page.locator('[data-product-detail="mosaic-tassel-red"]')).toBeVisible();
  const guide = await openSizeChart(page, 'mosaic-tassel-red');
  for (const name of ['Goya size', 'EU', 'UK', 'USA', 'CM']) await expect(guide.getByRole('columnheader', { name, exact: true })).toBeVisible();
  await expect(guide).toContainText('Goya has not verified these conversions');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Find your size', exact: true }).click();
  const fit = page.locator('.fit-finder');
  await chooseListboxOption(fit, 'Your usual size system', 'EU');
  await chooseListboxOption(fit, 'Your usual size', '42');
  await fit.getByRole('button', { name: 'Continue', exact: true }).click();
  await fit.getByRole('radio', { name: /^Average/ }).click();
  await fit.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(fit.locator('.fit-result-size')).toHaveText('EU 42');
  await fit.getByRole('button', { name: 'Select this size', exact: true }).click();
  await expect(page.locator('#pdp-size-mosaic-tassel-red')).toContainText('42');
  await page.locator('.pdp-color-options').getByRole('link', { name: 'black & multicolor', exact: true }).click();
  await expect(page).toHaveURL(/\/product\/mosaic-tassel-black$/);
  await expect(page.locator('#pdp-size-mosaic-tassel-black')).toContainText('42');
  await expect(page.locator('.pdp-color-swatch[aria-current="true"]')).toHaveAttribute('href', '/product/mosaic-tassel-black');
  await changeLanguage(page, 'Français');
  await expect(page.locator('#pdp-size-mosaic-tassel-black')).toContainText('42');
  await page.reload();
  await expect(page.locator('#pdp-size-mosaic-tassel-black')).toContainText('42');
  await expect(page.locator('.pdp-main-information h1')).toContainText('Noir');
});

test('account credentials require the current password and recovery works only in the verified browser', async ({ page, browser }) => {
  test.setTimeout(120000);
  const unique = crypto.randomUUID();
  const originalEmail = `security-${unique}@example.test`;
  const updatedEmail = `updated-${unique}@example.test`;
  const password = 'SecurityDemo2026!';
  const newPassword = 'RecoveredDemo2026!';
  await page.goto('/login?next=%2Fapp%2Fsettings');
  await registerCustomer(page, { email: originalEmail, password, firstName: 'Security', lastName: 'Demo' });
  await expect(page).toHaveURL(/\/app\/settings$/);
  await page.locator('.reference-profile-security > summary').click();
  const security = page.locator('.account-security');
  await security.getByLabel('New email address', { exact: true }).fill(updatedEmail);
  await security.getByLabel('Current password', { exact: true }).fill('IncorrectDemo2026!');
  await security.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(security.getByRole('alert')).toHaveText('Your current password is incorrect.');
  await security.getByLabel('Current password', { exact: true }).fill(password);
  await security.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(security.getByRole('status')).toHaveText('Your login details have been updated.');
  expect((await (await page.request.get('/api/shop')).json()).user.email).toBe(updatedEmail);
  await page.locator('.exact-personal-sidebar').getByRole('button', { name: 'Logout', exact: true }).click();
  await page.locator('.reference-auth-forgot').click();
  const recovery = page.locator('.demo-recovery-flow');
  await recovery.getByLabel('Email address', { exact: true }).fill(updatedEmail);
  await recovery.getByRole('button', { name: 'Proceed', exact: true }).click();
  await expect(recovery.getByRole('button', { name: 'Open password reset link', exact: true })).toBeVisible();
  const stranger = await browser.newContext({ baseURL: origin, reducedMotion: 'reduce' });
  try {
    await seedPrivacy(stranger);
    const strangerPage = await stranger.newPage();
    await strangerPage.goto('/login');
    await strangerPage.locator('.reference-auth-forgot').click();
    const strangerRecovery = strangerPage.locator('.demo-recovery-flow');
    await strangerRecovery.getByLabel('Email address', { exact: true }).fill(updatedEmail);
    await strangerRecovery.getByRole('button', { name: 'Proceed', exact: true }).click();
    await expect(strangerRecovery.locator('.demo-recovery-inbox')).toBeVisible();
    await expect(strangerRecovery.getByRole('button', { name: 'Open password reset link', exact: true })).toHaveCount(0);
  } finally { await stranger.close(); }
  await recovery.getByRole('button', { name: 'Open password reset link', exact: true }).click();
  await recovery.getByLabel('New password', { exact: true }).fill(newPassword);
  await recovery.getByLabel('Confirm new password', { exact: true }).fill(newPassword);
  await recovery.getByRole('button', { name: 'Reset password', exact: true }).click();
  await expect(recovery.getByRole('heading', { name: 'Your password has been updated.', exact: true })).toBeVisible();
  const oldLogin = await page.request.post('/api/shop', { headers, data: { action: 'login', email: updatedEmail, password } });
  expect(oldLogin.status()).toBe(401);
  await recovery.getByRole('link', { name: 'Back to login', exact: true }).click();
  const login = page.locator('.reference-account-form .reference-auth form');
  await login.getByLabel('Email *', { exact: true }).fill(updatedEmail);
  await login.getByLabel('Password *', { exact: true }).fill(newPassword);
  await login.getByRole('button', { name: 'Login', exact: true }).click();
  await expect(page.locator('.exact-personal-heading')).toContainText('Welcome Security');
});

test('availability and caring requests persist, receive an owner response and remain private to their guest', async ({ page, browser }) => {
  test.setTimeout(120000);
  const email = `care-${crypto.randomUUID()}@example.test`;
  await page.goto('/product/mosaic-tassel-red');
  await page.locator('#pdp-size-mosaic-tassel-red').click();
  await page.locator('.reference-sizes-dialog').getByRole('button', { name: /^46\s*Notify me$/ }).click();
  const availability = page.locator('.pdp-availability-notice');
  await expect(availability).toContainText('Size: 46');
  await availability.getByLabel('First Name *', { exact: true }).fill('Care');
  await availability.getByLabel('Last Name *', { exact: true }).fill('Guest');
  await availability.getByLabel('Email *', { exact: true }).fill(email);
  await availability.getByRole('button', { name: 'Notify me', exact: true }).click();
  await expect(availability.getByRole('heading', { name: 'Your demo request is saved.', exact: true })).toBeVisible();
  const firstSnapshot = await (await page.request.get('/api/shop')).json();
  const alert = firstSnapshot.requests.find((request: ServiceRequest) => request.kind === 'availability');
  expect(alert.email).toBe(email);
  expect(alert.productId).toBe('mosaic-tassel-red');
  expect(alert.details.size).toBe('46');
  await availability.getByRole('link', { name: 'Follow my request', exact: true }).click();
  await expect(page).toHaveURL(/\/my-requests$/);
  await expect(page.locator('.customer-request-history')).toContainText(alert.id);
  await page.goto('/personalization/caring');
  await page.locator('.experience-service-hero a[href^="/book-an-appointment"]').click();
  await page.locator('.consultation-landing a[href*="mode=online"]').click();
  await page.getByRole('button', { name: 'Prepare a personal brief', exact: true }).click();
  await page.locator('.experience-care-form textarea').fill('Please assess the worn heels and renew the shine of this demo pair.');
  await page.locator('.experience-care-form').getByRole('button', { name: 'Continue', exact: true }).click();
  const contact = page.locator('.experience-contact-form');
  await contact.locator('input[name="name"]').fill('Care Demo');
  await contact.locator('input[name="email"]').fill(email);
  await contact.getByRole('checkbox').check();
  await contact.getByRole('button', { name: 'Send demo request', exact: true }).click();
  await expect(page.locator('.experience-receipt')).toBeVisible();
  const own = await (await page.request.get('/api/shop')).json();
  expect(own.requests).toHaveLength(2);
  const care = own.requests.find((request: ServiceRequest) => request.kind === 'care');
  expect(care.email).toBe(email);
  expect(JSON.stringify(care.details)).toContain('worn heels');
  const admin = await browser.newContext({ baseURL: origin, viewport: page.viewportSize() ?? undefined, reducedMotion: 'reduce' });
  try {
    await signInAdmin(admin);
    const adminPage = await admin.newPage();
    await adminPage.goto('/admin');
    await adminPage.locator('.admin-sidebar nav').getByRole('button', { name: 'Customer service', exact: true }).click();
    await expect(adminPage.locator('.experience-console')).toBeVisible();
    const serviceRecord = adminPage.locator(`.experience-request[data-request-id="${care.id}"]`);
    await serviceRecord.getByRole('button', { name: 'Details', exact: true }).click();
    await expect(serviceRecord.locator('.experience-request-details')).toContainText('worn heels');
    await serviceRecord.getByRole('combobox', { name: 'Request status', exact: true }).selectOption('reviewing');
    await serviceRecord.getByRole('textbox', { name: 'Response note', exact: true }).fill('The demonstration atelier is reviewing your care assessment.');
    await serviceRecord.getByRole('button', { name: 'Save update', exact: true }).click();
    await expect(serviceRecord.locator('header > span')).toHaveText('Under review');
    await page.goto('/my-requests');
    await page.reload();
    const record = page.locator('.customer-request-history article').filter({ hasText: care.id });
    await expect(record).toContainText('Under review');
    await expect(record).toContainText('The demonstration atelier is reviewing your care assessment.');
    await changeLanguage(page, 'Français');
    await expect(record).toContainText('En cours d’examen');
    const forbidden = await page.request.post('/api/shop', { headers, data: { action: 'requestStatus', id: care.id, status: 'completed' } });
    expect(forbidden.status()).toBe(401);
  } finally { await admin.close(); }
  const stranger = await browser.newContext({ baseURL: origin, reducedMotion: 'reduce' });
  try {
    const snapshot = await (await stranger.request.get('/api/shop')).json();
    expect(snapshot.requests).toEqual([]);
    expect(JSON.stringify(snapshot)).not.toContain(email);
  } finally { await stranger.close(); }
});

test('a delivered guest order can be returned once and its simulated refund remains accessible by verified order lookup', async ({ page, browser }) => {
  test.setTimeout(120000);
  await page.goto('/collections');
  const email = `return-${crypto.randomUUID()}@example.test`;
  const products: Product[] = (await (await page.request.get('/api/shop')).json()).products;
  const product = products.find(item => item.id === 'mosaic-tassel-blue')!;
  const size = Object.keys(product.stock).find(value => product.stock[value] > 0)!;
  expect(size).toBeTruthy();
  expect((await page.request.post('/api/shop', { headers, data: { action: 'guestSession' } })).ok()).toBe(true);
  const placed = await page.request.post('/api/shop', { headers, data: { action: 'order', cart: [{ productId: product.id, size, quantity: 1 }], currency: 'EUR', payment: 'paypal', idempotencyKey: crypto.randomUUID(), recipient: { name: 'Return Demo', email, address: '12 Demonstration Road', city: 'Cotonou', country: 'BJ' } } });
  expect(placed.ok()).toBe(true);
  const { order } = await placed.json();
  await page.goto('/returns');
  await expect(page.locator('.return-order')).toContainText('Returns become available after delivery.');
  await expect(page.getByRole('button', { name: 'Request a return', exact: true })).toHaveCount(0);
  const admin = await browser.newContext({ baseURL: origin, viewport: page.viewportSize() ?? undefined, reducedMotion: 'reduce' });
  try {
    await signInAdmin(admin);
    for (const status of ['preparing', 'shipped', 'delivered']) {
      expect((await admin.request.post('/api/shop', { headers, data: { action: 'orderStatus', orderId: order.id, status } })).ok()).toBe(true);
    }
    await page.reload();
    await page.getByRole('button', { name: 'Request a return', exact: true }).click();
    const form = page.locator('.return-form');
    await form.getByRole('checkbox').check();
    await form.getByRole('combobox', { name: 'Reason for return', exact: true }).selectOption('size');
    await form.getByLabel('Additional information (optional)', { exact: true }).fill('Please review the fit for this demonstration return.');
    await form.getByRole('button', { name: 'Submit return request', exact: true }).click();
    const history = page.locator('.return-record');
    await expect(history).toHaveCount(1);
    await expect(page.locator('.return-order')).toContainText('All available quantities are already included in a return.');
    const snapshot = await (await page.request.get('/api/shop')).json();
    const request = snapshot.returns[0];
    expect(request.orderId).toBe(order.id);
    expect(request.refundAmount).toBe(order.lines[0].unitPrice);
    expect(request.lines).toEqual([{ productId: product.id, size, quantity: 1, reason: 'size' }]);
    const adminPage = await admin.newPage();
    await adminPage.goto('/admin');
    await adminPage.locator('.admin-sidebar nav').getByRole('button', { name: 'Customer service', exact: true }).click();
    const console = adminPage.locator('.experience-console');
    await expect(console).toBeVisible();
    await console.getByRole('button', { name: /^Returns & refunds/ }).click();
    const returnRecord = console.locator(`.experience-return[data-return-id="${request.id}"]`);
    for (const [value, label] of [['approved', 'Approved'], ['received', 'Received'], ['refunded', 'Refunded']]) {
      await returnRecord.getByRole('combobox', { name: 'Return status', exact: true }).selectOption(value);
      await returnRecord.getByRole('textbox', { name: 'Response note', exact: true }).fill('Demo return reviewed by the Maison.');
      await returnRecord.getByRole('button', { name: 'Save update', exact: true }).click();
      await expect(returnRecord.locator('header > span')).toHaveText(label);
    }
    await page.reload();
    await expect(history.locator('header strong')).toHaveText('Refunded');
    await expect(history.locator('.return-progress .is-complete')).toHaveCount(4);
    const download = page.waitForEvent('download');
    await history.getByRole('button', { name: 'Download demo return instructions', exact: true }).click();
    expect((await download).suggestedFilename()).toContain(request.id.toLowerCase());
    const stranger = await browser.newContext({ baseURL: origin, reducedMotion: 'reduce' });
    try {
      await seedPrivacy(stranger);
      expect((await (await stranger.request.get('/api/shop')).json()).returns).toEqual([]);
      const lookupPage = await stranger.newPage();
      await lookupPage.goto('/track-order');
      const lookup = lookupPage.locator('.after-sales-lookup');
      await lookup.getByLabel('Order or tracking number', { exact: true }).fill(order.id);
      await lookup.getByLabel('Email address', { exact: true }).fill('wrong@example.test');
      await lookup.getByRole('button', { name: 'Find my order', exact: true }).click();
      await expect(lookup.getByRole('alert')).toContainText('No matching order was found.');
      await lookup.getByLabel('Email address', { exact: true }).fill(email);
      await lookup.getByRole('button', { name: 'Find my order', exact: true }).click();
      await expect(lookupPage.locator('.reference-tracked-order')).toContainText(order.id);
      const found = await (await stranger.request.get('/api/shop')).json();
      expect(found.orders.map((item: { id: string }) => item.id)).toEqual([order.id]);
      expect(found.returns.map((item: { id: string }) => item.id)).toEqual([request.id]);
    } finally { await stranger.close(); }
  } finally { await admin.close(); }
});
