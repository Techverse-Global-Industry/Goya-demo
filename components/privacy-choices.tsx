'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useShop } from '@/context/shop-context';
import { readConsent, saveConsent } from '@/lib/consent';
import type { ConsentChoices } from '@/lib/consent';
import { translatedCopy } from '@/lib/international';
import { privacyCopy } from '@/lib/privacy-copy';
import { GoyaWordmark } from './goya-wordmark';
import { Icon } from './icon';

type Category = 'privacy' | 'necessary' | 'performance' | 'functional' | 'targeting';
const categories: Category[] = ['privacy', 'necessary', 'performance', 'functional', 'targeting'];

export function PrivacyChoices() {
  const { state } = useShop();
  const c = translatedCopy(privacyCopy[state.locale], state.language);
  const dialog = useRef<HTMLDialogElement>(null);
  const [visible, setVisible] = useState(false);
  const [details, setDetails] = useState(false);
  const [category, setCategory] = useState<Category>('privacy');
  const [choices, setChoices] = useState<ConsentChoices>({ experience: false, newsletter: false });
  useEffect(() => {
    const timer = window.setTimeout(() => { if (!readConsent()) setVisible(true); }, 1500);
    const reopen = () => { setChoices(readConsent() ?? { experience: false, newsletter: false }); setCategory('privacy'); setDetails(true); setVisible(true); };
    window.addEventListener('goya:privacy', reopen);
    return () => { window.clearTimeout(timer); window.removeEventListener('goya:privacy', reopen); };
  }, []);
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (visible && !state.overlay) { if (!element.open) element.showModal(); }
    else if (element.open) element.close();
    return () => { if (element.open) element.close(); };
  }, [visible, state.overlay]);
  useEffect(() => {
    if (details && visible) dialog.current?.querySelector<HTMLButtonElement>('.exact-cookie-close')?.focus({ preventScroll: true });
  }, [details, visible]);
  const save = (value: ConsentChoices) => { saveConsent(value); setChoices(value); setVisible(false); setDetails(false); };
  const closePreferences = () => { if (readConsent()) setVisible(false); setDetails(false); };
  const content = (value: Category) => <>
    <h3>{c[value]}</h3>
    {value === 'privacy' ? <>
      <p>{c.introduction}</p><Link href="/legal/cookies" onClick={() => setVisible(false)}>{c.policy}</Link>
    </> : <>
      <p>{c[value === 'necessary' ? 'necessaryBody' : value === 'performance' ? 'performanceBody' : value === 'functional' ? 'functionalBody' : 'targetingBody']}</p>
      <label className="exact-cookie-toggle"><span>{value === 'necessary' ? c.active : value === 'performance' ? c.unavailable : c[value]}</span><input type="checkbox" disabled={value === 'necessary' || value === 'performance'} checked={value === 'necessary' || (value === 'functional' ? choices.experience : value === 'targeting' ? choices.newsletter : false)} onChange={event => setChoices(current => ({ ...current, [value === 'functional' ? 'experience' : 'newsletter']: event.target.checked }))} /></label>
    </>}
  </>;
  return <dialog className={`reference-privacy exact-cookie-dialog ${details ? 'is-preferences' : ''}`} ref={dialog} aria-labelledby="privacy-title" onCancel={event => { event.preventDefault(); if (details) closePreferences(); else save({ experience: false, newsletter: false }); }}>
    {details ? <><header className="exact-cookie-header"><GoyaWordmark /><h2 id="privacy-title">{c.title}</h2><button type="button" className="exact-cookie-close" aria-label={c.close} onClick={closePreferences}><Icon name="close" width={20} /></button></header><div className="exact-cookie-body"><nav className="exact-cookie-tabs" aria-label={c.title}>{categories.map(value => <button type="button" key={value} aria-pressed={category === value} onClick={() => setCategory(value)}>{c[value]}</button>)}</nav><section className="exact-cookie-panel">{content(category)}</section><div className="exact-cookie-mobile">{categories.map(value => <article key={value}><button type="button" aria-expanded={category === value} onClick={() => setCategory(value)}>{c[value]}</button>{category === value && <section>{content(value)}</section>}</article>)}</div></div><footer className="exact-cookie-actions"><button type="button" onClick={() => save(choices)}>{c.save}</button><button type="button" onClick={() => save({ experience: false, newsletter: false })}>{c.reject}</button><button type="button" onClick={() => save({ experience: true, newsletter: true })}>{c.allow}</button></footer></> : <><button className="reference-privacy-skip" type="button" onClick={() => save({ experience: false, newsletter: false })}>{c.continue}</button><h2 className="sr-only" id="privacy-title">{c.title}</h2><p>{c.banner} <Link className="exact-cookie-policy" href="/legal/cookies" onClick={() => setVisible(false)}>{c.policy}</Link></p><div className="reference-privacy-buttons"><button type="button" onClick={() => setDetails(true)}>{c.choose}</button><button type="button" onClick={() => save({ experience: true, newsletter: true })}>{c.accept}</button></div></>}
  </dialog>;
}
