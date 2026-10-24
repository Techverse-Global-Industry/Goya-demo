import { expect } from '@playwright/test';
import type { BrowserContext, Page } from '@playwright/test';

export async function seedPrivacy(target: Page | BrowserContext) {
  await target.addInitScript(() => { window.localStorage.setItem('goya-privacy-v1', 'essential'); window.sessionStorage.setItem('goya-country-prompt-v1', 'shown'); window.sessionStorage.setItem('goya-newsletter-prompt-v1', 'shown'); });
}

export async function openShoppingBag(page: Page) {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  const header = page.locator('.site-header:visible');
  await expect(header).toHaveAttribute('data-ready', 'true');
  const trigger = header.locator('[data-cart-trigger]');
  await expect(trigger).toBeInViewport();
  await trigger.click();
}

export async function registerCustomer(page: Page, options: { email: string; firstName?: string; lastName?: string; password?: string }) {
  const auth = page.locator('.reference-account-form .reference-auth');
  await auth.locator('.reference-auth-tabs').getByRole('button', { name: 'Create an account', exact: true }).click();
  const form = auth.locator('form');
  await form.getByRole('combobox', { name: 'Title *', exact: true }).selectOption('mr');
  await form.getByLabel('First name *', { exact: true }).fill(options.firstName ?? 'Demo');
  await form.getByLabel('Last name *', { exact: true }).fill(options.lastName ?? 'Shopper');
  await form.getByLabel('Email *', { exact: true }).fill(options.email);
  await form.getByLabel('Password *', { exact: true }).fill(options.password ?? 'DemoBrowser2026!');
  await form.getByRole('button', { name: 'Create an account', exact: true }).click();
}

export async function changeLanguage(page: Page, language: 'English' | 'Italiano' | 'Français' | 'Deutsch' | 'Español' | '日本語' | 'العربية') {
  const locales = { English: 'en', Italiano: 'it', Français: 'fr', Deutsch: 'de', Español: 'es', 日本語: 'ja', العربية: 'ar' };
  const locale = locales[language];
  const scrollPosition=await page.evaluate(()=>window.scrollY);
  const header = page.locator('.site-header[data-ready]:visible');
  if (await header.count()) await expect(header).toHaveAttribute('data-ready', 'true');
  if (await page.locator('html').getAttribute('lang') === locale) return;
  const options = page.locator('.exact-language-options');
  if (!await options.isVisible()) {
    const dialogControl = page.getByRole('dialog').locator('.language-switch > button:visible').first();
    const footerControl = page.locator('.exact-footer-country > button:visible').first();
    const inlineControl = page.locator('.language-switch > button:visible').first();
    if (await dialogControl.count()) await dialogControl.click();
    else if (await footerControl.count()) await footerControl.click();
    else if (await inlineControl.count()) await inlineControl.click();
    else {
      const current = new URL(page.url());
      await page.goto('/');
      await expect(page.locator('.site-header:visible')).toHaveAttribute('data-ready','true');
      await page.locator('.exact-footer-country > button').click();
      await options.getByRole('button', { name: language, exact: true }).click();
      await expect(options).toBeHidden();
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
      await page.goto(current.pathname + current.search);
      await page.evaluate(y=>window.scrollTo({top:y,behavior:'instant'}),scrollPosition);
      return;
    }
  }
  await expect(options).toBeVisible();
  await options.getByRole('button', { name: language, exact: true }).click();
  await expect(options).toBeHidden();
  await expect(page.locator('html')).toHaveAttribute('lang', locale);
  await expect(page.locator('html')).toHaveAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr');
  await page.evaluate(y=>window.scrollTo({top:y,behavior:'instant'}),scrollPosition);
}
