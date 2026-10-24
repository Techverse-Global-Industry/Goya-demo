'use client';

import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useShop } from '@/context/shop-context';
import { shopRequest } from '@/lib/api';
import { COUNTRIES } from '@/lib/catalog';
import { marketName, siteText } from '@/lib/international';
import type { AccountProfile, Country, SavedAddress, ShippingDetails } from '@/lib/types';
import { Icon } from './icon';

const copy = {
  en: {
    preferences: 'Personal preferences', intro: 'Keep your details and communication preferences up to date.', title: 'Title', noTitle: 'Prefer not to say', mr: 'Mr', ms: 'Ms', mx: 'Mx', phone: 'Phone number (optional)', birthDate: 'Date of birth (optional)', language: 'Preferred language', newsletter: 'News from Maison Goya', newsletterLabel: 'I would like to receive Goya news and collection updates.', newsletterNote: 'You can update this preference whenever you wish.', save: 'Save preferences', saving: 'Saving…', saved: 'Your preferences have been saved.', failed: 'Your changes could not be saved. Please try again.',
    addresses: 'Address book', addressIntro: 'Save your delivery details for your next visit.', add: 'Add an address', empty: 'No saved addresses yet.', address: 'Delivery address', default: 'Default address', edit: 'Edit', remove: 'Remove', deleteQuestion: 'Remove this address?', confirmDelete: 'Yes, remove', cancel: 'Cancel', deleting: 'Removing…', deleted: 'The address has been removed.', newAddress: 'Add a delivery address', editAddress: 'Edit your address', addressSaved: 'Your address has been saved.', label: 'Address label (optional)', name: 'Full name', email: 'Email address', company: 'Company (optional)', street: 'Street address', address2: 'Apartment, floor or building (optional)', postalCode: 'Postal code (optional)', city: 'City', country: 'Country', makeDefault: 'Use as my default address', saveAddress: 'Save address',
  },
  fr: {
    preferences: 'Mes préférences', intro: 'Mettez à jour vos informations personnelles et vos préférences de communication.', title: 'Civilité', noTitle: 'Je préfère ne pas préciser', mr: 'M.', ms: 'Mme', mx: 'Mx', phone: 'Téléphone (facultatif)', birthDate: 'Date de naissance (facultative)', language: 'Langue préférée', newsletter: 'Les nouvelles de Maison Goya', newsletterLabel: 'Je souhaite recevoir les nouvelles de Goya et les nouveautés des collections.', newsletterNote: 'Vous pouvez modifier cette préférence à tout moment.', save: 'Enregistrer mes préférences', saving: 'Enregistrement…', saved: 'Vos préférences ont été enregistrées.', failed: 'Vos modifications n’ont pas pu être enregistrées. Veuillez réessayer.',
    addresses: 'Mon carnet d’adresses', addressIntro: 'Enregistrez vos coordonnées de livraison pour votre prochaine visite.', add: 'Ajouter une adresse', empty: 'Vous n’avez pas encore d’adresse enregistrée.', address: 'Adresse de livraison', default: 'Adresse par défaut', edit: 'Modifier', remove: 'Supprimer', deleteQuestion: 'Supprimer cette adresse ?', confirmDelete: 'Oui, supprimer', cancel: 'Annuler', deleting: 'Suppression…', deleted: 'L’adresse a été supprimée.', newAddress: 'Ajouter une adresse de livraison', editAddress: 'Modifier votre adresse', addressSaved: 'Votre adresse a été enregistrée.', label: 'Nom de l’adresse (facultatif)', name: 'Nom complet', email: 'Adresse e-mail', company: 'Entreprise (facultatif)', street: 'Adresse', address2: 'Appartement, étage ou bâtiment (facultatif)', postalCode: 'Code postal (facultatif)', city: 'Ville', country: 'Pays', makeDefault: 'Utiliser comme adresse par défaut', saveAddress: 'Enregistrer l’adresse',
  },
} as const;

type ProfileFields = Pick<AccountProfile, 'phone' | 'birthDate' | 'title' | 'preferredLocale' | 'newsletter'>;
type AddressDraft = ShippingDetails & { id?: string; label: string; isDefault: boolean };

export function AccountPreferences() {
  const { state } = useShop();
  if (!state.user) return null;
  const initial: ProfileFields = {
    phone: state.profile?.phone ?? '', birthDate: state.profile?.birthDate ?? '', title: state.profile?.title ?? '',
    preferredLocale: state.profile?.preferredLocale ?? state.locale, newsletter: state.profile?.newsletter ?? false,
  };
  return <div className="account-preferences-panel"><PreferenceForm key={state.user.id} initial={initial} /><AddressBook /></div>;
}

function PreferenceForm({ initial }: { initial: ProfileFields }) {
  const { state, dispatch, refresh } = useShop();
  const c = copy[state.locale];
  const [details, setDetails] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<'saved' | 'failed' | null>(null);
  const submitting = useRef(false);
  const change = <K extends keyof ProfileFields>(field: K, value: ProfileFields[K]) => { setDetails((current) => ({ ...current, [field]: value })); setFeedback(null); };
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true; setBusy(true); setFeedback(null);
    const languageChanged = details.preferredLocale !== initial.preferredLocale;
    try {
      const { profile } = await shopRequest<{ profile: AccountProfile }>('saveProfile', { profile: details });
      setDetails({ phone: profile.phone, birthDate: profile.birthDate, title: profile.title, preferredLocale: profile.preferredLocale, newsletter: profile.newsletter });
      if (languageChanged) dispatch({ type: 'locale', locale: profile.preferredLocale });
      await refresh(true); setFeedback('saved');
    } catch { setFeedback('failed'); }
    finally { submitting.current = false; setBusy(false); }
  };
  return <section className="account-preference-card" aria-labelledby="account-preference-heading">
    <div className="account-preference-heading"><h2 id="account-preference-heading">{c.preferences}</h2><p>{c.intro}</p></div>
    <form onSubmit={save} aria-busy={busy}>
      <fieldset disabled={busy} className="account-preference-fields">
        <label className="field"><span>{c.title}</span><select value={details.title} onChange={(event) => change('title', event.target.value as AccountProfile['title'])}><option value="">{c.noTitle}</option><option value="mr">{c.mr}</option><option value="ms">{c.ms}</option><option value="mx">{c.mx}</option></select></label>
        <label className="field"><span>{c.phone}</span><input type="tel" autoComplete="tel" maxLength={40} value={details.phone} onChange={(event) => change('phone', event.target.value)} /></label>
        <label className="field"><span>{c.birthDate}</span><input type="date" autoComplete="bday" min="1900-01-01" max={new Date().toISOString().slice(0, 10)} value={details.birthDate} onChange={(event) => change('birthDate', event.target.value)} /></label>
        <label className="field"><span>{c.language}</span><select value={details.preferredLocale} onChange={(event) => change('preferredLocale', event.target.value as AccountProfile['preferredLocale'])}><option value="en">English</option><option value="fr">Français</option></select></label>
      </fieldset>
      <fieldset disabled={busy} className="account-communication-fields"><legend>{c.newsletter}</legend><label className="account-preference-checkbox"><input type="checkbox" checked={details.newsletter} onChange={(event) => change('newsletter', event.target.checked)} /><span>{c.newsletterLabel}</span></label><p>{c.newsletterNote}</p></fieldset>
      {feedback && <p className={`account-preference-feedback ${feedback === 'failed' ? 'is-error' : ''}`} role={feedback === 'failed' ? 'alert' : 'status'}>{c[feedback]}</p>}
      <button type="submit" className="button button-gold" disabled={busy}>{busy ? c.saving : c.save}<Icon name="check" width={16} /></button>
    </form>
  </section>;
}

function AddressBook() {
  const { state, refresh } = useShop();
  const c = copy[state.locale];
  const addresses = state.profile?.addresses ?? [];
  const [editor, setEditor] = useState<AddressDraft | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'addressSaved' | 'deleted' | 'failed' | null>(null);
  const addButton = useRef<HTMLButtonElement>(null);
  const removing = useRef(false);
  const openNew = () => {
    setEditor({ name: state.user?.name ?? '', email: state.user?.email ?? '', address: '', address2: '', city: '', country: state.market, phone: state.profile?.phone ?? '', postalCode: '', company: '', label: '', isDefault: addresses.length === 0 });
    setFeedback(null); setDeleting(null);
  };
  const remove = async (id: string) => {
    if (removing.current) return;
    removing.current = true; setBusy(id); setFeedback(null);
    try { await shopRequest('deleteAddress', { id }); await refresh(true); setDeleting(null); setFeedback('deleted'); addButton.current?.focus(); }
    catch { setFeedback('failed'); }
    finally { removing.current = false; setBusy(null); }
  };
  return <section className="account-preference-card account-address-book" aria-labelledby="account-address-heading">
    <div className="account-address-toolbar"><div className="account-preference-heading"><h2 id="account-address-heading">{c.addresses}</h2><p>{c.addressIntro}</p></div><button ref={addButton} type="button" className="button button-outline" onClick={openNew} disabled={!!busy}>{c.add}<Icon name="plus" width={17} /></button></div>
    {feedback && <p className={`account-preference-feedback ${feedback === 'failed' ? 'is-error' : ''}`} role={feedback === 'failed' ? 'alert' : 'status'}>{c[feedback]}</p>}
    {editor ? <AddressEditor key={editor.id ?? 'new'} initial={editor} onCancel={() => { setEditor(null); addButton.current?.focus(); }} onSaved={() => { setEditor(null); setFeedback('addressSaved'); addButton.current?.focus(); }} /> : addresses.length ? <div className="account-address-grid">{addresses.map((address) => <article className="account-saved-address" key={address.id}>
      <div className="account-saved-address-title"><h3 translate={address.label ? 'no' : undefined}>{address.label || c.address}</h3>{address.isDefault && <span>{c.default}</span>}</div>
      <address><strong>{address.name}</strong>{address.company && <span>{address.company}</span>}<span>{address.address}</span>{address.address2 && <span>{address.address2}</span>}<span>{[address.postalCode, address.city].filter(Boolean).join(' ')}</span><span>{marketName(address.country, state.language)}</span>{address.phone && <span>{address.phone}</span>}</address>
      <div className="account-address-actions"><button type="button" onClick={() => { setEditor({ ...address, label: address.label ?? '', isDefault: !!address.isDefault }); setFeedback(null); setDeleting(null); }} disabled={!!busy}>{c.edit}</button><button type="button" aria-expanded={deleting === address.id} aria-controls={`address-remove-${address.id}`} onClick={() => setDeleting(deleting === address.id ? null : address.id)} disabled={!!busy}>{c.remove}</button></div>
      {deleting === address.id && <div className="account-address-confirm" id={`address-remove-${address.id}`} role="group" aria-label={c.deleteQuestion}><p>{c.deleteQuestion}</p><button type="button" onClick={() => void remove(address.id)} disabled={!!busy}>{busy === address.id ? c.deleting : c.confirmDelete}</button><button type="button" onClick={() => setDeleting(null)} disabled={!!busy}>{c.cancel}</button></div>}
    </article>)}</div> : <div className="account-address-empty"><Icon name="pin" width={24} height={24} /><p>{c.empty}</p></div>}
  </section>;
}

function AddressEditor({ initial, onCancel, onSaved }: { initial: AddressDraft; onCancel: () => void; onSaved: () => void }) {
  const { state, refresh } = useShop();
  const c = copy[state.locale];
  const [address, setAddress] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const submitting = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, []);
  const change = <K extends keyof AddressDraft>(field: K, value: AddressDraft[K]) => { setAddress((current) => ({ ...current, [field]: value })); setFailed(false); };
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (submitting.current) return;
    submitting.current = true; setBusy(true); setFailed(false);
    try { await shopRequest<{ profile: AccountProfile; address: SavedAddress }>('saveAddress', { address }); await refresh(true); onSaved(); }
    catch { setFailed(true); }
    finally { submitting.current = false; setBusy(false); }
  };
  return <form className="account-address-editor" onSubmit={save} aria-busy={busy}>
    <h3 ref={heading} tabIndex={-1}>{initial.id ? c.editAddress : c.newAddress}</h3>
    <fieldset disabled={busy} className="account-preference-fields">
      <label className="field account-preference-wide"><span>{c.label}</span><input value={address.label} maxLength={60} onChange={(event) => change('label', event.target.value)} /></label>
      <label className="field"><span>{c.name}</span><input autoComplete="name" required minLength={2} maxLength={100} value={address.name} onChange={(event) => change('name', event.target.value)} /></label>
      <label className="field"><span>{c.email}</span><input autoComplete="email" type="email" required maxLength={254} value={address.email} onChange={(event) => change('email', event.target.value)} /></label>
      <label className="field"><span>{c.phone}</span><input autoComplete="tel" type="tel" maxLength={40} value={address.phone ?? ''} onChange={(event) => change('phone', event.target.value)} /></label>
      <label className="field"><span>{c.company}</span><input autoComplete="organization" maxLength={160} value={address.company ?? ''} onChange={(event) => change('company', event.target.value)} /></label>
      <label className="field account-preference-wide"><span>{c.street}</span><input autoComplete="address-line1" required minLength={5} maxLength={240} value={address.address} onChange={(event) => change('address', event.target.value)} /></label>
      <label className="field account-preference-wide"><span>{c.address2}</span><input autoComplete="address-line2" maxLength={240} value={address.address2 ?? ''} onChange={(event) => change('address2', event.target.value)} /></label>
      <label className="field"><span>{c.postalCode}</span><input autoComplete="postal-code" maxLength={24} value={address.postalCode ?? ''} onChange={(event) => change('postalCode', event.target.value)} /></label>
      <label className="field"><span>{c.city}</span><input autoComplete="address-level2" required minLength={2} maxLength={100} value={address.city} onChange={(event) => change('city', event.target.value)} /></label>
      <label className="field account-preference-wide"><span>{c.country}</span><select autoComplete="country" aria-label={c.country} required value={address.country === 'WW' ? '' : address.country} onChange={(event) => change('country', event.target.value as Country)}><option value="" disabled>{siteText(state.language, 'Choose your country', 'Choisissez votre pays')}</option>{COUNTRIES.map((country) => <option key={country} value={country}>{marketName(country, state.language)}</option>)}</select></label>
    </fieldset>
    <label className="account-preference-checkbox"><input type="checkbox" checked={address.isDefault} onChange={(event) => change('isDefault', event.target.checked)} disabled={busy} /><span>{c.makeDefault}</span></label>
    {failed && <p className="account-preference-feedback is-error" role="alert">{c.failed}</p>}
    <div className="account-address-editor-actions"><button type="submit" className="button button-gold" disabled={busy}>{busy ? c.saving : c.saveAddress}<Icon name="check" width={16} /></button><button type="button" className="button button-outline" disabled={busy} onClick={onCancel}>{c.cancel}</button></div>
  </form>;
}
