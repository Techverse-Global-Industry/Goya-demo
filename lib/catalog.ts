import type { Product, AtelierLocation, AtelierService, Country, PaymentMethod } from './types';

// Illustrative merchandising data, not a live inventory or currency conversion feed.
export const PRODUCTS: readonly Product[] = [
  {
    id: 'francesco', image: 4, category: 'men', kind: 'footwear', badge: 'signature',
    name: { en: 'Le Francesco Loafer', fr: 'Le Mocassin Francesco' },
    description: {
      en: 'A quietly distinctive loafer, shaped in supple calfskin with a hand-finished patina. A refined elongated last and a soft leather lining bring ease to every occasion.',
      fr: 'Un mocassin à la distinction discrète, façonné en veau souple et sublimé par une patine artisanale. Sa forme élancée et sa doublure en cuir accompagnent chaque instant avec aisance.',
    },
    material: { en: 'Italian calfskin · Leather lining · Leather sole', fr: 'Veau italien · Doublure cuir · Semelle cuir' },
    color: { en: 'Burnished cognac', fr: 'Cognac patiné' },
    prices: { EUR: 42000, USD: 45500, XOF: 275000 },
    stock: { '39': 2, '40': 4, '41': 6, '42': 5, '43': 3, '44': 2, '45': 1, '46': 0 },
  },
  {
    id: 'kanvo-oxford', image: 5, category: 'men', kind: 'footwear', badge: 'limited',
    name: { en: "L’Artisan Kanvo Oxford", fr: "L’Oxford Artisan Kanvo" },
    description: {
      en: 'The precision of an Oxford, reimagined with a woven Kanvo accent. Sleek closed lacing and richly textured panels create an elegant conversation between two traditions.',
      fr: 'La précision d’un Oxford, réinterprétée par un accent de Kanvo tissé. Son laçage fermé et ses empiècements texturés composent un dialogue élégant entre deux traditions.',
    },
    material: { en: 'Calfskin · Woven Kanvo panels · Leather sole', fr: 'Veau · Empiècements de Kanvo tissé · Semelle cuir' },
    color: { en: 'Espresso & natural', fr: 'Expresso et naturel' },
    prices: { EUR: 49000, USD: 53500, XOF: 320000 },
    stock: { '39': 1, '40': 2, '41': 4, '42': 3, '43': 2, '44': 1, '45': 0, '46': 1 },
  },
  {
    id: 'raffia-monk', image: 6, category: 'men', kind: 'footwear', badge: 'atelierEdition',
    name: { en: 'Royal Raffia Monk Strap', fr: 'Le Monk Royal Raphia' },
    description: {
      en: 'An expressive double-monk silhouette with woven raffia and polished leather. Warm metallic buckles and a carefully balanced profile bring a ceremonial touch to everyday dressing.',
      fr: 'Une silhouette à double boucle, associant raphia tissé et cuir poli. Ses boucles aux reflets chaleureux et ses proportions équilibrées confèrent un éclat singulier au quotidien.',
    },
    material: { en: 'Calfskin · Woven raffia · Brushed metal buckles', fr: 'Veau · Raphia tissé · Boucles en métal brossé' },
    color: { en: 'Natural raffia & ebony', fr: 'Raphia naturel et ébène' },
    prices: { EUR: 46500, USD: 50500, XOF: 305000 },
    stock: { '39': 2, '40': 3, '41': 2, '42': 4, '43': 2, '44': 2, '45': 1, '46': 1 },
  },
  {
    id: 'cotonou-tote', image: 7, category: 'women', kind: 'bag', badge: 'signature',
    name: { en: 'Cotonou Patina Leather Tote', fr: 'Le Cabas Cotonou en Cuir Patiné' },
    description: {
      en: 'A generous everyday companion in softly structured leather. A nuanced patina, considered interior pockets and comfortable handles make room for a life in motion.',
      fr: 'Un compagnon généreux en cuir à la structure souple. Sa patine nuancée, ses poches intérieures et ses anses confortables accueillent une vie en mouvement.',
    },
    material: { en: 'Patinated calfskin · Cotton lining · Interior slip pocket', fr: 'Veau patiné · Doublure coton · Poche intérieure' },
    color: { en: 'Deep mahogany', fr: 'Acajou profond' },
    prices: { EUR: 68000, USD: 73500, XOF: 445000 },
    stock: { OS: 6 },
  },
  {
    id: 'calfskin-belt', image: 8, category: 'accessories', kind: 'belt', badge: 'signature',
    name: { en: 'Italian Calfskin Belt', fr: 'La Ceinture en Veau Italien' },
    description: {
      en: 'An essential line, beautifully resolved. Smooth calfskin, subtle edge finishing and an understated buckle create a versatile companion to the Maison’s footwear.',
      fr: 'Une ligne essentielle, parfaitement dessinée. Le veau lisse, les tranches soignées et la boucle discrète prolongent avec justesse l’allure des souliers de la Maison.',
    },
    material: { en: 'Italian calfskin · Leather backing · Metal buckle', fr: 'Veau italien · Doublure cuir · Boucle métallique' },
    color: { en: 'Obsidian black', fr: 'Noir obsidienne' },
    prices: { EUR: 15500, USD: 17000, XOF: 102000 },
    stock: { '85': 3, '90': 4, '95': 6, '100': 3, '105': 2 },
  },
  {
    id: 'kente-derby', image: 9, category: 'men', kind: 'footwear', badge: 'limited',
    name: { en: 'Kente Accent Derby', fr: 'Le Derby aux Accents Kente' },
    description: {
      en: 'An open-laced Derby with a striking woven Kente detail. Rich color and clean leather lines give this versatile silhouette its unmistakable character.',
      fr: 'Un Derby à laçage ouvert, ponctué d’un détail de Kente tissé. Les couleurs profondes et les lignes épurées du cuir lui donnent un caractère inimitable.',
    },
    material: { en: 'Calfskin · Woven Kente accent · Leather sole', fr: 'Veau · Accent de Kente tissé · Semelle cuir' },
    color: { en: 'Midnight & woven gold', fr: 'Bleu nuit et or tissé' },
    prices: { EUR: 44500, USD: 48500, XOF: 292000 },
    stock: { '39': 1, '40': 2, '41': 4, '42': 3, '43': 1, '44': 2, '45': 1, '46': 0 },
  },
  {
    id: 'chic-mule', image: 10, category: 'women', kind: 'footwear', badge: 'atelierEdition',
    name: { en: 'Décontracté Chic Mule', fr: 'La Mule Décontracté Chic' },
    description: {
      en: 'An effortless open-back silhouette for unhurried days. Soft leather, a sculpted upper and a lightly cushioned footbed meet with the Maison’s signature restraint.',
      fr: 'Une silhouette ouverte, pensée pour les journées sans hâte. Un cuir souple, une empeigne sculptée et une première légèrement matelassée expriment la sobriété de la Maison.',
    },
    material: { en: 'Supple calfskin · Cushioned leather footbed · Leather sole', fr: 'Veau souple · Première cuir matelassée · Semelle cuir' },
    color: { en: 'Warm sand', fr: 'Sable chaud' },
    prices: { EUR: 28500, USD: 31000, XOF: 187000 },
    stock: { '39': 4, '40': 5, '41': 3, '42': 2, '43': 2, '44': 1, '45': 1, '46': 0 },
  },
  {
    id: 'heritage-weekender', image: 11, category: 'accessories', kind: 'bag', badge: 'limited',
    name: { en: 'Heritage Weekender Bag', fr: 'Le Sac de Voyage Héritage' },
    description: {
      en: 'Made for the journey, with a spacious silhouette and woven heritage detailing. Supple leather handles, a removable shoulder strap and a considered interior travel beautifully.',
      fr: 'Une invitation au voyage, avec un volume généreux et des détails tissés. Anses en cuir souple, bandoulière amovible et intérieur soigné accompagnent chaque départ.',
    },
    material: { en: 'Calfskin · Woven textile panels · Cotton lining', fr: 'Veau · Empiècements textiles tissés · Doublure coton' },
    color: { en: 'Tobacco & natural', fr: 'Tabac et naturel' },
    prices: { EUR: 79000, USD: 85500, XOF: 518000 },
    stock: { OS: 4 },
  },
];

export const PRODUCT_BY_ID = new Map(PRODUCTS.map((product) => [product.id, product]));
export const COUNTRIES: readonly Country[] = ['BJ', 'FR', 'SN', 'US', 'GB'];
export const PAYMENT_METHODS: readonly PaymentMethod[] = ['card', 'apple', 'mobile', 'pickup'];
export const LOCATIONS: readonly AtelierLocation[] = ['cotonou', 'paris', 'dakar'];
export const SERVICES: readonly AtelierService[] = ['polish', 'patina', 'heels', 'restoration'];
export const TIME_SLOTS = ['10:00', '11:30', '14:00', '15:30', '17:00'] as const;
export const LOCATION_TIMEZONES: Record<AtelierLocation, string> = {
  cotonou: 'Africa/Porto-Novo', paris: 'Europe/Paris', dakar: 'Africa/Dakar',
};
