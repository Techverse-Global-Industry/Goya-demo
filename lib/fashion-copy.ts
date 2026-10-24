export const fashionCopy = {
  en: {
    new: 'The collection', men: 'Man', women: 'Woman', accessories: 'Accessories', maison: 'World of Goya', care: 'Shoe care',
    hero: 'Made to move you', heroBody: 'A meeting of European elegance and African expression. Discover the Goya collection, where a confident silhouette, a woven accent and an unexpected colour bring a personal rhythm to every step. Shoes and accessories to make your own.', discover: 'Discover more',
    menTitle: 'Goya man', womenTitle: 'Goya woman', shopMen: 'Shop now', shopWomen: 'Shop now',
    craftTitle: 'Character, in every detail', craftBody: 'The line of a shoe. The touch of leather. The final gesture that makes a pair your own.', craftLink: 'Discover the Goya spirit',
    statement: 'Goya shoes: European elegance, African expression', statementBody: 'Founded by Rodrigue Vodounou, Maison Goya brings European elegance and African expression into conversation. A familiar silhouette takes on a different rhythm through colour, texture and patterned details. From loafers and lace-ups to sculptural heels, sneakers and accessories, the collection invites a personal way of dressing. Discover the photographs, explore each shape and find the details that speak to you. Rooted in Cotonou and open to the world, the Goya point of view continues beyond a single pair: in the confidence of a step, the care given to a favourite shoe and the pleasure of making a style your own.',
    journal: 'Goya anthology', journalBody: 'A story of people, places and encounters. Discover the ideas, expressive details and cultural conversations that shape the world of Goya.', previous: 'Previous story', next: 'Next story',
    storyCraft: 'At the heart of the Maison', storyCraftBody: 'Discover the workshop and the gestures behind the Goya signature.', storyCulture: 'L’Héritage Croisé', storyCultureBody: 'Two cultures meet through colour, texture and a singular sense of style.', storyDetails: 'A different perspective', storyDetailsBody: 'Unexpected details. Unmistakable character. Explore the Goya collection.', read: 'Discover more',
    careTitle: 'Keep the character. Renew the shine.', careBody: 'Polishing, patina, heel care and restoration. Give your favourite pair its next chapter.', careCta: 'Explore shoe care',
    footerHeading: 'Step inside the Maison', footerBody: 'Create your account to discover available pieces, find your size and follow your orders.', create: 'Create your account', account: 'Your account', customer: 'Customer service', explore: 'Explore Goya',
    footerNote: 'Demonstration experience · All orders and payments are simulated.', country: 'Cotonou · Paris · Dakar', pause: 'Pause film', play: 'Play film', menu: 'Explore the collection', all: 'View all',
  },
  fr: {
    new: 'La collection', men: 'Homme', women: 'Femme', accessories: 'Accessoires', maison: 'L’univers Goya', care: 'Entretien',
    hero: 'L’allure en mouvement', heroBody: 'Une rencontre entre élégance européenne et expression africaine. Découvrez la collection Goya, où une silhouette affirmée, un détail tissé et une couleur inattendue donnent un rythme personnel à chaque pas. Des souliers et des accessoires à faire vôtres.', discover: 'En savoir plus',
    menTitle: 'Goya homme', womenTitle: 'Goya femme', shopMen: 'Découvrir', shopWomen: 'Découvrir',
    craftTitle: 'Le caractère est dans le détail', craftBody: 'La ligne d’un soulier. Le toucher du cuir. Ce dernier geste qui rend une paire unique.', craftLink: 'Découvrir l’esprit Goya',
    statement: 'Souliers Goya : élégance européenne, expression africaine', statementBody: 'Fondée par Rodrigue Vodounou, Maison Goya fait dialoguer l’élégance européenne et l’expression africaine. Une silhouette familière prend un autre rythme grâce à la couleur, aux textures et aux détails à motif. Des mocassins et souliers à lacets aux talons sculpturaux, baskets et accessoires, la collection invite à une façon personnelle de s’habiller. Parcourez les photographies, explorez chaque forme et trouvez les détails qui vous parlent. Ancré à Cotonou et ouvert sur le monde, le regard Goya se prolonge au-delà d’une paire : dans l’assurance d’un pas, le soin apporté à un soulier aimé et le plaisir de faire vivre son propre style.',
    journal: 'Anthologie Goya', journalBody: 'Une histoire de personnes, de lieux et de rencontres. Découvrez les idées, les détails expressifs et les dialogues culturels qui composent l’univers Goya.', previous: 'Histoire précédente', next: 'Histoire suivante',
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
