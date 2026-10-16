import { randomUUID } from 'node:crypto';
import { cookies } from 'next/headers';
import { after } from 'next/server';
import { readDatabase, mutateDatabase } from '@/lib/server/database';
import { apiFailure, ApiError, assertOrigin, bodyJson, checkPassword, COOKIE, createSession, hashPassword, publicUser, rateLimit, requireUser, sessionUser, tokenHash } from '@/lib/server/security';
import { changeOrderStatus, createAnnouncement, createBooking, placeOrder, snapshot, validateProduct } from '@/lib/server/shop';
import { validEmail } from '@/lib/commerce';
import { deliverPush } from '@/lib/server/push';
import { localDemo } from '@/lib/server/config';
import type { OrderStatus } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const headers = { 'Cache-Control': 'private, no-store' };

export async function GET(request: Request) {
  try {
    const admin = new URL(request.url).searchParams.get('admin') === '1';
    const user = admin ? await requireUser(true) : await sessionUser();
    const { data, revision } = await readDatabase();
    return Response.json(snapshot(data, revision, user, admin), { headers });
  } catch (error) { return apiFailure(error); }
}

export async function POST(request: Request) {
  try {
    assertOrigin(request);
    const body = await bodyJson(request);
    const action = body.action;
    if (action === 'login' || action === 'register') {
      const ip = request.headers.get('x-nf-client-connection-ip') || request.headers.get('x-forwarded-for')?.split(',')[0] || 'local';
      await rateLimit(`auth:${ip}`, 60);
      const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
      const password = typeof body.password === 'string' ? body.password : '';
      const name = typeof body.name === 'string' ? body.name.trim() : '';
      if (!validEmail(email) || password.length < 8 || password.length > 128) throw new ApiError('Use a valid email and a password of 8–128 characters.', 400, 'credentials');
      const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase() || (localDemo() ? 'admin@goya.demo' : '');
      const adminPassword = process.env.ADMIN_PASSWORD || (localDemo() ? 'MaisonDemo2026!' : '');
      // Never silently provision a hosted administrator with a public default password.
      if (adminEmail && adminPassword && email === adminEmail && action === 'login') {
        if (password !== adminPassword) throw new ApiError('Email or password is incorrect.', 401, 'credentials');
        const passwordHash = hashPassword(adminPassword);
        const user = await mutateDatabase((db) => {
          let account = db.users.find((account) => account.email === adminEmail);
          if (!account) { account = { id: randomUUID(), name: 'Maison Goya', email: adminEmail, provider: 'email', role: 'admin', passwordHash }; db.users.push(account); }
          account.role = 'admin'; account.passwordHash = passwordHash;
          return publicUser(account);
        });
        await createSession(user.id);
        return Response.json({ user }, { headers });
      }
      if (action === 'register') {
        if (name.length < 2 || name.length > 100) throw new ApiError('Please enter your name.', 400, 'invalidName');
        if (email === adminEmail) throw new ApiError('This email is unavailable.', 409, 'emailTaken');
        const passwordHash = hashPassword(password);
        const user = await mutateDatabase((db) => {
          if (db.users.some((account) => account.email === email)) throw new ApiError('An account with this email already exists. Please sign in.', 409, 'emailTaken');
          const account = { id: randomUUID(), name, email, provider: 'email' as const, role: 'customer' as const, passwordHash };
          db.users.push(account);
          return publicUser(account);
        });
        await createSession(user.id);
        return Response.json({ user }, { headers });
      }
      const { data } = await readDatabase();
      const account = data.users.find((account) => account.email === email);
      // Equalize password work for unknown accounts.
      const matches = checkPassword(password, account?.passwordHash || '0123456789abcdef:'.concat('00'.repeat(64)));
      if (!account || !matches || account.role === 'admin') throw new ApiError('Email or password is incorrect.', 401, 'credentials');
      await createSession(account.id);
      return Response.json({ user: publicUser(account) }, { headers });
    }
    if (action === 'logout') {
      const token = (await cookies()).get(COOKIE)?.value;
      if (token) await mutateDatabase((db) => {
        const session = db.sessions.find((session) => session.hash === tokenHash(token));
        db.sessions = db.sessions.filter((session) => session.hash !== tokenHash(token));
        if (session && typeof body.endpoint === 'string') db.subscriptions = db.subscriptions.filter((subscription) => !(subscription.userId === session.userId && subscription.endpoint === body.endpoint));
      });
      (await cookies()).delete(COOKIE);
      return Response.json({ ok: true }, { headers });
    }
    const user = await requireUser();
    if (action === 'profile') {
      const name = typeof body.name === 'string' ? body.name.trim() : '';
      if (name.length < 2 || name.length > 100) throw new ApiError('Please enter a valid name.', 400, 'invalidName');
      const updated = await mutateDatabase((db) => {
        const account = db.users.find((account) => account.id === user.id);
        if (!account) throw new ApiError('Please sign in again.', 401, 'unauthorized');
        account.name = name;
        return publicUser(account);
      });
      return Response.json({ user: updated }, { headers });
    }
    const adminAction = ['saveProduct', 'orderStatus', 'announce', 'deleteAnnouncement'].includes(String(action));
    if (adminAction && user.role !== 'admin') throw new ApiError('Administrator access required.', 403);
    if (action === 'order') {
      const result = await mutateDatabase((db) => {
        const before = new Set(db.notifications.map((notice) => notice.id));
        const order = placeOrder(db, user, body);
        return { order, ids: db.notifications.filter((notice) => !before.has(notice.id)).map((notice) => notice.id) };
      });
      after(() => deliverPush(result.ids));
      return Response.json({ order: result.order }, { headers });
    }
    if (action === 'book') {
      const booking = await mutateDatabase((db) => createBooking(db, user, body.details));
      return Response.json({ booking }, { headers });
    }
    if (action === 'saveProduct') {
      const product = await mutateDatabase((db) => {
        const value = body.product;
        if (!value || typeof value !== 'object' || Array.isArray(value)) throw new ApiError('Product details are required.');
        const input = value as Record<string, unknown>;
        const existing = db.products.find((product) => product.id === input.id);
        if (existing && body.expectedUpdatedAt !== (existing.updatedAt ?? null)) throw new ApiError('This product changed in another session. Refresh before saving.', 409, 'conflict');
        const product = validateProduct(input, existing);
        if (existing) db.products[db.products.indexOf(existing)] = product;
        else db.products.push(product);
        return product;
      });
      return Response.json({ product }, { headers });
    }
    if (action === 'orderStatus' || action === 'announce') {
      const result = await mutateDatabase((db) => {
        const before = new Set(db.notifications.map((notice) => notice.id));
        if (action === 'orderStatus') changeOrderStatus(db, String(body.orderId), body.status as OrderStatus);
        else createAnnouncement(db, body);
        return db.notifications.filter((notice) => !before.has(notice.id)).map((notice) => notice.id);
      });
      after(() => deliverPush(result));
      return Response.json({ ok: true }, { headers });
    }
    if (action === 'deleteAnnouncement') {
      await mutateDatabase((db) => { db.announcements = db.announcements.filter((announcement) => announcement.id !== body.id); });
      return Response.json({ ok: true }, { headers });
    }
    if (action === 'readNotifications') {
      await mutateDatabase((db) => { db.notifications.filter((notice) => notice.userId === user.id).forEach((notice) => { notice.read = true; }); });
      return Response.json({ ok: true }, { headers });
    }
    if (action === 'subscribe') {
      if (!process.env.VAPID_PRIVATE_KEY || !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) throw new ApiError('Push notifications have not been configured yet.', 503, 'pushUnconfigured');
      const subscription = body.subscription as { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
      let endpoint: URL;
      try { endpoint = new URL(subscription?.endpoint ?? ''); } catch { throw new ApiError('Invalid subscription.'); }
      const allowedHost = /(^|\.)(push\.services\.mozilla\.com|fcm\.googleapis\.com|web\.push\.apple\.com|notify\.windows\.com)$/;
      if (endpoint.protocol !== 'https:' || !allowedHost.test(endpoint.hostname) || endpoint.port || endpoint.username || endpoint.password || !subscription.keys || !/^[\w-]{80,100}$/.test(subscription.keys.p256dh ?? '') || !/^[\w-]{20,30}$/.test(subscription.keys.auth ?? '')) throw new ApiError('Unsupported push subscription.');
      await mutateDatabase((db) => {
        db.subscriptions = db.subscriptions.filter((entry) => entry.endpoint !== subscription.endpoint);
        if (db.subscriptions.filter((entry) => entry.userId === user.id).length >= 10) throw new ApiError('Device limit reached.');
        db.subscriptions.push({ userId: user.id, endpoint: subscription.endpoint!, keys: { p256dh: subscription.keys!.p256dh!, auth: subscription.keys!.auth! }, locale: body.locale === 'fr' ? 'fr' : 'en' });
      });
      return Response.json({ ok: true }, { headers });
    }
    if (action === 'unsubscribe') {
      await mutateDatabase((db) => { db.subscriptions = db.subscriptions.filter((entry) => !(entry.userId === user.id && entry.endpoint === body.endpoint)); });
      return Response.json({ ok: true }, { headers });
    }
    throw new ApiError('Unknown action.');
  } catch (error) { return apiFailure(error); }
}
