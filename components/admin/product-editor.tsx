'use client';
import { useState } from 'react';
import type { Product } from '@/lib/types';
import { useShop } from '@/context/shop-context';
import { imageSources } from '@/lib/assets';
import { Icon } from '../icon';
import { MaisonImage } from '../maison-image';

function blankProduct(): Product {
  return { id: crypto.randomUUID(), name: { en: '', fr: '' }, description: { en: '', fr: '' }, material: { en: '', fr: '' }, color: { en: '', fr: '' }, category: 'men', kind: 'footwear', badge: 'signature', image: 4, images: [], prices: { EUR: 0, USD: 0, XOF: 0 }, stock: { '40': 0, '41': 0, '42': 0, '43': 0 }, published: false };
}
export function ProductEditor({ product, busy, onSave, onCancel }: { product?: Product; busy: boolean; onSave: (product: Product, expectedUpdatedAt: string | null) => Promise<void>; onCancel: () => void }) {
  const { t } = useShop();
  const [draft, setDraft] = useState<Product>(() => structuredClone(product ?? blankProduct()));
  const [sizes, setSizes] = useState(() => Object.entries(product?.stock ?? { '40': 0, '41': 0, '42': 0, '43': 0 }).map(([size, quantity]) => ({ key: crypto.randomUUID(), size, quantity })));
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const photoSources = draft.images?.length ? draft.images : product ? [imageSources(product.image)[0]] : [];
  const field = <K extends keyof Product>(key: K, value: Product[K]) => setDraft((draft) => ({ ...draft, [key]: value }));
  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    if ((draft.images?.length ?? 0) + files.length > 6) { setError(t('photoHint')); return; }
    setUploading(true); setError('');
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const form = new FormData(); form.append('file', file);
        const response = await fetch('/api/upload', { method: 'POST', body: form });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        urls.push(result.url);
      }
      setDraft((draft) => ({ ...draft, images: [...(draft.images ?? []), ...urls] }));
    } catch (error) { setError(error instanceof Error ? error.message : t('requestFailed')); }
    finally { setUploading(false); }
  };
  const save = async () => {
    setError('');
    if (!sizes.length || sizes.some((row) => !row.size || !Number.isSafeInteger(row.quantity) || row.quantity < 0) || new Set(sizes.map((row) => row.size)).size !== sizes.length) { setError(t('stockHint')); return; }
    if (!product && draft.published && !draft.images?.length) { setError(t('uploadPhotos')); return; }
    try { await onSave({ ...draft, stock: Object.fromEntries(sizes.map(({ size, quantity }) => [size, quantity])) }, product?.updatedAt ?? null); }
    catch { /* parent displays the server error */ }
  };
  return <form className="product-editor" onSubmit={(event) => { event.preventDefault(); void save(); }}>
    <section className="admin-panel"><div className="admin-panel-heading"><h2>{t('photos')}</h2><span className="fine-print">{photoSources.length}/6</span></div><p className="fine-print">{t('photoHint')}</p><div className="editor-photos">{photoSources.map((url, index) => <div className="editor-photo" key={url}><div className="editor-photo-image"><MaisonImage index={draft.image} sources={[url]} alt={`${t('photo')} ${index + 1}`} sizes="150px" className="object-cover" /></div><span>{index === 0 ? '01' : String(index + 1).padStart(2, '0')}</span>{draft.images?.length ? <div><button type="button" aria-label={t('movePhoto')} disabled={index === 0} onClick={() => field('images', [url, ...draft.images!.filter((_, i) => i !== index)])}><Icon name="arrow-up-right" width={15} /></button><button type="button" aria-label={t('removePhoto')} onClick={() => field('images', draft.images!.filter((_, i) => i !== index))}><Icon name="close" width={15} /></button></div> : <small>{t('archiveImage')}</small>}</div>)}<label className="upload-tile"><Icon name="plus" width={28} height={28} /><span>{t(uploading ? 'uploading' : 'uploadPhotos')}</span><input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={uploading || busy} onChange={(event) => { void upload(event.target.files); event.target.value = ''; }} /></label></div></section>
    <section className="admin-panel"><div className="admin-bilingual">{(['en', 'fr'] as const).map((locale) => <div key={locale}><p className="eyebrow">{t(locale === 'en' ? 'english' : 'french')}</p>{([{ key: 'name', label: 'productName', max: 160 }, { key: 'description', label: 'description', max: 2000 }, { key: 'material', label: 'material', max: 400 }, { key: 'color', label: 'color', max: 120 }] as const).map(({ key, label, max }) => <label className="field" key={key}><span>{t(label)}</span>{key === 'description' ? <textarea value={draft[key][locale]} rows={4} maxLength={max} required onChange={(event) => field(key, { ...draft[key], [locale]: event.target.value })} /> : <input value={draft[key][locale]} maxLength={max} required onChange={(event) => field(key, { ...draft[key], [locale]: event.target.value })} />}</label>)}</div>)}</div>
      <div className="editor-three-columns"><label className="field"><span>{t('category')}</span><select aria-label={t('category')} value={draft.category} onChange={(event) => field('category', event.target.value as Product['category'])}>{(['men', 'women', 'accessories'] as const).map((category) => <option key={category} value={category}>{t(category)}</option>)}</select></label><label className="field"><span>{t('productType')}</span><select aria-label={t('productType')} value={draft.kind} onChange={(event) => { const kind = event.target.value as Product['kind']; field('kind', kind); setSizes((kind === 'bag' ? [['OS', 0]] : kind === 'belt' ? [['85', 0], ['90', 0], ['95', 0]] : [['40', 0], ['41', 0], ['42', 0], ['43', 0]]).map(([size, quantity]) => ({ key: crypto.randomUUID(), size: String(size), quantity: Number(quantity) }))); }}>{(['footwear', 'bag', 'belt'] as const).map((kind) => <option key={kind} value={kind}>{t(kind)}</option>)}</select></label><label className="field"><span>{t('collection')}</span><select aria-label={t('collection')} value={draft.badge} onChange={(event) => field('badge', event.target.value as Product['badge'])}>{(['signature', 'limited', 'atelierEdition'] as const).map((badge) => <option key={badge} value={badge}>{t(badge)}</option>)}</select></label></div>
    </section>
    <div className="editor-two-columns"><section className="admin-panel"><h2>{t('pricing')}</h2><div className="editor-prices">{(['EUR', 'USD', 'XOF'] as const).map((currency) => <label className="field" key={currency}><span>{currency}</span><input type="number" min={currency === 'XOF' ? 1 : 0.01} step={currency === 'XOF' ? 1 : 0.01} required value={draft.prices[currency] / (currency === 'XOF' ? 1 : 100) || ''} onChange={(event) => field('prices', { ...draft.prices, [currency]: Math.round(Number(event.target.value) * (currency === 'XOF' ? 1 : 100)) })} /></label>)}</div></section><section className="admin-panel"><h2>{t('sizesStock')}</h2><p className="fine-print">{t('stockHint')}</p><div className="editor-stock">{sizes.map((row, index) => <div className="editor-stock-row" key={row.key}><label className="field"><span>{t('size')}</span><input value={row.size} required maxLength={5} readOnly={draft.kind === 'bag'} onChange={(event) => setSizes((rows) => rows.map((row, i) => i === index ? { ...row, size: event.target.value } : row))} /></label><label className="field"><span>{t('stock')}</span><input type="number" min={0} max={10000} required value={row.quantity} onChange={(event) => setSizes((rows) => rows.map((row, i) => i === index ? { ...row, quantity: Number(event.target.value) } : row))} /></label><button type="button" className="icon-button" aria-label={`${t('remove')} ${row.size}`} disabled={sizes.length <= 1} onClick={() => setSizes((rows) => rows.filter((_, i) => i !== index))}><Icon name="close" width={16} /></button></div>)}</div>{draft.kind !== 'bag' && <button type="button" className="text-link" onClick={() => setSizes((rows) => [...rows, { key: crypto.randomUUID(), size: '', quantity: 0 }])}>{t('addSize')}<Icon name="plus" /></button>}</section></div>
    <div className="editor-save-bar"><label className="publish-toggle"><input type="checkbox" checked={draft.published === true} onChange={(event) => field('published', event.target.checked)} /><span>{t('publish')}</span></label><div><button type="button" className="button button-outline" disabled={busy} onClick={onCancel}>{t('cancel')}</button><button type="submit" className="button button-gold" disabled={busy || uploading}>{t(busy ? 'saving' : 'saveProduct')}<Icon name="check" /></button></div></div>{error && <p className="field-error" role="alert">{error}</p>}
  </form>;
}
