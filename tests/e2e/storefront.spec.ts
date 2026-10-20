import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { changeLanguage } from './navigation';

async function addFrancesco(page: Page) {
  await page.locator('[data-product-id="francesco"] .product-add').click();
  const quick = page.getByRole('dialog', { name: 'Quick view' });
  await quick.locator('.size-option').filter({ hasText: /^42$/ }).click();
  await quick.getByRole('button', { name: 'Add to bag', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Shopping bag' })).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  const headers = { origin: 'http://127.0.0.1:3100' };
  await page.request.post('/api/shop', { headers, data: { action: 'login', email: 'admin@goya.demo', password: 'MaisonDemo2026!' } });
  const snapshot = await (await page.request.get('/api/shop?admin=1')).json();
  const product = snapshot.products.find((product: { id: string }) => product.id === 'francesco');
  await page.request.post('/api/shop', { headers, data: { action: 'saveProduct', product: { ...product, stock: { ...product.stock, '42': 5 } }, expectedUpdatedAt: product.updatedAt ?? null } });
  await page.request.post('/api/shop', { headers, data: { action: 'register', name: 'Demo Guest', email: `browser-${crypto.randomUUID()}@example.test`, password: 'DemoBrowser2026!' } });
  await page.goto('/app/shop');
  await expect(page.locator('[data-product-id="francesco"] .product-add')).toBeEnabled();
});

test('English/French updates narrative, products and open dialogs without losing state', async ({ page }) => {
  await changeLanguage(page, 'Français');
  await expect(page.locator('[data-product-id="francesco"] h3')).toHaveText('Le Mocassin Francesco');
  await page.locator('[data-product-id="francesco"] .product-add').click();
  let dialog = page.getByRole('dialog');
  await expect(dialog).toHaveAccessibleName('Aperçu rapide');
  await dialog.locator('.size-option').filter({ hasText: /^42$/ }).click();
  await dialog.getByRole('button', { name: 'English', exact: true }).click();
  await expect(dialog.locator('input[value="42"]')).toBeChecked();
  await dialog.getByRole('button', { name: 'Add to bag', exact: true }).click();
  dialog = page.getByRole('dialog');
  await expect(dialog).toHaveAccessibleName('Shopping bag');
  await expect(dialog.locator('.cart-size')).toContainText('42');
});

test('cart quantities and preferences survive reload', async ({ page }) => {
  await addFrancesco(page);
  await page.getByRole('button', { name: 'Increase quantity', exact: true }).click();
  await expect(page.locator('.quantity-control output')).toHaveText('2');
  await page.getByRole('dialog').getByLabel('Currency', { exact: true }).selectOption('XOF');
  await page.reload();
  await expect(page.locator('[data-cart-trigger]')).toHaveAccessibleName('Shopping bag (2)');
  await page.locator('[data-cart-trigger]').click();
  await expect(page.locator('.quantity-control output')).toHaveText('2');
  await expect(page.getByRole('dialog').getByLabel('Currency', { exact: true })).toHaveValue('XOF');
});

test('cart quantity cannot exceed variant stock', async ({ page }) => {
  await addFrancesco(page);
  const increase = page.getByRole('button', { name: 'Increase quantity', exact: true });
  for (let i = 0; i < 4; i++) await increase.click();
  await expect(page.locator('.quantity-control output')).toHaveText('5');
  await expect(increase).toBeDisabled();
});

test('checkout validates delivery, restricts payments, confirms once, and exports a demo invoice', async ({ page }) => {
  await addFrancesco(page);
  await page.getByRole('button', { name: 'Boutique checkout', exact: true }).click();
  let dialog = page.getByRole('dialog');
  await dialog.getByLabel('Email address', { exact: true }).fill('');
  await dialog.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.locator('#shipping-email')).toHaveAttribute('aria-invalid', 'true');
  await dialog.getByLabel('Full name', { exact: true }).fill('Demo Guest');
  await dialog.getByLabel('Email address', { exact: true }).fill('guest@example.test');
  await dialog.getByLabel('Street address', { exact: true }).fill('12 Demo Avenue');
  await dialog.getByLabel('City', { exact: true }).fill('Cotonou');
  await dialog.getByLabel('Country', { exact: true }).selectOption('FR');
  await dialog.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(dialog.getByRole('radio', { name: /Mobile Money/ })).toBeDisabled();
  await dialog.getByRole('button', { name: 'Back', exact: true }).click();
  await dialog.getByLabel('Country', { exact: true }).selectOption('BJ');
  await dialog.getByRole('button', { name: 'Continue', exact: true }).click();
  await dialog.getByRole('radio', { name: /Mobile Money/ }).check();
  await dialog.getByRole('button', { name: 'Confirm demo order', exact: true }).click();
  await dialog.getByLabel('Demo mobile number', { exact: true }).fill('0100000000');
  await dialog.getByRole('button', { name: 'Send demo payment request', exact: true }).click();
  await dialog.getByRole('button', { name: 'Approve demo payment', exact: true }).click();
  dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading', { name: 'A beautiful choice.' })).toBeVisible();
  await expect(dialog.locator('.confirmation-references')).toContainText('DEMO-MG-');
  await expect(page.locator('[data-cart-trigger]')).toHaveAccessibleName('Shopping bag (0)');
  const download = page.waitForEvent('download');
  await dialog.getByRole('button', { name: 'Download demo invoice', exact: true }).click();
  expect((await download).suggestedFilename()).toMatch(/^maison-goya-demo-mg-.+\.txt$/);
});

test('saved account, focus trapping, Escape and logout', async ({ page }) => {
  const profile = page.locator('.profile-button');
  await page.locator('.account-sidebar nav').getByRole('button', { name: 'My details', exact: true }).click();
  await expect(page).toHaveURL(/\/app\/settings$/);
  await expect(page.locator('.account-identity')).toContainText('Demo Guest');
  await page.locator('[data-cart-trigger]').click();
  for (let i = 0; i < 14; i++) {
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => !!document.activeElement?.closest('dialog[open]'))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('[data-cart-trigger]')).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('');
  await page.locator('.account-sidebar-end').getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(profile).not.toHaveClass(/is-member/);
});

test('live search is accent-insensitive and category filters are functional', async ({ page }) => {
  await page.locator('.site-header').getByRole('button', { name: 'Search', exact: true }).click();
  await page.locator('#maison-search').fill('decontracte');
  await expect(page.locator('.search-results li').first()).toBeVisible();
  const unaccentedResults = await page.locator('.search-results h3').allTextContents();
  await page.locator('#maison-search').fill('DÉCONTRACTÉ');
  await expect(page.locator('.search-results h3')).toHaveText(unaccentedResults);
  await page.keyboard.press('Escape');
  await page.locator('.category-filters').getByRole('button', { name: 'Women', exact: true }).click();
  await expect(page.locator('.product-card')).toHaveCount(4);
  await page.locator('.category-filters').getByRole('button', { name: 'Accessories', exact: true }).click();
  await expect(page.locator('.product-card')).toHaveCount(1);
});

test('atelier validates, books a future slot, and translates its confirmation', async ({ page }) => {
  await page.goto('/app/atelier');
  await page.locator('.appointment-new').click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Full name', { exact: true }).fill('Demo Guest');
  await dialog.getByLabel('Email address', { exact: true }).fill('guest@example.test');
  const min = await page.locator('#atelier-date').getAttribute('min');
  const date = new Date(`${min}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 2);
  if (date.getUTCDay() === 0) date.setUTCDate(date.getUTCDate() + 1);
  await page.locator('#atelier-date').fill(date.toISOString().slice(0, 10));
  const availableTime = await page.locator('#atelier-time option:not([disabled])').nth(1).getAttribute('value');
  await page.locator('#atelier-time').selectOption(availableTime!);
  await dialog.getByRole('button', { name: 'Confirm demo appointment', exact: true }).click();
  await expect(dialog.getByRole('heading', { name: 'A moment, reserved.' })).toBeVisible();
  await dialog.getByRole('button', { name: 'Français', exact: true }).click();
  await expect(dialog.getByRole('heading', { name: 'Un instant, réservé.' })).toBeVisible();
  await expect(dialog.locator('.booking-summary')).toContainText('DEMO-AT-');
});

test('reduced-motion presentation keeps the campaign and collection accessible', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.campaign-hero')).toBeVisible();
  await page.locator('.campaign-copy a').click();
  await expect(page.locator('.brand-category-grid')).toBeInViewport();
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
});

test.describe('desktop campaign animation', () => {
  test.use({ reducedMotion: 'no-preference', viewport: { width: 1440, height: 1000 } });
  test('language changes preserve normal scrolling and the campaign', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Campaign animation is verified on the desktop project.');
    await page.goto('/');
    await expect(page.locator('.campaign-hero')).toBeVisible();
    for (let i = 0; i < 3; i++) {
      await page.locator('.site-header').getByRole('button', { name: 'Français', exact: true }).click();
      await page.locator('.site-header').getByRole('button', { name: 'English', exact: true }).click();
    }
    await expect(page.locator('.pin-spacer')).toHaveCount(0);
    await page.locator('.campaign-copy a').click();
    await expect(page.locator('.brand-category-grid')).toBeInViewport();
  });
});
