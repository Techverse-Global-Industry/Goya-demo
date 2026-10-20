export const fashionCopy = {
  en: {
    new: 'The collection', men: 'Man', women: 'Woman', accessories: 'Accessories', maison: 'World of Goya', care: 'Shoe care',
    hero: 'Made to move you', heroBody: 'European precision. African soul. A meeting of cultures, expressed in every step.', discover: 'Discover the collection',
    menTitle: 'A presence of your own', womenTitle: 'The art of standing out', shopMen: 'Explore men’s shoes', shopWomen: 'Explore women’s shoes',
    craftTitle: 'Character, in every detail', craftBody: 'The line of a shoe. The touch of leather. The final gesture that makes a pair your own.', craftLink: 'Discover the Goya spirit',
    statement: 'Two worlds. One signature.', statementBody: 'Founded by Rodrigue Vodounou, Maison Goya brings European elegance and African expression into conversation. Distinctive shoes, expressive details, and a point of view that is entirely our own.',
    journal: 'The world of Goya', journalBody: 'The people, places and details behind our signature.', previous: 'Previous story', next: 'Next story',
    storyCraft: 'At the heart of the Maison', storyCraftBody: 'Discover the workshop and the gestures behind the Goya signature.', storyCulture: 'L’Héritage Croisé', storyCultureBody: 'Two cultures meet through colour, texture and a singular sense of style.', storyDetails: 'A different perspective', storyDetailsBody: 'Unexpected details. Unmistakable character. Explore the Goya collection.', read: 'Discover more',
    careTitle: 'Keep the character. Renew the shine.', careBody: 'Polishing, patina, heel care and restoration. Give your favourite pair its next chapter.', careCta: 'Explore shoe care',
    footerHeading: 'Step inside the Maison', footerBody: 'Create your account to discover available pieces, find your size and follow your orders.', create: 'Create your account', account: 'Your account', customer: 'Customer service', explore: 'Explore Goya',
    footerNote: 'Demonstration experience · All orders and payments are simulated.', country: 'Cotonou · Paris · Dakar', pause: 'Pause film', play: 'Play film', menu: 'Explore the collection', all: 'View all',
  },
  fr: {
    new: 'La collection', men: 'Homme', women: 'Femme', accessories: 'Accessoires', maison: 'L’univers Goya', care: 'Entretien',
    hero: 'L’allure en mouvement', heroBody: 'Précision européenne. Âme africaine. Une rencontre de cultures qui s’exprime à chaque pas.', discover: 'Découvrir la collection',
    menTitle: 'Une présence singulière', womenTitle: 'L’art de se distinguer', shopMen: 'Découvrir les souliers homme', shopWomen: 'Découvrir les souliers femme',
    craftTitle: 'Le caractère est dans le détail', craftBody: 'La ligne d’un soulier. Le toucher du cuir. Ce dernier geste qui rend une paire unique.', craftLink: 'Découvrir l’esprit Goya',
    statement: 'Deux univers. Une signature.', statementBody: 'Fondée par Rodrigue Vodounou, Maison Goya fait dialoguer l’élégance européenne et l’expression africaine. Des souliers singuliers, des détails expressifs et un regard résolument personnel.',
    journal: 'L’univers de Goya', journalBody: 'Les personnes, les lieux et les détails qui font notre signature.', previous: 'Histoire précédente', next: 'Histoire suivante',
    storyCraft: 'Au cœur de la Maison', storyCraftBody: 'Découvrez l’atelier et les gestes derrière la signature Goya.', storyCulture: 'L’Héritage Croisé', storyCultureBody: 'Deux cultures se rencontrent à travers la couleur, la matière et l’allure.', storyDetails: 'Un autre regard', storyDetailsBody: 'Des détails inattendus. Un caractère singulier. Explorez la collection Goya.', read: 'En savoir plus',
    careTitle: 'Préserver l’allure. Raviver l’éclat.', careBody: 'Cirage, patine, soin des talons et restauration. Offrez un nouveau chapitre à votre paire préférée.', careCta: 'Découvrir les soins',
    footerHeading: 'Entrez dans la Maison', footerBody: 'Créez votre compte pour découvrir les pièces disponibles, choisir votre pointure et suivre vos commandes.', create: 'Créer votre compte', account: 'Votre compte', customer: 'Service client', explore: 'Découvrir Goya',
    footerNote: 'Expérience de démonstration · Commandes et paiements simulés.', country: 'Cotonou · Paris · Dakar', pause: 'Mettre le film en pause', play: 'Lire le film', menu: 'Explorer la collection', all: 'Tout découvrir',
  },
} as const;

export const shoeCategories = [
  { id: 'loafers', label: { en: 'Loafers', fr: 'Mocassins' }, filter: 'men', query: 'mocassin', image: '/images/campaign/goya-movement-men.webp', position: '37% center' },
  { id: 'sneakers', label: { en: 'Sneakers', fr: 'Baskets' }, filter: 'men', query: 'basket', image: '/images/campaign/goya-sneakers.webp', position: 'center' },
  { id: 'heels', label: { en: 'Heels & pumps', fr: 'Talons & escarpins' }, filter: 'women', query: '', image: '/images/campaign/goya-movement-women.webp', position: 'center' },
  { id: 'boots', label: { en: 'Ankle boots', fr: 'Bottines' }, filter: 'women', query: 'bottine', image: '/images/campaign/goya-boots.webp', position: 'center' },
] as const;
