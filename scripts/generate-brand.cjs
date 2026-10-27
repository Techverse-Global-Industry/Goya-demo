const fs = require('node:fs');
const crypto = require('node:crypto');
const sharp = require('sharp');

// Compile the owner's supplied artwork. No substitute typeface or redrawing.
const sourceFiles = {
  wordmark: 'public/brand/official/goya-wordmark.png',
  signature: 'public/brand/official/goya-signature.png',
  emblem: 'public/brand/official/goya-emblem.png',
};
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');

function bounds(data, info, lastRow = info.height) {
  let left = info.width, top = lastRow, right = -1, bottom = -1;
  for (let y = 0; y < lastRow; y++) for (let x = 0; x < info.width; x++) {
    if (!data[(y * info.width + x) * 4 + 3]) continue;
    left = Math.min(left, x); right = Math.max(right, x);
    top = Math.min(top, y); bottom = Math.max(bottom, y);
  }
  if (right < 0) throw new Error('Brand artwork is empty.');
  return { left, top, width: right - left + 1, height: bottom - top + 1 };
}

function svg(variant, image) {
  const { width, height, src } = image;
  const bytes = fs.readFileSync('public' + src);
  const id = 'goya-' + variant;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="Goya" data-goya-artwork="${variant}"><defs><mask id="${id}" x="0" y="0" width="${width}" height="${height}" maskUnits="userSpaceOnUse" style="mask-type:alpha"><image href="data:image/png;base64,${bytes.toString('base64')}" width="${width}" height="${height}"/></mask></defs><rect width="${width}" height="${height}" fill="currentColor" mask="url(#${id})"/></svg>`;
}

(async () => {
  const variants = {};
  const sources = [];
  for (const [variant, path] of Object.entries(sourceFiles)) {
    const bytes = fs.readFileSync(path); sources.push(bytes);
    const { data, info } = await sharp(bytes).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const crop = bounds(data, info);
    const src = `/brand/goya-${variant}.png`;
    // Lossless cropping removes only completely transparent outer margins.
    await sharp(bytes).extract(crop).png().toFile('public' + src);
    variants[variant] = { src, width: crop.width, height: crop.height, source: '/' + path.replace(/^public\//, ''), sha256: digest(bytes) };
    if (variant === 'emblem') {
      // The shoe symbol ends before the clearly separated lettering begins.
      let previous = crop.top, split = info.height;
      for (let y = crop.top; y < info.height; y++) {
        let occupied = false;
        for (let x = crop.left; x < crop.left + crop.width; x++) if (data[(y * info.width + x) * 4 + 3]) { occupied = true; break; }
        if (occupied) { if (y - previous > 24) { split = previous + 1; break; } previous = y; }
      }
      const symbol = bounds(data, info, split);
      await sharp(bytes).extract(symbol).png().toFile('public/brand/goya-symbol.png');
      variants.symbol = { src: '/brand/goya-symbol.png', width: symbol.width, height: symbol.height, source: variants.emblem.source, sha256: digest(bytes) };
    }
  }
  const version = 'official-' + digest(Buffer.concat(sources)).slice(0, 12);
  const worker = fs.readFileSync('public/sw.js', 'utf8').replace(/const VERSION = '[^']+';/, `const VERSION = 'maison-goya-${version}';`);
  fs.writeFileSync('public/sw.js', worker);
  fs.writeFileSync('public/brand/brand-assets.json', JSON.stringify({ version, variants }, null, 2) + '\n');
  fs.writeFileSync('lib/goya-brand.ts', `// Official owner-supplied artwork; retain its letterforms and spacing.\nexport const GOYA_BRAND_VERSION = ${JSON.stringify(version)};\nexport const GOYA_ARTWORK = ${JSON.stringify(variants, null, 2)} as const;\nexport type GoyaBrandVariant = keyof typeof GOYA_ARTWORK;\n`);
  for (const [variant, image] of Object.entries(variants)) fs.writeFileSync(`public/brand/goya-${variant}.svg`, svg(variant, image));
  console.log(JSON.stringify({ version, artwork: Object.fromEntries(Object.entries(variants).map(([key, image]) => [key, `${image.width}x${image.height}`])) }));
})().catch(error => { console.error(error); process.exitCode = 1; });
