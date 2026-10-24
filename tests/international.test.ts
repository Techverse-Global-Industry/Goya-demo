import test from 'node:test';
import assert from 'node:assert/strict';
import { INTERNATIONAL_MARKETS, SITE_LOCALES, knownStaticText, languageName, localizedText, marketName, missingTranslationPhrases, siteText, translatedCopy } from '../lib/international';
import { siteTranslations } from '../lib/site-translations';
import { CONTACT_COUNTRIES } from '../lib/contact-countries';

test('rendered country and language labels are stable without the host ICU implementation', () => {
  const original = Intl.DisplayNames;
  Object.defineProperty(Intl, 'DisplayNames', { configurable: true, writable: true, value: class { constructor() { throw new Error('Host ICU differs'); } } });
  try {
    const countries = new Set([...CONTACT_COUNTRIES, ...INTERNATIONAL_MARKETS.map(market => market.code)]);
    for (const language of SITE_LOCALES) {
      for (const code of countries) assert.notEqual(marketName(code, language), code, `${language}: ${code}`);
      for (const code of SITE_LOCALES) assert.notEqual(languageName(code, language), code, `${language}: ${code}`);
    }
    assert.equal(marketName('JP', 'ja'), '日本');
    assert.equal(marketName('BJ', 'fr'), 'Bénin');
    assert.equal(marketName('JP', 'ar'), 'اليابان');
    assert.equal(languageName('ja', 'en'), 'Japanese');
    assert.equal(languageName('ar', 'fr'), 'arabe');
    assert.equal(marketName('WW', 'fr'), 'Site international');
    assert.equal(marketName('ZZ', 'en'), 'ZZ');
  } finally { Object.defineProperty(Intl, 'DisplayNames', { configurable: true, writable: true, value: original }); }
});

test('strict static translations distinguish catalogue gaps from dynamic uploaded content', () => {
  assert.equal(siteText('ar', 'Shopping bag'), 'سلة التسوق');
  assert.equal(siteText('ja', 'Last name'), '姓');
  const unknown = 'A customer supplied a previously unknown custom description.';
  assert.throws(() => siteText('ja', unknown), /Missing ja translation/);
  assert.equal(localizedText({ en: unknown, fr: 'Une description personnalisée inconnue.' }, 'ja'), unknown);
  assert.ok(missingTranslationPhrases('ja').includes(unknown));
});

test('copy translation preserves identifiers while translating labels and known static French', () => {
  const source = { currency: 'Currency', title: 'Shopping bag', href: '/product/francesco', value: 'francesco', rows: ['Order status', 'Last name'] };
  const copy = translatedCopy(source, 'ar');
  assert.equal(copy.href, source.href);
  assert.equal(copy.value, source.value);
  assert.notEqual(copy.currency, source.currency);
  assert.equal(copy.title, 'سلة التسوق');
  assert.equal(source.title, 'Shopping bag');
  assert.equal(translatedCopy(source, 'ar'), copy);
  assert.equal(knownStaticText('Mot de passe', 'ja'), 'パスワード');
  assert.equal(knownStaticText('An unregistered customer note', 'ja'), null);
});

test('promotion codes and payment provider names stay literal in every interface language', () => {
  for (const language of SITE_LOCALES) {
    for (const label of ['GOYA10', 'PayPal', 'Apple Pay', 'Google Pay', 'Klarna', 'Scalapay']) {
      assert.equal(siteText(language, label), label);
      assert.equal(knownStaticText(label, language), label);
      assert.equal(localizedText({ en: label, fr: label }, language), label);
    }
    const configuration = translatedCopy({ code: 'GOYA10', provider: 'Google Pay', title: 'Shopping bag' }, language);
    assert.equal(configuration.code, 'GOYA10');
    assert.equal(configuration.provider, 'Google Pay');
  }
});

test('promotion and express templates translate in seven languages without rewriting their codes or providers', () => {
  for (const language of SITE_LOCALES) {
    const codeMessage = siteText(language, 'This demo code is invalid. Try {code}.').replace('{code}', 'GOYA10');
    const expressMessage = siteText(language, 'Express demo checkout: {provider}. No wallet is connected and no payment is charged.').replace('{provider}', 'PayPal');
    const continueLabel = siteText(language, 'Continue with {provider} (demo)').replace('{provider}', 'Apple Pay');
    assert.ok(codeMessage.includes('GOYA10'));
    assert.ok(expressMessage.includes('PayPal'));
    assert.ok(continueLabel.includes('Apple Pay'));
    assert.equal(codeMessage.includes('{code}'), false);
    assert.equal(expressMessage.includes('{provider}'), false);
    if (language !== 'en') assert.notEqual(siteText(language, 'Promo code'), 'Promo code');
  }
});

test('known notification templates localize the fixed message without changing its order reference', () => {
  const id = 'DEMO-MG-A9Z7';
  const value = { en: `${id} · We are preparing your demo selection.`, fr: `${id} · Nous préparons votre sélection de démonstration.` };
  const japanese = localizedText(value, 'ja');
  const arabic = localizedText(value, 'ar');
  assert.ok(japanese.includes(id));
  assert.ok(arabic.includes(id));
  assert.notEqual(japanese, value.en);
  assert.notEqual(arabic, value.en);
  assert.equal(japanese.split(id).length, 2);
  assert.equal(arabic.split(id).length, 2);
  assert.equal(knownStaticText(value.en, 'ja'), null);
});

test('critical count and copyright placeholders survive the five translation catalogues', () => {
  for (const [language, catalogue] of Object.entries(siteTranslations)) {
    assert.ok(catalogue['{count} items'].includes('{count}'), language);
    for (const [source, target] of Object.entries(catalogue)) {
      const expected = [...source.matchAll(/\{\w+\}/g)].map(match => match[0]).sort();
      const actual = [...target.matchAll(/\{\w+\}/g)].map(match => match[0]).sort();
      assert.deepEqual(actual, expected, `${language}: ${source}`);
    }
  }
});
