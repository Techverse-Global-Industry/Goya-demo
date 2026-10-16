/** Match the supplied media formats without an initial missing-image request. */
export const STORY_IMAGES = [1, 2, 3, 4] as const;
export const PRODUCT_IMAGES = [3, 7, 6, 5, 9, 10, 8, 11] as const;

export function imageSources(index: number): string[] {
  if (!Number.isInteger(index) || index < 1 || index > 11) {
    throw new RangeError('Image index must be an integer from 1 to 11.');
  }
  const sources = [3, 4, 11].includes(index) ? [`/images/img${index}.webp`, `/images/img${index}.jpg`] : [`/images/img${index}.jpg`];
  return sources;
}
