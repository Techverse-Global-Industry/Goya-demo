import { expect } from '@playwright/test';
import type { BrowserContext, Page } from '@playwright/test';

export async function seedPrivacy(target: Page | BrowserContext) {
  await target.addInitScript(() => window.localStorage.setItem('goya-privacy-v1', 'essential'));
}

export async function registerCustomer(page: Page, options: { email: string; firstName?: string; lastName?: string; password?: string }) {
  const auth = page.locator('.reference-account-form .reference-auth');
  await auth.locator('.reference-auth-tabs').getByRole('button', { name: 'Create an account', exact: true }).click();
  const form = auth.locator('form');
  await form.getByLabel('First name *', { exact: true }).fill(options.firstName ?? 'Demo');
  await form.getByLabel('Last name *', { exact: true }).fill(options.lastName ?? 'Shopper');
  await form.getByLabel('Email *', { exact: true }).fill(options.email);
  await form.getByLabel('Password *', { exact: true }).fill(options.password ?? 'DemoBrowser2026!');
  await form.getByRole('button', { name: 'Create an account', exact: true }).click();
}

export async function changeLanguage(page: Page, language: 'English' | 'Français') {
  const locale = language === 'English' ? 'en' : 'fr';
  const dialogControl = page.getByRole('dialog').locator('.language-switch').getByRole('button', { name: language, exact: true });
  if (await dialogControl.count()) {
    await dialogControl.click();
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    return;
  }
  const footerControl = page.locator('.fashion-footer-preferences .language-switch').getByRole('button', { name: language, exact: true });
  if (await footerControl.count()) {
    await footerControl.click();
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    return;
  }
  const path = new URL(page.url()).pathname;
  await page.goto('/app/settings');
  await page.locator('.account-preference-controls .language-switch').getByRole('button', { name: language, exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', locale);
  await page.goto(path);
}
