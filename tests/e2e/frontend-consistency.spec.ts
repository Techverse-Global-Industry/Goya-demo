import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';
import type { SiteLocale, StoreSnapshot } from '../../lib/types';
import { changeLanguage, seedPrivacy } from './navigation';

async function preferences(page: Page, language: SiteLocale, market = 'WW', currency = 'USD') {
  await page.addInitScript(({ language, market, currency }) => {
    localStorage.setItem('maison-goya:v1', JSON.stringify({ version: 1, locale: language === 'fr' ? 'fr' : 'en', language, market, currency, cart: [], wishlist: [] }));
    sessionStorage.setItem('goya-account-tooltip', 'seen');
  }, { language, market, currency });
}

async function snapshotFixture(page: Page, change: (snapshot: StoreSnapshot) => void) {
  await page.route('**/api/shop', async route => {
    if (route.request().method() !== 'GET') return route.continue();
    const response = await route.fetch();
    const snapshot: StoreSnapshot = await response.json();
    change(snapshot);
    await route.fulfill({ response, json: snapshot });
  });
}

async function ready(page: Page) {
  await expect(page.locator('.site-header:visible')).toHaveAttribute('data-ready', 'true');
}

async function scrollPosition(rail: Locator) {
  return rail.evaluate(element => Math.abs(element.scrollLeft));
}

test.beforeEach(async ({ page }) => { await seedPrivacy(page); });

test('Arabic search discovery scrolls in both directions after the carousel remounts', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Phone search discovery uses a grid.');
  await preferences(page, 'ar');
  await page.goto('/collections');
  await ready(page);
  await page.locator('.reference-search-trigger').click();
  const rail = page.locator('.reference-search-carousel-track');
  const controls = page.locator('.reference-search-carousel-controls > button');
  await expect(controls.nth(1)).toBeEnabled();
  await controls.nth(1).click();
  await expect.poll(() => scrollPosition(rail)).toBeGreaterThan(8);
  await expect(controls.nth(0)).toBeEnabled();
  await controls.nth(0).click();
  await expect.poll(() => scrollPosition(rail)).toBeLessThan(8);
  await expect(controls.nth(0)).toBeDisabled();

  await page.locator('#maison-search').fill('mosaic');
  await expect(page.locator('.reference-search-products')).toBeVisible();
  await page.locator('#maison-search').fill('no-matching-creation-123456');
  await expect(page.locator('.reference-search-no-results')).toBeVisible();
  await controls.nth(1).click();
  await expect.poll(() => scrollPosition(rail)).toBeGreaterThan(8);
  await expect(controls.nth(0)).toBeEnabled();
});

test('Arabic product gallery keeps its current thumbnail and recovers after a cancelled drag', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Mouse dragging and thumbnails are desktop interactions.');
  await preferences(page, 'ar');
  await snapshotFixture(page, snapshot => {
    const product = snapshot.products.find(product => product.id === 'mosaic-tassel-blue');
    if (!product) throw new Error('The gallery fixture product is missing.');
    product.images = ['/images/archive/goya-01.jpg', '/images/archive/goya-02.jpg', '/images/archive/goya-03.jpg', '/images/archive/goya-04.jpg'];
  });
  await page.goto('/product/mosaic-tassel-blue');
  await ready(page);
  const rail = page.locator('.pdp-gallery-rail');
  const thumbnails = page.locator('.pdp-thumbnails > button');
  await thumbnails.nth(1).click();
  await expect(thumbnails.nth(1)).toHaveAttribute('aria-current', 'true');
  await expect(page.locator('.pdp-photo-counter')).toHaveText('2/4');
  await expect.poll(() => rail.evaluate(element => element.scrollLeft)).toBeLessThan(-8);
  await thumbnails.nth(0).click();
  await expect.poll(() => scrollPosition(rail)).toBeLessThan(8);
  await expect(thumbnails.nth(0)).toHaveAttribute('aria-current', 'true');

  const bounds = await rail.boundingBox();
  if (!bounds) throw new Error('The product gallery is not visible.');
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  await page.mouse.down();
  await page.mouse.move(bounds.x + bounds.width / 2 + 30, bounds.y + bounds.height / 2, { steps: 3 });
  await expect(rail).toHaveClass(/is-dragging/);
  await rail.dispatchEvent('pointercancel', { pointerId: 1, pointerType: 'mouse' });
  await expect(rail).not.toHaveClass(/is-dragging/);
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height + 20);
  await page.mouse.up();
  await rail.locator('.pdp-photo-trigger').first().click({ position: { x: 100, y: 100 } });
  await expect(page.locator('.pdp-zoom-dialog')).toBeVisible();
  await page.keyboard.press('Escape');
});

test('Arabic product recommendations advance and return to the beginning', async ({ page }) => {
  await preferences(page, 'ar');
  await page.goto('/product/mosaic-tassel-blue');
  await ready(page);
  const recommendations = page.locator('.pdp-recommendations');
  await recommendations.scrollIntoViewIfNeeded();
  const rail = recommendations.locator('.pdp-recommendation-rail');
  const controls = recommendations.locator('header button');
  await expect(controls.nth(1)).toBeEnabled();
  await controls.nth(1).click();
  await expect.poll(() => scrollPosition(rail)).toBeGreaterThan(8);
  await expect(controls.nth(0)).toBeEnabled();
  await controls.nth(0).click();
  await expect.poll(() => scrollPosition(rail)).toBeLessThan(8);
  await expect(controls.nth(0)).toBeDisabled();
});

test('contact defaults follow saved preferences and preserve the customer choices during translation', async ({ page }) => {
  await preferences(page, 'fr', 'FR', 'EUR');
  await page.goto('/customer-service');
  await ready(page);
  const form = page.locator('.reference-contact-form');
  const country = form.locator('select[name="country"]');
  const language = form.locator('select[name="language"]');
  await expect(country).toHaveValue('FR');
  await expect(language).toHaveValue('fr');
  await form.locator('input[name="firstName"]').fill('Client Demo');
  await country.selectOption('JP');
  await language.selectOption('ja');
  await changeLanguage(page, 'English');
  await expect(form.locator('input[name="firstName"]')).toHaveValue('Client Demo');
  await expect(country).toHaveValue('JP');
  await expect(language).toHaveValue('ja');
});

test('service request history dates use the selected interface language', async ({ page }) => {
  await preferences(page, 'ja', 'JP', 'JPY');
  const createdAt = '2026-04-15T12:00:00Z';
  await snapshotFixture(page, snapshot => {
    snapshot.requests = [{ id: 'REQ-LOCALE-FIXTURE', kind: 'care', name: 'Demo Client', email: 'demo@example.test', locale: 'en', details: {}, status: 'received', createdAt, updatedAt: createdAt, customerId: null }];
  });
  await page.goto('/my-requests');
  await ready(page);
  const expected = await page.evaluate(date => new Intl.DateTimeFormat('ja', { dateStyle: 'medium' }).format(new Date(date)), createdAt);
  await expect(page.locator('.customer-request-history time')).toHaveText(expected);
});
