'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useShop } from '@/context/shop-context';
import { bookingCopy } from '@/lib/booking-copy';
import { bookingDateRange, isTimeAvailable } from '@/lib/commerce';
import { LOCATION_TIMEZONES, TIME_SLOTS } from '@/lib/catalog';
import { GOYA_STORES, saveExperience } from '@/lib/service-experiences';
import type { ServiceReceipt } from '@/lib/service-experiences';
import type { AtelierLocation } from '@/lib/types';
import { CONTACT_COUNTRIES } from '@/lib/contact-countries';
import { localizedText, marketName, languageName, SITE_LOCALES, translatedCopy } from '@/lib/international';
import { RequestError } from '@/lib/api';
import { ExperienceProgress } from './consultation';
import { Icon } from './icon';

const PersonalizationBrief = dynamic(()=>import('./personalization-experience').then(module=>module.PersonalizationBrief));
type Topic = keyof typeof bookingCopy.en.topics;

export function BookingJourney({ mode, initialLocation='cotonou', initialService }: { mode:'online'|'boutique'; initialLocation?:AtelierLocation; initialService?:string }) {
  const {state,refresh}=useShop();const router=useRouter();const c=translatedCopy(bookingCopy[state.locale],state.language);
  const [stage,setStage]=useState(mode==='online'?1:0);
  const [location,setLocation]=useState<AtelierLocation>(initialLocation);
  const [topic,setTopic]=useState<Topic|''>(initialService==='caring'?'care':initialService==='bespoke'?'bespoke':initialService==='made-to-order'?'made-to-order':initialService==='on-time'?'other':'');
  const [additional,setAdditional]=useState('');const [date,setDate]=useState('');const [time,setTime]=useState('');
  const range=bookingDateRange(location);const [month,setMonth]=useState(range.min.slice(0,7));
  const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [receipt,setReceipt]=useState<ServiceReceipt|null>(null);const [brief,setBrief]=useState(false);
  const requestKey=useRef(crypto.randomUUID());const pending=useRef(false);
  const store=GOYA_STORES.find(item=>item.id===location)!;
  const steps=mode==='online'?[c.service,c.appointment,c.contact]:[c.boutique,c.service,c.appointment,c.contact];
  const stepNumber=mode==='online'?stage:stage+1;
  const available=(day:string,slot:string)=>isTimeAvailable({date:day,time:slot,location},state.bookedSlots??[]);
  const previous=()=>{setError('');if(stage> (mode==='online'?1:0)){setStage(stage-1);return;}router.push('/book-an-appointment'+(initialService?'?service='+encodeURIComponent(initialService):''));};
  const submit=async(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault();if(pending.current||!topic)return;const fields=new FormData(event.currentTarget);
    pending.current=true;setBusy(true);setError('');
    try {
      const saved=await saveExperience({kind:'consultation',name:[fields.get('firstName'),fields.get('lastName')].join(' ').trim(),email:String(fields.get('email')??'').trim(),locale:state.locale,details:{mode,location,date,time,topic,additionalInfo:additional,title:String(fields.get('title')??''),phone:String(fields.get('phone')??''),country:String(fields.get('country')??''),language:String(fields.get('language')??state.language),requestKey:requestKey.current}},!!state.user);
      setReceipt(saved);await refresh(true);
    }catch(failure){if(failure instanceof RequestError&&failure.code==='slotTaken'){setError(c.unavailable);setStage(2);setTime('');await refresh(true);}else setError(c.failed);}
    finally{pending.current=false;setBusy(false);}
  };
  if(receipt)return <ExperienceProgress receipt={receipt}/>;
  if(brief)return <section className="exact-booking-brief"><button type="button" className="reference-text-link" onClick={()=>setBrief(false)}><Icon name="arrow-left" width={16}/>{c.briefBack}</button><PersonalizationBrief slug={initialService==='on-time'?'on-time':topic==='care'?'caring':topic==='bespoke'?'bespoke':'made-to-order'}/></section>;
  const monthStart=new Date(month+'-01T12:00:00Z');const lead=(monthStart.getUTCDay()+6)%7;const days=new Date(Date.UTC(monthStart.getUTCFullYear(),monthStart.getUTCMonth()+1,0)).getUTCDate();
  const changeMonth=(offset:number)=>{const next=new Date(Date.UTC(monthStart.getUTCFullYear(),monthStart.getUTCMonth()+offset,1,12));setMonth(next.toISOString().slice(0,7));};
  return <section className="exact-booking" data-booking-stage={stage}><div className="exact-booking-left"><div className="exact-booking-top"><button type="button" className="reference-text-link" onClick={previous}><Icon name="chevron-left" width={15}/>{c.back}</button><h1>{stepNumber}/{steps.length} {steps[stepNumber-1]}</h1></div>{error&&<p className="reference-form-error" role="alert">{error}</p>}
    {stage===0&&<div className="exact-booking-boutiques"><p>{c.selectBoutique}</p>{GOYA_STORES.map(option=><button type="button" key={option.id} aria-pressed={location===option.id} onClick={()=>{setLocation(option.id);setDate('');setTime('');setMonth(bookingDateRange(option.id).min.slice(0,7));}}><span>{localizedText(option.title,state.language)}</span><small>{option.city}, {marketName(option.country,state.language)}</small>{location===option.id&&<Icon name="check" width={18}/>}</button>)}<button type="button" className="reference-button exact-booking-continue" onClick={()=>setStage(1)}>{c.continue}</button></div>}
    {stage===1&&<form className="exact-booking-service" onSubmit={event=>{event.preventDefault();setError('');setStage(2);}}><p>{c.selectService}</p><label>{c.requested} *<select aria-label={c.requested+' *'} required value={topic} onChange={event=>setTopic(event.target.value as Topic)}><option value="" disabled>{c.select}</option>{Object.entries(c.topics).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label><label>{c.details}<textarea maxLength={255} rows={4} value={additional} onChange={event=>setAdditional(event.target.value)}/><small>{additional.length}/255</small></label>{(topic==='care'||topic==='bespoke'||topic==='made-to-order'||initialService==='on-time')&&<button type="button" className="reference-text-link exact-booking-brief-link" onClick={()=>setBrief(true)}>{c.brief}<Icon name="arrow-right" width={15}/></button>}<button type="submit" className="reference-button exact-booking-continue">{c.continue}</button></form>}
    {stage===2&&<div className="exact-booking-date">{!date?<><p>{c.selectDate}</p><div className="exact-booking-calendar"><header><button type="button" aria-label={c.previousMonth} disabled={month<=range.min.slice(0,7)} onClick={()=>changeMonth(-1)}><Icon name="chevron-left" width={20}/></button><strong>{new Intl.DateTimeFormat(state.language,{month:'long',year:'numeric',timeZone:'UTC'}).format(monthStart)}</strong><button type="button" aria-label={c.nextMonth} disabled={month>=range.max.slice(0,7)} onClick={()=>changeMonth(1)}><Icon name="chevron-right" width={20}/></button></header><div className="exact-calendar-weekdays">{Array.from({length:7},(_,index)=><span key={index}>{new Intl.DateTimeFormat(state.language,{weekday:'short',timeZone:'UTC'}).format(new Date(Date.UTC(2024,0,index+1)))}</span>)}</div><div className="exact-calendar-days">{Array.from({length:lead},(_,index)=><span key={'blank'+index}/>)}{Array.from({length:days},(_,index)=>{const day=month+'-'+String(index+1).padStart(2,'0');const sunday=new Date(day+'T12:00:00Z').getUTCDay()===0;const disabled=day<range.min||day>range.max||sunday||!TIME_SLOTS.some(slot=>available(day,slot));return <button type="button" key={day} disabled={disabled} aria-label={new Intl.DateTimeFormat(state.language,{dateStyle:'full',timeZone:'UTC'}).format(new Date(day+'T12:00:00Z'))} onClick={()=>{setDate(day);setTime('');}}>{index+1}</button>;})}</div></div></>:<><div className="exact-booking-date-selection"><strong>{new Intl.DateTimeFormat(state.language,{dateStyle:'full',timeZone:'UTC'}).format(new Date(date+'T12:00:00Z'))}</strong><button type="button" className="reference-text-link" onClick={()=>{setDate('');setTime('');}}>{c.change}</button></div><p>{c.selectTime}<small>{LOCATION_TIMEZONES[location]}</small></p><div className="exact-booking-slots">{TIME_SLOTS.map(slot=><button type="button" className="exact-booking-slot" key={slot} disabled={!available(date,slot)} aria-pressed={time===slot} onClick={()=>setTime(slot)}>{slot}</button>)}</div><button type="button" className="reference-button exact-booking-continue" disabled={!time} onClick={()=>setStage(3)}>{c.continue}</button></>}</div>}
    {stage===3&&<form className="exact-booking-contact" onSubmit={submit}><label className="exact-booking-field-full">{c.title} *<select name="title" aria-label={c.title+' *'} required defaultValue=""><option value="" disabled>{c.select}</option><option value="mr">{c.man}</option><option value="ms">{c.woman}</option><option value="mx">{c.preferNot}</option></select></label><label>{c.firstName} *<input name="firstName" autoComplete="given-name" required maxLength={49} defaultValue={state.user?.name.split(' ')[0].slice(0,49)??''}/></label><label>{c.lastName} *<input name="lastName" autoComplete="family-name" required maxLength={49} defaultValue={state.user?.name.split(' ').slice(1).join(' ').slice(0,49)??''}/></label><label>{c.email} *<input name="email" type="email" autoComplete="email" required maxLength={254} defaultValue={state.user?.email??''}/></label><label>{c.phone} *<input name="phone" type="tel" autoComplete="tel" required maxLength={40} pattern="[+()0-9 .-]*" defaultValue={state.profile?.phone??''}/></label><label>{c.country} *<select name="country" aria-label={c.country+' *'} required defaultValue={state.market==='WW'?store.country:state.market}>{CONTACT_COUNTRIES.map(country=><option key={country} value={country}>{marketName(country,state.language)}</option>)}</select></label><label>{c.language} *<select name="language" aria-label={c.language+' *'} defaultValue={state.language}>{SITE_LOCALES.map(language=><option key={language} value={language}>{languageName(language,state.language)}</option>)}</select></label><label className="exact-booking-field-full exact-booking-consent"><input type="checkbox" required/>{c.consent}</label><small className="exact-booking-field-full reference-demo-note">{c.demo}</small><button className="reference-button exact-booking-continue exact-booking-field-full" type="submit" disabled={busy}>{busy?'…':c.confirm}</button></form>}
    </div>{stage>0&&<aside className="exact-booking-recap"><div className="exact-booking-recap-photo"><Image src={mode==='online'?'/images/campaign/goya-signature.webp':store.image} alt={mode==='online'?c.phoneAppointment:localizedText(store.title,state.language)} fill sizes="(min-width:900px) 35vw,100vw"/><span>{c.summary}</span></div><div><h2>{mode==='online'?c.concierge:localizedText(store.title,state.language)}</h2><p>{mode==='online'?c.phoneAppointment:store.city}</p>{topic&&<section><h3>{c.service}</h3><p>{c.topics[topic]}</p></section>}{date&&time&&<section><h3>{c.appointment}</h3><p>{date} · {time}<br/>{LOCATION_TIMEZONES[location]}</p></section>}{additional&&<p translate="no">{additional}</p>}</div></aside>}</section>;
}
