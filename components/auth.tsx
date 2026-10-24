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
import { DemoNote, TextField } from './controls';
import { Icon } from './icon';

const copy = {
  en: {
    login: 'Login', register: 'Create an account', loginIntro: 'If you have an account, sign in with your email address.', registerIntro: 'Create your personal Goya account and discover a more personal experience.', checkoutIntro: 'Sign in to use your saved details and keep this order in your account.', adminIntro: 'Sign in to manage the Goya demonstration.', required: 'Required fields', optional: 'optional', mr: 'Mr', ms: 'Ms', mx: 'Mx', newsletter: 'Save my preference for Goya news and new collections.', newsletterDemo: 'Demonstration preference only. No marketing email is sent.', privacy: 'By creating an account, you acknowledge the demonstration privacy information.', privacyLink: 'Read the privacy information', preferenceFailed: 'Your account is ready. Your preferences could not be saved; you can update them in your account.',
  },
  fr: {
    login: 'Connexion', register: 'Créer un compte', loginIntro: 'Vous avez déjà un compte ? Connectez-vous avec votre adresse e-mail.', registerIntro: 'Créez votre compte personnel Goya pour une expérience à votre image.', checkoutIntro: 'Connectez-vous pour utiliser vos coordonnées enregistrées et retrouver cette commande dans votre compte.', adminIntro: 'Connectez-vous pour gérer la démonstration Goya.', required: 'Champs obligatoires', optional: 'facultatif', mr: 'M.', ms: 'Mme', mx: 'Mx', newsletter: 'Enregistrer ma préférence pour les nouvelles de Goya et les nouvelles collections.', newsletterDemo: 'Préférence de démonstration uniquement. Aucun e-mail commercial n’est envoyé.', privacy: 'En créant un compte, vous prenez connaissance des informations de confidentialité de la démonstration.', privacyLink: 'Consulter les informations de confidentialité', preferenceFailed: 'Votre compte est prêt. Vos préférences n’ont pas pu être enregistrées ; vous pourrez les modifier dans votre compte.',
  },
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
  const c = copy[state.locale];
  const labels = serviceCopy[state.locale];
  const id = useId();
  const submitting = useRef(false);
  const [mode, setMode] = useState<'login' | 'register'>(admin ? 'login' : initialMode);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [title, setTitle] = useState<AccountProfile['title']>('');
  const [newsletter, setNewsletter] = useState(false);
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
    submitting.current = true;
    setBusy(true);
    try {
      const { user, recoveryCode } = await shopRequest<{ user: DemoUser; recoveryCode?: string }>(mode, { name: name.trim(), email: email.trim(), password });
      if (recoveryCode) rememberRecovery(user.email, recoveryCode);
      setPassword('');
      dispatch({ type: 'signIn', user });
      if (mode === 'register') {
        try { await shopRequest('saveProfile', { profile: { title, newsletter, preferredLocale: state.locale } }); }
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

  return <div className={`reference-auth${checkout ? ' reference-auth--checkout' : ''}${admin ? ' reference-auth--admin' : ''}`}>
    {!admin && <div className="reference-auth-tabs" role="group" aria-label={t('account')}>
      {(['login', 'register'] as const).map(tab => <button key={tab} type="button" aria-pressed={mode === tab} aria-controls={`${id}-form`} disabled={busy} onClick={() => { setMode(tab); setPassword(''); setShowPassword(false); setError(''); }}>{c[tab]}</button>)}
    </div>}
    <div className="reference-auth-heading"><h2 id={`${id}-heading`}>{admin ? t('admin') : c[mode]}</h2><p>{admin ? c.adminIntro : checkout && mode === 'login' ? c.checkoutIntro : mode === 'login' ? c.loginIntro : c.registerIntro}</p><small>* {c.required}</small></div>
    <form id={`${id}-form`} method="post" className="reference-auth-form" onSubmit={submit} aria-labelledby={`${id}-heading`} aria-describedby={error ? `${id}-error` : undefined} aria-busy={busy}>
      <fieldset disabled={busy}>
        {mode === 'register' && <>
          <div className="field reference-auth-title"><label htmlFor={`${id}-title`}>{labels.title} ({c.optional})</label><select id={`${id}-title`} name="title" value={title} onChange={event => setTitle(event.target.value as AccountProfile['title'])}><option value="">{labels.preferNot}</option><option value="mr">{c.mr}</option><option value="ms">{c.ms}</option><option value="mx">{c.mx}</option></select></div>
          <div className="reference-auth-names"><TextField id={`${id}-first-name`} name="given-name" label={`${labels.firstName} *`} value={firstName} autoComplete="given-name" required maxLength={49} onChange={event => setFirstName(event.target.value)} /><TextField id={`${id}-last-name`} name="family-name" label={`${labels.lastName} *`} value={lastName} autoComplete="family-name" required maxLength={49} onChange={event => setLastName(event.target.value)} /></div>
        </>}
        <TextField id={`${id}-email`} name="email" label={`${labels.email} *`} type="email" value={email} autoComplete="username" required maxLength={254} onChange={event => setEmail(event.target.value)} data-initial-focus />
        <div className="reference-auth-password"><TextField id={`${id}-password`} name="password" label={`${t('password')} *`} type={showPassword ? 'text' : 'password'} value={password} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} minLength={8} maxLength={128} required hint={mode === 'register' ? t('passwordHint') : undefined} onChange={event => setPassword(event.target.value)} /><button type="button" aria-label={t(showPassword ? 'hidePassword' : 'showPassword')} aria-controls={`${id}-password`} aria-pressed={showPassword} onClick={() => setShowPassword(value => !value)}>{t(showPassword ? 'hidePassword' : 'showPassword')}</button></div>
        {mode === 'login' && !admin && <button className="reference-auth-forgot" type="button" onClick={() => dispatch({ type: 'open', overlay: { kind: 'recovery' } })}>{labels.recovery}</button>}
        {mode === 'register' && <div className="reference-auth-registration"><label><input type="checkbox" name="newsletter" checked={newsletter} onChange={event => setNewsletter(event.target.checked)} /><span>{c.newsletter}</span></label><small>{c.newsletterDemo}</small><p>{c.privacy} <Link href="/customer-service#privacy">{c.privacyLink}</Link></p></div>}
        {error && <p id={`${id}-error`} className="reference-auth-error" role="alert">{error}</p>}
        <button type="submit" className="reference-auth-submit" disabled={busy}>{busy ? t('signingIn') : c[mode]}<Icon name="arrow-right" width={18} /></button>
      </fieldset>
    </form>
    {preferenceWarning && <p role="status" className="reference-auth-preference-warning">{c.preferenceFailed}</p>}
    <DemoNote variant="authDemo" />
  </div>;
}
