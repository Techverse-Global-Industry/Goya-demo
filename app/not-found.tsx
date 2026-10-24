'use client';

import Link from 'next/link';
import { useShop } from '@/context/shop-context';
import { LanguageSwitch } from '@/components/controls';
import { GoyaWordmark } from '@/components/goya-wordmark';
import { Overlays } from '@/components/overlays';

export default function NotFound() {
  const { t } = useShop();
  return <><main className="status-page"><LanguageSwitch /><GoyaWordmark /><p className="eyebrow">404</p><h1 className="display-heading">{t('notFoundTitle')}</h1><p>{t('notFoundText')}</p><Link href="/" className="button button-gold">{t('home')}</Link></main><Overlays /></>;
}
