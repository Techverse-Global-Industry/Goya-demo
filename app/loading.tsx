'use client';

import { useShop } from '@/context/shop-context';

export default function Loading() {
  const { t } = useShop();
  return <div className="status-page" role="status"><span className="loading-monogram" aria-hidden="true">MG</span><p className="eyebrow">{t('loading')}</p></div>;
}
