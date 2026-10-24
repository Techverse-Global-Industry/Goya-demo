import type { Country, Locale, Localized, SiteLocale } from './types';
import { INTERNATIONAL_MARKETS } from './international-markets';
import { siteTranslations } from './site-translations';
import { sourceFrench } from './source-french';
import regionNames from './region-names.json';
import languageNames from './language-names.json';

export { INTERNATIONAL_MARKETS } from './international-markets';
export const SITE_LOCALES = ['en', 'it', 'fr', 'de', 'es', 'ja', 'ar'] as const;
export const COUNTRY_PROMPT_KEY = 'goya-country-prompt-v1';
export const LANGUAGE_NAMES: Record<SiteLocale, string> = { en: 'English', it: 'Italiano', fr: 'Français', de: 'Deutsch', es: 'Español', ja: '日本語', ar: 'العربية' };
export const MARKET_CODES: Country[] = INTERNATIONAL_MARKETS.filter(market => market.code !== 'WW').map(market => market.code);
export const REGION_IDS = ['europe', 'north-america', 'middle-east', 'asia', 'south-america', 'oceania', 'africa'] as const;
export type InternationalRegion = typeof REGION_IDS[number];

export function isSiteLocale(value: unknown): value is SiteLocale { return typeof value === 'string' && (SITE_LOCALES as readonly string[]).includes(value); }
export function contentLocale(language: SiteLocale): Locale { return language === 'fr' ? 'fr' : 'en'; }
export function languageDirection(language: SiteLocale): 'ltr' | 'rtl' { return language === 'ar' ? 'rtl' : 'ltr'; }
export function marketName(code: string, language: SiteLocale): string {
  if (code === 'WW') return siteText(language, 'International website', 'Site international');
  const names: Record<string, string> = regionNames[language];
  if (Object.prototype.hasOwnProperty.call(names, code)) return names[code];
  try { return new Intl.DisplayNames([language], { type: 'region' }).of(code) ?? code; } catch { return INTERNATIONAL_MARKETS.find(market => market.code === code)?.name ?? code; }
}
export function languageName(code: string, language: SiteLocale): string {
  const names: Record<string, string> = languageNames[language];
  if (Object.prototype.hasOwnProperty.call(names, code)) return names[code];
  try { return new Intl.DisplayNames([language], { type: 'language' }).of(code) ?? code; } catch { return code; }
}

const invariant = /^(?:\s*|[\p{N}\p{P}\p{S}\s]+|(?:https?:|mailto:|tel:|\/|#)[^\s]*|Maison Goya|MAISON GOYA|Goya|GOYA|GOYA10|Cotonou|Paris|Dakar|Mobile Money|PayPal|Klarna|Scalapay|Apple Pay|Google Pay|Google|Facebook|Instagram|WhatsApp|YouTube|Pinterest|LinkedIn|EUR|USD|XOF|GBP|JPY|AED|CHF|CAD|SAR|KWD|TRY|CNY|EU|UK|OS)$/u;
const technicalKeys = new Set(['id', 'slug', 'href', 'src', 'image', 'poster', 'cover', 'type', 'kind', 'category', 'currency', 'locale', 'language', 'region', 'area', 'value', 'hex', 'code', 'productId', 'colorGroup']);
const missing = new Map<SiteLocale, Set<string>>();

/** Selected languages never silently fall back to English. Completeness is
 * checked against the source-phrase catalogue before the storefront is released. */
export function siteText(language: SiteLocale, english: string, french?: string): string {
  if (language === 'en') return english;
  if (language === 'fr') {
    const result = french ?? sourceFrench[english];
    if (result !== undefined) return result;
    if (invariant.test(english)) return english;
    const phrases = missing.get(language) ?? new Set<string>(); phrases.add(english); missing.set(language, phrases);
    throw new Error(`Missing fr translation: ${english}`);
  }
  if (invariant.test(english)) return english;
  const result = siteTranslations[language][english];
  if (result !== undefined) return result;
  const phrases = missing.get(language) ?? new Set<string>(); phrases.add(english); missing.set(language, phrases);
  throw new Error(`Missing ${language} translation: ${english}`);
}

export function localizedText(value: Localized, language: SiteLocale): string {
  if (language === 'en') return value.en;
  if (language === 'fr') return value.fr;
  if (invariant.test(value.en)) return value.en;
  const translated = siteTranslations[language][value.en];
  if (translated !== undefined) return translated;
  const template = knownTemplateText(value.en, language);
  if (template !== null) return template;
  const phrases = missing.get(language) ?? new Set<string>(); phrases.add(value.en); missing.set(language, phrases);
  return value.en;
}
export function missingTranslationPhrases(language: SiteLocale): string[] { return [...(missing.get(language) ?? [])]; }

type StaticTemplate = { source: string; expression: RegExp; parameters: string[] };
let staticTemplates: StaticTemplate[] | null = null;
function knownTemplateText(value: string, language: Exclude<SiteLocale, 'en' | 'fr'>): string | null {
  if (!staticTemplates) {
    const sources = new Set([...Object.keys(sourceFrench), ...Object.values(siteTranslations).flatMap(catalogue => Object.keys(catalogue))]);
    staticTemplates = [];
    for (const source of sources) {
      const parameters = [...source.matchAll(/\{(\w+)\}/g)].map(match => match[1]);
      const literal = source.replace(/\{\w+\}/g, '');
      if (!parameters.length || literal.replace(/\s/g, '').length < 16) continue;
      const pieces = source.split(/\{\w+\}/g).map(piece => piece.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      staticTemplates.push({ source, expression: new RegExp(`^${pieces.join('(.+?)')}$`, 'u'), parameters });
    }
  }
  for (const template of staticTemplates) {
    const matches = template.expression.exec(value);
    if (!matches) continue;
    const translated = siteTranslations[language][template.source];
    if (translated === undefined) {
      const phrases = missing.get(language) ?? new Set<string>(); phrases.add(template.source); missing.set(language, phrases);
      return value;
    }
    const parameters = Object.fromEntries(template.parameters.map((name, index) => [name, matches[index + 1]]));
    return translated.replace(/\{(\w+)\}/g, (token, name: string) => parameters[name] ?? token);
  }
  return null;
}

const copyCache = new WeakMap<object, Map<SiteLocale, unknown>>();
export function translatedCopy<T extends Record<string, unknown>>(copy: T, language: SiteLocale): T {
  if (language === 'en' || language === 'fr') return copy;
  const cached = copyCache.get(copy)?.get(language);
  if (cached) return cached as T;
  const walk = (value: unknown, key = ''): unknown => {
    if (typeof value === 'string') return technicalKeys.has(key) && /^(?:[a-z][a-z0-9_-]*|[A-Z]{2,3}|(?:\/|https?:|#).*)$/.test(value) ? value : siteText(language, value);
    if (Array.isArray(value)) return value.map(item => walk(item, key));
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([entry, item]) => [entry, walk(item, entry)]));
    return value;
  };
  const result = walk(copy) as T;
  const languages = copyCache.get(copy) ?? new Map<SiteLocale, unknown>();
  languages.set(language, result); copyCache.set(copy, languages);
  return result;
}

let knownSources: Set<string> | null = null;
let reverseStatic: Map<string, string> | null = null;
/** Exact static phrases only, for the legacy DOM adapter. Dynamic customer
 * values never enter this registry or the missing-translation collector. */
export function knownStaticText(value: string, language: SiteLocale): string | null {
  if (invariant.test(value)) return value;
  if (!knownSources || !reverseStatic) {
    knownSources = new Set(Object.keys(sourceFrench));
    reverseStatic = new Map<string, string>();
    for (const [english, french] of Object.entries(sourceFrench)) if (!reverseStatic.has(french)) reverseStatic.set(french, english);
    for (const catalogue of Object.values(siteTranslations)) for (const [english, translated] of Object.entries(catalogue)) {
      knownSources.add(english); if (!reverseStatic.has(translated)) reverseStatic.set(translated, english);
    }
  }
  const english = knownSources.has(value) ? value : reverseStatic.get(value);
  if (english === undefined) return null;
  if (language === 'en') return english;
  const result = language === 'fr' ? sourceFrench[english] : siteTranslations[language][english];
  if (result !== undefined) return result;
  const phrases = missing.get(language) ?? new Set<string>(); phrases.add(english); missing.set(language, phrases);
  return null;
}
