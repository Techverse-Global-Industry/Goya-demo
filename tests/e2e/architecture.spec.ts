import { test, expect } from '@playwright/test';

test('brand website is informational and every customer route requires login', async ({ page, isMobile }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('A world ofcharacter.');
  await expect(page.locator('.brand-category-grid article')).toHaveCount(3);
  await expect(page.locator('.product-card')).toHaveCount(0);
  await expect(page.locator('[data-cart-trigger]')).toHaveCount(0);
  await expect(page.locator('.site-header').getByRole('button', { name: 'Search', exact: true })).toHaveCount(0);
  const guest = await (await page.request.get('/api/shop')).json();
  expect(guest.products).toEqual([]);
  await page.locator('.collection-editorial a').first().click();
  await expect(page).toHaveURL(/\/login\?next=%2Fapp%2Fshop$/);
  await expect(page.locator('.account-entry')).toBeVisible();
  await page.screenshot({ path: `test-results/new-login-${isMobile ? 'mobile' : 'desktop'}.png`, fullPage: true });
  for (const section of ['orders', 'atelier', 'updates', 'settings']) {
    await page.goto(`/app/${section}`);
    await expect(page).toHaveURL(new RegExp(`/login\\?next=%2Fapp%2F${section}$`));
  }
  await page.goto('/login?next=https://example.com');
  await expect(page.locator('.account-entry')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('customer shop, search, empty bag, navigation and sign-out stay in their workspace', async ({ page, isMobile }) => {
  await page.goto('/app/shop');
  await page.getByRole('group', { name: 'Your Maison', exact: true }).getByRole('button', { name: 'Create an account' }).click();
  await page.getByLabel('Full name', { exact: true }).fill('Workspace Demo');
  await page.getByLabel('Email address', { exact: true }).fill(`workspace-${crypto.randomUUID()}@example.test`);
  await page.getByLabel('Password', { exact: true }).fill('WorkspaceDemo2026!');
  await page.locator('form').getByRole('button', { name: 'Create an account', exact: true }).click();
  await expect(page).toHaveURL(/\/app\/shop$/);
  await expect(page.locator('.product-card').first()).toBeVisible();
  await page.locator('.workspace-search input').fill('mocassin');
  await expect(page.locator('.product-card').first()).toBeVisible();
  expect(await page.locator('.product-card').count()).toBeGreaterThan(0);
  await page.locator('.workspace-search input').fill('');
  await page.locator('[data-cart-trigger]').click();
  await page.getByRole('dialog').getByRole('button', { name: 'Explore the collection', exact: true }).click();
  await expect(page).toHaveURL(/\/app\/shop$/);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.screenshot({ path: `test-results/new-shop-${isMobile ? 'mobile' : 'desktop'}.png`, fullPage: false });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator('.account-sidebar nav').getByRole('button', { name: 'My orders', exact: true }).click();
  await expect(page).toHaveURL(/\/app\/orders$/);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'My orders', exact: true })).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/\/app\/shop$/);
  const manifest = await (await page.request.get('/manifest.webmanifest')).json();
  expect(manifest.start_url).toBe('/app/shop');
  await page.locator('.account-sidebar-end').getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(page).toHaveURL(/\/login/);
  await page.goto('/app/shop');
  await expect(page).toHaveURL(/\/login/);
  expect((await (await page.request.get('/api/shop')).json()).products).toEqual([]);
});
