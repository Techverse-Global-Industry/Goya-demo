const fs = require('node:fs');
const sharp = require('sharp');
const { version, variants } = JSON.parse(fs.readFileSync('public/brand/brand-assets.json', 'utf8'));

function canvas(variant, maximum) {
  const artwork = variants[variant];
  const scale = maximum / Math.max(artwork.width, artwork.height);
  const width = artwork.width * scale, height = artwork.height * scale;
  const source = fs.readFileSync(`public/brand/goya-${variant}.svg`, 'utf8').replace(/^<svg[^>]*>/, `<svg x="${(512 - width) / 2}" y="${(512 - height) / 2}" width="${width}" height="${height}" viewBox="0 0 ${artwork.width} ${artwork.height}">`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512"><rect width="512" height="512" fill="#ffffff"/>${source}</svg>`;
}

(async () => {
  fs.mkdirSync('public/icons', { recursive: true });
  // The complete official lockup fits the central maskable safe area.
  const icon = Buffer.from(canvas('emblem', 310));
  for (const [size, name] of [[192, 'icon-192'], [512, 'icon-512'], [512, 'maskable-512'], [180, 'apple-touch-icon']]) {
    await sharp(icon).resize(size, size).png().toFile(`public/icons/${name}.png`);
  }
  // The supplied shoe symbol remains recognizable at browser-tab sizes.
  const favicon = await sharp(Buffer.from(canvas('symbol', 410))).resize(128, 128).png().toBuffer();
  fs.writeFileSync('app/icon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128" data-goya-brand-version="${version}"><image width="128" height="128" href="data:image/png;base64,${favicon.toString('base64')}"/></svg>`);
  console.log('Official Goya emblem and shoe symbol applied to every app icon and favicon.');
})().catch(error => { console.error(error); process.exitCode = 1; });
