import type { Product, ShoeType } from './types';

/** Presentation grouping for the bilingual demo catalog; uploads remain visible in All. */
export function shoeTypeOf(product: Product): Exclude<ShoeType, 'all'> | null {
  if (product.kind !== 'footwear') return null;
  if (product.style) return product.style;
  const text = `${product.name.en} ${product.name.fr}`.toLowerCase();
  if (/boot|bottine/.test(text)) return 'boots';
  if (/sneaker|basket/.test(text)) return 'sneakers';
  if (/monk|boucle/.test(text)) return 'monk-straps';
  if (/loafer|slip-on|mocassin/.test(text)) return 'loafers';
  if (/pump|escarpin/.test(text)) return 'pumps';
  if (/sandal|sandale/.test(text)) return 'sandals';
  if (/mule/.test(text)) return 'mules';
  if (/slipper|pantoufle/.test(text)) return 'slippers';
  if (/flat|ballerine|plat/.test(text)) return 'flats';
  if (/oxford|derby|lace-up|richelieu|lacets/.test(text)) return 'lace-ups';
  if (/heel|peep-toe|talon|bout ouvert/.test(text)) return 'heels';
  return null;
}
