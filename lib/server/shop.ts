import { randomUUID } from 'node:crypto';
import { CURRENCIES, shippingCost, validEmail, validateBooking, validateShipping, isPaymentAvailable } from '../commerce';
import type { Announcement, BookingDetails, CartLine, Currency, DemoUser, Localized, Order, OrderStatus, PaymentMethod, Product, ShippingDetails, StoreSnapshot } from '../types';
import type { Database } from './database';
import { ApiError } from './security';

export const ORDER_STATUSES: OrderStatus[] = ['confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'];
export function localized(value: unknown, label: string, max = 2000): Localized {
  const object = value as Record<string, unknown> | null;
  if (!object || typeof object.en !== 'string' || typeof object.fr !== 'string' || !object.en.trim() || !object.fr.trim() || object.en.length > max || object.fr.length > max) throw new ApiError(`${label}: English and French text are required.`);
  return { en: object.en.trim(), fr: object.fr.trim() };
}
export function validateProduct(value: Record<string, unknown>, existing?: Product): Product {
  const id = existing?.id ?? (typeof value.id === 'string' ? value.id : randomUUID());
  if (!/^[a-z0-9-]{3,70}$/.test(id)) throw new ApiError('Use a product reference with letters, numbers and hyphens.');
  if (!['men', 'women', 'accessories'].includes(String(value.category)) || !['footwear', 'belt', 'bag'].includes(String(value.kind)) || !['signature', 'limited', 'atelierEdition'].includes(String(value.badge))) throw new ApiError('Select a valid product category and type.');
  const stock = value.stock as Record<string, number>;
  if (!stock || typeof stock !== 'object' || Array.isArray(stock) || !Object.keys(stock).length || Object.keys(stock).length > 50) throw new ApiError('Add at least one size and quantity.');
  for (const [size, quantity] of Object.entries(stock)) {
    if (!/^(OS|[0-9]{2,3}(\.[05])?)$/.test(size) || !Number.isSafeInteger(quantity) || quantity < 0 || quantity > 10000) throw new ApiError('Sizes and quantities are invalid.');
    if (value.kind === 'bag' && size !== 'OS') throw new ApiError('Bags use one size (OS).');
    if (value.kind === 'footwear' && (Number(size) < 20 || Number(size) > 50)) throw new ApiError('Footwear sizes must be between 20 and 50.');
    if (value.kind === 'belt' && (Number(size) < 50 || Number(size) > 150)) throw new ApiError('Belt sizes must be between 50 and 150 cm.');
  }
  const prices = value.prices as Product['prices'];
  if (!prices || CURRENCIES.some((currency) => !Number.isSafeInteger(prices[currency]) || prices[currency] < 1 || prices[currency] > 100000000)) throw new ApiError('Enter a positive price for each currency.');
  const images = value.images ?? [];
  if (!Array.isArray(images) || images.length > 6 || images.some((url) => typeof url !== 'string' || !/^\/(images\/[a-zA-Z0-9._-]+|api\/media\/[a-zA-Z0-9._-]+)$/.test(url))) throw new ApiError('Use images uploaded to the boutique.');
  const image = Number(value.image ?? existing?.image ?? 4);
  if (!Number.isInteger(image) || image < 1 || image > 11) throw new ApiError('Invalid archive image.');
  return { id, name: localized(value.name, 'Name', 160), description: localized(value.description, 'Description'), material: localized(value.material, 'Materials', 400), color: localized(value.color, 'Color', 120), category: value.category as Product['category'], kind: value.kind as Product['kind'], badge: value.badge as Product['badge'], prices: { EUR: prices.EUR, USD: prices.USD, XOF: prices.XOF }, stock: { ...stock }, images, image, published: value.published === true, updatedAt: new Date().toISOString() };
}
export function snapshot(db: Database, revision: number, user: DemoUser | null, admin = false): StoreSnapshot {
  return {
    products: user ? db.products.filter((product) => admin || product.published !== false) : [], user,
    orders: user ? db.orders.filter((order) => admin || order.customerId === user.id) : [],
    bookings: user ? db.bookings.filter((booking) => admin || booking.customerId === user.id) : [],
    bookedSlots: user ? db.bookings.map(({ date, time, location }) => ({ date, time, location })) : [],
    announcements: user ? db.announcements.slice(0, 12) : [], notifications: user ? db.notifications.filter((notice) => notice.userId === user.id).slice(0, 50) : [],
    revision, pushPublicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || null,
  };
}
export function addNotification(db: Database, userId: string, title: Localized, body: Localized, url = '/app/updates') {
  db.notifications.unshift({ id: randomUUID(), userId, title, body, url, createdAt: new Date().toISOString(), read: false });
  db.notifications = db.notifications.slice(0, 2000);
}

export function placeOrder(db: Database, user: DemoUser, input: Record<string, unknown>): Order {
  const key = input.idempotencyKey;
  if (typeof key !== 'string' || !/^[a-zA-Z0-9-]{8,80}$/.test(key)) throw new ApiError('A checkout reference is required.');
  const prior = db.idempotency[`${user.id}:${key}`];
  if (prior) return db.orders.find((order) => order.id === prior)!;
  const cart = input.cart as CartLine[];
  const currency = input.currency as Currency;
  const payment = input.payment as PaymentMethod;
  const recipient = input.recipient as ShippingDetails;
  if (!recipient || ['name', 'email', 'address', 'city', 'country'].some((field) => typeof (recipient as unknown as Record<string, unknown>)[field] !== 'string') || Object.keys(validateShipping(recipient)).length) throw new ApiError('Please check your delivery details.');
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
  const order: Order = { id, createdAt, customerId: user.id, currency, lines, subtotal, shipping, total: subtotal + shipping, payment, recipient: { name: recipient.name.trim(), email: recipient.email.trim().toLowerCase(), address: recipient.address.trim(), city: recipient.city.trim(), country: recipient.country }, status: 'confirmed', events: [{ status: 'confirmed', at: createdAt }], tracking: payment === 'pickup' ? null : `SIM-${id.slice(8)}`, paymentReference: payment === 'pickup' ? 'DEMO-PAY-ON-PICKUP' : `DEMO-PAY-${randomUUID().slice(0, 8).toUpperCase()}` };
  for (const line of lines) {
    const product = db.products.find((product) => product.id === line.productId)!;
    product.stock = { ...product.stock, [line.size]: product.stock[line.size] - line.quantity };
    product.updatedAt = new Date().toISOString();
  }
  db.orders.unshift(order);
  db.idempotency[`${user.id}:${key}`] = id;
  addNotification(db, user.id, { en: 'Your order is confirmed', fr: 'Votre commande est confirmée' }, { en: `${id} · We are preparing your demo selection.`, fr: `${id} · Nous préparons votre sélection de démonstration.` });
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
export function createBooking(db: Database, user: DemoUser, input: unknown) {
  const details = input as BookingDetails;
  if (!details || ['name', 'email', 'date', 'time', 'service', 'location'].some((field) => typeof (details as unknown as Record<string, unknown>)[field] !== 'string') || !validEmail(details.email)) throw new ApiError('Please check your appointment details.');
  const errors = validateBooking(details, db.bookings);
  if (Object.keys(errors).length) throw new ApiError('That appointment is unavailable. Please select another time.', 409);
  const booking = { name: details.name.trim(), email: details.email.trim().toLowerCase(), date: details.date, time: details.time, service: details.service, location: details.location, id: `DEMO-AT-${randomUUID().slice(0, 8).toUpperCase()}`, customerId: user.id };
  db.bookings.push(booking);
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
