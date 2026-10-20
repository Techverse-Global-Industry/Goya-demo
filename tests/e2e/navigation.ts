import type { Page } from '@playwright/test';

export async function changeLanguage(page: Page, language: 'English' | 'Français') {
  const control = page.locator('.site-header').getByRole('button', { name: language, exact: true });
  if (await control.isVisible()) {
    await control.click();
    return;
  }
  await page.locator('.mobile-menu-trigger').click();
  await page.locator('.mobile-menu-preferences').getByRole('button', { name: language, exact: true }).click();
  await page.locator('[data-close-modal]').click();
}
