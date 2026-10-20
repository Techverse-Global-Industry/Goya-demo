'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useShop } from '@/context/shop-context';
import { validEmail } from '@/lib/commerce';
import { RequestError, shopRequest } from '@/lib/api';
import type { DemoUser } from '@/lib/types';
import { DemoNote, TextField } from './controls';
import { Icon } from './icon';

export function Auth({ checkout = false, destination = '/app', admin = false, initialMode = 'login' }: { checkout?: boolean; destination?: string; admin?: boolean; initialMode?: 'login' | 'register' }) {
  const router = useRouter();
  const { state, dispatch, t, refresh } = useShop();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    setError('');
    if (!validEmail(email)) { setError(t('invalidEmail')); return; }
    if (password.length < 8 || password.length > 128) { setError(t('invalidPassword')); return; }
    if (mode === 'register' && name.trim().length < 2) { setError(t('invalidName')); return; }
    setBusy(true);
    try {
      const { user } = await shopRequest<{ user: DemoUser }>(mode, { name, email, password });
      setPassword('');
      dispatch({ type: 'signIn', user });
      await refresh(true);
      if (!admin) router.replace(user.role === 'admin' ? '/admin' : destination);
    } catch (error) {
      const code = error instanceof RequestError ? error.code : '';
      setError(t(code === 'credentials' ? 'credentials' : code === 'emailTaken' ? 'emailTaken' : code === 'rateLimit' ? 'rateLimit' : 'requestFailed'));
    } finally { setBusy(false); }
  };
  return <div className="auth-root">
    <div className="auth-heading"><div className="auth-monogram" aria-hidden="true">MG</div><p className="eyebrow">{t('authEyebrow')}</p><h2 className="modal-display-title">{admin ? t('admin') : t(checkout ? 'checkoutSignIn' : mode === 'register' ? 'register' : 'authTitle')}</h2><p className="modal-intro">{admin ? (state.locale === 'fr' ? 'Connectez-vous pour g?rer votre Maison.' : 'Sign in to manage your Maison.') : t(checkout ? 'checkoutSignInText' : 'registerIntro')}</p></div>
    {!admin && <div className="auth-tabs" role="group" aria-label={t('account')}>{(['login', 'register'] as const).map((tab) => <button key={tab} type="button" aria-pressed={mode === tab} className={mode === tab ? 'is-selected' : ''} disabled={busy} onClick={() => { setMode(tab); setError(''); }}>{t(tab)}</button>)}</div>}
    <form className="email-login" onSubmit={submit}>
      {mode === 'register' && <TextField id="auth-name" label={t('name')} value={name} autoComplete="name" required maxLength={100} onChange={(event) => setName(event.target.value)} />}
      <TextField id="auth-email" label={t('email')} type="email" value={email} autoComplete="username" required maxLength={254} onChange={(event) => setEmail(event.target.value)} data-initial-focus />
      <div className="password-control"><TextField id="auth-password" label={t('password')} type={showPassword ? 'text' : 'password'} value={password} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} minLength={8} maxLength={128} required hint={t('passwordHint')} onChange={(event) => setPassword(event.target.value)} /><button className="password-toggle" type="button" aria-label={t(showPassword ? 'hidePassword' : 'showPassword')} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>{t(showPassword ? 'hidePassword' : 'showPassword')}</button></div>
      {error && <p className="field-error" role="alert">{error}</p>}
      <button type="submit" className="button button-gold button-full" disabled={busy}>{t(busy ? 'signingIn' : mode)}<Icon name="arrow-right" /></button>
    </form><DemoNote variant="authDemo" />
  </div>;
}
