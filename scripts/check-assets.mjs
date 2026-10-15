import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'images');
const failures = [];
for (let index = 1; index <= 11; index++) {
  const allowed = [`img${index}.jpg`, ...([3, 4, 11].includes(index) ? [`img${index}.webp`] : [])];
  let found = false;
  for (const filename of allowed) {
    const location = path.join(root, filename);
    try { await access(location); } catch { continue; }
    const bytes = await readFile(location);
    const jpeg = bytes.length > 100 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    const webp = bytes.length > 100 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';
    if ((filename.endsWith('.jpg') && jpeg) || (filename.endsWith('.webp') && webp)) {
      console.log(`OK  /images/${filename}`); found = true; break;
    }
    failures.push(`${filename} exists but its content is not a valid ${filename.endsWith('.jpg') ? 'JPEG' : 'WebP'} signature.`);
  }
  if (!found) failures.push(`Missing approved image: ${allowed.join(' or ')}.`);
}
if (failures.length) {
  console.error('\nAsset preflight failed:\n' + failures.map((line) => `  - ${line}`).join('\n'));
  console.error('\nCopy approved brand photographs into public/images/ before release.');
  process.exitCode = 1;
} else console.log('\nAll 11 image slots are present. Check resolution, crop and usage rights manually.');
