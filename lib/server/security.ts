import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { mutateDatabase, readDatabase } from './database';
import type { Account, Database } from './database';
import type { DemoUser } from '../types';

export const COOKIE = 'mg_session';
export const GUEST_COOKIE = 'mg_guest';
const SESSION_LIFETIME = 7 * 86400000;
export class ApiError extends Error {
  constructor(message: string, public status = 400, public code = 'invalid') { super(message); }
}
export function publicUser(account: Account): DemoUser {
  const { id, name, email, provider, role } = account;
  return { id, name, email, provider, role };
}
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
}
export function checkPassword(password: string, stored: string): boolean {
  const [salt, key] = stored.split(':');
  if (!salt || !key) return false;
  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(key, 'hex');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
export const tokenHash = (token: string) => createHash('sha256').update(token).digest('hex');
export async function guestCookieToken(): Promise<string | null> {
  const token = (await cookies()).get(GUEST_COOKIE)?.value;
  return token && /^[a-f0-9]{64}$/.test(token) ? token : null;
}
/** Guest checkout can recover its own order, but never authenticates an account. */
export function guestIdentityForToken(db: Database, token: string | null): string | null {
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const session = db.sessions.find((entry) => entry.hash === tokenHash(token) && entry.expiresAt > Date.now() && /^guest:[a-f0-9]{32}$/.test(entry.userId));
  return session?.userId ?? null;
}
/** Called inside the same atomic mutation as stock allocation; failed orders save no session. */
export function prepareGuestCheckout(db: Database, token: string | null): { token: string; identity: string } {
  const identity = guestIdentityForToken(db, token);
  if (identity && token) return { identity, token };
  const nextToken = randomBytes(32).toString('hex');
  const nextIdentity = `guest:${randomBytes(16).toString('hex')}`;
  db.sessions = db.sessions.filter((session) => session.expiresAt > Date.now());
  db.sessions.push({ hash: tokenHash(nextToken), userId: nextIdentity, expiresAt: Date.now() + SESSION_LIFETIME });
  return { token: nextToken, identity: nextIdentity };
}
export async function setGuestCookie(token: string) {
  (await cookies()).set(GUEST_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: SESSION_LIFETIME / 1000 });
}
export async function sessionUser(): Promise<DemoUser | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const { data } = await readDatabase();
  return userForToken(data, token);
}
export function userForToken(db: Database, token: string): DemoUser | null {
  const session = db.sessions.find((entry) => entry.hash === tokenHash(token) && entry.expiresAt > Date.now());
  const account = session && db.users.find((entry) => entry.id === session.userId);
  return account ? publicUser(account) : null;
}
export async function requireUser(admin = false): Promise<DemoUser> {
  const user = await sessionUser();
  if (!user) throw new ApiError('Please sign in to continue.', 401, 'unauthorized');
  if (admin && user.role !== 'admin') throw new ApiError('Administrator access required.', 403, 'forbidden');
  return user;
}
export async function createSession(userId: string) {
  const token = randomBytes(32).toString('hex');
  const expiresAt = Date.now() + SESSION_LIFETIME;
  await mutateDatabase((db) => {
    db.sessions = db.sessions.filter((session) => session.expiresAt > Date.now());
    db.sessions.push({ hash: tokenHash(token), userId, expiresAt });
  });
  (await cookies()).set(COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 7 * 86400 });
}
export function assertOrigin(request: Request) {
  const origin = request.headers.get('origin');
  const expected = new URL(request.url).origin;
  let sameHost = false;
  try {
    const url = new URL(origin ?? '');
    sameHost = ['https:', 'http:'].includes(url.protocol) && url.host === request.headers.get('host');
  } catch { /* Invalid or opaque origins are rejected. */ }
  if (!origin || (!sameHost && origin !== expected && origin !== process.env.APP_URL)) throw new ApiError('Invalid request origin.', 403);
}
export async function bodyJson(request: Request): Promise<Record<string, unknown>> {
  if (!request.headers.get('content-type')?.includes('application/json')) throw new ApiError('Expected JSON.');
  const text = await request.text();
  if (text.length > 100_000) throw new ApiError('Request too large.', 413);
  try {
    const value = JSON.parse(text);
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error();
    return value;
  } catch { throw new ApiError('Invalid JSON.'); }
}
export async function rateLimit(key: string, max = 15, windowMs = 15 * 60000) {
  const allowed = await mutateDatabase((db) => {
    const now = Date.now();
    for (const [id, value] of Object.entries(db.requests)) if (value.expires < now) delete db.requests[id];
    const bucket = db.requests[key] ?? { count: 0, expires: now + windowMs };
    bucket.count++;
    db.requests[key] = bucket;
    return bucket.count <= max;
  });
  if (!allowed) throw new ApiError('Too many attempts. Please try again shortly.', 429, 'rateLimit');
}
export function apiFailure(error: unknown): Response {
  if (error instanceof ApiError) return Response.json({ error: error.message, code: error.code }, { status: error.status });
  console.error('Boutique API:', error instanceof Error ? error.message : 'Unknown error');
  return Response.json({ error: 'The boutique is temporarily unavailable. Please try again.', code: 'unavailable' }, { status: 503 });
}
