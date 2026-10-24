import type { Category, Localized, Product, ShoeType } from './types';

export type CatalogEdit = 'collection' | 'new' | 'gifts' | 'featured' | 'search';
export const MEN_SHOE_STYLES: Exclude<ShoeType, 'all'>[] = ['loafers', 'lace-ups', 'boots', 'sneakers', 'monk-straps', 'slippers', 'sandals', 'mules'];
export const WOMEN_SHOE_STYLES: Exclude<ShoeType, 'all'>[] = ['loafers', 'boots', 'pumps', 'sneakers', 'flats', 'sandals', 'heels', 'mules'];
export const ACCESSORY_TYPES = ['bags-backpacks', 'small-leather-goods', 'belts', 'gloves-scarves', 'hats', 'socks', 'tassels', 'lifestyle', 'shoe-care', 'trees-horns', 'travel-kits', 'laces'] as const;
export type AccessoryType = typeof ACCESSORY_TYPES[number];
export const ACCESSORY_LABELS: Record<AccessoryType, Localized> = {
  'bags-backpacks': { en: 'Bags & backpacks', fr: 'Sacs & sacs à dos' },
  'small-leather-goods': { en: 'Small leather goods', fr: 'Petite maroquinerie' },
  belts: { en: 'Belts', fr: 'Ceintures' }, 'gloves-scarves': { en: 'Gloves & scarves', fr: 'Gants & écharpes' },
  hats: { en: 'Hats & beanies', fr: 'Chapeaux & bonnets' }, socks: { en: 'Socks', fr: 'Chaussettes' },
  tassels: { en: 'Tassels', fr: 'Glands' }, lifestyle: { en: 'Lifestyle', fr: 'Art de vivre' },
  'shoe-care': { en: 'Shoe care', fr: 'Entretien des souliers' }, 'trees-horns': { en: 'Shoe trees & horns', fr: 'Embauchoirs & chausse-pieds' },
  'travel-kits': { en: 'Travel kits', fr: 'Trousses de voyage' }, laces: { en: 'Laces', fr: 'Lacets' },
};
export const SHOE_STYLE_LABELS: Record<Exclude<ShoeType, 'all'>, Localized> = {
  loafers: { en: 'Loafers', fr: 'Mocassins' }, 'lace-ups': { en: 'Lace-ups', fr: 'Souliers à lacets' },
  boots: { en: 'Ankle boots', fr: 'Bottines' }, sneakers: { en: 'Sneakers', fr: 'Baskets' },
  'monk-straps': { en: 'Monk straps', fr: 'Souliers à boucles' }, slippers: { en: 'Slippers', fr: 'Slippers' },
  sandals: { en: 'Sandals', fr: 'Sandales' }, pumps: { en: 'Pumps', fr: 'Escarpins' },
  flats: { en: 'Flats', fr: 'Souliers plats' }, heels: { en: 'High heels', fr: 'Talons hauts' }, mules: { en: 'Mules', fr: 'Mules' },
};
export const CONSTRUCTION_LABELS: Record<string, Localized> = {
  blake: { en: 'Blake stitched', fr: 'Cousu Blake' }, goodyear: { en: 'Goodyear welted', fr: 'Cousu Goodyear' },
  cupsole: { en: 'Cupsole', fr: 'Semelle cuvette' }, stitched: { en: 'Stitched', fr: 'Cousu' },
  cemented: { en: 'Cemented', fr: 'Collé' }, unspecified: { en: 'Not specified', fr: 'Non précisé' },
};

/** Explicit legacy selections keep existing hosted catalogues curated without changing their stock. */
const LEGACY_EDITS: Record<'new' | 'gifts' | 'featured', readonly string[]> = {
  new: ['kanvo-oxford', 'raffia-monk', 'calfskin-belt', 'heritage-weekender'],
  gifts: ['francesco', 'cotonou-tote', 'heritage-weekender', 'kente-derby'],
  featured: ['francesco', 'kanvo-oxford', 'raffia-monk', 'calfskin-belt'],
};
export function belongsToEdit(product: Product, edit: CatalogEdit): boolean {
  if (edit === 'collection' || edit === 'search') return true;
  return product.edits !== undefined ? product.edits.includes(edit) : LEGACY_EDITS[edit].includes(product.id);
}
export function accessoryTypeOf(product: Product): string | null {
  if (product.category !== 'accessories') return null;
  return product.accessoryType ?? (product.kind === 'belt' ? 'belts' : product.kind === 'bag' ? 'bags-backpacks' : null);
}
export function matchesAccessoryAudience(product: Product, audience?: 'men' | 'women'): boolean {
  if (!audience) return true;
  const assigned = product.audience ?? (['heritage-weekender', 'archive-crossbody'].includes(product.id) ? 'women' : product.kind === 'belt' ? 'men' : 'unisex');
  return assigned === 'unisex' || assigned === audience;
}
export function constructionOf(product: Product): string | null {
  return product.kind === 'footwear' ? product.construction ?? 'unspecified' : null;
}
export function stylesFor(category: Category): ShoeType[] {
  return category === 'accessories' ? ['all'] : ['all', ...(category === 'men' ? MEN_SHOE_STYLES : category === 'women' ? WOMEN_SHOE_STYLES : [...new Set([...MEN_SHOE_STYLES, ...WOMEN_SHOE_STYLES])])];
}

/** Illustrative conversions for the demo fit journey, not a verified Goya fitting chart. */
export const DEMO_SIZE_CHART = Array.from({ length: 14 }, (_, index) => {
  const eu = 35 + index;
  return { eu, uk: eu - 33.5, usMen: eu - 33, usWomen: eu - 31.5, cm: Number((22.3 + index * 2 / 3).toFixed(1)) };
});
export interface FitAnswers { system: 'EU' | 'UK' | 'US' | 'CM'; value: number; width: 'narrow' | 'regular' | 'wide'; preference: 'close' | 'regular' | 'relaxed' }
export function recommendDemoSize(product: Product, answers: FitAnswers): { size: string; available: boolean; withinRange: boolean } | null {
  const sizes = Object.keys(product.stock).map(Number).filter(Number.isFinite).sort((a, b) => a - b);
  if (product.kind !== 'footwear' || !sizes.length || !Number.isFinite(answers.value)) return null;
  const key = answers.system === 'EU' ? 'eu' : answers.system === 'UK' ? 'uk' : answers.system === 'CM' ? 'cm' : product.category === 'women' ? 'usWomen' : 'usMen';
  const row = answers.system === 'CM' ? DEMO_SIZE_CHART.find(item => item.cm >= answers.value) : [...DEMO_SIZE_CHART].sort((a, b) => Math.abs(a[key] - answers.value) - Math.abs(b[key] - answers.value))[0];
  if (!row) return null;
  const target = row.eu + (answers.width === 'wide' ? .5 : answers.width === 'narrow' && answers.preference === 'close' ? -.5 : 0) + (answers.preference === 'relaxed' ? .5 : answers.preference === 'close' ? -.5 : 0) + (product.fit === 'narrow' ? .5 : product.fit === 'generous' ? -.5 : 0);
  const withinRange = target >= sizes[0] - .5 && target <= sizes[sizes.length - 1] + .5;
  const best = withinRange ? [...sizes].sort((a, b) => Math.abs(a - target) - Math.abs(b - target) || b - a)[0] : Math.ceil(target);
  return { size: String(best), available: withinRange && (product.stock[String(best)] ?? 0) > 0, withinRange };
}
