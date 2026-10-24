import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import type { ServiceRequest } from '../../lib/experience-types';
import { changeLanguage, seedPrivacy } from './navigation';

async function ownRequests(page: Page): Promise<ServiceRequest[]> {
  const response = await page.request.get('/api/shop');
  expect(response.ok()).toBe(true);
  return (await response.json()).requests;
}

async function saveThroughUI(page: Page, kind: ServiceRequest['kind'], submit: () => Promise<void>): Promise<ServiceRequest> {
  const responsePromise = page.waitForResponse(response => {
    if (!response.url().endsWith('/api/shop') || response.request().method() !== 'POST') return false;
    const payload = response.request().postDataJSON();
    return payload?.action === 'serviceRequest' && payload.request?.kind === kind;
  });
  await submit();
  const response = await responsePromise;
  expect(response.ok()).toBe(true);
  const saved: ServiceRequest = (await response.json()).request;
  const persisted = (await ownRequests(page)).find(request => request.id === saved.id);
  expect(persisted).toMatchObject({ id: saved.id, kind, status: 'received', details: saved.details });
  return saved;
}

async function sendSelection(page: Page, kind: ServiceRequest['kind'], email: string, notes: string, locale: 'en' | 'fr' = 'en') {
  const form = page.locator('.experience-contact-form');
  await expect(form).toBeVisible();
  await form.getByRole('textbox', { name: locale === 'fr' ? 'Nom complet *' : 'Full name *', exact: true }).fill('Service Journey Demo');
  await form.getByRole('textbox', { name: locale === 'fr' ? 'E-mail *' : 'Email *', exact: true }).fill(email);
  await form.getByRole('textbox', { name: locale === 'fr' ? 'Précisez votre idée (facultatif)' : 'Tell us more (optional)', exact: true }).fill(notes);
  await form.getByRole('checkbox').check();
  const saved = await saveThroughUI(page, kind, () => form.getByRole('button', { name: locale === 'fr' ? 'Envoyer la demande de démonstration' : 'Send demo request', exact: true }).click());
  await expect(page.locator('.experience-receipt')).toContainText(saved.id);
  expect(saved.email).toBe(email);
  expect(saved.details.notes).toBe(notes);
  return saved;
}

test.beforeEach(async ({ page }) => { await seedPrivacy(page); });

test('made-to-order, initials and bespoke selections remain distinct in the guest request history', async ({ page }) => {
  test.setTimeout(150000);
  const email = `creations-${crypto.randomUUID()}@example.test`;
  await page.goto('/personalization/made-to-order');
  const controls = page.locator('.experience-design-controls');
  await controls.getByRole('combobox', { name: 'Choose a creation', exact: true }).selectOption('mosaic-tassel-red');
  await controls.getByRole('combobox', { name: 'Usual EU size', exact: true }).selectOption('43');
  await controls.getByRole('button', { name: 'Continue', exact: true }).click();
  await controls.getByRole('group', { name: 'Material', exact: true }).getByRole('button', { name: 'Suede', exact: true }).click();
  await controls.getByRole('group', { name: 'Colour', exact: true }).getByRole('button', { name: 'Midnight blue', exact: true }).click();
  await controls.getByRole('group', { name: 'Sole', exact: true }).getByRole('button', { name: 'Rubber sole', exact: true }).click();
  await controls.getByRole('group', { name: 'Finish', exact: true }).getByRole('button', { name: 'Patina study', exact: true }).click();
  await controls.getByRole('button', { name: 'Review your selection', exact: true }).click();
  const madeToOrder = await sendSelection(page, 'made-to-order', email, 'Compose this demonstration with the selected blue suede and rubber sole.');
  expect(madeToOrder.productId).toBe('mosaic-tassel-red');
  expect(madeToOrder.details).toMatchObject({ Material: 'Suede', Colour: 'Midnight blue', Sole: 'Rubber sole', Finish: 'Patina study', 'Usual EU size': '43' });

  await page.goto('/personalization/on-time');
  await controls.getByRole('combobox', { name: 'Choose a creation', exact: true }).selectOption('mosaic-clutch');
  await controls.getByRole('button', { name: 'Continue', exact: true }).click();
  await controls.getByRole('textbox', { name: 'Your initials', exact: true }).fill('jd');
  await controls.getByRole('group', { name: 'Stamp finish', exact: true }).getByRole('button', { name: 'Silver', exact: true }).click();
  await controls.getByRole('group', { name: 'Tassel colour', exact: true }).getByRole('button', { name: 'Chestnut', exact: true }).click();
  await expect(page.locator('.experience-stamp strong')).toHaveText('JD');
  await expect(page.locator('.experience-stamp')).toHaveClass(/experience-stamp--silver/);
  await controls.getByRole('button', { name: 'Review your selection', exact: true }).click();
  const initials = await sendSelection(page, 'on-time', email, 'Keep these initials and the silver detail for this demonstration.');
  expect(initials.productId).toBe('mosaic-clutch');
  expect(initials.details).toMatchObject({ 'Your initials': 'JD', 'Stamp finish': 'Silver', 'Tassel colour': 'Chestnut' });

  await page.goto('/personalization/bespoke');
  await controls.getByRole('combobox', { name: 'Choose a creation', exact: true }).selectOption('cobalt-lace-up');
  await controls.getByRole('combobox', { name: 'Usual EU size', exact: true }).selectOption('41');
  await controls.getByRole('button', { name: 'Continue', exact: true }).click();
  await controls.getByRole('group', { name: 'Material', exact: true }).getByRole('button', { name: 'Woven accents', exact: true }).click();
  await controls.getByRole('group', { name: 'Colour', exact: true }).getByRole('button', { name: 'Burgundy', exact: true }).click();
  await controls.getByRole('button', { name: 'Review your selection', exact: true }).click();
  const bespoke = await sendSelection(page, 'bespoke', email, 'Discuss this individual silhouette as an illustrative bespoke enquiry.');
  expect(bespoke.productId).toBe('cobalt-lace-up');
  expect(bespoke.details).toMatchObject({ Material: 'Woven accents', Colour: 'Burgundy', 'Usual EU size': '41' });
  expect(bespoke.details.Sole).toBeUndefined();

  await page.locator('.experience-receipt').getByRole('link', { name: 'View my requests', exact: true }).click();
  await expect(page).toHaveURL(/\/my-requests$/);
  for (const request of [madeToOrder, initials, bespoke]) await expect(page.locator('.customer-request-history')).toContainText(request.id);
  await page.reload();
  for (const request of [madeToOrder, initials, bespoke]) await expect(page.locator('.customer-request-history')).toContainText(request.id);
  expect((await ownRequests(page)).map(request => request.kind).sort()).toEqual(['bespoke', 'made-to-order', 'on-time']);
});

test('French online consultation and consented newsletter preferences save to the same private demo history', async ({ page }) => {
  test.setTimeout(120000);
  const email = `consultation-${crypto.randomUUID()}@example.test`;
  await page.goto('/book-an-appointment?mode=online&location=paris');
  await changeLanguage(page, 'Français');
  const form = page.locator('.consultation-form');
  await expect(form.getByRole('button', { name: /^Conseil en ligne/ })).toHaveAttribute('aria-pressed', 'true');
  await form.getByRole('combobox', { name: 'Choisir une Maison', exact: true }).selectOption('paris');
  await form.getByRole('combobox', { name: 'De quoi souhaitez-vous parler ?', exact: true }).selectOption('personalization');
  const dateInput = form.getByLabel('Date souhaitée *', { exact: true });
  const minimum = await dateInput.getAttribute('min');
  expect(minimum).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  const preferred = new Date(`${minimum}T12:00:00Z`);
  preferred.setUTCDate(preferred.getUTCDate() + 2);
  while (preferred.getUTCDay() === 0) preferred.setUTCDate(preferred.getUTCDate() + 1);
  const date = preferred.toISOString().slice(0, 10);
  await dateInput.fill(date);
  await form.getByRole('combobox', { name: 'Heure souhaitée', exact: true }).selectOption('14:00');
  await form.getByRole('button', { name: 'Continuer', exact: true }).click();
  const consultation = await sendSelection(page, 'consultation', email, 'Échanger sur les détails de personnalisation de cette démonstration.', 'fr');
  expect(consultation.locale).toBe('fr');
  expect(consultation.details).toMatchObject({ 'Prendre rendez-vous': 'Conseil en ligne', 'Choisir une Maison': 'Consultation vidéo · Paris', 'Date souhaitée': date, 'Heure souhaitée': '14:00 · Europe/Paris', 'De quoi souhaitez-vous parler ?': 'Personnalisation' });

  const newsletter = page.locator('.reference-footer-newsletter .reference-newsletter');
  await newsletter.getByRole('textbox', { name: 'E-mail *', exact: true }).fill(email);
  await newsletter.getByRole('checkbox', { name: 'Créations femme', exact: true }).uncheck();
  const consent = newsletter.getByRole('checkbox', { name: 'J’accepte d’enregistrer ma préférence de newsletter de démonstration auprès de la Maison.', exact: true });
  await expect(consent).not.toBeChecked();
  await expect(consent).toHaveAttribute('required', '');
  await consent.check();
  const subscription = await saveThroughUI(page, 'newsletter', () => newsletter.getByRole('button', { name: 'S’inscrire à la newsletter', exact: true }).click());
  expect(subscription.email).toBe(email);
  expect(subscription.locale).toBe('fr');
  expect(subscription.details).toMatchObject({ men: 'true', women: 'false', consent: 'accepted' });
  await expect(newsletter.getByRole('status')).toContainText('Votre inscription de démonstration est enregistrée');
  await page.goto('/my-requests');
  for (const request of [consultation, subscription]) await expect(page.locator('.customer-request-history')).toContainText(request.id);
  await page.reload();
  expect((await ownRequests(page)).map(request => request.id).sort()).toEqual([consultation.id, subscription.id].sort());
});
