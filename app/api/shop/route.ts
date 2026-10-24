import { randomUUID } from 'node:crypto';
import { cookies } from 'next/headers';
import { after } from 'next/server';
import { readDatabase, mutateDatabase } from '@/lib/server/database';
import { apiFailure, ApiError, assertOrigin, beginDemoRecovery, bodyJson, checkPassword, COOKIE, GUEST_COOKIE, createSession, finishDemoRecovery, guestCookieToken, guestIdentityForToken, issueRecoveryCode, prepareGuestCheckout, provisionAdministrator, reservedAdministratorEmail, setGuestCookie, hashPassword, publicUser, rateLimit, requireUser, sessionUser, tokenHash, updateCredentials } from '@/lib/server/security';
import { changeOrderStatus, createAnnouncement, createBooking, createServiceRequest, deleteCustomerAddress, lookupCustomerOrder, ownServiceRequest, placeOrder, processAvailability, quoteShopCart, requestCustomerReturn, saveCustomerAddress, saveCustomerProfile, saveCustomerWishlist, snapshot, updateReturnStatus, updateServiceRequest, validateProduct } from '@/lib/server/shop';
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
    const guestIdentity = guestIdentityForToken(data, await guestCookieToken());
    return Response.json(snapshot(data, revision, user, admin, guestIdentity), { headers });
  } catch (error) { return apiFailure(error); }
}

export async function POST(request: Request) {
  try {
    assertOrigin(request);
    const body = await bodyJson(request);
    const action = body.action;
    if (action === 'cartQuote') {
      const { data } = await readDatabase();
      return Response.json({ quote: quoteShopCart(data, body) }, { headers });
    }
    if (action === 'login' || action === 'register') {
      const ip = request.headers.get('x-nf-client-connection-ip') || request.headers.get('x-forwarded-for')?.split(',')[0] || 'local';
      await rateLimit(`auth:${ip}`, 60);
      const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
      const password = typeof body.password === 'string' ? body.password : '';
      const name = typeof body.name === 'string' ? body.name.trim() : '';
      if (!validEmail(email) || password.length < 8 || password.length > 128) throw new ApiError('Use a valid email and a password of 8–128 characters.', 400, 'credentials');
      const adminEmail = reservedAdministratorEmail();
      const adminPassword = process.env.ADMIN_PASSWORD || (localDemo() ? 'MaisonDemo2026!' : '');
      // Never silently provision a hosted administrator with a public default password.
      if (adminEmail && adminPassword && email === adminEmail && action === 'login') {
        if (password !== adminPassword) throw new ApiError('Email or password is incorrect.', 401, 'credentials');
        const passwordHash = hashPassword(adminPassword);
        const result = await mutateDatabase((db) => ({ user: provisionAdministrator(db, adminEmail, passwordHash), recoveryCode: '' }));
        await createSession(result.user.id);
        return Response.json(result, { headers });
      }
      if (action === 'register') {
        if (name.length < 2 || name.length > 100) throw new ApiError('Please enter your name.', 400, 'invalidName');
        if (email === adminEmail) throw new ApiError('This email is unavailable.', 409, 'emailTaken');
        const passwordHash = hashPassword(password);
        const result = await mutateDatabase((db) => {
          if (db.users.some((account) => account.email === email)) throw new ApiError('An account with this email already exists. Please sign in.', 409, 'emailTaken');
          const account = { id: randomUUID(), name, email, provider: 'email' as const, role: 'customer' as const, passwordHash };
          db.users.push(account);
          return { user: publicUser(account), recoveryCode: issueRecoveryCode(db, account.id) };
        });
        await createSession(result.user.id);
        return Response.json(result, { headers });
      }
      const { data } = await readDatabase();
      const account = data.users.find((account) => account.email === email);
      // Equalize password work for unknown accounts.
      const matches = checkPassword(password, account?.passwordHash || '0123456789abcdef:'.concat('00'.repeat(64)));
      if (!account || !matches || account.role === 'admin') throw new ApiError('Email or password is incorrect.', 401, 'credentials');
      const recoveryCode = await mutateDatabase(db => {
        const latest = db.users.find(value => value.id === account.id);
        if (!latest || latest.passwordHash !== account.passwordHash) throw new ApiError('Please sign in again.', 401, 'credentials');
        return issueRecoveryCode(db, account.id);
      });
      await createSession(account.id);
      return Response.json({ user: publicUser(account), recoveryCode }, { headers });
    }
    if (action === 'recoveryRequest' || action === 'resetPassword') {
      const ip = request.headers.get('x-nf-client-connection-ip') || request.headers.get('x-forwarded-for')?.split(',')[0] || 'local';
      await rateLimit(`recovery:${ip}`, 20);
      if (action === 'recoveryRequest') {
        const token = await mutateDatabase(db => beginDemoRecovery(db, body.email, body.recoveryCode));
        return Response.json({ ok: true, ...(token ? { token } : {}) }, { headers });
      }
      await mutateDatabase(db => finishDemoRecovery(db, body.token, body.newPassword));
      return Response.json({ ok: true }, { headers });
    }
    if (action === 'logout') {
      const token = (await cookies()).get(COOKIE)?.value;
      const guestToken = await guestCookieToken();
      if (token || guestToken) await mutateDatabase((db) => {
        const session = token ? db.sessions.find((session) => session.hash === tokenHash(token)) : undefined;
        db.sessions = db.sessions.filter((session) => (!token || session.hash !== tokenHash(token)) && (!guestToken || session.hash !== tokenHash(guestToken)));
        if (session && typeof body.endpoint === 'string') db.subscriptions = db.subscriptions.filter((subscription) => !(subscription.userId === session.userId && subscription.endpoint === body.endpoint));
      });
      (await cookies()).delete(COOKIE);
      (await cookies()).delete(GUEST_COOKIE);
      return Response.json({ ok: true }, { headers });
    }
    if (action === 'guestSession') {
      const user = await sessionUser();
      if (!user) {
        const ip = request.headers.get('x-nf-client-connection-ip') || request.headers.get('x-forwarded-for')?.split(',')[0] || 'local';
        await rateLimit(`guest-session:${ip}`, 60);
        const token = await guestCookieToken();
        const guest = await mutateDatabase((db) => prepareGuestCheckout(db, token));
        await setGuestCookie(guest.token);
      }
      return Response.json({ ok: true }, { headers });
    }
    if (action === 'order') {
      const user = await sessionUser();
      if (!user) {
        const ip = request.headers.get('x-nf-client-connection-ip') || request.headers.get('x-forwarded-for')?.split(',')[0] || 'local';
        await rateLimit(`guest-order:${ip}`, 30);
      }
      const token = user ? null : await guestCookieToken();
      const result = await mutateDatabase((db) => {
        const before = new Set(db.notifications.map((notice) => notice.id));
        const guest = user ? null : prepareGuestCheckout(db, token);
        const order = placeOrder(db, user, body, guest?.identity);
        return { order, guestToken: guest?.token, ids: db.notifications.filter((notice) => !before.has(notice.id)).map((notice) => notice.id) };
      });
      if (result.guestToken) await setGuestCookie(result.guestToken);
      if (result.ids.length) after(() => deliverPush(result.ids));
      return Response.json({ order: result.order }, { headers });
    }
    if (action === 'book') {
      const user = await sessionUser();
      if (!user) {
        const ip = request.headers.get('x-nf-client-connection-ip') || request.headers.get('x-forwarded-for')?.split(',')[0] || 'local';
        await rateLimit(`guest-booking:${ip}`, 30);
      }
      const token = user ? null : await guestCookieToken();
      const result = await mutateDatabase((db) => {
        const guest = user ? null : prepareGuestCheckout(db, token);
        return { booking: createBooking(db, user, body.details, guest?.identity), guestToken: guest?.token };
      });
      if (result.guestToken) await setGuestCookie(result.guestToken);
      return Response.json({ booking: result.booking }, { headers });
    }
    if (action === 'lookupOrder' || action === 'serviceRequest' || action === 'availabilityRequest') {
      const user = await sessionUser();
      const ip = request.headers.get('x-nf-client-connection-ip') || request.headers.get('x-forwarded-for')?.split(',')[0] || 'local';
      await rateLimit(`${action}:${ip}`, action === 'lookupOrder' ? 20 : 40);
      const token = await guestCookieToken();
      const result = await mutateDatabase(db => {
        const guest = !user || action === 'lookupOrder' ? prepareGuestCheckout(db, token) : null;
        if (action === 'lookupOrder') return { order: lookupCustomerOrder(db, body.reference, body.email, guest!.identity), guestToken: guest!.token };
        let input = body.request;
        if (action === 'availabilityRequest') {
          for (const field of ['firstName', 'lastName'] as const) if (body[field] !== undefined && (typeof body[field] !== 'string' || body[field].length > 50)) throw new ApiError('Please enter a shorter name.');
          if (body.newsletter !== undefined && typeof body.newsletter !== 'boolean') throw new ApiError('Please check your communication preference.');
          const firstName = typeof body.firstName === 'string' ? body.firstName.trim() : '';
          const lastName = typeof body.lastName === 'string' ? body.lastName.trim() : '';
          input = { kind: 'availability', name: typeof body.name === 'string' ? body.name : `${firstName} ${lastName}`.trim() || user?.name || '', email: body.email, locale: body.locale, productId: body.productId, details: { size: typeof body.size === 'string' ? body.size : '', ...(firstName ? { firstName } : {}), ...(lastName ? { lastName } : {}), ...(typeof body.newsletter === 'boolean' ? { newsletter: String(body.newsletter) } : {}) } };
        }
        return { request: createServiceRequest(db, user, guest?.identity ?? null, input), guestToken: guest?.token };
      });
      if (result.guestToken) await setGuestCookie(result.guestToken);
      const { guestToken: _privateToken, ...response } = result;
      void _privateToken;
      return Response.json(response, { headers });
    }
    if (action === 'requestReturn' || action === 'requestDetail') {
      const user = await sessionUser();
      const token = await guestCookieToken();
      const result = await mutateDatabase(db => {
        const identity = guestIdentityForToken(db, token);
        return action === 'requestReturn' ? { returnRequest: requestCustomerReturn(db, user, identity, body) } : { request: ownServiceRequest(db, user, identity, body.id) };
      });
      return Response.json(result, { headers });
    }
    const user = await requireUser();
    if (action === 'accountCredentials') {
      const result = await mutateDatabase(db => updateCredentials(db, user, body));
      await createSession(result.user.id);
      return Response.json(result, { headers });
    }
    if (action === 'saveProfile') {
      const profile = await mutateDatabase((db) => saveCustomerProfile(db, user, body.profile));
      return Response.json({ profile }, { headers });
    }
    if (action === 'saveAddress') {
      const result = await mutateDatabase((db) => saveCustomerAddress(db, user, body.address));
      return Response.json(result, { headers });
    }
    if (action === 'deleteAddress') {
      const profile = await mutateDatabase((db) => deleteCustomerAddress(db, user, body.id));
      return Response.json({ profile }, { headers });
    }
    if (action === 'wishlist') {
      const profile = await mutateDatabase((db) => saveCustomerWishlist(db, user, body.productIds));
      return Response.json({ profile }, { headers });
    }
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
    const adminAction = ['saveProduct', 'orderStatus', 'announce', 'deleteAnnouncement', 'returnStatus', 'requestStatus'].includes(String(action));
    if (adminAction && user.role !== 'admin') throw new ApiError('Administrator access required.', 403);
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
        processAvailability(db, product);
        return product;
      });
      return Response.json({ product }, { headers });
    }
    if (action === 'returnStatus' || action === 'requestStatus') {
      const result = await mutateDatabase(db => action === 'returnStatus' ? { returnRequest: updateReturnStatus(db, body.id, body.status, body.note) } : { request: updateServiceRequest(db, body.id, body.status, body.note) });
      return Response.json(result, { headers });
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
