'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useShop } from '@/context/shop-context';
import { storefrontCopy } from '@/lib/storefront';
import { readConsent, saveConsent } from '@/lib/consent';
import type { ConsentChoices } from '@/lib/consent';

export function PrivacyChoices() {
  const { state } = useShop();
  const copy = storefrontCopy[state.locale];
  const dialog = useRef<HTMLDialogElement>(null);
  const [visible, setVisible] = useState(false);
  const [details, setDetails] = useState(false);
  const [choices, setChoices] = useState<ConsentChoices>({ experience: false, newsletter: false });
  const fr = state.locale === 'fr';
  useEffect(() => {
    const timer = window.setTimeout(() => { if (!readConsent()) setVisible(true); }, 1500);
    const reopen = () => { setChoices(readConsent() ?? { experience: false, newsletter: false }); setDetails(true); setVisible(true); };
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
  const save = (value: ConsentChoices) => {
    saveConsent(value); setChoices(value);
    setVisible(false); setDetails(false);
  };
  return <dialog className="reference-privacy" ref={dialog} aria-labelledby="privacy-title" onCancel={event => { event.preventDefault(); save({ experience: false, newsletter: false }); }}>
    <button className="reference-privacy-skip" type="button" onClick={() => save({ experience: false, newsletter: false })}>{copy.essential}</button>
    <h2 id="privacy-title">{copy.cookieTitle}</h2><p>{fr ? 'Nous utilisons les fonctions essentielles pour votre connexion, votre panier et vos préférences de langue. Choisissez aussi si Goya peut mémoriser vos recherches récentes et vous proposer une invitation à sa newsletter sur cet appareil.' : 'We use essential features for sign-in, your bag and language preferences. You can also choose whether Goya remembers recent searches and shows a newsletter invitation on this device.'}</p>
    {details && <div className="reference-privacy-details"><div className="reference-consent-essential"><strong>{fr ? 'Fonctions essentielles' : 'Essential features'}</strong><span>{fr ? 'Toujours actives' : 'Always active'}</span><p>{fr ? 'Connexion, accès aux commandes, panier et préférences demandées. Aucun suivi publicitaire ni outil d’analyse n’est activé.' : 'Sign-in, access to orders, your bag and the preferences you request. No advertising tracking or analytics service is enabled.'}</p></div><label className="reference-consent-option"><span><strong>{fr ? 'Confort de navigation' : 'Browsing experience'}</strong><small>{fr ? 'Conserver vos recherches récentes sur cet appareil. Désactiver cette option efface cet historique.' : 'Save recent searches on this device. Turning this off clears that history.'}</small></span><input type="checkbox" checked={choices.experience} onChange={event => setChoices(current => ({ ...current, experience: event.target.checked }))} /></label><label className="reference-consent-option"><span><strong>{fr ? 'Invitation à la newsletter' : 'Newsletter invitation'}</strong><small>{fr ? 'Afficher une invitation discrète une fois par visite. Cette option ne vous inscrit pas et n’envoie aucun e-mail.' : 'Show a discreet invitation once per visit. This does not subscribe you or send an email.'}</small></span><input type="checkbox" checked={choices.newsletter} onChange={event => setChoices(current => ({ ...current, newsletter: event.target.checked }))} /></label><Link href="/legal/cookies" className="reference-consent-policy" onClick={() => setVisible(false)}>{fr ? 'Lire les informations sur les cookies' : 'Read our cookie information'}</Link></div>}
    <div className="reference-privacy-buttons"><button type="button" onClick={() => details ? save(choices) : setDetails(true)}>{details ? fr ? 'Enregistrer mes choix' : 'Save my choices' : copy.choose}</button><button type="button" onClick={() => save({ experience: true, newsletter: true })}>{copy.accept}</button></div>
  </dialog>;
}
