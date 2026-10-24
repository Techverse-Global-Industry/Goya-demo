'use client';

import Image from 'next/image';
import { useEffect, useId, useRef, useState } from 'react';
import { useShop } from '@/context/shop-context';
import { DEMO_SIZE_CHART, recommendDemoSize } from '@/lib/catalog-edits';
import type { FitAnswers } from '@/lib/catalog-edits';
import { localizedText, MARKET_CODES, marketName, siteText } from '@/lib/international';
import type { Country } from '@/lib/types';
import { Icon } from './icon';

const FIT_KEY = 'goya-fit-v1';
type FitSource = 'fit' | 'manual';
function readFit(productId: string): { size: string; source: FitSource } | null {
  if (typeof window === 'undefined') return null;
  try { const saved = JSON.parse(sessionStorage.getItem(FIT_KEY) ?? 'null'); return saved?.productId === productId && typeof saved.size === 'string' && /^\d{2}(?:\.5)?$/.test(saved.size) ? { size: saved.size, source: saved.source === 'manual' ? 'manual' : 'fit' } : null; } catch { return null; }
}
export function savedFit(productId: string): string | null { return readFit(productId)?.size ?? null; }
export function savedFitIsRecommended(productId: string): boolean { return readFit(productId)?.source === 'fit'; }
export function rememberFit(productId: string, size: string, source: FitSource = 'fit') { try { sessionStorage.setItem(FIT_KEY, JSON.stringify({ productId, size, source })); } catch { /* The chosen size remains usable. */ } }

export function ProductSizeGuide({ productId, embedded = false }: { productId?: string; embedded?: boolean }) {
  const { state, productById } = useShop();
  const product = productId ? productById.get(productId) : undefined;
  const women = product?.category === 'women';
  const text = (en: string, fr: string) => siteText(state.language, en, fr);
  return <section className={'reference-size-guide fit-size-guide' + (embedded ? ' fit-size-guide--embedded' : '')}>
    <p className="fit-chart-subtitle">{women ? text("Size chart · Women's shoes", 'Tableau des pointures · Souliers femme') : text("Size chart · Men's shoes", 'Tableau des pointures · Souliers homme')}</p>
    <div className="fit-conversion-scroll"><table><caption className="sr-only">{text('Illustrative demonstration conversions', 'Équivalences illustratives de démonstration')}</caption><thead><tr><th scope="col">{text('Goya size', 'Pointure Goya')}</th><th scope="col">EU</th><th scope="col">UK</th><th scope="col">USA</th><th scope="col">CM</th></tr></thead><tbody>{DEMO_SIZE_CHART.map(row => <tr key={row.eu}><th scope="row">{row.eu}</th><td>{row.eu}</td><td>{row.uk}</td><td>{women ? row.usWomen : row.usMen}</td><td>{row.cm.toFixed(1)}</td></tr>)}</tbody></table></div>
    <p className="fit-chart-demo">{text('Illustrative demo chart. Goya has not verified these conversions.', 'Tableau illustratif de démonstration. Ces équivalences n’ont pas été validées par Goya.')}</p>
  </section>;
}
export function SizeGuide() { return <ProductSizeGuide />; }

function FitSelect({ label, value, options, onChange, invalid = false }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (value: string) => void; invalid?: boolean }) {
  const { state } = useShop(); const id = useId(); const container = useRef<HTMLDivElement>(null); const [open, setOpen] = useState(false);
  const selected = options.find(option => option.value === value);
  const close = () => { setOpen(false); container.current?.querySelector<HTMLButtonElement>('[role="combobox"]')?.focus(); };
  useEffect(() => { if (!open) return; const outside = (event: PointerEvent) => { if (!container.current?.contains(event.target as Node)) setOpen(false); }; document.addEventListener('pointerdown', outside); return () => document.removeEventListener('pointerdown', outside); }, [open]);
  const reveal = () => { setOpen(true); requestAnimationFrame(() => { const option = container.current?.querySelector<HTMLElement>('[aria-selected="true"]') ?? container.current?.querySelector<HTMLElement>('[role="option"]'); option?.focus({ preventScroll: true }); option?.scrollIntoView({ block: 'nearest' }); }); };
  return <div className="fit-custom-select" ref={container} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}><button type="button" role="combobox" aria-label={label} aria-invalid={invalid || undefined} aria-expanded={open} aria-haspopup="listbox" aria-controls={id} onClick={() => open ? setOpen(false) : reveal()} onKeyDown={event => { if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); reveal(); } if (event.key === 'Escape') close(); }}><span>{selected?.label ?? siteText(state.language, 'Select', 'Sélectionner')}</span><Icon name="chevron" width={12} /></button>{open ? <ul role="listbox" id={id} aria-label={label}>{options.map((option, index) => <li key={option.value} role="option" aria-selected={value === option.value} tabIndex={-1} onClick={event => { event.preventDefault(); onChange(option.value); close(); }} onKeyDown={event => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onChange(option.value); close(); }
    else if (event.key === 'Escape') { event.preventDefault(); close(); }
    else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) { event.preventDefault(); const next = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : options.length - 1)) % options.length; container.current?.querySelectorAll<HTMLElement>('[role="option"]')[next]?.focus(); }
    else if (event.key.length === 1) { const next = options.findIndex(item => item.label.toLocaleLowerCase(state.language).startsWith(event.key.toLocaleLowerCase(state.language))); if (next >= 0) container.current?.querySelectorAll<HTMLElement>('[role="option"]')[next]?.focus(); }
  }}>{option.label}</li>)}</ul> : null}</div>;
}

export function FitFinder({ productId }: { productId: string }) {
  const { state, productById, dispatch } = useShop();
  const product = productById.get(productId);
  const text = (en: string, fr: string) => siteText(state.language, en, fr);
  const [tab, setTab] = useState<'fit' | 'chart'>('fit');
  const [step, setStep] = useState(0);
  const [error, setError] = useState(false);
  const [gender, setGender] = useState<'men' | 'women'>(product?.category === 'women' ? 'women' : 'men');
  const [country, setCountry] = useState<Country>(state.market === 'WW' ? 'BJ' : state.market);
  const [answers, setAnswers] = useState<FitAnswers>({ system: state.market === 'US' || state.market === 'CA' ? 'US' : state.market === 'GB' ? 'UK' : 'EU', value: 0, width: 'regular', preference: 'regular' });
  if (!product || product.kind !== 'footwear') return null;
  const measureKey = answers.system === 'EU' ? 'eu' : answers.system === 'UK' ? 'uk' : gender === 'women' ? 'usWomen' : 'usMen';
  const rows = DEMO_SIZE_CHART.map(row => row[measureKey]);
  const result = step === 2 ? recommendDemoSize({ ...product, category: gender }, answers) : null;
  const reset = () => { setStep(0); setAnswers(current => ({ ...current, value: 0, width: 'regular' })); try { sessionStorage.removeItem(FIT_KEY); } catch { /* Optional browser preference. */ } };
  const apply = () => { if (!result?.withinRange) return; rememberFit(product.id, result.size); window.dispatchEvent(new CustomEvent('goya:fit', { detail: { productId, size: result.size } })); dispatch({ type: 'close' }); };
  const shapes = [
    { value: 'narrow', title: text('Narrow', 'Fin'), body: text('Do your feet move sideways in your shoes, or do you tie the laces extra tight?', 'Vos pieds glissent-ils sur les côtés, ou serrez-vous particulièrement vos lacets ?') },
    { value: 'regular', title: text('Average', 'Standard'), body: text('Do your feet generally fit well once you have chosen the right length?', 'Vos pieds sont-ils généralement à l’aise une fois la bonne longueur choisie ?') },
    { value: 'wide', title: text('Wide', 'Large'), body: text('Do your shoes often feel tight at the sides, or do you loosen the laces?', 'Vos souliers serrent-ils souvent sur les côtés, ou desserrez-vous les lacets ?') },
  ] as const;
  return <section className="fit-finder exact-fit-finder">
    <div className="fit-tabs" role="tablist" aria-label={text('Fit tools', 'Outils de pointure')}><button type="button" role="tab" aria-selected={tab === 'fit'} onClick={() => setTab('fit')}><Icon name="spark" width={16} />{text('Recommended Size', 'Pointure recommandée')}</button><button type="button" role="tab" aria-selected={tab === 'chart'} onClick={() => setTab('chart')}>{text('Size Chart', 'Tableau des pointures')}</button></div>
    {tab === 'chart' ? <ProductSizeGuide productId={productId} embedded /> : <><div className="fit-step-indicator" aria-label={text('Steps', 'Étapes')}>{[0, 1, 2].map(index => <span key={index} className={index === step ? 'is-current' : ''} />)}</div>
      {step === 0 ? <form className="fit-about-form" onSubmit={event => { event.preventDefault(); if (!answers.value) { setError(true); return; } setStep(1); }}><div className="fit-question-heading"><h2>{text('Tell us about you', 'Parlez-nous de vous')}</h2><p>{text('Tell us about yourself so we can recommend a footwear size for this demonstration.', 'Présentez votre chaussant habituel pour obtenir une recommandation dans cette démonstration.')}</p></div><div className="fit-fields"><div className="fit-field-pair"><label><span>{text('Gender', 'Genre')}</span><FitSelect label={text('Gender', 'Genre')} value={gender} options={[{ value: 'men', label: text('Male', 'Homme') }, { value: 'women', label: text('Female', 'Femme') }]} onChange={value => { setGender(value as typeof gender); setAnswers(current => ({ ...current, value: 0 })); }} /></label><label><span>{text('Country of origin', 'Pays d’origine')}</span><FitSelect label={text('Country of origin', 'Pays d’origine')} value={country} options={MARKET_CODES.map(code => ({ value: code, label: marketName(code, state.language) }))} onChange={value => setCountry(value as Country)} /></label></div><label><span>{text('Size Chart', 'Tableau des pointures')}</span><FitSelect label={text('Your usual size system', 'Votre repère habituel')} value={answers.system} options={[{ value: 'EU', label: 'EU' }, { value: 'UK', label: 'UK' }, { value: 'US', label: 'US/CA' }]} onChange={value => setAnswers(current => ({ ...current, system: value as FitAnswers['system'], value: 0 }))} /></label><label><span>{text('What size would you try first?', 'Quelle pointure essaieriez-vous d’abord ?')}</span><FitSelect label={text('Your usual size', 'Votre pointure habituelle')} value={answers.value ? String(answers.value) : ''} options={rows.map(value => ({ value: String(value), label: String(value) }))} invalid={error} onChange={value => { setAnswers(current => ({ ...current, value: Number(value) })); setError(false); }} /></label></div>{error ? <p className="fit-field-error" role="alert">{text('Select your usual size to continue.', 'Sélectionnez votre pointure habituelle pour continuer.')}</p> : null}<p className="fit-privacy-note">{text('Demo guidance based on an illustrative chart. Your answers stay in this browser.', 'Conseil de démonstration fondé sur un tableau illustratif. Vos réponses restent dans ce navigateur.')}</p><div className="fit-bottom-actions"><button className="pdp-add-button" type="submit">{text('Continue', 'Continuer')}</button><button className="fit-clear" type="button" onClick={reset}>{text('Clear data', 'Effacer les données')}</button></div></form> : step === 1 ? <div className="fit-shape-step"><div className="fit-question-heading"><h2>{text('Your foot shape', 'La forme de votre pied')}</h2><p>{text('How would you describe your foot width', 'Comment décririez-vous la largeur de votre pied ?')}</p></div><div className="fit-shape-options" role="radiogroup" aria-label={text('Your foot width', 'La largeur de votre pied')}>{shapes.map(shape => <button type="button" role="radio" aria-checked={answers.width === shape.value} key={shape.value} onClick={() => setAnswers(current => ({ ...current, width: shape.value }))}><Image src={'/images/interface/fit-' + shape.value + '.svg'} alt="" width={35} height={75} /><span><strong>{shape.title}</strong><span>{shape.body}</span></span></button>)}</div><p className="fit-privacy-note">{text('Indicative demo guidance. A fitting can change your final size choice.', 'Conseil indicatif de démonstration. Un essayage peut modifier le choix final.')}</p><div className="fit-bottom-actions"><div><button type="button" className="fit-back" onClick={() => setStep(0)}>{text('Back', 'Retour')}</button><button type="button" className="pdp-add-button" onClick={() => setStep(2)}>{text('Continue', 'Continuer')}</button></div><button className="fit-clear" type="button" onClick={reset}>{text('Clear data', 'Effacer les données')}</button></div></div> : <div className="fit-result-step" role="status"><div className="fit-question-heading"><h2>{text('Your recommended size', 'Votre pointure recommandée')}</h2><p>{localizedText(product.name, state.language)}</p></div>{result ? <><strong className="fit-result-size">EU {result.size}</strong><p>{result.withinRange ? text('Your recommendation for this demonstration.', 'Votre recommandation pour cette démonstration.') : text('This size is outside the range offered for this creation.', 'Cette pointure est en dehors de la gamme proposée pour cette création.')}</p><div className="fit-bottom-actions">{result.withinRange ? <button type="button" className="pdp-add-button" onClick={apply}>{text('Select this size', 'Sélectionner cette pointure')}</button> : <button type="button" className="pdp-add-button" onClick={() => dispatch({ type: 'close' })}>{text('Close', 'Fermer')}</button>}<button type="button" className="fit-clear" onClick={() => setStep(0)}>{text('Edit my answers', 'Modifier mes réponses')}</button></div></> : null}<p className="fit-chart-demo">{text('Illustrative demo chart. Goya has not verified these conversions.', 'Tableau illustratif de démonstration. Ces équivalences n’ont pas été validées par Goya.')}</p></div>}
    </>}
  </section>;
}
