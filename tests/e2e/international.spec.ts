import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { formatMoney, priceAmount } from '../../lib/commerce';
import { marketName, siteText } from '../../lib/international';
import type { Product, SiteLocale } from '../../lib/types';
import { changeLanguage, registerCustomer, seedPrivacy } from './navigation';

async function preferences(page: Page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem('maison-goya:v1') ?? '{}'));
}

test.beforeEach(async ({ page }) => { await seedPrivacy(page); });

test('all seven languages translate the public interface while preserving the chosen market, bag and Goya mark', async ({ page }) => {
  test.setTimeout(150000);
  await page.addInitScript(() => localStorage.setItem('maison-goya:v1', JSON.stringify({ version: 1, locale: 'en', language: 'en', market: 'WW', currency: 'USD', cart: [{ productId: 'mosaic-tassel-blue', size: '42', quantity: 1 }], wishlist: [] })));
  await page.goto('/faq');
  await expect(page.locator('.site-header:visible')).toHaveAttribute('data-ready', 'true');
  const wordmark = page.locator('.site-header:visible [data-goya-wordmark]').first();
  const originalMark = await wordmark.evaluate(element => ({ contents: element.innerHTML, transform: getComputedStyle(element).transform }));
  const languages: { name: Parameters<typeof changeLanguage>[1]; locale: SiteLocale }[] = [{ name: 'English', locale: 'en' }, { name: 'Italiano', locale: 'it' }, { name: 'Français', locale: 'fr' }, { name: 'Deutsch', locale: 'de' }, { name: 'Español', locale: 'es' }, { name: '日本語', locale: 'ja' }, { name: 'العربية', locale: 'ar' }];
  for (const language of languages) {
    await changeLanguage(page, language.name);
    await expect(page.locator('.site-header:visible a.wordmark')).toHaveAccessibleName('Goya');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(siteText(language.locale, 'Frequently asked questions', 'Questions fréquentes'));
    await expect(page.locator('html')).toHaveAttribute('dir', language.locale === 'ar' ? 'rtl' : 'ltr');
    expect(await wordmark.evaluate(element => ({ contents: element.innerHTML, transform: getComputedStyle(element).transform }))).toEqual(originalMark);
    await expect.poll(async () => (await preferences(page)).language).toBe(language.locale);
    const saved = await preferences(page);
    expect(saved.market).toBe('WW');
    expect(saved.currency).toBe('USD');
    expect(saved.cart).toEqual([{ productId: 'mosaic-tassel-blue', size: '42', quantity: 1 }]);
  }
  await changeLanguage(page, 'English');
  await expect.poll(async () => (await preferences(page)).language).toBe('en');
});

test('country search selects the regional language and quote, then language selection keeps that currency', async ({ page }) => {
  test.setTimeout(120000);
  await page.goto('/countries');
  const search = page.getByRole('combobox', { name: 'Search', exact: true });
  await search.fill('Jap');
  await page.getByRole('option', { name: 'Japan', exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
  await expect.poll(async () => ({ market: (await preferences(page)).market, currency: (await preferences(page)).currency })).toEqual({ market: 'JP', currency: 'JPY' });
  await page.goto('/product/mosaic-tassel-blue');
  const snapshot = await (await page.request.get('/api/shop')).json();
  const product: Product = snapshot.products.find((candidate: Product) => candidate.id === 'mosaic-tassel-blue');
  await expect(page.locator('.pdp-price')).toHaveText(formatMoney(priceAmount(product.prices, 'JPY'), 'JPY', 'ja'));
  await page.reload();
  await expect(page.locator('.site-header:visible')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
  await changeLanguage(page, 'Deutsch');
  expect((await preferences(page)).market).toBe('JP');
  expect((await preferences(page)).currency).toBe('JPY');
  await expect(page.locator('.pdp-price')).toHaveText(formatMoney(priceAmount(product.prices, 'JPY'), 'JPY', 'de'));
  await page.goto('/countries');
  await page.getByRole('combobox', { name: siteText('de', 'Search', 'Rechercher'), exact: true }).fill('Benin');
  await page.getByRole('option', { name: marketName('BJ', 'de'), exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect.poll(async () => ({ market: (await preferences(page)).market, currency: (await preferences(page)).currency })).toEqual({ market: 'BJ', currency: 'XOF' });
});

test('first-visit country confirmation follows consent and stays dismissed for the session', async ({ browser, baseURL, viewport, isMobile, hasTouch, deviceScaleFactor, userAgent }) => {
  const context = await browser.newContext({ baseURL, viewport, isMobile, hasTouch, deviceScaleFactor, userAgent, reducedMotion: 'reduce' });
  try {
    const page = await context.newPage();
    await page.goto('/');
    await expect(page.locator('.site-header:visible')).toHaveAttribute('data-ready', 'true');
    const country = page.getByRole('dialog', { name: 'Change country / region?', exact: true });
    await expect(country).toBeHidden();
    await page.locator('.exact-cookie-dialog').getByRole('button', { name: 'Continue without Accepting', exact: true }).click();
    await expect(country).toBeVisible();
    await expect(country.locator('.exact-country-prompt-market')).toContainText('International website');
    await expect(country.locator('.exact-country-prompt-market')).toContainText('USD');
    await country.getByRole('button', { name: 'Close', exact: true }).click();
    await expect(country).toBeHidden();
    expect(await page.evaluate(() => sessionStorage.getItem('goya-country-prompt-v1'))).toBe('shown');
    await page.reload();
    await expect(page.locator('.site-header:visible')).toHaveAttribute('data-ready', 'true');
    await page.waitForTimeout(1500);
    await expect(country).toBeHidden();
  } finally { await context.close(); }
});

test('International customers explicitly choose an address destination and their personal text survives translation', async ({ page }) => {
  test.setTimeout(120000);
  await page.goto('/login?next=%2Fapp%2Fsettings');
  await registerCustomer(page, { email: `international-address-${crypto.randomUUID()}@example.test`, firstName: 'Private', lastName: 'Demo' });
  await expect(page).toHaveURL(/\/app\/settings$/);
  await page.getByRole('button', { name: 'Add an address', exact: true }).click();
  const editor = page.locator('.account-address-editor');
  const country = editor.getByRole('combobox', { name: 'Country', exact: true });
  await expect(country).toHaveValue('');
  expect(await country.evaluate(element => (element as HTMLSelectElement).validity.valueMissing)).toBe(true);
  await editor.getByRole('textbox', { name: 'Address label (optional)', exact: true }).fill('Default');
  await editor.getByRole('textbox', { name: 'Full name', exact: true }).fill('Today');
  await editor.getByRole('textbox', { name: 'Street address', exact: true }).fill('12 Last name Avenue');
  await editor.getByRole('textbox', { name: 'City', exact: true }).fill('Password');
  await expect(country.getByRole('option', { name: 'Japan', exact: true })).toHaveCount(1);
  await country.selectOption('JP');
  const saved = page.waitForResponse(response => response.url().endsWith('/api/shop') && response.request().method() === 'POST' && response.request().postDataJSON()?.action === 'saveAddress');
  await editor.getByRole('button', { name: 'Save address', exact: true }).click();
  expect((await saved).ok()).toBe(true);
  await expect(editor).toBeHidden();
  await changeLanguage(page, '日本語');
  const address = page.locator('.account-saved-address');
  await expect(address.locator('h3')).toHaveText('Default');
  await expect(address.locator('address strong')).toHaveText('Today');
  await expect(address.locator('address')).toContainText('12 Last name Avenue');
  await expect(address.locator('address')).toContainText('Password');
  await expect(address.locator('address')).toContainText('日本');
  expect((await preferences(page)).market).toBe('WW');
  await page.reload();
  await expect(address.locator('h3')).toHaveText('Default');
  await expect(address.locator('address strong')).toHaveText('Today');
});
