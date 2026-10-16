export type Locale = 'en' | 'fr';
export type Currency = 'EUR' | 'USD' | 'XOF';
export type Category = 'all' | 'men' | 'women' | 'accessories';
export type Country = 'BJ' | 'FR' | 'SN' | 'US' | 'GB';
export type PaymentMethod = 'card' | 'apple' | 'mobile' | 'pickup';
export type AtelierLocation = 'cotonou' | 'paris' | 'dakar';
export type AtelierService = 'polish' | 'patina' | 'heels' | 'restoration';
export type Localized = Record<Locale, string>;
export type PriceBook = Record<Currency, number>;

export interface Product {
  id: string;
  name: Localized;
  description: Localized;
  material: Localized;
  color: Localized;
  image: number;
  images?: string[];
  published?: boolean;
  updatedAt?: string;
  category: Exclude<Category, 'all'>;
  kind: 'footwear' | 'bag' | 'belt';
  badge: 'signature' | 'limited' | 'atelierEdition';
  prices: PriceBook;
  stock: Readonly<Record<string, number>>;
}

export interface CartLine {
  productId: string;
  size: string;
  quantity: number;
}

export interface ShippingDetails {
  name: string;
  email: string;
  address: string;
  city: string;
  country: Country;
}

export interface OrderLine extends CartLine {
  unitPrice: number;
  product?: Product;
}

export type OrderStatus = 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';
export interface OrderEvent { status: OrderStatus; at: string }

export interface Order {
  id: string;
  tracking: string | null;
  createdAt: string;
  customerId: string | null;
  currency: Currency;
  lines: OrderLine[];
  subtotal: number;
  shipping: number;
  total: number;
  payment: PaymentMethod;
  recipient: ShippingDetails;
  status?: OrderStatus;
  events?: OrderEvent[];
  paymentReference?: string;
}

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  provider: 'google' | 'apple' | 'email';
  role?: 'customer' | 'admin';
}

export interface Announcement { id: string; title: Localized; body: Localized; createdAt: string; productId?: string }
export interface ShopNotification { id: string; userId: string; title: Localized; body: Localized; url: string; createdAt: string; read: boolean }
export interface StoreSnapshot {
  products: Product[];
  user: DemoUser | null;
  orders: Order[];
  bookings: Booking[];
  bookedSlots: Pick<Booking, 'date' | 'time' | 'location'>[];
  announcements: Announcement[];
  notifications: ShopNotification[];
  revision: number;
  pushPublicKey: string | null;
}

export interface BookingDetails {
  name: string;
  email: string;
  service: AtelierService;
  location: AtelierLocation;
  date: string;
  time: string;
}

export interface Booking extends BookingDetails {
  id: string;
  customerId: string | null;
}

export type Overlay =
  | { kind: 'cart' }
  | { kind: 'quick'; productId: string }
  | { kind: 'checkout'; orderId?: string }
  | { kind: 'auth' }
  | { kind: 'booking'; bookingId?: string }
  | { kind: 'search' }
  | { kind: 'menu' }
  | { kind: 'info'; topic: 'shipping' | 'care' | 'privacy' }
  | null;
