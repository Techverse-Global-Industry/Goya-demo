import type { Country, Currency, Locale } from './types';

export const serviceRegions: { code: Country; name: Record<Locale, string>; area: 'africa' | 'europe' | 'america'; currency: Currency }[] = [
  { code: 'BJ', name: { en: 'Benin', fr: 'Bénin' }, area: 'africa', currency: 'XOF' },
  { code: 'SN', name: { en: 'Senegal', fr: 'Sénégal' }, area: 'africa', currency: 'XOF' },
  { code: 'FR', name: { en: 'France', fr: 'France' }, area: 'europe', currency: 'EUR' },
  { code: 'GB', name: { en: 'United Kingdom', fr: 'Royaume-Uni' }, area: 'europe', currency: 'EUR' },
  { code: 'US', name: { en: 'United States', fr: 'États-Unis' }, area: 'america', currency: 'USD' },
];

export const serviceCopy = {
  en: {
    recoveryDemo: 'Recovery demonstration · no email is sent and no account password is changed.',
    customerCare: 'Customer care', contactUs: 'Contact us', careIntro: "A question about a creation, its fit, your order or the care of a favourite pair? Explore our services or send a demonstration request below.", careSecond: 'Your personal Maison brings your orders and atelier appointments together. For a quick answer, visit our frequently asked questions.',
    title: 'Title', select: 'Select', man: 'Man', woman: 'Woman', preferNot: 'Prefer not to say', firstName: 'First name', lastName: 'Last name', email: 'Email', phone: 'Mobile phone number', country: 'Country', language: 'Language', subject: 'Subject', selectTopic: 'Select topic', message: 'Message', writeHere: 'Write here', attachment: 'Attachments', selectFile: 'Select file', fileLimit: "Optional · JPEG, PNG or WebP, up to 12 MB before resizing", remove: 'Remove attachment', attachmentError: "Choose a JPEG, PNG or WebP photograph smaller than 12 MB.",
    consent: 'I have read the information about how this demonstration uses my personal data.', privacy: 'Privacy information', send: "Send demo request", formDemo: "Your request and photograph are saved to the demonstration service. No external message is sent.", requestReady: "Your demonstration request is received.", requestNote: "Your details are saved for the demonstration team to review. Follow the request from My requests. No external message has been sent.", editRequest: "Start another request",
    topics: ['Personalization', 'Atelier appointment', 'Orders', 'Product information', 'Shoe care and repairs', 'Returns and refunds', 'Other enquiry'],
    faq: 'Frequently asked questions', quickHelp: 'How can we help?', orderLink: 'Track your order', book: 'Book an appointment', exploreFaq: 'Explore the FAQ',
    newsletterTitle: 'Subscribe to the newsletter', newsletterIntro: 'Discover Goya’s latest creations, stories and the world behind the signature.', emailPlaceholder: 'Enter your email', newsletterMen: 'Men’s creations', newsletterWomen: 'Women’s creations', newsletterConsent: "I agree to save my demonstration newsletter preference with the Maison.", subscribe: 'Subscribe to the newsletter', subscribed: "Your demonstration subscription is saved with the Maison. No marketing email has been sent.", newsletterDemo: 'Demo subscription · no marketing emails are sent.',
    chooseCountry: 'Choose your country', countrySearch: 'Search for a country', countriesHint: 'Choose the market and language for your Maison.', all: 'All', africa: 'Africa', europe: 'Europe', america: 'North America', currency: 'Currency', apply: 'Apply preferences', regionNote: 'Demonstration country and currency settings. Orders and payments remain simulated.', noCountries: 'No matching countries.',
    recovery: 'Forgot your password?', recoveryIntro: 'Enter the email linked to your account to preview the password recovery experience.', recoveryAction: 'Send demo reset link', recoverySent: 'Recovery preview prepared. No email has been sent.', resetTitle: 'Choose a new password', newPassword: 'New password', repeatPassword: 'Confirm new password', resetAction: 'Preview password reset', passwordHint: 'Use at least 8 characters. Do not reuse a real password.', passwordMismatch: 'The passwords do not match.', passwordPreview: 'Password reset preview complete.', passwordUnchanged: 'This demonstration has not changed your account password.', backLogin: 'Back to sign in',
    stores: 'Goya stores', storeIntro: 'Discover the Maison and its atelier experience.', storeDemo: 'Demonstration locations. Exact boutique addresses and opening hours must be confirmed by Goya before a real visit.', storeSearch: 'Enter city or country', allLocations: 'All locations', details: 'Details', cityMap: 'City map', selectLocation: 'Select a location', mapLabel: 'Illustrative map of the demonstration Goya locations', mapNote: 'Illustrative city map', zoomIn: 'Zoom in', zoomOut: 'Zoom out', locationServices: 'Services', locationTimes: 'Visits by appointment in this demonstration.', noStores: 'No locations match your search.', locationNames: { cotonou: 'Atelier Goya · Cotonou', paris: 'Maison Goya · Paris', dakar: 'Maison Goya · Dakar' },
    personalization: 'Personalization', personalTitle: 'Your own signature.', personalIntro: 'An initial. A colour. A detail that is entirely your own. Explore the personal expression of Goya.', personalHeading: 'Make your mark', personalBody: 'Discover an illustrative personalization experience inspired by the character of Goya’s leather and woven details.', initials: 'Your initials', finish: 'Stamp finish', gold: 'Gold', silver: 'Silver', dark: 'Black', preview: 'Design preview', personalDemo: 'Illustrative design preview. This does not modify a product or place an order.', personalRequest: 'Discuss your idea', craft: 'The art of a personal detail', craftBody: 'From the first gesture to the final finish, character lives in the details. Explore Goya’s atelier and shoe-care experience.',
    sizeGuide: 'Size guide', fitting: 'Find your fit', sizeIntro: 'The demonstration collection uses European shoe sizes. Choose your usual EU size, then check availability on the product.', european: 'European size', measurement: 'Before choosing', measureText: 'Measure both feet standing on a sheet of paper. Use the longer foot and allow room at the toe. Fit varies with the last and style.', sizeNote: 'This is indicative demonstration guidance, not a verified Goya conversion chart.', askFit: 'Ask about fit', shoe: 'Shoes',
    shippingReturns: 'Shipping & returns', shipping: 'Shipping and delivery', returns: 'Returns and refunds', shippingIntro: 'Follow the complete order journey, from choosing a pair to the next chapter.', shippingDemo: 'Goya demonstration experience: delivery progress, returns and payments are simulations. No physical shipment or refund is initiated.',
    privacyTitle: 'Your information in this demonstration', privacyText: "Contact requests, resized photographs and newsletter preferences are stored by the demonstration service and are visible to your session and the demo administrator. Account and order details are protected by their own sessions. Use fictitious personal details and a unique demo password.",
  },
  fr: {
    recoveryDemo: 'Récupération de démonstration · aucun e-mail envoyé ni mot de passe de compte modifié.',
    customerCare: 'Service client', contactUs: 'Nous contacter', careIntro: "Une question sur une création, sa pointure, votre commande ou le soin de votre paire préférée ? Découvrez nos services ou envoyez une demande de démonstration ci-dessous.", careSecond: 'Votre Maison personnelle rassemble vos commandes et vos rendez-vous à l’atelier. Pour une réponse rapide, consultez nos questions fréquentes.',
    title: 'Civilité', select: 'Sélectionner', man: 'Homme', woman: 'Femme', preferNot: 'Je préfère ne pas préciser', firstName: 'Prénom', lastName: 'Nom', email: 'E-mail', phone: 'Numéro de téléphone', country: 'Pays', language: 'Langue', subject: 'Objet', selectTopic: 'Choisir un sujet', message: 'Message', writeHere: 'Écrivez ici', attachment: 'Pièces jointes', selectFile: 'Choisir un fichier', fileLimit: "Facultatif · JPEG, PNG ou WebP, jusqu’à 12 Mo avant redimensionnement", remove: 'Retirer la pièce jointe', attachmentError: "Choisissez une photographie JPEG, PNG ou WebP de moins de 12 Mo.",
    consent: 'J’ai lu les informations concernant l’utilisation de mes données dans cette démonstration.', privacy: 'Informations de confidentialité', send: "Envoyer la demande de démonstration", formDemo: "Votre demande et votre photographie sont enregistrées dans le service de démonstration. Aucun message externe n’est envoyé.", requestReady: "Votre demande de démonstration est reçue.", requestNote: "Vos informations sont enregistrées pour l’équipe de démonstration. Retrouvez la progression dans Mes demandes. Aucun message externe n’a été envoyé.", editRequest: "Commencer une autre demande",
    topics: ['Personnalisation', 'Rendez-vous à l’atelier', 'Commandes', 'Informations produit', 'Entretien et réparations', 'Retours et remboursements', 'Autre demande'],
    faq: 'Questions fréquentes', quickHelp: 'Comment pouvons-nous vous aider ?', orderLink: 'Suivre votre commande', book: 'Prendre rendez-vous', exploreFaq: 'Consulter la FAQ',
    newsletterTitle: 'S’inscrire à la newsletter', newsletterIntro: 'Découvrez les dernières créations Goya, nos histoires et l’univers de notre signature.', emailPlaceholder: 'Saisissez votre e-mail', newsletterMen: 'Créations homme', newsletterWomen: 'Créations femme', newsletterConsent: "J’accepte d’enregistrer ma préférence de newsletter de démonstration auprès de la Maison.", subscribe: 'S’inscrire à la newsletter', subscribed: "Votre inscription de démonstration est enregistrée auprès de la Maison. Aucun e-mail commercial n’a été envoyé.", newsletterDemo: 'Inscription de démonstration · aucun e-mail commercial n’est envoyé.',
    chooseCountry: 'Choisissez votre pays', countrySearch: 'Rechercher un pays', countriesHint: 'Choisissez le marché et la langue de votre Maison.', all: 'Tous', africa: 'Afrique', europe: 'Europe', america: 'Amérique du Nord', currency: 'Devise', apply: 'Appliquer les préférences', regionNote: 'Pays et devises de démonstration. Les commandes et paiements restent simulés.', noCountries: 'Aucun pays correspondant.',
    recovery: 'Mot de passe oublié ?', recoveryIntro: 'Saisissez l’e-mail associé à votre compte pour prévisualiser la récupération du mot de passe.', recoveryAction: 'Envoyer le lien de démonstration', recoverySent: 'L’aperçu de récupération est prêt. Aucun e-mail n’a été envoyé.', resetTitle: 'Choisissez un nouveau mot de passe', newPassword: 'Nouveau mot de passe', repeatPassword: 'Confirmer le mot de passe', resetAction: 'Prévisualiser la réinitialisation', passwordHint: 'Au moins 8 caractères. Ne réutilisez pas un véritable mot de passe.', passwordMismatch: 'Les mots de passe ne correspondent pas.', passwordPreview: 'Aperçu de réinitialisation terminé.', passwordUnchanged: 'Cette démonstration n’a pas modifié le mot de passe de votre compte.', backLogin: 'Retour à la connexion',
    stores: 'Les boutiques Goya', storeIntro: 'Découvrez la Maison et l’expérience de son atelier.', storeDemo: 'Lieux de démonstration. Les adresses exactes et horaires doivent être confirmés par Goya avant toute visite réelle.', storeSearch: 'Saisissez une ville ou un pays', allLocations: 'Tous les lieux', details: 'Détails', cityMap: 'Plan de la ville', selectLocation: 'Choisissez un lieu', mapLabel: 'Carte illustrative des lieux Goya de démonstration', mapNote: 'Plan de ville illustratif', zoomIn: 'Agrandir', zoomOut: 'Réduire', locationServices: 'Services', locationTimes: 'Visites sur rendez-vous dans cette démonstration.', noStores: 'Aucun lieu ne correspond à votre recherche.', locationNames: { cotonou: 'Atelier Goya · Cotonou', paris: 'Maison Goya · Paris', dakar: 'Maison Goya · Dakar' },
    personalization: 'Personnalisation', personalTitle: 'Votre propre signature.', personalIntro: 'Une initiale. Une couleur. Un détail qui n’appartient qu’à vous. Explorez l’expression personnelle de Goya.', personalHeading: 'Laissez votre empreinte', personalBody: 'Découvrez un aperçu de personnalisation inspiré du caractère du cuir et des détails tissés de Goya.', initials: 'Vos initiales', finish: 'Finition du marquage', gold: 'Or', silver: 'Argent', dark: 'Noir', preview: 'Aperçu de création', personalDemo: 'Aperçu de création illustratif. Il ne modifie aucun produit et ne passe aucune commande.', personalRequest: 'Parlons de votre idée', craft: 'L’art d’un détail personnel', craftBody: 'Du premier geste à la dernière finition, le caractère se révèle dans les détails. Découvrez l’atelier et les soins des souliers Goya.',
    sizeGuide: 'Guide des pointures', fitting: 'Trouvez votre pointure', sizeIntro: 'La collection de démonstration utilise les pointures européennes. Choisissez votre pointure EU habituelle, puis consultez la disponibilité sur le produit.', european: 'Pointure européenne', measurement: 'Avant de choisir', measureText: 'Mesurez vos deux pieds debout sur une feuille. Retenez le pied le plus long et prévoyez de l’espace au bout. Le chaussant varie selon la forme et le modèle.', sizeNote: 'Ces indications de démonstration ne constituent pas un tableau de conversion Goya vérifié.', askFit: 'Demander un conseil de pointure', shoe: 'Souliers',
    shippingReturns: 'Livraison et retours', shipping: 'Livraison', returns: 'Retours et remboursements', shippingIntro: 'Suivez chaque étape, du choix de votre paire au prochain chapitre.', shippingDemo: 'Expérience Goya de démonstration : la livraison, les retours et les paiements sont simulés. Aucun envoi ni remboursement réel n’est lancé.',
    privacyTitle: 'Vos informations dans cette démonstration', privacyText: "Les demandes de contact, photographies redimensionnées et préférences de newsletter sont enregistrées par le service de démonstration et visibles dans votre session ainsi que par l’administrateur. Les comptes et commandes sont protégés par leurs sessions. Utilisez des coordonnées fictives et un mot de passe de démonstration unique.",
  },
} as const;

export const faqCopy = {
  "en": [
    {
      "id": "products",
      "label": "Products",
      "entries": [
        [
          "How do I choose my size?",
          "Use Find your size on a product page to explore the demonstration recommendation and conversion guide, then select an available size. Fit guidance is indicative."
        ],
        [
          "Where can I find materials and colours?",
          "Every creation has product photographs, material and construction details. Related colour editions can be selected on the product page when available."
        ],
        [
          "How should I care for my shoes?",
          "Explore Caring for polishing, colour and patina, heel care and restoration assessment. Add photographs of your piece to send a demonstration request."
        ]
      ]
    },
    {
      "id": "orders",
      "label": "Online shopping / orders",
      "entries": [
        [
          "Can I explore the collection without an account?",
          "Yes. Browse, save favourites and use the bag publicly. Complete a demonstration checkout as a guest or sign in to use saved details."
        ],
        [
          "Where can I follow an order?",
          "Open Track your order. Use the order reference and purchase email when looking up a guest order, or find it in your signed-in order history."
        ],
        [
          "Can I change a confirmed order?",
          "Send an enquiry from Customer care. Confirmed order details remain an immutable record; no physical dispatch takes place in this demonstration."
        ]
      ]
    },
    {
      "id": "payments",
      "label": "Payments",
      "entries": [
        [
          "Which payment options can I try?",
          "The demonstration displays supported card, wallet, Mobile Money and collection choices at checkout. Available options depend on the chosen delivery country. No real money moves."
        ],
        [
          "Do I need real payment details?",
          "No. Do not enter a real card number, security code, banking password or Mobile Money PIN. Follow the explicit approve or decline controls."
        ]
      ]
    },
    {
      "id": "shipping",
      "label": "Shipping and delivery",
      "entries": [
        [
          "Where can I arrange delivery?",
          "Choose from the demonstration markets in the country selector. Enter a delivery address at checkout to see the available options."
        ],
        [
          "How are delivery fees calculated?",
          "Your bag total and selected delivery option determine the demonstration delivery fee. The checkout summary shows it before confirmation."
        ],
        [
          "How does order tracking work?",
          "The order progresses through Confirmed, Preparing, On its way and Delivered when the demo administrator updates it. Tracking references and deliveries are illustrative."
        ]
      ]
    },
    {
      "id": "returns",
      "label": "Returns and refunds",
      "entries": [
        [
          "How can I request a return?",
          "Open Returns, locate an eligible demonstration order, select the items and quantities, and choose a reason. Review and save your request. Guests can first locate their order with its reference and purchase email."
        ],
        [
          "Where can I follow a return?",
          "The return request displays its reference and progress. The demo administrator can approve the request, mark it received and complete a simulated refund."
        ],
        [
          "When is a refund issued?",
          "A refund stage can be demonstrated after the request is processed. No money was charged, so no real refund, parcel collection or shipment takes place."
        ]
      ]
    },
    {
      "id": "account",
      "label": "Account and personal area",
      "entries": [
        [
          "What can I find in my account?",
          "Your Maison contains orders and returns, saved addresses, wishlist, preferences, appointments and demonstration service requests."
        ],
        [
          "Can I change my email and password?",
          "Use the security controls in your account settings. Credential changes require your current password."
        ],
        [
          "I forgot my password. What should I do?",
          "Open Forgot password and follow the secure demonstration recovery instructions. Recovery is limited to an authorised recovery session or code; entering someone else’s email does not grant access. No recovery email is sent."
        ]
      ]
    },
    {
      "id": "customer",
      "label": "Customer care / contacts",
      "entries": [
        [
          "How can I ask about a creation?",
          "Choose Customer care and select a subject. Your request and optional resized photograph are saved for the demonstration team. Follow the reference in My requests."
        ],
        [
          "Which languages are available?",
          "Choose one of the seven interface languages in the language selector. Product search understands English and French."
        ]
      ]
    },
    {
      "id": "boutiques",
      "label": "Boutiques / appointments",
      "entries": [
        [
          "Where can I discover the Maison?",
          "The store finder contains city-level demonstration locations in Cotonou, Paris and Dakar, interactive city maps and individual location pages. Confirm real street addresses and hours with Goya before visiting."
        ],
        [
          "Can I arrange a consultation?",
          "Choose Online consulting or Boutique appointment, a Maison, a preferred date and time, and your subject. Save the demonstration request and follow its progress. Existing care-service bookings are also available."
        ]
      ]
    },
    {
      "id": "warranty",
      "label": "Care and warranty",
      "entries": [
        [
          "What support is available for a favourite pair?",
          "The Caring journey accepts a description and photographs for a demonstration assessment. Every requested intervention is reviewed before approval."
        ],
        [
          "Where are the commercial warranty terms?",
          "Read the separate demonstration terms and care information. Goya’s actual commercial warranty and service commitments require confirmation before live commerce."
        ]
      ]
    }
  ],
  "fr": [
    {
      "id": "products",
      "label": "Produits",
      "entries": [
        [
          "Comment choisir ma pointure ?",
          "Utilisez Trouver ma pointure sur une fiche produit pour explorer la recommandation et le guide de conversion de démonstration, puis choisissez une pointure disponible. Ces indications restent indicatives."
        ],
        [
          "Où trouver les matières et couleurs ?",
          "Chaque création présente ses photographies, sa matière et sa construction. Les éditions de couleurs associées sont sélectionnables sur la fiche lorsqu’elles sont disponibles."
        ],
        [
          "Comment entretenir mes souliers ?",
          "Découvrez Le soin pour le cirage, la patine, les talons et l’évaluation de restauration. Ajoutez les photographies de votre pièce à votre demande de démonstration."
        ]
      ]
    },
    {
      "id": "orders",
      "label": "Achats en ligne / commandes",
      "entries": [
        [
          "Puis-je découvrir la collection sans compte ?",
          "Oui. Explorez, conservez vos envies et utilisez le panier publiquement. Commandez en démonstration comme invité ou connectez-vous pour utiliser vos coordonnées enregistrées."
        ],
        [
          "Où suivre une commande ?",
          "Ouvrez Suivre ma commande. Utilisez la référence et l’e-mail d’achat pour retrouver une commande invitée, ou consultez votre historique connecté."
        ],
        [
          "Puis-je modifier une commande confirmée ?",
          "Envoyez une demande au service client. Les détails confirmés restent conservés ; aucun colis réel n’est expédié dans cette démonstration."
        ]
      ]
    },
    {
      "id": "payments",
      "label": "Paiements",
      "entries": [
        [
          "Quels paiements puis-je essayer ?",
          "La démonstration affiche les choix de carte, portefeuille, Mobile Money et retrait pris en charge à la commande. Les options dépendent du pays choisi. Aucun argent réel ne circule."
        ],
        [
          "Faut-il de véritables coordonnées de paiement ?",
          "Non. Ne saisissez pas de vrai numéro de carte, cryptogramme, mot de passe bancaire ou code Mobile Money. Utilisez les commandes explicites d’approbation ou de refus."
        ]
      ]
    },
    {
      "id": "shipping",
      "label": "Livraison",
      "entries": [
        [
          "Où puis-je organiser la livraison ?",
          "Choisissez un marché de démonstration dans le sélecteur de pays. Saisissez une adresse à la commande pour consulter les options disponibles."
        ],
        [
          "Comment les frais sont-ils calculés ?",
          "Le total du panier et l’option de livraison choisie déterminent les frais de démonstration. Le récapitulatif les affiche avant confirmation."
        ],
        [
          "Comment fonctionne le suivi ?",
          "La commande passe par Confirmée, En préparation, En route puis Livrée lorsque l’administrateur la fait progresser. Les références de suivi et livraisons sont illustratives."
        ]
      ]
    },
    {
      "id": "returns",
      "label": "Retours et remboursements",
      "entries": [
        [
          "Comment demander un retour ?",
          "Ouvrez Retours, retrouvez une commande de démonstration admissible, sélectionnez les articles et quantités puis indiquez un motif. Vérifiez et enregistrez la demande. Un invité peut retrouver sa commande avec la référence et l’e-mail d’achat."
        ],
        [
          "Où suivre un retour ?",
          "La demande présente sa référence et sa progression. L’administrateur peut l’approuver, confirmer sa réception puis terminer un remboursement simulé."
        ],
        [
          "Quand le remboursement est-il effectué ?",
          "L’étape de remboursement est démontrable après traitement. Aucun argent n’a été débité : aucun remboursement réel, collecte ou envoi n’a lieu."
        ]
      ]
    },
    {
      "id": "account",
      "label": "Compte et espace personnel",
      "entries": [
        [
          "Que contient mon compte ?",
          "Votre Maison rassemble les commandes et retours, adresses, envies, préférences, rendez-vous et demandes de service de démonstration."
        ],
        [
          "Puis-je modifier mon e-mail et mon mot de passe ?",
          "Utilisez les contrôles de sécurité de vos paramètres. Toute modification des identifiants demande votre mot de passe actuel."
        ],
        [
          "J’ai oublié mon mot de passe. Que faire ?",
          "Ouvrez Mot de passe oublié et suivez les instructions sécurisées de démonstration. La récupération exige une session ou un code autorisé ; l’e-mail d’un tiers ne donne aucun accès. Aucun e-mail de récupération n’est envoyé."
        ]
      ]
    },
    {
      "id": "customer",
      "label": "Service client / contacts",
      "entries": [
        [
          "Comment me renseigner sur une création ?",
          "Choisissez un objet dans le service client. Votre demande et votre photographie facultative redimensionnée sont enregistrées pour l’équipe de démonstration. Retrouvez la référence dans Mes demandes."
        ],
        [
          "Quelles langues sont proposées ?",
          "L’expérience Goya est disponible en français et en anglais. La recherche produit comprend les deux langues."
        ]
      ]
    },
    {
      "id": "boutiques",
      "label": "Boutiques / rendez-vous",
      "entries": [
        [
          "Où découvrir la Maison ?",
          "Le sélecteur présente des lieux de démonstration à Cotonou, Paris et Dakar, des plans de ville interactifs et des fiches individuelles. Confirmez avec Goya les adresses et horaires réels avant une visite."
        ],
        [
          "Puis-je organiser une consultation ?",
          "Choisissez Conseil en ligne ou Rendez-vous en boutique, une Maison, une date et heure souhaitées ainsi qu’un sujet. Enregistrez la demande de démonstration et suivez sa progression. Les réservations de soins existantes restent disponibles."
        ]
      ]
    },
    {
      "id": "warranty",
      "label": "Entretien et garantie",
      "entries": [
        [
          "Quels soins pour ma paire préférée ?",
          "Le parcours Le soin accepte une description et des photographies pour une évaluation de démonstration. Toute intervention est étudiée avant approbation."
        ],
        [
          "Où consulter les garanties commerciales ?",
          "Consultez les conditions de démonstration et informations de soin dédiées. Goya doit confirmer sa garantie commerciale et ses engagements réels avant la vente en ligne."
        ]
      ]
    }
  ]
} as const;
