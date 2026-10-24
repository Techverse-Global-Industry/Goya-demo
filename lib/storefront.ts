import { normalizeSearch } from './commerce';
import { shoeTypeOf } from './merchandising';
import { accessoryTypeOf, constructionOf } from './catalog-edits';
import type { CatalogFilters, Category, Country, Product } from './types';

export const EMPTY_FILTERS: CatalogFilters = { sizes: [], colors: [], materials: [], styles: [], constructions: [], accessoryTypes: [] };
export const MARKETS: Country[] = ['BJ', 'FR', 'SN', 'US', 'GB'];
export const storefrontCopy = {
  en: {
    newArrivals: 'New arrivals', man: 'Man', woman: 'Woman', accessories: 'Accessories', gifts: 'Gifts', personalization: 'Personalization', culture: 'Culture',
    shoes: 'Shoes', viewAll: 'View all', loafers: 'Loafers', sneakers: 'Sneakers', heels: 'High heels', boots: 'Ankle boots', 'lace-ups': 'Lace-ups', 'monk-straps': 'Monk straps', slippers: 'Slippers', sandals: 'Sandals', pumps: 'Pumps', flats: 'Flats', mules: 'Mules', construction: 'Construction', accessoryTypes: 'Accessories',
    forHim: 'Gifts for him', forHer: 'Gifts for her', signature: 'The Goya signature', maison: 'The Maison', craft: 'The art of craft', care: 'Shoe care',
    search: 'Search', searchPlaceholder: 'Search for a product, a colour, an inspiration', suggestions: 'Suggested', mostSearched: 'Most searched', seeResults: 'View all results',
    wishlist: 'Wishlist', emptyWishlist: 'Your wishlist is waiting for its first favourite.', wishlistIntro: 'Keep the pieces you love, and return to them whenever inspiration calls.', save: 'Save to wishlist', saved: 'Remove from wishlist',
    products: 'Products', sortBy: 'Sort by', recommended: 'Recommended', priceAsc: 'Price — low to high', priceDesc: 'Price — high to low', filters: 'Filters', clearAll: 'Clear all', showResults: 'Show results',
    gender: 'Gender', size: 'Size', color: 'Colour', material: 'Material', categories: 'Main categories', loadMore: 'Load more', viewed: 'You have viewed', of: 'of',
    black: 'Black', blue: 'Blue', red: 'Red', natural: 'Natural', multicolor: 'Multicolour', brown: 'Brown', green: 'Green', grey: 'Grey', orange: 'Orange', pink: 'Pink', yellow: 'Yellow', purple: 'Purple', white: 'White', gold: 'Gold', silver: 'Silver', leather: 'Leather', suede: 'Suede', nubuck: 'Nubuck', raffia: 'Raffia', cotton: 'Cotton', wool: 'Wool', cashmere: 'Cashmere', patterned: 'Patterned finishes', woven: 'Woven details',
    editMen: 'Men’s signature edit', editWomen: 'Women’s elegance edit', editSneakers: 'The sneaker edit', discover: 'Discover more', shopNow: 'Shop now',
    bag: 'Shopping bag', checkout: 'Proceed to checkout', continueShopping: 'Continue shopping', account: 'My account', signIn: 'Log in', register: 'Create an account', guest: 'Continue as a guest',
    guestIntro: 'Place your order without creating an account, or sign in to access your saved details.', delivery: 'Delivery', payment: 'Payment', confirmation: 'Confirmation',
    customerCare: 'Customer care', world: 'Goya world', legal: 'Legal & information', faq: 'FAQ', contact: 'Contact us', shipping: 'Shipping', returns: 'Returns & refunds', tracking: 'Track your order', stores: 'Store locator', appointment: 'Book an appointment',
    language: 'Select a language', country: 'Select a country', newsletter: 'Subscribe to the newsletter', cookieTitle: 'Your privacy choices', cookieBody: 'We use essential cookies for your session and local storage for your bag, language and wishlist. This demo has no advertising trackers.', essential: 'Continue without accepting', choose: 'Let me choose', accept: 'Accept all cookies',
    empty: 'No products match your selection.', emptyBody: 'Try a different style or clear your filters to rediscover the collection.',
    collectionIntro: 'A meeting of European elegance and African expression. Discover shoes and accessories with a character entirely their own.',
    giftIntro: 'For a milestone. For a thank you. For someone unforgettable. Discover Goya pieces made to be remembered.',
    demo: 'Demonstration experience — all payments and fulfilment are simulated.', secure: 'Secure demo checkout',
  },
  fr: {
    newArrivals: 'Nouveautés', man: 'Homme', woman: 'Femme', accessories: 'Accessoires', gifts: 'Cadeaux', personalization: 'Personnalisation', culture: 'Culture',
    shoes: 'Souliers', viewAll: 'Tout voir', loafers: 'Mocassins', sneakers: 'Baskets', heels: 'Talons hauts', boots: 'Bottines', 'lace-ups': 'Souliers à lacets', 'monk-straps': 'Souliers à boucles', slippers: 'Slippers', sandals: 'Sandales', pumps: 'Escarpins', flats: 'Souliers plats', mules: 'Mules', construction: 'Construction', accessoryTypes: 'Accessoires',
    forHim: 'Cadeaux pour lui', forHer: 'Cadeaux pour elle', signature: 'La signature Goya', maison: 'La Maison', craft: 'L’art du geste', care: 'Entretien des souliers',
    search: 'Rechercher', searchPlaceholder: 'Un produit, une couleur, une inspiration', suggestions: 'Suggestions', mostSearched: 'Les plus recherchés', seeResults: 'Voir tous les résultats',
    wishlist: 'Liste d’envies', emptyWishlist: 'Votre liste d’envies attend son premier coup de cœur.', wishlistIntro: 'Retrouvez les pièces que vous aimez, au gré de vos envies et de vos inspirations.', save: 'Ajouter à la liste d’envies', saved: 'Retirer de la liste d’envies',
    products: 'Produits', sortBy: 'Trier par', recommended: 'Notre sélection', priceAsc: 'Prix — croissant', priceDesc: 'Prix — décroissant', filters: 'Filtres', clearAll: 'Tout effacer', showResults: 'Voir les résultats',
    gender: 'Genre', size: 'Pointure', color: 'Couleur', material: 'Matière', categories: 'Catégories principales', loadMore: 'Voir plus', viewed: 'Vous avez vu', of: 'sur',
    black: 'Noir', blue: 'Bleu', red: 'Rouge', natural: 'Naturel', multicolor: 'Multicolore', brown: 'Marron', green: 'Vert', grey: 'Gris', orange: 'Orange', pink: 'Rose', yellow: 'Jaune', purple: 'Violet', white: 'Blanc', gold: 'Doré', silver: 'Argenté', leather: 'Cuir', suede: 'Daim', nubuck: 'Nubuck', raffia: 'Raphia', cotton: 'Coton', wool: 'Laine', cashmere: 'Cachemire', patterned: 'Finitions à motif', woven: 'Détails tissés',
    editMen: 'La sélection signature homme', editWomen: 'L’élégance au féminin', editSneakers: 'L’esprit basket', discover: 'Découvrir', shopNow: 'Acheter',
    bag: 'Panier', checkout: 'Passer commande', continueShopping: 'Continuer mes achats', account: 'Mon compte', signIn: 'Se connecter', register: 'Créer un compte', guest: 'Continuer en tant qu’invité',
    guestIntro: 'Commandez sans créer de compte ou connectez-vous pour retrouver vos informations enregistrées.', delivery: 'Livraison', payment: 'Paiement', confirmation: 'Confirmation',
    customerCare: 'Service client', world: 'L’univers Goya', legal: 'Informations légales', faq: 'FAQ', contact: 'Nous contacter', shipping: 'Livraison', returns: 'Retours & remboursements', tracking: 'Suivre ma commande', stores: 'Nos adresses', appointment: 'Prendre rendez-vous',
    language: 'Choisir une langue', country: 'Choisir un pays', newsletter: 'Inscrivez-vous à la newsletter', cookieTitle: 'Vos choix de confidentialité', cookieBody: 'Nous utilisons des cookies essentiels pour votre session et un stockage local pour votre panier, votre langue et vos envies. Cette démonstration ne comporte aucun traceur publicitaire.', essential: 'Continuer sans accepter', choose: 'Personnaliser', accept: 'Tout accepter',
    empty: 'Aucun produit ne correspond à votre sélection.', emptyBody: 'Essayez un autre style ou effacez les filtres pour redécouvrir la collection.',
    collectionIntro: 'Une rencontre entre élégance européenne et expression africaine. Découvrez des souliers et accessoires au caractère singulier.',
    giftIntro: 'Pour une occasion. Pour un merci. Pour une personne inoubliable. Découvrez les créations Goya qui marquent les esprits.',
    demo: 'Expérience de démonstration — paiements et livraison simulés.', secure: 'Commande de démonstration sécurisée',
  },
} as const;

export function productColors(product: Product): string[] {
  const text = normalizeSearch(`${product.color.en} ${product.color.fr}`);
  return [['black', /black|noir/], ['blue', /blue|bleu|navy/], ['red', /red|rouge|burgundy|bordeaux/], ['natural', /cream|creme|beige|ivory|ivoire|ecru|natural|naturel/], ['multicolor', /multicolor|multicolore|pattern|motif/], ['brown', /brown|marron|cognac|brun|\btan\b/], ['green', /green|vert/], ['grey', /grey|gray|gris/], ['orange', /orange/], ['pink', /pink|\brose\b/], ['yellow', /yellow|jaune/], ['purple', /purple|violet|lavender|lavande/], ['white', /white|blanc/], ['gold', /gold|dore|\bor\b/], ['silver', /silver|argent/]].filter(([, pattern]) => (pattern as RegExp).test(text)).map(([name]) => name as string);
}
export function productMaterials(product: Product): string[] {
  const text = normalizeSearch(`${product.material.en} ${product.material.fr}`);
  return [['leather', /leather|cuir|calfskin|veau|lambskin|agneau/], ['suede', /suede|daim|velours/], ['nubuck', /nubuck|nubuk/], ['raffia', /raffia|raphia/], ['cotton', /cotton|coton/], ['wool', /wool|laine/], ['cashmere', /cashmere|cachemire/], ['patterned', /pattern|motif/], ['woven', /woven|tiss/]].filter(([, pattern]) => (pattern as RegExp).test(text)).map(([name]) => name as string);
}
export function matchesCatalogFilters(product: Product, filters: CatalogFilters): boolean {
  return (!filters.genders?.length || filters.genders.includes(product.category))
    && (!filters.sizes.length || filters.sizes.some(size => (product.stock[size] ?? 0) > 0))
    && (!filters.colors.length || filters.colors.some(color => productColors(product).includes(color)))
    && (!filters.materials.length || filters.materials.some(material => productMaterials(product).includes(material)))
    && (!filters.styles.length || filters.styles.includes(shoeTypeOf(product) ?? 'all'))
    && (!filters.constructions?.length || filters.constructions.includes(constructionOf(product) ?? ''))
    && (!filters.accessoryTypes?.length || filters.accessoryTypes.includes(accessoryTypeOf(product) ?? ''));
}
export function catalogPath(category: Category = 'all', style = 'all'): string {
  const base = category === 'men' ? '/men' : category === 'women' ? '/women' : category === 'accessories' ? '/accessories' : '/collections';
  return style !== 'all' && (category === 'men' || category === 'women') ? `${base}/${style}` : base;
}
