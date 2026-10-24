'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useId, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { useShop } from '@/context/shop-context';
import { bookingDateRange, isTimeAvailable } from '@/lib/commerce';
import { experienceCopy, saveExperience } from '@/lib/service-experiences';
import type { ExperienceKind, ExperiencePhoto, ServiceReceipt } from '@/lib/service-experiences';
import { Icon } from './icon';

export function ExperienceProgress({ receipt }: { receipt: ServiceReceipt }) {
  const { state } = useShop();
  const c = experienceCopy[state.locale];
  const own = (state as typeof state & { requests?: ServiceReceipt[] }).requests?.find(request => request.id === receipt.id) ?? receipt;
  const stages = ['received', 'reviewing', 'confirmed', 'completed'] as const;
  const current = stages.indexOf(own.status as typeof stages[number]);
  return <div className="experience-receipt"><span className="experience-confirmation-mark"><Icon name="check" width={29} /></span><h2>{c.requestSaved}</h2><p>{c.requestIntro}</p><dl><div><dt>{c.reference}</dt><dd>{own.id}</dd></div><div><dt>{c.status}</dt><dd>{c[own.status]}</dd></div></dl><ol className="experience-progress" aria-label={c.requestProgress}>{stages.map((stage,index) => <li className={index <= current ? 'is-complete' : ''} key={stage} aria-current={index === current ? 'step' : undefined}><span>{index <= current ? <Icon name="check" width={13} /> : index + 1}</span>{c[stage]}</li>)}</ol>{own.note && <p className="experience-request-note">{own.note}</p>}<div className="experience-receipt-links"><Link href="/my-requests" className="reference-button">{c.requests}<Icon name="arrow-right" width={17} /></Link><Link href="/personalization" className="reference-text-link">{c.another}</Link></div><small className="reference-demo-note">{c.demo}</small></div>;
}

export function ExperienceSubmission({ kind, details, productId, attachments, children, onEdit, note }: { kind: ExperienceKind; details: Record<string,string>; productId?: string; attachments?: ExperiencePhoto[]; children?: ReactNode; onEdit?: () => void; note?: string }) {
  const { state, refresh } = useShop(); const c = experienceCopy[state.locale];
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

export function ConsultationForm({ initialMode = 'boutique', initialLocation = 'cotonou' }: { initialMode?: 'online'|'boutique'; initialLocation?: 'cotonou'|'paris'|'dakar' }) {
  const { state } = useShop(); const c = experienceCopy[state.locale];
  const [mode,setMode] = useState(initialMode); const [location,setLocation] = useState(initialLocation);
  const [date,setDate] = useState(''); const [time,setTime] = useState(''); const [topic,setTopic] = useState('product'); const [review,setReview] = useState(false); const [dateError,setDateError] = useState(false);
  const range = bookingDateRange(location);
  const topicLabel = topic==='product'?c.productAdvice:topic==='personalization'?c.personalizationAdvice:c.careAdvice;
  const storeName = {cotonou:'Cotonou',paris:'Paris',dakar:'Dakar'}[location];
  const next = (event:FormEvent<HTMLFormElement>) => {event.preventDefault();const weekday=new Date(`${date}T12:00:00Z`).getUTCDay();if(weekday===0||!isTimeAvailable({location,date,time},[])){setDateError(true);return;}setDateError(false);setReview(true);};
  if(review)return <ExperienceSubmission kind="consultation" details={{[c.consultation]:mode==='online'?c.online:c.boutique,[c.chooseLocation]:mode==='online'?`${c.onlineMeeting} · ${storeName}`:storeName,[c.date]:date,[c.time]:`${time} · ${location==='paris'?'Europe/Paris':location==='dakar'?'Africa/Dakar':'Africa/Porto-Novo'}`,[c.topic]:topicLabel}} onEdit={()=>setReview(false)} note={c.appointmentNote} />;
  return <form method="post" className="consultation-form" onSubmit={next}><div className="consultation-mode-options" role="group" aria-label={c.consultation}>{(['online','boutique']as const).map(value=><button type="button" key={value} aria-pressed={mode===value} onClick={()=>setMode(value)}><Icon name={value==='online'?'phone':'store'} width={25} /><span>{c[value]}</span><small>{value==='online'?c.onlineBody:c.boutiqueBody}</small><Icon name="check" width={17} /></button>)}</div><div className="consultation-fields"><label>{c.chooseLocation} *<select aria-label={c.chooseLocation} value={location} onChange={event=>{setLocation(event.target.value as typeof location);setDate('');setTime('');}}><option value="cotonou">Cotonou</option><option value="paris">Paris</option><option value="dakar">Dakar</option></select></label><label>{c.topic} *<select aria-label={c.topic} value={topic} onChange={event=>setTopic(event.target.value)}><option value="product">{c.productAdvice}</option><option value="personalization">{c.personalizationAdvice}</option><option value="care">{c.careAdvice}</option></select></label><label>{c.date} *<input type="date" required min={range.min} max={range.max} value={date} onChange={event=>{setDate(event.target.value);setDateError(false);}} aria-invalid={dateError||undefined} /></label><label>{c.time} *<select aria-label={c.time} value={time} onChange={event=>setTime(event.target.value)} required><option value="">{c.select}</option>{['10:00','11:30','14:00','15:30','17:00'].map(value=><option key={value} value={value}>{value}</option>)}</select></label></div>{dateError && <p className="reference-form-error" role="alert">{state.locale==='fr'?'Choisissez un horaire à venir, du lundi au samedi.':'Choose a future time from Monday to Saturday.'}</p>}<p className="reference-demo-note">{c.appointmentNote}</p><button type="submit" className="reference-button">{c.continue}<Icon name="arrow-right" width={17} /></button></form>;
}

export function AppointmentsPage({ initialMode, initialLocation = 'cotonou' }: { initialMode?: 'online'|'boutique'; initialLocation?: 'cotonou'|'paris'|'dakar' } = {}) {
  const { state } = useShop(); const c = experienceCopy[state.locale];
  const [mode,setMode] = useState<'online'|'boutique'|null>(initialMode??null);
  return <main id="public-content" className="reference-service-page experience-appointments"><header className="reference-service-heading"><h1>{c.consultation}</h1><p>{c.appointmentIntro}</p></header><section className="consultation-landing"><article><div className="consultation-landing-photo"><Image src="/images/campaign/goya-signature.webp" alt={c.online} fill sizes="(min-width:700px) 50vw,100vw" /></div><h2>{c.online}</h2><p>{c.onlineBody}</p><a href="#consultation-form" className="reference-text-link" onClick={()=>setMode('online')}>{c.consultation}<Icon name="arrow-right" width={17} /></a></article><article><div className="consultation-landing-photo"><Image src="/images/img1.jpg" alt={c.boutique} fill sizes="(min-width:700px) 50vw,100vw" /></div><h2>{c.boutique}</h2><p>{c.boutiqueBody}</p><a href="#consultation-form" className="reference-text-link" onClick={()=>setMode('boutique')}>{c.consultation}<Icon name="arrow-right" width={17} /></a></article></section><section className="consultation-booking" id="consultation-form"><h2>{c.appointments}</h2><ConsultationForm key={`${mode??'boutique'}-${initialLocation}`} initialMode={mode??'boutique'} initialLocation={initialLocation} /></section></main>;
}
