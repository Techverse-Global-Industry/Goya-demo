import { loadMedia } from '@/lib/server/media';
export const runtime = 'nodejs';
export async function GET(_request: Request, context: { params: Promise<{ key: string }> }) {
  const { key } = await context.params;
  if (!/^[a-f0-9-]{36}\.(jpg|png|webp)$/.test(key)) return new Response('Not found', { status: 404 });
  const data = await loadMedia(key);
  if (!data) return new Response('Not found', { status: 404 });
  const type = key.endsWith('.jpg') ? 'image/jpeg' : key.endsWith('.png') ? 'image/png' : 'image/webp';
  return new Response(data, { headers: { 'Content-Type': type, 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff' } });
}
