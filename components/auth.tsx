'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { rememberRecovery } from '@/lib/demo-recovery';
import { useId, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useShop } from '@/context/shop-context';
import { validEmail } from '@/lib/commerce';
import { RequestError, shopRequest } from '@/lib/api';
import { serviceCopy } from '@/lib/service-copy';
import type { AccountProfile, DemoUser } from '@/lib/types';
import { translatedCopy } from '@/lib/international';
import { DemoNote, TextField } from './controls';
import { Icon } from './icon';

const copy = {
  en: {
    login: 'Login', loginTitle: 'Login to your account', register: 'Create an account', loginIntro: 'If you have an account, sign in with your email address.', registerIntro: 'Create your personal Goya account and discover a more personal experience.', checkoutIntro: 'Sign in to use your saved details and keep this order in your account.', adminIntro: 'Sign in to manage the Goya demonstration.', required: 'Required fields', optional: 'optional', mr: 'Mr', ms: 'Ms', mx: 'Mx', newsletter: 'Save my preference for Goya news and new collections.', newsletterDemo: 'Demonstration preference only. No marketing email is sent.', privacy: 'By creating an account, you acknowledge the demonstration privacy information.', privacyLink: 'Read the privacy information', preferenceFailed: 'Your account is ready. Your preferences could not be saved; you can update them in your account.',
  },
  fr: {
    login: 'Connexion', loginTitle: 'Connectez-vous à votre compte', register: 'Créer un compte', loginIntro: 'Vous avez déjà un compte ? Connectez-vous avec votre adresse e-mail.', registerIntro: 'Créez votre compte personnel Goya pour une expérience à votre image.', checkoutIntro: 'Connectez-vous pour utiliser vos coordonnées enregistrées et retrouver cette commande dans votre compte.', adminIntro: 'Connectez-vous pour gérer la démonstration Goya.', required: 'Champs obligatoires', optional: 'facultatif', mr: 'M.', ms: 'Mme', mx: 'Mx', newsletter: 'Enregistrer ma préférence pour les nouvelles de Goya et les nouvelles collections.', newsletterDemo: 'Préférence de démonstration uniquement. Aucun e-mail commercial n’est envoyé.', privacy: 'En créant un compte, vous prenez connaissance des informations de confidentialité de la démonstration.', privacyLink: 'Consulter les informations de confidentialité', preferenceFailed: 'Votre compte est prêt. Vos préférences n’ont pas pu être enregistrées ; vous pourrez les modifier dans votre compte.',
  },
} as const;

const registrationCopy = {
  en: { phone: 'Mobile phone number', birthDate: 'Date of birth', month: 'Month', day: 'Day', year: 'Year', invalidBirthDate: 'Please enter a complete, valid date of birth.', personalization: 'Save my preferences for a more personal Goya experience, in accordance with the demonstration privacy information.' },
  fr: { phone: 'Numéro de téléphone mobile', birthDate: 'Date de naissance', month: 'Mois', day: 'Jour', year: 'Année', invalidBirthDate: 'Veuillez saisir une date de naissance complète et valide.', personalization: 'Enregistrer mes préférences pour une expérience Goya plus personnelle, conformément aux informations de confidentialité de la démonstration.' },
} as const;

type AuthProps = {
  checkout?: boolean;
  destination?: string;
  admin?: boolean;
  initialMode?: 'login' | 'register';
  onSuccess?: () => void;
};

export function Auth({ checkout = false, destination = '/app', admin = false, initialMode = 'login', onSuccess }: AuthProps) {
  const router = useRouter();
  const { state, dispatch, t, refresh } = useShop();
  const c = translatedCopy(copy[state.locale], state.language);
  const labels = translatedCopy(serviceCopy[state.locale], state.language);
  const profileLabels = translatedCopy(registrationCopy[state.locale],state.language);
  const id = useId();
  const submitting = useRef(false);
  const [mode, setMode] = useState<'login' | 'register'>(admin ? 'login' : initialMode);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [title, setTitle] = useState<AccountProfile['title']>('');
  const [newsletter, setNewsletter] = useState(false);
  const [personalization,setPersonalization] = useState(false);
  const [phone,setPhone] = useState('');
  const [birthMonth,setBirthMonth] = useState('');
  const [birthDay,setBirthDay] = useState('');
  const [birthYear,setBirthYear] = useState('');
  const currentYear = new Date().getFullYear();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [preferenceWarning, setPreferenceWarning] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting.current) return;
    setError('');
    const name = `${firstName.trim()} ${lastName.trim()}`;
    if (!validEmail(email)) { setError(t('invalidEmail')); return; }
    if (password.length < 8 || password.length > 128) { setError(t('invalidPassword')); return; }
    if (mode === 'register' && (!firstName.trim() || !lastName.trim() || name.length > 100)) { setError(t('invalidName')); return; }
    const birthDate = birthYear && birthMonth && birthDay ? [birthYear,birthMonth.padStart(2,'0'),birthDay.padStart(2,'0')].join('-') : '';
    if(mode==='register' && (birthYear || birthMonth || birthDay)) {
      const birthday = new Date(birthDate+'T00:00:00Z');
      if(!birthDate || !Number.isFinite(birthday.getTime()) || birthday.toISOString().slice(0,10)!==birthDate || birthDate>new Date().toISOString().slice(0,10)) { setError(profileLabels.invalidBirthDate); return; }
    }
    submitting.current = true;
    setBusy(true);
    try {
      const { user, recoveryCode } = await shopRequest<{ user: DemoUser; recoveryCode?: string }>(mode, { name: name.trim(), email: email.trim(), password });
      if (recoveryCode) rememberRecovery(user.email, recoveryCode);
      setPassword('');
      dispatch({ type: 'signIn', user });
      if (mode === 'register') {
        try { await shopRequest('saveProfile', { profile: { title, newsletter, personalization, phone, birthDate, preferredLocale: state.locale } }); }
        catch { setPreferenceWarning(true); }
      }
      await refresh(true);
      if (onSuccess) onSuccess();
      else if (!admin) router.replace(user.role === 'admin' ? '/admin' : destination);
    } catch (failure) {
      const code = failure instanceof RequestError ? failure.code : '';
      setError(t(code === 'credentials' ? 'credentials' : code === 'emailTaken' ? 'emailTaken' : code === 'rateLimit' ? 'rateLimit' : 'requestFailed'));
    } finally { submitting.current = false; setBusy(false); }
  };

  return <div className={`reference-auth${mode === 'register' ? ' reference-auth--register' : ''}${checkout ? ' reference-auth--checkout' : ''}${admin ? ' reference-auth--admin' : ''}`}>
    <div className="reference-auth-heading"><h2 id={`${id}-heading`}>{admin ? t('admin') : mode === 'login' ? c.loginTitle : c.register}</h2>{(admin || checkout) && <p>{admin ? c.adminIntro : c.checkoutIntro}</p>}{mode === 'register' && <small>* {c.required}</small>}</div>
    <form id={`${id}-form`} method="post" className="reference-auth-form" onSubmit={submit} aria-labelledby={`${id}-heading`} aria-describedby={error ? `${id}-error` : undefined} aria-busy={busy}>
      <fieldset disabled={busy}>
        <div className="reference-auth-credentials">
        <TextField id={`${id}-email`} name="email" label={`${labels.email} *`} type="email" placeholder={labels.email} value={email} autoComplete="username" required maxLength={254} onChange={event => setEmail(event.target.value)} data-initial-focus />
        <div className="reference-auth-password"><TextField id={`${id}-password`} name="password" label={`${t('password')} *`} type={showPassword ? 'text' : 'password'} placeholder={t('password')} value={password} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} minLength={8} maxLength={128} required hint={mode === 'register' ? t('passwordHint') : undefined} onChange={event => setPassword(event.target.value)} /><button type="button" aria-label={t(showPassword ? 'hidePassword' : 'showPassword')} aria-controls={`${id}-password`} aria-pressed={showPassword} onClick={() => setShowPassword(value => !value)}><Icon name={showPassword ? 'eye-off' : 'eye'} width={20} height={20} /></button></div>
        </div>
        {mode === 'register' && <>
          <div className="field reference-auth-title"><label htmlFor={id+'-title'}>{labels.title} *</label><select id={id+'-title'} name="title" required value={title} onChange={event=>setTitle(event.target.value as AccountProfile['title'])}><option value="" disabled>{labels.select}</option><option value="mr">{c.mr}</option><option value="ms">{c.ms}</option><option value="mx">{labels.preferNot}</option></select></div>
          <div className="reference-auth-names"><TextField id={id+'-first-name'} name="given-name" label={labels.firstName+' *'} placeholder={labels.firstName} value={firstName} autoComplete="given-name" required maxLength={49} onChange={event=>setFirstName(event.target.value)} /><TextField id={id+'-last-name'} name="family-name" label={labels.lastName+' *'} placeholder={labels.lastName} value={lastName} autoComplete="family-name" required maxLength={49} onChange={event=>setLastName(event.target.value)} /></div>
          <div className="reference-auth-details"><TextField id={id+'-phone'} name="tel" label={profileLabels.phone} placeholder={profileLabels.phone} type="tel" autoComplete="tel" maxLength={40} pattern="[+()0-9 .-]*" value={phone} onChange={event=>setPhone(event.target.value)} /><div className="reference-auth-birthday"><span>{profileLabels.birthDate}</span><div><select name="birthdayDay" aria-label={profileLabels.day} value={birthDay} onChange={event=>setBirthDay(event.target.value)}><option value="">dd</option>{Array.from({length:31},(_,index)=><option key={index+1} value={index+1}>{index+1}</option>)}</select><select name="birthdayMonth" aria-label={profileLabels.month} value={birthMonth} onChange={event=>setBirthMonth(event.target.value)}><option value="">mm</option>{Array.from({length:12},(_,index)=><option key={index+1} value={index+1}>{String(index+1).padStart(2,'0')}</option>)}</select><select name="birthdayYear" aria-label={profileLabels.year} value={birthYear} onChange={event=>setBirthYear(event.target.value)}><option value="">yyyy</option>{Array.from({length:currentYear-1899},(_,index)=><option key={currentYear-index} value={currentYear-index}>{currentYear-index}</option>)}</select></div></div></div>
        </>}
        {mode === 'login' && !admin && <button className="reference-auth-forgot" type="button" onClick={() => dispatch({ type: 'open', overlay: { kind: 'recovery' } })}>{labels.recovery}</button>}
        {mode === 'register' && <div className="reference-auth-registration"><label><input type="checkbox" name="newsletter" checked={newsletter} onChange={event => setNewsletter(event.target.checked)} /><span>{c.newsletter}</span></label><label><input type="checkbox" name="personalization" checked={personalization} onChange={event=>setPersonalization(event.target.checked)} /><span>{profileLabels.personalization}</span></label><small>{c.newsletterDemo}</small><p>{c.privacy} <Link href="/customer-service#privacy">{c.privacyLink}</Link></p></div>}
        {error && <p id={`${id}-error`} className="reference-auth-error" role="alert">{error}</p>}
        <button type="submit" className="reference-auth-submit" disabled={busy}>{busy ? t('signingIn') : c[mode]}<Icon name="arrow-right" width={18} /></button>
      </fieldset>
    </form>
    {!admin && <div className="reference-auth-tabs reference-auth-actions" role="group" aria-label={t('account')}><button type="button" aria-controls={`${id}-form`} disabled={busy} onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setPassword(''); setShowPassword(false); setError(''); }}>{mode === 'login' ? c.register : c.login}</button></div>}
    {preferenceWarning && <p role="status" className="reference-auth-preference-warning">{c.preferenceFailed}</p>}
    <DemoNote variant="authDemo" />
  </div>;
}
