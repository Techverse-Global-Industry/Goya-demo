'use client';

import { useId, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useShop } from '@/context/shop-context';
import { shopRequest } from '@/lib/api';
import { COUNTRIES } from '@/lib/catalog';
import { contentLocale, languageName, marketName, SITE_LOCALES, siteText } from '@/lib/international';
import type { AccountProfile as Profile, Country, DemoUser, SiteLocale } from '@/lib/types';
import { AccountSecurity } from './account-security';

const editProfile: Record<SiteLocale, string> = {
  en: 'Edit profile', fr: 'Modifier le profil', it: 'Modifica profilo', de: 'Profil bearbeiten', es: 'Editar perfil', ja: 'プロフィールを編集', ar: 'تعديل الملف الشخصي',
};

export function AccountProfile({ user }: { user: DemoUser }) {
  const { state, dispatch, refresh, t } = useShop();
  const id = useId();
  const submitting = useRef(false);
  const parts = user.name.trim().split(/\s+/);
  const [firstName, setFirstName] = useState(parts[0] ?? '');
  const [lastName, setLastName] = useState(parts.slice(1).join(' '));
  const [title, setTitle] = useState<Profile['title']>(state.profile?.title || 'mx');
  const [phone, setPhone] = useState(state.profile?.phone ?? '');
  const [year, month, day] = (state.profile?.birthDate ?? '').split('-');
  const [birthDay, setBirthDay] = useState(day ? String(Number(day)) : '');
  const [birthMonth, setBirthMonth] = useState(month ? String(Number(month)) : '');
  const [birthYear, setBirthYear] = useState(year ?? '');
  const [country, setCountry] = useState<Country | ''>(state.profile?.country ?? state.profile?.addresses.find(address => address.isDefault)?.country ?? (state.market !== 'WW' ? state.market : ''));
  const [language, setLanguage] = useState<SiteLocale>(state.profile?.preferredLanguage ?? state.language);
  const [newsletter, setNewsletter] = useState(state.profile?.newsletter ?? false);
  const [personalization, setPersonalization] = useState(state.profile?.personalization ?? false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<'saved' | 'failed' | 'date' | null>(null);
  const p = (english: string, french: string) => siteText(state.language, english, french);
  const currentYear = new Date().getFullYear();

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting.current) return;
    const birthDate = birthYear && birthMonth && birthDay ? `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}` : '';
    if (birthYear || birthMonth || birthDay) {
      const birthday = new Date(`${birthDate}T00:00:00Z`);
      if (!birthDate || !Number.isFinite(birthday.getTime()) || birthday.toISOString().slice(0, 10) !== birthDate || birthDate > new Date().toISOString().slice(0, 10)) { setFeedback('date'); return; }
    }
    submitting.current = true; setBusy(true); setFeedback(null);
    try {
      await shopRequest('saveProfile', { profile: {
        name: `${firstName.trim()} ${lastName.trim()}`.trim(), title, phone, birthDate, country,
        preferredLanguage: language, preferredLocale: contentLocale(language), newsletter, personalization,
      } });
      if (language !== state.language) dispatch({ type: 'language', language });
      await refresh(true); setFeedback('saved');
    } catch { setFeedback('failed'); }
    finally { submitting.current = false; setBusy(false); }
  };

  return <div className="reference-profile">
    <section aria-labelledby={`${id}-heading`}>
      <h2 id={`${id}-heading`}>{editProfile[state.language]}</h2>
      <form method="post" onSubmit={save} aria-busy={busy}>
        <fieldset className="reference-profile-fields" disabled={busy}>
          <label className="reference-profile-field reference-profile-title"><span>{p('Title', 'Civilité')} *</span><select name="title" autoComplete="honorific-prefix" required value={title} onChange={event => { setTitle(event.target.value as Profile['title']); setFeedback(null); }}><option value="mx">{p('Prefer not to say', 'Je préfère ne pas préciser')}</option><option value="mr">{p('Mr', 'M.')}</option><option value="ms">{p('Ms', 'Mme')}</option></select></label>
          <span className="reference-profile-spacer" aria-hidden="true" />
          <label className="reference-profile-field"><span>{p('First name', 'Prénom')} *</span><input name="given-name" autoComplete="given-name" required maxLength={49} value={firstName} onChange={event => { setFirstName(event.target.value); setFeedback(null); }} /></label>
          <label className="reference-profile-field"><span>{p('Last name', 'Nom')} *</span><input name="family-name" autoComplete="family-name" required maxLength={49} value={lastName} onChange={event => { setLastName(event.target.value); setFeedback(null); }} /></label>
          <label className="reference-profile-field reference-profile-wide"><span>{p('Email', 'E-mail')} *</span><span className="reference-profile-email"><input name="email" type="email" autoComplete="email" readOnly value={user.email} aria-describedby={`${id}-email-note`} /><svg aria-hidden="true" width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1"><circle cx="10" cy="10" r="7"/><path d="m3 17 14-14"/></svg></span><small className="sr-only" id={`${id}-email-note`}>{t('emailReadOnly')}</small></label>
          <label className="reference-profile-field"><span>{p('Mobile phone number', 'Numéro de téléphone mobile')}</span><input name="tel" type="tel" autoComplete="tel" maxLength={40} pattern="[+()0-9 .-]*" value={phone} onChange={event => { setPhone(event.target.value); setFeedback(null); }} /></label>
          <div className="reference-profile-field"><span id={`${id}-birthday`}>{p('Date of birth', 'Date de naissance')} *</span><div className="reference-profile-birthday" role="group" aria-labelledby={`${id}-birthday`}>
            <select name="birthdayDay" autoComplete="bday-day" aria-label={p('Day', 'Jour')} required value={birthDay} onChange={event => { setBirthDay(event.target.value); setFeedback(null); }}><option value="">{p('Day', 'Jour')}</option>{Array.from({ length: 31 }, (_, index) => <option value={index + 1} key={index + 1}>{index + 1}</option>)}</select>
            <select name="birthdayMonth" autoComplete="bday-month" aria-label={p('Month', 'Mois')} required value={birthMonth} onChange={event => { setBirthMonth(event.target.value); setFeedback(null); }}><option value="">{p('Month', 'Mois')}</option>{Array.from({ length: 12 }, (_, index) => <option value={index + 1} key={index + 1}>{String(index + 1).padStart(2, '0')}</option>)}</select>
            <select name="birthdayYear" autoComplete="bday-year" aria-label={p('Year', 'Année')} required value={birthYear} onChange={event => { setBirthYear(event.target.value); setFeedback(null); }}><option value="">{p('Year', 'Année')}</option>{Array.from({ length: currentYear - 1899 }, (_, index) => <option value={currentYear - index} key={currentYear - index}>{currentYear - index}</option>)}</select>
          </div></div>
          <label className="reference-profile-field"><span>{p('Country', 'Pays')} *</span><select name="country" autoComplete="country" required value={country} onChange={event => { setCountry(event.target.value as Country); setFeedback(null); }}><option value="" disabled>{p('Choose your country', 'Choisissez votre pays')}</option>{COUNTRIES.map(code => <option key={code} value={code}>{marketName(code, state.language)}</option>)}</select></label>
          <label className="reference-profile-field"><span>{p('Language', 'Langue')} *</span><select name="language" required value={language} onChange={event => { setLanguage(event.target.value as SiteLocale); setFeedback(null); }}>{SITE_LOCALES.map(code => <option key={code} value={code}>{languageName(code, state.language)}</option>)}</select></label>
        </fieldset>
        <fieldset className="reference-profile-consents" disabled={busy}>
          <label><input type="checkbox" name="newsletter" checked={newsletter} onChange={event => { setNewsletter(event.target.checked); setFeedback(null); }} /><span>{p('Save my preference for Goya news and new collections.', 'Enregistrer ma préférence pour les nouvelles de Goya et les nouvelles collections.')}</span></label>
          <label><input type="checkbox" name="personalization" checked={personalization} onChange={event => { setPersonalization(event.target.checked); setFeedback(null); }} /><span>{p('Save my preferences for a more personal Goya experience, in accordance with the demonstration privacy information.', 'Enregistrer mes préférences pour une expérience Goya plus personnelle, conformément aux informations de confidentialité de la démonstration.')}</span></label>
        </fieldset>
        {feedback && <p className={`reference-profile-feedback${feedback !== 'saved' ? ' is-error' : ''}`} role={feedback === 'saved' ? 'status' : 'alert'}>{feedback === 'saved' ? t('saved') : feedback === 'date' ? p('Please enter a complete, valid date of birth.', 'Veuillez saisir une date de naissance complète et valide.') : t('requestFailed')}</p>}
        <button type="submit" className="reference-profile-save" disabled={busy}>{busy ? t('saving') : p('Save changes', 'Enregistrer les modifications')}</button>
      </form>
    </section>
    <details className="reference-profile-security"><summary>{p('Login & security', 'Connexion et sécurité')}</summary><AccountSecurity /></details>
  </div>;
}
