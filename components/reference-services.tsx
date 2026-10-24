'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useId, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent, ReactNode } from 'react';
import { useShop } from '@/context/shop-context';
import { faqCopy, serviceCopy, serviceRegions } from '@/lib/service-copy';
import type { Country, Currency, Locale } from '@/lib/types';
import { CampaignMedia } from './campaign-media';
import { Icon } from './icon';

const fold = (value: string) => value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim();

function ServiceMain({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <main id="public-content" className={`reference-service-page ${className}`}>{children}</main>;
}

export function NewsletterForm({ className = '' }: { className?: string }) {
  const { state } = useShop();
  const c = serviceCopy[state.locale];
  const id = useId();
  const [expanded, setExpanded] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState('');
  const [interest, setInterest] = useState({ men: true, women: true });
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try { window.localStorage.setItem('goya-newsletter-demo-v1', JSON.stringify({ email: email.trim(), ...interest, locale: state.locale })); } catch { /* The visible preview also works with unavailable storage. */ }
    setSubscribed(true);
  };
  return <section className={`reference-newsletter ${className}`} aria-labelledby={`${id}-title`}>
    <h2 id={`${id}-title`}>{c.newsletterTitle}</h2><p>{c.newsletterIntro}</p>
    {subscribed ? <p className="reference-success" role="status"><Icon name="check" />{c.subscribed}</p> : <form method="post" onSubmit={submit}>
      <label htmlFor={`${id}-email`}>{c.email} *</label><div className="reference-newsletter-entry"><input id={`${id}-email`} name="newsletter-email" type="email" autoComplete="email" maxLength={254} required value={email} onFocus={() => setExpanded(true)} onChange={event => { setEmail(event.target.value); setExpanded(true); }} placeholder={c.emailPlaceholder} /><button type="submit" aria-label={c.subscribe} onFocus={() => setExpanded(true)}><Icon name="arrow-right" width={21} /></button></div>
      {expanded && <div className="reference-newsletter-options"><div><label><input type="checkbox" checked={interest.men} onChange={event => setInterest(current => ({ ...current, men: event.target.checked }))} />{c.newsletterMen}</label><label><input type="checkbox" checked={interest.women} onChange={event => setInterest(current => ({ ...current, women: event.target.checked }))} />{c.newsletterWomen}</label></div><label><input type="checkbox" required />{c.newsletterConsent}</label></div>}
      <small>{c.newsletterDemo}</small>
    </form>}
  </section>;
}

export function RegionSelector({ onComplete }: { onComplete?: () => void } = {}) {
  const { state, dispatch } = useShop();
  const c = serviceCopy[state.locale];
  const [market, setMarket] = useState<Country>(state.market);
  const [locale, setLocale] = useState<Locale>(state.locale);
  const [currency, setCurrency] = useState<Currency>(state.currency);
  const [area, setArea] = useState('all');
  const [query, setQuery] = useState('');
  const regions = serviceRegions.filter(region => (area === 'all' || region.area === area) && fold(region.name[state.locale]).includes(fold(query)));
  return <section className="reference-region"><h2>{c.chooseCountry}</h2><p>{c.countriesHint}</p><label className="reference-region-search"><Icon name="search" /><input type="search" aria-label={c.countrySearch} placeholder={c.countrySearch} value={query} onChange={event => setQuery(event.target.value)} /></label>
    <div className="reference-region-tabs" role="group" aria-label={c.country}>{(['all', 'africa', 'europe', 'america'] as const).map(value => <button type="button" key={value} aria-pressed={area === value} onClick={() => setArea(value)}>{c[value]}</button>)}</div>
    <div className="reference-region-countries" role="group" aria-label={c.chooseCountry}>{regions.map(region => <button type="button" key={region.code} aria-pressed={market === region.code} onClick={() => { setMarket(region.code); setCurrency(region.currency); }}><span>{region.name[state.locale]}</span>{market === region.code && <Icon name="check" width={17} />}</button>)}</div>{regions.length === 0 && <p role="status">{c.noCountries}</p>}
    <div className="reference-region-preferences"><fieldset><legend>{c.language}</legend><button type="button" aria-pressed={locale === 'en'} onClick={() => setLocale('en')}>English</button><button type="button" aria-pressed={locale === 'fr'} onClick={() => setLocale('fr')}>Français</button></fieldset><label>{c.currency}<select value={currency} onChange={event => setCurrency(event.target.value as Currency)}><option value="EUR">EUR · €</option><option value="USD">USD · $</option><option value="XOF">XOF · CFA</option></select></label></div>
    <button type="button" className="reference-button" onClick={() => { dispatch({ type: 'market', market }); dispatch({ type: 'currency', currency }); dispatch({ type: 'locale', locale }); if (onComplete) onComplete(); else dispatch({ type: 'close' }); }}>{c.apply}<Icon name="arrow-right" width={17} /></button><small className="reference-demo-note">{c.regionNote}</small>
  </section>;
}

export function DemoPasswordRecovery({ onComplete }: { onComplete?: () => void } = {}) {
  const { state, dispatch } = useShop();
  const c = serviceCopy[state.locale];
  const id = useId();
  const [step, setStep] = useState<'email' | 'password' | 'complete'>('email');
  const [error, setError] = useState('');
  const close = () => { if (onComplete) onComplete(); else dispatch({ type: 'close' }); };
  return <section className="reference-recovery"><h2>{step === 'email' ? c.recovery : step === 'password' ? c.resetTitle : c.passwordPreview}</h2>
    {step === 'email' && <><p>{c.recoveryIntro}</p><form method="post" onSubmit={event => { event.preventDefault(); setStep('password'); }}><label htmlFor={`${id}-email`}>{c.email} *<input id={`${id}-email`} type="email" autoComplete="email" required maxLength={254} /></label><button className="reference-button" type="submit">{c.recoveryAction}<Icon name="arrow-right" width={17} /></button></form><small className="reference-demo-note">{c.recoveryDemo}</small></>}
    {step === 'password' && <><p role="status">{c.recoverySent}</p><form method="post" onSubmit={event => { event.preventDefault(); const data = new FormData(event.currentTarget); if (data.get('new-password') !== data.get('repeat-password')) { setError(c.passwordMismatch); return; } event.currentTarget.reset(); setError(''); setStep('complete'); }}><label htmlFor={`${id}-new`}>{c.newPassword} *<input id={`${id}-new`} name="new-password" type="password" autoComplete="new-password" minLength={8} maxLength={128} required /></label><label htmlFor={`${id}-repeat`}>{c.repeatPassword} *<input id={`${id}-repeat`} name="repeat-password" type="password" autoComplete="new-password" minLength={8} maxLength={128} required /></label><small>{c.passwordHint}</small>{error && <p className="reference-form-error" role="alert">{error}</p>}<button className="reference-button" type="submit">{c.resetAction}<Icon name="arrow-right" width={17} /></button></form></>}
    {step === 'complete' && <p role="status"><Icon name="check" />{c.passwordUnchanged}</p>}
    <Link href="/login" className="reference-text-link" onClick={close}>{c.backLogin}<Icon name="arrow-right" width={16} /></Link>
  </section>;
}

export function SizeGuide() {
  const { state, dispatch } = useShop();
  const c = serviceCopy[state.locale];
  const [audience, setAudience] = useState(state.filter === 'women' ? 'women' : 'men');
  return <section className="reference-size-guide"><h2>{c.sizeGuide}</h2><div role="group" aria-label={c.shoe} className="reference-size-tabs"><button type="button" aria-pressed={audience === 'men'} onClick={() => setAudience('men')}>{c.man}</button><button type="button" aria-pressed={audience === 'women'} onClick={() => setAudience('women')}>{c.woman}</button></div><h3>{c.fitting}</h3><p>{c.sizeIntro}</p><div className="reference-size-table"><table><caption>{audience === 'men' ? c.man : c.woman} · {c.european}</caption><tbody><tr>{Array.from({ length: 8 }, (_, index) => <td key={index}>{index + 39}</td>)}</tr></tbody></table></div><h3>{c.measurement}</h3><p>{c.measureText}</p><small className="reference-demo-note">{c.sizeNote}</small><Link className="reference-text-link" href="/customer-service" onClick={() => dispatch({ type: 'close' })}>{c.askFit}<Icon name="arrow-right" width={16} /></Link></section>;
}

export function CustomerServicePage() {
  const { state, dispatch } = useShop();
  const c = serviceCopy[state.locale];
  const [attachment, setAttachment] = useState<File | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState('');
  const [preview, setPreview] = useState<Record<string, string> | null>(null);
  const fileChange = (event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0] ?? null; if (file && (file.size > 4 * 1024 * 1024 || (!file.type.startsWith('image/') && file.type !== 'application/pdf'))) { setFileError(c.attachmentError); setAttachment(null); event.target.value = ''; } else { setAttachment(file); setFileError(''); } };
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const values = new FormData(event.currentTarget); setPreview(Object.fromEntries(['firstName', 'lastName', 'email', 'phone', 'country', 'language', 'subject', 'message'].map(key => [key, String(values.get(key) ?? '')]))); };
  return <ServiceMain className="reference-customer-care"><header className="reference-service-heading"><h1>{c.customerCare}</h1><p>{c.careIntro}</p><p>{c.careSecond}</p><nav aria-label={c.quickHelp}><Link href="/faq">{c.exploreFaq}</Link><Link href="/track-order">{c.orderLink}</Link><button type="button" className="reference-text-link" onClick={() => dispatch({ type: 'open', overlay: { kind: 'booking' } })}>{c.book}</button></nav></header>
    <section className="reference-contact-stage" id="contact-form"><div className="reference-contact-card"><h2>{c.contactUs}</h2>{preview && <div className="reference-request-preview"><h3><Icon name="check" />{c.requestReady}</h3><p role="status">{c.requestNote}</p><dl><div><dt>{c.firstName}</dt><dd>{preview.firstName} {preview.lastName}</dd></div><div><dt>{c.email}</dt><dd>{preview.email}</dd></div><div><dt>{c.phone}</dt><dd>{preview.phone}</dd></div><div><dt>{c.country}</dt><dd>{serviceRegions.find(region => region.code === preview.country)?.name[state.locale] ?? preview.country}</dd></div><div><dt>{c.language}</dt><dd>{preview.language === 'fr' ? 'Français' : 'English'}</dd></div><div><dt>{c.subject}</dt><dd>{c.topics[Number(preview.subject)] ?? c.topics[0]}</dd></div><div><dt>{c.message}</dt><dd>{preview.message}</dd></div>{attachment && <div><dt>{c.attachment}</dt><dd>{attachment.name}</dd></div>}</dl><button className="reference-button" type="button" onClick={() => setPreview(null)}>{c.editRequest}<Icon name="arrow-right" /></button></div>}<form method="post" className="reference-contact-form" hidden={preview !== null} onSubmit={submit}>
      <label className="reference-field-full">{c.title} *<select name="title" required defaultValue=""><option value="" disabled>{c.select}</option><option value="man">{c.man}</option><option value="woman">{c.woman}</option><option value="unspecified">{c.preferNot}</option></select></label>
      <label>{c.firstName} *<input name="firstName" autoComplete="given-name" placeholder={c.firstName} required maxLength={100} /></label><label>{c.lastName} *<input name="lastName" autoComplete="family-name" placeholder={c.lastName} required maxLength={100} /></label>
      <label>{c.email} *<input type="email" name="email" autoComplete="email" placeholder={c.email} required maxLength={254} /></label><label>{c.phone} *<input type="tel" name="phone" autoComplete="tel" placeholder={c.phone} required maxLength={35} /></label>
      <label>{c.country} *<select name="country" defaultValue={state.market} required>{serviceRegions.map(region => <option key={region.code} value={region.code}>{region.name[state.locale]}</option>)}</select></label><label>{c.language} *<select name="language" defaultValue={state.locale} required><option value="en">English</option><option value="fr">Français</option></select></label>
      <label className="reference-field-full">{c.subject} *<select name="subject" required defaultValue=""><option value="" disabled>{c.selectTopic}</option>{c.topics.map((topic, index) => <option key={index} value={index}>{topic}</option>)}</select></label><label className="reference-field-full">{c.message} *<textarea name="message" placeholder={c.writeHere} rows={5} required minLength={5} maxLength={5000} /></label>
      <div className="reference-field-full reference-attachment"><label htmlFor="reference-contact-attachment">{c.attachment}<span>{c.selectFile}<Icon name="plus" width={18} /></span><input id="reference-contact-attachment" type="file" ref={fileInput} accept="image/*,.pdf" onChange={fileChange} /></label><small>{attachment?.name ?? c.fileLimit}</small>{attachment && <button type="button" className="reference-text-link" onClick={() => { setAttachment(null); setFileError(''); if (fileInput.current) fileInput.current.value = ''; }}>{c.remove}<Icon name="close" width={13} /></button>}{fileError && <p className="reference-form-error" role="alert">{fileError}</p>}</div>
      <div className="reference-field-full reference-checkbox"><input id="reference-contact-consent" type="checkbox" required /><label htmlFor="reference-contact-consent">{c.consent}</label><Link href="#privacy">{c.privacy}</Link></div><small className="reference-field-full reference-demo-note">{c.formDemo}</small><button type="submit" className="reference-button reference-field-full">{c.send}<Icon name="arrow-right" width={17} /></button>
    </form></div></section><section className="reference-service-privacy" id="privacy"><h2>{c.privacyTitle}</h2><p>{c.privacyText}</p></section>
  </ServiceMain>;
}

const demoStores = [
  { id: 'cotonou', country: 'BJ', area: 'africa', city: 'Cotonou', x: 430, y: 344 },
  { id: 'paris', country: 'FR', area: 'europe', city: 'Paris', x: 430, y: 155 },
  { id: 'dakar', country: 'SN', area: 'africa', city: 'Dakar', x: 307, y: 307 },
] as const;

export function StoresPage() {
  const { state, dispatch } = useShop();
  const c = serviceCopy[state.locale];
  const [query, setQuery] = useState('');
  const [area, setArea] = useState('all');
  const [selected, setSelected] = useState('cotonou');
  const [zoom, setZoom] = useState(1);
  const stores = useMemo(() => demoStores.filter(store => (area === 'all' || store.area === area) && fold(`${store.city} ${serviceRegions.find(region => region.code === store.country)?.name[state.locale]}`).includes(fold(query))), [area, query, state.locale]);
  return <ServiceMain className="reference-stores"><header className="reference-service-heading"><h1>{c.stores}</h1><p>{c.storeIntro}</p></header><div className="reference-store-filter"><select value={area} aria-label={c.allLocations} onChange={event => setArea(event.target.value)}><option value="all">{c.allLocations}</option><option value="africa">{c.africa}</option><option value="europe">{c.europe}</option></select><label><Icon name="search" /><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={c.storeSearch} aria-label={c.storeSearch} /></label></div>
    <p className="reference-store-demo">{c.storeDemo}</p><section className="reference-store-finder"><div className="reference-store-list">{stores.length === 0 && <p role="status">{c.noStores}</p>}{stores.map(store => <article key={store.id} className={selected === store.id ? 'is-selected' : ''}><h2>{c.locationNames[store.id]}</h2><p><Icon name="pin" width={16} />{store.city}, {serviceRegions.find(region => region.code === store.country)?.name[state.locale]}</p><button className="reference-button" type="button" aria-expanded={selected === store.id} onClick={() => setSelected(selected === store.id ? '' : store.id)}>{c.details}</button><a className="reference-text-link" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.city)}`}>{c.cityMap}<Icon name="arrow-up-right" width={15} /></a>{selected === store.id && <div className="reference-store-detail"><strong>{c.locationServices}</strong><p>{c.personalization} · {serviceCopy[state.locale].topics[4]}</p><p>{c.locationTimes}</p><button type="button" className="reference-text-link" onClick={() => dispatch({ type: 'open', overlay: { kind: 'booking' } })}>{c.book}<Icon name="arrow-right" width={15} /></button></div>}</article>)}</div>
      <div className="reference-store-map"><p>{c.mapNote}</p><div className="reference-store-map-art" style={{ transform: `scale(${zoom})` }}><svg viewBox="0 0 800 500" role="img" aria-label={c.mapLabel}><defs><pattern id="reference-map-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#ffffff" strokeWidth="1" /></pattern></defs><rect width="800" height="500" fill="#eef0ed" /><path d="M290 20 435 15 456 67 430 101 492 132 482 171 541 209 590 258 549 295 537 350 494 374 458 457 419 473 378 405 362 351 292 317 271 250 321 200 288 160 319 115 270 80Z" fill="#d9ddd6" /><path d="m76 89 105-40 43 19-7 49 41 21-44 63-35 8-40-46-50-9Z" fill="#d9ddd6" /><rect width="800" height="500" fill="url(#reference-map-grid)" />{stores.map(store => <g key={store.id}><circle cx={store.x} cy={store.y} r={selected === store.id ? 12 : 7} fill={selected === store.id ? '#171717' : '#8e7d62'} /><circle cx={store.x} cy={store.y} r="3" fill="#fff" /><text x={store.x + 18} y={store.y + 5} fill="#292929" fontSize="15">{store.city}</text></g>)}</svg></div><div className="reference-map-controls"><button type="button" aria-label={c.zoomIn} disabled={zoom >= 1.7} onClick={() => setZoom(value => Math.min(1.7, value + .2))}><Icon name="plus" /></button><button type="button" aria-label={c.zoomOut} disabled={zoom <= 1} onClick={() => setZoom(value => Math.max(1, value - .2))}><Icon name="minus" /></button></div></div>
    </section></ServiceMain>;
}

export function PersonalizationPage() {
  const { state } = useShop();
  const c = serviceCopy[state.locale];
  const [initials, setInitials] = useState('GV');
  const [finish, setFinish] = useState<'gold' | 'silver' | 'dark'>('gold');
  return <ServiceMain className="reference-personalization"><section className="reference-personal-hero"><CampaignMedia src="/videos/goya-care-film.mp4" poster="/images/campaign/goya-care-poster.webp" alt={c.personalization} priority /><div className="reference-personal-hero-copy"><h1>{c.personalization}. {c.personalTitle}</h1><p>{c.personalIntro}</p><a href="#design-preview" className="reference-text-link">{c.preview}</a></div></section><section className="reference-personal-intro"><h2>{c.personalHeading}</h2><p>{c.personalBody}</p></section><section className="reference-personal-configurator" id="design-preview"><div className="reference-personal-preview"><Image src="/images/campaign/goya-signature.webp" alt={c.preview} fill sizes="(min-width: 900px) 60vw, 100vw" /><span className="reference-personal-label">{c.preview}</span><span className={`reference-monogram-swatch reference-monogram-swatch--${finish}`} aria-label={`${c.initials}: ${initials || '—'}`}><span>{initials || '—'}</span><small>GOYA</small></span></div><div className="reference-personal-controls"><p className="reference-kicker">MAISON GOYA</p><h2>{c.personalHeading}</h2><label>{c.initials}<input value={initials} onChange={event => setInitials(event.target.value.replace(/[^\p{L}]/gu, '').toUpperCase().slice(0, 3))} maxLength={3} placeholder="GV" aria-describedby="reference-personal-note" /></label><fieldset><legend>{c.finish}</legend><div className="reference-stamp-finishes">{(['gold', 'silver', 'dark'] as const).map(value => <button type="button" key={value} aria-pressed={finish === value} onClick={() => setFinish(value)}><span className={`reference-finish-dot reference-finish-dot--${value}`} />{c[value]}</button>)}</div></fieldset><p id="reference-personal-note" className="reference-demo-note">{c.personalDemo}</p><Link href="/customer-service#contact-form" className="reference-button">{c.personalRequest}<Icon name="arrow-right" width={17} /></Link></div></section><section className="reference-personal-craft"><div><h2>{c.craft}</h2><p>{c.craftBody}</p><Link className="reference-text-link" href="/shoe-care">{c.topics[4]}<Icon name="arrow-right" width={17} /></Link></div><div className="reference-personal-craft-image"><Image src="/images/img1.jpg" alt={c.craft} fill sizes="(min-width: 900px) 50vw, 100vw" /></div></section></ServiceMain>;
}

export function FaqPage() {
  const { state } = useShop();
  const c = serviceCopy[state.locale];
  const [selected, setSelected] = useState('products');
  const groups = faqCopy[state.locale];
  const current = groups.find(group => group.id === selected) ?? groups[0];
  return <ServiceMain className="reference-faq"><header className="reference-service-heading"><h1>{c.faq}</h1></header><div className="reference-faq-layout"><nav aria-label={c.faq}>{groups.map(group => <button key={group.id} type="button" aria-current={selected === group.id ? 'page' : undefined} onClick={() => setSelected(group.id)}>{group.label}<Icon name="chevron" width={14} /></button>)}</nav><section className="reference-faq-answers" key={selected}><h2>{current.label}</h2>{current.entries.map(([question, answer]) => <details key={question}><summary><h3>{question}</h3><Icon name="plus" width={18} /></summary><p>{answer}</p></details>)}<Link href="/customer-service" className="reference-text-link">{c.contactUs}<Icon name="arrow-right" width={16} /></Link></section></div></ServiceMain>;
}

export function ShippingReturnsPage() {
  const { state } = useShop();
  const c = serviceCopy[state.locale];
  const groups = faqCopy[state.locale].filter(group => group.id === 'shipping' || group.id === 'returns');
  return <ServiceMain className="reference-shipping"><header className="reference-service-heading"><h1>{c.shippingReturns}</h1><p>{c.shippingIntro}</p></header><div className="reference-faq-layout"><nav aria-label={c.shippingReturns}><a href="#shipping">{c.shipping}<Icon name="arrow-right" width={14} /></a><a href="#returns">{c.returns}<Icon name="arrow-right" width={14} /></a><Link href="/track-order">{c.orderLink}<Icon name="arrow-right" width={14} /></Link></nav><div className="reference-faq-answers">{groups.map(group => <section id={group.id} key={group.id}><h2>{group.label}</h2>{group.entries.map(([question, answer]) => <details key={question}><summary><h3>{question}</h3><Icon name="plus" width={18} /></summary><p>{answer}</p></details>)}</section>)}<small className="reference-demo-note">{c.shippingDemo}</small><Link className="reference-text-link" href="/customer-service#contact-form">{c.contactUs}<Icon name="arrow-right" width={16} /></Link></div></div></ServiceMain>;
}
