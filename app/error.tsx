'use client';

import { useShop } from '@/context/shop-context';
import { LanguageSwitch } from '@/components/controls';

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useShop();
  return <main className="status-page"><LanguageSwitch /><p className="eyebrow">Maison Goya</p><h1 className="display-heading">{t('errorTitle')}</h1><p>{t('errorText')}</p><button type="button" className="button button-gold" onClick={reset}>{t('retry')}</button></main>;
}
