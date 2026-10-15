/** Canonical JPEG routing wins; explicitly mentioned WebP files are fallback-only. */
export const STORY_IMAGES = [1, 2, 3, 4] as const;
export const PRODUCT_IMAGES = [4, 5, 6, 7, 8, 9, 10, 11] as const;

export function imageSources(index: number): string[] {
  if (!Number.isInteger(index) || index < 1 || index > 11) {
    throw new RangeError('Image index must be an integer from 1 to 11.');
  }
  const sources = [`/images/img${index}.jpg`];
  if ([3, 4, 11].includes(index)) sources.push(`/images/img${index}.webp`);
  return sources;
}
