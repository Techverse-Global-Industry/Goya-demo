'use client';
import Link from 'next/link';
import { Auth } from './auth';
import { Header } from './header';
import { MaisonImage } from './maison-image';
import { Overlays } from './overlays';
import { useShop } from '@/context/shop-context';

export function CustomerLogin({ destination, initialMode = 'login' }: { destination: string; initialMode?: 'login' | 'register' }) {
  const { t, state } = useShop();
  return <><Header /><main id="account-content" className="customer-account"><section className="account-entry">
    <div className="account-entry-editorial"><MaisonImage index={2} alt={t('accountEditorialNote')} sizes="(min-width: 900px) 50vw, 100vw" className="account-entry-photo" preload /><div className="account-entry-shade" /><div className="account-entry-caption"><span className="eyebrow">Maison Goya / {t('myMaison')}</span><h1>{t('accountWelcome')}</h1><p>{state.locale === 'fr' ? 'Votre collection, vos commandes et vos rendez-vous. Tout dans votre espace personnel.' : 'Your collection, orders and appointments. Together in your personal Maison.'}</p><span className="account-editorial-rule" /><small>{t('accountEditorialNote')}</small></div></div>
    <div className="account-entry-form"><Auth destination={destination} initialMode={initialMode} /><Link href="/" className="account-back-link">{state.locale === 'fr' ? 'Découvrir la marque' : 'Discover the brand'}</Link><Link href="/admin" className="account-back-link">{t('admin')}</Link></div>
  </section></main><Overlays /></>;
}
