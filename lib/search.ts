import { matchesProduct, normalizeSearch } from './commerce';
import { SHOE_STYLE_LABELS } from './catalog-edits';
import { shoeTypeOf } from './merchandising';
import type { Locale, Product } from './types';

export function searchScore(product: Product, query: string): number {
  if (!matchesProduct(product, query)) return 0;
  const term = normalizeSearch(query); if (!term) return 1;
  const names = [normalizeSearch(product.name.en), normalizeSearch(product.name.fr)];
  if (names.some(name => name === term)) return 100;
  if (names.some(name => name.startsWith(term))) return 80;
  if (names.some(name => name.includes(term))) return 60;
  const style = shoeTypeOf(product);
  if (style && Object.values(SHOE_STYLE_LABELS[style]).some(label => normalizeSearch(label) === term)) return 50;
  return 20;
}
export function rankedSearch(products: readonly Product[], query: string): Product[] {
  return products.filter(product => product.published !== false && searchScore(product, query) > 0).sort((a, b) => searchScore(b, query) - searchScore(a, query));
}
export function searchSuggestions(products: readonly Product[], locale: Locale): { label: string; href: string }[] {
  const seen = new Set<string>(); const suggestions: { label: string; href: string }[] = [];
  for (const product of products) {
    if (product.published === false) continue;
    const style = shoeTypeOf(product); if (!style || seen.has(style)) continue;
    seen.add(style); const label = SHOE_STYLE_LABELS[style][locale];
    suggestions.push({ label, href: `/search?q=${encodeURIComponent(label)}` });
  }
  return suggestions.slice(0, 8);
}
export function safeRecentSearches(value: string | null): string[] {
  if (!value || value.length > 3000) return [];
  try { const values: unknown = JSON.parse(value); return Array.isArray(values) ? [...new Set(values.filter((item): item is string => typeof item === 'string' && item.trim().length > 0 && item.length <= 120))].slice(0, 5) : []; } catch { return []; }
}
