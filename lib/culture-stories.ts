import type { Localized } from './types';

export interface CultureStory {
  slug: string;
  title: Localized;
  kicker: Localized;
  intro: Localized;
  paragraphs: Localized[];
  image: string;
  alt: Localized;
  source?: { label: Localized; url: string };
}

/** Original Goya editorial copy for the bilingual demonstration storefront. */
export const CULTURE_STORIES: CultureStory[] = [
  {
    slug: 'l-heritage-croise',
    title: { en: 'Two worlds. One signature.', fr: 'Deux univers. Une signature.' },
    kicker: { en: 'The Maison', fr: 'La Maison' },
    intro: { en: 'European elegance meets African expression. A conversation carried in the line of a shoe and the confidence of a step.', fr: 'L’élégance européenne rencontre l’expression africaine. Un dialogue qui se lit dans la ligne d’un soulier et l’assurance d’un pas.' },
    paragraphs: [
      { en: 'Goya begins with a point of view: a familiar silhouette can say something entirely personal. A precise line, an unexpected colour or a patterned accent gives a classic form a different rhythm.', fr: 'Goya part d’un regard : une silhouette familière peut raconter quelque chose de personnel. Une ligne précise, une couleur inattendue ou un détail à motif donne un autre rythme à une forme classique.' },
      { en: 'Founded by Rodrigue Vodounou, the Maison brings European elegance and African expression into conversation. The collection explores that meeting through shoes and accessories with a distinctive presence.', fr: 'Fondée par Rodrigue Vodounou, la Maison fait dialoguer l’élégance européenne et l’expression africaine. La collection explore cette rencontre à travers des souliers et des accessoires à la présence singulière.' },
      { en: 'Wear a bold detail with quiet tailoring, or let a confident pair become the starting point of an outfit. The Goya signature comes alive in the way you make it your own.', fr: 'Associez un détail expressif à une tenue sobre, ou laissez une paire affirmée devenir le point de départ d’une silhouette. La signature Goya prend vie dans votre façon de la porter.' },
    ],
    image: '/images/img2.jpg',
    alt: { en: 'A man in grey tailoring, red glasses and burgundy Goya shoes.', fr: 'Une silhouette en costume gris, lunettes rouges et souliers Goya bordeaux.' },
  },
  {
    slug: 'le-detail-signature',
    title: { en: 'Character, in the detail', fr: 'Le caractère est dans le détail' },
    kicker: { en: 'The signature', fr: 'La signature' },
    intro: { en: 'Look a little closer. A woven accent changes the conversation between a classic loafer and everything you wear with it.', fr: 'Regardez de plus près. Un détail tissé change le dialogue entre un mocassin classique et toute la silhouette qui l’accompagne.' },
    paragraphs: [
      { en: 'The first impression is a clean silhouette. The second reveals its personality: a patterned strap, a contrast in texture, a flash of colour against black. These small decisions give the Goya loafer its particular presence.', fr: 'La première impression est celle d’une ligne nette. La seconde révèle sa personnalité : une bride à motif, un contraste de matière, une touche de couleur sur le noir. Ces petits choix donnent au mocassin Goya sa présence particulière.' },
      { en: 'A detail can be expressive without asking the whole outfit to follow. Pair it with a simple trouser and a favourite shirt, and let the eye return to the shoes.', fr: 'Un détail peut s’exprimer sans imposer son rythme à toute la tenue. Un pantalon sobre, une chemise que l’on aime : le regard revient naturellement aux souliers.' },
      { en: 'Discover the loafers in the collection, compare the available sizes and explore each creation through its own photographs. The detail deserves to be seen.', fr: 'Découvrez les mocassins de la collection, consultez les pointures disponibles et explorez chaque création à travers ses photographies. Le détail mérite le regard.' },
    ],
    image: '/images/campaign/goya-signature.webp',
    alt: { en: 'A close view of black Goya loafers with patterned straps.', fr: 'Vue rapprochée de mocassins Goya noirs à brides à motif.' },
  },
  {
    slug: 'l-allure-au-quotidien',
    title: { en: 'The everyday, reimagined', fr: 'Le quotidien, autrement' },
    kicker: { en: 'The sneaker edit', fr: 'L’esprit basket' },
    intro: { en: 'Relaxed lines, expressive patterns. The Goya sneaker brings a personal rhythm to the everyday.', fr: 'Des lignes décontractées, des motifs expressifs. La basket Goya donne un rythme personnel au quotidien.' },
    paragraphs: [
      { en: 'Some days begin with an appointment and end somewhere unexpected. A sneaker can connect those moments while bringing character to a simple silhouette.', fr: 'Certaines journées commencent par un rendez-vous et se terminent ailleurs que prévu. Une basket relie ces moments tout en donnant du caractère à une silhouette simple.' },
      { en: 'In the Goya collection, patterned panels and contrasting details create the visual rhythm. A restrained outfit gives those details room; a playful combination takes them further.', fr: 'Dans la collection Goya, les panneaux à motif et les détails contrastés créent le rythme visuel. Une tenue sobre leur laisse de l’espace ; une association plus libre prolonge leur expression.' },
      { en: 'Explore the sneaker edit and find the pair that feels like your own starting point. Your size and the latest demo availability are shown on each product page.', fr: 'Explorez la sélection de baskets et trouvez la paire qui vous ressemble. Chaque fiche présente les pointures et les dernières disponibilités de la démonstration.' },
    ],
    image: '/images/campaign/goya-sneakers.webp',
    alt: { en: 'Goya sneakers with black laces and colourful patterned panels.', fr: 'Baskets Goya à lacets noirs et panneaux à motif multicolore.' },
  },
  {
    slug: 'une-ligne-sculpturale',
    title: { en: 'A sculptural point of view', fr: 'Une ligne sculpturale' },
    kicker: { en: 'The feminine edit', fr: 'L’élégance au féminin' },
    intro: { en: 'A curve. A cut-out. The play of light on a patterned surface. A shoe becomes the focus of the silhouette.', fr: 'Une courbe. Une découpe. La lumière sur une surface à motif. Le soulier devient le point d’attention de la silhouette.' },
    paragraphs: [
      { en: 'The Goya feminine wardrobe explores contrast: a defined heel and an expressive upper, a dark outline and a woven detail. From a distance, the shape speaks first. Up close, texture changes the impression.', fr: 'Le vestiaire féminin Goya explore les contrastes : un talon dessiné et une empeigne expressive, un contour sombre et un détail tissé. De loin, la forme s’impose. De près, la matière change l’impression.' },
      { en: 'Let a sculptural pair lead the outfit. A clean hem reveals the line of the shoe; a quieter palette gives a pattern space to breathe.', fr: 'Laissez une paire sculpturale guider la tenue. Un ourlet net révèle la ligne du soulier ; une palette plus discrète laisse respirer le motif.' },
      { en: 'Explore heels, pumps and ankle boots in the women’s collection. Each has its own expression, from the colour to the final outline.', fr: 'Découvrez les talons, escarpins et bottines de la collection femme. Chaque création affirme sa propre expression, de la couleur à la ligne finale.' },
    ],
    image: '/images/campaign/goya-sculpture.webp',
    alt: { en: 'Sculptural midnight-blue Goya heels with woven accents on a sunlit stone ledge.', fr: 'Souliers Goya bleu nuit à talons sculpturaux et détails tissés sur une pierre ensoleillée.' },
  },
  {
    slug: 'le-geste-du-soin',
    title: { en: 'The next chapter of a pair', fr: 'Le prochain chapitre d’une paire' },
    kicker: { en: 'Shoe care', fr: 'Le soin du soulier' },
    intro: { en: 'A favourite pair deserves attention. Discover the care journey, from a renewed shine to the details that need a closer look.', fr: 'Une paire que l’on aime mérite de l’attention. Découvrez le parcours de soin, de l’éclat retrouvé aux détails qui demandent un regard attentif.' },
    paragraphs: [
      { en: 'Wearing a shoe gives it a story. Looking after it lets that story continue. Begin by noticing the surface, the sole and the heel, and by understanding the materials of the pair you own.', fr: 'Porter un soulier lui donne une histoire. En prendre soin permet de la prolonger. Commencez par observer la surface, la semelle et le talon, et par connaître les matières de votre paire.' },
      { en: 'Different finishes need different attention. Before choosing a polish or treatment, ask which care is suitable for the leather, textile and decorative details on your particular pair.', fr: 'Chaque finition demande une attention adaptée. Avant de choisir un cirage ou un traitement, renseignez-vous sur le soin qui convient au cuir, au textile et aux détails décoratifs de votre paire.' },
      { en: 'The Goya demo introduces polishing, patina, heel care and restoration through its atelier journey. Explore the services and try an appointment request; the booking remains a demonstration.', fr: 'La démonstration Goya présente le cirage, la patine, le soin des talons et la restauration à travers le parcours atelier. Découvrez les services et essayez une demande de rendez-vous ; la réservation reste une démonstration.' },
    ],
    image: '/images/campaign/goya-care-poster.webp',
    alt: { en: 'Gloved hands polishing a burgundy leather shoe.', fr: 'Des mains gantées font briller un soulier en cuir bordeaux.' },
  },
  {
    slug: 'l-art-de-l-offrir',
    title: { en: 'A thoughtful expression', fr: 'Une attention singulière' },
    kicker: { en: 'The gift edit', fr: 'La sélection cadeaux' },
    intro: { en: 'For a milestone, a thank you or someone unforgettable. Begin with the details that make them who they are.', fr: 'Pour une occasion, un merci ou une personne inoubliable. Commencez par les détails qui la rendent unique.' },
    paragraphs: [
      { en: 'A meaningful choice starts with attention. Think of a favourite colour, the shape they return to, the detail that always catches their eye. The most personal gesture often begins with something simple.', fr: 'Un choix juste commence par l’attention. Une couleur préférée, une forme que l’on retrouve, un détail qui attire toujours le regard : le geste le plus personnel part souvent de quelque chose de simple.' },
      { en: 'Explore Goya shoes and accessories through their patterns and contrasts. A signature loafer, an expressive heel or a patterned accessory can become the beginning of a different story.', fr: 'Explorez les souliers et accessoires Goya à travers leurs motifs et leurs contrastes. Un mocassin signature, un talon expressif ou un accessoire à motif devient le début d’une autre histoire.' },
      { en: 'Save a favourite to your wishlist, check its details and confirm the right size before choosing. The gift edit brings the collection together so you can take your time.', fr: 'Gardez une création dans votre liste d’envies, consultez ses détails et vérifiez la pointure avant de choisir. La sélection cadeaux réunit les créations pour vous laisser le temps de découvrir.' },
    ],
    image: '/images/img11.webp',
    alt: { en: 'A patterned Goya shoe and matching chain-strap bag in pale green and gold tones.', fr: 'Un soulier Goya à motif et un sac à chaîne assorti, dans des tons vert pâle et dorés.' },
  },
  {
    slug: 'les-matieres-en-dialogue',
    title: { en: 'A dialogue of materials', fr: 'Le dialogue des matières' },
    kicker: { en: 'Texture & expression', fr: 'Matière & expression' },
    intro: { en: 'Smooth leather, a woven accent, the rhythm of a pattern. Character begins where different textures meet.', fr: 'Le cuir lisse, un détail tissé, le rythme d’un motif. Le caractère naît de la rencontre des matières.' },
    paragraphs: [
      { en: 'In interviews, Goya founder Rodrigue Vodounou describes a vocabulary that includes leather, raffia, Kente and Kanvo. These materials open different conversations between an established silhouette and an expressive detail.', fr: 'Dans ses entretiens, Rodrigue Vodounou, fondateur de Goya, évoque un vocabulaire qui réunit le cuir, le raphia, le Kente et le Kanvo. Ces matières font dialoguer une silhouette familière et un détail expressif.' },
      { en: 'A smooth surface catches the light differently from a woven one. A pattern can change the apparent line of a shoe. Give each detail a little space and the whole silhouette gains another dimension.', fr: 'Une surface lisse et un tissage n’accrochent pas la lumière de la même façon. Un motif peut changer la lecture d’un soulier. Laissez de l’espace à chaque détail : la silhouette prend une autre dimension.' },
      { en: 'Discover the photographs and material notes for each demo creation. The material of a particular pair should always be checked on its own product page before choosing its care.', fr: 'Découvrez les photographies et les indications de matière de chaque création de démonstration. Avant de choisir un soin, consultez toujours la fiche de la paire concernée.' },
    ],
    image: '/images/archive/goya-01.jpg',
    alt: { en: 'Goya loafers with contrasting woven details and tassels.', fr: 'Mocassins Goya aux détails tissés et aux glands contrastés.' },
  },
  {
    slug: 'le-geste-et-la-transmission',
    title: { en: 'An eye for the gesture', fr: 'Le regard et le geste' },
    kicker: { en: 'Inside the atelier', fr: 'Dans l’atelier' },
    intro: { en: 'At the workbench, attention becomes visible. A surface is observed, a tool is chosen, a gesture is considered.', fr: 'À l’établi, l’attention devient visible. Une surface s’observe, un outil se choisit, un geste se précise.' },
    paragraphs: [
      { en: 'The Goya archive shows people gathered around the workbench: leather, brushes, jars of polish and the focus of hands at work. It is a quieter view of a brand often seen through the finished silhouette.', fr: 'Les archives Goya montrent des hommes autour de l’établi : du cuir, des brosses, des pots de cirage et la concentration des mains au travail. Un regard plus intime sur une maison souvent découverte à travers la silhouette achevée.' },
      { en: 'Looking closely is the beginning of care. Notice the finish, the areas of wear and the relationship between a shoe’s different materials. The right question matters as much as the next gesture.', fr: 'Observer est le premier geste du soin. Repérez la finition, les traces d’usage et la rencontre des différentes matières. La bonne question compte autant que le geste qui suivra.' },
      { en: 'Bring that attention to your own pair. The demo atelier journey lets you describe what needs care and request a conversation before any treatment is decided.', fr: 'Portez cette attention à votre propre paire. Le parcours atelier de démonstration permet de décrire vos besoins et de demander un échange avant de décider d’un traitement.' },
    ],
    image: '/images/img1.jpg',
    alt: { en: 'Two members of the Goya atelier at a leather-care workbench.', fr: 'Deux hommes de l’atelier Goya à un établi de soin du cuir.' },
  },
  {
    slug: 'une-rencontre-creative',
    title: { en: 'Goya × Funkè: a creative encounter', fr: 'Goya × Funkè : une rencontre créative' },
    kicker: { en: 'From the archive · 2020', fr: 'Dans les archives · 2020' },
    intro: { en: 'Revisiting a 2020 collaboration: footwear and African textiles meet through a shared creative project.', fr: 'Retour sur une collaboration de 2020 : le soulier et les textiles africains se rencontrent autour d’un projet créatif commun.' },
    paragraphs: [
      { en: 'In its account of a 2020 project, the agency MC&CO documents a collaboration between Maison Goya and Funkè. The encounter connects Goya footwear with African textiles and a wider fashion conversation.', fr: 'Dans sa présentation d’un projet de 2020, l’agence MC&CO documente une collaboration entre Maison Goya et Funkè. Cette rencontre relie les souliers Goya aux textiles africains et à un dialogue de mode plus large.' },
      { en: 'This story revisits the 2020 project as part of the Maison’s creative history. The accompanying photograph comes from the Goya archive and provides a wider view of its visual identity.', fr: 'Cette histoire revisite le projet de 2020 comme une étape du parcours créatif de la Maison. La photographie qui l’accompagne provient des archives Goya et offre un regard plus large sur son identité visuelle.' },
      { en: 'Look at how a recurring detail connects separate pieces. A strong accessory does not need an identical companion; a shared shade or texture can be enough.', fr: 'Observez comment un détail récurrent relie des pièces distinctes. Un accessoire affirmé n’exige pas un compagnon identique : une couleur ou une matière commune peut suffire.' },
    ],
    image: '/images/archive/goya-16.jpg',
    alt: { en: 'A Goya archive fashion silhouette with patterned accessories.', fr: 'Une silhouette de mode issue des archives Goya, avec des accessoires à motif.' },
    source: { label: { en: 'The 2020 project — MC&CO', fr: 'Le projet de 2020 — MC&CO' }, url: 'https://www.mcandco.agency/fr/work/funke/' },
  },
  {
    slug: 'la-couleur-comme-signature',
    title: { en: 'Let colour lead', fr: 'La couleur donne le ton' },
    kicker: { en: 'The palette', fr: 'La palette' },
    intro: { en: 'A blue that holds the eye. A red that changes the rhythm. Sometimes the smallest part of an outfit sets its entire mood.', fr: 'Un bleu qui retient le regard. Un rouge qui change le rythme. Parfois, le plus petit élément d’une tenue en donne toute l’allure.' },
    paragraphs: [
      { en: 'Begin with a colour you want to wear, then build around it. A clear blue shoe finds a different expression beside charcoal tailoring, pale denim or a simple white shirt.', fr: 'Partez d’une couleur que vous avez envie de porter, puis construisez la tenue autour d’elle. Un soulier bleu s’exprime autrement avec un costume anthracite, un jean clair ou une chemise blanche.' },
      { en: 'The Goya archive explores confident colours alongside darker, quieter outlines. There is no single formula: a contrast can be deliberate, a repeated shade subtle, a patterned detail the only accent.', fr: 'Les archives Goya explorent des couleurs affirmées aux côtés de lignes sombres et plus discrètes. Il n’existe pas de formule unique : le contraste peut être franc, le rappel subtil, le motif seul accent de la tenue.' },
      { en: 'Use the colour filters to explore the collection at your own pace. Each demo product keeps its own photographs and availability, so the colour you select belongs to the creation you see.', fr: 'Explorez la collection à votre rythme grâce aux filtres de couleur. Chaque produit de démonstration conserve ses photographies et ses disponibilités : la couleur choisie correspond à la création présentée.' },
    ],
    image: '/images/archive/goya-07.jpg',
    alt: { en: 'Blue Goya lace-up shoes from the brand archive.', fr: 'Souliers Goya bleus à lacets issus des archives de la marque.' },
  },
  {
    slug: 'le-voyage-en-quelques-paires',
    title: { en: 'A wardrobe in motion', fr: 'Le vestiaire en mouvement' },
    kicker: { en: 'The travel edit', fr: 'L’esprit voyage' },
    intro: { en: 'A few considered choices, room for the unexpected. Think of the places ahead and the pairs you want beside you.', fr: 'Quelques choix réfléchis et une place pour l’imprévu. Pensez aux étapes à venir et aux paires qui vous accompagneront.' },
    paragraphs: [
      { en: 'Preparing for a journey is an exercise in editing. Start with the moments you expect: an arrival, a day in the city, a dinner. Choose shapes that work with more than one outfit.', fr: 'Préparer un voyage, c’est faire une sélection. Pensez aux moments attendus : une arrivée, une journée en ville, un dîner. Choisissez des formes qui accompagnent plusieurs tenues.' },
      { en: 'A distinctive pair can carry an otherwise simple wardrobe. Keep the palette connected and let a textured surface or a patterned accent provide the change of rhythm.', fr: 'Une paire singulière peut donner du caractère à un vestiaire très simple. Gardez un fil de couleur et laissez une texture ou un motif apporter le changement de rythme.' },
      { en: 'The demo travel edit is an editorial invitation to compose a wardrobe around your plans. Explore the materials, choose your usual fit and make room for a detail that feels personal.', fr: 'La sélection voyage de démonstration est une invitation à composer un vestiaire autour de vos projets. Explorez les matières, retrouvez votre chaussant habituel et faites place à un détail personnel.' },
    ],
    image: '/images/archive/goya-09.jpg',
    alt: { en: 'Two Goya archive silhouettes wearing patterned slippers.', fr: 'Deux silhouettes des archives Goya portant des slippers à motif.' },
  },
  {
    slug: 'des-racines-et-des-horizons',
    title: { en: 'Roots and horizons', fr: 'Des racines et des horizons' },
    kicker: { en: 'The Goya point of view', fr: 'Le regard Goya' },
    intro: { en: 'African roots and European experience. A personal journey becomes a way of looking at the familiar.', fr: 'Des racines africaines et une expérience européenne. Un parcours personnel devient une façon de regarder le familier.' },
    paragraphs: [
      { en: 'Rodrigue Vodounou describes Goya through the meeting of African roots and European experience. The result is a point of view rather than a uniform: a classic can remain recognisable while finding a different voice.', fr: 'Rodrigue Vodounou décrit Goya comme une rencontre entre des racines africaines et une expérience européenne. Il en naît un regard plutôt qu’un uniforme : un classique reste reconnaissable tout en trouvant une autre voix.' },
      { en: 'In the archive, a dark slipper carries a striking map-shaped detail. It offers a direct visual expression of place and identity, held within an otherwise restrained silhouette.', fr: 'Dans les archives, un slipper sombre porte un détail saisissant en forme de carte. Le lieu et l’identité s’expriment directement dans une silhouette par ailleurs très sobre.' },
      { en: 'Explore the Maison through the choices that make its collection distinctive: the line, the colour and the details that invite a second look.', fr: 'Découvrez la Maison à travers les choix qui distinguent sa collection : la ligne, la couleur et ces détails qui invitent à regarder une seconde fois.' },
    ],
    image: '/images/archive/goya-12.jpg',
    alt: { en: 'Black Goya slippers with a yellow map of Benin on each upper.', fr: 'Slippers Goya noirs ornés d’une carte jaune du Bénin sur chaque empeigne.' },
  },
  {
    slug: 'les-accessoires-en-dialogue',
    title: { en: 'The finishing conversation', fr: 'Le dernier dialogue' },
    kicker: { en: 'Leather goods & accessories', fr: 'Maroquinerie & accessoires' },
    intro: { en: 'A bag, a belt, a considered detail. The silhouette continues beyond the shoe.', fr: 'Un sac, une ceinture, un détail choisi. La silhouette se poursuit au-delà du soulier.' },
    paragraphs: [
      { en: 'Accessories change the balance of an outfit. A structured bag adds a different line; a belt defines a proportion; a repeated pattern creates a connection between separate pieces.', fr: 'Les accessoires changent l’équilibre d’une tenue. Un sac structuré apporte une autre ligne ; une ceinture dessine une proportion ; un motif répété relie des pièces distinctes.' },
      { en: 'Goya’s founder has discussed the development of leather goods alongside footwear. In the photographic archive, patterned bags and shoes form a natural conversation without making every outfit a matching set.', fr: 'Le fondateur de Goya a évoqué le développement de la maroquinerie aux côtés des souliers. Dans les archives photographiques, les sacs à motif et les chaussures dialoguent naturellement, sans imposer une silhouette entièrement assortie.' },
      { en: 'Explore the accessory families, save a favourite and inspect its photographs. The demo assortment is deliberately small, with clear categories to make the next discovery easy.', fr: 'Explorez les familles d’accessoires, enregistrez un favori et observez ses photographies. L’assortiment de démonstration reste volontairement limité, avec des catégories claires pour faciliter la découverte.' },
    ],
    image: '/images/archive/goya-08.jpg',
    alt: { en: 'A Goya patterned chain-strap bag worn with coordinated ankle boots.', fr: 'Un sac Goya à motif et à chaîne, porté avec des bottines coordonnées.' },
  },
];

export const CULTURE_STORY_BY_SLUG = new Map(CULTURE_STORIES.map(story => [story.slug, story]));
