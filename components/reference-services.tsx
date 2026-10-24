'use client';

import Link from 'next/link';
import { useId, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent, ReactNode } from 'react';
import { useShop } from '@/context/shop-context';
import { translatedCopy, siteText, marketName, languageName } from '@/lib/international';
import { CONTACT_COUNTRIES } from '@/lib/contact-countries';
import { exactFaqCopy } from '@/lib/exact-faq-copy';
import { faqCopy, serviceCopy } from '@/lib/service-copy';
import { prepareExperiencePhoto, saveExperience } from '@/lib/service-experiences';
import type { ExperiencePhoto, ServiceReceipt } from '@/lib/service-experiences';
import { Icon } from './icon';

function ServiceMain({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <main id="public-content" className={`reference-service-page ${className}`}>{children}</main>;
}

export function NewsletterForm({ className = '', variant = 'footer' }: { className?: string; variant?: 'footer'|'popup' }) {
  const { state, refresh } = useShop();
  const c = translatedCopy(serviceCopy[state.locale],state.language);
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
  return <section className={'reference-newsletter reference-newsletter--'+variant+' '+className} aria-labelledby={id+'-title'}>
    <h2 id={id+'-title'}>{c.newsletterTitle}</h2><p>{c.newsletterIntro}</p>
    {subscribed ? <><p className="reference-success" role="status"><Icon name="check" />{c.subscribed}</p><Link className="reference-newsletter-request" href="/my-requests">{reference}<Icon name="arrow-right" width={13} /></Link></> : <form method="post" onSubmit={submit}>
      <label htmlFor={id+'-email'}>{c.email} *</label><div className="reference-newsletter-entry"><input id={id+'-email'} name="newsletter-email" type="email" autoComplete="email" maxLength={254} required value={email} onFocus={()=>setExpanded(true)} onChange={event=>{setEmail(event.target.value);setExpanded(true);}} placeholder={c.emailPlaceholder} />{variant==='footer' && <button type="submit" disabled={busy} aria-label={c.subscribe} onFocus={()=>setExpanded(true)}><Icon name="arrow-right" width={21} /></button>}</div>
      {(expanded||variant==='popup') && <div className="reference-newsletter-options">{variant==='footer' && <div><label><input type="checkbox" checked={interest.men} onChange={event=>setInterest(current=>({...current,men:event.target.checked}))} />{c.newsletterMen}</label><label><input type="checkbox" checked={interest.women} onChange={event=>setInterest(current=>({...current,women:event.target.checked}))} />{c.newsletterWomen}</label></div>}<label><input type="checkbox" required />{c.newsletterConsent}</label></div>}
      {variant==='popup' && <button type="submit" className="reference-newsletter-signup" disabled={busy}>{siteText(state.language,'Sign up','S’inscrire')}</button>}<small>{c.newsletterDemo}</small>{error && <p className="reference-form-error" role="alert">{error}</p>}
    </form>}
  </section>;
}

export { CountrySelector as RegionSelector } from './international-selector';
export { DemoRecovery as DemoPasswordRecovery } from './account-security';
export { SizeGuide } from './fit-guide';

export function CustomerServicePage() {
  const { state, refresh } = useShop();
  const c = translatedCopy(serviceCopy[state.locale],state.language);
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
    const details=Object.fromEntries(['title','firstName','lastName','email','phone','country','language','subject','message'].map(key=>[key,String(values.get(key)??'')]));
    setBusy(true);setRequestError('');
    try {const saved=await saveExperience({kind:'contact',name:`${details.firstName} ${details.lastName}`.trim(),email:details.email,locale:state.locale,details:{...details,subject:c.topics[Number(details.subject)]??c.topics[0]},attachments:attachment?[attachment]:undefined},!!state.user);setReceipt(saved);setPreview(details);await refresh(true);}catch{setRequestError(state.locale==='fr'?'Votre demande n’a pas pu être enregistrée. Réessayez.':'Your request could not be saved. Please try again.');}finally{setBusy(false);}
  };
  return <ServiceMain className="reference-customer-care"><header className="reference-service-heading"><h1>{c.customerCare}</h1><p>{c.careIntro}</p><p>{c.careSecond}</p></header>
    <section className="reference-contact-stage" id="contact-form"><div className="reference-contact-card"><h2>{c.contactUs}</h2>{preview && <div className="reference-request-preview"><h3><Icon name="check" />{c.requestReady}</h3><p role="status">{c.requestNote}</p>{receipt && <p className="reference-contact-receipt"><strong>{receipt.id}</strong><Link href="/my-requests">{siteText(state.language,'View my requests','Voir mes demandes')}<Icon name="arrow-right" width={15} /></Link></p>}<dl><div><dt>{c.firstName}</dt><dd>{preview.firstName} {preview.lastName}</dd></div><div><dt>{c.email}</dt><dd>{preview.email}</dd></div><div><dt>{c.phone}</dt><dd>{preview.phone}</dd></div><div><dt>{c.country}</dt><dd>{marketName(preview.country,state.language)}</dd></div><div><dt>{c.language}</dt><dd>{languageName(preview.language,state.language)}</dd></div><div><dt>{c.subject}</dt><dd>{c.topics[Number(preview.subject)] ?? c.topics[0]}</dd></div><div><dt>{c.message}</dt><dd>{preview.message}</dd></div>{attachment && <div><dt>{c.attachment}</dt><dd>{attachment.name}</dd></div>}</dl><button className="reference-button" type="button" onClick={() => { setPreview(null); setReceipt(null); }}>{c.editRequest}<Icon name="arrow-right" /></button></div>}<form method="post" className="reference-contact-form" hidden={preview !== null} onSubmit={submit}>
      <label className="reference-field-full">{c.title} *<select aria-label={c.title} name="title" required defaultValue=""><option value="" disabled>{c.select}</option><option value="man">{c.man}</option><option value="woman">{c.woman}</option><option value="unspecified">{c.preferNot}</option></select></label>
      <label>{c.firstName} *<input name="firstName" autoComplete="given-name" placeholder={c.firstName} required maxLength={100} /></label><label>{c.lastName} *<input name="lastName" autoComplete="family-name" placeholder={c.lastName} required maxLength={100} /></label>
      <label>{c.email} *<input type="email" name="email" autoComplete="email" placeholder={c.email} required maxLength={254} /></label><label>{c.phone} *<input type="tel" name="phone" autoComplete="tel" placeholder={c.phone} required maxLength={35} /></label>
      <label>{c.country} *<select aria-label={c.country} name="country" defaultValue={state.market==='WW'?'':state.market} required><option value="" disabled>{c.select}</option>{CONTACT_COUNTRIES.map(country=><option key={country} value={country}>{marketName(country,state.language)}</option>)}</select></label><label>{c.language} *<select aria-label={c.language} name="language" defaultValue={state.language} required>{(['it','en','fr','de','es','ja','ar'] as const).map(language=><option key={language} value={language}>{languageName(language,state.language)}</option>)}</select></label>
      <label className="reference-field-full">{c.subject} *<select aria-label={c.subject} name="subject" required defaultValue=""><option value="" disabled>{c.selectTopic}</option>{c.topics.map((topic, index) => <option key={index} value={index}>{topic}</option>)}</select></label><label className="reference-field-full">{c.message} *<textarea name="message" placeholder={c.writeHere} rows={5} required minLength={5} maxLength={3000} /></label>
      <div className="reference-field-full reference-attachment"><label htmlFor="reference-contact-attachment">{c.attachment}<span>{c.selectFile}<Icon name="plus" width={18} /></span><input id="reference-contact-attachment" type="file" ref={fileInput} accept="image/jpeg,image/png,image/webp" disabled={photoBusy} onChange={fileChange} /></label><small>{attachment?.name ?? c.fileLimit}</small>{attachment && <button type="button" className="reference-text-link" onClick={() => { setAttachment(null); setFileError(''); if (fileInput.current) fileInput.current.value = ''; }}>{c.remove}<Icon name="close" width={13} /></button>}{fileError && <p className="reference-form-error" role="alert">{fileError}</p>}</div>
      <div className="reference-field-full reference-checkbox"><input id="reference-contact-consent" type="checkbox" required /><label htmlFor="reference-contact-consent">{c.consent}</label><Link href="#privacy">{c.privacy}</Link></div><small className="reference-field-full reference-demo-note">{c.formDemo}</small>{requestError && <p className="reference-field-full reference-form-error" role="alert">{requestError}</p>}<button type="submit" className="reference-button reference-field-full" disabled={busy || photoBusy}>{busy ? (state.locale === 'fr' ? 'Enregistrement…' : 'Saving…') : c.send}<Icon name="arrow-right" width={17} /></button>
    </form></div></section><section className="reference-service-privacy" id="privacy"><h2>{c.privacyTitle}</h2><p>{c.privacyText}</p></section>
  </ServiceMain>;
}

export { StoreFinderPage as StoresPage } from './store-experience';
export { PersonalizationHub as PersonalizationPage } from './personalization-experience';

export function FaqPage({initialSection='products'}:{initialSection?:string}={}) {
  const {state}=useShop();const c=translatedCopy(serviceCopy[state.locale],state.language);
  const supplemental=translatedCopy(exactFaqCopy[state.locale],state.language);
  const groups=translatedCopy({groups:faqCopy[state.locale]},state.language).groups.map(group=>({...group,entries:group.id==='shipping'?supplemental.shipping:group.id==='returns'?supplemental.returns:group.entries}));
  const current=groups.find(group=>group.id===initialSection)??groups[0];
  return <ServiceMain className="reference-faq"><header className="reference-service-heading"><h1>{c.faq}</h1></header><div className="reference-faq-layout"><nav aria-label={c.faq}>{groups.map(group=><Link key={group.id} href={group.id==='products'?'/faq':'/faq?category='+group.id} aria-current={current.id===group.id?'page':undefined}>{group.label}</Link>)}</nav><section className="reference-faq-answers" key={current.id}>{current.entries.map(([question,answer],index)=><details key={question} open={index<5}><summary><h3>{question}</h3><span className="exact-faq-symbol"><Icon name="plus" width={16}/><Icon name="minus" width={16}/></span></summary><p>{answer}</p></details>)}<Link href={current.id==='returns'?'/returns':'/customer-service'} className="reference-text-link">{current.id==='returns'?c.returns:c.contactUs}<Icon name="arrow-right" width={16}/></Link></section></div></ServiceMain>;
}

export function ShippingReturnsPage(){return <FaqPage initialSection="shipping"/>;}
