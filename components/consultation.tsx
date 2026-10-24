'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useId, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { useShop } from '@/context/shop-context';
import { siteText, translatedCopy } from '@/lib/international';

import { experienceCopy, saveExperience } from '@/lib/service-experiences';
import type { ExperienceKind, ExperiencePhoto, ServiceReceipt } from '@/lib/service-experiences';
import { Icon } from './icon';
import { BookingJourney } from './booking-journey';

export function ExperienceProgress({ receipt }: { receipt: ServiceReceipt }) {
  const { state } = useShop();
  const c = translatedCopy(experienceCopy[state.locale],state.language);
  const own = (state as typeof state & { requests?: ServiceReceipt[] }).requests?.find(request => request.id === receipt.id) ?? receipt;
  const stages = ['received', 'reviewing', 'confirmed', 'completed'] as const;
  const current = stages.indexOf(own.status as typeof stages[number]);
  return <div className="experience-receipt"><span className="experience-confirmation-mark"><Icon name="check" width={29} /></span><h2>{c.requestSaved}</h2><p>{c.requestIntro}</p><dl><div><dt>{c.reference}</dt><dd>{own.id}</dd></div><div><dt>{c.status}</dt><dd>{c[own.status]}</dd></div></dl><ol className="experience-progress" aria-label={c.requestProgress}>{stages.map((stage,index) => <li className={index <= current ? 'is-complete' : ''} key={stage} aria-current={index === current ? 'step' : undefined}><span>{index <= current ? <Icon name="check" width={13} /> : index + 1}</span>{c[stage]}</li>)}</ol>{own.note && <p className="experience-request-note" translate="no">{own.note}</p>}<div className="experience-receipt-links"><Link href="/my-requests" className="reference-button">{c.requests}<Icon name="arrow-right" width={17} /></Link><Link href="/personalization" className="reference-text-link">{c.another}</Link></div><small className="reference-demo-note">{c.demo}</small></div>;
}

export function ExperienceSubmission({ kind, details, productId, attachments, children, onEdit, note }: { kind: ExperienceKind; details: Record<string,string>; productId?: string; attachments?: ExperiencePhoto[]; children?: ReactNode; onEdit?: () => void; note?: string }) {
  const { state, refresh } = useShop(); const c = translatedCopy(experienceCopy[state.locale],state.language);
  const id = useId(); const submitting = useRef(false);
  const [busy,setBusy] = useState(false); const [error,setError] = useState(''); const [receipt,setReceipt] = useState<ServiceReceipt|null>(null);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (submitting.current) return;
    const values = new FormData(event.currentTarget);
    submitting.current = true;setBusy(true);setError('');
    try {
      const saved = await saveExperience({kind,name:String(values.get('name')??'').trim(),email:String(values.get('email')??'').trim(),locale:state.locale,productId,attachments,details:{...details,phone:String(values.get('phone')??'').trim(),notes:String(values.get('notes')??'').trim()}},!!state.user);
      setReceipt(saved);await refresh(true);
    } catch {setError(c.failed);} finally {submitting.current=false;setBusy(false);}
  };
  if(receipt) return <ExperienceProgress receipt={receipt} />;
  return <div className="experience-submission"><div className="experience-selection-summary"><p className="reference-kicker">{c.review}</p><h2>{c.description}</h2><dl>{Object.entries(details).filter(([,value])=>value).map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>{attachments && attachments.length>0 && <p>{attachments.length} {c.photos.toLowerCase()}</p>}{onEdit && <button type="button" className="reference-text-link" onClick={onEdit}>{c.detailsEdit}<Icon name="arrow-left" width={15} /></button>}{children}</div><form method="post" className="experience-contact-form" onSubmit={submit} key={state.user?.id??'guest'}><h2>{c.contact}</h2><label htmlFor={`${id}-name`}>{c.firstName} *<input id={`${id}-name`} name="name" autoComplete="name" required minLength={2} maxLength={100} defaultValue={state.user?.name??''} /></label><label htmlFor={`${id}-email`}>{c.email} *<input id={`${id}-email`} name="email" type="email" autoComplete="email" required maxLength={254} defaultValue={state.user?.email??''} /></label><label htmlFor={`${id}-phone`}>{c.phone}<input id={`${id}-phone`} name="phone" type="tel" autoComplete="tel" maxLength={40} defaultValue={state.profile?.phone??''} /></label><label htmlFor={`${id}-notes`}>{c.notes}<textarea id={`${id}-notes`} name="notes" rows={4} maxLength={3000} /></label><label className="experience-consent"><input type="checkbox" required />{c.consent}</label>{error && <p className="reference-form-error" role="alert">{error}</p>}<button type="submit" className="reference-button" disabled={busy}>{busy?c.sending:c.send}<Icon name="arrow-right" width={17} /></button><small className="reference-demo-note">{note??c.demo}</small></form></div>;
}

export function ConsultationForm({ initialMode='boutique',initialLocation='cotonou',initialService }: { initialMode?:'online'|'boutique';initialLocation?:'cotonou'|'paris'|'dakar';initialService?:string }) {
  return <BookingJourney mode={initialMode} initialLocation={initialLocation} initialService={initialService}/>;
}

export function AppointmentsPage({ initialMode,initialLocation='cotonou',initialService }: { initialMode?:'online'|'boutique';initialLocation?:'cotonou'|'paris'|'dakar';initialService?:string }={}) {
  const {state}=useShop();const c=translatedCopy(experienceCopy[state.locale],state.language);
  if(initialMode)return <main id="public-content" className="reference-service-page experience-appointments exact-appointments"><ConsultationForm key={initialMode+'-'+initialLocation+'-'+initialService} initialMode={initialMode} initialLocation={initialLocation} initialService={initialService}/></main>;
  const suffix=initialService?'&service='+encodeURIComponent(initialService):'';
  return <main id="public-content" className="reference-service-page experience-appointments exact-appointments"><h1 className="sr-only">{c.consultation}</h1><section className="consultation-landing">{(['online','boutique'] as const).map(mode=><article key={mode}><div className="consultation-landing-photo"><Image src={mode==='online'?'/images/campaign/goya-signature.webp':'/images/img1.jpg'} alt={c[mode]} fill preload sizes="(min-width:700px) 50vw,100vw"/></div><div className="exact-consultation-choice-copy"><h2>{c[mode]}</h2><p>{mode==='online'?c.onlineBody:c.boutiqueBody}</p><Link href={'/book-an-appointment?mode='+mode+suffix} className="fashion-link">{siteText(state.language,'Book now','Prendre rendez-vous')}</Link></div></article>)}</section></main>;
}
