import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import type { StoreSnapshot } from '../../lib/types';
import { WISHLIST_PENDING_KEY } from '../../lib/wishlist-sync';
import { registerCustomer, seedPrivacy } from './navigation';

async function currentSnapshot(page: Page): Promise<StoreSnapshot> {
  const response = await page.request.get('/api/shop');
  expect(response.ok()).toBe(true);
  return response.json();
}

test('signed-in wishlist additions and removals survive reloads without a server acknowledgement', async ({ page, context }) => {
  test.setTimeout(120_000);
  await seedPrivacy(page);
  await page.goto('/login?next=%2Fapp');
  const email = `wishlist-recovery-${crypto.randomUUID()}@example.test`;
  await registerCustomer(page, { email, firstName: 'Wishlist', lastName: 'Recovery' });
  await expect(page.locator('.exact-personal-heading')).toContainText('Welcome Wishlist');
  const initial = await currentSnapshot(page);
  expect(initial.user?.email).toBe(email);
  expect(initial.profile?.wishlist).toEqual([]);
  const owner = initial.user!.id;

  let blocked = true;
  let blockedRequests = 0;
  await context.route('**/api/shop', async route => {
    const request = route.request();
    if (blocked && request.method() === 'POST' && request.postDataJSON()?.action === 'wishlist') {
      blockedRequests++;
      return route.abort('failed');
    }
    return route.continue();
  });
  const pending = () => page.evaluate(key => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  }, WISHLIST_PENDING_KEY);
  const ready = async () => {
    await expect(page.locator('.site-header:visible')).toHaveAttribute('data-ready', 'true');
  };
  const savedResponse = () => page.waitForResponse(response =>
    new URL(response.url()).pathname === '/api/shop' && response.request().method() === 'POST' &&
    response.request().postDataJSON()?.action === 'wishlist' && response.status() === 200);
  const heart = page.locator('.pdp-purchase .pdp-wishlist-button');

  await page.goto('/product/francesco');
  await ready();
  await expect(heart).toHaveAttribute('aria-pressed', 'false');
  await heart.click();
  await expect(heart).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(pending).toMatchObject({ version: 1, owner, productIds: ['francesco'] });
  await expect.poll(() => blockedRequests).toBeGreaterThan(0);
  expect((await currentSnapshot(page)).profile?.wishlist).toEqual([]);

  // Reload while every wishlist write is still blocked: the real server has
  // never acknowledged the addition, so only the durable owner outbox can restore it.
  await page.reload();
  await ready();
  await expect(heart).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(pending).toMatchObject({ version: 1, owner, productIds: ['francesco'] });
  expect((await currentSnapshot(page)).profile?.wishlist).toEqual([]);

  const addition = savedResponse();
  blocked = false;
  await page.reload();
  expect((await addition).ok()).toBe(true);
  await ready();
  await expect(heart).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(async () => (await currentSnapshot(page)).profile?.wishlist).toEqual(['francesco']);
  await expect.poll(pending).toBeNull();

  blocked = true;
  const blockedBeforeRemoval = blockedRequests;
  await heart.click();
  await expect(heart).toHaveAttribute('aria-pressed', 'false');
  await expect.poll(pending).toMatchObject({ version: 1, owner, productIds: [] });
  await expect.poll(() => blockedRequests).toBeGreaterThan(blockedBeforeRemoval);
  expect((await currentSnapshot(page)).profile?.wishlist).toEqual(['francesco']);

  await page.reload();
  await ready();
  await expect(heart).toHaveAttribute('aria-pressed', 'false');
  await expect.poll(pending).toMatchObject({ version: 1, owner, productIds: [] });
  expect((await currentSnapshot(page)).profile?.wishlist).toEqual(['francesco']);

  const removal = savedResponse();
  blocked = false;
  await page.reload();
  expect((await removal).ok()).toBe(true);
  await ready();
  await expect(heart).toHaveAttribute('aria-pressed', 'false');
  await expect.poll(async () => (await currentSnapshot(page)).profile?.wishlist).toEqual([]);
  await expect.poll(pending).toBeNull();
});
