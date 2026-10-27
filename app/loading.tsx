'use client';

import { useShop } from '@/context/shop-context';
import { GoyaWordmark } from '@/components/goya-wordmark';

export default function Loading() {
  const { t } = useShop();
  return <div className="status-page" role="status"><span className="loading-monogram" aria-hidden="true"><GoyaWordmark /></span><p className="eyebrow">{t('loading')}</p></div>;
}
