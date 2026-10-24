'use client';

import { useEffect, useRef, useState } from 'react';
import { useShop } from '@/context/shop-context';
import { storefrontCopy } from '@/lib/storefront';

const KEY = 'goya-privacy-v1';
export function PrivacyChoices() {
  const { state } = useShop();
  const copy = storefrontCopy[state.locale];
  const dialog = useRef<HTMLDialogElement>(null);
  const [visible, setVisible] = useState(false);
  const [details, setDetails] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => { try { if (!localStorage.getItem(KEY)) setVisible(true); } catch { /* storage is optional */ } }, 1500);
    const reopen = () => setVisible(true);
    window.addEventListener('goya:privacy', reopen);
    return () => { window.clearTimeout(timer); window.removeEventListener('goya:privacy', reopen); };
  }, []);
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (visible && !state.overlay) element.showModal(); else element.close();
    return () => element.close();
  }, [visible, state.overlay]);
  const save = (choice: string) => {
    try { localStorage.setItem(KEY, choice); } catch { /* this choice lasts for this visit */ }
    setVisible(false); setDetails(false);
  };
  return <dialog className="reference-privacy" ref={dialog} aria-labelledby="privacy-title" onCancel={event => { event.preventDefault(); save('essential'); }}>
    <button className="reference-privacy-skip" type="button" onClick={() => save('essential')}>{copy.essential}</button>
    <h2 id="privacy-title">{copy.cookieTitle}</h2><p>{copy.cookieBody}</p>
    {details && <div className="reference-privacy-details"><strong>{state.locale === 'fr' ? 'Cookies essentiels : toujours actifs' : 'Essential cookies: always active'}</strong><p>{state.locale === 'fr' ? 'Ils permettent la connexion et le suivi de votre commande. Le panier, la langue et les favoris sont conservés sur votre appareil. Aucun cookie de publicité ou de mesure d’audience n’est utilisé.' : 'These support sign-in and access to your order. Your bag, language and favourites are saved on your device. No advertising or analytics cookies are used.'}</p></div>}
    <div className="reference-privacy-buttons"><button type="button" onClick={() => details ? save('essential') : setDetails(true)}>{details ? state.locale === 'fr' ? 'Enregistrer mes choix' : 'Save my choices' : copy.choose}</button><button type="button" onClick={() => save('accepted')}>{copy.accept}</button></div>
  </dialog>;
}
