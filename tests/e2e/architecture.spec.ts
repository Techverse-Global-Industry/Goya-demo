import { test, expect } from '@playwright/test';
import { registerCustomer, seedPrivacy } from './navigation';

test.beforeEach(async ({ page }) => { await seedPrivacy(page); });

test('guests can explore public shopping while personal account and admin data stay protected', async ({ page }) => {
  test.setTimeout(120000);
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Made to move you');
  await expect(page.locator('.brand-category-grid article')).toHaveCount(4);
  await expect(page.locator('[data-cart-trigger]')).toBeVisible();
  const guest = await (await page.request.get('/api/shop')).json();
  expect(guest.products.length).toBeGreaterThan(0);
  expect(guest.products.every((product: { published?: boolean }) => product.published !== false)).toBe(true);
  expect(guest.orders).toEqual([]);
  expect(guest.bookings).toEqual([]);
  expect(guest.notifications).toEqual([]);
  expect(guest.profile).toBeNull();
  expect(guest).not.toHaveProperty('users');
  expect(guest).not.toHaveProperty('sessions');
  await page.locator('.brand-category-grid a').first().click();
  await expect(page).toHaveURL(/\/new-arrivals\/men$/);
  await expect(page.locator('.product-card').first()).toBeVisible();
  for (const route of ['collections', 'men', 'women', 'accessories', 'new-arrivals', 'gifts']) {
    await page.goto(`/${route}`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('.product-card').first()).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`/${route}$`));
  }
  for (const route of ['maison', 'shoe-care', 'customer-service', 'stores', 'personalization', 'faq', 'shipping-returns', 'wishlist', 'bag', 'checkout', 'track-order']) {
    await page.goto(`/${route}`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`/${route}$`));
  }
  for (const section of ['shop', 'orders', 'atelier', 'updates', 'settings']) {
    await page.goto(`/app/${section}`);
    await expect(page).toHaveURL(new RegExp(`/login\\?next=%2Fapp%2F${section}$`));
    await expect(page.locator('.reference-account-entry')).toBeVisible();
  }
  expect((await page.request.get('/api/shop?admin=1')).status()).toBe(401);
  const forbidden = await page.request.post('/api/shop', { headers: { origin: 'http://127.0.0.1:3100' }, data: { action: 'saveProfile', profile: { phone: '+2290100000000' } } });
  expect(forbidden.status()).toBe(401);
  await page.goto('/login?next=https://example.com');
  await expect(page.locator('.reference-account-entry')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('an account keeps private workspace routes while the brand logo and shopping remain public', async ({ page, isMobile }) => {
  await page.goto('/app/shop');
  await registerCustomer(page, { email: `workspace-${crypto.randomUUID()}@example.test`, firstName: 'Workspace', lastName: 'Demo', password: 'WorkspaceDemo2026!' });
  await expect(page).toHaveURL(/\/app\/shop$/);
  await expect(page.locator('.product-card').first()).toBeVisible();
  await page.locator('[data-cart-trigger]').click();
  await expect(page.locator('.exact-minicart-empty')).toHaveText('Your bag is empty');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-cart-trigger]')).toBeFocused();
  await page.goto('/bag');
  await page.locator('.exact-bag-empty').getByRole('link', { name: 'Continue exploring', exact: true }).click();
  await expect(page).toHaveURL(/\/collections$/);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.locator('.site-header .wordmark').click();
  await expect(page).toHaveURL('/');
  await page.locator('.site-header .profile-button').click();
  await expect(page).toHaveURL(/\/app$/);
  await page.locator('.account-sidebar nav').getByRole('button', { name: 'My orders', exact: true }).click();
  await expect(page).toHaveURL(/\/app\/orders$/);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'My orders', exact: true })).toBeVisible();
  const manifest = await (await page.request.get('/manifest.webmanifest')).json();
  expect(manifest.start_url).toBe('/collections');
  expect(manifest.display).toBe('standalone');
  await page.screenshot({ path: `test-results/account-routes-${isMobile ? 'mobile' : 'desktop'}.png`, fullPage: false });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator('.account-sidebar-end').getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(page).toHaveURL(/\/login/);
  await page.goto('/app/orders');
  await expect(page).toHaveURL(/\/login/);
  await page.goto('/collections');
  await expect(page.locator('.product-card').first()).toBeVisible();
  const guest = await (await page.request.get('/api/shop')).json();
  expect(guest.products.length).toBeGreaterThan(0);
  expect(guest.orders).toEqual([]);
});
