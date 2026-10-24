import test from 'node:test';
import assert from 'node:assert/strict';
import { dictionary, translate } from '../lib/i18n';
import { PRODUCTS } from '../lib/catalog';
import type { TranslationKey } from '../lib/i18n';

test('English and French have identical key coverage', () => {
  assert.deepEqual(Object.keys(dictionary.en).sort(), Object.keys(dictionary.fr).sort());
  assert.ok(Object.keys(dictionary.en).length > 200);
});

test('all strings are nonempty and preserve interpolation tokens across languages', () => {
  const tokens = (value: string) => [...value.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();
  for (const key of Object.keys(dictionary.en) as TranslationKey[]) {
    assert.ok(dictionary.en[key].trim(), `Empty English key: ${key}`);
    assert.ok(dictionary.fr[key].trim(), `Empty French key: ${key}`);
    assert.deepEqual(tokens(dictionary.en[key]), tokens(dictionary.fr[key]), `Token mismatch: ${key}`);
  }
});

test('interpolation is reactive and accepts numbers without treating them as markup', () => {
  assert.equal(translate('en', 'collectionCount', { count: 8 }), '8 creations');
  assert.equal(translate('fr', 'collectionCount', { count: 8 }), '8 créations');
  assert.equal(translate('fr', 'welcome', { name: '<script>' }), 'Bienvenue, <script>.');
});

test('all product names, descriptions, materials and colors have both languages', () => {
  for (const product of PRODUCTS) for (const field of ['name', 'description', 'material', 'color'] as const) {
    assert.ok(product[field].en.trim().length > 0, `${product.id}: English ${field}`);
    assert.ok(product[field].fr.trim().length > 0, `${product.id}: French ${field}`);
  }
});

test('all four narrative panels are fully translated', () => {
  for (let index = 1; index <= 4; index++) for (const part of ['Title', 'Accent', 'Subtitle', 'Body', 'Alt']) {
    const key = `story${part}${index}` as TranslationKey;
    assert.ok(dictionary.en[key]); assert.ok(dictionary.fr[key]);
  }
});
