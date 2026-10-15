'use client';

import { useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { useShop } from '@/context/shop-context';
import { formatDate, validEmail } from '@/lib/commerce';
import { downloadInvoice } from '@/lib/browser';
import type { TranslationKey } from '@/lib/i18n';
import { gsap, useGSAP } from '@/lib/gsap';
import { DemoNote, InlineNotice, TextField } from './controls';
import { Icon } from './icon';

export function Auth() {
  const { state, dispatch, t, money } = useShop();
  const root = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<'social' | 'email'>('social');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: TranslationKey; password?: TranslationKey }>({});

  useGSAP(() => {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) gsap.fromTo('.auth-stage', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' });
  }, { scope: root, dependencies: [tab, !!state.user], revertOnUpdate: true });

  const oauth = (provider: 'google' | 'apple') => {
    dispatch({ type: 'signIn', user: { id: `demo-${provider}`, name: 'Alex', email: `guest.${provider}@example.test`, provider } });
  };
  const submitEmail = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation: typeof errors = {};
    if (!validEmail(email)) validation.email = 'invalidEmail';
    if (password.length < 8 || password.length > 128) validation.password = 'invalidPassword';
    setErrors(validation);
    if (Object.keys(validation).length) {
      document.getElementById(validation.email ? 'auth-email' : 'auth-password')?.focus();
      return;
    }
    const normalized = email.trim().toLowerCase();
    // No credential object is persisted or sent. The password never leaves this input state.
    setPassword('');
    dispatch({ type: 'signIn', user: { id: `demo-email:${normalized}`, name: normalized.split('@')[0], email: normalized, provider: 'email' } });
  };
  const onTabKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 'social' : event.key === 'End' ? 'email' : tab === 'social' ? 'email' : 'social';
    setTab(next);
    document.getElementById(`auth-tab-${next}`)?.focus();
  };
  const user = state.user;
  const orders = state.orders.filter((order) => order.customerId === user?.id);
  const bookings = state.bookings.filter((booking) => booking.customerId === user?.id);

  return <div className="auth-root" ref={root}>
    {user ? <div className="auth-stage member-profile">
      <div className="member-medallion" aria-hidden="true">MG</div>
      <p className="member-badge"><Icon name="spark" width={14} height={14} />{t('memberBadge')}</p>
      <h2 className="modal-display-title">{t('welcome', { name: user.name })}</h2>
      <p className="modal-intro">{t('memberCaption')}</p>
      <p className="member-email">{user.email}</p><InlineNotice />
      <div className="member-history"><h3 className="eyebrow">{t('orderHistory')}</h3>
        {!orders.length ? <p className="empty-history">{t('noOrders')}</p> : <ul>{orders.map((order) => <li key={order.id}>
          <div><strong>{order.id}</strong><small>{formatDate(order.createdAt, state.locale)}</small></div>
          <span>{money(order.total, order.currency)}</span>
          <button type="button" className="icon-button" aria-label={`${t('invoice')} ${order.id}`} onClick={() => downloadInvoice(order, state.locale)}><Icon name="download" width={17} height={17} /></button>
        </li>)}</ul>}
      </div>
      {bookings.length > 0 && <div className="member-history"><h3 className="eyebrow">{t('yourAppointments')}</h3><ul>{bookings.map((booking) => <li key={booking.id}>
        <div><strong>{t(booking.service)} · {t(booking.location)}</strong><small>{formatDate(booking.date, state.locale, true)} · {booking.time}</small></div><span className="mini-badge">{t('demoLabel')}</span>
      </li>)}</ul></div>}
      <p className="fine-print">{t('sessionHistory')}</p>
      <button type="button" className="button button-outline button-full" onClick={() => dispatch({ type: 'signOut' })}>{t('logout')}<Icon name="logout" /></button>
      <DemoNote />
    </div> : <>
      <div className="auth-heading"><div className="auth-monogram" aria-hidden="true">MG</div><p className="eyebrow">{t('authEyebrow')}</p><h2 className="modal-display-title">{t('authTitle')}</h2><p className="modal-intro">{t('authIntro')}</p></div>
      <div className="auth-tabs" role="tablist" aria-label={t('account')}>
        {(['social', 'email'] as const).map((value) => <button type="button" role="tab" id={`auth-tab-${value}`} key={value} aria-controls={`auth-panel-${value}`} aria-selected={tab === value} tabIndex={tab === value ? 0 : -1} onClick={() => setTab(value)} onKeyDown={onTabKey}>{t(value === 'social' ? 'socialTab' : 'emailTab')}</button>)}
      </div>
      <div className="auth-stage" key={tab} id={`auth-panel-${tab}`} role="tabpanel" aria-labelledby={`auth-tab-${tab}`}>
        {tab === 'social' ? <div className="oauth-buttons">
          <button type="button" className="button button-outline button-full" onClick={() => oauth('google')}><span className="provider-letter" aria-hidden="true">G</span>{t('continueGoogle')}<Icon name="arrow-right" width={16} height={16} /></button>
          <button type="button" className="button button-outline button-full" onClick={() => oauth('apple')}><Icon name="phone" />{t('continueApple')}<Icon name="arrow-right" width={16} height={16} /></button>
        </div> : <form className="email-login" noValidate onSubmit={submitEmail}>
          <TextField id="auth-email" label={t('email')} type="email" name="email" autoComplete="username" maxLength={254} required value={email} error={errors.email} onChange={(event) => { setEmail(event.target.value); setErrors((current) => ({ ...current, email: undefined })); }} />
          <TextField id="auth-password" label={t('password')} type="password" name="password" autoComplete="off" minLength={8} maxLength={128} required hint={t('passwordHint')} value={password} error={errors.password} onChange={(event) => { setPassword(event.target.value); setErrors((current) => ({ ...current, password: undefined })); }} />
          <button type="submit" className="button button-gold button-full">{t('signIn')}<Icon name="arrow-right" /></button>
        </form>}
      </div>
      <DemoNote variant="authDemo" />
    </>}
  </div>;
}
