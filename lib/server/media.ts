import { getStore } from '@netlify/blobs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { localDemo } from './config';
const localRoot = () => path.join(process.cwd(), '.data', 'uploads');
const mediaStore = () => getStore({ name: 'maison-product-images', consistency: 'strong' });
export async function saveMedia(key: string, bytes: Uint8Array) {
  if (!localDemo()) await mediaStore().set(key, bytes.buffer as ArrayBuffer);
  else { await mkdir(localRoot(), { recursive: true }); await writeFile(path.join(localRoot(), key), bytes); }
}
export async function loadMedia(key: string): Promise<ArrayBuffer | null> {
  if (!localDemo()) return mediaStore().get(key, { type: 'arrayBuffer' });
  try { const buffer = await readFile(/* turbopackIgnore: true */ path.join(localRoot(), key)); return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer; }
  catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null; throw error; }
}
