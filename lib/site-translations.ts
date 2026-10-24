import type { SiteLocale } from './types';
import italian from './translations/it.json';
import german from './translations/de.json';
import spanish from './translations/es.json';
import japanese from './translations/ja.json';
import arabic from './translations/ar.json';
import italianOverrides from './translations/overrides-it.json';
import germanOverrides from './translations/overrides-de.json';
import spanishOverrides from './translations/overrides-es.json';
import japaneseOverrides from './translations/overrides-ja.json';
import arabicOverrides from './translations/overrides-ar.json';
import { interfaceLabels } from './translations/interface-labels';

export type TranslatedLocale = Exclude<SiteLocale, 'en' | 'fr'>;
export type TranslationCatalogue = Record<TranslatedLocale, Record<string, string>>;

// Every entry is keyed by the complete English source phrase. Domain catalogues
// are merged here so menus, product content and account flows share one resolver.
export const siteTranslations: TranslationCatalogue = {
  it: { ...italian, ...interfaceLabels.it, ...italianOverrides },
  de: { ...german, ...interfaceLabels.de, ...germanOverrides },
  es: { ...spanish, ...interfaceLabels.es, ...spanishOverrides },
  ja: { ...japanese, ...interfaceLabels.ja, ...japaneseOverrides },
  ar: { ...arabic, ...interfaceLabels.ar, ...arabicOverrides },
};
