'use client';

import Link from 'next/link';
import { useShop } from '@/context/shop-context';
import { Auth } from './auth';
import { Header } from './header';
import { Footer } from './editorial';
import { Overlays } from './overlays';
import { Toast } from './controls';
import { Icon } from './icon';

const copy = {
  en: { heading: 'My account', welcome: 'Your personal Goya', intro: 'A place for your favourite creations and every step of your journey with the Maison.', benefits: ['Find your orders and follow their progress', 'Save your favourite creations across devices', 'Keep your delivery addresses and preferences', 'Manage your atelier and shoe-care appointments'], explore: 'Discover the collection', help: 'Need assistance?', customerCare: 'Contact customer care', admin: 'Administration', note: 'You can also browse the collection and place a demo order as a guest.' },
  fr: { heading: 'Mon compte', welcome: 'Votre espace Goya', intro: 'Vos créations préférées et chaque étape de votre expérience avec la Maison, dans un seul espace.', benefits: ['Retrouvez vos commandes et suivez leur progression', 'Conservez vos envies sur tous vos appareils', 'Enregistrez vos adresses et vos préférences', 'Gérez vos rendez-vous à l’atelier et vos soins'], explore: 'Découvrir la collection', help: 'Besoin d’aide ?', customerCare: 'Contacter le service client', admin: 'Administration', note: 'Vous pouvez également explorer la collection et passer une commande de démonstration en tant qu’invité.' },
} as const;

export function CustomerLogin({ destination, initialMode = 'login' }: { destination: string; initialMode?: 'login' | 'register' }) {
  const { state } = useShop();
  const c = copy[state.locale];
  return <><Header /><main id="account-content" className="reference-account-entry"><h1>{c.heading}</h1><section className="reference-account-panels">
    <div className="reference-account-form"><Auth destination={destination} initialMode={initialMode} /></div>
    <aside className="reference-account-benefits"><h2>{c.welcome}</h2><p>{c.intro}</p><ul>{c.benefits.map(benefit => <li key={benefit}><Icon name="check" width={16} /><span>{benefit}</span></li>)}</ul><Link href="/collections" className="reference-account-collection-link">{c.explore}<Icon name="arrow-right" width={17} /></Link><small>{c.note}</small><div className="reference-account-help"><h3>{c.help}</h3><Link href="/customer-service">{c.customerCare}<Icon name="arrow-up-right" width={14} /></Link></div></aside>
  </section><Link href="/admin" className="reference-account-admin-link">{c.admin}</Link></main><Footer /><Overlays /><Toast /></>;
}
