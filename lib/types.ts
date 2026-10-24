export type Locale = 'en' | 'fr';
export type SiteLocale = 'en' | 'it' | 'fr' | 'de' | 'es' | 'ja' | 'ar';
export type Currency = 'EUR' | 'USD' | 'XOF' | 'GBP' | 'JPY' | 'AED' | 'CHF' | 'CAD' | 'SAR' | 'KWD' | 'TRY' | 'CNY';
export type BaseCurrency = 'EUR' | 'USD' | 'XOF';
export type Category = 'all' | 'men' | 'women' | 'accessories';
export type ShoeType = 'all' | 'loafers' | 'lace-ups' | 'boots' | 'sneakers' | 'monk-straps' | 'slippers' | 'sandals' | 'pumps' | 'flats' | 'heels' | 'mules';
export type Country = 'AL' | 'AD' | 'AT' | 'BE' | 'BY' | 'BA' | 'BG' | 'VA' | 'CY' | 'HR' | 'DK' | 'EE' | 'FI' | 'FR' | 'DE' | 'GR' | 'IE' | 'IS' | 'IT' | 'KZ' | 'LV' | 'LI' | 'LT' | 'LU' | 'MK' | 'MT' | 'MD' | 'MC' | 'ME' | 'NO' | 'NL' | 'PL' | 'PT' | 'GB' | 'CZ' | 'RO' | 'SM' | 'RS' | 'SK' | 'SI' | 'ES' | 'SE' | 'CH' | 'UA' | 'HU' | 'CA' | 'US' | 'SA' | 'BH' | 'AE' | 'IL' | 'KW' | 'OM' | 'QA' | 'TR' | 'YE' | 'AM' | 'AZ' | 'BN' | 'CN' | 'PH' | 'JP' | 'GI' | 'HK' | 'IN' | 'ID' | 'KR' | 'LB' | 'MO' | 'MY' | 'PK' | 'SG' | 'TW' | 'TH' | 'TM' | 'VN' | 'AR' | 'BR' | 'CL' | 'CO' | 'CR' | 'DO' | 'EC' | 'GF' | 'MX' | 'PY' | 'PE' | 'UY' | 'VE' | 'AU' | 'NC' | 'NZ' | 'DZ' | 'EG' | 'MA' | 'NG' | 'ZA' | 'TN' | 'BJ' | 'SN' | 'WW';
export type PaymentMethod = 'card' | 'apple' | 'paypal' | 'klarna' | 'scalapay' | 'mobile' | 'pickup';
export type AtelierLocation = 'cotonou' | 'paris' | 'dakar';
export type AtelierService = 'polish' | 'patina' | 'heels' | 'restoration';
export type Localized = Record<Locale, string>;
export type PriceBook = Record<BaseCurrency, number> & Partial<Record<Exclude<Currency, BaseCurrency>, number>>;

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
  kind: 'footwear' | 'bag' | 'belt' | 'accessory' | 'care';
  style?: Exclude<ShoeType, 'all'>;
  accessoryType?: string;
  audience?: 'men' | 'women' | 'unisex';
  construction?: string;
  edits?: ('new' | 'gifts' | 'featured')[];
  colorGroup?: string;
  fit?: 'regular' | 'generous' | 'narrow';
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
  postalCode?: string;
  phone?: string;
  address2?: string;
  company?: string;
}

export interface SavedAddress extends ShippingDetails { id: string; label?: string; isDefault?: boolean }
export interface AccountProfile {
  phone: string;
  birthDate: string;
  title: '' | 'mr' | 'ms' | 'mx';
  preferredLocale: Locale;
  newsletter: boolean;
  personalization?: boolean;
  addresses: SavedAddress[];
  wishlist: string[];
}
export type CatalogSort = 'recommended' | 'priceAsc' | 'priceDesc';
export interface CatalogFilters { sizes: string[]; colors: string[]; materials: string[]; styles: ShoeType[]; genders?: Category[]; constructions?: string[]; accessoryTypes?: string[] }

export interface OrderLine extends CartLine {
  unitPrice: number;
  originalUnitPrice?: number;
  product?: Product;
}

export interface CartQuote {
  promoCode: string | null;
  lines: OrderLine[];
  originalSubtotal: number;
  discount: number;
  subtotal: number;
  shipping: number;
  total: number;
}

export type OrderStatus = 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';
export interface OrderEvent { status: OrderStatus; at: string }

export interface Order {
  checkoutReference?: string;
  id: string;
  tracking: string | null;
  createdAt: string;
  customerId: string | null;
  currency: Currency;
  lines: OrderLine[];
  subtotal: number;
  originalSubtotal?: number;
  discount?: number;
  promoCode?: string;
  shipping: number;
  total: number;
  payment: PaymentMethod;
  recipient: ShippingDetails;
  status?: OrderStatus;
  events?: OrderEvent[];
  paymentReference?: string;
  billingRecipient?: ShippingDetails;
  gift?: { wrap: boolean; message: string };
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
  profile?: AccountProfile | null;
  returns?: import('./experience-types').ReturnRequest[];
  requests?: import('./experience-types').ServiceRequest[];
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
  | { kind: 'region' }
  | { kind: 'language' }
  | { kind: 'sizes'; productId: string; size?: string }
  | { kind: 'productInfo'; productId: string; section: 'details' | 'shipping' | 'care' }
  | { kind: 'recovery' }
  | { kind: 'sizeGuide'; productId?: string }
  | { kind: 'fit'; productId: string }
  | { kind: 'newsletter' }
  | { kind: 'availability'; productId: string; size?: string }
  | { kind: 'filters'; category?: Category; style?: ShoeType; accessoryType?: string; accessoryAudience?: 'men' | 'women'; edit?: 'collection' | 'new' | 'gifts' | 'featured' | 'search'; selection?: string[] }
  | null;
