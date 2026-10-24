import type { Localized } from './types';

export interface CultureStory {
  slug: string;
  title: Localized;
  kicker: Localized;
  intro: Localized;
  paragraphs: Localized[];
  image: string;
  alt: Localized;
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
];

export const CULTURE_STORY_BY_SLUG = new Map(CULTURE_STORIES.map(story => [story.slug, story]));
