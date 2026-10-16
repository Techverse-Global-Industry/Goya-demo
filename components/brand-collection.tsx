'use client';
import Link from 'next/link';
import { useShop } from '@/context/shop-context';
import { MaisonImage } from './maison-image';
import { Icon } from './icon';

export function BrandCollection() {
  const { t, state } = useShop();
  return <section id="collection" className="section-pad brand-collection"><p className="eyebrow">{t('collectionEyebrow')}</p><h2 className="display-heading">{t('collectionTitle')}<em>{t('collectionEmphasis')}</em></h2><p className="brand-collection-intro">{t('collectionIntro')}</p><div className="brand-category-grid">{([{ category: 'men', image: 3 }, { category: 'women', image: 4 }, { category: 'accessories', image: 11 }] as const).map(({ category, image }) => <article key={category}><div><MaisonImage index={image} alt={t(category)} sizes="(min-width: 700px) 33vw, 100vw" className="object-cover" /></div><h3>{t(category)}</h3></article>)}</div><div className="brand-shop-invitation"><div><h3>{state.locale === 'fr' ? 'Entrez dans votre Maison.' : 'Step inside your Maison.'}</h3><p>{state.locale === 'fr' ? 'Connectez-vous pour découvrir les modèles disponibles, choisir votre taille et suivre vos commandes.' : 'Sign in to discover available pieces, find your size and follow every order.'}</p></div><Link href="/app/shop" className="button button-gold">{state.user ? t('myMaison') : t('login')}<Icon name="arrow-right" /></Link></div></section>;
}
