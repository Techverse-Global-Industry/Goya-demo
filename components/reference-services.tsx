'use client';

import Link from 'next/link';
import { useId, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent, ReactNode } from 'react';
import { useShop } from '@/context/shop-context';
import { faqCopy, serviceCopy, serviceRegions } from '@/lib/service-copy';
import type { Country, Currency, Locale } from '@/lib/types';
import { prepareExperiencePhoto, saveExperience } from '@/lib/service-experiences';
import type { ExperiencePhoto, ServiceReceipt } from '@/lib/service-experiences';
import { Icon } from './icon';

const fold = (value: string) => value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim();

function ServiceMain({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <main id="public-content" className={`reference-service-page ${className}`}>{children}</main>;
}

export function NewsletterForm({ className = '' }: { className?: string }) {
  const { state, refresh } = useShop();
  const c = serviceCopy[state.locale];
  const id = useId();
  const [expanded, setExpanded] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState('');
  const [interest, setInterest] = useState({ men: true, women: true });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [reference, setReference] = useState('');
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if(busy) return;
    setBusy(true);setError('');
    try {
      const request = await saveExperience({kind:'newsletter',name:state.user?.name??'Newsletter guest',email:email.trim(),locale:state.locale,details:{men:String(interest.men),women:String(interest.women),consent:'accepted'}},!!state.user);
      setReference(request.id);setSubscribed(true);await refresh(true);
    } catch {setError(state.locale==='fr'?'Votre préférence n’a pas pu être enregistrée. Réessayez.':'Your preference could not be saved. Please try again.');}
    finally {setBusy(false);}
  };
  return <section className={`reference-newsletter ${className}`} aria-labelledby={`${id}-title`}>
    <h2 id={`${id}-title`}>{c.newsletterTitle}</h2><p>{c.newsletterIntro}</p>
    {subscribed ? <><p className="reference-success" role="status"><Icon name="check" />{c.subscribed}</p><Link className="reference-newsletter-request" href="/my-requests">{reference}<Icon name="arrow-right" width={13} /></Link></> : <form method="post" onSubmit={submit}>
      <label htmlFor={`${id}-email`}>{c.email} *</label><div className="reference-newsletter-entry"><input id={`${id}-email`} name="newsletter-email" type="email" autoComplete="email" maxLength={254} required value={email} onFocus={() => setExpanded(true)} onChange={event => { setEmail(event.target.value); setExpanded(true); }} placeholder={c.emailPlaceholder} /><button type="submit" disabled={busy} aria-label={c.subscribe} onFocus={() => setExpanded(true)}><Icon name="arrow-right" width={21} /></button></div>
      {expanded && <div className="reference-newsletter-options"><div><label><input type="checkbox" checked={interest.men} onChange={event => setInterest(current => ({ ...current, men: event.target.checked }))} />{c.newsletterMen}</label><label><input type="checkbox" checked={interest.women} onChange={event => setInterest(current => ({ ...current, women: event.target.checked }))} />{c.newsletterWomen}</label></div><label><input type="checkbox" required />{c.newsletterConsent}</label></div>}
      <small>{c.newsletterDemo}</small>
      {error && <p className="reference-form-error" role="alert">{error}</p>}
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
    <div className="reference-region-preferences"><fieldset><legend>{c.language}</legend><button type="button" aria-pressed={locale === 'en'} onClick={() => setLocale('en')}>English</button><button type="button" aria-pressed={locale === 'fr'} onClick={() => setLocale('fr')}>Français</button></fieldset><label>{c.currency}<select aria-label={c.currency} value={currency} onChange={event => setCurrency(event.target.value as Currency)}><option value="EUR">EUR · €</option><option value="USD">USD · $</option><option value="XOF">XOF · CFA</option></select></label></div>
    <button type="button" className="reference-button" onClick={() => { dispatch({ type: 'market', market }); dispatch({ type: 'currency', currency }); dispatch({ type: 'locale', locale }); if (onComplete) onComplete(); else dispatch({ type: 'close' }); }}>{c.apply}<Icon name="arrow-right" width={17} /></button><small className="reference-demo-note">{c.regionNote}</small>
  </section>;
}

export { DemoRecovery as DemoPasswordRecovery } from './account-security';

export { SizeGuide } from './fit-guide';

export function CustomerServicePage() {
  const { state, refresh } = useShop();
  const c = serviceCopy[state.locale];
  const [attachment, setAttachment] = useState<ExperiencePhoto | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState('');
  const [preview, setPreview] = useState<Record<string, string> | null>(null);
  const [photoBusy,setPhotoBusy] = useState(false);
  const [busy,setBusy] = useState(false);
  const [requestError,setRequestError] = useState('');
  const [receipt,setReceipt] = useState<ServiceReceipt|null>(null);
  const fileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;setFileError('');
    if(!file){setAttachment(null);return;}setPhotoBusy(true);
    try {setAttachment(await prepareExperiencePhoto(file));} catch {setFileError(c.attachmentError);setAttachment(null);if(fileInput.current)fileInput.current.value='';} finally {setPhotoBusy(false);}
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();if(busy||photoBusy)return;
    const values = new FormData(event.currentTarget);
    const details=Object.fromEntries(['firstName','lastName','email','phone','country','language','subject','message'].map(key=>[key,String(values.get(key)??'')]));
    setBusy(true);setRequestError('');
    try {const saved=await saveExperience({kind:'contact',name:`${details.firstName} ${details.lastName}`.trim(),email:details.email,locale:state.locale,details:{...details,subject:c.topics[Number(details.subject)]??c.topics[0]},attachments:attachment?[attachment]:undefined},!!state.user);setReceipt(saved);setPreview(details);await refresh(true);}catch{setRequestError(state.locale==='fr'?'Votre demande n’a pas pu être enregistrée. Réessayez.':'Your request could not be saved. Please try again.');}finally{setBusy(false);}
  };
  return <ServiceMain className="reference-customer-care"><header className="reference-service-heading"><h1>{c.customerCare}</h1><p>{c.careIntro}</p><p>{c.careSecond}</p><nav aria-label={c.quickHelp}><Link href="/faq">{c.exploreFaq}</Link><Link href="/track-order">{c.orderLink}</Link><Link href="/book-an-appointment">{c.book}</Link></nav></header>
    <section className="reference-contact-stage" id="contact-form"><div className="reference-contact-card"><h2>{c.contactUs}</h2>{preview && <div className="reference-request-preview"><h3><Icon name="check" />{c.requestReady}</h3><p role="status">{c.requestNote}</p>{receipt && <p className="reference-contact-receipt"><strong>{receipt.id}</strong><Link href="/my-requests">{state.locale === 'fr' ? 'Voir mes demandes' : 'View my requests'}<Icon name="arrow-right" width={15} /></Link></p>}<dl><div><dt>{c.firstName}</dt><dd>{preview.firstName} {preview.lastName}</dd></div><div><dt>{c.email}</dt><dd>{preview.email}</dd></div><div><dt>{c.phone}</dt><dd>{preview.phone}</dd></div><div><dt>{c.country}</dt><dd>{serviceRegions.find(region => region.code === preview.country)?.name[state.locale] ?? preview.country}</dd></div><div><dt>{c.language}</dt><dd>{preview.language === 'fr' ? 'Français' : 'English'}</dd></div><div><dt>{c.subject}</dt><dd>{c.topics[Number(preview.subject)] ?? c.topics[0]}</dd></div><div><dt>{c.message}</dt><dd>{preview.message}</dd></div>{attachment && <div><dt>{c.attachment}</dt><dd>{attachment.name}</dd></div>}</dl><button className="reference-button" type="button" onClick={() => { setPreview(null); setReceipt(null); }}>{c.editRequest}<Icon name="arrow-right" /></button></div>}<form method="post" className="reference-contact-form" hidden={preview !== null} onSubmit={submit}>
      <label className="reference-field-full">{c.title} *<select aria-label={c.title} name="title" required defaultValue=""><option value="" disabled>{c.select}</option><option value="man">{c.man}</option><option value="woman">{c.woman}</option><option value="unspecified">{c.preferNot}</option></select></label>
      <label>{c.firstName} *<input name="firstName" autoComplete="given-name" placeholder={c.firstName} required maxLength={100} /></label><label>{c.lastName} *<input name="lastName" autoComplete="family-name" placeholder={c.lastName} required maxLength={100} /></label>
      <label>{c.email} *<input type="email" name="email" autoComplete="email" placeholder={c.email} required maxLength={254} /></label><label>{c.phone} *<input type="tel" name="phone" autoComplete="tel" placeholder={c.phone} required maxLength={35} /></label>
      <label>{c.country} *<select aria-label={c.country} name="country" defaultValue={state.market} required>{serviceRegions.map(region => <option key={region.code} value={region.code}>{region.name[state.locale]}</option>)}</select></label><label>{c.language} *<select aria-label={c.language} name="language" defaultValue={state.locale} required><option value="en">English</option><option value="fr">Français</option></select></label>
      <label className="reference-field-full">{c.subject} *<select aria-label={c.subject} name="subject" required defaultValue=""><option value="" disabled>{c.selectTopic}</option>{c.topics.map((topic, index) => <option key={index} value={index}>{topic}</option>)}</select></label><label className="reference-field-full">{c.message} *<textarea name="message" placeholder={c.writeHere} rows={5} required minLength={5} maxLength={3000} /></label>
      <div className="reference-field-full reference-attachment"><label htmlFor="reference-contact-attachment">{c.attachment}<span>{c.selectFile}<Icon name="plus" width={18} /></span><input id="reference-contact-attachment" type="file" ref={fileInput} accept="image/jpeg,image/png,image/webp" disabled={photoBusy} onChange={fileChange} /></label><small>{attachment?.name ?? c.fileLimit}</small>{attachment && <button type="button" className="reference-text-link" onClick={() => { setAttachment(null); setFileError(''); if (fileInput.current) fileInput.current.value = ''; }}>{c.remove}<Icon name="close" width={13} /></button>}{fileError && <p className="reference-form-error" role="alert">{fileError}</p>}</div>
      <div className="reference-field-full reference-checkbox"><input id="reference-contact-consent" type="checkbox" required /><label htmlFor="reference-contact-consent">{c.consent}</label><Link href="#privacy">{c.privacy}</Link></div><small className="reference-field-full reference-demo-note">{c.formDemo}</small>{requestError && <p className="reference-field-full reference-form-error" role="alert">{requestError}</p>}<button type="submit" className="reference-button reference-field-full" disabled={busy || photoBusy}>{busy ? (state.locale === 'fr' ? 'Enregistrement…' : 'Saving…') : c.send}<Icon name="arrow-right" width={17} /></button>
    </form></div></section><section className="reference-service-privacy" id="privacy"><h2>{c.privacyTitle}</h2><p>{c.privacyText}</p></section>
  </ServiceMain>;
}

export { StoreFinderPage as StoresPage } from './store-experience';
export { PersonalizationHub as PersonalizationPage } from './personalization-experience';

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
  return <ServiceMain className="reference-shipping"><header className="reference-service-heading"><h1>{c.shippingReturns}</h1><p>{c.shippingIntro}</p></header><div className="reference-faq-layout"><nav aria-label={c.shippingReturns}><a href="#shipping">{c.shipping}<Icon name="arrow-right" width={14} /></a><a href="#returns">{c.returns}<Icon name="arrow-right" width={14} /></a><Link href="/track-order">{c.orderLink}<Icon name="arrow-right" width={14} /></Link></nav><div className="reference-faq-answers">{groups.map(group => <section id={group.id} key={group.id}><h2>{group.label}</h2>{group.entries.map(([question, answer]) => <details key={question}><summary><h3>{question}</h3><Icon name="plus" width={18} /></summary><p>{answer}</p></details>)}</section>)}<small className="reference-demo-note">{c.shippingDemo}</small><Link className="reference-text-link" href="/returns">{c.returns}<Icon name="arrow-right" width={16} /></Link><Link className="reference-text-link" href="/customer-service#contact-form">{c.contactUs}<Icon name="arrow-right" width={16} /></Link></div></div></ServiceMain>;
}
