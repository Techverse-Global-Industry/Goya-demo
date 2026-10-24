import { randomUUID } from 'node:crypto';
import { CURRENCIES, shippingCost, validEmail, validateBooking, validateShipping, isPaymentAvailable } from '../commerce';
import type { AccountProfile, Announcement, BookingDetails, CartLine, Currency, DemoUser, Localized, Order, OrderStatus, PaymentMethod, Product, SavedAddress, ShippingDetails, StoreSnapshot } from '../types';
import type { Account, Database } from './database';
import { ApiError } from './security';
import type { RequestAttachment, ReturnLine, ReturnRequest, ReturnStatus, ServiceRequest, ServiceRequestKind, ServiceRequestStatus } from '../experience-types';

export const ORDER_STATUSES: OrderStatus[] = ['confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'];
const OPTIONAL_SHIPPING_FIELDS = { postalCode: 24, phone: 40, address2: 240, company: 160 } as const;

function deliveryDetails(input: unknown): ShippingDetails {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new ApiError('Please check your delivery details.');
  const value = input as Record<string, unknown>;
  if (['name', 'email', 'address', 'city', 'country'].some((field) => typeof value[field] !== 'string') || Object.keys(validateShipping(value as unknown as ShippingDetails)).length) throw new ApiError('Please check your delivery details.');
  const details: ShippingDetails = { name: (value.name as string).trim(), email: (value.email as string).trim().toLowerCase(), address: (value.address as string).trim(), city: (value.city as string).trim(), country: value.country as ShippingDetails['country'] };
  for (const [field, max] of Object.entries(OPTIONAL_SHIPPING_FIELDS) as [keyof typeof OPTIONAL_SHIPPING_FIELDS, number][]) {
    const raw = value[field];
    if (raw === undefined) continue;
    if (typeof raw !== 'string' || raw.length > max) throw new ApiError('Please check your delivery details.');
    const text = raw.trim();
    if (field === 'phone' && !/^[+()\d\s.-]*$/.test(text)) throw new ApiError('Please enter a valid phone number.');
    details[field] = text;
  }
  return details;
}

function profileDefaults(account: Account): AccountProfile {
  const stored = account.profile;
  return {
    phone: stored?.phone ?? '', birthDate: stored?.birthDate ?? '', title: stored?.title ?? '',
    preferredLocale: stored?.preferredLocale === 'fr' ? 'fr' : 'en', newsletter: stored?.newsletter === true,
    addresses: structuredClone(stored?.addresses ?? []), wishlist: [...(stored?.wishlist ?? [])],
  };
}
function ownAccount(db: Database, user: DemoUser): Account {
  const account = db.users.find((value) => value.id === user.id);
  if (!account) throw new ApiError('Please sign in again.', 401, 'unauthorized');
  return account;
}
export function customerProfile(db: Database, user: DemoUser | null): AccountProfile | null {
  if (!user) return null;
  const account = db.users.find((value) => value.id === user.id);
  if (!account) return null;
  const profile = profileDefaults(account);
  const published = new Set(db.products.filter((product) => product.published !== false).map((product) => product.id));
  profile.wishlist = profile.wishlist.filter((id) => published.has(id));
  return profile;
}
export function saveCustomerProfile(db: Database, user: DemoUser, input: unknown): AccountProfile {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new ApiError('Profile details are required.');
  const account = ownAccount(db, user);
  const value = input as Record<string, unknown>;
  const profile = profileDefaults(account);
  if (Object.hasOwn(value, 'phone')) {
    if (typeof value.phone !== 'string' || value.phone.length > 40 || !/^[+()\d\s.-]*$/.test(value.phone)) throw new ApiError('Please enter a valid phone number.');
    profile.phone = value.phone.trim();
  }
  if (Object.hasOwn(value, 'birthDate')) {
    if (typeof value.birthDate !== 'string') throw new ApiError('Please enter a valid date of birth.');
    if (value.birthDate) {
      const date = new Date(`${value.birthDate}T00:00:00Z`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value.birthDate) || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value.birthDate || value.birthDate < '1900-01-01' || value.birthDate > new Date().toISOString().slice(0, 10)) throw new ApiError('Please enter a valid date of birth.');
    }
    profile.birthDate = value.birthDate;
  }
  if (Object.hasOwn(value, 'title')) {
    if (!['', 'mr', 'ms', 'mx'].includes(String(value.title)) || typeof value.title !== 'string') throw new ApiError('Please select a valid title.');
    profile.title = value.title as AccountProfile['title'];
  }
  if (Object.hasOwn(value, 'preferredLocale')) {
    if (value.preferredLocale !== 'en' && value.preferredLocale !== 'fr') throw new ApiError('Please select a supported language.');
    profile.preferredLocale = value.preferredLocale;
  }
  if (Object.hasOwn(value, 'newsletter')) {
    if (typeof value.newsletter !== 'boolean') throw new ApiError('Please check your communication preference.');
    profile.newsletter = value.newsletter;
  }
  account.profile = profile;
  return customerProfile(db, user)!;
}
export function saveCustomerAddress(db: Database, user: DemoUser, input: unknown): { address: SavedAddress; profile: AccountProfile } {
  const account = ownAccount(db, user);
  const details = deliveryDetails(input);
  const value = input as Record<string, unknown>;
  const profile = profileDefaults(account);
  if (value.id !== undefined && typeof value.id !== 'string') throw new ApiError('Please select a valid address.');
  const requestedId = typeof value.id === 'string' ? value.id : '';
  const existing = requestedId ? profile.addresses.find((address) => address.id === requestedId) : undefined;
  if (requestedId && !existing) throw new ApiError('Address not found.', 404, 'notFound');
  if (!existing && JSON.stringify(profile.addresses).length > 500_000) throw new ApiError('Your address book is full. Remove an unused address before adding another.');
  if (value.label !== undefined && (typeof value.label !== 'string' || value.label.length > 60)) throw new ApiError('Please enter a shorter address label.');
  if (value.isDefault !== undefined && typeof value.isDefault !== 'boolean') throw new ApiError('Please check your default address.');
  const address: SavedAddress = { ...details, id: existing?.id ?? randomUUID(), label: typeof value.label === 'string' ? value.label.trim() : existing?.label ?? '', isDefault: value.isDefault === undefined ? existing?.isDefault ?? false : value.isDefault };
  const addresses = existing ? profile.addresses.map((saved) => saved.id === address.id ? address : saved) : [...profile.addresses, address];
  if (address.isDefault) addresses.forEach((saved) => { saved.isDefault = saved.id === address.id; });
  if (!addresses.some((saved) => saved.isDefault)) addresses[0].isDefault = true;
  profile.addresses = addresses;
  account.profile = profile;
  return { address: structuredClone(address), profile: customerProfile(db, user)! };
}
export function deleteCustomerAddress(db: Database, user: DemoUser, id: unknown): AccountProfile {
  const account = ownAccount(db, user);
  const profile = profileDefaults(account);
  if (typeof id !== 'string' || !profile.addresses.some((address) => address.id === id)) throw new ApiError('Address not found.', 404, 'notFound');
  profile.addresses = profile.addresses.filter((address) => address.id !== id);
  if (profile.addresses.length && !profile.addresses.some((address) => address.isDefault)) profile.addresses[0].isDefault = true;
  account.profile = profile;
  return customerProfile(db, user)!;
}
export function saveCustomerWishlist(db: Database, user: DemoUser, ids: unknown): AccountProfile {
  const account = ownAccount(db, user);
  const published = new Set(db.products.filter((product) => product.published !== false).map((product) => product.id));
  if (!Array.isArray(ids) || ids.length > 100 || ids.some((id) => typeof id !== 'string' || !published.has(id))) throw new ApiError('Please select available pieces for your wishlist.');
  const profile = profileDefaults(account);
  profile.wishlist = [...new Set(ids as string[])];
  account.profile = profile;
  return customerProfile(db, user)!;
}
export function localized(value: unknown, label: string, max = 2000): Localized {
  const object = value as Record<string, unknown> | null;
  if (!object || typeof object.en !== 'string' || typeof object.fr !== 'string' || !object.en.trim() || !object.fr.trim() || object.en.length > max || object.fr.length > max) throw new ApiError(`${label}: English and French text are required.`);
  return { en: object.en.trim(), fr: object.fr.trim() };
}
export function validateProduct(value: Record<string, unknown>, existing?: Product): Product {
  const id = existing?.id ?? (typeof value.id === 'string' ? value.id : randomUUID());
  if (!/^[a-z0-9-]{3,70}$/.test(id)) throw new ApiError('Use a product reference with letters, numbers and hyphens.');
  if (!['men', 'women', 'accessories'].includes(String(value.category)) || !['footwear', 'belt', 'bag', 'accessory', 'care'].includes(String(value.kind)) || !['signature', 'limited', 'atelierEdition'].includes(String(value.badge))) throw new ApiError('Select a valid product category and type.');
  const stock = value.stock as Record<string, number>;
  if (!stock || typeof stock !== 'object' || Array.isArray(stock) || !Object.keys(stock).length || Object.keys(stock).length > 50) throw new ApiError('Add at least one size and quantity.');
  for (const [size, quantity] of Object.entries(stock)) {
    if (!/^(OS|[0-9]{2,3}(\.[05])?)$/.test(size) || !Number.isSafeInteger(quantity) || quantity < 0 || quantity > 10000) throw new ApiError('Sizes and quantities are invalid.');
    if (['bag', 'accessory', 'care'].includes(String(value.kind)) && size !== 'OS') throw new ApiError('This accessory uses one size (OS).');
    if (value.kind === 'footwear' && (Number(size) < 20 || Number(size) > 50)) throw new ApiError('Footwear sizes must be between 20 and 50.');
    if (value.kind === 'belt' && (Number(size) < 50 || Number(size) > 150)) throw new ApiError('Belt sizes must be between 50 and 150 cm.');
  }
  const prices = value.prices as Product['prices'];
  if (!prices || CURRENCIES.some((currency) => !Number.isSafeInteger(prices[currency]) || prices[currency] < 1 || prices[currency] > 100000000)) throw new ApiError('Enter a positive price for each currency.');
  const images = value.images ?? [];
  if (!Array.isArray(images) || images.length > 6 || images.some((url) => typeof url !== 'string' || !/^\/(images\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9._-]+|api\/media\/[a-zA-Z0-9._-]+)$/.test(url) || url.split('/').some(segment => segment === '..' || segment === '.'))) throw new ApiError('Use images uploaded to the boutique.');
  const image = Number(value.image ?? existing?.image ?? 4);
  if (!Number.isInteger(image) || image < 1 || image > 11) throw new ApiError('Invalid archive image.');
  const metadata: Partial<Product> = {};
  for (const [field, max] of [['accessoryType', 60], ['construction', 100], ['colorGroup', 70]] as const) {
    const raw = Object.hasOwn(value, field) ? value[field] : existing?.[field];
    if (raw !== undefined) { if (typeof raw !== 'string' || raw.length > max) throw new ApiError('Check the product metadata.'); if (raw.trim()) metadata[field] = raw.trim(); }
  }
  const style = Object.hasOwn(value, 'style') ? value.style : existing?.style;
  if (style !== undefined && style !== '') { if (!['loafers', 'lace-ups', 'boots', 'sneakers', 'monk-straps', 'slippers', 'sandals', 'pumps', 'flats', 'heels', 'mules'].includes(String(style))) throw new ApiError('Choose a valid shoe style.'); metadata.style = style as Product['style']; }
  const fit = Object.hasOwn(value, 'fit') ? value.fit : existing?.fit;
  if (fit !== undefined && fit !== '') { if (!['regular', 'generous', 'narrow'].includes(String(fit))) throw new ApiError('Choose a valid fit.'); metadata.fit = fit as Product['fit']; }
  const audience = Object.hasOwn(value, 'audience') ? value.audience : existing?.audience;
  if (audience !== undefined && audience !== '') { if (!['men', 'women', 'unisex'].includes(String(audience))) throw new ApiError('Choose a valid audience.'); metadata.audience = audience as Product['audience']; }
  if (value.kind !== 'footwear') { delete metadata.style; delete metadata.fit; delete metadata.construction; }
  if (value.kind === 'footwear') delete metadata.accessoryType;
  const edits = value.edits ?? existing?.edits;
  if (edits !== undefined) { if (!Array.isArray(edits) || edits.length > 3 || edits.some(edit => !['new', 'gifts', 'featured'].includes(edit))) throw new ApiError('Choose valid collection edits.'); metadata.edits = [...new Set(edits)] as Product['edits']; }
  return { id, name: localized(value.name, 'Name', 160), description: localized(value.description, 'Description'), material: localized(value.material, 'Materials', 400), color: localized(value.color, 'Color', 120), category: value.category as Product['category'], kind: value.kind as Product['kind'], badge: value.badge as Product['badge'], prices: { EUR: prices.EUR, USD: prices.USD, XOF: prices.XOF }, stock: { ...stock }, images, image, ...metadata, published: value.published === true, updatedAt: new Date().toISOString() };
}
export function snapshot(db: Database, revision: number, user: DemoUser | null, admin = false, guestIdentity: string | null = null): StoreSnapshot {
  const isAdmin = admin && user?.role === 'admin';
  const guestRecords = guestIdentity && /^guest:[a-f0-9]{32}$/.test(guestIdentity) && db.sessions.some((session) => session.userId === guestIdentity && session.expiresAt > Date.now())
    ? new Set(Object.entries(db.idempotency).filter(([key]) => key.startsWith(`${guestIdentity}:`)).map(([, id]) => id))
    : new Set<string>();
  return {
    products: db.products.filter((product) => isAdmin || product.published !== false), user,
    orders: db.orders.filter((order) => isAdmin || (!!user && order.customerId === user.id) || guestRecords.has(order.id)),
    bookings: db.bookings.filter((booking) => isAdmin || (user ? booking.customerId === user.id : booking.customerId === null && guestRecords.has(booking.id))),
    bookedSlots: db.bookings.map(({ date, time, location }) => ({ date, time, location })),
    announcements: db.announcements.slice(0, 12), notifications: user ? db.notifications.filter((notice) => notice.userId === user.id).slice(0, 50) : [],
    revision, pushPublicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || null, profile: customerProfile(db, user),
    returns: (db.returns ?? []).filter(value => isAdmin || (!!user && value.customerId === user.id) || guestRecords.has(value.orderId)),
    requests: (db.inquiries ?? []).filter(value => isAdmin || (!!user && value.customerId === user.id) || guestRecords.has(value.id)).map(value => ({ ...value, attachments: value.attachments?.map(attachment => ({ ...attachment, dataUrl: '' })) })),
  };
}
export function addNotification(db: Database, userId: string, title: Localized, body: Localized, url = '/app/updates') {
  db.notifications.unshift({ id: randomUUID(), userId, title, body, url, createdAt: new Date().toISOString(), read: false });
  db.notifications = db.notifications.slice(0, 2000);
}

export function placeOrder(db: Database, user: DemoUser | null, input: Record<string, unknown>, guestIdentity?: string): Order {
  if (!user && (!guestIdentity || !/^guest:[a-f0-9]{32}$/.test(guestIdentity) || !db.sessions.some((session) => session.userId === guestIdentity && session.expiresAt > Date.now()))) throw new ApiError('A valid checkout session is required.', 401, 'unauthorized');
  const owner = user?.id ?? guestIdentity!;
  const key = input.idempotencyKey;
  if (typeof key !== 'string' || !/^[a-zA-Z0-9-]{8,80}$/.test(key)) throw new ApiError('A checkout reference is required.');
  const prior = db.idempotency[`${owner}:${key}`];
  if (prior) return db.orders.find((order) => order.id === prior)!;
  const cart = input.cart as CartLine[];
  const currency = input.currency as Currency;
  const payment = input.payment as PaymentMethod;
  const recipient = deliveryDetails(input.recipient);
  const billingRecipient = input.billingRecipient === undefined ? undefined : deliveryDetails(input.billingRecipient);
  let gift: Order['gift'];
  if (input.gift !== undefined) {
    if (!input.gift || typeof input.gift !== 'object' || Array.isArray(input.gift)) throw new ApiError('Please check your gift preferences.');
    const value = input.gift as Record<string, unknown>;
    if (typeof value.wrap !== 'boolean' || typeof value.message !== 'string' || value.message.length > 300) throw new ApiError('Please keep your gift message within 300 characters.');
    gift = { wrap: value.wrap, message: value.wrap ? value.message.trim() : '' };
  }
  if (!CURRENCIES.includes(currency) || !isPaymentAvailable(payment, recipient.country)) throw new ApiError('This payment method is unavailable in the selected country.');
  if (!Array.isArray(cart) || !cart.length || cart.length > 50) throw new ApiError('Your bag is empty or invalid.');
  const seen = new Set<string>();
  const lines = cart.map((line) => {
    if (!line || typeof line.productId !== 'string' || typeof line.size !== 'string' || !Number.isSafeInteger(line.quantity) || line.quantity < 1 || line.quantity > 10000) throw new ApiError('Please review your bag.');
    const product = db.products.find((product) => product.id === line.productId && product.published !== false);
    const variant = `${line.productId}:${line.size}`;
    if (!product || !Object.hasOwn(product.stock, line.size) || product.stock[line.size] < line.quantity || seen.has(variant)) throw new ApiError('Availability has changed. Please review your bag.', 409, 'stockChanged');
    seen.add(variant);
    return { productId: product.id, size: line.size, quantity: line.quantity, unitPrice: product.prices[currency], product: structuredClone(product) };
  });
  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  const shipping = shippingCost(subtotal, currency, payment);
  const id = `DEMO-MG-${randomUUID().slice(0, 8).toUpperCase()}`;
  const createdAt = new Date().toISOString();
  const order: Order = { id, createdAt, customerId: user?.id ?? null, currency, lines, subtotal, shipping, total: subtotal + shipping, payment, recipient, status: 'confirmed', events: [{ status: 'confirmed', at: createdAt }], tracking: payment === 'pickup' ? null : `SIM-${id.slice(8)}`, paymentReference: payment === 'pickup' ? 'DEMO-PAY-ON-PICKUP' : `DEMO-PAY-${randomUUID().slice(0, 8).toUpperCase()}` };
  order.checkoutReference = key;
  if (billingRecipient) order.billingRecipient = billingRecipient;
  if (gift) order.gift = gift;
  for (const line of lines) {
    const product = db.products.find((product) => product.id === line.productId)!;
    product.stock = { ...product.stock, [line.size]: product.stock[line.size] - line.quantity };
    product.updatedAt = new Date().toISOString();
  }
  db.orders.unshift(order);
  db.idempotency[`${owner}:${key}`] = id;
  if (user) addNotification(db, user.id, { en: 'Your order is confirmed', fr: 'Votre commande est confirmée' }, { en: `${id} · We are preparing your demo selection.`, fr: `${id} · Nous préparons votre sélection de démonstration.` });
  return order;
}

export function changeOrderStatus(db: Database, id: string, status: OrderStatus): Order {
  if (!ORDER_STATUSES.includes(status)) throw new ApiError('Select a valid order status.');
  const order = db.orders.find((order) => order.id === id);
  if (!order) throw new ApiError('Order not found.', 404);
  const current = order.status ?? 'confirmed';
  if (current === status) return order;
  const transitions: Record<OrderStatus, OrderStatus[]> = { confirmed: ['preparing', 'cancelled'], preparing: ['shipped', 'cancelled'], shipped: ['delivered'], delivered: [], cancelled: [] };
  if (!transitions[current].includes(status)) throw new ApiError('That order transition is unavailable.', 409);
  if (status === 'cancelled') for (const line of order.lines) {
    const product = db.products.find((product) => product.id === line.productId);
    if (product) { product.stock = { ...product.stock, [line.size]: (product.stock[line.size] ?? 0) + line.quantity }; product.updatedAt = new Date().toISOString(); }
  }
  order.status = status;
  order.events = [...(order.events ?? []), { status, at: new Date().toISOString() }];
  const labels: Record<OrderStatus, Localized> = { confirmed: { en: 'Order confirmed', fr: 'Commande confirmée' }, preparing: { en: 'Your order is being prepared', fr: 'Votre commande est en préparation' }, shipped: { en: 'Your order is on its way', fr: 'Votre commande est expédiée' }, delivered: { en: 'Your order has arrived', fr: 'Votre commande est livrée' }, cancelled: { en: 'Order cancelled', fr: 'Commande annulée' } };
  if (order.customerId) addNotification(db, order.customerId, labels[status], { en: `${order.id} · Demo order update.`, fr: `${order.id} · Suivi de votre commande de démonstration.` });
  return order;
}
export function createBooking(db: Database, user: DemoUser | null, input: unknown, guestIdentity?: string) {
  if (!user && (!guestIdentity || !/^guest:[a-f0-9]{32}$/.test(guestIdentity) || !db.sessions.some((session) => session.userId === guestIdentity && session.expiresAt > Date.now()))) throw new ApiError('A valid appointment session is required.', 401, 'unauthorized');
  const details = input as BookingDetails;
  if (!details || ['name', 'email', 'date', 'time', 'service', 'location'].some((field) => typeof (details as unknown as Record<string, unknown>)[field] !== 'string') || !validEmail(details.email)) throw new ApiError('Please check your appointment details.');
  const errors = validateBooking(details, db.bookings);
  if (Object.keys(errors).length) throw new ApiError('That appointment is unavailable. Please select another time.', 409, 'slotTaken');
  const booking = { name: details.name.trim(), email: details.email.trim().toLowerCase(), date: details.date, time: details.time, service: details.service, location: details.location, id: `DEMO-AT-${randomUUID().slice(0, 8).toUpperCase()}`, customerId: user?.id ?? null };
  db.bookings.push(booking);
  if (!user) db.idempotency[`${guestIdentity}:booking:${booking.id}`] = booking.id;
  return booking;
}
export function createAnnouncement(db: Database, input: Record<string, unknown>): Announcement {
  const announcement: Announcement = { id: randomUUID(), title: localized(input.title, 'Title', 120), body: localized(input.body, 'Message', 500), createdAt: new Date().toISOString() };
  if (input.productId) {
    if (!db.products.some((product) => product.id === input.productId && product.published !== false)) throw new ApiError('Choose a published product.');
    announcement.productId = String(input.productId);
  }
  db.announcements.unshift(announcement);
  db.announcements = db.announcements.slice(0, 30);
  for (const user of db.users.filter((user) => user.role !== 'admin')) addNotification(db, user.id, announcement.title, announcement.body, announcement.productId ? `/app/shop?product=${announcement.productId}` : '/app/shop');
  return announcement;
}

function validGuest(db: Database, identity?: string | null): identity is string {
  return !!identity && /^guest:[a-f0-9]{32}$/.test(identity) && db.sessions.some(value => value.userId === identity && value.expiresAt > Date.now());
}
function guestOwns(db: Database, identity: string | null | undefined, id: string): boolean {
  return validGuest(db, identity) && Object.entries(db.idempotency).some(([key, value]) => key.startsWith(`${identity}:`) && value === id);
}
export function accessibleOrder(db: Database, user: DemoUser | null, guestIdentity: string | null | undefined, id: unknown): Order {
  const order = typeof id === 'string' ? db.orders.find(value => value.id === id) : undefined;
  if (!order || !(user?.role === 'admin' || (!!user && order.customerId === user.id) || guestOwns(db, guestIdentity, order.id))) throw new ApiError('Order not found in this session.', 404, 'notFound');
  return order;
}
export function lookupCustomerOrder(db: Database, reference: unknown, email: unknown, guestIdentity: string): Order {
  if (!validGuest(db, guestIdentity)) throw new ApiError('A valid order session is required.', 401, 'unauthorized');
  const normalized = typeof reference === 'string' ? reference.trim().toUpperCase() : '';
  const address = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const order = normalized.length <= 80 && validEmail(address) ? db.orders.find(value => (value.id.toUpperCase() === normalized || value.tracking?.toUpperCase() === normalized) && value.recipient.email.toLowerCase() === address) : undefined;
  if (!order) throw new ApiError('No matching order was found. Check both details.', 404, 'orderNotFound');
  db.idempotency[`${guestIdentity}:lookup:${order.id}`] = order.id;
  return order;
}
export function requestCustomerReturn(db: Database, user: DemoUser | null, guestIdentity: string | null, input: Record<string, unknown>): ReturnRequest {
  const order = accessibleOrder(db, user, guestIdentity, input.orderId);
  const owner = user?.id ?? guestIdentity;
  const key = typeof input.idempotencyKey === 'string' && /^[a-zA-Z0-9-]{8,80}$/.test(input.idempotencyKey) ? `${owner}:return:${input.idempotencyKey}` : '';
  if (key && db.idempotency[key]) {
    const previous = db.returns?.find(value => value.id === db.idempotency[key] && value.orderId === order.id);
    if (previous) return previous;
  }
  if (order.status !== 'delivered') throw new ApiError('A return can be requested once your demo order is delivered.', 409, 'returnUnavailable');
  if (!Array.isArray(input.lines) || !input.lines.length || input.lines.length > order.lines.length) throw new ApiError('Select the items you want to return.');
  const lines: ReturnLine[] = [];
  let refundAmount = 0;
  for (const raw of input.lines) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new ApiError('Check your return items.');
    const value = raw as Record<string, unknown>;
    const original = order.lines.find(line => line.productId === value.productId && line.size === value.size);
    if (!original || !Number.isSafeInteger(value.quantity) || (value.quantity as number) < 1 || !['size', 'style', 'damaged', 'wrong-item', 'other'].includes(String(value.reason)) || lines.some(line => line.productId === value.productId && line.size === value.size)) throw new ApiError('Check your return items.');
    const reserved = (db.returns ?? []).filter(previous => previous.orderId === order.id && previous.status !== 'rejected').flatMap(previous => previous.lines).filter(line => line.productId === original.productId && line.size === original.size).reduce((sum, line) => sum + line.quantity, 0);
    if ((value.quantity as number) + reserved > original.quantity) throw new ApiError('This quantity has already been included in a return.', 409, 'returnQuantity');
    lines.push({ productId: original.productId, size: original.size, quantity: value.quantity as number, reason: value.reason as ReturnLine['reason'] });
    refundAmount += original.unitPrice * (value.quantity as number);
  }
  if (input.comment !== undefined && (typeof input.comment !== 'string' || input.comment.length > 1000)) throw new ApiError('Keep your return message within 1000 characters.');
  const createdAt = new Date().toISOString();
  const record: ReturnRequest = { id: `DEMO-RET-${randomUUID().slice(0, 8).toUpperCase()}`, orderId: order.id, customerId: order.customerId, lines, refundAmount, currency: order.currency, status: 'requested', createdAt, updatedAt: createdAt, comment: typeof input.comment === 'string' ? input.comment.trim() : '', events: [{ status: 'requested', at: createdAt }] };
  db.returns ??= []; db.returns.unshift(record);
  if (key) db.idempotency[key] = record.id;
  if (order.customerId) addNotification(db, order.customerId, { en: 'Return request received', fr: 'Demande de retour reçue' }, { en: `${record.id} · Your demonstration return is being reviewed.`, fr: `${record.id} · Votre retour de démonstration est en cours d’examen.` }, '/app/orders');
  return record;
}
export function updateReturnStatus(db: Database, id: unknown, status: unknown, note?: unknown): ReturnRequest {
  const record = db.returns?.find(value => value.id === id);
  if (!record) throw new ApiError('Return not found.', 404, 'notFound');
  const next = status as ReturnStatus;
  const transitions: Record<ReturnStatus, ReturnStatus[]> = { requested: ['approved', 'rejected'], approved: ['received', 'rejected'], received: ['refunded'], refunded: [], rejected: [] };
  if (note !== undefined && (typeof note !== 'string' || note.length > 1000)) throw new ApiError('Keep your note within 1000 characters.');
  if (next === record.status) { if (typeof note === 'string') record.note = note.trim(); return record; }
  if (!transitions[record.status].includes(next)) throw new ApiError('This return transition is unavailable.', 409, 'returnTransition');
  if (next === 'received') for (const line of record.lines) {
    const product = db.products.find(value => value.id === line.productId);
    if (product) { product.stock = { ...product.stock, [line.size]: (product.stock[line.size] ?? 0) + line.quantity }; product.updatedAt = new Date().toISOString(); }
  }
  record.status = next; record.updatedAt = new Date().toISOString();
  if (typeof note === 'string') record.note = note.trim();
  record.events.push({ status: next, at: record.updatedAt });
  if (record.customerId) addNotification(db, record.customerId, { en: 'Your return has been updated', fr: 'Votre retour a été mis à jour' }, { en: `${record.id} · ${next === 'refunded' ? 'The demonstration refund is complete. No money was moved.' : 'Check your return progress in your account.'}`, fr: `${record.id} · ${next === 'refunded' ? 'Le remboursement simulé est terminé. Aucun montant n’a été transféré.' : 'Consultez le suivi de votre retour dans votre compte.'}` }, '/app/orders');
  return record;
}

const REQUEST_KINDS: ServiceRequestKind[] = ['availability', 'contact', 'newsletter', 'bespoke', 'made-to-order', 'on-time', 'personalization', 'care', 'consultation'];
function requestAttachments(input: unknown): RequestAttachment[] | undefined {
  if (input === undefined) return undefined;
  if (!Array.isArray(input) || input.length > 2) throw new ApiError('Attach up to two photos.');
  return input.map(raw => {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new ApiError('Choose a valid photo.');
    const value = raw as Record<string, unknown>;
    if (typeof value.name !== 'string' || value.name.length > 150 || !['image/jpeg', 'image/png', 'image/webp'].includes(String(value.type)) || typeof value.dataUrl !== 'string') throw new ApiError('Choose JPEG, PNG or WebP photos.');
    const match = value.dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,([a-zA-Z0-9+/=]+)$/);
    if (!match || match[1] !== value.type) throw new ApiError('Choose a valid photo.');
    const bytes = Buffer.from(match[2], 'base64');
    const valid = value.type === 'image/jpeg' ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255 : value.type === 'image/png' ? bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) : bytes.subarray(0, 4).toString() === 'RIFF' && bytes.subarray(8, 12).toString() === 'WEBP';
    if (!valid || bytes.length > 600_000 || bytes.length < 12) throw new ApiError('Each photo must be a valid image smaller than 600 KB.');
    return { name: value.name.replace(/[\x00-\x1f]/g, '').slice(0, 150), type: value.type as RequestAttachment['type'], size: bytes.length, dataUrl: value.dataUrl };
  });
}
export function createServiceRequest(db: Database, user: DemoUser | null, guestIdentity: string | null, input: unknown): ServiceRequest {
  if (!user && !validGuest(db, guestIdentity)) throw new ApiError('A valid request session is required.', 401, 'unauthorized');
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new ApiError('Check your request details.');
  const value = input as Record<string, unknown>;
  if (!REQUEST_KINDS.includes(value.kind as ServiceRequestKind) || typeof value.email !== 'string' || !validEmail(value.email) || typeof value.name !== 'string' || value.name.trim().length > 100 || (value.kind !== 'newsletter' && value.kind !== 'availability' && value.name.trim().length < 2)) throw new ApiError('Enter your name and a valid email address.');
  if (!value.details || typeof value.details !== 'object' || Array.isArray(value.details) || Object.keys(value.details).length > 30 || JSON.stringify(value.details).length > 20_000 || Object.entries(value.details).some(([key, text]) => key.length > 80 || typeof text !== 'string' || text.length > 3000)) throw new ApiError('Please shorten your request details.');
  const details = Object.fromEntries(Object.entries(value.details as Record<string, string>).map(([key, text]) => [key, text.trim()]));
  const productId = typeof value.productId === 'string' ? value.productId : undefined;
  if (value.productId !== undefined && (!productId || !db.products.some(product => product.id === productId && product.published !== false))) throw new ApiError('Select an available product.');
  if (value.kind === 'availability' && (!productId || (details.size && !Object.hasOwn(db.products.find(product => product.id === productId)!.stock, details.size)))) throw new ApiError('Select a valid product and size.');
  const attachments = requestAttachments(value.attachments);
  const createdAt = new Date().toISOString();
  const record: ServiceRequest = { id: `DEMO-REQ-${randomUUID().slice(0, 8).toUpperCase()}`, kind: value.kind as ServiceRequestKind, name: value.name.trim(), email: value.email.trim().toLowerCase(), locale: value.locale === 'fr' ? 'fr' : 'en', details, ...(productId ? { productId } : {}), ...(attachments?.length ? { attachments } : {}), status: 'received', customerId: user?.id ?? null, createdAt, updatedAt: createdAt };
  db.inquiries ??= []; db.inquiries.unshift(record);
  if (guestIdentity) db.idempotency[`${guestIdentity}:request:${record.id}`] = record.id;
  return record;
}
export function ownServiceRequest(db: Database, user: DemoUser | null, guestIdentity: string | null, id: unknown): ServiceRequest {
  const record = db.inquiries?.find(value => value.id === id);
  if (!record || !(user?.role === 'admin' || (!!user && record.customerId === user.id) || guestOwns(db, guestIdentity, record.id))) throw new ApiError('Request not found.', 404, 'notFound');
  return record;
}
export function updateServiceRequest(db: Database, id: unknown, status: unknown, note?: unknown): ServiceRequest {
  const record = db.inquiries?.find(value => value.id === id);
  if (!record) throw new ApiError('Request not found.', 404, 'notFound');
  if (!['received', 'reviewing', 'confirmed', 'completed', 'closed'].includes(String(status))) throw new ApiError('Choose a valid request status.');
  if (note !== undefined && (typeof note !== 'string' || note.length > 1000)) throw new ApiError('Keep your note within 1000 characters.');
  record.status = status as ServiceRequestStatus; record.updatedAt = new Date().toISOString();
  if (typeof note === 'string') record.note = note.trim();
  if (record.customerId) addNotification(db, record.customerId, { en: 'Your Goya request has been updated', fr: 'Votre demande Goya a été mise à jour' }, { en: `${record.id} · View the latest demonstration response in your account.`, fr: `${record.id} · Consultez la réponse de démonstration dans votre compte.` }, '/app/updates');
  return record;
}
export function processAvailability(db: Database, product: Product) {
  for (const record of db.inquiries ?? []) if (record.kind === 'availability' && record.productId === product.id && ['received', 'reviewing'].includes(record.status) && product.published !== false && (record.details.size ? (product.stock[record.details.size] ?? 0) > 0 : Object.values(product.stock).some(quantity => quantity > 0))) {
    record.status = 'confirmed'; record.updatedAt = new Date().toISOString();
    record.note = record.locale === 'fr' ? 'Cette création est à nouveau disponible dans le stock de démonstration.' : 'This creation is available again in the demonstration inventory.';
    if (record.customerId) addNotification(db, record.customerId, { en: 'Your size is available', fr: 'Votre pointure est disponible' }, { en: `${product.name.en} · Demo stock update.`, fr: `${product.name.fr} · Mise à jour du stock de démonstration.` }, `/product/${product.id}`);
  }
}
