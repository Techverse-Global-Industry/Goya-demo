import { expect, test } from '@playwright/test';
import type { Order, OrderStatus, StoreSnapshot } from '../../lib/types';
import { seedPrivacy } from './navigation';

test('a completed admin update preserves the next status selected during refresh', async ({ page }) => {
  await seedPrivacy(page);
  const snapshot: StoreSnapshot = await (await page.request.get('/api/shop')).json();
  snapshot.user = { id: 'ADMIN-STATUS-FIXTURE', name: 'Demo Administrator', email: 'admin@example.test', provider: 'email', role: 'admin' };
  const order: Order = { id: 'DEMO-STATUS-RACE', tracking: null, createdAt: '2026-04-15T12:00:00Z', customerId: null, currency: 'USD', lines: [], subtotal: 100, shipping: 0, total: 100, payment: 'card', recipient: { name: 'Demo Customer', email: 'customer@example.test', address: '12 Demo Avenue', city: 'Cotonou', country: 'BJ' }, status: 'preparing' };
  let refreshing = false;
  let releaseRefresh = () => {};
  const refreshGate = new Promise<void>(resolve => { releaseRefresh = resolve; });
  await page.route('**/api/shop**', async route => {
    const request = route.request();
    if (request.method() === 'GET') {
      if (refreshing && !new URL(request.url()).searchParams.has('admin')) await refreshGate;
      await route.fulfill({ json: { ...snapshot, orders: [{ ...order }] } });
      return;
    }
    const body = request.postDataJSON();
    if (body.action !== 'orderStatus') return route.continue();
    order.status = body.status as OrderStatus;
    refreshing = true;
    await route.fulfill({ json: { ok: true } });
  });

  try {
    await page.goto('/admin');
    await expect(page.locator('.admin-stats')).toBeVisible();
    await page.locator('.admin-sidebar nav').getByRole('button', { name: /^Orders/ }).click();
    const editor = page.locator('.admin-order').filter({ hasText: order.id });
    await editor.locator('.admin-order-summary').click();
    const status = editor.getByRole('combobox', { name: 'Order status', exact: true });
    await status.selectOption('shipped');
    await editor.getByRole('button', { name: 'Update order', exact: true }).click();
    await expect(editor.locator('.admin-order-summary .status-shipped')).toBeVisible();

    // The refreshed summary is visible before the customer snapshot finishes.
    await status.selectOption('delivered');
    await expect(status).toHaveValue('delivered');
    releaseRefresh();
    await expect(editor.getByRole('button', { name: 'Update order', exact: true })).toBeEnabled();
    await expect(status).toHaveValue('delivered');
    await editor.getByRole('button', { name: 'Update order', exact: true }).click();
    await expect(editor.locator('.admin-order-summary .status-delivered')).toBeVisible();
  } finally { releaseRefresh(); }
});
