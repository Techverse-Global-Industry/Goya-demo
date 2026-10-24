'use client';

import { useRef } from 'react';
import type { InputHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react';
import { useShop } from '@/context/shop-context';
import { CURRENCIES } from '@/lib/commerce';
import { LANGUAGE_NAMES, SITE_LOCALES, translatedCopy } from '@/lib/international';
import { internationalCopy } from '@/lib/international-copy';
import type { Currency } from '@/lib/types';
import type { TranslationKey } from '@/lib/i18n';
import { gsap, useGSAP } from '@/lib/gsap';
import { Icon } from './icon';

export function LanguageSwitch({ compact = false }: { compact?: boolean }) {
  const { state, dispatch } = useShop();
  const c = translatedCopy(internationalCopy[state.locale], state.language);
  return <div role="group" aria-label={c.chooseLanguage} className={`language-switch ${compact ? 'is-compact' : ''}`}><button type="button" aria-label={`${c.chooseLanguage}: ${LANGUAGE_NAMES[state.language]}`} onClick={() => dispatch({ type: 'open', overlay: { kind: 'language' } })}><span lang={state.language} translate="no">{LANGUAGE_NAMES[state.language]}</span><Icon name="chevron-right" width={15} /></button></div>;
}

export function LanguageOptions({ onComplete }: { onComplete?: () => void } = {}) {
  const { state, dispatch } = useShop();
  const c = translatedCopy(internationalCopy[state.locale], state.language);
  return <nav className="exact-language-options" aria-label={c.chooseLanguage}>{SITE_LOCALES.map(language => <button key={language} type="button" lang={language} translate="no" aria-current={state.language === language ? 'true' : undefined} onClick={() => { dispatch({ type: 'language', language }); if (onComplete) onComplete(); else dispatch({ type: 'close' }); }}>{LANGUAGE_NAMES[language]}</button>)}</nav>;
}

export function CurrencySelect() {
  const { state, dispatch, t } = useShop();
  return <label className="currency-select">
    <span className="sr-only">{t('currency')}</span>
    <select aria-label={t('currency')} value={state.currency} onChange={(event) => dispatch({ type: 'currency', currency: event.target.value as Currency })}>
      {CURRENCIES.map((currency) => <option key={currency} value={currency}>{currency}</option>)}
    </select>
    <Icon name="chevron" width={13} height={13} />
  </label>;
}

type FieldBase = { label: string; error?: TranslationKey; hint?: string; id: string };
export function TextField({ label, error, hint, id, ...props }: FieldBase & InputHTMLAttributes<HTMLInputElement>) {
  const { t } = useShop();
  const describedBy = [hint ? `${id}-hint` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined;
  return <div className={`field ${error ? 'field--error' : ''}`}>
    <label htmlFor={id}>{label}</label>
    <input id={id} aria-invalid={!!error} aria-describedby={describedBy} {...props} />
    {hint && <small id={`${id}-hint`} className="field-hint">{hint}</small>}
    {error && <small id={`${id}-error`} className="field-error">{t(error)}</small>}
  </div>;
}

export function SelectField({ label, error, hint, id, children, ...props }: FieldBase & SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  const { t } = useShop();
  const describedBy = [hint ? `${id}-hint` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined;
  return <div className={`field ${error ? 'field--error' : ''}`}>
    <label htmlFor={id}>{label}</label>
    <select id={id} aria-invalid={!!error} aria-describedby={describedBy} {...props}>{children}</select>
    {hint && <small id={`${id}-hint`} className="field-hint">{hint}</small>}
    {error && <small id={`${id}-error`} className="field-error">{t(error)}</small>}
  </div>;
}

export function DemoNote({ variant = 'demoNotice' }: { variant?: TranslationKey }) {
  const { t } = useShop();
  return <p className="demo-note"><Icon name="shield" width={16} height={16} /><span>{t(variant)}</span></p>;
}

export function InlineNotice() {
  const { state, t } = useShop();
  return state.notice ? <p className="inline-notice" role="status"><Icon name="check" width={16} height={16} />{t(state.notice.key)}</p> : null;
}

export function Toast() {
  const { state, dispatch, t } = useShop();
  const root = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (!root.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.fromTo(root.current, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: 'power2.out' });
  }, { scope: root, dependencies: [state.notice?.id, state.overlay?.kind], revertOnUpdate: true });
  if (!state.notice || state.overlay) return null;
  return <div className="toast" ref={root} role="status">
    <Icon name="check" /><p>{t(state.notice.key)}</p>
    <button type="button" className="icon-button" aria-label={t('close')} onClick={() => dispatch({ type: 'dismissNotice' })}><Icon name="close" /></button>
  </div>;
}
