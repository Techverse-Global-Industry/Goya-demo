'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useShop } from '@/context/shop-context';
import { RequestError, shopRequest } from '@/lib/api';
import { rememberRecovery, savedRecovery } from '@/lib/demo-recovery';
import type { DemoUser } from '@/lib/types';
import { Icon } from './icon';

const copy = {
  en: {
    title: 'Login & security', intro: 'Update the email address and password used to access your Maison.', emailTab: 'Email address', passwordTab: 'Password', email: 'New email address', current: 'Current password', password: 'New password', repeat: 'Confirm new password', save: 'Save changes', saving: 'Saving…', saved: 'Your login details have been updated.', incorrect: 'Your current password is incorrect.', taken: 'This email is already in use.', failed: 'We could not save your changes. Please try again.', mismatch: 'The passwords do not match.', hint: 'Use 8–128 characters and a unique password for this demo.', revoke: 'For your privacy, other signed-in sessions are closed after a change.',
    recovery: 'Forgot your password?', recoveryIntro: 'Enter the email associated with your Goya account.', resetRequest: 'Send recovery instructions', inbox: 'Your demonstration inbox', inboxText: 'A reset link is ready for the account previously verified in this browser. Open it below to choose a new password.', noInbox: 'If this account was previously verified in this browser, recovery instructions can appear here. Otherwise, sign in from your original browser or contact customer care.', demo: 'No email is sent in this demonstration. A reset link is shown here only for an account this browser has already authenticated.', open: 'Open password reset link', reset: 'Choose a new password', resetIntro: 'Your password will change for this demo account. The reset link can be used once and expires after 15 minutes.', resetAction: 'Reset password', resetting: 'Updating password…', complete: 'Your password has been updated.', completeText: 'You can now sign in with your new password. Your previous signed-in sessions have been closed.', expired: 'This reset link is invalid or has expired. Request another link from your verified browser.', back: 'Back to login', retry: 'Request another link',
  },
  fr: {
    title: 'Connexion et sécurité', intro: 'Mettez à jour l’adresse e-mail et le mot de passe de votre Maison.', emailTab: 'Adresse e-mail', passwordTab: 'Mot de passe', email: 'Nouvelle adresse e-mail', current: 'Mot de passe actuel', password: 'Nouveau mot de passe', repeat: 'Confirmer le nouveau mot de passe', save: 'Enregistrer les modifications', saving: 'Enregistrement…', saved: 'Vos identifiants ont été mis à jour.', incorrect: 'Votre mot de passe actuel est incorrect.', taken: 'Cette adresse e-mail est déjà utilisée.', failed: 'Vos modifications n’ont pas pu être enregistrées. Veuillez réessayer.', mismatch: 'Les mots de passe ne correspondent pas.', hint: 'Utilisez 8 à 128 caractères et un mot de passe unique pour cette démonstration.', revoke: 'Pour votre confidentialité, les autres sessions sont fermées après une modification.',
    recovery: 'Mot de passe oublié ?', recoveryIntro: 'Saisissez l’e-mail associé à votre compte Goya.', resetRequest: 'Envoyer les instructions', inbox: 'Votre boîte de réception de démonstration', inboxText: 'Un lien est prêt pour le compte déjà vérifié dans ce navigateur. Ouvrez-le ci-dessous pour choisir un nouveau mot de passe.', noInbox: 'Si ce compte a déjà été vérifié dans ce navigateur, les instructions peuvent apparaître ici. Sinon, connectez-vous depuis votre navigateur d’origine ou contactez le service client.', demo: 'Aucun e-mail n’est envoyé dans cette démonstration. Le lien est affiché ici uniquement pour un compte déjà authentifié dans ce navigateur.', open: 'Ouvrir le lien de réinitialisation', reset: 'Choisissez un nouveau mot de passe', resetIntro: 'Le mot de passe de ce compte de démonstration sera modifié. Le lien est à usage unique et expire après 15 minutes.', resetAction: 'Réinitialiser le mot de passe', resetting: 'Mise à jour du mot de passe…', complete: 'Votre mot de passe a été mis à jour.', completeText: 'Vous pouvez vous connecter avec votre nouveau mot de passe. Vos anciennes sessions ont été fermées.', expired: 'Ce lien est incorrect ou expiré. Demandez un nouveau lien depuis votre navigateur vérifié.', back: 'Retour à la connexion', retry: 'Demander un autre lien',
  },
} as const;

export function AccountSecurity() {
  const { state, dispatch, refresh } = useShop(); const c = copy[state.locale];
  const [mode, setMode] = useState<'email' | 'password'>('email');
  const [email, setEmail] = useState(state.user?.email ?? ''); const [current, setCurrent] = useState('');
  const [password, setPassword] = useState(''); const [repeat, setRepeat] = useState('');
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState(''); const [error, setError] = useState(false);
  if (!state.user || state.user.role === 'admin') return null;
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (busy) return;
    if (mode === 'password' && password !== repeat) { setError(true); setMessage(c.mismatch); return; }
    setBusy(true); setMessage('');
    try {
      const result = await shopRequest<{ user: DemoUser; recoveryCode: string }>('accountCredentials', { currentPassword: current, ...(mode === 'email' ? { email } : { newPassword: password }) });
      rememberRecovery(result.user.email, result.recoveryCode); dispatch({ type: 'signIn', user: result.user });
      setEmail(result.user.email); setCurrent(''); setPassword(''); setRepeat(''); await refresh(true); setError(false); setMessage(c.saved);
    } catch (failure) { setError(true); setMessage(failure instanceof RequestError && failure.code === 'emailTaken' ? c.taken : failure instanceof RequestError && failure.code === 'credentials' ? c.incorrect : c.failed); }
    finally { setBusy(false); }
  };
  return <section className="account-security"><header><h2>{c.title}</h2><p>{c.intro}</p></header><div className="security-tabs" role="group" aria-label={c.title}><button type="button" aria-pressed={mode === 'email'} onClick={() => { setMode('email'); setMessage(''); }}>{c.emailTab}</button><button type="button" aria-pressed={mode === 'password'} onClick={() => { setMode('password'); setMessage(''); }}>{c.passwordTab}</button></div><form method="post" onSubmit={submit} aria-busy={busy}><fieldset disabled={busy}>{mode === 'email' ? <label>{c.email}<input name="new-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={event => setEmail(event.target.value)} /></label> : <><label>{c.password}<input name="new-password" type="password" autoComplete="new-password" required minLength={8} maxLength={128} value={password} onChange={event => setPassword(event.target.value)} /></label><label>{c.repeat}<input name="repeat-password" type="password" autoComplete="new-password" required minLength={8} maxLength={128} value={repeat} onChange={event => setRepeat(event.target.value)} /></label><small>{c.hint}</small></>}<label>{c.current}<input name="current-password" type="password" autoComplete="current-password" required maxLength={128} value={current} onChange={event => setCurrent(event.target.value)} /></label></fieldset>{message && <p className={error ? 'after-sales-error' : 'after-sales-success'} role={error ? 'alert' : 'status'}>{message}</p>}<button type="submit" className="reference-button" disabled={busy}>{busy ? c.saving : c.save}<Icon name="arrow-right" width={16} /></button><small>{c.revoke}</small></form></section>;
}

export function DemoRecovery({ onComplete, initialToken }: { onComplete?: () => void; initialToken?: string } = {}) {
  const { state, refresh } = useShop(); const c = copy[state.locale];
  const [step, setStep] = useState<'email' | 'inbox' | 'password' | 'complete'>(initialToken ? 'password' : 'email');
  const [email, setEmail] = useState(state.user?.email ?? ''); const [token, setToken] = useState(initialToken ?? '');
  const [password, setPassword] = useState(''); const [repeat, setRepeat] = useState('');
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const request = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (busy) return; setBusy(true); setError('');
    try { const result = await shopRequest<{ ok: boolean; token?: string }>('recoveryRequest', { email, recoveryCode: savedRecovery(email) }); setToken(result.token ?? ''); setStep('inbox'); }
    catch { setError(c.failed); }
    finally { setBusy(false); }
  };
  const reset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (busy) return;
    if (password !== repeat) { setError(c.mismatch); return; }
    setBusy(true); setError('');
    try { await shopRequest('resetPassword', { token, newPassword: password }); setPassword(''); setRepeat(''); setToken(''); await refresh(true); setStep('complete'); }
    catch (failure) { setError(failure instanceof RequestError && failure.code === 'recoveryExpired' ? c.expired : c.failed); }
    finally { setBusy(false); }
  };
  return <section className="demo-recovery-flow"><h2>{step === 'email' ? c.recovery : step === 'inbox' ? c.inbox : step === 'password' ? c.reset : c.complete}</h2>{step === 'email' && <><p>{c.recoveryIntro}</p><form method="post" onSubmit={request}><label>{c.emailTab}<input name="recovery-email" type="email" required autoComplete="email" maxLength={254} value={email} onChange={event => setEmail(event.target.value)} data-initial-focus /></label><button className="reference-button" type="submit" disabled={busy}>{busy ? c.saving : c.resetRequest}<Icon name="arrow-right" width={16} /></button></form></>}{step === 'inbox' && <div className="demo-recovery-inbox"><Icon name="mail" width={30} /><p>{token ? c.inboxText : c.noInbox}</p>{token ? <button type="button" className="reference-button" onClick={() => setStep('password')}>{c.open}<Icon name="arrow-right" width={16} /></button> : <Link href="/customer-service" className="reference-text-link" onClick={onComplete}>{state.locale === 'fr' ? 'Contacter le service client' : 'Contact customer care'}<Icon name="arrow-right" width={16} /></Link>}<button type="button" className="reference-text-link" onClick={() => setStep('email')}>{c.retry}</button></div>}{step === 'password' && <><p>{c.resetIntro}</p><form method="post" onSubmit={reset}><label>{c.password}<input name="reset-password" type="password" required autoComplete="new-password" minLength={8} maxLength={128} value={password} onChange={event => setPassword(event.target.value)} /></label><label>{c.repeat}<input name="reset-confirm" type="password" required autoComplete="new-password" minLength={8} maxLength={128} value={repeat} onChange={event => setRepeat(event.target.value)} /></label><button className="reference-button" type="submit" disabled={busy}>{busy ? c.resetting : c.resetAction}<Icon name="arrow-right" width={16} /></button></form></>}{step === 'complete' && <p className="after-sales-success" role="status"><Icon name="check" width={18} />{c.completeText}</p>}{error && <p className="after-sales-error" role="alert">{error}</p>}<small className="after-sales-demo">{c.demo}</small><Link href="/login" className="reference-text-link" onClick={onComplete}>{c.back}<Icon name="arrow-right" width={16} /></Link></section>;
}
