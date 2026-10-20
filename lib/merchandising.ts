import type { Product, ShoeType } from './types';

/** Presentation grouping for the bilingual demo catalog; uploads remain visible in All. */
export function shoeTypeOf(product: Product): Exclude<ShoeType, 'all'> | null {
  if (product.kind !== 'footwear') return null;
  const text = `${product.name.en} ${product.name.fr}`.toLowerCase();
  if (/boot|bottine/.test(text)) return 'boots';
  if (/sneaker|basket/.test(text)) return 'sneakers';
  if (/loafer|slip-on|mocassin/.test(text)) return 'loafers';
  if (/heel|pump|peep-toe|escarpin|talon|bout ouvert/.test(text)) return 'heels';
  return null;
}
