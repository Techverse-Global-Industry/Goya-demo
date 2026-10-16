'use client';
import { useState } from 'react';
import { useShop } from '@/context/shop-context';
import type { Product } from '@/lib/types';
import { Icon } from '../icon';
export function AnnouncementEditor({ products, busy, onPublish }: { products: Product[]; busy: boolean; onPublish: (body: Record<string, unknown>) => Promise<void> }) {
  const { t, state } = useShop();
  const [title, setTitle] = useState({ en: '', fr: '' });
  const [body, setBody] = useState({ en: '', fr: '' });
  const [productId, setProductId] = useState('');
  return <form className="admin-panel admin-announcement-form" onSubmit={async (event) => { event.preventDefault(); try { await onPublish({ title, body, productId }); setTitle({ en: '', fr: '' }); setBody({ en: '', fr: '' }); setProductId(''); } catch { /* parent displays error */ } }}><div className="admin-bilingual">{(['en', 'fr'] as const).map((locale) => <div key={locale}><p className="eyebrow">{t(locale === 'en' ? 'english' : 'french')}</p><label className="field"><span>{t('announcementTitle')}</span><input value={title[locale]} required maxLength={120} onChange={(event) => setTitle({ ...title, [locale]: event.target.value })} /></label><label className="field"><span>{t('announcementBody')}</span><textarea value={body[locale]} required maxLength={500} rows={4} onChange={(event) => setBody({ ...body, [locale]: event.target.value })} /></label></div>)}</div><label className="field"><span>{t('linkedProduct')}</span><select value={productId} onChange={(event) => setProductId(event.target.value)}><option value="">{t('noProduct')}</option>{products.filter((product) => product.published !== false).map((product) => <option key={product.id} value={product.id}>{product.name[state.locale]}</option>)}</select></label><button className="button button-gold" disabled={busy}>{t(busy ? 'saving' : 'sendAnnouncement')}<Icon name="spark" /></button></form>;
}
