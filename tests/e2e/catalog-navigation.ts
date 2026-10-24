import { expect } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

/** Exercise the visible inventory drawer rather than changing the selected size in state. */
export async function selectProductSize(page: Page, productId: string, size: string) {
  await page.locator(`#pdp-size-${productId}`).click();
  const drawer = page.locator('.reference-sizes-dialog');
  await expect(drawer).toBeVisible();
  await drawer.getByRole('button', { name: new RegExp(`^${size}$`) }).click();
  await expect(drawer).toHaveCount(0);
  await expect(page.locator(`#pdp-size-${productId}`)).toContainText(size);
}

export async function openSizeChart(page: Page, productId: string) {
  await page.locator(`#pdp-size-${productId}`).click();
  await page.locator('.reference-sizes-dialog').getByRole('button', { name: /^(Size guide|Guide des pointures)$/ }).click();
  const chart = page.locator('.reference-chart-dialog');
  await expect(chart.getByRole('table')).toBeVisible();
  return chart;
}

/** Reference controls are custom, keyboard-operable listboxes, not native selects. */
export async function chooseListboxOption(scope: Page | Locator, label: string, option: string) {
  await scope.getByRole('combobox', { name: label, exact: true }).click();
  await scope.getByRole('option', { name: option, exact: true }).click();
}

export async function openWishlist(page: Page) {
  const headerLink = page.locator('.reference-wishlist-trigger');
  if (await headerLink.isVisible()) await headerLink.click();
  else {
    // The reference phone header places Wishlist in the navigation utilities.
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await expect(page.locator('.site-header')).not.toHaveClass(/exact-header--hidden/);
    await page.locator('.mobile-menu-trigger').click();
    await page.locator('.exact-mobile-menu').getByRole('link', { name: 'Wishlist', exact: true }).click();
  }
  await expect(page).toHaveURL(/\/wishlist$/);
}
