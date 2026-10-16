import { randomUUID } from 'node:crypto';
import { apiFailure, ApiError, assertOrigin, rateLimit, requireUser } from '@/lib/server/security';
import { saveMedia } from '@/lib/server/media';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  try {
    assertOrigin(request);
    const user = await requireUser(true);
    await rateLimit(`upload:${user.id}`, 60, 60000);
    if (Number(request.headers.get('content-length')) > 4_500_000) throw new ApiError('Use an image smaller than 4 MB.', 413);
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File) || file.size > 4_000_000 || file.size < 100) throw new ApiError('Choose a JPG, PNG or WebP image smaller than 4 MB.');
    const bytes = new Uint8Array(await file.arrayBuffer());
    let extension = '';
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) extension = 'jpg';
    if (bytes[0] === 0x89 && Buffer.from(bytes.slice(1, 8)).equals(Buffer.from([0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) extension = 'png';
    if (Buffer.from(bytes.slice(0, 4)).toString() === 'RIFF' && Buffer.from(bytes.slice(8, 12)).toString() === 'WEBP') extension = 'webp';
    if (!extension) throw new ApiError('That file is not a supported image.');
    const key = `${randomUUID()}.${extension}`;
    await saveMedia(key, bytes);
    return Response.json({ url: `/api/media/${key}` });
  } catch (error) { return apiFailure(error); }
}
