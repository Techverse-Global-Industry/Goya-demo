import type { Product, AtelierLocation, AtelierService, Country, PaymentMethod } from './types';
import { ARCHIVE_PRODUCTS } from './archive-catalog';

// Demo listings describe the supplied photographs. Prices and stock are illustrative.
export const PRODUCTS: readonly Product[] = [
  { id: 'francesco', image: 3, category: 'men', kind: 'footwear', badge: 'signature',
    name: {"en": "Le Francesco Loafer", "fr": "Le Mocassin Francesco"},
    description: {"en": "A black loafer with a colorful patterned strap and a low heel.", "fr": "Un mocassin noir à bride colorée et petit talon."},
    material: {"en": "Leather upper · Patterned strap", "fr": "Tige en cuir · Bride à motif"}, color: {"en": "Black with a multicolor accent", "fr": "Noir et détail multicolore"},
    prices: { EUR: 42000, USD: 45500, XOF: 275000 }, stock: { '39': 2, '40': 4, '41': 6, '42': 5, '43': 3, '44': 2, '45': 1, '46': 0 },
  },
  { id: 'kanvo-oxford', image: 7, category: 'men', kind: 'footwear', badge: 'limited',
    name: {"en": "Kanvo Lace-Up Sneaker", "fr": "La Basket Kanvo à Lacets"},
    description: {"en": "A lace-up sneaker with black trim and a vivid geometric pattern.", "fr": "Une basket à lacets, aux finitions noires et au motif géométrique coloré."},
    material: {"en": "Patterned upper · Black laces", "fr": "Tige à motif · Lacets noirs"}, color: {"en": "Black & multicolor", "fr": "Noir et multicolore"},
    prices: { EUR: 49000, USD: 53500, XOF: 320000 }, stock: { '39': 1, '40': 2, '41': 4, '42': 3, '43': 2, '44': 1, '45': 0, '46': 1 },
  },
  { id: 'raffia-monk', image: 6, category: 'women', kind: 'footwear', badge: 'atelierEdition',
    name: {"en": "Rouge Sculpted Heel", "fr": "Le Talon Sculpté Rouge"},
    description: {"en": "A red sculpted heel with a flower-shaped upper and a gold-tone heel.", "fr": "Un soulier rouge à empeigne sculptée en fleur et talon doré."},
    material: {"en": "Sculpted upper · Gold-tone heel", "fr": "Empeigne sculptée · Talon doré"}, color: {"en": "Red & gold", "fr": "Rouge et or"},
    prices: { EUR: 46500, USD: 50500, XOF: 305000 }, stock: { '39': 2, '40': 3, '41': 2, '42': 4, '43': 2, '44': 2, '45': 1, '46': 1 },
  },
  { id: 'cotonou-tote', image: 5, category: 'women', kind: 'footwear', badge: 'signature',
    name: {"en": "Cotonou Patterned Pump", "fr": "L’Escarpin à Motif Cotonou"},
    description: {"en": "An occasion pump with a soft multicolor pattern and a contrasting block heel.", "fr": "Un escarpin de cérémonie au motif multicolore et au talon carré contrastant."},
    material: {"en": "Patterned upper · Block heel", "fr": "Tige à motif · Talon carré"}, color: {"en": "Cream & multicolor", "fr": "Crème et multicolore"},
    prices: { EUR: 68000, USD: 73500, XOF: 445000 }, stock: { '39': 2, '40': 3, '41': 4, '42': 3, '43': 2, '44': 1, '45': 1, '46': 0 },
  },
  { id: 'calfskin-belt', image: 9, category: 'women', kind: 'footwear', badge: 'limited',
    name: {"en": "Contrast Heel Ankle Boot", "fr": "La Bottine à Talon Contrasté"},
    description: {"en": "A cream ankle boot with black trim, elastic side panels and a slim heel.", "fr": "Une bottine crème aux finitions noires, empiècements élastiques et talon fin."},
    material: {"en": "Smooth upper · Elastic side panels", "fr": "Tige lisse · Empiècements élastiques"}, color: {"en": "Cream & black", "fr": "Crème et noir"},
    prices: { EUR: 15500, USD: 17000, XOF: 102000 }, stock: { '39': 2, '40': 3, '41': 4, '42': 3, '43': 2, '44': 1, '45': 1, '46': 0 },
  },
  { id: 'kente-derby', image: 10, category: 'men', kind: 'footwear', badge: 'atelierEdition',
    name: {"en": "Kente Tassel Slip-On", "fr": "Le Mocassin Kente à Glands"},
    description: {"en": "A white slip-on with tassels, a colorful patterned panel and a casual sole.", "fr": "Un mocassin blanc à glands, panneau à motif coloré et semelle décontractée."},
    material: {"en": "Patterned panel · Tassel detail", "fr": "Panneau à motif · Détail à glands"}, color: {"en": "White & multicolor", "fr": "Blanc et multicolore"},
    prices: { EUR: 44500, USD: 48500, XOF: 292000 }, stock: { '39': 1, '40': 2, '41': 4, '42': 3, '43': 1, '44': 2, '45': 1, '46': 0 },
  },
  { id: 'chic-mule', image: 8, category: 'women', kind: 'footwear', badge: 'signature',
    name: {"en": "Décontracté Chic Peep-Toe", "fr": "Le Bout Ouvert Décontracté Chic"},
    description: {"en": "A peep-toe ankle shoe with a patterned front, white sides and lavender ribbon laces.", "fr": "Un soulier à bout ouvert, au devant à motif, côtés blancs et lacets ruban lavande."},
    material: {"en": "Patterned upper · Ribbon laces", "fr": "Tige à motif · Lacets ruban"}, color: {"en": "White, lavender & multicolor", "fr": "Blanc, lavande et multicolore"},
    prices: { EUR: 28500, USD: 31000, XOF: 187000 }, stock: { '39': 4, '40': 5, '41': 3, '42': 2, '43': 2, '44': 1, '45': 1, '46': 0 },
  },
  { id: 'heritage-weekender', image: 11, category: 'accessories', kind: 'bag', badge: 'limited',
    name: {"en": "Heritage Patterned Shoulder Bag", "fr": "Le Sac à Motif Héritage"},
    description: {"en": "A compact patterned shoulder bag with pale green trim and a gold-tone chain. The photograph shows its coordinating shoe; this listing is for the bag only.", "fr": "Un sac compact à motif, finitions vert pâle et chaîne dorée. La photo présente le soulier assorti ; cette fiche concerne uniquement le sac."},
    material: {"en": "Patterned exterior · Chain shoulder strap", "fr": "Extérieur à motif · Bandoulière chaîne"}, color: {"en": "Cream, pale green & gold", "fr": "Crème, vert pâle et or"},
    prices: { EUR: 79000, USD: 85500, XOF: 518000 }, stock: { OS: 4 },
  },
  ...ARCHIVE_PRODUCTS,
];

export const PRODUCT_BY_ID = new Map(PRODUCTS.map((product) => [product.id, product]));
export const COUNTRIES: readonly Country[] = ['BJ', 'FR', 'SN', 'US', 'GB'];
export const PAYMENT_METHODS: readonly PaymentMethod[] = ['card', 'apple', 'paypal', 'klarna', 'scalapay', 'mobile', 'pickup'];
export const LOCATIONS: readonly AtelierLocation[] = ['cotonou', 'paris', 'dakar'];
export const SERVICES: readonly AtelierService[] = ['polish', 'patina', 'heels', 'restoration'];
export const TIME_SLOTS = ['10:00', '11:30', '14:00', '15:30', '17:00'] as const;
export const LOCATION_TIMEZONES: Record<AtelierLocation, string> = {
  cotonou: 'Africa/Porto-Novo', paris: 'Europe/Paris', dakar: 'Africa/Dakar',
};
