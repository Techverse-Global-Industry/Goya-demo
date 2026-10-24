'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { useShop } from '@/context/shop-context';
import { readConsent } from '@/lib/consent';
import { translatedCopy, siteText } from '@/lib/international';
import { serviceCopy } from '@/lib/service-copy';
import { Icon } from './icon';

export function NewsletterPopup({ close, children }: { close: () => void; children: ReactNode }) {
  const { state } = useShop();
  const c = translatedCopy(serviceCopy[state.locale], state.language);
  return <section className="newsletter-popup"><div className="newsletter-popup-image"><Image src="/images/campaign/goya-signature.webp" alt={siteText(state.language, 'A Maison Goya creation', 'Une création de la Maison Goya')} fill sizes="400px" /></div><div className="newsletter-popup-content"><button type="button" className="newsletter-popup-close" data-close-modal aria-label={siteText(state.language, 'Close', 'Fermer')} onClick={close}><Icon name="close" width={21} /></button><h2>{c.newsletterTitle}</h2><p>{c.newsletterIntro}</p>{children}</div></section>;
}

export function PromotionPrompt() {
  const { state, dispatch } = useShop();
  const pathname = usePathname();
  const shown = useRef(false);
  useEffect(() => {
    let timer: number | undefined;
    const excluded = pathname.startsWith('/admin') || pathname.startsWith('/account') || pathname.startsWith('/app') || pathname.startsWith('/my-') || pathname.startsWith('/personalization/') || pathname === '/login' || pathname === '/checkout' || pathname === '/book-an-appointment' || pathname === '/countries';
    const schedule = () => {
      window.clearTimeout(timer);
      if (excluded || state.overlay || shown.current || !readConsent()?.newsletter) return;
      try { if (sessionStorage.getItem('goya-newsletter-prompt-v1')) return; } catch { /* The ref keeps this invitation once per mounted visit. */ }
      timer = window.setTimeout(() => {
        if (!readConsent()?.newsletter || document.querySelector('dialog[open]')) return;
        shown.current = true;
        try { sessionStorage.setItem('goya-newsletter-prompt-v1', 'shown'); } catch { /* Optional storage. */ }
        dispatch({ type: 'open', overlay: { kind: 'newsletter' } });
      }, 7000);
    };
    const changed = () => schedule();
    schedule();
    window.addEventListener('goya:consent', changed);
    window.addEventListener('storage', changed);
    return () => { window.clearTimeout(timer); window.removeEventListener('goya:consent', changed); window.removeEventListener('storage', changed); };
  }, [pathname, state.overlay, dispatch]);
  return null;
}
